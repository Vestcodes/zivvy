import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/marketing/legal-shell";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Acceptable Use Policy",
  description: "What is allowed — and not allowed — when using Zivvy.",
  canonicalPath: "/acceptable-use"
});

export default function AcceptableUsePage() {
  return (
    <LegalShell
      title="Acceptable Use Policy"
      updated="2026-07-24"
      summary="Zivvy exists to help teams run real businesses. These rules keep the platform safe and reliable for everyone."
    >
      <p>
        This Acceptable Use Policy (“AUP”) is part of the{" "}
        <Link href="/terms">Terms of Service</Link>. By using Zivvy you agree not to misuse the
        service. Contact <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a> to report
        abuse.
      </p>

      <h2>1. Prohibited activities</h2>
      <ul>
        <li>Illegal activity of any kind, in any jurisdiction where you operate</li>
        <li>Fraud, money laundering, sanctions evasion, or identity theft</li>
        <li>Spam, phishing, or bulk unsolicited messaging through Zivvy or using Zivvy data</li>
        <li>
          Attempts to break, probe, overload, or bypass security, rate limits, or seat / plan
          controls
        </li>
        <li>
          Reverse-engineering, scraping, or reselling the platform except as allowed by law or
          written permission
        </li>
        <li>
          Uploading malware, or content that infringes others’ IP, privacy, or publicity rights
        </li>
        <li>
          Using Zivvy to store or process data you are not authorized to handle, or in violation of
          export / industry regulations that apply to you
        </li>
        <li>
          Impersonating Zivvy, our staff, or other customers, or misrepresenting your affiliation
        </li>
      </ul>

      <h2>2. Fair use of shared infrastructure</h2>
      <p>
        Cloud plans share managed infrastructure. Automated jobs, API usage, file storage, and
        email/SMS volume must remain within reasonable commercial use for your seat count and plan.
        We may throttle or ask you to upgrade or self-host (Business) if usage threatens platform
        stability for other customers.
      </p>

      <h2>3. Customer responsibilities</h2>
      <ul>
        <li>Keep credentials and API keys confidential; rotate them if compromised</li>
        <li>Assign seats and roles only to people who should access your workspace</li>
        <li>Ensure Customer Data is lawful for you to process in your chosen region</li>
        <li>Respond promptly to abuse or security notices from Zivvy</li>
      </ul>

      <h2>4. Enforcement</h2>
      <p>
        We may investigate suspected violations. Depending on severity, we may warn, suspend,
        restrict features, or terminate accounts. Serious violations may result in immediate
        termination without refund, as described in{" "}
        <Link href="/refunds">Billing &amp; Refunds</Link> and the Terms.
      </p>

      <h2>5. Reporting</h2>
      <p>
        Report security issues or AUP concerns to{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>. Please include enough detail for
        us to investigate (workspace, timestamps, and impact) without including unnecessary
        sensitive data.
      </p>
    </LegalShell>
  );
}
