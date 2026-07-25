// Attach auth on every request — Zapier CLI beforeRequest middleware
const includeApiKey = (request, z, bundle) => {
  const key = bundle.authData.api_key;
  if (!key) return request;
  request.headers = request.headers || {};
  request.headers.Authorization = `Bearer ${key}`;
  // Also set OpenAPI-documented header for gateways that prefer it
  request.headers['X-API-Key'] = key.replace(/^Bearer\s+/i, '');
  return request;
};

module.exports = { includeApiKey };
