import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { TestimonialsSection } from "@/lib/pagejson.types";

export default function Testimonials({ section }: { section: TestimonialsSection }) {
  return (
    <section id={section.id} aria-label={section.title}>
      <Container>
        <div className="py-14 md:py-20">
          <SectionHeader title={section.title} />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {section.items.map((it) => (
              <figure
                key={it.name}
                className="rounded-2xl border border-border bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none"
              >
                <blockquote className="text-base opacity-80">“{it.quote}”</blockquote>
                <figcaption className="mt-4 text-sm font-medium">{it.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
