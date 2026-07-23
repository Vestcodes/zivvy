/**
 * Minimal Frappe RPC helper for the Next.js frontend.
 * All calls are same-origin (rewrites in next.config.mjs forward /api/* to Frappe).
 */

export type FrappeResponse<T = unknown> = {
  message?: T;
  exc_type?: string;
  _server_messages?: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function parseServerMessages(raw?: string): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as string[];
    return arr.map((s) => {
      try {
        const parsed = JSON.parse(s) as { message?: string };
        return parsed.message ?? s;
      } catch {
        return s;
      }
    });
  } catch {
    return [];
  }
}

export class FrappeError extends Error {
  status: number;
  serverMessages: string[];
  constructor(status: number, message: string, serverMessages: string[] = []) {
    super(message);
    this.status = status;
    this.serverMessages = serverMessages;
  }
}

export async function frappeCall<T = unknown>(
  method: string,
  body?: Record<string, string | number | boolean | null | undefined>
): Promise<T> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body ?? {})) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }

  const csrf = readCookie("csrf_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (csrf) headers["X-Frappe-CSRF-Token"] = csrf;

  const res = await fetch(`/api/method/${method}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: params.toString()
  });

  const contentType = res.headers.get("content-type") ?? "";
  let json: FrappeResponse<T> | null = null;
  if (contentType.includes("application/json")) {
    json = (await res.json()) as FrappeResponse<T>;
  }

  if (!res.ok) {
    const serverMessages = parseServerMessages(json?._server_messages);
    const msg = serverMessages[0] ?? `Request failed (${res.status})`;
    throw new FrappeError(res.status, msg, serverMessages);
  }

  return (json?.message ?? (json as unknown as T)) as T;
}

export async function frappeLogin(usr: string, pwd: string) {
  return frappeCall<{ message: string; home_page?: string; full_name?: string }>(
    "login",
    { usr, pwd }
  );
}

export async function frappeSignup(payload: {
  email: string;
  full_name: string;
  zivvy_datacenter: "india" | "eu" | "us";
  company_name?: string;
  redirect_to?: string;
}) {
  return frappeCall<[number, string]>(
    "zivvy_brand.auth.signup.sign_up",
    payload
  );
}

export async function frappeSendLoginLink(email: string) {
  return frappeCall("frappe.www.login.send_login_link", { email });
}

export async function frappeResetPassword(email: string) {
  return frappeCall("frappe.core.doctype.user.user.reset_password", {
    user: email
  });
}

export async function frappeLoggedUser() {
  return frappeCall<string>("frappe.auth.get_logged_user");
}

export async function frappeUpdatePassword(key: string, newPassword: string) {
  return frappeCall("frappe.core.doctype.user.user.update_password", {
    new_password: newPassword,
    key
  });
}

export async function frappeLogout() {
  return frappeCall("logout");
}
