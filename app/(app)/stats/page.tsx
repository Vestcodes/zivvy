import { redirect } from "next/navigation";

/**
 * /stats is a workspace tile alias for the Insights dashboards route.
 * Kept as a Next.js redirect so any existing bookmarks / launcher entries
 * pointing at /stats resolve cleanly to the real landing page.
 */
export default function StatsRedirect() {
  redirect("/insights/dashboards");
}
