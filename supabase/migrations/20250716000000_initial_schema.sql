-- Stripe learning sandbox schema
-- Run this in the Supabase SQL editor or via Supabase CLI.

-- Profiles (linked to Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stripe customers mirrored to Postgres (viewable in Supabase dashboard)
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  stripe_customer_id text not null unique,
  email text,
  name text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_user_id_idx on public.customers (user_id);
create index customers_stripe_customer_id_idx on public.customers (stripe_customer_id);

-- Stripe subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  status text not null,
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_customer_id_idx on public.subscriptions (customer_id);
create index subscriptions_stripe_subscription_id_idx on public.subscriptions (stripe_subscription_id);

-- Orders (checkout sessions / payment intents)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers on delete set null,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  stripe_customer_id text,
  amount integer,
  currency text not null default 'usd',
  status text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_stripe_checkout_session_id_idx on public.orders (stripe_checkout_session_id);

-- Raw Stripe webhook events (useful for debugging while learning)
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  error text,
  created_at timestamptz not null default now()
);

create index webhook_events_type_idx on public.webhook_events (type);
create index webhook_events_processed_idx on public.webhook_events (processed);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security (start permissive for learning; tighten later)
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.webhook_events enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own customers"
  on public.customers for select
  using (auth.uid() = user_id);

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    )
  );

create policy "Users can view own orders"
  on public.orders for select
  using (
    customer_id in (
      select id from public.customers where user_id = auth.uid()
    )
  );

-- Webhook events: no client access (service role only via API routes)
create policy "No client access to webhook events"
  on public.webhook_events for select
  using (false);
