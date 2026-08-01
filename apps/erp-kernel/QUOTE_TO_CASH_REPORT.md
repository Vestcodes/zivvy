# Quote → Cash Submit Path

**When:** 2026-07-26T03:49:00Z (final run)  
**Account:** `demo@zivvy.xyz` · **Company:** Acme Industries  
**Harness:** `zivvy_brand/scripts/quote_to_cash_e2e.cjs`  
**Verdict:** **PARTIAL** — money docs submit through Sales Invoice; Payment Entry blocked by Postgres

## Result

| Step | OK | Doc |
| --- | --- | --- |
| Login / API session | yes | demo@zivvy.xyz |
| Customer | yes | CUST-2026-00015 |
| Item | yes | IT-Q2C-MS19E1GT |
| Create + **Submit** Quotation | yes | SAL-QTN-2026-00012 |
| Create SO from Quotation + **Submit** | yes | SAL-ORD-2026-00014 |
| Create SI from SO + **Submit** | yes | ACC-SINV-2026-00009 |
| Create/Submit Payment Entry | **no** | `GroupingError` on `tabPayment Request.name` (PG GROUP BY) |
| UI detail pages (QTN / SO / SI) | yes | all load |

## Notes

- SI submit required deploying the local `QueryPaymentLedger` `Max(ple.account)` Postgres fix to Railway (`erpnext/accounts/utils.py`).
- PE path needed v15-compatible `payment_entry.py` on Railway plus PG fixes (`if()` → `coalesce`, `"Closed"` → `'Closed'`). Remaining failure is Payment Request outstanding allocation SQL under Postgres.
- Artifacts: `e2e-screenshots/quote-cash/`, `erpnext/QA_QUOTE_TO_CASH.json`
