import fs from "node:fs";

function writeIfChanged(path, next) {
  const prev = fs.readFileSync(path, "utf8");
  if (prev !== next) fs.writeFileSync(path, next, "utf8");
}

function ensureUseRefImport(s) {
  const re = /import\s+\{\s*([^}]*)\s*\}\s+from\s+"react";/;
  const m = s.match(re);
  if (!m) return s;
  const items = m[1].split(",").map(x => x.trim()).filter(Boolean);
  if (!items.includes("useRef")) items.push("useRef");
  return s.replace(re, `import { ${items.join(", ")} } from "react";`);
}

function ensureCreatePortalImport(s) {
  if (s.includes('from "react-dom"') && s.includes("createPortal")) return s;
  const reactImportRe = /import\s+\{\s*[^}]*\}\s+from\s+"react";\s*\r?\n/;
  if (reactImportRe.test(s)) {
    return s.replace(reactImportRe, (m) => m + 'import { createPortal } from "react-dom";\n');
  }
  return 'import { createPortal } from "react-dom";\n' + s;
}

function ensureState(s) {
  if (s.includes("const [mobileServicesOpen, setMobileServicesOpen] = useState(false);")) return s;
  return s.replace(
    "const [menuOpen, setMenuOpen] = useState(false);",
    "const [menuOpen, setMenuOpen] = useState(false);\n  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);"
  );
}

function ensureHeaderRef(s) {
  if (s.includes("const headerRef = useRef<HTMLElement | null>(null);")) return s;
  s = s.replace(
    "const pathname = usePathname();",
    "const pathname = usePathname();\n  const headerRef = useRef<HTMLElement | null>(null);"
  );
  // add ref attr to header tag
  if (!s.includes("ref={headerRef}")) {
    s = s.replace(
      /<header\s+className="/,
      '<header ref={headerRef} className="'
    );
  }
  return s;
}

function ensureRouteClose(s) {
  const marker = "// Cierra menús al navegar entre páginas.";
  const idx = s.indexOf(marker);
  if (idx < 0) return s;
  const end = s.indexOf("}, [pathname]);", idx);
  if (end < 0) return s;
  const block = s.slice(idx, end);
  if (block.includes("setMobileServicesOpen(false);")) return s;

  const blockEnd = end + "}, [pathname]);".length;
  const before = s.slice(0, idx);
  const mid = s.slice(idx, blockEnd);
  const after = s.slice(blockEnd);

  // inject after first setMenuOpen(false); inside that block region
  let mid2 = mid.replace(
    /setMenuOpen\(false\);\s*\r?\n/,
    (m) => m + "    setMobileServicesOpen(false);\n"
  );

  return before + mid2 + after;
}

function ensureHeaderHeightVarAndBodyLock(s) {
  const anchor = "}, [pathname]);";
  if (!s.includes(anchor)) return s;

  let insert = "";

  if (!s.includes('document.documentElement.style.setProperty("--site-header-h"')) {
    insert += `
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof window === "undefined") return;

    const setVar = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--site-header-h", \`\${h}px\`);
    };

    setVar();

    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);
    window.addEventListener("resize", setVar);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, []);
`;
  }

  if (!s.includes('document.body.style.overflow = "hidden"')) {
    insert += `
  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);
`;
  }

  if (!insert) return s;
  // only replace first occurrence
  const i = s.indexOf(anchor);
  return s.slice(0, i + anchor.length) + insert + s.slice(i + anchor.length);
}

function reduceHeaderHeightMobile(s) {
  s = s.replace(
    'className="grid grid-cols-2 md:grid-cols-3 items-center gap-3 py-3"',
    'className="grid grid-cols-2 md:grid-cols-3 items-center gap-3 py-2"'
  );
  s = s.replace(
    'className="h-[104px] w-[104px] md:h-[160px] md:w-[160px]',
    'className="h-[72px] w-[72px] md:h-[160px] md:w-[160px]'
  );
  return s;
}

function makeSpacerDynamic(s) {
  s = s.replace(
    /<div aria-hidden className="h-\[\d+px\] md:h-\[\d+px\]" \/>/,
    '<div aria-hidden style={{ height: "var(--site-header-h, 136px)" }} />'
  );
  return s;
}

function replaceMobileMenuWithPortal(s) {
  const marker = "{/* Mobile dropdown menu */}";
  const start = s.indexOf(marker);
  if (start < 0) throw new Error("No encuentro el marcador del menú móvil");

  const containerIdx = s.indexOf("</Container>", start);
  if (containerIdx < 0) throw new Error("No encuentro </Container> tras el menú");

  const end0 = s.lastIndexOf(") : null}", containerIdx);
  if (end0 < 0 || end0 < start) throw new Error("No encuentro el cierre del bloque del menú");
  const end = end0 + ") : null}".length;

  const replacement = [
    "{/* Mobile dropdown menu */}",
    "        {typeof document !== \"undefined\" && menuOpen",
    "          ? createPortal(",
    "              <div",
    "                className=\"md:hidden fixed left-0 right-0 bottom-0 z-[9100]\"",
    "                style={{ top: \"var(--site-header-h, 136px)\" }}",
    "              >",
    "                <div className=\"absolute inset-0 bg-white border-t border-border\">",
    "                  <div className=\"h-full overflow-y-auto overscroll-contain p-4 pb-8\">",
    "                    <div className=\"grid gap-2 rounded-2xl border border-border p-3 bg-white\">",
    "                      {navItems",
    "                        .filter((i) => i.label !== \"Servicios\")",
    "                        .map((i) => (",
    "                          <Link",
    "                            key={i.href}",
    "                            href={i.href}",
    "                            className={mobileLinkClass(i.href)}",
    "                            aria-current={isActive(i.href) ? \"page\" : undefined}",
    "                            onClick={() => {",
    "                              setMenuOpen(false);",
    "                              setMobileServicesOpen(false);",
    "                            }}",
    "                          >",
    "                            {i.label}",
    "                          </Link>",
    "                        ))}",
    "",
    "                      <div className=\"mt-1 rounded-xl border border-border p-2\">",
    "                        <button",
    "                          type=\"button\"",
    "                          className=\"w-full rounded-xl px-3 py-2 text-left text-sm font-semibold opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2\"",
    "                          aria-expanded={mobileServicesOpen}",
    "                          onClick={() => setMobileServicesOpen((v) => !v)}",
    "                        >",
    "                          Servicios",
    "                        </button>",
    "",
    "                        {mobileServicesOpen ? (",
    "                          <div className=\"mt-2 grid gap-1\">",
    "                            <Link",
    "                              href=\"/servicios\"",
    "                              className=\"rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2\"",
    "                              onClick={() => {",
    "                                setMenuOpen(false);",
    "                                setMobileServicesOpen(false);",
    "                              }}",
    "                            >",
    "                              Ver todos los servicios",
    "                            </Link>",
    "",
    "                            <div className=\"my-1 h-px bg-slate-200\" />",
    "",
    "                            {SERVICES.map((s) => (",
    "                              <Link",
    "                                key={s.href}",
    "                                href={s.href}",
    "                                className=\"rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2\"",
    "                                onClick={() => {",
    "                                  setMenuOpen(false);",
    "                                  setMobileServicesOpen(false);",
    "                                }}",
    "                              >",
    "                                {s.label}",
    "                              </Link>",
    "                            ))}",
    "                          </div>",
    "                        ) : null}",
    "                      </div>",
    "",
    "                      {b?.mapsUrl ? (",
    "                        <a",
    "                          className=\"rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2\"",
    "                          href={b.mapsUrl}",
    "                          target=\"_blank\"",
    "                          rel=\"noopener noreferrer\"",
    "                          onClick={() => {",
    "                            setMenuOpen(false);",
    "                            setMobileServicesOpen(false);",
    "                          }}",
    "                        >",
    "                          Cómo llegar",
    "                        </a>",
    "                      ) : null}",
    "                    </div>",
    "                  </div>",
    "                </div>",
    "              </div>,",
    "              document.body",
    "            )",
    "          : null}",
  ].join("\n");

  return s.slice(0, start) + replacement + s.slice(end);
}

function fixSiteHeader() {
  const path = "components/SiteHeader.tsx";
  let s = fs.readFileSync(path, "utf8");

  s = ensureUseRefImport(s);
  s = ensureCreatePortalImport(s);
  s = ensureState(s);
  s = ensureHeaderRef(s);
  s = ensureRouteClose(s);
  s = ensureHeaderHeightVarAndBodyLock(s);
  s = reduceHeaderHeightMobile(s);
  s = makeSpacerDynamic(s);
  s = replaceMobileMenuWithPortal(s);

  writeIfChanged(path, s);
}

function fixLightbox() {
  const path = "components/ui/ImageGridLightbox.tsx";
  let s = fs.readFileSync(path, "utf8");
  s = s.replace(/className="fixed inset-0 z-(?:50|\[1000\]) /g, 'className="fixed inset-0 z-[10000] ');
  writeIfChanged(path, s);
}

try {
  fixSiteHeader();
  fixLightbox();
  console.log("OK");
} catch (e) {
  console.error("ERROR:", e?.message || e);
  process.exit(1);
}
