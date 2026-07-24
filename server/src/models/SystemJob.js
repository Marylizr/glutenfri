const mongoose = require('mongoose');

const systemJobSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['idle', 'running', 'completed', 'completed_with_errors', 'failed'],
      default: 'idle',
    },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    total: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    lastError: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemJob', systemJobSchema);
