import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/site/marketing/legal-shell";
import { makeMetadata } from "@/lib/seo";

export const metadata: Metadata = makeMetadata({
  title: "Data Processing",
  description:
    "Summary of how Zivvy processes Customer Data as a service provider, including regions and subprocessors.",
  canonicalPath: "/dpa"
});

export default function DpaPage() {
  return (
    <LegalShell
      title="Data Processing Summary (DPA)"
      updated="2026-07-24"
      summary="A plain-language summary of how Zivvy processes Customer Data. Request a signed DPA when your procurement process needs one."
    >
      <p>
        This page summarizes how <strong>Zivvy</strong> processes personal data contained in
        Customer Data on behalf of customer organizations. It is not a substitute for a negotiated
        Data Processing Addendum (DPA). If you need a signed DPA for GDPR, similar laws, or vendor
        review, email <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>.
      </p>
      <p>
        Related: <Link href="/privacy">Privacy Policy</Link>, <Link href="/security">Security</Link>
        , <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>1. Roles</h2>
      <ul>
        <li>
          <strong>Customer (controller)</strong>: your organization decides why and how Customer
          Data is processed in Zivvy (CRM records, invoices, employees, inventory, etc.).
        </li>
        <li>
          <strong>Zivvy (processor / service provider)</strong>: we process Customer Data only to
          provide, secure, support, and improve the service under your instructions (including
          configuration you set in-product).
        </li>
      </ul>

      <h2>2. Nature and purpose of processing</h2>
      <p>
        Processing includes hosting, storage, retrieval, transmission, backup, logging, and support
        access as needed to operate multi-module ERP workflows (sales, stock, finance, HR,
        manufacturing, and related modules enabled on your plan).
      </p>

      <h2>3. Categories of data and data subjects</h2>
      <p>
        Categories depend on what you enter into Zivvy. Typical examples: contact and customer
        records; order and invoice data; inventory movements; employee/HR fields if you use those
        modules; user account identifiers for your teammates. Data subjects may include your
        employees, customers, suppliers, and other business contacts.
      </p>
      <p>
        You should not upload special-category data unless your plan, configuration, and legal basis
        allow it and you have assessed the risk.
      </p>

      <h2>4. Region and location of processing</h2>
      <p>
        Cloud workspaces are <strong>region-pinned</strong>. At signup you choose India, EU, or US;
        Customer Data for that workspace is hosted in the selected region and is not moved across
        regions without your explicit action. Limited operational metadata (authentication, billing
        identifiers via Polar, transactional email) may involve subprocessors outside the primary
        region under contract.
      </p>

      <h2>5. Subprocessors</h2>
      <p>
        We use infrastructure and service providers under written agreements. Material categories
        include: regional hosting, email delivery, monitoring, and{" "}
        <strong>Polar</strong> for subscription billing (Polar primarily processes account/billing
        data, not your full ERP Customer Data store). A current list is available on request from{" "}
        <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a>.
      </p>

      <h2>6. Security measures</h2>
      <p>
        We apply administrative, technical, and organizational measures appropriate to the risk —
        including encryption in transit, access controls, tenant isolation, and operational
        monitoring. See <Link href="/security">Security</Link> for a product-oriented overview. We
        do not claim certifications on this page that we have not completed.
      </p>

      <h2>7. Assistance with rights and incidents</h2>
      <p>
        We will reasonably assist with data subject requests that relate to Customer Data we
        process, typically by enabling admin tools or supporting your investigation. Suspected
        personal-data breaches affecting Customer Data will be communicated to your organization
        without undue delay once we become aware, with information reasonably available at the
        time.
      </p>

      <h2>8. Return and deletion</h2>
      <p>
        During an active subscription you may export data using product tools or by requesting help
        from support. After termination or written request, we will delete or return Customer Data
        within a commercially reasonable period, except for backups retained for a limited time and
        records we must keep by law or for billing disputes.
      </p>

      <h2>9. Self-hosted Business deployments</h2>
      <p>
        If you self-host on the Business plan, you typically control the hosting environment. In
        that case, Zivvy’s processor obligations for cloud hosting may not apply to infrastructure
        you operate; license and support terms still apply. Clarify roles in your order or DPA.
      </p>

      <h2>10. Request a signed DPA</h2>
      <p>
        Email <a href="mailto:support@zivvy.xyz">support@zivvy.xyz</a> with your company name,
        primary contact, chosen data region, and any required template. We will work with
        reasonable, industry-standard DPA language.
      </p>
    </LegalShell>
  );
}
