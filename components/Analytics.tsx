"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const path = pathname || "/";

    // Local debug breadcrumb.
    trackPageView(path);

    // GA pageview (SPA navigation). We set send_page_view:false in init.
    try {
      const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
      if (GA_ID && typeof gtag === "function") {
        gtag("config", GA_ID, {
          page_path: path,
          page_location: window.location.origin + path, // omit query / fragment / user input
          page_referrer: (() => {
            try { return document.referrer ? new URL(document.referrer).origin : ""; } catch { return ""; }
          })()
        });
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
