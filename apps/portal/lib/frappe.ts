export class FrappeError extends Error {
  status: number;
  serverMessages: string[];
  constructor(status: number, message: string, serverMessages: string[] = []) {
    super(message);
    this.status = status;
    this.serverMessages = serverMessages;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
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
    "X-Requested-With": "XMLHttpRequest",
  };
  if (csrf) headers["X-Frappe-CSRF-Token"] = csrf;

  const res = await fetch(`/api/method/${method}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: params.toString(),
  });

  const contentType = res.headers.get("content-type") ?? "";
  let json: { message?: T; _server_messages?: string } | null = null;
  if (contentType.includes("application/json")) {
    json = await res.json();
  }

  if (!res.ok) {
    const msgs = parseServerMessages(json?._server_messages);
    throw new FrappeError(res.status, msgs[0] ?? `Request failed (${res.status})`, msgs);
  }

  return (json?.message ?? (json as unknown as T)) as T;
}

function parseServerMessages(raw?: string): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as string[];
    return arr.map((s) => {
      try {
        return (JSON.parse(s) as { message?: string }).message ?? s;
      } catch {
        return s;
      }
    });
  } catch {
    return [];
  }
}

export async function frappeLogin(usr: string, pwd: string) {
  return frappeCall<{ message: string; home_page?: string; full_name?: string }>(
    "login",
    { usr, pwd }
  );
}

export async function frappeLogout() {
  return frappeCall("logout");
}

export async function frappeLoggedUser() {
  return frappeCall<string>("frappe.auth.get_logged_user");
}
