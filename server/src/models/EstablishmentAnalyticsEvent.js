const mongoose = require('mongoose');

const ANALYTICS_EVENTS = [
  'detail_impression',
  'phone_click',
  'website_click',
  'menu_click',
  'reservation_click',
  'order_click',
  'whatsapp_click',
  'directions_click',
  'share_click',
  'sponsored_click',
];

const establishmentAnalyticsEventSchema = new mongoose.Schema(
  {
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Establishment',
      required: true,
      index: true,
    },
    eventId: { type: String, required: true, unique: true, maxlength: 100 },
    type: { type: String, required: true, enum: ANALYTICS_EVENTS, index: true },
    source: { type: String, enum: ['organic', 'sponsored'], default: 'organic' },
    occurredAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

establishmentAnalyticsEventSchema.index({ establishment: 1, occurredAt: -1, type: 1 });

module.exports = {
  ANALYTICS_EVENTS,
  EstablishmentAnalyticsEvent: mongoose.model(
    'EstablishmentAnalyticsEvent',
    establishmentAnalyticsEventSchema
  ),
};
