"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

const MOBILE_CTA_IMAGE =
  "/images/dbm-v2/DBM_WEB_V2_CTA_TALLER_MOVIL_APROBADO.webp";
const DESKTOP_CTA_IMAGE =
  "/images/dbm-v2/DBM_WEB_V2_CTA_TALLER_AMBIENTACION_APROBADA.webp";

type HomeFinalCTAProps = {
  onWhatsApp: () => void;
};

export default function HomeFinalCTA({ onWhatsApp }: HomeFinalCTAProps) {
  return (
    <section
      aria-labelledby="home-final-cta-title"
      className="relative isolate overflow-hidden bg-[#0A0C0D] text-white"
    >
      <div className="absolute inset-x-0 top-0 h-60 overflow-hidden sm:inset-0 sm:h-auto">
        <Image
          src={MOBILE_CTA_IMAGE}
          alt="Ambientación de un taller metálico con perfiles, planos y herramientas"
          fill
          loading="lazy"
          sizes="(max-width: 639px) 100vw, 0px"
          className="object-cover object-center sm:hidden"
        />
        <Image
          src={DESKTOP_CTA_IMAGE}
          alt="Ambientación de un taller metálico con perfiles, planos y herramientas"
          fill
          loading="lazy"
          sizes="(min-width: 640px) 100vw, 0px"
          className="hidden object-cover sm:block sm:object-center"
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-60 bg-[linear-gradient(to_top,#0A0C0D_0%,transparent_28%)] sm:inset-0 sm:h-auto sm:bg-gradient-to-r sm:from-[#0A0C0D]/95 sm:via-[#0A0C0D]/75 sm:to-black/10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-t from-black/45 via-transparent to-black/15 sm:block"
      />

      <Container>
        <div className="relative z-10 flex min-h-[620px] items-end pb-14 pt-72 sm:min-h-[520px] sm:items-center sm:py-16 lg:min-h-[580px] lg:py-20">
          <div className="min-w-0 max-w-xl">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#F97316] sm:text-sm">
              <span aria-hidden="true" className="h-0.5 w-8 shrink-0 bg-[#F97316]" />
              Tu idea, en metal
            </p>
            <h2
              id="home-final-cta-title"
              className="mt-5 max-w-lg text-4xl font-extrabold uppercase leading-[0.94] tracking-[-0.04em] sm:text-5xl lg:text-6xl"
            >
              ¿Hablamos de
              <span className="block text-[#F97316]">tu proyecto?</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              Cuéntanos qué necesitas y comparte tus medidas, fotos o planos para
              preparar tu proyecto a medida.
            </p>

            <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                href="/presupuesto"
                className="w-full !border-[#F97316] !bg-[#F97316] px-6 py-3.5 font-semibold !text-[#111315] hover:!bg-[#EA580C] sm:w-auto"
              >
                Solicitar presupuesto
              </Button>
              <Button
                variant="secondary"
                onClick={onWhatsApp}
                className="w-full !border-[#25D366] !bg-[#075E54] px-6 py-3.5 font-semibold !text-white hover:!bg-[#064E46] focus-visible:!ring-[#25D366] sm:w-auto"
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
