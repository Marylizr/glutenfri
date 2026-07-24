const Establishment = require('../models/Establishment');
const Review = require('../models/Review');
const { toPublicReview } = require('../utils/reviewFormatting');
const { getPlacePhotoName, fetchPlacePhotoMedia } = require('../services/googlePlaces');

// Cache en memoria de proceso (nunca en Mongo) del nombre de recurso de la
// foto por placeId — evita pegarle a Place Details en cada request de
// imagen. Se pierde al reiniciar el server; es exactamente el tipo de
// caché de corto plazo que el ToS de Google permite porque no persiste.
const photoNameCache = new Map(); // placeId -> { name, expiresAt }
const PHOTO_NAME_TTL_MS = 60 * 60 * 1000; // 1 hora

async function listEstablishments(req, res) {
  const { type, certifiedOnly } = req.query;
  const query = {};
  if (type) query.type = type;
  if (certifiedOnly === 'true') query.certified = true;

  // Paginación preparada para cuando el dataset crezca más allá de un
  // puñado de cientos de registros. Default limit=100 cubre el dataset
  // actual (72) en una sola página, así que no cambia el comportamiento
  // para clientes que todavía no mandan page/limit.
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 200);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Establishment.find(query).skip(skip).limit(limit).lean(),
    Establishment.countDocuments(query),
  ]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

async function getEstablishment(req, res) {
  const establishment = await Establishment.findById(req.params.id).lean();
  if (!establishment) return res.status(404).json({ error: 'No encontrado' });
  res.json(establishment);
}

async function listReviews(req, res) {
  const reviews = await Review.find({ establishment: req.params.id })
    .populate('user', 'name')
    .sort('-createdAt')
    .lean();
  res.json(reviews.map(toPublicReview));
}

async function createReview(req, res) {
  const {
    rating,
    comment,
    photos,
    staffUnderstanding,
    hasDedicatedMenu,
    dedicatedKitchen,
    riskLevel,
  } = req.body;

  // Una reseña por usuario por establecimiento (índice único en Review):
  // si ya tenía una, la actualiza en vez de rechazar — la gente cambia de
  // opinión sobre un lugar, no tiene sentido bloquearla.
  const existing = await Review.findOne({ establishment: req.params.id, user: req.user.id });

  const review = await Review.findOneAndUpdate(
    { establishment: req.params.id, user: req.user.id },
    {
      rating,
      comment,
      photos,
      staffUnderstanding,
      hasDedicatedMenu,
      dedicatedKitchen,
      riskLevel,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Recalcular avgRating del establecimiento — corre igual al crear, editar
  // o (en deleteAccount) borrar una reseña, siempre sobre lo que quedó.
  const agg = await Review.aggregate([
    { $match: { establishment: review.establishment } },
    { $group: { _id: '$establishment', avg: { $avg: '$rating' } } },
  ]);

  // Celiac Safety Protocols: la reseña más reciente sobrescribe los campos
  // del establecimiento (decisión de producto — no se promedia entre reseñas).
  // staffTrained se deriva de staffUnderstanding: solo "excellent" cuenta como
  // personal capacitado.
  await Establishment.findByIdAndUpdate(review.establishment, {
    ...(agg.length ? { avgRating: Math.round(agg[0].avg * 10) / 10 } : {}),
    dedicatedGlutenFreeMenu: hasDedicatedMenu,
    dedicatedKitchen,
    staffTrained: staffUnderstanding === 'excellent',
    riskLevel,
  });

  res.status(existing ? 200 : 201).json(review);
}

// Foto real de Google, resuelta en vivo — nunca persistimos photos[].name
// en Mongo (ver nota de compliance en el modelo Establishment). Si no hay
// placeId o la foto no se puede resolver, 404 — el frontend cae al ícono
// genérico de PhotoPlaceholder.
async function getEstablishmentPhoto(req, res) {
  const establishment = await Establishment.findById(req.params.id).lean();
  if (!establishment || !establishment.placeId) {
    return res.status(404).json({ error: 'Sin foto disponible' });
  }

  let photoName;
  const cached = photoNameCache.get(establishment.placeId);
  if (cached && cached.expiresAt > Date.now()) {
    photoName = cached.name;
  } else {
    photoName = await getPlacePhotoName(establishment.placeId);
    photoNameCache.set(establishment.placeId, { name: photoName, expiresAt: Date.now() + PHOTO_NAME_TTL_MS });
  }

  if (!photoName) {
    return res.status(404).json({ error: 'Sin foto disponible' });
  }

  const width = Math.min(Math.max(parseInt(req.query.w, 10) || 800, 100), 1600);
  const googleRes = await fetchPlacePhotoMedia(photoName, { maxWidthPx: width });

  res.set('Content-Type', googleRes.headers.get('content-type') || 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=86400'); // caché del navegador/CDN, no en nuestra base
  // helmet pone Cross-Origin-Resource-Policy: same-origin por default, que
  // bloquea que un <img> cargado desde el frontend (otro puerto/dominio)
  // use esta imagen. Es una foto pública de un lugar, pensada justamente
  // para consumirse cross-origin.
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.send(Buffer.from(await googleRes.arrayBuffer()));
}

module.exports = {
  listEstablishments,
  getEstablishment,
  listReviews,
  createReview,
  getEstablishmentPhoto,
};
