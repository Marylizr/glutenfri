const mongoose = require('mongoose');

const establishmentAuditLogSchema = new mongoose.Schema(
  {
    establishment: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment', index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    actorDeleted: { type: Boolean, default: false },
    action: { type: String, required: true, trim: true, index: true },
    targetType: { type: String, required: true, trim: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    fromStatus: { type: String },
    toStatus: { type: String },
    reason: { type: String, trim: true, maxlength: 1000 },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

establishmentAuditLogSchema.index({ establishment: 1, createdAt: -1 });
establishmentAuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

module.exports = mongoose.model('EstablishmentAuditLog', establishmentAuditLogSchema);
