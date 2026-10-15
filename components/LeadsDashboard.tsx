"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import site from "@/content/es/site.json";
import {
  Lead,
  LeadSource,
  LeadStatus,
  clearLeads,
  deleteLead,
  downloadTextFile,
  exportLeadsCsv,
  exportLeadsJson,
  listLeads,
  updateLead
} from "@/lib/leads";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function toWhatsAppUrl(phoneE164: string, text: string) {
  const normalized = phoneE164.replace(/\s+/g, "");
  const phone = normalized.startsWith("+") ? normalized.substring(1) : normalized;
  const params = new URLSearchParams({ text });
  return `https://wa.me/${phone}?${params.toString()}`;
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  en_proceso: "En proceso",
  cerrado: "Cerrado",
  descartado: "Descartado"
};

const SOURCE_LABEL: Record<LeadSource, string> = {
  presupuesto: "Presupuesto",
  reserva: "Reserva",
  contacto: "Contacto",
  service_spec: "Especificaciones",
  header: "Header"
};

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [source, setSource] = useState<"all" | LeadSource>("all");

  useEffect(() => {
    const refresh = () => setLeads(listLeads());
    refresh();
    window.addEventListener("dbm:leads_updated", refresh);
    return () => window.removeEventListener("dbm:leads_updated", refresh);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (source !== "all" && l.source !== source) return false;
      if (!query) return true;
      const hay = [
        l.service,
        l.location,
        l.name,
        l.phone,
        l.email,
        l.message,
        l.source,
        l.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [leads, q, status, source]);

  const phoneE164 = site.business.phone;

  return (
    <Container>
      <div className="py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70">Panel interno</p>
            <h1 className="mt-1 text-3xl md:text-5xl font-semibold tracking-tight">Leads</h1>
            <p className="mt-3 max-w-2xl opacity-80">
              Histórico antiguo de este navegador, no es una bandeja de solicitudes recibidas.
              Desde P202A abrir WhatsApp no crea nuevos leads; confirma los contactos en WhatsApp Business.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => downloadTextFile("dbm-leads.json", exportLeadsJson(), "application/json")}
            >
              Exportar JSON
            </Button>
            <Button
              variant="secondary"
              onClick={() => downloadTextFile("dbm-leads.csv", exportLeadsCsv(), "text/csv")}
            >
              Exportar CSV
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const ok = confirm("¿Borrar todos los leads guardados en este navegador?");
                if (ok) clearLeads();
              }}
            >
              Vaciar
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm opacity-80">Buscar</span>
            <input
              className="rounded-xl border border-border px-4 py-3"
              placeholder="Servicio, nombre, teléfono, mensaje…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm opacity-80">Estado</span>
            <select className="rounded-xl border border-border px-4 py-3" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="all">Todos</option>
              <option value="nuevo">Nuevo</option>
              <option value="en_proceso">En proceso</option>
              <option value="cerrado">Cerrado</option>
              <option value="descartado">Descartado</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm opacity-80">Origen</span>
            <select className="rounded-xl border border-border px-4 py-3" value={source} onChange={(e) => setSource(e.target.value as any)}>
              <option value="all">Todos</option>
              <option value="presupuesto">Presupuesto</option>
              <option value="reserva">Reserva</option>
              <option value="contacto">Contacto</option>
            </select>
          </label>
        </div>

        <div className="mt-6 rounded-2xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[170px_110px_1fr_180px_150px_190px] gap-0 border-b bg-black/5 px-4 py-3 text-xs uppercase tracking-wide opacity-70">
            <div>Fecha</div>
            <div>Origen</div>
            <div>Detalle</div>
            <div>Contacto</div>
            <div>Estado</div>
            <div className="text-right">Acciones</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center opacity-70">No hay leads todavía.</div>
          ) : (
            <div className="divide-y">
              {filtered.map((l) => {
                const wa = l.message ? toWhatsAppUrl(phoneE164, l.message) : null;
                return (
                  <div key={l.id} className="px-4 py-4">
                    {/* Mobile summary */}
                    <div className="md:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{l.service ?? SOURCE_LABEL[l.source]}</p>
                          <p className="mt-1 text-sm opacity-80">
                            {SOURCE_LABEL[l.source]} · {STATUS_LABEL[l.status]} · {formatDate(l.createdAt)}
                          </p>
                        </div>
                        <select
                          className="rounded-xl border border-border px-3 py-2 text-sm"
                          value={l.status}
                          onChange={(e) => updateLead(l.id, { status: e.target.value as LeadStatus })}
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="en_proceso">En proceso</option>
                          <option value="cerrado">Cerrado</option>
                          <option value="descartado">Descartado</option>
                        </select>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm opacity-80">
                        {l.location ? <p><strong>Zona:</strong> {l.location}</p> : null}
                        {l.name ? <p><strong>Nombre:</strong> {l.name}</p> : null}
                        {l.phone ? <p><strong>Tel:</strong> {l.phone}</p> : null}
                        {l.email ? <p><strong>Email:</strong> {l.email}</p> : null}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {wa ? (
                          <Button href={wa}>WhatsApp</Button>
                        ) : null}
                        {l.message ? (
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(l.message ?? "");
                                alert("Mensaje copiado");
                              } catch {
                                alert("No se pudo copiar automáticamente");
                              }
                            }}
                          >
                            Copiar
                          </Button>
                        ) : null}
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => {
                            const ok = confirm("¿Eliminar este lead?");
                            if (ok) deleteLead(l.id);
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:grid grid-cols-[170px_110px_1fr_180px_150px_190px] gap-4 items-start">
                      <div className="text-sm opacity-80">{formatDate(l.createdAt)}</div>
                      <div className="text-sm opacity-80">{SOURCE_LABEL[l.source]}</div>
                      <div>
                        <p className="text-sm font-semibold">{l.service ?? "—"}</p>
                        <p className="mt-1 text-sm opacity-80 line-clamp-2">{l.location ?? l.message ?? "—"}</p>
                      </div>
                      <div className="text-sm opacity-80">
                        {l.name ? <p>{l.name}</p> : null}
                        {l.phone ? <p>{l.phone}</p> : null}
                        {l.email ? <p className="truncate">{l.email}</p> : null}
                        {!l.name && !l.phone && !l.email ? "—" : null}
                      </div>
                      <div>
                        <select
                          className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                          value={l.status}
                          onChange={(e) => updateLead(l.id, { status: e.target.value as LeadStatus })}
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="en_proceso">En proceso</option>
                          <option value="cerrado">Cerrado</option>
                          <option value="descartado">Descartado</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {wa ? <Button href={wa}>WhatsApp</Button> : null}
                        {l.message ? (
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(l.message ?? "");
                                alert("Mensaje copiado");
                              } catch {
                                alert("No se pudo copiar automáticamente");
                              }
                            }}
                          >
                            Copiar
                          </Button>
                        ) : null}
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => {
                            const ok = confirm("¿Eliminar este lead?");
                            if (ok) deleteLead(l.id);
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
