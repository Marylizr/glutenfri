const mongoose = require('mongoose');

let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI');

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri);
  }

  const pendingConnection = connectionPromise;
  try {
    await pendingConnection;
    return mongoose;
  } finally {
    if (connectionPromise === pendingConnection) connectionPromise = null;
  }
}

module.exports = connectDB;
