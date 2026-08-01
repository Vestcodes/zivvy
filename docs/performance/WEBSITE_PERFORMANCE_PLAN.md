# Website Performance Plan

## Current Diagnosis

The marketing site was laggy for two structural reasons:

- The root layout fetched boot/session and region data for every route, making
  public pages dynamic and backend-coupled.
- The homepage hero shipped several motion-heavy client components in the first
  viewport: aurora background, spotlight, meteors, text generation, flip words,
  and moving-border CTA.

## Completed First Fixes

- Root layout no longer fetches boot/session data.
- Authenticated layouts now own `BootProvider` with real boot data.
- Public pages get guest boot data by default.
- PostHog loads lazily from `NEXT_PUBLIC_POSTHOG_KEY`.
- Vercel Analytics and Speed Insights are opt-in by env flags.
- Homepage hero is server-rendered and static-first.
- Custom `/_next/static` cache header removed; Next handles immutable static caching.
- Lighthouse CI added for `/`, `/pricing`, and `/login`.

## Performance Budget

Desktop Lighthouse budget:

- Performance: warn below 78.
- Accessibility: fail below 90.
- Best practices: warn below 90.
- SEO: warn below 90.
- FCP: warn above 2.2s.
- LCP: warn above 3.2s.
- TBT: warn above 300ms.
- CLS: fail above 0.1.

## Next Fixes

1. Split marketing-only providers from app-only providers.
2. Replace global React Query provider on marketing routes.
3. Lazy-load pricing catalog only where pricing appears.
4. Audit client components on the homepage and move static sections back to server components.
5. Replace animation-heavy Aceternity components in above-the-fold marketing routes.
6. Add bundle analyzer and track top JS chunks over time.
7. Replace wildcard remote image policy with explicit domains.
8. Add Playwright trace for homepage, pricing, login, dashboard.
9. Add Web Vitals event logging through the lazy analytics layer.
10. Add production monitoring for slow API rewrites to Frappe.
