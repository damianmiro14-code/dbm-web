"use client";

import { useEffect, useState } from "react";
import { COOKIE_OPEN_EVENT, CookieDecision, clearGoogleAnalyticsCookies, getCookieDecision, saveCookieDecision } from "@/lib/cookieConsent";

export default function CookieConsent({ analyticsEnabled }: { analyticsEnabled: boolean }) {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<CookieDecision | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setChoice(getCookieDecision());
    setReady(true);
    const open = () => { setError(false); setEditing(true); };
    window.addEventListener(COOKIE_OPEN_EVENT, open);
    return () => window.removeEventListener(COOKIE_OPEN_EVENT, open);
  }, []);

  if (!analyticsEnabled || !ready || (choice !== null && !editing)) return null;

  function select(value: CookieDecision) {
    const old = getCookieDecision();
    if (!saveCookieDecision(value)) {
      setError(true);
      return; // Fail-closed: do not load optional analytics without stored consent.
    }
    setChoice(value);
    setEditing(false);
    setError(false);
    if (value === "rejected") clearGoogleAnalyticsCookies();
    // A script already loaded cannot be undone; reload without it after withdrawal.
    if (old === "accepted" && value === "rejected") window.location.reload();
  }

  return (
    <div role="dialog" aria-modal="false" aria-label="Preferencias de cookies" className="fixed inset-x-0 bottom-0 z-[210] border-t border-slate-300 bg-white p-4 text-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.18)] sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-base font-semibold">Privacidad y analítica</h2>
          <p className="mt-1 text-sm leading-6">Las cookies analíticas de Google son opcionales. Solo se activan si las aceptas. Rechazarlas no limita el uso de la web ni el contacto por WhatsApp. Puedes cambiar tu decisión desde el pie de página. <a className="underline underline-offset-2" href="/cookies">Más información</a>.</p>
          {error ? <p role="alert" className="mt-1 text-xs text-red-700">No ha sido posible guardar la decisión. La analítica continuará desactivada.</p> : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button type="button" onClick={() => select("rejected")} className="min-h-11 rounded-lg border-2 border-slate-800 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2">Rechazar analítica</button>
          <button type="button" onClick={() => select("accepted")} className="min-h-11 rounded-lg border-2 border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2">Aceptar analítica</button>
        </div>
      </div>
    </div>
  );
}
