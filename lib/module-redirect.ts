import { redirect, notFound } from "next/navigation";
import { MODULE_NAVS } from "@/components/app/sidebar-nav";

/**
 * Shared helper for module-root landing pages. Redirects to the first item
 * in the module's registered sidebar (`MODULE_NAVS[<moduleKey>]`) so links
 * like /sales, /crm, /purchases resolve instead of 404-ing. Falls through
 * to notFound() if the module key isn't registered.
 */
export function redirectToModuleHome(moduleKey: string): never {
  const nav = MODULE_NAVS[moduleKey];
  if (!nav || nav.items.length === 0) {
    notFound();
  }
  redirect(nav.items[0].href);
}
