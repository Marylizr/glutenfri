const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 },
    photos: [{ type: String }],
    // Safety Review — diferenciador de producto, más allá de las estrellas.
    // Estas respuestas alimentan los Celiac Safety Protocols del Establishment
    // correspondiente (ver establishmentsController.createReview).
    staffUnderstanding: { type: String, enum: ['poor', 'okay', 'excellent'], required: true },
    hasDedicatedMenu: { type: Boolean, required: true },
    dedicatedKitchen: { type: Boolean, required: true },
    riskLevel: { type: String, enum: ['none', 'low', 'moderate', 'high'], required: true },
  },
  { timestamps: true }
);

reviewSchema.index({ establishment: 1 });

module.exports = mongoose.model('Review', reviewSchema);
