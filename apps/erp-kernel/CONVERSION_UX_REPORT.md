# Zivvy Conversion UX Overhaul Report

Date: 2026-07-23  
Target funnel: visitor -> signup -> billing upgrade  
Environment validated: https://zivvy.xyz

## Screenshot Deliverables

Before:
- `e2e-screenshots/conversion-before/01-home.png`
- `e2e-screenshots/conversion-before/02-pricing.png`
- `e2e-screenshots/conversion-before/03-docs.png`
- `e2e-screenshots/conversion-before/04-developers.png`
- `e2e-screenshots/conversion-before/05-login.png`
- `e2e-screenshots/conversion-before/06-app-billing.png`

After:
- `e2e-screenshots/conversion-after/01-home.png`
- `e2e-screenshots/conversion-after/02-pricing.png`
- `e2e-screenshots/conversion-after/03-docs.png`
- `e2e-screenshots/conversion-after/04-developers.png`
- `e2e-screenshots/conversion-after/05-login.png`
- `e2e-screenshots/conversion-after/06-app-billing.png`

Capture metadata:
- `e2e-screenshots/conversion-before/_capture.json`
- `e2e-screenshots/conversion-after/_capture.json`

## What Changed

## 1) Homepage conversion architecture

Implemented:
- Stronger hero promise with primary CTA (`Start free workspace`) and secondary CTA (`Compare plans`)
- Outcome-focused proof cards (activation speed, cash control, upgrade clarity)
- "How it works in 3 steps" onboarding narrative
- Plan-fit guidance section (Free vs Pro vs Business by stage)
- Trust signal section without fake logos (billing, tenancy, gating transparency)
- Friction-killer FAQ for signup, billing, region preference, and tenancy

Why this should convert better:
- Faster visitor comprehension in first screenful
- Reduced ambiguity on who the product is for and what to do next
- Stronger confidence cues before signup click
- Better objection handling pre-signup

## 2) Pricing UX

Implemented:
- Sharper pricing hero and value chips
- Cleaner plan card hierarchy with "best for" persona copy
- Explicit gating language for barcode (blocked on Free, included on paid tiers)
- Feature gating matrix for high-speed comparison
- Improved upgrade CTA framing
- Customer-safe mention of 100% onboarding coupon path (manual request, time-bound)

Why this should convert better:
- Reduced evaluation friction on plan differences
- Better paid-plan anchoring (especially Pro)
- Lower checkout anxiety with transparent gating and process visibility

## 3) Billing UX (`/app/billing`)

Implemented:
- Reworked billing page structure for plan/seats/subscription/tenant clarity
- Added seat usage progress indicator
- Added portal status and sync status cards
- Improved empty/error states with safer customer messaging
- Improved portal edge-case messaging (first checkout required)
- Preserved existing checkout and portal method calls; no auth or billing API contract changes

Why this should convert better:
- Lower confusion at the exact upgrade decision point
- More confidence that billing actions are safe and reversible
- Better self-serve comprehension without support dependency

## 4) Docs and Developers UX

Implemented:
- Docs: concise "Start in 3 steps", plan fit, billing flow, tenancy/region section
- Developers: grouped endpoint navigation, quick-start cards, collapsible endpoint blocks
- Reduced internal jargon and improved scannability

Why this should convert better:
- Shorter time-to-understand for implementers and evaluators
- Clearer path from documentation to signup/upgrade actions

## 5) Login/signup polish

Implemented:
- Conversion-focused left-panel narrative and confidence chips
- Signup helper text to reduce form uncertainty
- Datacenter selector hardened with default selection behavior and clearer copy
- Kept existing auth flow and signup provisioning wiring intact

Why this should convert better:
- Lower signup hesitation and fewer selection errors
- Better continuity from marketing promise to auth experience

## Route Sanity Checks (Critical Pages)

From `e2e-screenshots/conversion-after/_capture.json`:
- `/` -> 200
- `/pricing` -> 200
- `/docs` -> 200
- `/developers` -> 200
- `/login` -> 200
- `/app/billing` -> 200 (authenticated demo session)

All required critical routes returned successful HTTP status.

## Safety / Regression Notes

- No backend auth, tenancy isolation, or billing API behavior was rewritten.
- Checkout and portal actions still call:
  - `zivvy_brand.billing.api.create_checkout`
  - `zivvy_brand.billing.api.create_portal_session`
- Signup still uses the same provisioning flow and required datacenter handling.

## Remaining Weak Spots / Follow-up

- No A/B test data yet; this is a conversion-optimized structural pass, not a measured experiment.
- Social proof is credibility-first and intentionally avoids fabricated logos/testimonials.
- 100% coupon path is currently support-mediated; could be productized later for selected onboarding flows.
- Recommended next phase:
  - Track CTA funnel events by page section
  - Add pricing-page and signup-step drop-off dashboards
  - Run headline/CTA experiments on hero and pricing cards
