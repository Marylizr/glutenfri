const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

// Único lugar donde se decide qué de una Review es seguro exponer
// públicamente. Hoy: solo el primer nombre del usuario, nunca el
// apellido completo ni el email — se usa en cualquier endpoint que
// devuelva reseñas (feed de comunidad, mis reseñas, reseñas de un
// establecimiento). Si el criterio de privacidad cambia, se cambia acá
// una sola vez.
function toPublicReview(review) {
  return {
    ...review,
    user: review.user ? { _id: review.user._id, name: review.user.name.split(' ')[0] } : null,
  };
}

// Moderación básica: las reseñas con hidden:true se sacan de cualquier
// feed público, EXCEPTO para su propio autor (sigue viendo/editando la
// suya aunque esté oculta para el resto). userId viene de optionalAuth —
// puede no haber sesión, en cuyo caso solo se ven las no ocultas.
function visibilityFilter(baseQuery, userId) {
  if (!userId) return { ...baseQuery, hidden: false };
  return { ...baseQuery, $or: [{ hidden: false }, { user: userId }] };
}

module.exports = { parsePagination, toPublicReview, visibilityFilter };
