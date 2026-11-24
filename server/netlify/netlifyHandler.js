const connectDB = require('../src/config/db');
const { validateRuntimeEnv } = require('../src/config/runtimeEnv');
const { createApp } = require('../src/app');
const { createServerlessHandler } = require('./serverlessAdapter');
const { classifyDatabaseFailure } = require('../src/utils/databaseFailure');

validateRuntimeEnv();

const app = createApp({ environment: 'production' });
const expressHandler = createServerlessHandler(app);

async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectDB();
  } catch (error) {
    const diagnostic = process.env.MONGODB_URI
      ? classifyDatabaseFailure(error)
      : { category: 'configuration', code: 'MISSING_MONGODB_URI' };
    console.error('GLUTENFRI_DATABASE_CONNECTION_FAILURE', JSON.stringify(diagnostic));
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
