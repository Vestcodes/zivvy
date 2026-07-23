import type { Metadata } from "next";
import { LegalShell } from "@/components/site/legal-shell";

export const metadata: Metadata = {
  title: "Acceptable Use — Zivvy",
  description: "What's allowed on Zivvy."
};

export default function AcceptableUsePage() {
  return (
    <LegalShell title="Acceptable Use Policy" updated="2026-07-23">
      <p>
        Zivvy exists to help you run a real business. To keep the service
        safe for everyone, please don't use it for the following. This page
        is a placeholder — the canonical legal copy will be published here
        before public launch.
      </p>
      <h2>Prohibited</h2>
      <ul>
        <li>Illegal activity of any kind, in any jurisdiction</li>
        <li>Fraud, money laundering, or sanctions evasion</li>
        <li>Spam, phishing, or bulk unsolicited email through Zivvy</li>
        <li>Attempts to break, probe, or overload the service</li>
        <li>Reverse-engineering or resale of the platform</li>
      </ul>
      <h2>Enforcement</h2>
      <p>
        We may suspend accounts that violate this policy. Serious violations
        may result in immediate termination without refund.
      </p>
      <h2>Report</h2>
      <p>
        Concerns? Email{" "}
        <a href="mailto:contact@vestcodes.com">contact@vestcodes.com</a>.
      </p>
    </LegalShell>
  );
}
