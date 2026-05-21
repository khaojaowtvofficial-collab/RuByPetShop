-- ============================================================
--  Ruby Pet Shop — Supabase Schema
--  วิธีใช้: ไปที่ Supabase Dashboard → SQL Editor → New Query
--          วาง SQL ทั้งหมดนี้แล้วกด RUN
-- ============================================================

-- ── PROFILES (เชื่อมกับ auth.users) ──────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  first_name    text    default '',
  last_name     text    default '',
  phone         text    default '',
  dob           date,
  gender        text    default '',
  avatar_seed   text    default 'Malee',
  role          text    default 'user',
  extra_points  integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile เมื่อ user สมัครใหม่
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name',  ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── PETS ──────────────────────────────────────────────────────
create table if not exists public.pets (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade,
  name       text,
  type       text default 'other',
  breed      text default '',
  age        integer,
  created_at timestamptz default now()
);

alter table public.pets enable row level security;

create policy "Users can manage own pets"
  on public.pets for all
  using (auth.uid() = user_id);

-- ── ORDERS ────────────────────────────────────────────────────
create table if not exists public.orders (
  id              text primary key,
  user_id         uuid references auth.users on delete set null,
  status          text    default 'pending',
  total           integer default 0,
  subtotal        integer default 0,
  shipping_fee    integer default 0,
  discount        integer default 0,
  points_used     integer default 0,
  points_earned   integer default 0,
  payment_method  text,
  delivery_name   text,
  shipping_name   text,
  shipping_phone  text,
  shipping_address text,
  shipping_note   text,
  created_at      timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- ── ORDER ITEMS ────────────────────────────────────────────────
create table if not exists public.order_items (
  id           uuid default gen_random_uuid() primary key,
  order_id     text references public.orders on delete cascade,
  product_id   text,
  product_name text,
  product_img  text,
  price        integer default 0,
  qty          integer default 1
);

alter table public.order_items enable row level security;

create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- ── REVIEWS ────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid default gen_random_uuid() primary key,
  product_id  text not null,
  user_id     uuid references auth.users on delete set null,
  user_name   text,
  rating      integer check (rating >= 1 and rating <= 5),
  body        text,
  verified    boolean default false,
  created_at  timestamptz default now(),
  unique (user_id, product_id)
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

-- ── WISHLIST ───────────────────────────────────────────────────
create table if not exists public.wishlist (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade,
  product_id  text not null,
  created_at  timestamptz default now(),
  unique (user_id, product_id)
);

alter table public.wishlist enable row level security;

create policy "Users can manage own wishlist"
  on public.wishlist for all
  using (auth.uid() = user_id);

-- ============================================================
--  ✅ Done! ตาราง 5 ตาราง + RLS + trigger พร้อมแล้ว
-- ============================================================
