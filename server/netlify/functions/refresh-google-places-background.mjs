import crypto from 'node:crypto';

import connectDB from '../../src/config/db.js';
import googlePlacesRefreshJob from '../../src/services/googlePlacesRefreshJob.js';

const {
  markRefreshFailed,
  runGooglePlacesRefresh,
} = googlePlacesRefreshJob;

function secretsMatch(received, expected) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }
  if (
    !secretsMatch(
      event.headers['x-job-secret'],
      process.env.NETLIFY_BACKGROUND_JOB_SECRET
    )
  ) {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  try {
    await connectDB();
    await runGooglePlacesRefresh();
    return { statusCode: 200, body: JSON.stringify({ completed: true }) };
  } catch (error) {
    await markRefreshFailed(error);
    throw error;
  }
}

export const config = {
  background: true,
};
