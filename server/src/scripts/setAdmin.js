require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  const email = process.argv[2]?.trim().toLowerCase();
  const shouldRemove = process.argv.includes('--remove');
  if (!email) {
    throw new Error('Uso: npm run set-admin -- correo@ejemplo.com [--remove]');
  }
  if (!process.env.MONGODB_URI) throw new Error('Falta MONGODB_URI');

  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ email }).select('email isAdmin');
  if (!existing) throw new Error(`No existe una cuenta con email ${email}`);

  if (shouldRemove && existing.isAdmin) {
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) throw new Error('No se puede quitar el último administrador');
  }

  existing.isAdmin = !shouldRemove;
  await existing.save();
  console.log(`${existing.email}: isAdmin=${existing.isAdmin}`);
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
