import type { Metadata } from "next";
import { fetchBootinfo } from "@/lib/boot-server";
import { fetchTeamMembers } from "@/lib/team";
import { TeamList } from "@/components/settings/team-list";

export const metadata: Metadata = {
  title: "Team — Zivvy"
};

export default async function TeamPage() {
  const [boot, members] = await Promise.all([
    fetchBootinfo(),
    fetchTeamMembers()
  ]);

  const zivvy = boot.zivvy;

  return (
    <TeamList
      members={members}
      seatsUsed={zivvy?.seats_used ?? members.length}
      seatsAllowed={zivvy?.seats_allowed ?? 0}
      currentUser={boot.user?.name ?? ""}
    />
  );
}
