import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/marketing/legal-shell";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Billing & Refunds",
  description:
    "How Zivvy subscriptions, seats, cancellations, and refunds work — including Polar checkout.",
  canonicalPath: "/refunds"
});

export default function RefundsPage() {
  return (
    <LegalShell
      title="Billing & Refunds"
      updated="2026-07-24"
      summary="Seat-based subscriptions, Polar checkout, cancellations, and when refunds apply."
    >
      <p>
        This policy explains how billing works for <strong>Zivvy</strong> paid plans and how
        refunds are handled. It supplements the <Link href="/terms">Terms of Service</Link>.
        Pricing details live on <Link href="/pricing">Pricing</Link>.
      </p>

      <h2>1. Plans and seats</h2>
      <p>
        Zivvy is billed <strong>per user (seat)</strong>. Free includes a limited seat count;
        Pro and Business unlock additional modules as published on Pricing. You can add or remove
        seats according to tools available in-product and in the billing portal. Seat increases may
        be prorated for the remainder of the billing period.
      </p>

      <h2>2. Payment processor (Polar)</h2>
      <p>
        Paid subscriptions are processed by <strong>Polar</strong> (polar.sh), which acts as
        merchant of record / payment processor for Zivvy. Polar handles checkout, invoices, payment
        methods, receipts, and the customer portal for upgrades, seat changes, and cancellations.
        Card data is collected by Polar — not stored on Zivvy application servers.
      </p>
      <p>
        By completing checkout you also agree to Polar’s applicable terms for payment processing.
        Zivvy remains responsible for delivering the software service described in our Terms.
      </p>

      <h2>3. Billing cycles</h2>
      <ul>
        <li>
          <strong>Monthly</strong>: charged each month until canceled. Cancel any time; access to
          paid features continues through the end of the paid period.
        </li>
        <li>
          <strong>Annual</strong>: charged upfront for the year (typically at a discount vs monthly).
          Renews unless canceled before renewal.
        </li>
      </ul>
      <p>Taxes may be calculated and collected by Polar based on your billing details.</p>

      <h2>4. Cancellations</h2>
      <p>
        Cancel via the in-app billing portal (Polar customer portal) or by emailing{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a> from an admin account. After
        cancellation, your workspace may revert to Free entitlements when the paid period ends,
        subject to data retention in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>5. Refunds</h2>
      <ul>
        <li>
          <strong>Monthly plans</strong>: cancel any time. We generally do not refund partial
          months already paid; you keep access until the period ends.
        </li>
        <li>
          <strong>Annual plans</strong>: refundable within <strong>30 days</strong> of the initial
          annual charge, no questions asked, when requested via support or Polar’s refund flow.
          After 30 days, we may offer prorated credit or adjustments for downgrades at our
          discretion.
        </li>
        <li>
          <strong>Downgrades</strong>: feature access updates according to the new plan; unused
          prepaid time may be credited or prorated where Polar and our systems support it.
        </li>
        <li>
          <strong>Abuse / AUP violations</strong>: accounts terminated for serious Acceptable Use
          violations may not be eligible for refunds.
        </li>
      </ul>
      <p>
        Chargebacks should be a last resort — contact{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a> first so we can resolve billing
        issues quickly.
      </p>

      <h2>6. Failed payments</h2>
      <p>
        If a renewal payment fails, Polar and/or Zivvy may retry and notify you. Continued
        non-payment may suspend paid features or move the workspace to Free.
      </p>

      <h2>7. Self-host (Business)</h2>
      <p>
        Business customers who self-host may have separate commercial terms for licenses, support,
        and deployment. Unless a written order says otherwise, software license fees follow the same
        refund principles as cloud annual/monthly subscriptions for the licensed period.
      </p>

      <h2>8. Contact</h2>
      <p>
        Billing help: <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>
      </p>
    </LegalShell>
  );
}
