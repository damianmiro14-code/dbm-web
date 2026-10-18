"use client";

export type CookieDecision = "accepted" | "rejected";
export const COOKIE_CHOICE_KEY = "dbm_cookie_analytics_consent_v1";
export const COOKIE_CHANGED_EVENT = "dbm:cookie-consent-changed";
export const COOKIE_OPEN_EVENT = "dbm:cookie-consent-open";

export function getCookieDecision(): CookieDecision | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(COOKIE_CHOICE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch { return null; }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieDecision() === "accepted";
}

export function saveCookieDecision(choice: CookieDecision): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(COOKIE_CHOICE_KEY, choice);
    window.dispatchEvent(new Event(COOKIE_CHANGED_EVENT));
    return true;
  } catch { return false; }
}

/** Best effort: remove first-party _ga cookies when consent is withdrawn. */
export function clearGoogleAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  try {
    const host = window.location.hostname;
    for (const item of document.cookie.split(";")) {
      const key = item.trim().split("=")[0];
      if (key !== "_ga" && !key.startsWith("_ga_")) continue;
      const encoded = encodeURIComponent(key);
      const expire = `${encoded}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      document.cookie = expire;
      if (host.includes(".")) document.cookie = `${expire}; domain=.${host}`;
    }
  } catch { /* Cookies may be unavailable */ }
}
