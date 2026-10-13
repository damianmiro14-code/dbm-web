import "@/styles/globals.css";
import type { Metadata } from "next";
// NOTE: Mobile CTAs are rendered in the header (mobile actions) to avoid covering forms.
import Analytics from "@/components/Analytics";
import RouteChrome from "@/components/RouteChrome";
import site from "@/content/es/site.json";

export const metadata: Metadata = {
  title: "DBM Carpintería Metálica",
  description: "Carpintería metálica en Castellón: soldadura, estructuras, puertas, rejas, inox, panel sándwich y montajes industriales.",
  metadataBase: new URL("https://dbmcarpinteriametalica.es"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-section text-slate-900 antialiased">
        <Analytics />
        <RouteChrome business={(site as any).business}>
          {children}
        </RouteChrome>
      </body>
    </html>
  );
}
