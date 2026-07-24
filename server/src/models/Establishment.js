const mongoose = require('mongoose');

const establishmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['restaurant', 'store', 'pharmacy', 'bakery', 'supermarket'],
      required: true,
    },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    phone: { type: String },
    email: { type: String },
    facebook: { type: String },

    // 'certified' = certificación oficial APC. 'source' distingue de dónde
    // vino el registro para poder auditar calidad de dato más adelante.
    source: {
      type: String,
      enum: ['APC', 'Google', 'APC+Google', 'user'],
      required: true,
    },
    certified: { type: Boolean, default: false },
    discount: { type: String },
    tags: [{ type: String }],
    avgRating: { type: Number, default: null },
    notes: { type: String },

    // Celiac Safety Protocols — opcionales, se completan caso a caso (no
    // vienen en el dataset semilla APC/Google). La sección de detalle solo
    // se muestra si alguno de estos campos está definido.
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
  },
  { timestamps: true }
);

establishmentSchema.index({ lat: 1, lng: 1 });
establishmentSchema.index({ type: 1 });
// listEstablishments filtra por certifiedOnly=true — el único filtro nuevo
// de las sesiones recientes que corre sobre un campo no indexado.
establishmentSchema.index({ certified: 1 });

// dedicatedKitchen/dedicatedGlutenFreeMenu/staffTrained/riskLevel NO tienen
// índice: hoy solo se leen (detail page), nada los usa como filtro de
// query. Agregar índice si en algún momento sumamos un filtro tipo
// "?riskLevel=low" en listEstablishments.

module.exports = mongoose.model('Establishment', establishmentSchema);
