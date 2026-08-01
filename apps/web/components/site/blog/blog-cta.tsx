import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/ui/shine-border";
import type { BlogLink } from "@/lib/blog";

type Props = {
  primary: BlogLink;
  secondary?: BlogLink;
  title?: string;
  description?: string;
};

export function BlogCta({
  primary,
  secondary = { label: "See pricing", href: "/pricing" },
  title = "Put this playbook into a real workspace",
  description = "Start free, watch the product tour, or ask support@zivvy.xyz about migration and region-pinned data."
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
      <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild variant="polished">
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={secondary.href}>{secondary.label}</Link>
        </Button>
      </div>
    </div>
  );
}
