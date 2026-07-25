import { redirect } from "next/navigation";
import { PolarReturnToast } from "@/components/billing/polar-return-toast";

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function SettingsIndexPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const polarSuccess = pickParam(params.polar_success) === "1";
  const polarCancelled = pickParam(params.polar_cancelled) === "1";
  const tier = pickParam(params.tier);
  const billing = pickParam(params.billing);

  // Polar success / cancel URLs point at `/settings?...`. Render a tiny
  // client-side helper that fires a toast and then forwards the user to the
  // real settings landing page (`/settings/team`), preserving the redirect
  // behavior of the previous server-only version.
  if (polarSuccess || polarCancelled) {
    return (
      <PolarReturnToast
        polarSuccess={polarSuccess}
        polarCancelled={polarCancelled}
        tier={tier}
        billing={billing}
        redirectTo="/settings/team"
      />
    );
  }

  redirect("/settings/team");
}
