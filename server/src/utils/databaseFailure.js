// Only fixed, allowlisted labels may reach logs. Never log driver messages,
// stacks, connection strings, hostnames, or arbitrary error properties.
const codes = new Map([
  ['ENOTFOUND', 'dns'], ['ENODATA', 'dns'], ['EAI_AGAIN', 'dns'],
  ['ESERVFAIL', 'dns'], ['EREFUSED', 'dns'], ['ETIMEOUT', 'dns'],
  [18, 'authentication'], [13, 'authorization'],
  ['ECONNREFUSED', 'network'], ['ECONNRESET', 'network'],
  ['ETIMEDOUT', 'network'], ['ENETUNREACH', 'network'],
  ['EHOSTUNREACH', 'network'],
  ['ERR_TLS_CERT_ALTNAME_INVALID', 'tls'],
  ['CERT_HAS_EXPIRED', 'tls'], ['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'tls'],
]);
const errorNames = new Set([
  'MongoServerError', 'MongoNetworkError', 'MongoNetworkTimeoutError',
  'MongoAPIError', 'MongoRuntimeError', 'MongoInvalidArgumentError',
  'MongoMissingCredentialsError', 'MongoCompatibilityError',
]);

function classifyDatabaseFailure(error) {
  const queue = [error];
  const visited = new Set();
  let selectionTimeout = false;
  let knownErrorName;
  while (queue.length && visited.size < 32) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);
    if (codes.has(current.code)) {
      return { category: codes.get(current.code), code: current.code };
    }
    if (errorNames.has(current.name)) knownErrorName = current.name;
    // Some server responses wrap authentication failures in a generic code.
    // Inspect only to classify; no part of the message is returned or logged.
    if (current.name === 'MongoServerError' && typeof current.message === 'string'
      && /\b(?:bad auth|authentication failed|auth failed)\b/i.test(current.message)) {
      return { category: 'authentication', code: 'SERVER_AUTHENTICATION_FAILED' };
    }
    if (current.name === 'MongoParseError') {
      return { category: 'configuration', code: 'INVALID_CONNECTION_OPTIONS' };
    }
    if (current.name === 'MongoServerSelectionError' || current.name === 'MongooseServerSelectionError') {
      selectionTimeout = true;
    }
    queue.push(current.cause, current.reason, current.error);
    if (current.servers instanceof Map) {
      for (const server of current.servers.values()) {
        if (queue.length >= 32) break;
        queue.push(server?.error);
      }
    }
  }
  return selectionTimeout
    ? { category: 'server_selection', code: 'NO_REACHABLE_SERVER' }
    : { category: 'unknown', code: knownErrorName || 'UNCLASSIFIED_CONNECTION_FAILURE' };
}

module.exports = { classifyDatabaseFailure };
