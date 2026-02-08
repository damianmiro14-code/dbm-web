import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { existsSync } from "fs";
import path from "path";
import site from "@/content/es/site.json";
import SocialIcon from "@/components/ui/SocialIcon";

function pickHomeHeroImage() {
  // Target image the user wants: "escalera metálica con luces azules".
  // If the file exists in /public, it will be used automatically without further code changes.
  const preferredBase = "inicio-escalera-azul";
  const exts = [".jpg", ".jpeg", ".png", ".webp"] as const;

  const found = exts
    .map((ext) => {
      const filename = `${preferredBase}${ext}`;
      return {
        publicPath: `/images/hero/${filename}`,
        fsPath: path.join(process.cwd(), "public", "images", "hero", filename)
      };
    })
    .find((x) => existsSync(x.fsPath));

  // Fallback to a known existing work image so the home hero never breaks.
  const fallbackPublicPath = "/images/work/categorized/techo-porche-metalico/dbm-techo-porche-metalico-01.jpg";

  const src = found ? found.publicPath : fallbackPublicPath;
  const alt =
    found && src === found.publicPath
      ? "Escalera metálica (DBM) — ejemplo real"
      : "Trabajo real de carpintería metálica (DBM)";

  return { src, alt };
}

export default function HomePage() {
  const heroImg = pickHomeHeroImage();
  const socialLinks = (site as any)?.business?.socialLinks as
    | { platform?: string; label: string; href: string }[]
    | undefined;

  return (
    <Container>
      <div className="py-12 md:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-section to-white p-6 shadow-sm md:p-10">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
                DBM Carpintería Metálica
              </h1>
              <p className="mt-4 max-w-2xl opacity-80">
                Castellón y alrededores: Castelló de la Plana, Borriol y municipios cercanos en toda la provincia.
                Soldadura MIG/MAG, TIG (inox) y electrodo. Estructuras, puertas, rejas, panel sándwich y montajes industriales.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-sm text-brand">
                  Respuesta por WhatsApp
                </span>
                <span className="inline-flex items-center rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-sm text-brand">
                  Trabajos verificados
                </span>
                <span className="inline-flex items-center rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-sm text-brand">
                  Castellón y provincia
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/servicios">Ver servicios</Button>
                <Button variant="secondary" href="/presupuesto">
                  Presupuesto rápido
                </Button>
              </div>

              {Array.isArray(socialLinks) && socialLinks.length ? (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-60">Síguenos</span>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm hover:bg-section"
                        aria-label={l.label}
                        title={l.label}
                      >
                        <SocialIcon platform={l.platform} className="h-4 w-4" />
                        <span className="hidden sm:inline">{l.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-white shadow-md">
                <Image
                  src={heroImg.src}
                  alt={heroImg.alt}
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 768px) 520px, 100vw"
                />
              </div>
              <p className="mt-3 text-sm opacity-80">
                Ejemplo real: fabricación, soldadura e instalación.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Respondemos el mismo día</h2>
          <p className="mt-2 opacity-80">
            Atención en nave con cita previa. Para presupuestar más rápido, envía fotos y medidas por WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="px-4 py-2 text-sm" variant="secondary" href="/contacto">
              Contacto
            </Button>
            <Button className="px-4 py-2 text-sm" variant="secondary" href="/servicios">
              Servicios
            </Button>
            <Button className="px-4 py-2 text-sm" variant="secondary" href="/presupuesto">
              Presupuesto rápido
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}

