import type { Metadata } from "next";
import TrackingDashboard from "@/components/TrackingDashboard";

export const metadata: Metadata = {
  title: "Tracking | Panel interno",
  description: "Panel interno de tracking guardado localmente en el navegador.",
  robots: { index: false, follow: false }
};

export default function TrackingPage() {
  return <TrackingDashboard />;
}
