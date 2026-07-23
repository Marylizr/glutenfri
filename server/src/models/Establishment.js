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
