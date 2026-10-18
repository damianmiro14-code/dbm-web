"use client";
import { COOKIE_OPEN_EVENT } from "@/lib/cookieConsent";
export default function CookieSettingsButton({ className }: { className?: string }) {
  // No tracking script configured: no optional analytics cookie preference to change.
  if (!process.env.NEXT_PUBLIC_GA_ID) return null;
  return <button type="button" className={className || "underline"} onClick={() => window.dispatchEvent(new Event(COOKIE_OPEN_EVENT))}>Configurar cookies</button>;
}
