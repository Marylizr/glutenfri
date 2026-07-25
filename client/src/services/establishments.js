import api from './api';
import API_URL from './apiConfig';
import { requireList } from './responseValidation';
import { createEstablishmentsLoader } from './establishmentsLoader.js';

// El backend pagina (page/limit) y devuelve { data, page, limit, total,
// totalPages }. El frontend hoy no tiene UI de paginación — con el default
// limit=100 del backend, esto sigue trayendo todo el dataset actual (72)
// en una sola llamada, igual que antes.
const loadEstablishments = createEstablishmentsLoader((params) =>
  api.get('/establishments', { params }).then((res) => res.data)
);

export const getEstablishments = (params = {}, options = {}) =>
  loadEstablishments(params, options);

export const getEstablishmentById = (id) =>
  api.get(`/establishments/${id}`).then((res) => res.data);

export const getReviews = (establishmentId) =>
  api
    .get(`/establishments/${establishmentId}/reviews`)
    .then((res) => requireList(res.data, 'lista de reseñas'));

export const postReview = (establishmentId, review) =>
  api.post(`/establishments/${establishmentId}/reviews`, review).then((res) => res.data);

// El backend resuelve la foto en vivo contra Google (nunca la guarda) —
// esto es solo la URL, no una llamada; <img> la pide cuando renderiza.
// La versión invalida respuestas antiguas que el navegador/CDN pudiera
// haber guardado antes de habilitar la codificación binaria en Functions.
const PHOTO_CACHE_VERSION = 2;

export const getEstablishmentPhotoUrl = (id, width = 800) =>
  `${API_URL}/establishments/${id}/photo?w=${width}&v=${PHOTO_CACHE_VERSION}`;
