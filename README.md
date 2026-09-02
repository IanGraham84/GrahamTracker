# Agent Onboarding Tracker

A private, admin-only onboarding tracker for a new insurance agent pipeline. The
admin logs in with email/password (Supabase Auth) and manages a pipeline of new
agents; each agent gets a personal checklist link they can use without logging in.

## Stack

- Next.js (App Router, TypeScript)
- Supabase (Postgres + Auth + Realtime)
- Tailwind CSS v4
- Deployed on Vercel

## Setup

1. **Create a Supabase project.**
2. **Run the schema.** Open the Supabase SQL editor and run `supabase/schema.sql` (in order — it's a single file).
3. **Enable Realtime.** In the Supabase Dashboard, go to Database → Replication and enable replication for the `agents`, `agent_checks`, and `agent_dates` tables.
4. **Create an admin user.** In the Supabase Dashboard, go to Authentication → Users → Add user, and set an email + password. This is the only login the app supports — there's no public signup.
5. **Copy environment variables.** Copy `.env.example` to `.env.local` and fill in your Supabase project URL, anon key, and service role key (Project Settings → API).
6. **Install and run.**

   ```bash
   npm install
   npm run dev
   ```

7. Sign in at `/` with the admin user you created.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key is server-only — it's used in `lib/supabaseAdmin.ts` and never
sent to the browser.

## Agency customization

Edit `lib/agency.ts` for the agency name and confetti colors, and `app/globals.css`
for the brand color tokens. No other configuration is needed to rebrand the app.

The onboarding checklist itself (steps, links, grouping, licensed vs. unlicensed
variants) lives in `lib/steps.ts`.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add the three environment variables above in the Vercel project settings.
4. Deploy.

## App structure

- `/` — admin login
- `/dashboard` — pipeline overview, metrics, stall banner, CSV export
- `/dashboard/[agentId]` — single agent detail: checklist, pipeline, schedule, notes
- `/dashboard/schedule` — master weekly schedule across all agents
- `/agent/[token]` — public, token-based self-service checklist for an agent (no login)

See `lib/data.ts`, `lib/funnel.ts`, and `lib/stall.ts` for the core business logic
(funnel stage computation and stall detection).
