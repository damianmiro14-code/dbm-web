import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { ProcessSection } from "@/lib/pagejson.types";

export default function Process({ section }: { section: ProcessSection }) {
  return (
    <section id={section.id} aria-label={section.title}>
      <Container>
        <div className="py-14 md:py-20">
          <SectionHeader title={section.title} />
          <ol className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Pasos">
            {section.steps.map((step, idx) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none"
              >
                <p className="text-sm uppercase tracking-wide opacity-70">Paso {idx + 1}</p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 opacity-80">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
