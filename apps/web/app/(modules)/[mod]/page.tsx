import type { Metadata } from "next";
import { ModuleHome } from "@/components/modules/module-home";
import { MODULE_NAVS } from "@/components/app/sidebar-nav";

interface Props {
  params: Promise<{ mod: string }>;
}

/**
 * `/[mod]` catches module roots that don't have their own folder — /crm,
 * /purchases, /shipping, /hr, /pos, /talent, /support. Explicit folders
 * (/sales, /finance, /stock) use their own page.tsx that call the same
 * helper.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mod } = await params;
  return { title: `${MODULE_NAVS[mod]?.title ?? "Workspace"} — Zivvy` };
}

export default async function ModuleRoot({ params }: Props) {
  const { mod } = await params;
  return <ModuleHome moduleKey={mod} />;
}
