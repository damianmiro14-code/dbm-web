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
          <div className="text-sm opacity-80">
            <p><strong>Tel:</strong> {b?.phone ?? "+34 624 356 893"}</p>
            <p><strong>Email:</strong> {b?.email ?? "dbmmultiservicios24@gmail.com"}</p>
            {b?.address ? (
              <p>
                <strong>Dirección:</strong> {b.address.street}, {b.address.postalCode} {b.address.city}, {b.address.region}
              </p>
            ) : null}
            {b?.openingHours?.length ? (
              <p><strong>Horario:</strong> {b.openingHours.join(" · ")}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-4">
              <a className="text-brand underline decoration-accent/50 hover:decoration-accent" href="/zonas">
                Zonas de servicio
              </a>
              <a className="text-brand underline decoration-accent/50 hover:decoration-accent" href="/preguntas-frecuentes">
                Preguntas frecuentes
              </a>
              {b?.mapsUrl ? (
                <a className="text-brand underline decoration-accent/50 hover:decoration-accent" href={b.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Cómo llegar
                </a>
              ) : null}
              {b?.googleProfileUrl ? (
                <a className="text-brand underline decoration-accent/50 hover:decoration-accent" href={b.googleProfileUrl} target="_blank" rel="noopener noreferrer">
                  Ver reseñas en Google
                </a>
              ) : null}
              {Array.isArray(socialLinks) && socialLinks.length ? (
                <span className="inline-flex flex-wrap gap-4">
                  {socialLinks.map((l) => (
                    <a
                      key={l.href}
                      className="text-brand underline decoration-accent/50 hover:decoration-accent"
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {l.label}
                    </a>
                  ))}
                </span>
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
