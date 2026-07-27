import posthog from "posthog-js";

/**
 * Lightweight conversion-tracking helpers.
 *
 * Every helper fires a PostHog custom event so funnel and retention
 * analysis works out of the box. The event names follow PostHog
 * conventions (snake_case, past tense).
 *
 * Vercel Analytics handles pageviews and Web Vitals automatically via
 * the <Analytics /> and <SpeedInsights /> components in the root layout.
 */

/** Fired when a user submits the signup form (before API response). */
export function trackSignupStarted(properties?: Record<string, unknown>) {
  posthog.capture("signup_started", properties);
}

/** Fired after the signup API confirms account creation. */
export function trackSignupCompleted(properties?: Record<string, unknown>) {
  posthog.capture("signup_completed", properties);
}

/** Fired when a user clicks a "Start free" or similar CTA button. */
export function trackCtaClicked(properties?: Record<string, unknown>) {
  posthog.capture("cta_clicked", properties);
}

/** Fired when the contact form is successfully submitted. */
export function trackContactSubmitted(properties?: Record<string, unknown>) {
  posthog.capture("contact_form_submitted", properties);
}

/** Fired when a user views the pricing page (supplements the automatic pageview). */
export function trackPricingViewed(properties?: Record<string, unknown>) {
  posthog.capture("pricing_page_viewed", properties);
}

/** Fired when a user selects / clicks a pricing tier's CTA. */
export function trackPlanSelected(properties?: Record<string, unknown>) {
  posthog.capture("plan_selected", properties);
}
