import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { WORK_SLUGS, getWorkRaw } from "@/lib/workPages";

type Params = { slug: string };
type Props = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return WORK_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!getWorkRaw(slug)) return { robots: { index: false, follow: false } };
  return {
    title: "Ficha de trabajo en revisión | DBM Carpintería Metálica",
    description: "Ficha en revisión editorial. Consulta nuestra galería de trabajos de carpintería metálica en Castellón.",
    robots: { index: false, follow: false }
  };
}

export default async function TrabajoDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!getWorkRaw(slug)) notFound();

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Ficha de trabajo en revisión</h1>
          <p className="mt-5 text-lg text-slate-700">
            Estamos revisando la información de esta ficha antes de publicarla como
            proyecto documentado. Las fotografías originales se conservan sin cambios.
          </p>
          <p className="mt-3 text-slate-700">
            Mientras tanto, puedes consultar una selección de trabajos en nuestra galería.
          </p>
          <Link
            href="/trabajos"
            className="mt-8 inline-flex rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Ver galería de trabajos
          </Link>
        </div>
      </Container>
    </section>
  );
}
