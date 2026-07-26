import { redirectToModuleHome } from "@/lib/module-redirect";

interface Props {
  params: Promise<{ mod: string }>;
}

/**
 * `/[mod]` catches module roots that don't have their own folder — /crm,
 * /purchases, /shipping, /hr, /pos, /talent, /support. Explicit folders
 * (/sales, /finance, /stock) use their own page.tsx that call the same
 * helper.
 */
export default async function ModuleRoot({ params }: Props) {
  const { mod } = await params;
  redirectToModuleHome(mod);
}
