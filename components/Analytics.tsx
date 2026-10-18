"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import CookieConsent from "@/components/CookieConsent";
import { COOKIE_CHANGED_EVENT, CookieDecision, clearGoogleAnalyticsCookies, getCookieDecision } from "@/lib/cookieConsent";
import { trackPageView } from "@/lib/analytics";
import { purgeLegacyDrafts } from "@/lib/sessionDraft";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
type GoogleWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<CookieDecision | null>(null);

  useEffect(() => {
    purgeLegacyDrafts();
    const refresh = () => {
      const next = getCookieDecision();
      setConsent(next);
      if (next !== "accepted") clearGoogleAnalyticsCookies();
    };
    refresh();
    window.addEventListener(COOKIE_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(COOKIE_CHANGED_EVENT, refresh);
  }, []);

  useEffect(() => {
    if (consent !== "accepted" || !GA_ID) return;
    const path = pathname || "/";
    trackPageView(path);
    // Queue events locally until Google's script is loaded. The script is absent before consent.
    const w = window as GoogleWindow;
    w.dataLayer = w.dataLayer || [];
    if (typeof w.gtag !== "function") w.gtag = (...args: unknown[]) => { w.dataLayer?.push(args); };
    w.gtag("js", new Date());
    w.gtag("config", GA_ID, {
      page_path: path,
      page_location: window.location.origin + path,
      page_referrer: (() => { try { return document.referrer ? new URL(document.referrer).origin : ""; } catch { return ""; } })()
    });
  }, [pathname, consent]);

  return (
    <>
      <CookieConsent analyticsEnabled={Boolean(GA_ID)} />
      {GA_ID && consent === "accepted" ? <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`} strategy="afterInteractive" /> : null}
    </>
  );
}
