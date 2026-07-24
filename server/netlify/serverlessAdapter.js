const serverless = require('serverless-http');

// Netlify Functions espera que las respuestas binarias viajen en base64.
// Sin declarar image/*, serverless-http convierte el Buffer a UTF-8,
// corrompe el JPEG y el navegador termina mostrando el placeholder.
const BINARY_CONTENT_TYPES = ['image/*'];

function createServerlessHandler(app) {
  return serverless(app, { binary: BINARY_CONTENT_TYPES });
}

module.exports = { BINARY_CONTENT_TYPES, createServerlessHandler };
