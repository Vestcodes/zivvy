# Zivvy Billing — Invoice / Payment Events

**Area:** Billing & Accounting  
**Events:** `sales-invoices.submitted`, `sales-invoices.updated`, `payment-entries.submitted`

## Build in Zapier (Catch Hook — any plan)

1. **Trigger:** Webhooks by Zapier → **Catch Hook** → copy URL  
2. **Zivvy:** register webhook (Developer settings or API below) for the events listed  
3. **Code by Zapier:** paste `recipes/_shared-filter-code.js`, map fields from step 1  
4. **Filter (optional):** only continue when `event` is one of the listed events  
5. **Action:** Slack / Sheets / Email — use mapped fields from Code step  
6. **Optional enrich:** Webhooks by Zapier GET `https://api.zivvy.xyz/v1/sales-invoices/{{name}}` with Bearer `zk_live_`

## Register webhook

```bash
curl -X POST https://integrate.zivvy.xyz/v1/webhooks \
  -H "Authorization: Bearer $ZIVVY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://hooks.zapier.com/hooks/catch/XXXX/YYYY/",
    "events": ["sales-invoices.submitted","sales-invoices.updated","payment-entries.submitted"],
    "label": "Billing & Accounting Zap",
    "secret": "$ZIVVY_WEBHOOK_SECRET"
  }'
```

## Sample payload (production)

```json
{
  "event": "sales-invoices.submitted",
  "resource": "sales-invoices",
  "data": {
    "name": "SAMPLE-0001",
    "doctype": "Example",
    "status": "Open"
  },
  "timestamp": "2026-07-25T12:00:00"
}
```

## Native integration alternative

Import/push `zapier-templates/integration` (Platform CLI) for a first-class **Invoice or Payment Event** trigger — see root README.
