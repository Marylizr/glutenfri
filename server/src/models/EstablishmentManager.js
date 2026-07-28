const mongoose = require('mongoose');

const establishmentManagerSchema = new mongoose.Schema(
  {
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    claim: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessClaim' },
    role: { type: String, enum: ['owner', 'manager'], default: 'manager' },
    status: { type: String, enum: ['active', 'revoked'], default: 'active', index: true },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    revokedAt: { type: Date },
    revocationReason: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

establishmentManagerSchema.index({ establishment: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('EstablishmentManager', establishmentManagerSchema);
