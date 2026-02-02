import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mx-auto w-full max-w-6xl px-5 pt-6">
        <div className="flex items-center justify-end gap-3 text-sm">
          <a
            href="/admin"
            className="underline underline-offset-4 hover:opacity-90"
          >
            Panel
          </a>
          <span className="opacity-40">·</span>
          <a
            href="/admin/logout"
            className="underline underline-offset-4 hover:opacity-90"
          >
            Cerrar sesión
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}
