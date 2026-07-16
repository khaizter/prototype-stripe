-- Allow updating products (needed for checkout → mark sold)

create policy "Anyone can update products"
  on public.products for update
  using (true)
  with check (true);
