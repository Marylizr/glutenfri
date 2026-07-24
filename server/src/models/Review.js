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
    // Moderación básica: reportedBy evita que la misma persona reporte la
    // misma reseña más de una vez (ver reportReview). hidden la saca de los
    // feeds públicos sin borrarla — el autor la sigue viendo/editando.
    hidden: { type: Boolean, default: false },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [
      {
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason: {
          type: String,
          enum: ['incorrect_safety', 'offensive', 'spam', 'personal_data', 'other'],
          required: true,
        },
        details: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

reviewSchema.index({ establishment: 1 });
// Una reseña por usuario por establecimiento — reenviar el Safety Review
// actualiza la reseña existente en vez de crear una duplicada (ver
// establishmentsController.createReview, que hace upsert por esta combinación).
reviewSchema.index({ establishment: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
