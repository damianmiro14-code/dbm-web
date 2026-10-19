"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

type Option = { value: string; label: string };
type Props = {
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
};

type Placement = { top: number; left: number; width: number; maxHeight: number };

/**
 * Selector accesible y reutilizable, con listbox en portal para que no quede
 * recortado por el scroll de los modales. Mantiene el foco en el combobox.
 */
const DBMSelect = forwardRef<HTMLButtonElement, Props>(function DBMSelect(
  { options, value, onChange, ariaLabel, id, name, disabled = false, onFocus },
  externalRef
) {
  const uid = useId().replace(/:/g, "");
  const listId = `${uid}-listbox`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = useMemo(() => options.findIndex((opt) => opt.value === value), [options, value]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const typeSearchRef = useRef({ term: "", lastAt: 0 });

  const attachRef = useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    if (typeof externalRef === "function") externalRef(node);
    else if (externalRef) externalRef.current = node;
  }, [externalRef]);

  const recalculate = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const viewportLeft = window.visualViewport?.offsetLeft ?? 0;
    const gap = 6;
    const availableBelow = Math.max(0, viewportTop + viewportHeight - rect.bottom - gap - 8);
    const availableAbove = Math.max(0, rect.top - viewportTop - gap - 8);
    const estimatedHeight = Math.min(272, options.length * 42 + 8);
    const above = availableBelow < Math.min(estimatedHeight, 160) && availableAbove > availableBelow;
    const maxHeight = Math.max(80, Math.min(272, above ? availableAbove : availableBelow));
    const width = Math.min(rect.width, Math.max(160, viewportWidth - 16));
    const left = Math.max(viewportLeft + 8, Math.min(rect.left, viewportLeft + viewportWidth - width - 8));
    const top = above ? Math.max(viewportTop + 8, rect.top - gap - Math.min(estimatedHeight, maxHeight)) : rect.bottom + gap;
    setPlacement({ top, left, width, maxHeight });
  }, [options.length]);

  const openMenu = useCallback((startIndex?: number) => {
    if (disabled || !options.length) return;
    const initial = startIndex ?? Math.max(selectedIndex, 0);
    setActiveIndex(Math.max(0, Math.min(initial, options.length - 1)));
    recalculate();
    setOpen(true);
  }, [disabled, options.length, selectedIndex, recalculate]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    typeSearchRef.current.term = "";
  }, []);

  const chooseIndex = useCallback((index: number) => {
    const next = options[index];
    if (!next) return;
    if (next.value !== value) onChange(next.value);
    closeMenu();
    triggerRef.current?.focus();
  }, [options, value, onChange, closeMenu]);

  useEffect(() => {
    if (!open) return;
    recalculate();
    const vv = window.visualViewport;
    const onOutside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && (triggerRef.current?.contains(target) || listRef.current?.contains(target))) return;
      closeMenu();
    };
    const onWindowKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onOutside, true);
    window.addEventListener("scroll", recalculate, true);
    window.addEventListener("resize", recalculate);
    window.addEventListener("keydown", onWindowKey, true);
    vv?.addEventListener("resize", recalculate);
    vv?.addEventListener("scroll", recalculate);
    return () => {
      document.removeEventListener("pointerdown", onOutside, true);
      window.removeEventListener("scroll", recalculate, true);
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("keydown", onWindowKey, true);
      vv?.removeEventListener("resize", recalculate);
      vv?.removeEventListener("scroll", recalculate);
    };
  }, [open, recalculate, closeMenu]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-dbm-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, placement]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const n = options.length;
    if (disabled || n === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) openMenu(event.key === "ArrowDown" ? Math.max(selectedIndex, 0) : (selectedIndex < 0 ? n - 1 : selectedIndex));
      else setActiveIndex((i) => (i + (event.key === "ArrowDown" ? 1 : -1) + n) % n);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const index = event.key === "Home" ? 0 : n - 1;
      if (!open) openMenu(index);
      else setActiveIndex(index);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) chooseIndex(activeIndex);
      else openMenu();
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key === "Tab" && open) {
      closeMenu();
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      typeSearchRef.current.term = now - typeSearchRef.current.lastAt > 650 ? "" : typeSearchRef.current.term;
      typeSearchRef.current.term += event.key.toLocaleLowerCase("es");
      typeSearchRef.current.lastAt = now;
      const found = options.findIndex((item) => item.label.toLocaleLowerCase("es").startsWith(typeSearchRef.current.term));
      if (found >= 0) {
        event.preventDefault();
        if (!open) openMenu(found);
        else setActiveIndex(found);
      }
    }
  };

  return (
    <>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        ref={attachRef}
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${uid}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onFocus={onFocus}
        onClick={() => { if (open) closeMenu(); else openMenu(); }}
        onKeyDown={onKeyDown}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-[#CFD4DC] bg-white px-4 py-3 text-left text-sm text-[#172033] shadow-sm transition-colors hover:border-[#F97316]/60 focus-visible:border-[#F97316] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      >
        <span className="min-w-0 truncate">{options[selectedIndex]?.label ?? "Seleccionar"}</span>
        <svg aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#F97316] transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none">
          <path d="m5 7 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && placement && typeof document !== "undefined"
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              className="fixed z-[500] overflow-y-auto overscroll-contain rounded-xl border border-[#F97316]/40 bg-white p-1 text-sm text-[#172033] shadow-[0_16px_42px_rgba(0,0,0,0.25)]"
              style={{ top: placement.top, left: placement.left, width: placement.width, maxHeight: placement.maxHeight }}
            >
              {options.map((option, index) => (
                <li
                  key={`${index}-${option.value}`}
                  id={`${uid}-option-${index}`}
                  role="option"
                  aria-selected={option.value === value}
                  data-dbm-index={index}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => chooseIndex(index)}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 transition-colors ${activeIndex === index ? "bg-[#F97316] font-semibold text-[#17191B]" : option.value === value ? "bg-[#FFF2E7] font-semibold text-[#9A3412]" : "text-[#172033] hover:bg-[#FFF2E7]"}`}
                >
                  {option.label}
                </li>
              ))}
            </ul>,
            document.body
          )
        : null}
    </>
  );
});

export default DBMSelect;
