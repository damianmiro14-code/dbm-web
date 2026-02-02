import "@/styles/globals.css";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
// NOTE: Mobile CTAs are rendered in the header (mobile actions) to avoid covering forms.
import Analytics from "@/components/Analytics";
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
        <SiteHeader business={(site as any).business} />
        <main className="pb-6 md:pb-0">{children}</main>
        <SiteFooter business={(site as any).business} />
      </body>
    </html>
  );
}
