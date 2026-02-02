import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import site from "@/content/es/site.json";
import QuoteWizard from "@/components/QuoteWizard";
import { Suspense } from "react";

export const metadata = buildMetadata({
  title: "Presupuesto por WhatsApp | DBM Carpinteria Metalica",
  description:
    "Pide presupuesto por WhatsApp. Envia fotos, medidas y ubicacion. Respondemos en horario laboral.",
  slug: "/presupuesto"
});

function toWhatsAppUrl(phoneE164: string, text: string) {
  const normalized = phoneE164.replace(/\s+/g, "");
  const phone = normalized.startsWith("+") ? normalized.substring(1) : normalized;
  const params = new URLSearchParams({ text });
  return `https://wa.me/${phone}?${params.toString()}`;
}

export default function PresupuestoPage() {
  const phoneE164 = site.business.phone;
  const socialLinks = (site as any)?.business?.socialLinks as
    | { label: string; href: string }[]
    | undefined;

  const presupuestoMsg = [
    "Hola, quiero pedir presupuesto.",
    "Localidad: (indicar)",
    "Trabajo: (indicar)",
    "Medidas aproximadas: (indicar)",
    "Material / acabado: (indicar)",
    "",
    "Adjunto fotos a continuacion.",
    "Gracias."
  ].join("\n");

  const visitaMsg = [
    "Hola, quiero reservar una visita para tomar medidas.",
    "Localidad: (indicar)",
    "Tipo de trabajo: (indicar)",
    "Disponibilidad aproximada: (indicar)",
    "",
    "Gracias."
  ].join("\n");

  const waPresupuesto = toWhatsAppUrl(phoneE164, presupuestoMsg);
  const waVisita = toWhatsAppUrl(phoneE164, visitaMsg);

  return (
    <Container>
      <div className="py-10 md:py-16">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Presupuesto</h1>
        <p className="mt-3 max-w-3xl opacity-80">
          Puedes pedir un presupuesto rápido (mensaje guiado) o enviarnos un presupuesto específico por WhatsApp.
        </p>

        <div className="mt-8">
          <Suspense fallback={<div className="rounded-2xl border p-6 opacity-70">Cargando…</div>}>
            <QuoteWizard phoneE164={phoneE164} />
          </Suspense>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-6 transition-all duration-200 ease-out hover:shadow-sm motion-reduce:transition-none">
            <h2 className="text-lg font-semibold">Que enviar</h2>
            <ul className="mt-4 grid gap-2 text-sm opacity-80 list-disc pl-5">
              <li>Localidad y ubicacion aproximada.</li>
              <li>Fotos del sitio o del trabajo.</li>
              <li>Medidas aproximadas o plano.</li>
              <li>Material y acabado (hierro/inox, lacado/galvanizado, etc.).</li>
            </ul>          </div>

          <aside className="rounded-2xl border p-6 transition-all duration-200 ease-out hover:shadow-sm motion-reduce:transition-none">
            <h2 className="text-lg font-semibold">Abrir WhatsApp</h2>
            <p className="mt-2 opacity-80">Te abrimos el chat con un mensaje listo. Solo tienes que enviarlo.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={waPresupuesto}>WhatsApp directo</Button>
              <Button variant="secondary" href={waVisita}>Reservar visita</Button>
              <Button variant="secondary" href="tel:+34624356893">Llamar</Button>
            </div>

            <p className="mt-6 text-sm opacity-70">
              Si tienes fotos o planos, adjuntalos directamente en WhatsApp.
            </p>

            {Array.isArray(socialLinks) && socialLinks.length ? (
              <div className="mt-6">
                <p className="text-sm font-semibold opacity-80">Redes sociales</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {socialLinks.map((l) => (
                    <Button key={l.href} variant="secondary" href={l.href}>
                      {l.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </Container>
  );
}
