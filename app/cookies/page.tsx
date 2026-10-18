import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import CookieSettingsButton from "@/components/CookieSettingsButton";

// P202B release candidate local. GA is currently off; review again before enabling.
export const metadata: Metadata = { title: "Política de cookies | DBM Carpintería Metálica", robots: { index: false, follow: false } };

export default function CookiesPage() {
  return (
    <Container>
      <article className="mx-auto max-w-3xl space-y-6 py-12 text-slate-800 md:py-16">
        <h1 className="text-3xl font-bold">Política de cookies y almacenamiento local</h1>
        <p>La web utiliza almacenamiento temporal en el navegador para borradores de formularios. En la configuración comprobada, Google Analytics no está configurado y el diagnóstico opcional de eventos no genera registros; por ello no aparece el aviso para aceptar o rechazar cookies analíticas. Si la analítica opcional se habilita en el futuro, su seguimiento y almacenamiento de eventos requerirán consentimiento previo.</p>
        <h2 className="text-xl font-semibold">Almacenamiento técnico</h2>
        <p><strong>p202a:*</strong> (sessionStorage): borradores de formularios de presupuesto/WhatsApp que permanecen únicamente durante la sesión de la pestaña. <strong>dbm_cookie_analytics_consent_v1</strong> (localStorage): guarda la decisión de aceptar o rechazar la analítica opcional cuando esa función está activada. El acceso al panel interno puede establecer la cookie <strong>dbm_admin</strong> (solo para administración, con duración máxima configurada de 30 días).</p>
        <p><strong>Diagnóstico local opcional:</strong> <strong>dbm_analytics_events_v2</strong> (localStorage, con alternativa en sessionStorage) puede conservar hasta 500 eventos técnicos sin mensajes de WhatsApp ni campos de contacto; <strong>dbm_analytics_session_id_v2</strong> (sessionStorage) identifica la sesión de ese registro. Estos datos solo se generan cuando Google Analytics está configurado y existe consentimiento válido. Cuando no hay configuración, se rechaza o se retira el consentimiento, se detiene el registro opcional y se eliminan sus entradas anteriores de localStorage y sessionStorage.</p>
        <h2 className="text-xl font-semibold">Cookies analíticas opcionales</h2>
        <p>En la configuración comprobada, Google Analytics no está activado y no se carga su script ni se instalan sus cookies analíticas mediante esta integración. Si se habilita, pueden utilizarse cookies como <strong>_ga</strong> y <strong>_ga_*</strong>, sujetas a consentimiento previo. Antes de activarlas será necesario verificar y publicar sus nombres efectivos, proveedores, finalidades y duración.</p>
        <h2 className="text-xl font-semibold">Aceptar, rechazar o retirar consentimiento</h2>
        <p>Cuando se habilite Google Analytics, el aviso ofrecerá aceptar y rechazar con la misma facilidad y permitirá cambiar la elección. Si se retira el consentimiento después de cargar el script analítico, la página se recargará para detener su ejecución. Mientras Google Analytics esté deshabilitado, ese aviso y el botón de configuración de analítica no se muestran porque tanto la analítica externa como el diagnóstico local opcional de eventos permanecen desactivados.</p>
        <CookieSettingsButton className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold underline-offset-2 hover:bg-slate-100" />
        <p>Puedes bloquear o borrar cookies y almacenamiento local mediante la configuración del navegador. Esto puede eliminar borradores y registros técnicos; si en el futuro se habilita analítica opcional, también puede borrar la decisión guardada y hacer que el aviso vuelva a aparecer.</p>
      </article>
    </Container>
  );
}
