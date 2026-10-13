import Image from "next/image";

import Container from "@/components/ui/Container";

const PROCESS_MOBILE_IMAGE =
  "/images/dbm-v2/DBM_WEB_V2_PROCESO_SOLDADOR_MOVIL_APROBADO.webp";

const PROCESS_DESKTOP_IMAGE =
  "/images/dbm-v2/DBM_WEB_V2_PROCESO_SOLDADOR_AMBIENTACION.webp";

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Medimos",
    description: "Revisamos el espacio y las medidas necesarias para el proyecto.",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        fill="none"
        className="h-7 w-7"
      >
        <path
          d="M6 9.5h20v13H6zM10 9.5v4m4-4v2.5m4-2.5v4m4-4v2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Fabricamos",
    description: "Preparamos y trabajamos las piezas metálicas en taller.",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        fill="none"
        className="h-7 w-7"
      >
        <path
          d="m9 23 11.5-11.5 3 3L12 26H9v-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m20 9 1-3m3.5 5.5 2.5-1.5M22.5 14l3 1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Montamos",
    description: "Instalamos y ajustamos el conjunto en su ubicación.",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        fill="none"
        className="h-7 w-7"
      >
        <path
          d="M7 25h18M10 25V9h12v16M14 13h4m-4 4h4m-4 4h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

export default function HomeProcess() {
  return (
    <section
      aria-label="Nuestro proceso: Del plano a la realidad"
      className="relative isolate overflow-hidden bg-[#0B0D0E] text-white lg:min-h-[660px]"
    >
      <div className="lg:hidden">
        <Container>
          <div className="py-12 sm:py-14">
            <div className="max-w-md">
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#F97316] sm:text-sm">
                <span aria-hidden="true" className="h-0.5 w-8 bg-[#F97316]" />
                Nuestro proceso
              </p>
              <h2
                className="mt-5 text-4xl font-extrabold uppercase leading-[0.94] tracking-[-0.04em] sm:text-5xl"
              >
                Del plano
                <span className="block text-[#F97316]">a la realidad</span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                Cada trabajo parte de las medidas y se desarrolla con fabricación y
                montaje adaptados al proyecto.
              </p>
            </div>
          </div>
        </Container>

        <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
          <Image
            src={PROCESS_MOBILE_IMAGE}
            alt="Ambientación industrial de una persona soldando metal en un taller"
            fill
            sizes="(max-width: 639px) 100vw, 0px"
            className="object-cover object-center sm:hidden"
          />
          <Image
            src={PROCESS_DESKTOP_IMAGE}
            alt="Ambientación industrial de una persona soldando metal en un taller"
            fill
            sizes="(min-width: 640px) and (max-width: 1023px) 100vw, 0px"
            className="hidden object-cover object-[72%_center] sm:block"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0B0D0E] to-transparent"
          />
        </div>

        <div className="bg-[#0B0D0E] pb-12 pt-2 sm:pb-14">
          <Container>
            <ol className="min-w-0 divide-y divide-white/20 border-y border-white/20">
              {PROCESS_STEPS.map((step) => (
                <li
                  key={step.number}
                  className="flex min-w-0 items-start gap-4 px-4 py-5 sm:px-6"
                >
                  <div className="flex shrink-0 flex-col items-center gap-2 text-[#F97316]">
                    <span className="text-2xl font-extrabold leading-none tabular-nums sm:text-3xl">
                      {step.number}
                    </span>
                    {step.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold uppercase tracking-[0.04em] sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </div>
      </div>

      <Image
        src={PROCESS_DESKTOP_IMAGE}
        alt="Ambientación industrial de una persona soldando metal en un taller"
        fill
        sizes="100vw"
        className="hidden object-cover object-[67%_center] sm:object-[64%_center] lg:block lg:object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-[#080A0B] via-[#080A0B]/90 to-black/20 sm:via-[#080A0B]/80 lg:block lg:via-[#080A0B]/60 lg:to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-t from-[#080A0B] via-[#080A0B]/15 to-black/15 lg:block"
      />

      <Container>
        <div className="relative z-10 hidden min-h-[820px] flex-col justify-between py-14 sm:min-h-[760px] sm:py-16 lg:flex lg:min-h-[660px] lg:py-20">
          <div className="max-w-[17rem] sm:max-w-md lg:max-w-xl">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#F97316] sm:text-sm">
              <span aria-hidden="true" className="h-0.5 w-8 bg-[#F97316]" />
              Nuestro proceso
            </p>
            <h2
              className="mt-5 text-4xl font-extrabold uppercase leading-[0.94] tracking-[-0.04em] sm:text-5xl lg:text-6xl"
            >
              Del plano
              <span className="block text-[#F97316]">a la realidad</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              Cada trabajo parte de las medidas y se desarrolla con fabricación y
              montaje adaptados al proyecto.
            </p>
          </div>

          <ol className="mt-20 grid min-w-0 border-y border-white/20 bg-black/30 backdrop-blur-[2px] sm:mt-16 lg:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step.number}
                className={`flex min-w-0 items-start gap-4 px-4 py-5 sm:px-6 lg:min-h-40 lg:px-7 lg:py-7 ${
                  index > 0
                    ? "border-t border-white/20 lg:border-l lg:border-t-0"
                    : ""
                }`}
              >
                <div className="flex shrink-0 flex-col items-center gap-2 text-[#F97316]">
                  <span className="text-2xl font-extrabold leading-none tabular-nums sm:text-3xl">
                    {step.number}
                  </span>
                  {step.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold uppercase tracking-[0.04em] sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
