// Keep only subscribed events for this Zap
const allowed = String(inputData.allowed_events || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const event = inputData.event || '';
if (allowed.length && !allowed.includes(event) && !allowed.includes('*')) {
  // Returning [] stops the Zap for Catch Hook + Filter patterns when used
  // with Paths / Filter — here we throw so the step fails closed.
  throw new Error('Event ' + event + ' not in allowed list');
}
return {
  event,
  resource: inputData.resource,
  name: inputData.name,
  customer: inputData.customer || '',
  supplier: inputData.supplier || '',
  employee: inputData.employee || '',
  status: inputData.status || '',
  grand_total: inputData.grand_total || '',
  timestamp: inputData.timestamp || ''
};
