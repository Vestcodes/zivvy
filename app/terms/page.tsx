import type { Metadata } from "next";
import { LegalShell } from "@/components/site/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Service — Zivvy",
  description: "The terms governing your use of Zivvy."
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="2026-07-23">
      <p>
        Welcome to Zivvy. By using our service, you agree to these terms.
        Please read them carefully. This page is a placeholder — the
        canonical legal copy will be published here before public launch.
      </p>
      <h2>1. Service</h2>
      <p>
        Zivvy is provided by Vestcodes Co (India). Your use of Zivvy is
        subject to the seat-based subscription you choose at
        <a href="/pricing"> Pricing</a>.
      </p>
      <h2>2. Data</h2>
      <p>
        You choose your data region at signup (India, EU, or US). Your data
        stays in the region you pick. See our <a href="/privacy">Privacy Policy</a>.
      </p>
      <h2>3. Billing</h2>
      <p>
        Billing is processed by Polar. Charges are monthly per seat.
        Cancel anytime; access continues to the end of the paid period.
      </p>
      <h2>4. Acceptable use</h2>
      <p>
        See our <a href="/acceptable-use">Acceptable Use Policy</a> for
        specifics on what's allowed on Zivvy.
      </p>
      <h2>5. Contact</h2>
      <p>
        Questions: <a href="mailto:contact@vestcodes.com">contact@vestcodes.com</a>.
      </p>
    </LegalShell>
  );
}
