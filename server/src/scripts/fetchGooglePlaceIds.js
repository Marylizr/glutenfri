// Busca el place_id de Google para los establecimientos con source
// Google/APC+Google que todavía no lo tienen, usando Text Search (New)
// con nombre+dirección. Guarda el resultado en Mongo Y en
// merged_dataset.json (para que sobreviva un `npm run seed`, que hoy
// borra y recrea toda la colección desde ese archivo).
//
// Uso:
//   node src/scripts/fetchGooglePlaceIds.js --limit=3
//   node src/scripts/fetchGooglePlaceIds.js            (procesa todos los pendientes)
//
// No guarda un match si el nombre devuelto por Google no se parece lo
// suficiente al nuestro — mejor dejarlo pendiente de revisión manual que
// guardar un falso positivo.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Establishment = require('../models/Establishment');
const { textSearchPlace } = require('../services/googlePlaces');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeMatch(ourName, googleName) {
  const a = normalize(ourName);
  const b = normalize(googleName);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;

  const aWords = new Set(a.split(' ').filter((w) => w.length > 2));
  const bWords = new Set(b.split(' ').filter((w) => w.length > 2));
  if (aWords.size === 0) return false;

  let overlap = 0;
  for (const w of aWords) if (bWords.has(w)) overlap++;
  return overlap / aWords.size >= 0.5;
}

async function run() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

  await mongoose.connect(process.env.MONGODB_URI);

  const candidates = await Establishment.find({
    source: { $in: ['Google', 'APC+Google'] },
    placeId: { $in: [null, undefined] },
  });

  const toProcess = Math.min(limit, candidates.length);
  console.log(`${candidates.length} establecimientos sin place_id. Procesando ${toProcess}.\n`);

  const datasetPath = path.join(__dirname, '../../data/merged_dataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

  let matched = 0;
  let flagged = 0;
  let notFound = 0;
  let errored = 0;

  for (let i = 0; i < toProcess; i++) {
    const est = candidates[i];
    const query = est.address ? `${est.name}, ${est.address}` : est.name;
    console.log(`[${i + 1}/${toProcess}] Buscando: "${query}"`);

    let result;
    try {
      result = await textSearchPlace(query);
    } catch (err) {
      console.error(`  ✗ Error en Text Search: ${err.message}`);
      errored++;
      await sleep(200);
      continue;
    }

    if (!result) {
      console.log('  ⚠️  Sin resultados de Google.\n');
      notFound++;
      await sleep(200);
      continue;
    }

    const googleName = result.displayName?.text || '';
    const googleAddress = result.formattedAddress || '';
    const hasPhoto = (result.photos || []).length > 0;

    console.log(`  Nuestro: "${est.name}" — ${est.address || '(sin dirección)'}`);
    console.log(`  Google:  "${googleName}" — ${googleAddress}`);
    console.log(`  Fotos:   ${hasPhoto ? 'sí' : 'no'}`);

    if (!looksLikeMatch(est.name, googleName)) {
      console.log('  ⚠️  POSIBLE FALSO POSITIVO — no se guarda, revisar manualmente.\n');
      flagged++;
      await sleep(200);
      continue;
    }

    est.placeId = result.id;
    est.hasPhoto = hasPhoto;
    est.googlePlaceRefreshedAt = new Date();
    await est.save();

    const datasetEntry = dataset.establishments.find((e) => e.name === est.name);
    if (datasetEntry) datasetEntry.placeId = result.id;

    console.log('  ✓ Guardado.\n');
    matched++;

    await sleep(200);
  }

  fs.writeFileSync(datasetPath, `${JSON.stringify(dataset, null, 2)}\n`);

  console.log(
    `Resumen: ${matched} guardados, ${flagged} posibles falsos positivos (sin guardar), ${notFound} sin resultados, ${errored} con error.`
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
