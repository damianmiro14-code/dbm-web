"use client";

export type LeadStatus = "nuevo" | "en_proceso" | "cerrado" | "descartado";
export type LeadSource = "presupuesto" | "reserva" | "contacto" | "service_spec" | "header";

export type Lead = {
  id: string;
  createdAt: string; // ISO
  status: LeadStatus;
  source: LeadSource;
  service?: string;
  location?: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  meta?: Record<string, unknown>;
};

const STORAGE_KEY = "dbm_leads_v1";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function safeParse(value: string | null): Lead[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Lead[];
  } catch {
    return [];
  }
}

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `lead_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }
}

function notifyUpdate() {
  if (!hasWindow()) return;
  window.dispatchEvent(new Event("dbm:leads_updated"));
}

export function listLeads(): Lead[] {
  if (!hasWindow()) return [];
  const leads = safeParse(localStorage.getItem(STORAGE_KEY));
  return leads
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

export function addLead(input: Omit<Lead, "id" | "createdAt" | "status"> & { status?: LeadStatus }): Lead {
  const lead: Lead = {
    id: uid(),
    createdAt: new Date().toISOString(),
    status: input.status ?? "nuevo",
    source: input.source,
    service: input.service,
    location: input.location,
    name: input.name,
    phone: input.phone,
    email: input.email,
    message: input.message,
    meta: input.meta
  };

  if (!hasWindow()) return lead;

  const existing = safeParse(localStorage.getItem(STORAGE_KEY));
  existing.unshift(lead);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  notifyUpdate();
  return lead;
}

export function updateLead(id: string, patch: Partial<Omit<Lead, "id" | "createdAt">>): void {
  if (!hasWindow()) return;
  const existing = safeParse(localStorage.getItem(STORAGE_KEY));
  const next = existing.map((l) => (l.id === id ? { ...l, ...patch } : l));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyUpdate();
}

export function deleteLead(id: string): void {
  if (!hasWindow()) return;
  const existing = safeParse(localStorage.getItem(STORAGE_KEY));
  const next = existing.filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyUpdate();
}

export function clearLeads(): void {
  if (!hasWindow()) return;
  localStorage.removeItem(STORAGE_KEY);
  notifyUpdate();
}

export function exportLeadsJson(): string {
  const leads = listLeads();
  return JSON.stringify(leads, null, 2);
}

function csvEscape(value: string): string {
  const v = value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  if (/[",]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function exportLeadsCsv(): string {
  const leads = listLeads();
  const headers = [
    "createdAt",
    "status",
    "source",
    "service",
    "location",
    "name",
    "phone",
    "email",
    "message"
  ];
  const rows = leads.map((l) =>
    headers
      .map((h) => {
        const val = (l as any)[h];
        return csvEscape(val == null ? "" : String(val));
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function downloadTextFile(filename: string, text: string, mime = "text/plain"): void {
  if (!hasWindow()) return;
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
