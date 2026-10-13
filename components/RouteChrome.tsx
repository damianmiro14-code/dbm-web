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
  const isHome = pathname === "/";

  return (
    <>
      {isHome
        ? <HomeV2Header business={business} />
        : <SiteHeader business={business} />}

      <main className={isHome ? "" : "pb-6 md:pb-0"}>
        {children}
      </main>

      {isHome
        ? <HomeV2Footer business={business} />
        : <SiteFooter business={business} />}
    </>
  );
}
