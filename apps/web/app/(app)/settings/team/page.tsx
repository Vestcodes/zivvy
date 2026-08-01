import type { Metadata } from "next";
import { fetchBootinfo } from "@/lib/boot-server";
import { fetchTeamMembers } from "@/lib/team";
import { TeamList } from "@/components/settings/team-list";

export const metadata: Metadata = {
  title: "Team — Zivvy"
};

export default async function TeamPage() {
  const boot = await fetchBootinfo();
  const zivvy = boot.zivvy;
  const members = await fetchTeamMembers(zivvy?.tenant?.name ?? null);

  const hasSubscription = Boolean(
    zivvy?.tenant?.polar_subscription_id ||
      (zivvy?.subscription_status &&
        ["active", "trialing", "past_due"].includes(zivvy.subscription_status))
  );

  return (
    <TeamList
      members={members}
      seatsUsed={zivvy?.seats_used ?? members.length}
      seatsAllowed={zivvy?.seats_allowed ?? 0}
      currentUser={boot.user?.name ?? ""}
      hasSubscription={hasSubscription}
    />
  );
}
