# DBM Carpintería Metálica (Next.js + PageJSON)

Proyecto Next.js (App Router) que renderiza la página de servicios desde un `PageJSON` (data-driven).

## Requisitos
- Node.js 20+

## Uso
```bash
npm install
npm run dev
```

## Contenido
- `content/es/servicios.json`: contenido de `/servicios`
- `content/es/site.json`: datos del negocio (NAP)

## Validación
- El JSON se valida en runtime con `lib/pagejson.validate.ts`.

