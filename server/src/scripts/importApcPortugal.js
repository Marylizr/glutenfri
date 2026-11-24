const { buildApcImportPlan, toApcDocument } = require('../utils/apcImportPlan');
const catalog = require('../../data/apc-portugal.json');

async function run() {
  const apply = process.argv.includes('--apply');
  let existing = require('../../data/merged_dataset.json').establishments;
  let mongoose;
  let Establishment;
  try {
    if (apply) {
      const database = process.argv.find((argument) => argument.startsWith('--database='))?.slice(11);
      if (!database) throw new Error('Specify the exact target with --database=NAME before applying.');
      require('dotenv').config({ quiet: true });
      mongoose = require('mongoose');
      Establishment = require('../models/Establishment');
      if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000, autoIndex: false, autoCreate: false,
      });
      if (mongoose.connection.name !== database) throw new Error('The connected database does not match --database.');
      existing = await Establishment.find().select('name address phone lat lng sourceUrl').lean();
    }
    const plan = buildApcImportPlan(existing, catalog.establishments);
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run-local', references: catalog.totalReferences,
      insert: plan.insert.length, alreadyPresent: plan.matched.length, pendingReview: plan.review.length }, null, 2));
    if (apply && plan.insert.length) {
      // Only insert new records; never overwrite existing trust, reviews or business data.
      const result = await Establishment.bulkWrite(plan.insert.map((reference) => ({
        updateOne: { filter: { sourceUrl: reference.sourceUrl, name: reference.name },
          update: { $setOnInsert: toApcDocument(reference) }, upsert: true },
      })), { ordered: true });
      console.log(JSON.stringify({ inserted: result.upsertedCount }));
    }
  } finally {
    if (mongoose) await mongoose.disconnect();
  }
}

run().catch(() => {
  // Driver messages can contain connection details; keep output generic.
  console.error('APC import stopped. Check the target database, connectivity and command arguments; no existing records are overwritten.');
  process.exitCode = 1;
});
