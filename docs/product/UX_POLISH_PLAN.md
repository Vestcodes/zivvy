# UX Polish Plan

DESIGN AUDIT RESULTS

Overall Assessment: Zivvy has strong product ambition but still mixes marketing
decorations, ERP admin density, and app-workflow surfaces. The next design pass
should make the product feel quieter, faster, and more operationally obvious.

────────────────────────────────────────────

PHASE 1 — Critical

- App navigation: ERP breadth is visible before user intent is clear -> group modules by jobs-to-be-done with a focused app launcher and recent work -> reduces cognitive load.
- Sales module: generic ERP flows are not yet a polished revenue workflow -> implement the Sales spec as the first product-grade module -> establishes the reusable standard.
- Marketing homepage: first viewport was animation-heavy -> keep hero static-first and reserve motion below the fold -> improves perceived performance and conversion.
- Authenticated shell: boot/session state was global -> keep public routes guest/static and app routes authenticated -> avoids slow marketing pages and stale user context.
- Lists and detail pages: raw table/admin patterns need product hierarchy -> standardize list header, saved views, filters, row actions, and detail timeline -> makes modules learnable.

Review: These are Phase 1 because they actively affect speed, navigation, and whether users understand what to do.

────────────────────────────────────────────

PHASE 2 — Refinement

- Typography: marketing and app surfaces use uneven scale -> define app, marketing, table, and dialog type scales in `packages/ui` tokens -> makes screens feel intentional.
- Buttons: CTAs and secondary buttons have mixed visual weight -> standardize primary/secondary/destructive/icon button variants -> improves action hierarchy.
- Cards: dashboards lean decorative -> use cards only for repeated items and real tools, not page sections -> app feels more SaaS-operator, less landing-page.
- Forms: validation/error copy should be friendlier and consistent -> create shared form field, hint, error, and submit-state patterns -> reduces support burden.
- Status badges: financial and workflow states need consistent semantics -> define status tokens for draft, sent, overdue, paid, failed, synced -> improves scanning.

Review: These refinements raise perceived quality after the core flows stop fighting users.

────────────────────────────────────────────

PHASE 3 — Polish

- Empty states: replace "no records" patterns with create/import/connect actions -> makes every blank module actionable.
- Loading states: replace inconsistent spinners with skeletons matched to the final layout -> improves perceived performance.
- Error states: show cause, retry, support path, and logs where relevant -> improves trust.
- Motion: use short, functional transitions for menus/dialogs only -> keeps the app calm and fast.
- Dark mode: audit contrast and shadows after token cleanup -> prevent inverted-theme rough edges.

Review: Phase 3 turns a usable app into a product that feels finished.

────────────────────────────────────────────

DESIGN_SYSTEM UPDATES REQUIRED

- Add product status tokens in `packages/ui/src/tokens.ts`.
- Add type scale tokens for marketing hero, page header, section header, table body, caption.
- Add standard app layout measurements: sidebar width, topbar height, content max width, table row height.
- Add component contracts for list page, detail page, empty state, loading skeleton, error panel.

────────────────────────────────────────────

IMPLEMENTATION NOTES FOR BUILD AGENT

- `apps/web/components/site/hero.tsx`: keep as server component; do not reintroduce motion imports.
- `apps/web/app/layout.tsx`: keep boot fetches out of root layout.
- `apps/web/app/(app)/layout.tsx`: authenticated boot data belongs here.
- `packages/ui/src/tokens.ts`: extend token exports before new module UI work.
- `docs/modules/sales.md`: implement Sales screens in the listed order.
- `packages/module-registry/src/index.ts`: every shipped module must have routes, events, integrations, AI capabilities, and smoke tests.
