// Code by Zapier — optional signature check
// Production signs: X-Zivvy-Signature: sha256=<hmac_sha256(secret, raw_body)>
// Catch Hook usually only gives parsed JSON, so re-serialize compactly.
// Prefer REST Hook private integration for reliable delivery auth.
const crypto = require('crypto');
const secret = inputData.webhook_secret;
const sig = inputData.signature_header || '';
const payload = {
  event: inputData.event,
  resource: inputData.resource,
  data: typeof inputData.data === 'string' ? JSON.parse(inputData.data) : inputData.data,
  timestamp: inputData.timestamp
};
const raw = JSON.stringify(payload);
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
const ok = sig.length === expected.length &&
  crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
if (!ok) {
  throw new Error('Invalid Zivvy webhook signature');
}
return { ...payload, signature_valid: true };
