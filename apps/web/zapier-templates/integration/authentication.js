// API Key auth — https://docs.zapier.com/integrations/build/apikeyauth
// Zivvy keys: zk_live_… from Settings → Developer
// Gateway accepts Authorization: Bearer (marketing) and X-API-Key (OpenAPI).

const testAuth = async (z, bundle) => {
  const response = await z.request({
    url: 'https://integrate.zivvy.xyz/v1/webhooks/events',
    method: 'GET',
  });
  return response.data;
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'Zivvy API Key',
      type: 'string',
      required: true,
      helpText:
        'Create a zk_live_ key in Zivvy → Settings → Developer. Used as Bearer token.',
    },
  ],
  test: testAuth,
  connectionLabel: 'Zivvy API',
};
