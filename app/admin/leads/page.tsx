import type { Metadata } from "next";
import LeadsDashboard from "@/components/LeadsDashboard";

export const metadata: Metadata = {
  title: "Leads | Panel interno",
  description: "Panel interno de leads guardados localmente en el navegador.",
  robots: { index: false, follow: false }
};

export default function LeadsPage() {
  return <LeadsDashboard />;
}
