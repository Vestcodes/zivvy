import type { Metadata } from "next";
import { fetchBootinfo } from "@/lib/boot-server";
import { DeveloperSettings } from "@/components/settings/developer-settings";

export const metadata: Metadata = {
  title: "Developer — Zivvy"
};

export default async function DeveloperPage() {
  const boot = await fetchBootinfo();
  const zivvy = boot.zivvy;

  return (
    <DeveloperSettings
      tenant={zivvy?.tenant?.name ?? ""}
      tier={zivvy?.tier ?? "free"}
      currentUser={boot.user?.name ?? ""}
    />
  );
}
