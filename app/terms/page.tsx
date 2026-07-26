import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/marketing/legal-shell";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Terms of Service",
  description:
    "Terms governing your use of Zivvy, including accounts, billing, data regions, and acceptable use.",
  canonicalPath: "/terms"
});

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="2026-07-24"
      summary="These Terms govern access to Zivvy — multi-module ERP SaaS for CRM, sales, stock, finance, HR, manufacturing, and related workflows."
    >
      <p>
        Welcome to <strong>Zivvy</strong> (<Link href="https://zivvy.xyz">https://zivvy.xyz</Link>).
        By creating an account, accessing the service, or completing a paid subscription, you agree
        to these Terms of Service (“Terms”). If you are using Zivvy on behalf of an organization,
        you represent that you have authority to bind that organization, and “you” includes that
        organization.
      </p>
      <p>
        Questions:{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>. Related documents:{" "}
        <Link href="/privacy">Privacy Policy</Link>, <Link href="/cookies">Cookie Policy</Link>,{" "}
        <Link href="/acceptable-use">Acceptable Use Policy</Link>,{" "}
        <Link href="/refunds">Billing &amp; Refunds</Link>, and{" "}
        <Link href="/dpa">Data Processing summary</Link>.
      </p>

      <h2>1. The service</h2>
      <p>
        Zivvy is a cloud multi-module business / ERP application. Modules and features available
        to you depend on your subscription plan (Free, Pro, or Business) as described on our{" "}
        <Link href="/pricing">Pricing</Link> page and may evolve as we improve the product. We may
        add, change, or deprecate features with reasonable notice when changes are material to paid
        plans.
      </p>
      <p>
        <strong>Business</strong> plan customers may self-host or run Zivvy on their own cloud under
        separately agreed deployment terms. Self-hosted deployments remain subject to these Terms
        for licensed software and support entitlements, except where hosting obligations clearly
        do not apply.
      </p>

      <h2>2. Accounts and eligibility</h2>
      <ul>
        <li>Provide accurate registration information and keep credentials secure.</li>
        <li>
          You are responsible for activity under your organization’s workspace and user seats,
          including invites and role assignments.
        </li>
        <li>
          You must be legally able to enter a binding contract under applicable law in your
          jurisdiction.
        </li>
        <li>
          At signup you choose a data region (India, EU, or US). See Section 5 and the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </li>
      </ul>

      <h2>3. Subscriptions, seats, and billing</h2>
      <p>
        Paid plans are billed on a <strong>per-user (seat)</strong> basis, monthly or annually.
        Current list prices are published on <Link href="/pricing">Pricing</Link> (for example,
        Pro and Business seat rates, with annual billing typically discounted). Taxes may apply.
      </p>
      <p>
        Checkout, invoices, payment methods, seat changes, renewals, and cancellations for paid
        subscriptions are processed by our payment provider, <strong>Polar</strong> (polar.sh),
        which acts as merchant of record / payment processor for Zivvy subscriptions. By upgrading,
        you authorize Polar to charge applicable fees for the selected plan and seat quantity,
        subject to Polar’s terms and our{" "}
        <Link href="/refunds">Billing &amp; Refunds</Link> policy.
      </p>
      <ul>
        <li>
          <strong>Free</strong>: limited features and a soft seat cap (currently 2 users).
        </li>
        <li>
          <strong>Pro / Business</strong>: paid seats unlock modules as described on Pricing.
        </li>
        <li>
          Failure to pay may result in suspension, feature restriction, or reversion to Free.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>
        You must comply with our <Link href="/acceptable-use">Acceptable Use Policy</Link>. We may
        suspend or terminate access for abuse, security risk, unlawful activity, or material breach
        of these Terms.
      </p>

      <h2>5. Customer data and regions</h2>
      <p>
        You retain ownership of data you submit to Zivvy (“Customer Data”). You grant Zivvy a
        limited license to host, process, and display Customer Data solely to provide, secure, and
        improve the service. Personal data handling is described in the{" "}
        <Link href="/privacy">Privacy Policy</Link>. For organizations that need a processing
        addendum, see our <Link href="/dpa">DPA summary</Link> and contact{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>.
      </p>
      <p>
        Cloud workspaces are <strong>region-pinned</strong>: you select India, EU, or US at signup.
        We do not move Customer Data across regions without your explicit action (for example, a
        supported migration you request). Operational tooling (support, billing identifiers,
        status email) may process limited account metadata outside your primary data region as
        described in the Privacy Policy.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        Zivvy — including software, branding, documentation, and the SaaS packaging — is owned by
        Zivvy or its licensors. These Terms do not transfer ownership of our IP. Zivvy may
        incorporate third-party open-source components under their respective licenses. Feedback
        you provide may be used to improve the product without obligation to you.
      </p>

      <h2>7. Confidentiality</h2>
      <p>
        Each party will protect the other’s confidential information with reasonable care and use
        it only to perform under these Terms, except where disclosure is required by law.
      </p>

      <h2>8. Warranties and disclaimers</h2>
      <p>
        The service is provided on an “as is” and “as available” basis. To the maximum extent
        permitted by law, we disclaim implied warranties of merchantability, fitness for a
        particular purpose, and non-infringement. We do not warrant uninterrupted or error-free
        operation. You are responsible for maintaining appropriate backups of Customer Data you
        control and for verifying that Zivvy meets your regulatory needs.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Zivvy’s aggregate liability arising out of these
        Terms will not exceed the fees you paid for Zivvy through Polar in the three (3) months
        preceding the claim. We are not liable for indirect, incidental, special, consequential, or
        punitive damages, or lost profits, revenue, or data, even if advised of the possibility.
      </p>

      <h2>10. Term and termination</h2>
      <p>
        You may stop using Free at any time. Paid subscriptions renew until canceled via the Polar
        customer portal or as otherwise offered in-product. We may terminate or suspend for
        material breach, non-payment, or legal risk. Upon termination, access to paid features ends;
        we may retain data as required by law or our Privacy Policy. Export options available in
        product or via support should be used before account closure when you need a copy.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by applicable law without regard to conflict-of-law rules that
        would require another jurisdiction’s law. Mandatory consumer protections in your country of
        residence remain unaffected. For dispute venue and registered entity details, contact{" "}
        <a href="mailto:contact@vestcodes.com">contact@vestcodes.com</a>.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these Terms by posting a revised version on this page with an updated “Last
        updated” date. Material changes to paid plans will be communicated reasonably in advance
        where practicable. Continued use after the effective date constitutes acceptance.
      </p>

      <h2>13. Contact</h2>
      <p>
        Vestcodes · <a href="mailto:contact@vestcodes.com">contact@vestcodes.com</a>
        <br />
        Product support: <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>
      </p>
    </LegalShell>
  );
}
