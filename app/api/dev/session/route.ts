import { NextResponse } from "next/server";

/**
 * Dev-only route to inject a Frappe `sid` cookie on localhost:3000.
 * Refuses to run outside development. NEVER deploy this endpoint.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not available", { status: 404 });
  }

  const form = await req.formData();
  const sid = String(form.get("sid") ?? "").trim();
  const csrf = String(form.get("csrf") ?? "").trim();

  if (!sid) {
    return NextResponse.redirect(new URL("/dev/session?err=missing", req.url), 303);
  }

  const res = NextResponse.redirect(new URL("/apps", req.url), 303);
  res.cookies.set("sid", sid, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // No `secure` — this is HTTP localhost only.
  });
  if (csrf) {
    // Non-http-only so client-side fetch can read it and add X-Frappe-CSRF-Token.
    res.cookies.set("csrf_token", csrf, {
      path: "/",
      sameSite: "lax"
    });
  }
  return res;
}

export async function DELETE(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not available", { status: 404 });
  }
  const res = NextResponse.redirect(new URL("/dev/session", req.url), 303);
  res.cookies.delete("sid");
  res.cookies.delete("csrf_token");
  return res;
}
