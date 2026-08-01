/**
 * Server-side Frappe origin for RSC / server actions.
 *
 * Defaults to api.zivvy.xyz (the Frappe backend) — NOT zivvy.xyz (the
 * frontend). Server-side fetch to zivvy.xyz would hit the Vercel edge
 * and bounce back through Next.js rewrites, adding a full network hop.
 */
export const FRAPPE_ORIGIN =
  process.env.FRAPPE_ORIGIN ||
  process.env.NEXT_PUBLIC_FRAPPE_ORIGIN ||
  "https://api.zivvy.xyz";
