# AFTO Connect

**Tu tarjeta inteligente para networking.** Un perfil digital permanente —
conectado a QR, NFC y una URL— que comparte tu contacto, capta leads, mide cada
interacción y (en el plan AI) conversa con tus visitantes.

> No solo compartes tu contacto. Conviertes cada encuentro en una oportunidad.

Construido como SaaS multi-tenant desde el primer día: Personal · Pro · AI ·
Business.
 
---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS v4 (tokens de marca en `globals.css`) |
| Backend | Route Handlers + Server Actions |
| Datos / Auth | Supabase (Postgres + Auth magic-link + RLS) |
| Validación | Zod |
| Formularios | React Hook Form |
| QR | `qrcode` |
| Iconos | `lucide-react` |
| Hosting | Vercel |

---

## Puesta en marcha (local)

Requisitos: Node 20+, Docker (para Supabase local).

```bash
# 1. Dependencias
npm install

# 2. Levanta Supabase local (Postgres + Auth + Studio). Aplica migraciones.
npx supabase start

# 3. Variables de entorno
cp .env.example .env.local
#   Pega los valores que imprime `supabase start`:
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 4. Datos semilla (org AFTO + perfil /c/antonio + usuario owner)
npm run db:seed

# 5. Desarrollo
npm run dev
```

- Perfil público demo: http://localhost:3000/c/antonio
- Landing: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard (requiere login)
- Studio (DB): http://localhost:54323
- Correos locales (magic links): http://localhost:54324 (Mailpit)

### Login local

El login usa **magic link**. En local no se envían correos reales: abre
Mailpit (http://localhost:54324), busca "Your sign-in link" y sigue el enlace.
El usuario semilla es `ateran@afto.dev`.

---

## Estructura

```
src/
  app/
    page.tsx                 Landing + captura de interés
    c/[slug]/page.tsx        Perfil público (SSR, metadata/OG)
    login/                   Magic-link
    auth/                    callback + signout
    dashboard/               Resumen · Perfil · Leads · Analítica
    api/
      events/                Ingesta de eventos (tracking)
      leads/                 Captura de leads
      interest/              Interés desde landing
      vcard/[slug]/          Descarga .vcf
      qr/[slug]/             QR (svg/png)
      ai/chat/               Ask AFTO AI
  components/
    ui/                      Button, Card, Field (primitivas)
    profile/                 Header, ContactButtons, LeadForm, AskAI, ViewTracker
    dashboard/               MetricTile, ProfileEditor
    marketing/               InterestForm
    brand/                   Logo
  lib/
    supabase/                client · server · admin · middleware
    ai/                      provider (interfaz) · mock · index  ← ver ai/README.md
    data/                    profiles · dashboard · resolve
    plans.ts                 Gating de features por plan
    env.ts · validation.ts · vcard.ts · tracking.ts · rate-limit.ts · utils.ts
supabase/
  config.toml                Config local
  migrations/0001_init.sql   Esquema + RLS + triggers
scripts/seed.ts              Datos semilla
```

---

## Modelo de datos y multi-tenancy

Cada fila pertenece a una `organization`; **RLS** aísla a cada tenant. Un
usuario Personal es una organización con un solo perfil, así que pasar a
Business (varios perfiles/equipo) no requiere migración de modelo.

- **Lecturas públicas** del perfil (`/c/[slug]`): políticas RLS `anon` que solo
  exponen perfiles `published`.
- **Escrituras públicas** (eventos, leads, IA): pasan por Route Handlers de
  confianza con la `service_role` key tras validación Zod + rate limiting. No
  existen políticas de `insert` para `anon` — esta es la única vía de ingreso.
- **Dashboard**: cliente autenticado (anon key + sesión), RLS lo limita a la org
  del usuario vía `is_org_member()`.

Tipos de evento: `profile_view`, `contact_save`, `whatsapp_click`,
`linkedin_click`, `email_click`, `website_click`, `lead_submit`,
`ai_chat_start`.

---

## Seguimiento de origen (eventos/campañas)

Comparte tu URL con parámetros para atribuir la fuente:

```
/c/antonio?src=devfest26
/c/antonio?campaign=devfest26
```

`src`/`source` y `campaign` se guardan en cada evento y lead, y se muestran en
Leads y Analítica.

---

## NFC

No se necesita ningún sistema de programación NFC en el producto. La tarjeta
física simplemente **apunta a la URL permanente del perfil**:

1. Usa cualquier tag/tarjeta NFC estándar (NTAG213/215/216).
2. Con una app de escritura NFC (p. ej. NFC Tools), escribe un registro
   **URL / URI** con `https://TU_DOMINIO/c/antonio`.
3. Bloquea el tag si quieres evitar reescrituras.

Como el tag apunta a una URL permanente, **el contenido del perfil se actualiza
sin reemplazar la tarjeta**. El mismo enlace sirve para el QR impreso.

---

## Ask AFTO AI

El módulo de IA está **abstraído tras una interfaz** (`src/lib/ai/provider.ts`).
El MVP incluye un proveedor **`mock`** (respuestas deterministas, sin llamar a
ningún modelo) claramente etiquetado en la UI como "Respuesta simulada". Para
conectar un modelo real, implementa `AiProvider` y regístralo — ver
[`src/lib/ai/README.md`](src/lib/ai/README.md). Nada más del app cambia.

---

## Despliegue (Vercel)

1. Crea un proyecto Supabase (hosted) y aplica la migración:
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push
   ```
   Luego corre el seed apuntando `.env.local` al proyecto hosted:
   `npm run db:seed`.
2. Importa el repo en Vercel. Configura las variables de entorno (de
   `.env.example`), con `NEXT_PUBLIC_SITE_URL` = tu dominio de producción.
3. En Supabase → Auth → URL Configuration, agrega tu dominio y
   `https://TU_DOMINIO/auth/callback` a las Redirect URLs.
4. Deploy.

**Seguridad:** `SUPABASE_SERVICE_ROLE_KEY` es solo de servidor — nunca uses el
prefijo `NEXT_PUBLIC_` ni la importes en un Client Component.

---

## Verificado en el MVP

- Perfil público premium, mobile-first, SSR con metadata/OG.
- Descarga real de `.vcf` (probada en formato vCard 3.0).
- QR permanente (SVG + PNG).
- Captura de leads con validación, rate limiting y honeypot anti-spam.
- Tracking de eventos con `src`/`campaign`.
- Dashboard: métricas, leads, analítica, editor de perfil.
- Login magic-link end-to-end.
- Ask AFTO AI (mock etiquetado) con conversación persistida.

---

## Recomendaciones V2

El esquema y la arquitectura ya no bloquean nada de esto:

- **Billing**: Stripe (campos `stripe_*` en `organizations`), checkout por plan.
- **IA real**: implementar `AiProvider` con Anthropic/OpenAI + precalificación
  de leads y resúmenes de conversación.
- **Business/Equipos**: UI de gestión de miembros y multi-perfil (modelo listo).
- **Branding avanzado**: temas, dominios propios, logo/color por perfil.
- **QR avanzado**: descarga con logo/colores, campañas de QR.
- **Rate limiting distribuido**: mover de memoria a Upstash Redis.
- **Storage**: subida de avatar/logo a Supabase Storage (bucket ya contemplado).
- **CRM / export**: exportar leads, webhooks, integraciones.
- **Wallet**: Apple/Google Wallet.
- **Analítica avanzada**: series de tiempo, embudos, por fuente.

---

## Scripts

```bash
npm run dev         # desarrollo
npm run build       # build de producción
npm run start       # servir build
npm run typecheck   # tsc --noEmit
npm run db:seed     # datos semilla
```
