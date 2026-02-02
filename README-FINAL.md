# DBM Carpintería Metálica — Checklist final

## Arrancar en local (Windows / PowerShell)

Desde la carpeta del proyecto (donde está `package.json`):

```powershell
npm install
npm run build
npm run dev
```

Abre `http://localhost:3000`.

Si al reiniciar tras cambios ves comportamientos raros, borra caché de Next:

```powershell
rmdir /s /q .next
npm run dev
```

## Verificación rápida (5 minutos)

1. Header: logo grande, menú alineado, indicador de sección activa.
2. Servicios: dropdown abre con hover y se cierra al elegir un item.
3. Rutas:
   - `/servicios/[slug]` (11 servicios)
   - `/presupuesto`
   - `/zonas` y `/zonas/[slug]`
   - `/admin/leads`
4. WhatsApp: en **toda la web** abre en pestaña nueva (la web se queda abierta).

## Tracking (lo probaremos al final)

El tracking guarda eventos en localStorage (debug) y opcionalmente envía a GA4.

### Debug local (sin GA4)

- Abre: `/admin/tracking`
- Realiza clicks (WhatsApp/Llamar), navega y vuelve al panel para ver eventos.

### Activar GA4 (opcional)

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Reinicia el servidor (`npm run dev`).

## Notas

- `/admin/*` está marcado como `noindex` y está bloqueado en `robots.txt`.
- Leads y tracking se guardan en **este navegador**, no se sincronizan entre dispositivos.

## Fotos (flujo rápido)

### 1) Hero del Inicio (escalera con luces azules)

Coloca la imagen aquí (cualquiera de estos formatos):

- `public/images/hero/inicio-escalera-azul.jpg`
- `public/images/hero/inicio-escalera-azul.jpeg`
- `public/images/hero/inicio-escalera-azul.png`
- `public/images/hero/inicio-escalera-azul.webp`

La home la detecta automáticamente (si no existe, usa una foto de fallback).

### 2) Importar pack de fotos (automático)

Estructura del pack:

```
PACK-FOTOS/
  hero/
    (1 imagen)
  servicios/
    <serviceSlug>/
      01.jpg
      02.jpg
      03.jpg
  trabajos/
    01.jpg
    ...
```

Ejecuta:

```powershell
node scripts/import-photo-pack.mjs "C:\\ruta\\a\\PACK-FOTOS"
```

Hace:
- Copia hero -> `public/images/hero/`
- Copia 3 fotos por servicio -> `public/images/services/<slug>/`
- Actualiza la galería de cada servicio (JSON)
- Copia 9-12 fotos -> `public/images/trabajos/featured/` y actualiza `/trabajos` (JSON)
