const connectDB = require('../src/config/db');
const { validateRuntimeEnv } = require('../src/config/runtimeEnv');
const { createApp } = require('../src/app');
const { createServerlessHandler } = require('./serverlessAdapter');

validateRuntimeEnv();

const app = createApp({ environment: 'production' });
const expressHandler = createServerlessHandler(app);

async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectDB();
  } catch {
    // Never return the driver error: it can contain hostnames or credentials.
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Retry-After': '30',
      },
      body: JSON.stringify({ error: 'Service temporarily unavailable', code: 'DATABASE_UNAVAILABLE' }),
    };
  }
  return expressHandler(event, context);
}

module.exports = { handler };
