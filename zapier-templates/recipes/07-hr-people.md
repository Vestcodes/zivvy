# Zivvy HR — Leave / Expense / Employee

**Area:** HR & People  
**Events:** `leave-applications.created`, `leave-applications.updated`, `leave-applications.submitted`, `expense-claims.created`, `expense-claims.updated`, `expense-claims.submitted`, `employees.created`

## Build in Zapier (Catch Hook — any plan)

1. **Trigger:** Webhooks by Zapier → **Catch Hook** → copy URL  
2. **Zivvy:** register webhook (Developer settings or API below) for the events listed  
3. **Code by Zapier:** paste `recipes/_shared-filter-code.js`, map fields from step 1  
4. **Filter (optional):** only continue when `event` is one of the listed events  
5. **Action:** Slack / Sheets / Email — use mapped fields from Code step  
6. **Optional enrich:** Webhooks by Zapier GET `https://api.zivvy.xyz/v1/leave-applications/{{name}}` with Bearer `zk_live_`

## Register webhook

```bash
curl -X POST https://integrate.zivvy.xyz/v1/webhooks \
  -H "Authorization: Bearer $ZIVVY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://hooks.zapier.com/hooks/catch/XXXX/YYYY/",
    "events": ["leave-applications.created","leave-applications.updated","leave-applications.submitted","expense-claims.created","expense-claims.updated","expense-claims.submitted","employees.created"],
    "label": "HR & People Zap",
    "secret": "$ZIVVY_WEBHOOK_SECRET"
  }'
```

## Sample payload (production)

```json
{
  "event": "leave-applications.created",
  "resource": "leave-applications",
  "data": {
    "name": "SAMPLE-0001",
    "doctype": "Example",
    "status": "Open"
  },
  "timestamp": "2026-07-25T12:00:00"
}
```

## Native integration alternative

Import/push `zapier-templates/integration` (Platform CLI) for a first-class **Leave, Expense, or Employee Event** trigger — see root README.
