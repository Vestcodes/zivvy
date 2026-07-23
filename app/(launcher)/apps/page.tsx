import type { Metadata } from "next";
import { AppLauncher } from "@/components/app/app-launcher";

export const metadata: Metadata = { title: "Apps — Zivvy" };

export default function AppsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <AppLauncher />
    </div>
  );
}
