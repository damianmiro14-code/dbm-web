import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";

// P202B release candidate local. Publication requires a separate explicit approval.
export const metadata: Metadata = { title: "Aviso legal | DBM Carpintería Metálica", robots: { index: false, follow: false } };

export default function AvisoLegalPage() {
  return (
    <Container>
      <article className="mx-auto max-w-3xl space-y-6 py-12 text-slate-800 md:py-16">
        <h1 className="text-3xl font-bold">Aviso legal</h1>
        <p>En cumplimiento de la Ley 34/2002, se facilita la información de identificación de la web.</p>
        <dl className="space-y-2 rounded-xl border p-5">
          <div><dt className="font-semibold">Titular de la actividad</dt><dd>Damián Brajkovic Miro, autónomo (persona física)</dd></div>
          <div><dt className="font-semibold">Nombre comercial</dt><dd>DBM Carpintería Metálica</dd></div>
          <div><dt className="font-semibold">NIF</dt><dd>{process.env.LEGAL_NIF ?? "[NIF pendiente de configurar]"}</dd></div>
          <div><dt className="font-semibold">Dirección de contacto legal</dt><dd>Carrer de Francia, 76, 12006 Castelló de la Plana, Castelló</dd></div>
          <div><dt className="font-semibold">Email de contacto</dt><dd><a className="underline" href="mailto:dbmmultiservicios24@gmail.com">dbmmultiservicios24@gmail.com</a></dd></div>
          <div><dt className="font-semibold">Teléfono</dt><dd><a className="underline" href="tel:+34624356893">+34 624 356 893</a></dd></div>
          <div><dt className="font-semibold">Sitio web</dt><dd>https://dbmcarpinteriametalica.es</dd></div>
        </dl>
        <h2 className="text-xl font-semibold">Objeto de la web</h2>
        <p>Esta web presenta servicios de carpintería metálica, soldadura, estructuras y montaje, y ofrece canales para solicitar información o presupuesto. Los contenidos comerciales no constituyen por sí mismos una oferta contractual vinculante; cada presupuesto se concreta por separado.</p>
        <h2 className="text-xl font-semibold">Propiedad intelectual</h2>
        <p>Los textos, fotografías e imágenes de la web pertenecen a sus respectivos titulares. No se autoriza su reutilización sin permiso cuando esté protegido por derechos de propiedad intelectual.</p>
        <h2 className="text-xl font-semibold">Enlaces externos</h2>
        <p>Se ofrecen enlaces a servicios externos, entre ellos WhatsApp y Google Maps. Al acceder a ellos, se aplican sus correspondientes condiciones y políticas de privacidad.</p>
        <p>Más información en la <Link className="underline" href="/privacidad">Política de privacidad</Link> y en la <Link className="underline" href="/cookies">Política de cookies</Link>.</p>
      </article>
    </Container>
  );
}
