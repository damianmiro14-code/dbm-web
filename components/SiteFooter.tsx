import Container from "@/components/ui/Container";
import type { Business } from "@/lib/pagejson.types";

export default function SiteFooter({ business }: { business?: Business }) {
  const b = business;
  const socialLinks = b?.socialLinks;
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container>
        <div className="py-10 grid gap-6 md:grid-cols-2">
          <div>
            <p className="font-semibold">{b?.name ?? "DBM Carpintería Metálica"}</p>
            <p className="mt-2 text-sm opacity-80">{b?.areaServed ?? "Castellón y alrededores: Castelló de la Plana, Borriol y municipios cercanos en toda la provincia."}</p>
            <p className="mt-4 text-sm opacity-80">
              <strong>Respondemos el mismo día</strong> en horario laboral. Atención en nave con cita previa.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">📞</span>
                <div className="min-w-0">
                  <p className="font-semibold">Teléfono</p>
                  <a className="break-words underline decoration-slate-300 hover:decoration-slate-500" href={"tel:" + (b?.phone ?? "+34 624 356 893").replace(/\s+/g,"")}>
                    {b?.phone ?? "+34 624 356 893"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">✉️</span>
                <div className="min-w-0">
                  <p className="font-semibold">Email</p>
                  <a className="break-words underline decoration-slate-300 hover:decoration-slate-500" href={"mailto:" + (b?.email ?? "dbmmultiservicios24@gmail.com")}>
                    {b?.email ?? "dbmmultiservicios24@gmail.com"}
                  </a>
                </div>
              </div>

              {b?.address ? (
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">📍</span>
                  <div className="min-w-0">
                    <p className="font-semibold">Dirección</p>
                    <p className="opacity-90">
                      {b.address.street}, {b.address.postalCode} {b.address.city}, {b.address.region}
                    </p>
                  </div>
                </div>
              ) : null}

              {b?.openingHours?.length ? (
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">🕒</span>
                  <div className="min-w-0">
                    <p className="font-semibold">Horario</p>
                    <p className="opacity-90">{b.openingHours.join(" · ")}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
                href={"tel:" + (b?.phone ?? "+34 624 356 893").replace(/\D/g,"")}
                aria-label="Llamar"
              >
                📞 Llamar
              </a>

              <a
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#25D366] px-3 py-2 text-sm text-white hover:bg-[#1EBE5D] transition-colors"
                href={"https://wa.me/" + (b?.phone ?? "+34 624 356 893").replace(/\D/g,"")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                💬 WhatsApp
              </a>

              {b?.mapsUrl ? (
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
                  href={b.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📍 Cómo llegar
                </a>
              ) : null}

              {b?.googleProfileUrl ? (
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
                  href={b.googleProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ⭐ Reseñas
                </a>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors" href="/zonas">
                Zonas de servicio
              </a>
              <a className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors" href="/preguntas-frecuentes">
                Preguntas frecuentes
              </a>
              {b?.mapsUrl ? (
                <a className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors" href={b.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Cómo llegar
                </a>
              ) : null}
              {b?.googleProfileUrl ? (
                <a className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100 transition-colors" href={b.googleProfileUrl} target="_blank" rel="noopener noreferrer">
                  Reseñas en Google
                </a>
              ) : null}
              {Array.isArray(socialLinks) && socialLinks.length ? (
                <>
                  <span className="w-full h-px bg-slate-200 my-2" />
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((l) => (
                      <a
                        key={l.href}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="py-6 border-t border-slate-200 text-xs opacity-70">
          <p>© {new Date().getFullYear()} {b?.name ?? "DBM Carpintería Metálica"}. Todos los derechos reservados.</p>
        </div>
      </Container>
    </footer>
  );
}


