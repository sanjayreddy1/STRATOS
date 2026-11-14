# STRATOS

> Train like an officer.

Stratos is a dark-themed, mobile-first PWA to prepare for Indian Army TGC / SSC Tech entry with SSB interview focus. It tracks preparation, provides SSB practice modules, manages fitness, and can fetch Tavily-powered defence/current-affairs info via server API routes.

## Storage mode (updated)
- **Supabase removed:** this build uses **browser local storage** (`localStorage`, key `stratos_store_v1`) for profile, roadmap, topics, tasks, daily logs, workouts, saved articles, and other app data.
- **No Supabase auth/database/RLS** and no database-backed cron scheduling. Data is device/browser-specific.
- **Server routes still available (optional):** `/api/news` (Tavily + AI summaries), `/api/ai/evaluate` (AI feedback), `/api/health/smtp`, `/api/email/test` when corresponding env keys are configured.

## Tech stack
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui-style primitives + Framer Motion, PWA manifest
- **Persistence:** Browser `localStorage` (client-side)
- **Validation:** Zod (AI JSON outputs and inputs)
- **AI:** Provider abstraction in `src/lib/ai/router.ts` (Groq fast, Gemini fallback/long-context) with retry, timeout, fallback, strict JSON validation. Model names in `src/lib/ai/config.ts`.
- **Search:** Tavily API (server-side only) via `/api/news`
- **Email:** Nodemailer SMTP helper/routes for optional test/utility sends (no DB-backed reminder scheduler in local mode)

## Setup

### 1. Prerequisites
- Node.js 20+
- pnpm (recommended, see `packageManager` in `package.json`)
- A Supabase project
- API keys: Groq, Gemini, Tavily
- SMTP credentials (Gmail App Password or Brevo/other SMTP)

### 2. Install
```bash
cd stratos-app
pnpm install
```

### 3. Environment variables
Copy `.env.example` to `.env` or `.env.local` and fill values. **Never expose server secrets to the client.**

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key (server-side, AI routes) |
| `GEMINI_API_KEY` | Gemini API key (server-side, AI routes) |
| `TAVILY_API_KEY` | Tavily API key (server-side, news route) |
| `SMTP_HOST` | SMTP host (optional, e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (`587` STARTTLS, `465` SSL) |
| `SMTP_SECURE` | `true` for port 465, else `false` |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password/app password |
| `SMTP_FROM_NAME` | Sender display name (e.g. Stratos) |
| `SMTP_FROM_EMAIL` | Sender email |
| `NEXT_PUBLIC_APP_URL` | Base URL of app |

### 4. Gmail App Password / Brevo SMTP setup (optional)
If you want to test SMTP sending:
- **Gmail:** enable 2-Step Verification, create an App Password, use `smtp.gmail.com:587`, `SMTP_SECURE=false`.
- **Brevo:** use SMTP host/port/login and SMTP key.
- Verify with Settings → "Send test email" or `GET /api/health/smtp`.

### 5. Data persistence
No database setup required. App data is stored in **browser local storage**. Clearing browser storage or using a different browser/device will reset local data (Settings includes a local reset action). For multi-device sync/auth/server scheduling, a backend would need to be added back.

### 6. Run locally
```bash
pnpm dev
```
Open http://localhost:3000.

## Cron / scheduled jobs (local-storage mode)
`/api/cron/*` endpoints remain as stubs but automated DB-backed reminders/briefs/reports are **disabled** in local-storage mode because there is no server-side user database. If you need scheduled emails/reminders, reintroduce a backend store and scheduler. For news, use the Knowledge page "Refresh" (calls `/api/news`) to fetch and save results locally.

## Folder structure
```
stratos-app/
  src/
    app/                # App Router pages & API routes
      (auth)/           # redirects to onboarding (no auth in local mode)
      (app)/            # dashboard, onboarding, roadmap, tracker, daily-log, workout, ssb, knowledge, settings, analytics
      api/              # news, ai, cron/* stubs, health/smtp, email/test
    components/         # UI, brand, layout
    lib/
      ai/               # provider router, config
      mailer/           # Nodemailer helper
      local/            # localStorage store utilities
      tavily/           # Tavily fetch utilities
  prompts/              # Versioned AI prompt templates
  public/               # manifest, icons
```

## Features (local-storage build)
- **Brand/UI:** STRATOS wordmark/logo, dark theme tokens, Syncopate/Unbounded/Inter/JetBrains Mono, responsive mobile-first layout, PWA manifest.
- **Onboarding & roadmap:** Profile setup and auto-generated 18-month roadmap (4 phases), stored locally.
- **Tracking:** Topics (status/confidence), tasks (tick complete), daily logs, workout logs, dashboard summary, analytics views.
- **SSB/knowledge pages:** Module guidance and local data views; `/api/ai/evaluate` and `/api/news` can provide AI/Tavily results when server keys are set (client can store results locally).
- **Fitness:** Goals, plan guidance, safety/medical informational notice, progress logging.
- **Limitations:** No multi-user auth/sync, no server DB persistence, no automated cron emails/reminders, and some previously Supabase-backed flows are simplified in this mode.

## Assumptions & notes
- AI scores are **practice guidance only, never selection predictions**. Outputs are validated with Zod and prompts versioned in `/prompts`.
- Always show source links; verify recruitment info on official sites (prefer `joinindianarmy.nic.in`).
- Medical readiness info is informational only, not medical advice.
- Clearing browser storage removes local app data.

## Deployment
Deploy `stratos-app` to Vercel or any Node host. Set `GROQ_API_KEY`, `GEMINI_API_KEY`, `TAVILY_API_KEY` (and SMTP vars if needed) for API features. No Supabase migrations required.
