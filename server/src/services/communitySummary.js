const Review = require('../models/Review');
const Establishment = require('../models/Establishment');
// Hidden content must not keep driving public aggregate signals.
async function refreshCommunitySummary(establishmentId) {
  const [latest, averages] = await Promise.all([
    Review.findOne({ establishment: establishmentId, hidden: false }).sort('-updatedAt').lean(),
    Review.aggregate([
      { $match: { establishment: establishmentId, hidden: false } },
      { $group: { _id: '$establishment', avg: { $avg: '$rating' } } },
    ]),
  ]);
  await Establishment.findByIdAndUpdate(establishmentId, {
    avgRating: averages.length ? Math.round(averages[0].avg * 10) / 10 : null,
    dedicatedGlutenFreeMenu: latest?.hasDedicatedMenu ?? null,
    dedicatedKitchen: latest?.dedicatedKitchen ?? null,
    staffTrained: latest ? latest.staffUnderstanding === 'excellent' : null,
    riskLevel: latest?.riskLevel ?? null,
  });
}
module.exports = { refreshCommunitySummary };
