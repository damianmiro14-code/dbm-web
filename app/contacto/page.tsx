import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HomeTrustStrip from "@/components/sections/HomeTrustStrip";
import { ContactActions, ContactMap, ContactWhatsAppButton, ContactWhatsAppProvider } from "@/components/ContactoV2Interactions";
import SocialIcon from "@/components/ui/SocialIcon";
import raw from "@/content/es/contacto.json";
import site from "@/content/es/site.json";
import { validatePageJSON } from "@/lib/pagejson.validate";
import { buildJsonLdFAQ, buildJsonLdLocalBusiness, buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const page = validatePageJSON(raw);

// Approved V2 ambient workshop photograph: decorative, not evidence of a DBM job.
const WORKSHOP_AMBIENCE = "/images/dbm-v2/DBM_WEB_V2_CTA_TALLER_AMBIENTACION_APROBADA.webp";

export const metadata: Metadata = buildMetadata({
  title: page.meta.title,
  description: page.meta.description,
  ogImage: page.meta.ogImage,
  slug: page.meta.slug
});

export default function ContactoPage() {
  const b = page.business;
  const phone = b?.phone ?? site.business.phone;
  const callHref = `tel:${phone.replace(/\s+/g, "")}`;
  const email = b?.email ?? site.business.email;
  const mapsUrl = b?.mapsUrl ?? site.business.mapsUrl;
  const address = b?.address ?? site.business.address;
  const addressLine = `${address.street}, ${address.postalCode} ${address.city}`;
  const hours = b?.openingHours ?? [];
  const contactSection = page.sections.find((section) => section.type === "contact");
  const faqSection = page.sections.find((section) => section.type === "faq");
  const links = contactSection?.type === "contact" ? contactSection.socialLinks : undefined;

  const localBusinessLd = buildJsonLdLocalBusiness({
    name: b?.name ?? "DBM Carpintería Metálica",
    description: page.meta.description,
    urlPath: page.meta.slug,
    telephone: b?.phone,
    email: b?.email,
    address: b?.address
      ? {
          streetAddress: b.address.street,
          addressLocality: b.address.city,
          addressRegion: b.address.region,
          postalCode: b.address.postalCode,
          addressCountry: b.address.country
        }
      : undefined,
    openingHours: b?.openingHours,
    areaServed: b?.areaServed,
    sameAs: [b?.googleProfileUrl, b?.mapsUrl].filter(Boolean) as string[]
  });
  const faqLd = faqSection?.type === "faq" ? buildJsonLdFAQ(faqSection.items) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} /> : null}

      <ContactWhatsAppProvider phoneE164={phone}>
      <section className="relative isolate overflow-hidden bg-[#101214] text-white" aria-labelledby="contacto-title">
        <Image src={WORKSHOP_AMBIENCE} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#0A0C0D]/95 via-[#0A0C0D]/80 to-black/35" />
        <Container>
          <div className="relative z-10 flex min-h-[390px] max-w-3xl flex-col justify-center py-14 sm:min-h-[440px] sm:py-20">
            <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#F97316]">
              <span aria-hidden="true" className="h-0.5 w-10 bg-[#F97316]" /> Contacto directo
            </p>
            <h1 id="contacto-title" className="mt-5 text-4xl font-extrabold uppercase leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
              Hablemos de <span className="block text-[#F97316]">tu proyecto</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Cuéntanos qué necesitas. Te atendemos directamente en Castellón y provincia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ContactWhatsAppButton className="!border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#EA580C]">Contactar por WhatsApp</ContactWhatsAppButton>
              <Button variant="secondary" href={callHref} className="!border-white/60 !bg-[#111315]/70 !text-white hover:!bg-[#111315]">Llamar</Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 text-slate-900 sm:py-20" aria-labelledby="contacto-canales-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div>
              <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#EA580C]">
                <span aria-hidden="true" className="h-0.5 w-8 bg-[#F97316]" /> Contacto directo
              </p>
              <h2 id="contacto-canales-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Estamos <span className="text-[#EA580C]">a tu disposición</span>
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-slate-600">
                Escríbenos por WhatsApp, llámanos o concierta una visita al taller. Te atenderemos de forma directa.
              </p>
              <ContactActions />
              <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-500">
                El mensaje solo llega a DBM cuando lo envías desde WhatsApp. Consulta nuestra <a href="/privacidad" className="font-semibold underline underline-offset-2">política de privacidad</a>.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-sm sm:grid-cols-2">
              <div className="bg-white p-6">
                <div aria-hidden="true" className="text-3xl text-[#EA580C]">↗</div>
                <h3 className="mt-3 font-extrabold">WhatsApp</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Cuéntanos qué trabajo necesitas y comparte fotografías o medidas.</p>
              </div>
              <div className="bg-white p-6">
                <div aria-hidden="true" className="text-3xl text-[#EA580C]">☎</div>
                <h3 className="mt-3 font-extrabold">Teléfono</h3>
                <a href={callHref} className="mt-2 block font-semibold text-slate-800 hover:text-[#EA580C]">{phone}</a>
                <p className="mt-1 text-sm text-slate-600">Llámanos para cualquier consulta.</p>
              </div>
              <div className="bg-white p-6">
                <div aria-hidden="true" className="text-3xl text-[#EA580C]">⌖</div>
                <h3 className="mt-3 font-extrabold">Dirección del taller</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{addressLine}</p>
                <p className="mt-1 text-xs text-slate-500">Atención con cita previa.</p>
              </div>
              <div className="bg-white p-6">
                <div aria-hidden="true" className="text-3xl text-[#EA580C]">◷</div>
                <h3 className="mt-3 font-extrabold">Horario</h3>
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  {hours.map((entry) => <p key={entry}>{entry}</p>)}
                </div>
              </div>
            </div>
          </div>
          {links?.length ? (
            <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-7">
              <span className="mr-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">También en redes</span>
              {links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#F97316] hover:text-[#EA580C]">
                  <SocialIcon platform={link.platform} className="h-4 w-4" /> {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <section className="bg-[#F3F4F5] py-14 text-slate-900 sm:py-20" aria-labelledby="contacto-ubicacion-title">
        <Container>
          <div className="grid items-center gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#EA580C]">Nuestra ubicación</p>
              <h2 id="contacto-ubicacion-title" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Castellón <span className="text-[#EA580C]">y provincia</span></h2>
              <p className="mt-4 max-w-lg leading-relaxed text-slate-600">
                Nuestro taller está en Castelló de la Plana. Atendemos visitas con cita previa y realizamos trabajos y montajes en la provincia de Castellón.
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-800">{addressLine}</p>
              <div className="mt-7">
                <Button href={mapsUrl} className="!border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#EA580C]">Cómo llegar</Button>
              </div>
            </div>
            <ContactMap address={addressLine} mapsUrl={mapsUrl} />
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 text-slate-900 sm:py-20" aria-labelledby="contacto-zona-title">
        <Container>
          <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#EA580C]">Zona de trabajo</p>
              <h2 id="contacto-zona-title" className="mt-3 max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">Trabajamos en Castellón y provincia</h2>
              <p className="mt-4 max-w-lg leading-relaxed text-slate-600">
                Fabricamos y montamos soluciones metálicas para particulares y empresas en Castelló de la Plana, Borriol y otros municipios de la provincia.
              </p>
              <div className="mt-6"><Button variant="secondary" href="/zonas" className="!border-slate-300 !bg-white !text-slate-900 hover:!border-[#F97316]">Ver zonas de trabajo</Button></div>
            </div>
            <div className="relative flex min-h-[250px] flex-col justify-end overflow-hidden rounded-2xl bg-[#15191B] p-8 text-white sm:min-h-[310px] sm:p-10">
              <div aria-hidden="true" className="absolute -right-16 -top-16 h-60 w-60 rounded-full border-[25px] border-[#F97316]/15" />
              <div aria-hidden="true" className="absolute right-10 top-16 h-32 w-32 rotate-45 border border-[#F97316]/35" />
              <div className="relative z-10">
                <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#F97316]">DBM · Castellón</span>
                <p className="mt-3 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">A medida, <span className="text-[#F97316]">cerca de ti.</span></p>
                <p className="mt-3 text-sm text-white/70">Taller en Castelló de la Plana · Montajes en la provincia</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {faqSection?.type === "faq" ? (
        <section className="bg-[#F3F4F5] py-12 text-slate-900 sm:py-16" aria-labelledby="contacto-faq-title">
          <Container>
            <h2 id="contacto-faq-title" className="text-2xl font-extrabold sm:text-3xl">Preguntas frecuentes</h2>
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {faqSection.items.map((item) => (
                <details key={item.q} className="group rounded-xl border border-slate-200 bg-white p-5 open:border-[#F97316]/60">
                  <summary className="cursor-pointer font-semibold marker:text-[#EA580C]">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-white py-11 text-slate-900 sm:py-14" aria-labelledby="contacto-presupuesto-title">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#EA580C]">¿Quieres presupuesto?</p>
              <h2 id="contacto-presupuesto-title" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Cuéntanos tu proyecto</h2>
              <p className="mt-3 max-w-xl text-slate-600">Con fotos, medidas aproximadas y la localidad podemos empezar a estudiar tu solicitud.</p>
            </div>
            <Button href="/presupuesto" className="!border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#EA580C]">Solicitar presupuesto</Button>
          </div>
        </Container>
      </section>

      <section className="relative isolate overflow-hidden bg-[#0D1012] py-14 text-white sm:py-20" aria-labelledby="contacto-final-title">
        <Image src={WORKSHOP_AMBIENCE} alt="" fill sizes="100vw" className="object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#090B0D]/95 via-[#0A0C0D]/80 to-black/45" />
        <Container>
          <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F97316]">Hablemos</p>
              <h2 id="contacto-final-title" className="mt-2 text-4xl font-extrabold uppercase tracking-tight">¿Hablamos<span className="text-[#F97316]">?</span></h2>
              <p className="mt-3 max-w-md text-white/80">Cuéntanos qué necesitas y te ayudaremos a encontrar la solución adecuada.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ContactWhatsAppButton className="!border-[#F97316] !bg-[#F97316] !text-[#111315] hover:!bg-[#EA580C]">WhatsApp</ContactWhatsAppButton>
              <Button variant="secondary" href={callHref} className="!border-white/50 !bg-[#111315]/80 !text-white hover:!bg-[#111315]">Llamar</Button>
            </div>
          </div>
        </Container>
      </section>

      <HomeTrustStrip />
      </ContactWhatsAppProvider>
    </>
  );
}
