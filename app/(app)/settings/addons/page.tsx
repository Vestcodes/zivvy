import type { Metadata } from "next";
import { fetchBootinfo } from "@/lib/boot-server";
import { AddonsManager } from "@/components/settings/addons-manager";

export const metadata: Metadata = {
  title: "Add-ons — Zivvy"
};

export default async function AddonsPage() {
  const boot = await fetchBootinfo();
  const zivvy = boot.zivvy;

  return (
    <AddonsManager
      tenant={zivvy?.tenant?.name ?? ""}
      currentUser={boot.user?.name ?? ""}
    />
  );
}
