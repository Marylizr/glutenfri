const mongoose = require('mongoose');

const REPORT_REASONS = [
  'closed_business',
  'incorrect_address',
  'incorrect_hours',
  'incorrect_contact',
  'incorrect_certification',
  'menu_unavailable',
  'incorrect_cross_contact',
  'other',
];

const establishmentReportSchema = new mongoose.Schema(
  {
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      required: true,
      index: true,
    },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    comment: { type: String, trim: true, maxlength: 800 },
    contact: { type: String, trim: true, maxlength: 254 },
    submissionId: { type: String, required: true, unique: true, maxlength: 80 },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = {
  EstablishmentReport: mongoose.model('EstablishmentReport', establishmentReportSchema),
  REPORT_REASONS,
};
