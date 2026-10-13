import Container from "@/components/ui/Container";

const TRUST_ITEMS = [
  {
    label: "Trabajos reales",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="h-6 w-6">
        <path
          d="M6 24.5 13.5 17l4 4L26 12.5M20.5 12.5H26V18"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Fabricación a medida",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="h-6 w-6">
        <path
          d="M6 10h20v12H6zM10 10v4m4-4v2.5m4-2.5v4m4-4v2.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Castellón y provincia",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="h-6 w-6">
        <path
          d="M24 13.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="13.5" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    label: "Atención directa",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" className="h-6 w-6">
        <path
          d="M9 23.5 6.5 26v-6A9.5 9.5 0 1 1 16 25.5H11"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.5 15.5h9M11.5 11.5h6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

export default function HomeTrustStrip() {
  return (
    <section
      aria-labelledby="home-trust-title"
      className="border-y border-white/10 bg-[#17191B] text-white"
    >
      <h2 id="home-trust-title" className="sr-only">
        Compromisos de DBM
      </h2>
      <Container>
        <ul className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-3 py-5 min-[360px]:grid-cols-2 sm:gap-x-8 sm:py-6 lg:grid-cols-4 lg:gap-x-10">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 text-[#F97316]">{item.icon}</span>
              <span className="min-w-0 text-sm font-semibold leading-snug text-white/90 sm:text-[0.9375rem]">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
