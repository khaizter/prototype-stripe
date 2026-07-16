-- Products: one row = one sellable unit (two bananas = two rows)

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  icon text not null,
  status text not null default 'available'
    check (status in ('available', 'sold')),
  created_at timestamptz not null default now()
);

create index products_status_idx on public.products (status);
create index products_created_at_idx on public.products (created_at desc);

-- Open policies for learning sandbox (no auth on /admin yet)
alter table public.products enable row level security;

create policy "Anyone can view products"
  on public.products for select
  using (true);

create policy "Anyone can insert products"
  on public.products for insert
  with check (true);

create policy "Anyone can delete products"
  on public.products for delete
  using (true);
