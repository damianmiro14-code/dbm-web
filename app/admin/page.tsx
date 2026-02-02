import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Admin | Panel interno",
  description: "Panel interno (solo local) para revisar leads y tracking.",
  robots: { index: false, follow: false }
};

export default function AdminHomePage() {
  return (
    <Container>
      <div className="py-10 md:py-16">
        <p className="text-xs uppercase tracking-wide opacity-70">Panel interno</p>
        <h1 className="mt-1 text-3xl md:text-5xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-3 max-w-2xl opacity-80">
          Estas páginas guardan la información en este navegador (localStorage). No hay servidor.
        </p>

        <div className="mt-8 grid gap-3 max-w-xl">
          <Link
            href="/admin/landings"
            className="rounded-2xl border p-4 hover:bg-black/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <p className="text-sm font-semibold">Landings (zona + servicio)</p>
            <p className="mt-1 text-sm opacity-80">Lista canónica para copiar URLs y evitar 404 por slugs.</p>
          </Link>

          <Link
            href="/admin/leads"
            className="rounded-2xl border p-4 hover:bg-black/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <p className="text-sm font-semibold">Leads</p>
            <p className="mt-1 text-sm opacity-80">Pipeline simple: Nuevo / En proceso / Cerrado / Descartado</p>
          </Link>

          <Link
            href="/admin/tracking"
            className="rounded-2xl border p-4 hover:bg-black/5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <p className="text-sm font-semibold">Tracking (debug)</p>
            <p className="mt-1 text-sm opacity-80">
              Revisa eventos guardados localmente: clicks WhatsApp/Llamar, envíos, page views.
            </p>
          </Link>
        </div>
      </div>
    </Container>
  );
}
