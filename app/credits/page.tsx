import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/legal-shell";

export const metadata: Metadata = {
  title: "Credits & attribution — Zivvy",
  description:
    "Zivvy is built on open-source foundations. Full attribution and license notices."
};

export default function CreditsPage() {
  return (
    <LegalShell title="Credits & attribution" updated="2026-07-23">
      <p>
        Zivvy stands on the shoulders of a lot of open-source work. Full
        credit and license notices below.
      </p>

      <h2>ERP core</h2>
      <p>
        Zivvy is packaged on top of{" "}
        <Link href="https://frappeframework.com" target="_blank" rel="noopener noreferrer">
          Frappe Framework
        </Link>{" "}
        and{" "}
        <Link href="https://frappe.io/erpnext" target="_blank" rel="noopener noreferrer">
          ERPNext
        </Link>
        , both © Frappe Technologies Pvt. Ltd., licensed under GPLv3.
      </p>
      <p>
        The Zivvy web product is a separate frontend and SaaS packaging;
        it does not claim ownership of the ERPNext trademark. See the
        upstream{" "}
        <Link href="https://github.com/frappe/erpnext/blob/develop/TRADEMARK_POLICY.md" target="_blank" rel="noopener noreferrer">
          ERPNext trademark policy
        </Link>{" "}
        for details.
      </p>

      <h2>Add-on Frappe apps</h2>
      <ul>
        <li>HR &amp; Payroll — <em>hrms</em> app, GPLv3</li>
        <li>Shipping integrations — <em>erpnext-shipping</em> app, GPLv3</li>
        <li>Banking / EBICS — ALYF <em>banking</em> app</li>
      </ul>

      <h2>Frontend</h2>
      <ul>
        <li>Next.js — MIT</li>
        <li>React — MIT</li>
        <li>Tailwind CSS — MIT</li>
        <li>shadcn/ui — MIT</li>
        <li>Radix UI — MIT</li>
        <li>Lucide icons — ISC</li>
        <li>Inter typeface by Rasmus Andersson — SIL Open Font License</li>
        <li>JetBrains Mono — SIL Open Font License</li>
      </ul>

      <h2>Services</h2>
      <ul>
        <li>Polar — subscriptions &amp; checkout</li>
        <li>Resend — transactional email</li>
        <li>Railway — backend hosting</li>
        <li>Vercel — frontend hosting</li>
      </ul>

      <h2>Zivvy source</h2>
      <p>
        Zivvy&apos;s product code is © Vestcodes Co, India. Modified upstream
        source is available on request as required by GPLv3 — email{" "}
        <a href="mailto:contact@vestcodes.com">contact@vestcodes.com</a>.
      </p>
    </LegalShell>
  );
}
