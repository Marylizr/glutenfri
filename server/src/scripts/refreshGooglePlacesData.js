// Job de refresco de lat/lng para establecimientos con placeId — la única
// otra excepción de caché del ToS de Google además de place_id (30 días,
// después hay que borrar/actualizar). NO está programado para correr
// automáticamente todavía (sin cron/scheduler configurado); es un script
// manual, listo para conectar a algo como Heroku Scheduler una vez en
// producción.
//
// Uso:
//   node src/scripts/refreshGooglePlacesData.js
//   node src/scripts/refreshGooglePlacesData.js --force   (ignora el corte de 30 días)

require('dotenv').config();
const mongoose = require('mongoose');
const Establishment = require('../models/Establishment');
const { getPlaceLocation } = require('../services/googlePlaces');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const force = process.argv.includes('--force');

  await mongoose.connect(process.env.MONGODB_URI);

  const query = { placeId: { $exists: true, $ne: null } };
  if (!force) {
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
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
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
