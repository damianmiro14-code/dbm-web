/** Security checks for the existing DBM admin flow. No session redesign in P199. */
const PUBLISHED_EXAMPLE_SHA256 = "7d4df948a6acf490df642d2dbfd24e5758671cdc4cb1af33de2d17dff6f0990c";
const INTERNAL_ORIGIN = "https://dbm-admin.invalid";

function sha256Hex(input: string): Promise<string> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)).then((digest) =>
    Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
  );
}

/** Reject missing, published-example and obvious placeholder admin credentials. */
export async function isSafeAdminPassword(value: string | undefined): Promise<boolean> {
  if (typeof value !== "string" || value.length < 16 || value.trim() !== value) return false;
  const normalized = value.toLowerCase().replace(/[\s_.-]+/g, "");
  if (/(?:changeme|changeit|cambiaclave|cambiacontrasena|example|ejemplo|placeholder)/.test(normalized)) return false;
  if (/^(?:admin|password|contrasena|123456|test|demo)[a-z0-9!@#$%^&*]*$/.test(normalized)) return false;
  if (new Set(value).size < 6) return false;
  return (await sha256Hex(value)) !== PUBLISHED_EXAMPLE_SHA256;
}

/** A post-login destination must stay inside /admin, never on an external site. */
export function safeAdminRedirect(input: unknown): string {
  if (typeof input !== "string" || input.length > 512 || !input.startsWith("/") ||
      input.startsWith("//") || input.includes("\\") || /[\r\n\t]/.test(input)) return "/admin";
  try {
    const url = new URL(input, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return "/admin";
    const route = url.pathname;
    if (route !== "/admin" && !route.startsWith("/admin/")) return "/admin";
    if (route === "/admin/login" || route === "/admin/logout" ||
        route.startsWith("/admin/login/") || route.startsWith("/admin/logout/")) return "/admin";
    return route + url.search;
  } catch {
    return "/admin";
  }
}
