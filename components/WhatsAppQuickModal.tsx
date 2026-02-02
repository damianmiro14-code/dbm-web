"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useBodyScrollLock, useFocusTrap } from "@/lib/hooks/useModalA11y";
import { storageGet, storageSet } from "@/lib/storage";

import Button from "@/components/ui/Button";
import type { SpecField } from "@/components/WhatsAppSpecModal";
import { toWhatsAppUrl } from "@/components/WhatsAppSpecModal";

type Mode = "quick" | "visit";

type Props = {
  open: boolean;
  onClose: () => void;
  phoneE164: string;
  mode: Mode;
  title: string;
  introLine: string;
  fields: SpecField[];
  /** Nombre del trabajo/servicio (se imprime como "Trabajo" en el mensaje). */
  workLabel?: string;
  /** Valores iniciales (por ejemplo, localidad desde una landing de zona). */
  prefill?: Record<string, string>;
  submitLabel?: string;
  onSubmitTrack?: () => void;
  draftKey?: string;
};

function normalizeNumberInput(raw: string) {
  // Mantiene coma/punto mientras el usuario escribe; elimina caracteres raros.
  return raw.replace(/[^0-9.,]/g, "");
}

function parseNumber(raw: string | undefined) {
  const s = (raw ?? "").trim();
  if (!s) return null;
  const n = Number.parseFloat(s.replace(/,/g, "."));
  return Number.isFinite(n) ? n : null;
}

function formatDecimalEs(n: number, digits: number) {
  return n.toFixed(digits).replace(".", ",");
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

export default function WhatsAppQuickModal({
  open,
  onClose,
  phoneE164,
  mode,
  title,
  introLine,
  fields,
  workLabel,
  prefill,
  submitLabel,
  onSubmitTrack,
  draftKey
}: Props) {
  const storageKey = useMemo(() => {
    if (draftKey) return `dbm_quick_draft:${draftKey}`;
    return `dbm_quick_draft:${mode}:global`;
  }, [draftKey, mode]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [unknown, setUnknown] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [bottomInset, setBottomInset] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);
  const [footerH, setFooterH] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const overlayDownRef = useRef<{x:number;y:number;down:boolean}>({x:0,y:0,down:false});
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const localidadRef = useRef<HTMLInputElement | null>(null);
  const tipoRef = useRef<HTMLInputElement | null>(null);
  const initialSnapshotRef = useRef<string>("");

  function stableStringify(value: any): string {
    if (value === null || value === undefined) return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (typeof value !== "object") return JSON.stringify(value);
    const keys = Object.keys(value).sort();
    const parts: string[] = [];
    for (const k of keys) parts.push(`${JSON.stringify(k)}:${stableStringify(value[k])}`);
    return `{${parts.join(",")}}`;
  }

  const isDirty = useMemo(() => {
    const snapshot = stableStringify({ values, unknown });
    return initialSnapshotRef.current ? snapshot !== initialSnapshotRef.current : false;
  }, [values, unknown]);

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

  const didAutoFocusRef = useRef(false);
  const lastSendRef = useRef<{ ts: number; msg: string }>({ ts: 0, msg: "" });


  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") attemptClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, isDirty, confirmClose]);
  // Lock body scroll while open (iOS-safe).
  useBodyScrollLock(open);
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

  // Offset below fixed header.
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
    const nextValues: Record<string, string> = {};
    const nextUnknown: Record<string, boolean> = {};
    for (const f of fields) {
      if (f.type === "select") nextValues[f.id] = f.options[0] ?? "";
      else nextValues[f.id] = "";
      nextUnknown[f.id] = false;
    }
    try {
      const raw = storageGet(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { values?: Record<string, string>; unknown?: Record<string, boolean> };
        const merged = { ...nextValues, ...(parsed.values ?? {}) };
        // Aplica prefill solo si el campo está vacío (no pisa lo que el usuario ya haya escrito).
        if (prefill) {
          for (const [k, v] of Object.entries(prefill)) {
            if (typeof v === "string" && v.trim() && !(merged[k] ?? "").trim()) merged[k] = v;
          }
        }
        const mergedUnknown = { ...nextUnknown, ...(parsed.unknown ?? {}) };
        initialSnapshotRef.current = stableStringify({ values: merged, unknown: mergedUnknown });
        setValues(merged);
        setUnknown(mergedUnknown);
        return;
      }
    } catch {
      // ignore
    }
    // Sin borrador: aplica prefill directo.
    if (prefill) {
      for (const [k, v] of Object.entries(prefill)) {
        if (typeof v === "string" && v.trim()) nextValues[k] = v;
      }
    }
    initialSnapshotRef.current = stableStringify({ values: nextValues, unknown: nextUnknown });
    setValues(nextValues);
    setUnknown(nextUnknown);
  }, [open, storageKey, fields, prefill]);

  // Auto-focus: localidad, or trabajo if localidad is already known/prefilled.
  useEffect(() => {
    if (!open) return;
    if (didAutoFocusRef.current) return;
    // Wait for inputs to mount.
    const t = window.setTimeout(() => {
      const hasLocalidad = (values["localidad"] ?? "").trim().length > 0;
      const target = hasLocalidad ? tipoRef.current : localidadRef.current;
      if (target) {
        didAutoFocusRef.current = true;
        target.focus();
        scrollFieldIntoView({ container: scrollRef.current, footer: footerRef.current, el: target });
      }
    }, 80);
    return () => window.clearTimeout(t);
  }, [open, values]);

  useEffect(() => {
    if (!open) return;
    try {
      storageSet(storageKey, JSON.stringify({ values, unknown }));
    } catch {
      // ignore
    }
  }, [open, storageKey, values, unknown]);

  if (!open) return null;

  const hasDims = fields.some((f) => f.id === "ancho") && fields.some((f) => f.id === "alto");
  const anchoNum = parseNumber(values["ancho"]);
  const altoNum = parseNumber(values["alto"]);
  const unidadesNum = parseNumber(values["unidades"]) ?? 1;
  const computedM2 = hasDims && anchoNum && altoNum ? anchoNum * altoNum * (unidadesNum || 1) : null;

  const getValueOrUnknown = (id: string) => {
    const isUnknown = !!unknown[id];
    const v = (values[id] ?? "").trim();
    if (isUnknown || !v) return "No lo sé";
    return v;
  };

  const buildMessage = () => {
    const lines: string[] = [];

    // Mandatory first line (consistent WhatsApp-first format).
    const servicio = (workLabel ?? "Carpintería metálica").trim() || "Carpintería metálica";
    lines.push(`Hola, quiero presupuesto de: ${servicio}`);
    if (mode === "visit") {
      lines.push("Quiero reservar una visita para tomar medidas.");
    }
    lines.push("");

    // Campos clave (siempre en este orden)
    lines.push(`- Localidad: ${getValueOrUnknown("localidad")}`);

    const typedWork = (values["tipo"] ?? "").trim();
    lines.push(`- Trabajo: ${typedWork || "No lo sé"}`);

    if (hasDims) {
      const anchoTxt = (values["ancho"] ?? "").trim();
      const altoTxt = (values["alto"] ?? "").trim();
      const udsTxt = (values["unidades"] ?? "").trim();
      const uds = udsTxt ? udsTxt : "1";
      const hasAny = !!anchoTxt || !!altoTxt || !!udsTxt;
      if (hasAny) {
        const medidas = `${anchoTxt || "?"}m x ${altoTxt || "?"}m` + (uds !== "1" ? ` (x${uds} uds)` : "");
        lines.push(`- Medidas aprox.: ${medidas}`);
      } else {
        lines.push("- Medidas aprox.: No lo sé");
      }

      if (computedM2) {
        lines.push(`- m² total (aprox.): ${formatDecimalEs(computedM2, 2)} m²`);
      }
    } else {
      const medidas = (values["medidas"] ?? "").trim();
      const metros = (values["metros"] ?? "").trim();
      if (medidas) {
        lines.push(`- Medidas aprox.: ${medidas}`);
      } else if (metros) {
        lines.push(`- Medidas aprox.: ${metros} m lineales`);
      } else {
        lines.push("- Medidas aprox.: No lo sé");
      }
    }

    const fotoRaw = (values["foto"] ?? "").toLowerCase();
    const foto = fotoRaw.includes("sí") || fotoRaw.includes("si") ? "Sí" : fotoRaw.includes("no") ? "No" : "No lo sé";
    lines.push(`- Foto: ${foto}`);

    // Resto de campos (no repetir los anteriores)
    const skip = new Set(["localidad", "tipo", "medidas", "ancho", "alto", "unidades", "foto"]);
    for (const f of fields) {
      if (skip.has(f.id)) continue;
      lines.push(`- ${f.label}: ${getValueOrUnknown(f.id)}`);
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

  const message = buildMessage();
  const waUrl = toWhatsAppUrl(phoneE164, message);

  const renderField = (f: SpecField) => {
    const val = values[f.id] ?? "";
    const isUnknown = !!unknown[f.id];

    const setVal = (next: string) => {
      setConfirmClose(false);
      setValues((prev) => ({ ...prev, [f.id]: next }));
    };

    const toggleUnknown = (checked: boolean) => {
      setConfirmClose(false);
      setUnknown((prev) => ({ ...prev, [f.id]: checked }));
      if (checked) setVal("");
    };

    const unknownToggle = f.type === "select" ? null : (
      <label className="flex items-center gap-2 text-xs opacity-80">
        <input type="checkbox" checked={isUnknown} onChange={(e) => toggleUnknown(e.target.checked)} />
        No lo sé
      </label>
    );

    return (
      <div key={f.id} className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium">{f.label}</label>
          {unknownToggle}
        </div>
        {f.type === "select" ? (
          <select
            className="h-11 w-full rounded-xl border border-border px-3 text-sm"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onFocus={(e) => {
              setConfirmClose(false);
              const el = e.currentTarget as HTMLElement;
              window.setTimeout(() => scrollFieldIntoView({ container: scrollRef.current, footer: footerRef.current, el }), 0);
            }}
          >
            {f.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : f.type === "textarea" ? (
          <textarea
            className="w-full rounded-xl border border-border p-3 text-sm"
            rows={f.rows ?? 4}
            placeholder={f.placeholder}
            value={val}
            disabled={isUnknown}
            onChange={(e) => setVal(e.target.value)}
            onFocus={(e) => {
              setConfirmClose(false);
              const el = e.currentTarget as HTMLElement;
              window.setTimeout(() => scrollFieldIntoView({ container: scrollRef.current, footer: footerRef.current, el }), 0);
            }}
          />
        ) : (
          <input
            className="h-11 w-full rounded-xl border border-border px-3 text-sm"
            placeholder={f.placeholder}
            type="text"
            inputMode={f.type === "number" ? "decimal" : "text"}
            value={val}
            disabled={isUnknown}
            ref={
              f.id === "localidad"
                ? (localidadRef as any)
                : f.id === "tipo"
                  ? (tipoRef as any)
                  : undefined
            }
            onChange={(e) => {
              const raw = e.target.value;
              setVal(f.type === "number" ? normalizeNumberInput(raw) : raw);
            }}
            onFocus={(e) => {
              setConfirmClose(false);
              const el = e.currentTarget as HTMLElement;
              window.setTimeout(() => scrollFieldIntoView({ container: scrollRef.current, footer: footerRef.current, el }), 0);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed left-0 right-0 z-50"
      style={{ top: topOffset, bottom: bottomInset }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dbm-quick-title"
      aria-describedby="dbm-quick-desc"
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
              <h3 id="dbm-quick-title" className="text-base font-semibold">{title}</h3>
              <p id="dbm-quick-desc" className="text-xs opacity-70">
                Rellena lo que puedas (puedes marcar “No lo sé”) y abre WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={attemptClose}
              className="rounded-lg p-2 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Cerrar"
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
            className="p-5 overflow-y-auto"
            style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", scrollPaddingBottom: footerH + 24, scrollPaddingTop: 24 } as any}
          >
            <div className="grid gap-4 md:grid-cols-2">{fields.map(renderField)}</div>

            {computedM2 ? (
              <div className="mt-4 rounded-2xl border border-border p-4 text-sm">
                <div className="font-medium">m² calculados</div>
                <div className="mt-1 opacity-80">{formatDecimalEs(computedM2, 2)} m²</div>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-border p-4">
              <div className="text-sm font-medium">Vista previa del mensaje</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed opacity-80">{message}</pre>
            </div>
          </div>

          <div ref={footerRef} className="border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-wrap items-center justify-between gap-3 bg-white">
            <Button variant="secondary" onClick={attemptClose}>
              Cancelar
            </Button>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(message);
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
                href={waUrl}
                onClick={() => {
                  const now = Date.now();
                  const msg = message;
                  if (now - lastSendRef.current.ts < 1200 && lastSendRef.current.msg === msg) return;
                  lastSendRef.current = { ts: now, msg };
                  onSubmitTrack?.();
                }}
              >
                {submitLabel ?? "Abrir WhatsApp con el mensaje"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
