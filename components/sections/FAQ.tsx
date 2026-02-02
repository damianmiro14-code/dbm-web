import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { FAQSection } from "@/lib/pagejson.types";

export default function FAQ({ section }: { section: FAQSection }) {
  return (
    <section id={section.id} aria-label={section.title}>
      <Container>
        <div className="py-14 md:py-20">
          <SectionHeader title={section.title} />
          <div className="mt-8 grid gap-3">
            {section.items.map((it) => (
              <details
                key={it.q}
                className="rounded-2xl border border-border bg-white p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none"
              >
                <summary className="cursor-pointer font-medium">{it.q}</summary>
                <p className="mt-3 opacity-80">{it.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
