const mongoose = require('mongoose');

const businessClaimSchema = new mongoose.Schema(
  {
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      required: true,
      index: true,
    },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    responsibleName: { type: String, required: true, trim: true, maxlength: 120 },
    relationship: { type: String, required: true, trim: true, maxlength: 120 },
    professionalEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40 },
    officialUrl: { type: String, required: true, trim: true, maxlength: 500 },
    verificationMethod: {
      type: String,
      required: true,
      enum: [
        'official_domain_email',
        'public_contact_code',
        'manual_business_evidence',
        'administrative_review',
      ],
    },
    evidenceDescription: { type: String, required: true, trim: true, maxlength: 1500 },
    additionalComment: { type: String, trim: true, maxlength: 1000 },
    consentAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'needs_information', 'approved', 'rejected', 'revoked', 'cancelled'],
      default: 'pending',
      index: true,
    },
    activeKey: { type: String, unique: true, sparse: true },
    adminReason: { type: String, trim: true, maxlength: 1000 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

businessClaimSchema.index({ establishment: 1, status: 1, createdAt: -1 });
businessClaimSchema.index({ claimant: 1, createdAt: -1 });

module.exports = mongoose.model('BusinessClaim', businessClaimSchema);
