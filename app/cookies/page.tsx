import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/marketing/legal-shell";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Cookie Policy for Zivvy ERP and Website",
  description:
    "Learn how Zivvy uses cookies and similar technologies on the website and ERP product. Understand cookie types, consent options and how to manage preferences.",
  canonicalPath: "/cookies"
});

export default function CookiesPage() {
  return (
    <LegalShell
      title="Cookie Policy"
      updated="2026-07-24"
      summary="Zivvy uses a minimal set of cookies to keep you signed in, protect the product, and — only if you allow — understand aggregate usage."
    >
      <p>
        This Cookie Policy explains how <strong>Zivvy</strong> uses cookies and similar
        technologies on Zivvy websites, login pages, and the product interface. See also our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device. We may also use localStorage for
        lightweight preferences such as cookie consent choices.
      </p>

      <h2>2. Types we use</h2>
      <h3>Strictly necessary</h3>
      <p>
        Required for the service to function — authentication, CSRF protection, security, and
        routing. Blocking these may prevent login or core features.
      </p>
      <ul>
        <li>
          <code>sid</code> — your Zivvy session (HTTP-only, secure where configured)
        </li>
        <li>
          <code>csrf_token</code> — protects against forged writes
        </li>
        <li>
          <code>system_user</code>, <code>user_id</code>, <code>full_name</code> — UI hydration
          after login
        </li>
      </ul>

      <h3>Preferences</h3>
      <p>
        Remember cookie consent and similar UI choices (often stored in localStorage, for example
        under a key such as <code>zivvy_cookie_consent</code>).
      </p>

      <h3>Analytics (optional)</h3>
      <p>
        When product analytics is enabled for a deployment (for example PostHog), we use it to
        understand aggregate product and marketing usage. Optional analytics should load only after
        you accept non-essential cookies, or remain off if you choose essential-only / opt out.
      </p>

      <h2>3. Consent</h2>
      <p>
        Where required, we present a consent choice for optional cookies. You can accept optional
        analytics or continue with essential-only. Clearing site data in your browser resets the
        choice. We do not run third-party advertising cookies.
      </p>

      <h2>4. Domain</h2>
      <p>
        Production cookies and sessions for Zivvy are scoped to{" "}
        <strong>zivvy.xyz</strong> (and optionally <code>.zivvy.xyz</code> when sharing across
        subdomains). Prefer the apex host{" "}
        <Link href="https://zivvy.xyz">https://zivvy.xyz</Link>.
      </p>

      <h2>5. Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies via settings. Blocking strictly necessary
        cookies may prevent login or core features from working. You can also email{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a> with privacy questions.
      </p>

      <h2>6. Third parties</h2>
      <p>
        Billing flows may redirect you to <strong>Polar</strong> (polar.sh), which sets its own
        cookies under Polar’s policies. We do not control third-party cookies on external domains.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions: <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>
      </p>
    </LegalShell>
  );
}
