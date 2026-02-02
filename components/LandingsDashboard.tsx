"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export type LandingRow = {
  location: string;
  locationLabel: string;
  service: string;
  serviceLabel: string;
  path: string; // e.g. /borriol/puertas-rejas-cerramientos
};

function clean(s: string): string {
  return s.trim().toLowerCase();
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function LandingsDashboard({ rows }: { rows: LandingRow[] }) {
  const [q, setQ] = useState("");
  const [onlyLocation, setOnlyLocation] = useState<string>("all");
  const [onlyService, setOnlyService] = useState<string>("all");
  const [toast, setToast] = useState<string | null>(null);

  const locations = useMemo(() => {
    const uniq = Array.from(new Set(rows.map((r) => r.location))).sort();
    return ["all", ...uniq];
  }, [rows]);

  const services = useMemo(() => {
    const uniq = Array.from(new Set(rows.map((r) => r.service))).sort();
    return ["all", ...uniq];
  }, [rows]);

  const filtered = useMemo(() => {
    const query = clean(q);
    return rows.filter((r) => {
      if (onlyLocation !== "all" && r.location !== onlyLocation) return false;
      if (onlyService !== "all" && r.service !== onlyService) return false;
      if (!query) return true;
      const hay = `${r.location} ${r.locationLabel} ${r.service} ${r.serviceLabel} ${r.path}`.toLowerCase();
      return hay.includes(query);
    });
  }, [rows, q, onlyLocation, onlyService]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const copyRow = async (r: LandingRow) => {
    const url = origin ? `${origin}${r.path}` : r.path;
    const ok = await copyToClipboard(url);
    setToast(ok ? `Copiado: ${url}` : "No se pudo copiar");
    window.setTimeout(() => setToast(null), 1800);
  };

  const copyAll = async () => {
    const lines = filtered.map((r) => (origin ? `${origin}${r.path}` : r.path));
    const ok = await copyToClipboard(lines.join("\n"));
    setToast(ok ? `Copiadas ${lines.length} URLs` : "No se pudo copiar");
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <Container>
      <div className="py-10 md:py-16">
        <p className="text-xs uppercase tracking-wide opacity-70">Panel interno</p>
        <h1 className="mt-1 text-3xl md:text-5xl font-semibold tracking-tight">Landings</h1>
        <p className="mt-3 max-w-3xl opacity-80">
          Lista de URLs canónicas recomendadas (allowlist). Úsalas para SEO local, campañas y enlaces desde Google Business
          Profile.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs opacity-70" htmlFor="q">
              Buscar
            </label>
            <input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="borriol, rejas, puertas..."
              className="mt-1 w-full rounded-2xl border border-border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/60"
            />
          </div>
          <div>
            <label className="text-xs opacity-70" htmlFor="loc">
              Localidad
            </label>
            <select
              id="loc"
              value={onlyLocation}
              onChange={(e) => setOnlyLocation(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/60"
            >
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l === "all" ? "Todas" : l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs opacity-70" htmlFor="svc">
              Servicio
            </label>
            <select
              id="svc"
              value={onlyService}
              onChange={(e) => setOnlyService(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/60"
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "Todos" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={copyAll} variant="secondary">
            Copiar todas (filtradas)
          </Button>
          <span className="text-sm opacity-70">{filtered.length} URLs</span>
          {toast ? <span className="text-sm opacity-90">· {toast}</span> : null}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-12 gap-2 bg-black/[0.03] px-4 py-3 text-xs font-semibold">
            <div className="col-span-3">Localidad</div>
            <div className="col-span-4">Servicio</div>
            <div className="col-span-3">Ruta canónica</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          {filtered.map((r) => (
            <div
              key={`${r.location}::${r.service}`}
              className="grid grid-cols-12 gap-2 border-t px-4 py-3 text-sm"
            >
              <div className="col-span-3">
                <div className="font-semibold">{r.locationLabel}</div>
                <div className="text-xs opacity-70">{r.location}</div>
              </div>
              <div className="col-span-4">
                <div className="font-semibold">{r.serviceLabel}</div>
                <div className="text-xs opacity-70">{r.service}</div>
              </div>
              <div className="col-span-3">
                <code className="text-xs">{r.path}</code>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <Link
                  href={r.path}
                  className="rounded-xl border border-border px-3 py-1 text-xs hover:bg-brand/5"
                  prefetch={false}
                >
                  Abrir
                </Link>
                <button
                  onClick={() => copyRow(r)}
                  className="rounded-xl border border-border px-3 py-1 text-xs hover:bg-brand/5"
                >
                  Copiar
                </button>
              </div>
            </div>
          ))}

          {!filtered.length ? (
            <div className="px-4 py-6 text-sm opacity-80">Sin resultados.</div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
