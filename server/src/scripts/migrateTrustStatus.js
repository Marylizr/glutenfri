require('dotenv').config();
const mongoose = require('mongoose');
const Establishment = require('../models/Establishment');
const { normalizeEstablishmentTrust } = require('../utils/trustStatus');

async function migrate() {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGODB_URI);
  const establishments = await Establishment.find({}).lean();
  const counts = {};
  const operations = establishments.map((establishment) => {
    const normalized = normalizeEstablishmentTrust(establishment);
    counts[normalized.trustStatus] = (counts[normalized.trustStatus] || 0) + 1;
    return {
      updateOne: {
        filter: { _id: establishment._id },
        update: {
          $set: {
            trustStatus: normalized.trustStatus,
            certified: normalized.certified,
            sourceName: normalized.sourceName,
            sourceUrl: normalized.sourceUrl,
            lastVerifiedAt: normalized.lastVerifiedAt,
          },
        },
      },
    };
  });

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', total: operations.length, counts }, null, 2));
  if (apply && operations.length) await Establishment.bulkWrite(operations);
  await mongoose.disconnect();
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
