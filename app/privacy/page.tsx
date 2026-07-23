import type { Metadata } from "next";
import { LegalShell } from "@/components/site/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — Zivvy",
  description: "How Zivvy handles your data."
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="2026-07-23">
      <p>
        Zivvy is committed to protecting your data. This policy explains
        what we collect, how we use it, and how you can control it. This
        page is a placeholder — the canonical legal copy will be published
        here before public launch.
      </p>
      <h2>1. Data we collect</h2>
      <ul>
        <li>Account: name, email, company, chosen datacenter (India / EU / US)</li>
        <li>Billing: routed via Polar; card details never touch Zivvy servers</li>
        <li>Product usage: anonymous analytics via PostHog</li>
        <li>Business records: everything you create in the app (invoices, contacts, etc.)</li>
      </ul>
      <h2>2. Where data lives</h2>
      <p>
        Business data stays in the region you selected at signup. We do not
        move it across regions without your explicit action.
      </p>
      <h2>3. Sharing</h2>
      <p>
        We do not sell your data. Sub-processors are limited to hosting
        (Railway), billing (Polar), and email (Resend). Full sub-processor
        list available on request.
      </p>
      <h2>4. Your rights</h2>
      <p>
        You can export or delete your data at any time. Email{" "}
        <a href="mailto:contact@vestcodes.com">contact@vestcodes.com</a>.
      </p>
    </LegalShell>
  );
}
