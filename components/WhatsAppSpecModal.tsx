"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useBodyScrollLock, useFocusTrap } from "@/lib/hooks/useModalA11y";
import { sessionDraftGet, sessionDraftSet } from "@/lib/sessionDraft";

import Button from "@/components/ui/Button";

export type SpecField =
  | {
      id: string;
      label: string;
      type: "text";
      placeholder?: string;
      required?: boolean;
    }
  | {
      id: string;
      label: string;
      type: "textarea";
      placeholder?: string;
      required?: boolean;
      rows?: number;
    }
  | {
      id: string;
      label: string;
      type: "select";
      options: string[];
      required?: boolean;
    }
  | {
      id: string;
      label: string;
      type: "number";
      placeholder?: string;
      required?: boolean;
      step?: number;
      unit?: string;
    };

function normalizeServiceName(serviceLabel?: string) {
  return serviceLabel?.trim() ? serviceLabel.trim() : "Trabajo";
}

function buildDefaultFields(serviceLabel?: string): SpecField[] {
  const name = normalizeServiceName(serviceLabel);
  // Generic, works across services.
  return [
    {
      id: "tipo",
      label: `Tipo de ${name}`,
      type: "text",
      placeholder: "Ej.: reja, puerta, barandilla, estructura...",
      required: true
    },
    {
      id: "medidas",
      label: "Medidas aproximadas",
      type: "text",
      placeholder: "Ej.: 2,0m ancho x 1,2m alto / 6m lineales",
      required: true
    },
    {
      id: "material",
      label: "Material / acabado",
      type: "select",
      options: ["Hierro", "Galvanizado", "Inox", "Lacado", "No lo sé"],
      required: true
    },
    {
      id: "montaje",
      label: "Montaje",
      type: "select",
      options: ["Sí (instalación)", "No (solo fabricación)", "No lo sé"],
      required: true
    },
    {
      id: "localidad",
      label: "Localidad",
      type: "text",
      placeholder: "Ej.: Borriol / Castellón",
      required: true
    },
    {
      id: "plazo",
      label: "Plazo",
      type: "select",
      options: ["Sin prisa", "Esta semana", "Urgente", "No lo sé"]
    },
    {
      id: "foto",
      label: "Foto",
      type: "select",
      options: ["Sí, adjunto foto por WhatsApp", "No tengo foto"]
    },
    {
      id: "notas",
      label: "Notas",
      type: "textarea",
      placeholder: "Accesos, altura, retirada, anclajes, etc.",
      rows: 4
    }
  ];
}

function parseLocaleNumber(input: string): number {
  const trimmed = (input ?? "").toString().trim();
  if (!trimmed) return NaN;
  const normalized = trimmed.replace(/\s+/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}


function prefersReducedMotion() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function scrollFieldIntoView(opts: { container: HTMLDivElement | null; footer: HTMLDivElement | null; el: HTMLElement }) {
  const { container, footer, el } = opts;
  if (!container) {
    el.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    return;
  }
  const cRect = container.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const footerH = footer ? footer.getBoundingClientRect().height : 0;
  const topPad = 16;
  const bottomPad = Math.max(16, footerH + 16);
  let delta = 0;
  if (eRect.top < cRect.top + topPad) delta = eRect.top - (cRect.top + topPad);
  else if (eRect.bottom > cRect.bottom - bottomPad) delta = eRect.bottom - (cRect.bottom - bottomPad);
  if (Math.abs(delta) < 1) return;
  container.scrollBy({ top: delta, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function toWhatsAppUrl(phoneE164: string, text: string) {
  const normalized = phoneE164.replace(/\s+/g, "");
  const phone = normalized.startsWith("+") ? normalized.substring(1) : normalized;
  const params = new URLSearchParams({ text });
  return `https://wa.me/${phone}?${params.toString()}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  phoneE164: string;
  serviceLabel?: string;
  serviceSlug?: string;
  /** Valores iniciales (por ejemplo, localidad desde una landing de zona). */
  prefill?: Record<string, string>;
  // If you want to override fields per service, pass them.
  fields?: SpecField[];
  onSubmitTrack?: (payload: { serviceLabel?: string }) => void;
};

export default function WhatsAppSpecModal({
  open,
  onClose,
  phoneE164,
  serviceLabel,
  serviceSlug,
  prefill,
  fields,
  onSubmitTrack
}: Props) {
  const finalFields = useMemo(() => fields ?? buildDefaultFields(serviceLabel), [fields, serviceLabel]);
  const storageKey = useMemo(() => {
    const key = serviceSlug ?? serviceLabel ?? "global";
    return `dbm_spec_draft:${key}`;
  }, [serviceSlug, serviceLabel]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [bottomInset, setBottomInset] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);
  const [footerH, setFooterH] = useState(0);

  const dialogRef = useRef<HTMLDivElement | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const overlayDownRef = useRef<{x:number;y:number;down:boolean}>({x:0,y:0,down:false});
  const localidadRef = useRef<HTMLInputElement | null>(null);
  const jobFieldRef = useRef<HTMLElement | null>(null);
  const initialSnapshotRef = useRef<string>("");
  const didAutoFocusRef = useRef(false);
  const lastSendRef = useRef<{ ts: number; msg: string }>({ ts: 0, msg: "" });


  function stableStringify(value: any): string {
    if (value === null || value === undefined) return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (typeof value !== "object") return JSON.stringify(value);
    const keys = Object.keys(value).sort();
    const parts: string[] = [];
    for (const k of keys) parts.push(`${JSON.stringify(k)}:${stableStringify((value as any)[k])}`);
    return `{${parts.join(",")}}`;
  }

  const isDirty = useMemo(() => {
    const snapshot = stableStringify(values);
    return initialSnapshotRef.current ? snapshot !== initialSnapshotRef.current : false;
  }, [values]);

  const attemptClose = () => {
    if (!isDirty) {
      onClose();
      return;
    }
    if (!confirmClose) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") attemptClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isDirty, confirmClose, onClose]);
  // Lock body scroll while open (iOS-safe).
  useBodyScrollLock(open);

  // Trap focus inside the dialog.
  useFocusTrap(open, dialogRef, { autoFocus: false, restoreFocus: true });


  // Track mobile keyboard inset (visual viewport) to keep footer visible.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) {
      setBottomInset(0);
      return;
    }

    let raf = 0;
    const compute = () => {
      // On iOS Safari, visualViewport can change due to address bar collapsing/expanding.
      // Using rAF de-jitters rapid resize/scroll events.
      const inset = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      setBottomInset(Math.round(inset));
    };
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    schedule();
    vv.addEventListener("resize", schedule);
    vv.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      vv.removeEventListener("resize", schedule);
      vv.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [open]);


  // Measure footer height to keep scroll padding correct.
  useEffect(() => {
    if (!open) return;
    const el = footerRef.current;
    if (!el) return;
    const measure = () => setFooterH(Math.round(el.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // Offset the modal so it does not cover the fixed header.
  useEffect(() => {
    if (!open) return;

    const compute = () => {
      const header = document.querySelector("header");
      const h = header ? Math.round(header.getBoundingClientRect().height) : 0;
      setTopOffset(h);
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setConfirmClose(false);
    didAutoFocusRef.current = false;
    lastSendRef.current = { ts: 0, msg: "" };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Initialize defaults
    const next: Record<string, string> = {};
    for (const f of finalFields) {
      if (f.type === "select") next[f.id] = f.options[0] ?? "";
      else next[f.id] = "";
    }
    // Restore draft if present.
    try {
      const raw = sessionDraftGet(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        const merged = { ...next, ...parsed };
        // Aplica prefill solo si el campo está vacío (no pisa el borrador).
        if (prefill) {
          for (const [k, v] of Object.entries(prefill)) {
            if (typeof v === "string" && v.trim() && !(merged[k] ?? "").trim()) merged[k] = v;
          }
        }
        initialSnapshotRef.current = stableStringify(merged);
        setValues(merged);
        return;
      }
    } catch {
      // ignore
    }
    // Sin borrador: aplica prefill directo.
    if (prefill) {
      for (const [k, v] of Object.entries(prefill)) {
        if (typeof v === "string" && v.trim()) next[k] = v;
      }
    }
    initialSnapshotRef.current = stableStringify(next);
    setValues(next);
  }, [open, finalFields, storageKey, prefill]);

  // Auto-focus: localidad, or trabajo if localidad is already known/prefilled.
  useEffect(() => {
    if (!open) return;
    if (didAutoFocusRef.current) return;
    const t = window.setTimeout(() => {
      const hasLocalidad = (values["localidad"] ?? "").trim().length > 0;
      const target = hasLocalidad ? jobFieldRef.current : localidadRef.current;
      if (target) {
        didAutoFocusRef.current = true;
        target.focus();
        scrollFieldIntoView({ container: scrollRef.current, footer: footerRef.current, el: target as HTMLElement });
      }
    }, 80);
    return () => window.clearTimeout(t);
  }, [open, values]);

  useEffect(() => {
    if (!open) return;
    try {
      sessionDraftSet(storageKey, JSON.stringify(values));
    } catch {
      // ignore
    }
  }, [open, values, storageKey]);

  if (!open) return null;

  const title = serviceLabel ? `Especificaciones — ${serviceLabel}` : "Especificaciones";

  const missingRequired = finalFields.filter((f) => (f as any).required && !values[f.id]?.trim());
  const missingCount = missingRequired.length;

  const buildMessage = () => {
    const lines: string[] = [];
    const service = (serviceLabel ?? "Trabajo").trim() || "Trabajo";
    lines.push(`Hola, quiero presupuesto de: ${service}`);
    lines.push("");

    const v = (id: string) => (values[id] ?? "").trim();
    const valOrUnknown = (id: string) => (v(id) ? v(id) : "No lo sé");

    // Campos clave (siempre en este orden)
    lines.push(`- Localidad: ${valOrUnknown("localidad")}`);

    const job = v("tipo") || v("tarea") || v("trabajo");
    lines.push(`- Trabajo: ${job ? job : "No lo sé"}`);

    const ancho = v("ancho");
    const alto = v("alto");
    const uds = v("unidades") || "1";
    const metros = v("metros");
    const m2 = v("m2");
    const medidasText = v("medidas");

    if (medidasText) {
      lines.push(`- Medidas aprox.: ${medidasText}`);
    } else if (ancho || alto || v("unidades")) {
      if (ancho || alto) lines.push(`- Medidas aprox.: ${ancho || "?"}m x ${alto || "?"}m${uds !== "1" ? ` (x${uds} uds)` : ""}`);
      else lines.push("- Medidas aprox.: No lo sé");
    } else if (metros) {
      lines.push(`- Medidas aprox.: ${metros} m lineales`);
    } else if (m2) {
      lines.push(`- Medidas aprox.: ${m2} m²`);
    } else {
      lines.push("- Medidas aprox.: No lo sé");
    }

    const fotoRaw = v("foto").toLowerCase();
    const foto = fotoRaw.includes("sí") || fotoRaw.includes("si") ? "Sí" : fotoRaw.includes("no") ? "No" : "No lo sé";
    lines.push(`- Foto: ${foto}`);

    // Extra: m² calculados cuando hay ancho/alto
    const w = parseLocaleNumber(values["ancho"] ?? values["width"] ?? "");
    const h = parseLocaleNumber(values["alto"] ?? values["height"] ?? "");
    const u = parseLocaleNumber(values["unidades"] ?? values["uds"] ?? values["units"] ?? "");
    if (Number.isFinite(w) && Number.isFinite(h)) {
      const units = Number.isFinite(u) && u > 0 ? Math.max(1, Math.round(u)) : 1;
      const computed = w * h * units;
      lines.push(`- m² total (aprox.): ${computed.toLocaleString("es-ES", { maximumFractionDigits: 2 })} m²`);
    }

    // Resto de campos (sin repetir)
    const skip = new Set(["localidad", "tipo", "tarea", "trabajo", "medidas", "ancho", "alto", "unidades", "metros", "m2", "foto"]);
    for (const f of finalFields) {
      if (skip.has(f.id)) continue;
      lines.push(`- ${f.label}: ${valOrUnknown(f.id)}`);
    }

    lines.push("");
    if (foto === "Sí") {
      lines.push("Cuando se abra WhatsApp, adjunto la foto con el clip.");
    } else {
      lines.push("Si luego puedes, envía una foto por WhatsApp.");
    }
    lines.push("¿Me dices precio orientativo y disponibilidad?");

    return lines.join("\n");
  };

  return (
    <div
      className="fixed left-0 right-0 z-50"
      style={{ top: topOffset, bottom: bottomInset }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dbm-spec-title"
      aria-describedby="dbm-spec-desc"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40"
        aria-hidden
        onPointerDown={(e) => {
          if (e.currentTarget !== e.target) return;
          overlayDownRef.current = { x: e.clientX, y: e.clientY, down: true };
        }}
        onPointerUp={(e) => {
          if (e.currentTarget !== e.target) return;
          const s = overlayDownRef.current;
          overlayDownRef.current = { x: 0, y: 0, down: false };
          const dx = Math.abs(e.clientX - s.x);
          const dy = Math.abs(e.clientY - s.y);
          if (!s.down) return;
          if (dx <= 8 && dy <= 8) attemptClose();
        }}
      />
      <div className="absolute inset-0 flex items-end justify-center p-3 md:items-center">
        <div ref={dialogRef} className="w-full max-w-2xl max-h-full overflow-hidden rounded-2xl border border-border bg-white shadow-lg flex flex-col">
          <div className="flex items-center justify-between gap-4 border-b p-5 bg-white">
            <div>
              <div id="dbm-spec-title" className="text-base font-semibold">{title}</div>
              <div id="dbm-spec-desc" className="mt-1 text-sm opacity-80">
                Rellena lo básico y abrimos WhatsApp con el mensaje listo.
              </div>
            </div>
            <button
              className="rounded-lg p-2 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              onClick={attemptClose}
              aria-label="Cerrar"
              type="button"
            >
              ✕
            </button>
          </div>

          {confirmClose ? (
            <div className="border-b px-5 py-3 text-xs bg-white">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="opacity-80">
                  Tienes cambios sin enviar. El borrador se guarda automáticamente.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-border px-3 py-2 text-xs hover:bg-brand/5"
                    onClick={() => setConfirmClose(false)}
                  >
                    Seguir
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-border px-3 py-2 text-xs hover:bg-brand/5"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div
            ref={scrollRef}
            className="p-5 overflow-y-auto flex-1"
            style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", scrollPaddingBottom: footerH + 24, scrollPaddingTop: 24 }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {finalFields.map((f) => {
                const common = {
                  id: f.id,
                  name: f.id,
                  value: values[f.id] ?? "",
                  onChange: (e: any) => {
                    setConfirmClose(false);
                    setValues((prev) => ({ ...prev, [f.id]: e.target.value }));
                  },
                  onFocus: (e: any) => {
                    setConfirmClose(false);
                    const el = e.currentTarget as HTMLElement;
                    window.setTimeout(() => scrollFieldIntoView({ container: scrollRef.current, footer: footerRef.current, el }), 0);
                  }
                };

                const canMarkUnknown = f.type === "text" || f.type === "number";
                const isUnknown = (values[f.id] ?? "").trim().toLowerCase() === "no lo sé";
                const isJobField = f.id === "tipo" || f.id === "tarea" || f.id === "trabajo";
                const isLocalidad = f.id === "localidad";

                return (
                  <label key={f.id} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">
                        {f.label}
                        {(f as any).required ? <span className="opacity-60"> *</span> : null}
                      </div>
                      {canMarkUnknown ? (
                        <div className="flex items-center gap-2 text-xs opacity-80 select-none">
                          <input
                            type="checkbox"
                            aria-label={`No lo sé: ${f.label}`}
                            checked={isUnknown}
                            onChange={(e) => {
                              setConfirmClose(false);
                              const checked = e.target.checked;
                              setValues((prev) => ({
                                ...prev,
                                [f.id]: checked ? "No lo sé" : ""
                              }));
                            }}
                          />
                          <span>No lo sé</span>
                        </div>
                      ) : null}
                    </div>
                    {f.type === "select" ? (
                      <select
                        {...common}
                        className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
                        ref={isJobField ? (jobFieldRef as any) : undefined}
                      >
                        {f.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea
                        {...common}
                        rows={f.rows ?? 4}
                        placeholder={f.placeholder}
                        className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
                        ref={isJobField ? (jobFieldRef as any) : undefined}
                      />
                    ) : f.type === "number" ? (
                      <input
                        {...common}
                        placeholder={f.placeholder}
                        className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
                        inputMode="decimal"
                        disabled={isUnknown}
                        ref={isLocalidad ? (localidadRef as any) : isJobField ? (jobFieldRef as any) : undefined}
                      />
                    ) : (
                      <input
                        {...common}
                        placeholder={f.placeholder}
                        className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm"
                        inputMode="text"
                        disabled={isUnknown}
                        ref={isLocalidad ? (localidadRef as any) : isJobField ? (jobFieldRef as any) : undefined}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-sm font-semibold">Vista previa del mensaje</div>
              <pre className="mt-2 whitespace-pre-wrap text-sm opacity-80">{buildMessage()}</pre>
            </div>
          </div>

          <div ref={footerRef} className="flex flex-wrap items-center justify-between gap-3 border-t p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-white">
            <div className="text-xs opacity-70">
              {missingCount > 0 ? (
                <span>
                  Faltan {missingCount} campo(s) obligatorio(s). Puedes marcar “No lo sé” y continuar.
                </span>
              ) : (
                <span>* Campos obligatorios</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={attemptClose}>
                Cancelar
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  const msg = buildMessage();
                  try {
                    await navigator.clipboard.writeText(msg);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  } catch {
                    // ignore
                  }
                }}
              >
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button
                onClick={() => {
                  setConfirmClose(false);
                  const now = Date.now();
                  const msg = buildMessage();
                  if (now - lastSendRef.current.ts < 1200 && lastSendRef.current.msg === msg) return;
                  lastSendRef.current = { ts: now, msg };
                  const url = toWhatsAppUrl(phoneE164, msg);
                  onSubmitTrack?.({ serviceLabel });
                  window.open(url, "_blank", "noopener,noreferrer");
                  onClose();
                }}
              >
                Abrir WhatsApp con el mensaje
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
