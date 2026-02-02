import Container from "@/components/ui/Container";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "dbm_admin";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  // Next.js 15 passes searchParams (and params) as a Promise in Server Components.
  // Keep it optional to match the generated PageProps.
  searchParams?: Promise<{ next?: string; error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const nextPath = typeof sp.next === "string" ? sp.next : "/admin";
  const error = typeof sp.error === "string" ? sp.error : "";

  async function loginAction(formData: FormData) {
    "use server";

    const password = process.env.ADMIN_PASSWORD;
    if (!password) redirect(`/admin/login?error=config&next=${encodeURIComponent(nextPath)}`);

    const provided = String(formData.get("password") || "");
    if (provided !== password) redirect(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`);

    const token = await sha256Hex(`dbm_admin:${password}`);
    const cookieStore = await cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(nextPath || "/admin");
  }

  return (
    <Container>
      <div className="py-10 md:py-16 max-w-md">
        <p className="text-xs uppercase tracking-wide opacity-70">Panel interno</p>
        <h1 className="mt-1 text-3xl md:text-5xl font-semibold tracking-tight">Acceso admin</h1>
        <p className="mt-3 text-sm opacity-80">
          Introduce la contraseña para acceder al panel.
        </p>

        {error === "1" ? (
          <div className="mt-4 rounded-2xl border p-4 text-sm">
            Contraseña incorrecta.
          </div>
        ) : null}

        {error === "config" ? (
          <div className="mt-4 rounded-2xl border p-4 text-sm">
            Falta configurar <span className="font-mono">ADMIN_PASSWORD</span> en el entorno.
          </div>
        ) : null}

        <form action={loginAction} className="mt-6 grid gap-3">
          <label className="text-sm font-medium">Contraseña</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="h-12 rounded-2xl border px-4 outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            required
          />
          <button
            type="submit"
            className="h-12 rounded-2xl bg-black text-white font-semibold hover:opacity-90 active:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-sm opacity-80">
          <a href="/" className="underline underline-offset-4 hover:opacity-90">
            Volver a la web
          </a>
        </div>
      </div>
    </Container>
  );
}
