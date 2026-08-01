type PostHogClient = {
  __loaded?: boolean;
  init: (
    key: string,
    options: {
      api_host: string;
      person_profiles: "identified_only";
      capture_pageview: boolean;
      capture_pageleave: boolean;
    }
  ) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (id: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
};

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let posthogPromise: Promise<PostHogClient | null> | undefined;

function hasIdleCallback(
  value: Window
): value is Window & {
  requestIdleCallback: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number;
} {
  return "requestIdleCallback" in value;
}

function scheduleIdle(task: () => void) {
  if (typeof window === "undefined") return;
  if (hasIdleCallback(window)) {
    window.requestIdleCallback(task, { timeout: 2000 });
    return;
  }
  globalThis.setTimeout(task, 1);
}

export function getPostHogClient(): Promise<PostHogClient | null> {
  if (typeof window === "undefined" || !POSTHOG_KEY) {
    return Promise.resolve(null);
  }

  posthogPromise ??= import("posthog-js").then(({ default: posthog }) => {
    const client = posthog as PostHogClient;
    if (!client.__loaded) {
      client.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true
      });
    }
    return client;
  });

  return posthogPromise;
}

export function captureAnalyticsEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  scheduleIdle(() => {
    void getPostHogClient().then((client) => {
      client?.capture(event, properties);
    });
  });
}

/** Fired when a user submits the signup form before the API response. */
export function trackSignupStarted(properties?: Record<string, unknown>) {
  captureAnalyticsEvent("signup_started", properties);
}

/** Fired after the signup API confirms account creation. */
export function trackSignupCompleted(properties?: Record<string, unknown>) {
  captureAnalyticsEvent("signup_completed", properties);
}

/** Fired when a user clicks a "Start free" or similar CTA button. */
export function trackCtaClicked(properties?: Record<string, unknown>) {
  captureAnalyticsEvent("cta_clicked", properties);
}

/** Fired when the contact form is successfully submitted. */
export function trackContactSubmitted(properties?: Record<string, unknown>) {
  captureAnalyticsEvent("contact_form_submitted", properties);
}

/** Fired when a user views the pricing page. */
export function trackPricingViewed(properties?: Record<string, unknown>) {
  captureAnalyticsEvent("pricing_page_viewed", properties);
}

/** Fired when a user selects or clicks a pricing tier's CTA. */
export function trackPlanSelected(properties?: Record<string, unknown>) {
  captureAnalyticsEvent("plan_selected", properties);
}
