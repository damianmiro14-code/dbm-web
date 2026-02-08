import fs from "node:fs";

const path = "components/SiteHeader.tsx";
let s = fs.readFileSync(path, "utf8");

function mustInclude(needle, msg) {
  if (!s.includes(needle)) {
    console.error("ERROR:", msg);
    process.exit(1);
  }
}

// 1) Importa useRef si falta
if (!s.includes("useRef")) {
  s = s.replace(
    'import { useEffect, useMemo, useState } from "react";',
    'import { useEffect, useMemo, useRef, useState } from "react";'
  );
}

// 2) Crea headerRef (si falta)
if (!s.includes("const headerRef = useRef")) {
  mustInclude("const pathname = usePathname();", "No encuentro `const pathname = usePathname();`");
  s = s.replace(
    "const pathname = usePathname();",
    "const pathname = usePathname();\n  const headerRef = useRef<HTMLElement | null>(null);"
  );
}

// 3) Añade effects: (a) medir altura header -> CSS var, (b) bloquear scroll body cuando menú abierto
if (!s.includes("--site-header-h")) {
  mustInclude("}, [pathname]);", "No encuentro el useEffect de pathname para insertar debajo");
  s = s.replace(
    "}, [pathname]);",
    `}, [pathname]);

  // Mide altura real del header y la expone como CSS var para evitar solapes.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const setVar = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--site-header-h", \`\${Math.ceil(h)}px\`);
    };

    setVar();

    // Actualiza si cambia el tamaño (responsive / fuentes / etc.)
    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);
    window.addEventListener("resize", setVar);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);

  // Scroll interno en menú: bloquea el body cuando el menú móvil está abierto.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);`
  );
}

// 4) Pone ref en el <header>
s = s.replace(
  '<header className="fixed top-0 left-0 right-0 z-[100] ',
  '<header ref={headerRef} className="fixed top-0 left-0 right-0 z-[100] '
);

// 5) Menú overlay: z alto + top por CSS var (no tapa header y nunca queda por detrás)
s = s.replace(
  'className="md:hidden fixed left-0 right-0 bottom-0 top-[92px] z-[90]"',
  'className="md:hidden fixed left-0 right-0 bottom-0 z-[900]" style={{ top: "var(--site-header-h, 120px)" }}'
);
s = s.replace(
  'className="md:hidden fixed inset-0 z-[90]"',
  'className="md:hidden fixed left-0 right-0 bottom-0 z-[900]" style={{ top: "var(--site-header-h, 120px)" }}'
);

// 6) Panel interno: si el wrapper ya tiene top, el panel debe ser inset-0 (sin otro top extra)
s = s.replace(
  'className="absolute left-0 right-0 top-[92px] bottom-0 bg-white border-t border-border"',
  'className="absolute inset-0 bg-white border-t border-border"'
);

// 7) Spacer: altura por CSS var (se acabó “se monta”)
s = s.replace(
  /<div aria-hidden className="h-\[\d+px\] md:h-\[\d+px\]" \/>/g,
  '<div aria-hidden style={{ height: "var(--site-header-h, 120px)" }} />'
);

fs.writeFileSync(path, s, "utf8");
console.log("OK");
