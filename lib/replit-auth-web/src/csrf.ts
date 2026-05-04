const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

function getCsrfCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Drop-in replacement for fetch() that automatically attaches the CSRF token
 * header on state-changing requests (non-GET/HEAD/OPTIONS).
 */
export async function csrfFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const isMutating = !["GET", "HEAD", "OPTIONS"].includes(method);

  if (isMutating) {
    let token = getCsrfCookie();
    // Bootstrap token if cookie not yet set
    if (!token) {
      await fetch("/api/auth/csrf", { credentials: "include" });
      token = getCsrfCookie();
    }
    init = {
      ...init,
      headers: {
        [CSRF_HEADER]: token,
        ...init.headers,
      },
      credentials: "include",
    };
  } else {
    init = { ...init, credentials: "include" };
  }

  return fetch(url, init);
}
