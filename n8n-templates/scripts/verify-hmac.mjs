#!/usr/bin/env node
/**
 * Smoke-test: mirror production Zivvy webhook signing and the n8n Code node verifier.
 * Run: node scripts/verify-hmac.mjs
 */
import crypto from "node:crypto";
import assert from "node:assert/strict";

const SECRET = "test_secret_zivvy";
const payload = {
  event: "leads.created",
  resource: "leads",
  data: {
    name: "LEAD-0007",
    doctype: "Lead",
    modified: "2026-07-25 12:00:00.000000",
    status: "Open"
  },
  timestamp: "2026-07-25T12:00:00"
};

// Production: json.dumps(payload, separators=(",", ":"))
const rawBody = JSON.stringify(payload);
const signature =
  "sha256=" +
  crypto.createHmac("sha256", SECRET).update(rawBody, "utf8").digest("hex");

assert.match(signature, /^sha256=[a-f0-9]{64}$/);

// Verifier (same as workflow Code node)
function verify(sigHeader, body, secret) {
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(body, "utf8").digest("hex");
  const a = Buffer.from(sigHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

assert.equal(verify(signature, rawBody, SECRET), true);
assert.equal(verify(signature, rawBody + " ", SECRET), false);
assert.equal(verify("sha256=deadbeef", rawBody, SECRET), false);

// Pretty-printed body must NOT verify (production uses compact separators)
const pretty = JSON.stringify(payload, null, 2);
assert.equal(verify(signature, pretty, SECRET), false);

console.log("OK — HMAC matches production webhooks.py contract");
console.log("sample signature:", signature);
console.log("sample body:", rawBody);
