import netlifyHandler from '../netlifyHandler.js';

export const handler = (event, context) => netlifyHandler.handler(event, context);

export const config = {
  path: '/api/*',
  excludedPath: '/api/auth/*',
  rateLimit: {
    windowSize: 900,
    windowLimit: 200,
    aggregateBy: ['ip', 'domain'],
  },
};
