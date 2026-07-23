import type { Metadata } from "next";
import { LegalShell } from "@/components/site/legal-shell";

export const metadata: Metadata = {
  title: "Cookie Policy — Zivvy",
  description: "How Zivvy uses cookies."
};

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" updated="2026-07-23">
      <p>
        Zivvy uses a minimal set of cookies to operate the product and keep
        you signed in. This page is a placeholder — the canonical legal
        copy will be published here before public launch.
      </p>
      <h2>Essential</h2>
      <ul>
        <li><code>sid</code> — your Zivvy session (HTTP-only, secure)</li>
        <li><code>csrf_token</code> — protects against forged writes</li>
        <li><code>system_user</code>, <code>user_id</code>, <code>full_name</code> — UI hydration</li>
      </ul>
      <h2>Analytics</h2>
      <p>
        We use PostHog for anonymous product analytics. You can opt out via
        our cookie banner or your browser's Do Not Track setting.
      </p>
      <h2>No third-party ad cookies</h2>
      <p>Zivvy does not run ads. We do not set marketing or ad cookies.</p>
    </LegalShell>
  );
}
