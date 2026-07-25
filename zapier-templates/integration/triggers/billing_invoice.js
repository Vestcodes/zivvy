// REST Hook trigger — https://docs.zapier.com/integrations/build/cli-hook-trigger
// Subscribe via POST https://integrate.zivvy.xyz/v1/webhooks

const EVENTS = ["sales-invoices.submitted","sales-invoices.updated","payment-entries.submitted"];

const subscribeHook = async (z, bundle) => {
  const response = await z.request({
    url: 'https://integrate.zivvy.xyz/v1/webhooks',
    method: 'POST',
    body: {
      url: bundle.targetUrl,
      events: EVENTS,
      label: `Zapier: Invoice or Payment Event`,
      secret: bundle.inputData.webhook_secret || undefined,
    },
  });
  // Expect { id | name, ... }
  return response.data;
};

const unsubscribeHook = async (z, bundle) => {
  const id =
    bundle.subscribeData.id ||
    bundle.subscribeData.name ||
    bundle.subscribeData.webhook_id;
  if (!id) return {};
  await z.request({
    url: `https://integrate.zivvy.xyz/v1/webhooks/${id}`,
    method: 'DELETE',
  });
  return {};
};

const parsePayload = (z, bundle) => {
  const body = bundle.cleanedRequest || {};
  const data = body.data || {};
  const row = {
    id: data.name || body.delivery_id || z.hash('md5', JSON.stringify(body)),
    event: body.event,
    resource: body.resource,
    name: data.name,
    doctype: data.doctype,
    customer: data.customer || '',
    supplier: data.supplier || '',
    employee: data.employee || '',
    status: data.status || '',
    grand_total: data.grand_total || '',
    modified: data.modified || '',
    timestamp: body.timestamp || '',
    raw: body,
  };
  // perform MUST return an array
  return [row];
};

const performList = async (z, bundle) => {
  // Fallback sample poll for Zap editor mapping
  const response = await z.request({
    url: 'https://integrate.zivvy.xyz/v1/sales-invoices',
    method: 'GET',
    params: { limit: 3 },
  });
  const rows = response.data?.data || response.data?.results || response.data || [];
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) {
    return [
      {
        id: 'SAMPLE-0001',
        event: EVENTS[0],
        resource: 'sales-invoices',
        name: 'SAMPLE-0001',
        status: 'Open',
        timestamp: new Date().toISOString(),
      },
    ];
  }
  return list.slice(0, 3).map((r) => ({
    id: r.name || r.id,
    event: EVENTS[0],
    resource: 'sales-invoices',
    name: r.name || r.id,
    customer: r.customer || '',
    supplier: r.supplier || '',
    employee: r.employee || '',
    status: r.status || '',
    grand_total: r.grand_total || '',
    timestamp: r.modified || r.creation || '',
  }));
};

module.exports = {
  key: 'billing_invoice',
  noun: 'Invoice Event',
  display: {
    label: 'Invoice or Payment Event',
    description: 'Triggers on sales invoice submitted/updated or payment entry submitted.',
  },
  operation: {
    type: 'hook',
    inputFields: [
      {
        key: 'webhook_secret',
        label: 'Webhook signing secret (optional)',
        type: 'string',
        required: false,
        helpText:
          'Stored on the Zivvy webhook for HMAC. Zapier Catch URLs do not verify HMAC; useful if you later move to a custom URL.',
      },
    ],
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    perform: parsePayload,
    performList,
    sample: {
      id: 'SAMPLE-0001',
      event: EVENTS[0],
      resource: 'sales-invoices',
      name: 'SAMPLE-0001',
      doctype: 'Sample',
      customer: 'CUST-001',
      status: 'Open',
      grand_total: '100.00',
      timestamp: '2026-07-25T12:00:00Z',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'event', label: 'Event' },
      { key: 'resource', label: 'Resource' },
      { key: 'name', label: 'Document Name' },
      { key: 'customer', label: 'Customer' },
      { key: 'supplier', label: 'Supplier' },
      { key: 'employee', label: 'Employee' },
      { key: 'status', label: 'Status' },
      { key: 'grand_total', label: 'Grand Total' },
      { key: 'timestamp', label: 'Timestamp' },
    ],
  },
};
