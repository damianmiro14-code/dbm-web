import type { PageSection } from "@/lib/pagejson.types";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";

export default function PageRenderer({ sections }: { sections: PageSection[] }) {
  return (
    <>
      {sections.map((s) => {
        switch (s.type) {
          case "hero":
            return <Hero key={s.id} section={s} />;
          case "services":
            return <Services key={s.id} section={s} />;
          case "process":
            return <Process key={s.id} section={s} />;
          case "gallery":
            return <Gallery key={s.id} section={s} />;
          case "testimonials":
            return <Testimonials key={s.id} section={s} />;
          case "faq":
            return <FAQ key={s.id} section={s} />;
          case "contact":
            return <Contact key={s.id} section={s} />;
          default:
            return null;
        }
      })}
    </>
  );
}
