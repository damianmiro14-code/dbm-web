"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackLinkClick } from "@/lib/analytics";

type Props = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  href,
  type,
  disabled,
  variant = "primary",
  onClick,
  className
}: Props) {
  const label = typeof children === "string" ? children : undefined;

  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium border border-border transition-all duration-150 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 " +
    "active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none " +
    "disabled:hover:-translate-y-0 disabled:active:scale-100";

  const cls =
    variant === "primary"
      ? `${base} bg-brand text-white border-brand/20 hover:bg-brand-hover hover:shadow-sm hover:-translate-y-0.5`
      : `${base} bg-white/70 border-border text-slate-900 hover:bg-accent-soft hover:border-accent/25 hover:shadow-sm hover:-translate-y-0.5`;

  const finalClass = className ? `${cls} ${className}` : cls;

  if (href) {
    const isHttp = /^https?:\/\//i.test(href);
    const isTelOrMail = /^(tel:|mailto:)/i.test(href);
    const isInternal = href.startsWith("/") || href.startsWith("#");

    // External links should not navigate away from the site (open in a new tab/window).
    if (isHttp) {
      return (
        <a
          className={finalClass}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={disabled ? true : undefined}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            trackLinkClick({ href, label, context: "button" });
            onClick?.();
          }}
        >
          {children}
        </a>
      );
    }

    // Protocol links (tel/mailto) should remain in the same tab.
    if (isTelOrMail) {
      return (
        <a
          className={finalClass}
          href={href}
          aria-disabled={disabled ? true : undefined}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            trackLinkClick({ href, label, context: "button" });
            onClick?.();
          }}
        >
          {children}
        </a>
      );
    }

    // Anchor navigation should use a plain <a> to ensure consistent in-page scrolling.
    if (href.startsWith("#")) {
      return (
        <a
          className={finalClass}
          href={href}
          aria-disabled={disabled ? true : undefined}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            trackLinkClick({ href, label, context: "button" });
            onClick?.();
          }}
        >
          {children}
        </a>
      );
    }

    // Internal navigation (non-anchor).
    if (isInternal) {
      return (
        <Link
          className={finalClass}
          href={href}
          aria-disabled={disabled ? true : undefined}
          onClick={() => {
            trackLinkClick({ href, label, context: "button" });
            onClick?.();
          }}
        >
          {children}
        </Link>
      );
    }

    // Fallback: treat as external.
    return (
      <a
        className={finalClass}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={disabled ? true : undefined}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          trackLinkClick({ href, label, context: "button" });
          onClick?.();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={finalClass} type={type ?? "button"} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
