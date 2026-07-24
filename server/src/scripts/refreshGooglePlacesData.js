// Job de refresco de lat/lng para establecimientos con placeId. GitHub
// Actions lo ejecuta semanalmente; el margen de 23 días evita superar el
// máximo de 30 días aunque una ejecución programada se retrase.
//
// Uso:
//   node src/scripts/refreshGooglePlacesData.js
//   node src/scripts/refreshGooglePlacesData.js --force   (ignora el corte de 30 días)

require('dotenv').config();
const mongoose = require('mongoose');
const Establishment = require('../models/Establishment');
const { getPlaceLocation } = require('../services/googlePlaces');

const REFRESH_AFTER_DAYS = 23;
const REFRESH_AFTER_MS = REFRESH_AFTER_DAYS * 24 * 60 * 60 * 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const force = process.argv.includes('--force');

  if (!process.env.MONGODB_URI) throw new Error('Falta MONGODB_URI');
  if (!process.env.GOOGLE_PLACES_API_KEY) throw new Error('Falta GOOGLE_PLACES_API_KEY');

  await mongoose.connect(process.env.MONGODB_URI);

  const query = { placeId: { $exists: true, $ne: null } };
  if (!force) {
    const cutoff = new Date(Date.now() - REFRESH_AFTER_MS);
    query.$or = [
      { googlePlaceRefreshedAt: { $lt: cutoff } },
      { googlePlaceRefreshedAt: { $exists: false } },
    ];
  }

  const stale = await Establishment.find(query);
  console.log(`${stale.length} establecimientos a refrescar.\n`);

  let updated = 0;
  let errored = 0;

  for (const est of stale) {
    try {
      const location = await getPlaceLocation(est.placeId);
      if (location) {
        est.lat = location.latitude;
        est.lng = location.longitude;
      }
      est.googlePlaceRefreshedAt = new Date();
      await est.save();
      console.log(`  ✓ ${est.name}`);
      updated++;
    } catch (err) {
      console.error(`  ✗ ${est.name}: ${err.message}`);
      errored++;
    }
    await sleep(200);
  }

  console.log(`\nResumen: ${updated} actualizados, ${errored} con error.`);
  await mongoose.disconnect();
  if (errored > 0) {
    throw new Error(`${errored} establecimientos no pudieron refrescarse`);
  }
}

run().catch((err) => {
  console.error(err);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
