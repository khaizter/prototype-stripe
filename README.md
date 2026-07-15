# prototype-stripe

A personal sandbox for learning Stripe. Build checkout, subscriptions, and webhooks incrementally while mirroring data to Postgres so you can inspect rows in the Supabase dashboard.

## Stack

- **Next.js** — App Router
- **Tailwind CSS** — styling
- **shadcn/ui** — simple components on top of Tailwind
- **Supabase** — Postgres + Auth. Tables for customers, subscriptions, orders, and webhook events
- **Stripe** — payments API (starter files only; you implement features as you go)

## What's included

- Supabase client helpers (`lib/supabase/`)
- Stripe client (`lib/stripe.ts`)
- Webhook route skeleton (`app/api/webhooks/stripe/route.ts`) — verifies signatures and stores events
- SQL migration for core tables (`supabase/migrations/`)
- Auth callback route + middleware scaffold

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Copy the example file and fill in your keys (`.env.local` is gitignored):

```bash
cp .env.example .env.local
```

Set `PORT` in `.env.local` if you don't want the default `3000`, and keep `NEXT_PUBLIC_APP_URL` in sync.
`pnpm dev` loads `.env.local` before starting Next (Next itself ignores `PORT` in `.env` files).

### 3. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/migrations/20250716000000_initial_schema.sql` via the SQL editor
3. Copy your project URL, **publishable** key, and **secret** key into `.env.local`
   (new dashboard keys: `sb_publishable_...` / `sb_secret_...`; legacy names were `anon` / `service_role`)

Tables you'll see in the dashboard:

| Table | Purpose |
|-------|---------|
| `profiles` | Linked to Supabase Auth users |
| `customers` | Stripe customer records |
| `subscriptions` | Stripe subscription state |
| `orders` | Checkout sessions / payment intents |
| `webhook_events` | Raw Stripe webhook payloads |

### 4. Stripe

1. Get test API keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli)
3. Forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret from the CLI output into `STRIPE_WEBHOOK_SECRET`.

### 5. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (or whatever `PORT` you set in `.env.local`).

## Suggested learning path

1. Run the Supabase migration and confirm tables exist
2. Trigger a test webhook with the Stripe CLI — check `webhook_events` in Supabase
3. Create a Stripe customer and sync it to the `customers` table
4. Build a checkout session, then handle `checkout.session.completed`
5. Add subscriptions and handle subscription lifecycle events
6. Wire up Supabase Auth when you need user accounts

## Project structure

```
app/
  api/webhooks/stripe/   # Webhook endpoint (stores events, TODO handlers)
  auth/callback/         # Supabase Auth redirect
lib/
  stripe.ts              # Stripe SDK instance
  supabase/              # Browser, server, and admin clients
supabase/migrations/     # Database schema
types/database.ts        # Supabase table types
```
