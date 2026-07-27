import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createRateLimiter } from "@/lib/rate-limit";
import { FRAPPE_ORIGIN } from "@/lib/frappe-origin";

/**
 * Rate-limited contact-form proxy.
 *
 * Sits in front of the Frappe `submit_contact` whitelisted method so we can
 * enforce per-IP throttling without adding Redis or any external dependency.
 *
 * 5 submissions per IP per 15 minutes.
 */

const limiter = createRateLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

function getClientIp(hdrs: Headers): string {
  // Vercel sets x-forwarded-for; fall back to x-real-ip, then a constant.
  const forwarded = hdrs.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return hdrs.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  const { allowed, retryAfterSeconds } = limiter(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  // Proxy the form data to Frappe.
  const body = await req.formData();

  const upstream = await fetch(
    `${FRAPPE_ORIGIN}/api/method/zivvy_brand.analytics.contact.submit_contact`,
    {
      method: "POST",
      body,
      headers: {
        // Forward cookies so Frappe can attribute the request if the user is
        // logged in, but the endpoint should work for guests too.
        cookie: hdrs.get("cookie") ?? "",
      },
    }
  );

  // Relay the upstream status and body as-is.
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
