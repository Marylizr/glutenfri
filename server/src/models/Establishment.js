const mongoose = require('mongoose');
const { TRUST_STATUSES } = require('../utils/trustStatus');

const HTTP_URL = /^https?:\/\/[^\s]+$/i;
const TIME_VALUE = /^([01]\d|2[0-3]):[0-5]\d$/;
const hourIntervalSchema = new mongoose.Schema(
  {
    start: { type: String, required: true, match: TIME_VALUE },
    end: { type: String, required: true, match: TIME_VALUE },
  },
  { _id: false }
);
const weeklyHoursSchema = new mongoose.Schema(
  Object.fromEntries(
    ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => [
      day,
      { type: [hourIntervalSchema], default: undefined },
    ])
  ),
  { _id: false }
);
const informationSourceSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 120 },
    url: { type: String, trim: true, match: HTTP_URL },
  },
  { _id: false }
);
const businessImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true, match: HTTP_URL },
    alt: { type: String, required: true, trim: true, maxlength: 180 },
    credit: { type: String, trim: true, maxlength: 120 },
  },
  { _id: false }
);
const socialLinkSchema = new mongoose.Schema(
  {
    network: { type: String, required: true, trim: true, maxlength: 40 },
    url: { type: String, required: true, trim: true, match: HTTP_URL },
  },
  { _id: false }
);
const specialHoursSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    closed: { type: Boolean, default: false },
    intervals: { type: [hourIntervalSchema], default: undefined },
    note: { type: String, trim: true, maxlength: 120 },
  },
  { _id: false }
);

const establishmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['restaurant', 'store', 'pharmacy', 'bakery', 'supermarket'],
      required: true,
    },
    address: { type: String },
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
    phone: { type: String },
    email: { type: String },
    facebook: { type: String },

    // `certified` se conserva solo para compatibilidad con registros antiguos.
    // La clasificación pública se deriva siempre de trustStatus + evidencia.
    source: {
      type: String,
      enum: ['APC', 'Google', 'APC+Google', 'user'],
      required: true,
    },
    certified: { type: Boolean, default: false },
    trustStatus: { type: String, enum: TRUST_STATUSES, default: 'PENDING_VALIDATION' },
    sourceName: { type: String, trim: true },
    sourceUrl: { type: String, trim: true },
    lastVerifiedAt: { type: Date },
    certificationBody: { type: String, trim: true, maxlength: 160 },
    certificationDate: { type: Date },
    discount: { type: String },
    tags: [{ type: String }],
    avgRating: { type: Number, default: null },
    notes: { type: String },

    // Señales declaradas por la comunidad. No representan certificación ni
    // verificación y se muestran explícitamente como experiencias.
    dedicatedKitchen: { type: Boolean },
    dedicatedGlutenFreeMenu: { type: Boolean },
    staffTrained: { type: Boolean },
    riskLevel: { type: String, enum: ['none', 'low', 'moderate', 'high'] },

    // Google Places (New) — place_id es la única referencia de Google que
    // el ToS permite cachear indefinidamente (Places API Policies). NO
    // guardamos photos[].name ni ningún otro dato de Google acá: eso se
    // resuelve en vivo en cada request (ver services/googlePlaces.js) para
    // no repetir el problema de compliance que ya documentamos con
    // name/address/rating. hasPhoto es un booleano derivado nuestro (no
    // contenido de Google), solo para decidir si vale la pena intentar
    // pedir la foto.
    placeId: { type: String },
    hasPhoto: { type: Boolean, default: false },
    googlePlaceRefreshedAt: { type: Date },

    // Información práctica opcional. Ninguno de estos campos se rellena de
    // forma automática ni altera la taxonomía de confianza.
    images: [{ type: String, trim: true, match: HTTP_URL }],
    logoUrl: { type: String, trim: true, match: HTTP_URL },
    websiteUrl: { type: String, trim: true, match: HTTP_URL },
    menuUrl: { type: String, trim: true, match: HTTP_URL },
    reservationUrl: { type: String, trim: true, match: HTTP_URL },
    orderUrl: { type: String, trim: true, match: HTTP_URL },
    whatsapp: { type: String, trim: true, maxlength: 40 },
    timezone: { type: String, trim: true, maxlength: 80 },
    weeklyHours: { type: weeklyHoursSchema },
    crossContactMeasures: [{ type: String, trim: true, maxlength: 240 }],
    dedicatedArea: { type: Boolean },
    delivery: { type: Boolean },
    takeaway: { type: Boolean },
    accessibilityFeatures: [{ type: String, trim: true, maxlength: 120 }],
    serviceLanguages: [{ type: String, trim: true, maxlength: 40 }],
    glutenFreeScope: { type: String, trim: true, maxlength: 500 },
    informationSources: [informationSourceSchema],
    lastInformationUpdate: { type: Date },

    // Contenido comercial publicado. Solo se actualiza desde una solicitud
    // aprobada; nunca reemplaza certificación, reseñas o señales comunitarias.
    businessDescription: { type: String, trim: true, maxlength: 2000 },
    publicEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    businessImages: { type: [businessImageSchema], default: undefined },
    socialLinks: { type: [socialLinkSchema], default: undefined },
    specialHours: { type: [specialHoursSchema], default: undefined },
    temporarilyClosed: { type: Boolean, default: false },
    services: [{ type: String, trim: true, maxlength: 80 }],
    lastBusinessReviewAt: { type: Date },
    lastPublishedUpdateAt: { type: Date },
    nextReviewDueAt: { type: Date },
    sponsorship: {
      status: { type: String, enum: ['inactive', 'active'], default: 'inactive' },
      startsAt: { type: Date },
      endsAt: { type: Date },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

establishmentSchema.index({ lat: 1, lng: 1 });
establishmentSchema.index({ type: 1 });
// listEstablishments filtra por certifiedOnly=true — el único filtro nuevo
// de las sesiones recientes que corre sobre un campo no indexado.
establishmentSchema.index({ certified: 1 });
establishmentSchema.index({ trustStatus: 1 });

// dedicatedKitchen/dedicatedGlutenFreeMenu/staffTrained/riskLevel NO tienen
// índice: hoy solo se leen (detail page), nada los usa como filtro de
// query. Agregar índice si en algún momento sumamos un filtro tipo
// "?riskLevel=low" en listEstablishments.

module.exports = mongoose.model('Establishment', establishmentSchema);
