import { redirect } from "next/navigation";

/** Public /roadmap was caught by the app [mod] shell → Sign in. */
export default function RoadmapRedirect() {
  redirect("/support/roadmap");
}
