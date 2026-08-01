import type { Metadata } from "next";
import { StatementImportWizard } from "@/components/banking/statement-import-wizard";

export const metadata: Metadata = { title: "Import statement — Zivvy" };

export default function StatementImportPage() {
  return <StatementImportWizard />;
}
