import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/marketing/legal-shell";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Privacy Policy",
  description:
    "How Zivvy collects, uses, stores, and shares personal data — including region-pinned hosting and Polar billing.",
  canonicalPath: "/privacy"
});

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="2026-07-24"
      summary="How Zivvy handles personal information for our websites, accounts, and multi-module ERP product."
    >
      <p>
        This Privacy Policy explains how <strong>Zivvy</strong> (“we”, “us”) collects, uses, and
        shares personal information in connection with Zivvy websites, authentication, billing, and
        the cloud ERP product at <Link href="https://zivvy.xyz">https://zivvy.xyz</Link>.
      </p>
      <p>
        Contact: <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>. Related:{" "}
        <Link href="/cookies">Cookie Policy</Link>, <Link href="/terms">Terms of Service</Link>,{" "}
        <Link href="/dpa">DPA summary</Link>, <Link href="/security">Security</Link>.
      </p>

      <h2>1. Who we are</h2>
      <p>
        For account and website data, Zivvy is the controller (or equivalent under applicable law).
        For Customer Data you enter into the product (invoices, contacts, stock, HR records, and
        similar business records), your organization is typically the controller and Zivvy processes
        that data on your instructions as a processor / service provider. See the{" "}
        <Link href="/dpa">DPA summary</Link> for processing details and how to request a signed
        addendum.
      </p>
      <p>
        Controller contact: <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>. Registered
        entity details will be published when finalized; we do not invent registration numbers or
        addresses on this page.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong>: name, email, organization details, authentication
          identifiers, chosen data region (India / EU / US).
        </li>
        <li>
          <strong>Customer Data</strong>: business records you and your teammates create in Zivvy
          (CRM, orders, inventory, accounting, projects, and other modules). We process this to
          provide the service to your organization.
        </li>
        <li>
          <strong>Billing data</strong>: subscription plan, seat counts, and Polar customer /
          subscription identifiers. Payment card and bank details are handled by{" "}
          <strong>Polar</strong>; we do not store full card numbers on Zivvy servers.
        </li>
        <li>
          <strong>Usage &amp; device data</strong>: logs, IP address, browser type, approximate
          location derived from IP, and feature usage for security, reliability, and product
          improvement.
        </li>
        <li>
          <strong>Support communications</strong>: messages you send to support@zivvy.xyz or
          in-product help channels.
        </li>
        <li>
          <strong>Cookies</strong>: as described in our <Link href="/cookies">Cookie Policy</Link>.
        </li>
      </ul>

      <h2>3. How we use information</h2>
      <ul>
        <li>Provide, secure, support, and improve the Zivvy service</li>
        <li>Authenticate users and enforce plan / seat limits</li>
        <li>Process subscriptions and communicate billing events via Polar</li>
        <li>Respond to support requests and security incidents</li>
        <li>Comply with legal obligations and respond to lawful requests</li>
      </ul>

      <h2>4. Legal bases (where applicable)</h2>
      <p>
        Depending on your location, we rely on: contract performance (providing the service you
        signed up for); legitimate interests (security, fraud prevention, product reliability);
        consent (certain optional cookies / analytics); and legal obligation. EU/UK users and
        others with similar rights may exercise the rights listed in Section 9.
      </p>

      <h2>5. Region-pinned Customer Data</h2>
      <p>
        At signup you choose a primary data region: <strong>India</strong>, <strong>EU</strong>, or{" "}
        <strong>US</strong>. Customer Data for your cloud workspace is hosted in that region and is
        not moved across regions without your explicit action (such as a supported migration you
        request). Account metadata needed to run the product (for example login, billing
        identifiers, transactional email) may be processed by subprocessors that operate globally,
        under contract and with appropriate safeguards.
      </p>

      <h2>6. Sharing</h2>
      <p>We share personal information with:</p>
      <ul>
        <li>
          <strong>Polar</strong> — payments, invoicing, subscription management (merchant of
          record / payment processor)
        </li>
        <li>
          <strong>Infrastructure providers</strong> — hosting in your selected region, email
          delivery, monitoring, and error tracking (under contract)
        </li>
        <li>
          <strong>Professional advisors / authorities</strong> — when required by law or to protect
          rights, safety, and security
        </li>
      </ul>
      <p>
        We do not sell personal information. A current sub-processor list is available on request
        at <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>.
      </p>

      <h2>7. International transfers</h2>
      <p>
        Customer Data stays in your chosen region as described above. Limited account and
        operational data may be processed in other countries where our subprocessors operate. Where
        required, we use appropriate contractual and technical measures (for example standard
        contractual clauses or equivalent) for those transfers.
      </p>

      <h2>8. Retention</h2>
      <p>
        We retain account and billing records while your workspace is active and for a reasonable
        period afterward for backups, dispute resolution, and legal compliance. You (or your
        organization admin) may request export or deletion subject to legal retention requirements
        and active subscription / billing records Polar must keep.
      </p>

      <h2>9. Your rights</h2>
      <p>
        Subject to applicable law, you may request access, correction, deletion, restriction,
        portability, or objection to certain processing, and withdraw consent where processing is
        consent-based. Organization admins control Customer Data inside Zivvy. Contact{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>. We may need to verify your
        identity and, for Customer Data, redirect requests to your organization’s admin when
        appropriate.
      </p>

      <h2>10. Security</h2>
      <p>
        We implement administrative, technical, and organizational measures designed to protect
        personal information. Details of product security practices are summarized on our{" "}
        <Link href="/security">Security</Link> page. No method of transmission or storage is fully
        secure; use strong passwords and limit seat access.
      </p>

      <h2>11. Children</h2>
      <p>
        Zivvy is not directed to children under 16. We do not knowingly collect their personal
        data.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this Policy by posting a new version here with an updated “Last updated”
        date. Material changes will be highlighted when appropriate.
      </p>

      <h2>13. Contact</h2>
      <p>
        Zivvy · <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>
      </p>
    </LegalShell>
  );
}
