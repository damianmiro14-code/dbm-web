import fs from "node:fs";

const path = "components/SiteHeader.tsx";
let s = fs.readFileSync(path, "utf8");

// 1) Extraer TODO el bloque del menú móvil completo
const marker = "{/* Mobile dropdown menu */}";
const start = s.indexOf(marker);
if (start < 0) throw new Error("No encuentro el marcador del menú móvil");

const containerIdx = s.indexOf("</Container>", start);
if (containerIdx < 0) throw new Error("No encuentro </Container> después del menú");

const end0 = s.lastIndexOf(") : null}", containerIdx);
if (end0 < 0 || end0 < start) throw new Error("No encuentro el cierre completo del menú");
const end = end0 + ") : null}".length;

let menu = s.slice(start, end);

// 2) Asegurar overlay por encima (z muy alto) y que no tape el header (top dinámico)
if (!s.includes("const [headerH, setHeaderH]")) {
  s = s.replace(
    "const [menuOpen, setMenuOpen] = useState(false);",
    "const [menuOpen, setMenuOpen] = useState(false);\n  const [headerH, setHeaderH] = useState(92);"
  );
}

if (!s.includes("headerRef")) {
  if (!s.includes("useRef")) {
    s = s.replace(
      'import { useEffect, useMemo, useState } from "react";',
      'import { useEffect, useMemo, useRef, useState } from "react";'
    );
  }
  s = s.replace(
    "const pathname = usePathname();",
    "const pathname = usePathname();\n  const headerRef = useRef<HTMLElement | null>(null);"
  );
  // meter ref en el header
  s = s.replace('<header className="', '<header ref={headerRef} className="');
}

// medir altura del header (una vez + resize)
if (!s.includes("setHeaderH(Math.ceil")) {
  s = s.replace(
    "}, [pathname]);",
    `}, [pathname]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () => setHeaderH(Math.ceil(el.getBoundingClientRect().height));
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);`
  );
}

// bloquear scroll del body cuando menú abierto
if (!s.includes('document.body.style.overflow = "hidden"')) {
  s = s.replace(
    "}, [menuOpen]);",
    "}, [menuOpen]);"
  );
  // Insertarlo si no existe ningún effect de menuOpen
  if (!s.includes("useEffect(() => {\n    if (!menuOpen) return;")) {
    s = s.replace(
      "}, []);",
      `}, []);

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
}

// ajustar wrapper del overlay del menú
menu = menu.replace(
  /<div className="md:hidden[^"]*">/,
  '<div className="md:hidden fixed left-0 right-0 bottom-0 z-[9000]" style={{ top: headerH }}>'
);

// 3) Quitar el menú de dentro del header
s = s.slice(0, start) + "{/* Mobile dropdown menu (moved below header) */}" + s.slice(end);

// 4) Insertarlo justo después de </header>
const hClose = s.indexOf("</header>");
if (hClose < 0) throw new Error("No encuentro </header>");
const insertAt = hClose + "</header>".length;

s = s.slice(0, insertAt) + "\n\n      " + menu + "\n" + s.slice(insertAt);

fs.writeFileSync(path, s, "utf8");
console.log("OK");
