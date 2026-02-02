"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { storageGet, storageRemove } from "@/lib/storage";

type TrackParams = Record<string, string | number | boolean | null | undefined>;

type StoredEvent = {
  ts: number;
  event: string;
  params: TrackParams;
};

const STORAGE_KEY = "dbm_analytics_events_v1";

function formatTs(ts: number): string {
  try {
    return new Date(ts).toLocaleString("es-ES", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return String(ts);
  }
}

function readEvents(): StoredEvent[] {
  try {
    const raw = storageGet(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as StoredEvent[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e) => e && typeof e.ts === "number" && typeof e.event === "string")
      .sort((a, b) => b.ts - a.ts);
  } catch {
    return [];
  }
}

function downloadTextFile(filename: string, content: string, mime: string) {
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}

function toCsv(rows: StoredEvent[]): string {
  const header = ["ts", "event", "session_id", "device", "referrer", "page_path", "service", "mode", "href", "label", "context", "kind"].join(",");
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = rows.map((r) => {
    const p = r.params || {};
    return [
      r.ts,
      r.event,
      (p as any).session_id,
      (p as any).device,
      (p as any).referrer,
      p.page_path,
      (p as any).service,
      (p as any).mode,
      (p as any).href,
      (p as any).label,
      (p as any).context,
      (p as any).kind
    ]
      .map(esc)
      .join(",");
  });

  return [header, ...lines].join("\n");
}

function pct(n: number, d: number): string {
  if (!d) return "0%";
  const v = Math.round((n / d) * 100);
  return `${v}%`;
}

export default function TrackingDashboard() {
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [q, setQ] = useState("");
  const [eventName, setEventName] = useState<"all" | string>("all");

  useEffect(() => {
    const refresh = () => setEvents(readEvents());
    refresh();
    const t = window.setInterval(refresh, 1000);
    return () => window.clearInterval(t);
  }, []);

  const eventOptions = useMemo(() => {
    const uniq = Array.from(new Set(events.map((e) => e.event))).sort();
    return ["all", ...uniq];
  }, [events]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return events.filter((e) => {
      if (eventName !== "all" && e.event !== eventName) return false;
      if (!query) return true;
      const p = e.params || {};
      const hay = [
        e.event,
        String((p as any).page_path ?? ""),
        String((p as any).href ?? ""),
        String((p as any).label ?? ""),
        String((p as any).context ?? ""),
        String((p as any).kind ?? ""),
        String((p as any).service ?? ""),
        String((p as any).mode ?? "")
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [events, q, eventName]);

  const summary = useMemo(() => {
    const total = events.length;
    let whatsappClick = 0;
    let call = 0;
    let bookingClick = 0;
    let quickOpen = 0;
    let quickSend = 0;
    let bookingOpen = 0;
    let bookingSend = 0;
    let specOpen = 0;
    let specSend = 0;

    for (const e of events) {
      if (e.event === "click_whatsapp") whatsappClick += 1;
      if (e.event === "click_call") call += 1;
      if (e.event === "click_booking") bookingClick += 1;
      if (e.event === "whatsapp_quick_open") quickOpen += 1;
      if (e.event === "whatsapp_quick_send") quickSend += 1;
      if (e.event === "booking_open") bookingOpen += 1;
      if (e.event === "booking_send") bookingSend += 1;
      if (e.event === "service_spec_open") specOpen += 1;
      if (e.event === "service_spec_send") specSend += 1;
    }
    return { total, whatsappClick, bookingClick, call, quickOpen, quickSend, bookingOpen, bookingSend, specOpen, specSend };
  }, [events]);

  const clear = () => {
    try {
      storageRemove(STORAGE_KEY);
    } catch {
      // ignore
    }
    setEvents([]);
  };

  return (
    <Container>
      <div className="py-10 md:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide opacity-70">Panel interno</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Tracking (debug)</h1>
              <p className="mt-3 max-w-2xl opacity-80">
                Lista de eventos guardados en localStorage. Útil para verificar el tracking antes de activar GA4.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-border hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Admin
              </Link>
              <Link
                href="/admin/leads"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-border hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Leads
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-border p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar (evento, url, href…)"
                  className="w-full md:w-80 rounded-xl border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                />

                <select
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full md:w-64 rounded-xl border border-border px-3 py-2 text-sm bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  {eventOptions.map((o) => (
                    <option key={o} value={o}>
                      {o === "all" ? "Todos los eventos" : o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => downloadTextFile("dbm-tracking.json", JSON.stringify(events, null, 2), "application/json")}
                >
                  Exportar JSON
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => downloadTextFile("dbm-tracking.csv", toCsv(events), "text/csv")}
                >
                  Exportar CSV
                </Button>
                <Button variant="secondary" onClick={clear}>
                  Vaciar
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs opacity-70">
              <span><strong>Total:</strong> {summary.total}</span>
              <span><strong>WhatsApp clicks:</strong> {summary.whatsappClick}</span>
              <span><strong>Quick open/send:</strong> {summary.quickOpen}/{summary.quickSend} ({pct(summary.quickSend, summary.quickOpen)})</span>
              <span><strong>Booking open/send:</strong> {summary.bookingOpen}/{summary.bookingSend} ({pct(summary.bookingSend, summary.bookingOpen)})</span>
              <span><strong>Spec open/send:</strong> {summary.specOpen}/{summary.specSend} ({pct(summary.specSend, summary.specOpen)})</span>
              <span><strong>Reservas clicks:</strong> {summary.bookingClick}</span>
              <span><strong>Llamadas:</strong> {summary.call}</span>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="min-w-[1000px] w-full text-sm">
                <thead>
                  <tr className="text-left opacity-70">
                    <th className="py-2 pr-3">Hora</th>
                    <th className="py-2 pr-3">Evento</th>
                    <th className="py-2 pr-3">Servicio</th>
                    <th className="py-2 pr-3">Modo</th>
                    <th className="py-2 pr-3">Session</th>
                    <th className="py-2 pr-3">Device</th>
                    <th className="py-2 pr-3">Referrer</th>
                    <th className="py-2 pr-3">Página</th>
                    <th className="py-2 pr-3">Href</th>
                    <th className="py-2 pr-3">Label</th>
                    <th className="py-2 pr-3">Contexto</th>
                    <th className="py-2 pr-3">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-6 opacity-70">
                        No hay eventos. Navega por la web y prueba clicks (WhatsApp/Llamar) y luego vuelve aquí.
                      </td>
                    </tr>
                  ) : (
                    filtered.slice(0, 200).map((e, idx) => {
                      const p: any = e.params || {};
                      return (
                        <tr key={`${e.ts}-${idx}`} className="border-t">
                          <td className="py-3 pr-3 whitespace-nowrap">{formatTs(e.ts)}</td>
                          <td className="py-3 pr-3 whitespace-nowrap font-medium">{e.event}</td>
                          <td className="py-3 pr-3 whitespace-nowrap opacity-90">{String(p.service ?? "")}</td>
                          <td className="py-3 pr-3 whitespace-nowrap opacity-90">{String(p.mode ?? "")}</td>
                          <td className="py-3 pr-3 whitespace-nowrap opacity-90">{String(p.session_id ?? "")}</td>
                          <td className="py-3 pr-3 whitespace-nowrap opacity-90">{String(p.device ?? "")}</td>
                          <td className="py-3 pr-3 opacity-90">{String(p.referrer ?? "")}</td>
                          <td className="py-3 pr-3 whitespace-nowrap opacity-90">{String(p.page_path ?? "")}</td>
                          <td className="py-3 pr-3 opacity-90">
                            <span className="break-all">{String(p.href ?? "")}</span>
                          </td>
                          <td className="py-3 pr-3 opacity-90">{String(p.label ?? "")}</td>
                          <td className="py-3 pr-3 opacity-90">{String(p.context ?? "")}</td>
                          <td className="py-3 pr-3 opacity-90 whitespace-nowrap">{String(p.kind ?? "")}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 200 ? (
              <p className="mt-3 text-xs opacity-70">Mostrando 200 eventos más recientes. Exporta CSV/JSON para ver todo.</p>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}
