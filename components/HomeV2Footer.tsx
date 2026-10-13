import Image from "next/image";

import Container from "@/components/ui/Container";
import type { Business } from "@/lib/pagejson.types";

const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Trabajos", href: "/trabajos" },
  { label: "Opiniones", href: "/opiniones" },
  { label: "Zonas de servicio", href: "/zonas" },
  { label: "Presupuesto", href: "/presupuesto" },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
];

const linkClassName =
  "rounded-sm text-stone-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#191919]";

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25c0 8.284 6.716 15 15 15h.75a.75.75 0 0 0 .75-.75v-2.574a.75.75 0 0 0-.568-.728l-3.206-.802a.75.75 0 0 0-.773.29l-.704.939a.75.75 0 0 1-.838.258 12.035 12.035 0 0 1-7.044-7.044.75.75 0 0 1 .258-.838l.939-.704a.75.75 0 0 0 .29-.773l-.802-3.206A.75.75 0 0 0 7.074 4.5H4.5a.75.75 0 0 0-.75.75Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.659 5.493a2.25 2.25 0 0 1-2.182 0L2.25 6.75" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6.75-5.25 6.75-11.25a6.75 6.75 0 1 0-13.5 0C5.25 15.75 12 21 12 21Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.375a2.625 2.625 0 1 0 0-5.25 2.625 2.625 0 0 0 0 5.25Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M12.04 2a9.84 9.84 0 0 0-8.47 14.82L2 22l5.31-1.52A9.96 9.96 0 1 0 12.04 2Zm0 17.95a8.02 8.02 0 0 1-4.09-1.12l-.29-.17-3.15.9.92-3.07-.19-.31a7.88 7.88 0 0 1-1.22-4.22 8.02 8.02 0 1 1 8.02 7.99Zm4.4-5.99c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.37-1.94-1.19a7.28 7.28 0 0 1-1.34-1.66c-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.09 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  if (platform.toLowerCase() === "instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (platform.toLowerCase() === "facebook") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M13.5 21v-8h2.75l.41-3H13.5V8.08c0-.87.24-1.46 1.58-1.46h1.69V3.94a22.5 22.5 0 0 0-2.46-.13c-2.43 0-4.1 1.49-4.1 4.22V10H7.46v3h2.75v8h3.29Z" />
      </svg>
    );
  }

  if (platform.toLowerCase() === "youtube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M21.58 7.19a2.99 2.99 0 0 0-2.1-2.12C17.62 4.57 12 4.57 12 4.57s-5.62 0-7.48.5a2.99 2.99 0 0 0-2.1 2.12A31.2 31.2 0 0 0 1.92 12c0 1.61.17 3.22.5 4.81a2.99 2.99 0 0 0 2.1 2.12c1.86.5 7.48.5 7.48.5s5.62 0 7.48-.5a2.99 2.99 0 0 0 2.1-2.12c.33-1.59.5-3.2.5-4.81s-.17-3.22-.5-4.81ZM9.98 15.14V8.86L15.2 12l-5.22 3.14Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M14.26 3c.16 1.38.93 2.62 2.08 3.4a5.7 5.7 0 0 0 3.16.96v3.28a8.8 8.8 0 0 1-5.24-1.77v6.55a5.58 5.58 0 1 1-4.8-5.53v3.35a2.3 2.3 0 1 0 1.52 2.18V3h3.28Z" />
    </svg>
  );
}

export default function SiteFooter({ business }: { business?: Business }) {
  const b = business;
  const name = b?.name ?? "DBM Carpintería Metálica";
  const phone = b?.phone ?? "+34 624 356 893";
  const email = b?.email ?? "dbmmultiservicios24@gmail.com";
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneHref = `tel:+${phoneDigits}`;
  const socialLinks = [
    ...(b?.socialLinks ?? []),
    {
      platform: "youtube",
      label: "YouTube",
      href: "https://youtube.com/@dbm_multiservicios",
    },
  ];

  return (
    <footer className="overflow-hidden border-t-4 border-orange-500 bg-[#191919] text-stone-100">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-[1.15fr_0.9fr_1.2fr] md:gap-8 lg:gap-14 lg:py-14">
          <div className="min-w-0">
            <a
              href="/"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#191919]"
              aria-label={`${name}, inicio`}
            >
              <Image src="/logo.png" alt={`Logo de ${name}`} width={104} height={104} className="h-24 w-24 object-contain" />
            </a>
            <p className="mt-5 max-w-sm text-sm leading-6 text-stone-300">
              {b?.areaServed ?? "Carpintería metálica en Castellón y alrededores."}
            </p>
          </div>

          <nav aria-label="Navegación del pie de página" className="min-w-0">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-400">Navegación</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-1 lg:grid-cols-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a className={`${linkClassName} inline-flex min-h-11 items-center py-2`} href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-400">Contacto</h2>
            <address className="mt-5 space-y-4 text-sm not-italic text-stone-300">
              <a className={`${linkClassName} flex min-h-11 items-center gap-3`} href={phoneHref}>
                <span className="text-orange-400"><PhoneIcon /></span>
                <span>{phone}</span>
              </a>
              <a className={`${linkClassName} flex min-h-11 items-center gap-3 break-all sm:break-normal`} href={`mailto:${email}`}>
                <span className="text-orange-400"><MailIcon /></span>
                <span>{email}</span>
              </a>
              {b?.address ? (
                b.mapsUrl ? (
                  <a className={`${linkClassName} flex min-h-11 items-start gap-3 py-2`} href={b.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <span className="mt-0.5 text-orange-400"><PinIcon /></span>
                    <span>{b.address.street}, {b.address.postalCode} {b.address.city}, {b.address.region}</span>
                  </a>
                ) : (
                  <p className="flex items-start gap-3 py-2">
                    <span className="mt-0.5 text-orange-400"><PinIcon /></span>
                    <span>{b.address.street}, {b.address.postalCode} {b.address.city}, {b.address.region}</span>
                  </p>
                )
              ) : null}
            </address>

            <a
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-bold text-[#102817] shadow-lg shadow-black/20 transition-colors hover:bg-[#20c45b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#191919] sm:w-auto"
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Contactar con ${name} por WhatsApp`}
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 py-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {b?.openingHours?.length ? (
              <div className="flex items-start gap-3 text-sm text-stone-300">
                <span className="mt-0.5 text-orange-400"><ClockIcon /></span>
                <div>
                  <p className="font-semibold text-white">Horario</p>
                  <p className="mt-1 leading-6">{b.openingHours.join(" · ")}</p>
                </div>
              </div>
            ) : null}

            {socialLinks.length ? (
              <nav aria-label="Redes sociales">
                <ul className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-stone-200 transition-colors hover:border-orange-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191919]"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SocialIcon platform={link.platform} />
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>

          <p className="mt-7 border-t border-white/10 pt-6 text-xs leading-5 text-stone-400">
            © {new Date().getFullYear()} {name}. Todos los derechos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
