# Zivvy Visual QA + Polish Report

Date: 2026-07-23  
Target: https://zivvy.xyz  
Screenshots:
- Before: `e2e-screenshots/polish-before/`
- After: `e2e-screenshots/polish-after/`

## Scope

Routes reviewed and captured in desktop viewport:
- `/`
- `/features`
- `/pricing`
- `/docs`
- `/developers`
- `/blog`
- `/login`
- `/app`
- `/app/billing`

## Route-by-Route Review

### `/` Home

**Before**
- Hero felt under-art-directed: large dark mass with weak right-column utilization and low information density.
- Section rhythm looked uneven; cards varied in visual weight and spacing.
- CTA hierarchy looked serviceable but not premium.

**After**
- Hero now presents clear two-column narrative with signal rail, stronger typographic hierarchy, and cleaner CTA grouping.
- Card system unified (radius, borders, shadows, spacing) to reduce template-like noise.
- Footer and section spacing tuned for consistent SaaS rhythm.

### `/features`

**Before**
- Long text-heavy plan blocks with weak chunking and little visual segmentation.
- CTA row felt tacked on and spacing between plan sections lacked intent.
- Paid barcode distinction existed in copy but was easy to miss.

**After**
- Plan sections restyled as deliberate cards with improved scanability and calmer contrast.
- Better vertical spacing and clearer action row treatment.
- Barcode paid-only boundary remains explicit in plan narrative and feature bullets.

### `/pricing`

**Before**
- Decent baseline, but card polish and typography rhythm were inconsistent with premium SaaS positioning.
- Footer note was visually flat and easy to skip.
- Plan boundaries were visible but not strongly emphasized.

**After**
- Pricing cards now sit in a cleaner system with stronger featured-plan emphasis and improved spacing.
- Button alignment and visual consistency improved across all three cards.
- Barcode plan boundary is explicit in plan bullets and pricing note text.

### `/docs`

**Before**
- Dense content blocks with weak information architecture and low visual guidance.
- “How to upgrade” and billing details blended into body text.
- CTA grouping looked generic and mechanically spaced.

**After**
- Content grouped into clearer documentation cards with improved hierarchy and breathing room.
- Plan progression and billing sections are easier to scan at a glance.
- CTA row now aligns with the shared marketing button system.

### `/developers`

**Before**
- High visual noise from many endpoint blocks with minimal structure cues.
- Typography felt small/tight relative to the content volume.
- Authentication/plans context did not stand out enough from endpoint details.

**After**
- Endpoint blocks are more structured and separated, with cleaner card boundaries.
- Better readability through spacing, subtle contrast, and consistent component styling.
- Plan context remains explicit, including barcode API plan gating language.

### `/blog`

**Before**
- List layout felt plain and low-value despite useful content.
- Weak affordance between entries; little depth or interaction polish.

**After**
- Posts now read as intentional cards with better spacing and list rhythm.
- Visual density and hierarchy improved without over-designing editorial content.

### `/login`

**Before**
- Major layout quality issue: stacked/awkward composition on desktop with oversized heading and weak balance.
- Form area looked detached from the value proposition and not price-justified.

**After**
- Proper two-column desktop composition with branded story panel + focused auth card.
- Form controls, buttons, chips, and footnote now align to a coherent visual system.
- Login looks product-grade and intentionally designed rather than default framework skin.

### `/app`

**Before**
- First-load welcome modal blocked core content and made the workspace feel intrusive/unfinished.
- Card hierarchy and surface rhythm were basic.

**After**
- Intrusive startup modal removed; users land directly into the workspace content.
- Intro container, warning banner, and cards now have clearer hierarchy and cleaner spacing.
- Free-plan upgrade language now explicitly references paid barcode inventory capability.

### `/app/billing`

**Before**
- Functional but visually flat: summary area and plan cards lacked premium hierarchy.
- Free-plan barcode restriction was not prominent enough for quick understanding.

**After**
- Billing summary now uses clearer stat-card structure and improved spacing.
- Plan card polish improved (alignment, labels, action emphasis).
- Clear top-level paid-barcode notice added: Free blocked, Pro/Business enabled.

## Barcode Requirement Status

Implemented and surfaced clearly:
- Free plan copy now states barcode is blocked as a paid inventory feature.
- Pro/Business copy states barcode is included on paid inventory plans.
- Billing UI includes a prominent plan rule message.
- Existing server-side gating remains in place with upgrade-required messaging.
- Live API check after deploy: Free user gets `403 PermissionError` with upgrade copy on `erpnext.stock.utils.scan_barcode`; Pro user returns `200` (not blocked).

## Functional Route Verification

Using the final after run metadata (`e2e-screenshots/polish-after/_capture.json`):
- All 9 required routes returned HTTP 200.
- `/app` resolved to `/app/zivvy-home` successfully after authenticated login.
- `/app/billing` loaded successfully in Desk.
- Authenticated session established as demo user during capture.

## Residual Visual Debt (Not Fully Solved in This Pass)

- `/developers` is still long and information-dense; it needs a larger IA refactor (tabs/accordion/filtering) for true premium doc UX.
- Some marketing route content remains intentionally text-forward; a future pass could add richer visual aids/illustrations.
- Billing still inherits parts of Frappe component styling; deeper desk-shell component replacements would further elevate polish.
