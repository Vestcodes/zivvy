# Zivvy Module UX Playbook

Every module follows the same user experience model so exposing all ERPNext apps
does not feel like exposing ERPNext itself.

## Module Home

Purpose: answer "what needs attention here today?"

Required sections:

- Health summary.
- Things needing attention.
- Recent activity.
- Primary CTA.
- Suggested next action.
- Integration health if connected systems exist.

## List View

Purpose: let users find, compare, and act.

Required controls:

- Search.
- Filters.
- Saved views.
- Sort.
- Pagination.
- Import/export where relevant.
- Bulk actions.
- Row action menu.

## Detail View

Purpose: make one record understandable and actionable.

Required sections:

- Header: status, owner, primary action, secondary actions.
- Overview.
- Activity timeline.
- Related records.
- Files.
- Automations.
- Integrations.
- Audit/permissions where relevant.

## Create/Edit

Purpose: make record creation safe and fast.

Required behavior:

- Required fields clearly marked.
- Friendly validation.
- Safe defaults.
- Duplicate detection where likely.
- Long text, unicode, and paste handling.
- Submit feedback.
- Refresh/back-button safety for long forms.

## Empty States

Empty states must sell the next action. Never ship "No records found" alone.

Examples:

- Create first record.
- Import CSV.
- Connect integration.
- Use template.
- Ask AI to generate starter data.

## AI Layer

AI should be helpful, contextual, and reversible.

Good AI actions:

- Summarize this record.
- Explain why this changed.
- Draft customer/supplier message.
- Detect missing fields.
- Suggest automation.
- Find duplicates.

Bad AI actions:

- Silent record mutation.
- Unexplained financial posting.
- Irreversible bulk edits.

## Mobile

Mobile modules optimize for:

- review
- search
- approve
- scan
- comment
- quick create

Heavy configuration can remain desktop-first.
