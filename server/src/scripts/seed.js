require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Establishment = require('../models/Establishment');

async function seed() {
  const filePath = path.join(__dirname, '../../data/merged_dataset.json');
  if (!fs.existsSync(filePath)) {
    console.error(`No se encontró ${filePath}. Copia ahí el merged_dataset.json.`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const docs = raw.establishments.map((e) => ({
    name: e.name,
    type: e.type,
    address: e.address || undefined,
    lat: e.lat || undefined,
    lng: e.lng || undefined,
    phone: e.phone || undefined,
    email: e.email || undefined,
    facebook: e.facebook || undefined,
    source: e.source,
    certified: !!e.certified,
    discount: e.discount || undefined,
    tags: e.tags || [],
    avgRating: e.avgRating || null,
    notes: e.notes || undefined,
  }));

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Conectado. Insertando ${docs.length} establecimientos...`);

  await Establishment.deleteMany({}); // seed limpio; quitar si se corre incrementalmente
  await Establishment.insertMany(docs);

  console.log('Seed completo.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
