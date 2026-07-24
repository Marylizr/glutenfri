import netlifyHandler from '../netlifyHandler.js';

export const handler = (event, context) => netlifyHandler.handler(event, context);

export const config = {
  rateLimit: {
    windowSize: 900,
    windowLimit: 200,
    aggregateBy: ['ip', 'domain'],
  },
};
