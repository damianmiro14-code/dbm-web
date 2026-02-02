import React from "react";

type Props = {
  platform?: string;
  className?: string;
};

// Lightweight inline SVG icons (no extra deps).
// Simple shapes to remain crisp at small sizes.
export default function SocialIcon({ platform, className }: Props) {
  const p = (platform ?? "").toLowerCase();

  if (p.includes("instagram")) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (p.includes("facebook")) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={className}
        fill="currentColor"
      >
        <path d="M13.5 22v-8h2.7l.4-3H13.5V9.2c0-.9.3-1.5 1.6-1.5h1.6V5c-.8-.1-1.7-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.6V11H7v3h2.7v8h3.8z" />
      </svg>
    );
  }

  // TikTok: simplified musical-note glyph (recognizable at small size).
  if (p.includes("tiktok")) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 3v10.2a4 4 0 1 1-3-3.86" />
        <path d="M14 6.2c1.2 1.9 3.2 3.1 5.5 3.2" />
      </svg>
    );
  }

  // Fallback: external link dot.
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 14a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
      <path d="M14 10a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
    </svg>
  );
}
