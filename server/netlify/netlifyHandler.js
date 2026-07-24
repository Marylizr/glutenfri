const connectDB = require('../src/config/db');
const { validateRuntimeEnv } = require('../src/config/runtimeEnv');
const { createApp } = require('../src/app');
const { createServerlessHandler } = require('./serverlessAdapter');

validateRuntimeEnv();

const app = createApp({ environment: 'production' });
const expressHandler = createServerlessHandler(app);

async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  return expressHandler(event, context);
}

module.exports = { handler };
