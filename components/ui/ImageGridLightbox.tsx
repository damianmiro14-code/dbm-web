"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type LightboxImage = {
  src: string;
  alt: string;
};

export default function ImageGridLightbox({
  images,
  colsClassName = "md:grid-cols-3",
  thumbAspectClassName = "aspect-[4/3]",
  className = "",
  // Default ON so every lightbox (galerías + /trabajos + previews) has arrows + counter.
  enableNavigation = true,
  showCounter = true,
}: {
  images: LightboxImage[];
  colsClassName?: string;
  thumbAspectClassName?: string;
  className?: string;
  enableNavigation?: boolean;
  showCounter?: boolean;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const total = images.length;

  const goPrev = () => {
    if (!enableNavigation || total <= 1) return;
    setOpenIdx((idx) => {
      if (idx === null) return 0;
      return (idx - 1 + total) % total;
    });
  };

  const goNext = () => {
    if (!enableNavigation || total <= 1) return;
    setOpenIdx((idx) => {
      if (idx === null) return 0;
      return (idx + 1) % total;
    });
  };

  const current = useMemo(() => (openIdx === null ? null : images[openIdx] ?? null), [openIdx, images]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIdx(null);
      if (enableNavigation) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    }
    if (openIdx !== null) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIdx, enableNavigation, total]);

  return (
    <>
      <div className={`grid gap-4 ${colsClassName} ${className}`}>
        {images.map((img, idx) => (
          <button
            key={`${img.src}-${idx}`}
            type="button"
            onClick={() => setOpenIdx(idx)}
            className="group overflow-hidden rounded-2xl border border-border bg-white text-left transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none"
            aria-label={`Ver imagen en grande: ${img.alt}`}
          >
            <div className={`relative w-full ${thumbAspectClassName}`}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
                priority={idx === 0}
              />
            </div>
          </button>
        ))}
      </div>

      {current ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setOpenIdx(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {showCounter && openIdx !== null ? (
              <div className="absolute left-3 top-3 z-20 rounded-full border border-border bg-white/90 px-3 py-1 text-sm text-slate-900 shadow-sm backdrop-blur">
                {openIdx + 1} / {total}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setOpenIdx(null)}
              className="absolute right-3 top-3 z-20 rounded-full border border-border bg-white/90 px-3 py-1 text-sm text-slate-900 shadow-sm backdrop-blur hover:bg-white"
            >
              Cerrar
            </button>

            {enableNavigation && total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-white/90 p-3 text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12.5 5L7.5 10L12.5 15"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border bg-white/90 p-3 text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7.5 5L12.5 10L7.5 15"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            ) : null}

            <div className="relative h-[80vh] w-full">
              <Image src={current.src} alt={current.alt} fill className="object-contain" sizes="100vw" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
