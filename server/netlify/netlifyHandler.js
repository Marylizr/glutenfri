const serverless = require('serverless-http');
const connectDB = require('../src/config/db');
const { validateRuntimeEnv } = require('../src/config/runtimeEnv');
const { createApp } = require('../src/app');

validateRuntimeEnv();

const app = createApp({ environment: 'production' });
const expressHandler = serverless(app);

async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  return expressHandler(event, context);
}

module.exports = { handler };
