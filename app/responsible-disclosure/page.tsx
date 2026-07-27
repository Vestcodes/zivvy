import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/marketing/legal-shell";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Responsible Disclosure",
  description:
    "Report security vulnerabilities in Zivvy responsibly. Scope, process, timelines, and safe-harbor commitment.",
  canonicalPath: "/responsible-disclosure"
});

export default function ResponsibleDisclosurePage() {
  return (
    <LegalShell
      title="Responsible Disclosure Policy"
      updated="2026-07-27"
      summary="How to report security vulnerabilities in Zivvy, what to expect, and our commitment to researchers who act in good faith."
    >
      <p>
        The security of our users and their data is a top priority. We welcome
        responsible disclosure of vulnerabilities from independent security
        researchers. This policy describes how to report issues, what to expect
        from us, and our safe-harbor commitment to researchers who follow this
        process.
      </p>
      <p>
        Related:{" "}
        <Link href="/security">Security</Link>,{" "}
        <Link href="/privacy">Privacy Policy</Link>,{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>1. How to report</h2>
      <p>
        Email{" "}
        <a href="mailto:security@zivvy.xyz">security@zivvy.xyz</a>{" "}
        with a description of the vulnerability. Please include:
      </p>
      <ul>
        <li>A clear description of the issue and its potential impact</li>
        <li>Steps to reproduce, including URLs, parameters, or payloads</li>
        <li>Screenshots or proof-of-concept code where applicable</li>
        <li>Your preferred contact information for follow-up</li>
      </ul>
      <p>
        Encrypt your report with our PGP key if you prefer (available on
        request). Do not report vulnerabilities through public channels such as
        GitHub issues, social media, or forums.
      </p>

      <h2>2. What to expect</h2>
      <ul>
        <li>
          <strong>Acknowledgment</strong> — we will confirm receipt of your
          report within <strong>48 hours</strong>.
        </li>
        <li>
          <strong>Assessment</strong> — we will triage and assess the severity
          within <strong>5 business days</strong> of acknowledgment.
        </li>
        <li>
          <strong>Updates</strong> — we will keep you informed of our progress
          toward a fix and notify you when the issue is resolved.
        </li>
        <li>
          <strong>Credit</strong> — with your permission, we will publicly
          acknowledge your contribution once the fix is deployed.
        </li>
      </ul>

      <h2>3. What is in scope</h2>
      <ul>
        <li>The Zivvy web application at <strong>*.zivvy.xyz</strong></li>
        <li>Authentication, session management, and access-control flaws</li>
        <li>Injection vulnerabilities (SQL, XSS, CSRF, SSRF, command injection)</li>
        <li>Data exposure or tenant-isolation bypass</li>
        <li>API authentication and authorization issues</li>
        <li>Cryptographic weaknesses in data-at-rest or data-in-transit</li>
        <li>Privilege escalation between user roles or tenants</li>
      </ul>

      <h2>4. What is out of scope</h2>
      <ul>
        <li>Social engineering, phishing, or physical attacks against Zivvy staff or infrastructure</li>
        <li>Denial-of-service (DoS / DDoS) attacks</li>
        <li>Automated scanning or brute-force activity that degrades service availability</li>
        <li>Vulnerabilities in third-party services, libraries, or dependencies not maintained by Zivvy</li>
        <li>Reports based solely on software version banners without a demonstrated exploit</li>
        <li>Missing security headers or best-practice recommendations without a demonstrated impact</li>
        <li>Content spoofing or text injection without a realistic attack scenario</li>
      </ul>

      <h2>5. Rules of engagement</h2>
      <p>When testing, please:</p>
      <ul>
        <li>Only interact with accounts you own or have explicit permission to test</li>
        <li>Do not access, modify, or delete data belonging to other users</li>
        <li>Do not degrade the availability or performance of Zivvy services</li>
        <li>Stop testing and report immediately if you encounter user data outside your own account</li>
        <li>Keep vulnerability details confidential until we confirm the issue is resolved</li>
      </ul>

      <h2>6. Safe harbor</h2>
      <p>
        If you discover and report a vulnerability in accordance with this
        policy, Zivvy commits to:
      </p>
      <ul>
        <li>Not pursuing legal action against you for security research conducted in good faith</li>
        <li>
          Working with you to understand and resolve the issue before any public
          disclosure
        </li>
        <li>
          Treating your report as authorized conduct under our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/acceptable-use">Acceptable Use Policy</Link>, provided
          you comply with this disclosure policy
        </li>
      </ul>
      <p>
        This safe harbor does not extend to activity that violates applicable
        law, compromises the privacy or safety of Zivvy users, or causes damage
        to Zivvy systems beyond what is necessary to demonstrate the
        vulnerability.
      </p>

      <h2>7. Contact</h2>
      <p>
        Security reports:{" "}
        <a href="mailto:security@zivvy.xyz">security@zivvy.xyz</a>
        <br />
        General support:{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>
      </p>
    </LegalShell>
  );
}
