import fs from "node:fs";

const path = "components/SiteHeader.tsx";
let s = fs.readFileSync(path, "utf8");

const oldBlock = `{/* Mobile dropdown menu */}
        {menuOpen ? (
          <div className="md:hidden pb-4">
            <div className="grid gap-2 rounded-2xl border border-border p-3 bg-white">
              {navItems.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className={mobileLinkClass(i.href)}
                  aria-current={isActive(i.href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {i.label}
                </Link>
              ))}

              <div className="mt-1 rounded-xl border border-border p-2">
                <p className="px-1 py-1 text-xs font-semibold opacity-70">Servicios</p>
                <div className="grid gap-1">
                  {SERVICES.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

              {b?.mapsUrl ? (
                <a
                  className="rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  href={b.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                >
                  Cómo llegar
                </a>
              ) : null}
            </div>
          </div>
        ) : null}`;

const newBlock = `{/* Mobile dropdown menu */}
        {menuOpen ? (
          <div className="md:hidden fixed inset-0 z-[90]">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-black/20"
              onClick={() => {
                setMenuOpen(false);
                setMobileServicesOpen(false);
              }}
            />
            <div className="absolute left-0 right-0 top-[92px] bottom-0 bg-white border-t border-border">
              <div className="h-full overflow-y-auto overscroll-contain p-4 pb-8">
                <div className="grid gap-2 rounded-2xl border border-border p-3 bg-white">
                  {navItems
                    .filter((i) => i.label !== "Servicios")
                    .map((i) => (
                      <Link
                        key={i.href}
                        href={i.href}
                        className={mobileLinkClass(i.href)}
                        aria-current={isActive(i.href) ? "page" : undefined}
                        onClick={() => {
                          setMenuOpen(false);
                          setMobileServicesOpen(false);
                        }}
                      >
                        {i.label}
                      </Link>
                    ))}

                  <div className="mt-1 rounded-xl border border-border p-2">
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                      aria-expanded={mobileServicesOpen}
                      onClick={() => setMobileServicesOpen((v) => !v)}
                    >
                      Servicios
                    </button>

                    {mobileServicesOpen ? (
                      <div className="mt-2 grid gap-1">
                        <Link
                          href="/servicios"
                          className="rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                          onClick={() => {
                            setMenuOpen(false);
                            setMobileServicesOpen(false);
                          }}
                        >
                          Ver todos los servicios
                        </Link>

                        <div className="my-1 h-px bg-slate-200" />

                        {SERVICES.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                            onClick={() => {
                              setMenuOpen(false);
                              setMobileServicesOpen(false);
                            }}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {b?.mapsUrl ? (
                    <a
                      className="rounded-xl px-3 py-2 text-sm opacity-90 hover:opacity-100 hover:bg-brand/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                      href={b.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setMenuOpen(false);
                        setMobileServicesOpen(false);
                      }}
                    >
                      Cómo llegar
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}`;

if (!s.includes(oldBlock)) {
  console.error("ERROR: no encuentro el bloque original exacto. No he tocado nada.");
  process.exit(1);
}

s = s.replace(oldBlock, newBlock);

// Asegura que existe el state (si ya existiera, no duplica)
if (!s.includes("const [mobileServicesOpen, setMobileServicesOpen] = useState(false);")) {
  s = s.replace(
    "const [menuOpen, setMenuOpen] = useState(false);",
    "const [menuOpen, setMenuOpen] = useState(false);\n  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);"
  );
}

// Cierra acordeón al navegar
s = s.replace(
  "setMenuOpen(false);\n    setServicesOpen(false);",
  "setMenuOpen(false);\n    setMobileServicesOpen(false);\n    setServicesOpen(false);"
);

// Reduce altura logo y padding header (si existen esas clases exactas)
s = s.replace('py-3">', 'py-2">');
s = s.replace('className="h-[104px] w-[104px] md:h-[160px] md:w-[160px]"', 'className="h-[64px] w-[64px] md:h-[160px] md:w-[160px]"');

// Spacer header
s = s.replace('className="h-[136px] md:h-[192px]"', 'className="h-[92px] md:h-[192px]"');

fs.writeFileSync(path, s, "utf8");
console.log("OK");
