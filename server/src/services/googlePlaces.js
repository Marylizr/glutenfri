// Wrapper delgado sobre Places API (New). Todas las llamadas usan
// FieldMask explícito — nunca pedimos más campos de los necesarios,
// tanto por costo (algunos campos suben de tier de precio, ver
// PLACES_API_PRICING en el README) como por compliance (cuanto menos
// contenido de Google pedimos, menos tenemos que preocuparnos de
// cachearlo correctamente).

const BASE_URL = 'https://places.googleapis.com/v1';

function getApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY no está configurada en .env');
  return key;
}

// Text Search — matching por nombre+dirección para encontrar el place_id.
// FieldMask: id (Essentials) + displayName/formattedAddress/photos (Pro,
// mismo tier que photos así que no suma costo pedirlos también) — NUNCA
// rating/userRatingCount (Enterprise, más caro).
async function textSearchPlaces(textQuery, { maxResultCount = 1 } = {}) {
  const resultCount = Math.min(Math.max(Number(maxResultCount) || 1, 1), 20);
  const res = await fetch(`${BASE_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.photos',
    },
    body: JSON.stringify({ textQuery, maxResultCount: resultCount }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Text Search falló (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.places || [];
}

async function textSearchPlace(textQuery) {
  const places = await textSearchPlaces(textQuery);
  return places[0] || null;
}

// Place Details restringido a photos — se llama en vivo cada vez que hace
// falta mostrar una foto, nunca se persiste el resultado. FieldMask=photos
// solo dispara el tier "Place Details Essentials IDs Only" (el más barato).
async function getPlacePhotoName(placeId) {
  const res = await fetch(`${BASE_URL}/places/${placeId}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': 'photos',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Place Details falló (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.photos?.[0]?.name || null;
}

// Place Photo Media — devuelve los bytes de la imagen directamente
// (skipHttpRedirect=false por default hace que fetch siga la redirección).
async function fetchPlacePhotoMedia(photoName, { maxWidthPx = 800 } = {}) {
  const url = `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${getApiKey()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Place Photo Media falló (${res.status})`);
  }
  return res;
}

// Place Details restringido a location — para el job de refresco de
// lat/lng (la única otra excepción de caché del ToS, válida por 30 días).
async function getPlaceLocation(placeId) {
  const res = await fetch(`${BASE_URL}/places/${placeId}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': 'location',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Place Details falló (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.location || null;
}

module.exports = {
  textSearchPlace,
  textSearchPlaces,
  getPlacePhotoName,
  fetchPlacePhotoMedia,
  getPlaceLocation,
};
