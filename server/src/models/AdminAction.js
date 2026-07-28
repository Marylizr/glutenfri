const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorDeleted: { type: Boolean, default: false },
    action: {
      type: String,
      enum: [
        'review_hidden',
        'review_restored',
        'user_suspended',
        'user_restored',
        'user_updated',
        'user_deleted',
        'admin_granted',
        'admin_revoked',
        'establishment_created',
        'establishment_updated',
        'places_refresh_started',
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['review', 'user', 'establishment', 'system'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetLabel: { type: String, trim: true },
    reason: { type: String, trim: true, maxlength: 500 },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, updatedAt: false }
);

adminActionSchema.index({ createdAt: -1 });
adminActionSchema.index({ actor: 1, createdAt: -1 });
adminActionSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AdminAction', adminActionSchema);
