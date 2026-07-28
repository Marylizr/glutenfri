const mongoose = require('mongoose');

const establishmentChangeRequestSchema = new mongoose.Schema(
  {
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      required: true,
      index: true,
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    changes: { type: mongoose.Schema.Types.Mixed, required: true },
    fields: [{ type: String, required: true }],
    sensitiveFields: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'rejected', 'cancelled'],
      default: 'draft',
      index: true,
    },
    reviewReason: { type: String, trim: true, maxlength: 1000 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

establishmentChangeRequestSchema.index({ establishment: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('EstablishmentChangeRequest', establishmentChangeRequestSchema);
