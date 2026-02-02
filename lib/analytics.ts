"use client";

// Client-side analytics helpers.
//
// - If NEXT_PUBLIC_GA_ID is configured, events are sent to Google Analytics (gtag).
// - Regardless of GA, events are kept (recently) in browser storage for debugging.

import { storageGet, storageSet, storageRemove } from "@/lib/storage";

export type TrackParams = Record<string, string | number | boolean | null | undefined>;

type StoredEvent = {
  ts: number;
  event: string;
  params: TrackParams;
};

const STORAGE_KEY = "dbm_analytics_events_v1";
const SESSION_KEY = "dbm_analytics_session_id_v1";
// Keep enough events for meaningful debugging without unbounded growth.
const MAX_EVENTS = 500;

function safeGetPath(): string {
  try {
    return window.location.pathname || "/";
  } catch {
    return "/";
  }
}

function safeGetReferrer(): string {
  try {
    const r = document.referrer || "";
    return r.slice(0, 200);
  } catch {
    return "";
  }
}

function safeGetDevice(): string {
  try {
    const w = window.innerWidth || 1024;
    const ua = (navigator.userAgent || "").toLowerCase();
    const isMobileUA = /iphone|android|mobile|ipad|ipod/.test(ua);
    const isMobile = isMobileUA || w < 768;
    return isMobile ? "mobile" : "desktop";
  } catch {
    return "desktop";
  }
}

function randomId(): string {
  try {
    const c = (globalThis as any).crypto;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
  } catch {
    // ignore
  }
  // Fallback: not cryptographically strong, but good enough for session stitching.
  return `s_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function getSessionId(): string {
  try {
    const existing = storageGet(SESSION_KEY);
    if (existing) return existing;
    const id = randomId();
    storageSet(SESSION_KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

function safeStore(event: string, params: TrackParams) {
  try {
    const existing = storageGet(STORAGE_KEY);
    const arr: StoredEvent[] = existing ? (JSON.parse(existing) as StoredEvent[]) : [];
    arr.push({ ts: Date.now(), event, params });
    storageSet(STORAGE_KEY, JSON.stringify(arr.slice(-MAX_EVENTS)));
  } catch {
    // ignore
  }
}

export function clearTrackingStore() {
  try {
    storageRemove(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function track(event: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;

  const payload: TrackParams = {
    session_id: getSessionId(),
    page_path: safeGetPath(),
    referrer: safeGetReferrer(),
    device: safeGetDevice(),
    ...params
  };

  safeStore(event, payload);

  try {
    const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
    if (typeof gtag === "function") {
      gtag("event", event, payload);
    }
  } catch {
    // ignore
  }
}

// Page views are handled via gtag('config', GA_ID, { page_path }) in the Analytics component.
// Here we only keep a local breadcrumb for debugging.
export function trackPageView(pathname: string) {
  if (typeof window === "undefined") return;
  safeStore("page_view", { session_id: getSessionId(), page_path: pathname, referrer: safeGetReferrer(), device: safeGetDevice() });
}

function normalizeLabel(label?: string) {
  return (label || "").trim().slice(0, 80);
}

export function classifyHref(href: string): { event: string; kind: string } {
  const h = href.trim();
  const low = h.toLowerCase();

  if (low.startsWith("tel:")) return { event: "click_call", kind: "tel" };
  if (low.startsWith("mailto:")) return { event: "click_email", kind: "mailto" };

  if (low.startsWith("https://wa.me/") || low.startsWith("http://wa.me/") || low.includes("whatsapp")) {
    return { event: "click_whatsapp", kind: "whatsapp" };
  }

  if (low.includes("maps") || low.includes("google.com/maps") || low.includes("maps.app")) {
    return { event: "click_maps", kind: "maps" };
  }

  if (h.startsWith("/presupuesto")) return { event: "click_presupuesto", kind: "internal" };
  if (h.startsWith("/")) return { event: "click_internal_link", kind: "internal" };

  if (/^https?:\/\//i.test(h)) return { event: "click_external_link", kind: "external" };

  return { event: "click_link", kind: "unknown" };
}

export function trackLinkClick(opts: { href: string; label?: string; context?: string }) {
  if (typeof window === "undefined") return;
  const { href, label, context } = opts;
  const c = classifyHref(href);

  const lbl = normalizeLabel(label);
  const ctx = normalizeLabel(context);

  // Split key conversion intents so they are easy to filter in /admin/tracking.
  // Reserve visit CTAs are WhatsApp links too, but we want a dedicated event.
  let event = c.event;
  let kind = c.kind;
  if (c.event === "click_whatsapp") {
    const low = `${lbl} ${ctx}`.toLowerCase();
    if (/(reserv|visita|cita)/.test(low)) {
      event = "click_booking";
      kind = "booking_whatsapp";
    }
  }

  track(event, {
    href,
    kind,
    label: lbl,
    context: ctx
  });
}
