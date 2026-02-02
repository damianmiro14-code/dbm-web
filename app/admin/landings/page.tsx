import type { Metadata } from "next";

import LandingsDashboard, { type LandingRow } from "@/components/LandingsDashboard";
import { getLocationServicePairs } from "@/lib/locationServiceLanding";
import { getLocationLabel } from "@/lib/locationPages";
import { getServiceLabel } from "@/lib/servicePages";

export const metadata: Metadata = {
  title: "Admin | Landings",
  description: "Lista interna de landings canónicas (zona + servicio) para SEO y campañas.",
  robots: { index: false, follow: false }
};

export default function AdminLandingsPage() {
  const pairs = getLocationServicePairs();

  const rows: LandingRow[] = pairs
    .map((p) => {
      const locationLabel = getLocationLabel(p.location) ?? p.location;
      const serviceLabel = getServiceLabel(p.service) ?? p.service;
      return {
        location: p.location,
        locationLabel,
        service: p.service,
        serviceLabel,
        path: `/${p.location}/${p.service}`
      };
    })
    .sort((a, b) => {
      const locCmp = a.locationLabel.localeCompare(b.locationLabel, "es");
      if (locCmp) return locCmp;
      return a.serviceLabel.localeCompare(b.serviceLabel, "es");
    });

  return <LandingsDashboard rows={rows} />;
}
