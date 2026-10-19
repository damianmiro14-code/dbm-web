"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HomeV2Header from "@/components/HomeV2Header";
import HomeV2Footer from "@/components/HomeV2Footer";
import type { Business } from "@/lib/pagejson.types";

type Props = {
  children: ReactNode;
  business?: Business;
};

export default function RouteChrome({ children, business }: Props) {
  const pathname = usePathname();
  // P203: presupuesto joins the three already validated V2 top-level routes.
  // Other routes keep their existing navigation until their own visual QA.
  const isV2 = pathname === "/" || pathname === "/servicios" || pathname === "/trabajos" || pathname === "/presupuesto";

  return (
    <>
      {isV2
        ? <HomeV2Header business={business} />
        : <SiteHeader business={business} />}

      <main className={isV2 ? "" : "pb-6 md:pb-0"}>
        {children}
      </main>

      {isV2
        ? <HomeV2Footer business={business} />
        : <SiteFooter business={business} />}
    </>
  );
}
