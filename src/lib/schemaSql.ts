export const COMPLETE_POSTGRES_SCHEMA_SQL = `-- ==========================================================
-- VIPSTORE — PostgreSQL Schema, Triggers, RPC & RLS Policies
-- ==========================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists citext;

-- Enums
create type user_role as enum ('super_admin', 'merchant', 'customer');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled', 'expired');
create type order_status as enum ('new', 'processing', 'shipped', 'delivered', 'cancelled');

-- Generic updated_at trigger function
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ PROFILES ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role user_role not null default 'merchant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'merchant');
  return new;
end;
$$;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============ PLANS ============
create table plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric(10,2) not null default 0,
  interval text not null, -- 'trial' | 'monthly' | 'yearly' | 'lifetime'
  features_json jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ============ STORES ============
create table stores (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete restrict,
  store_name text not null,
  slug citext not null unique,
  custom_domain text unique,
  domain_verified boolean not null default false,
  logo_url text,
  favicon_url text,
  description text,
  support_email text,
  currency text not null default 'EGP',
  language text not null default 'ar',
  theme_id text not null default 'minimalist',
  primary_color text not null default '#7C3AED',
  font_family text,
  button_style text,
  layout_style text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_stores_updated before update on stores
  for each row execute function set_updated_at();

-- Reserved slug guard
create or replace function check_reserved_slug()
returns trigger language plpgsql as $$
begin
  if lower(new.slug) = any (array['admin','api','dashboard','auth','store','www','app','pricing']) then
    raise exception 'This store URL is reserved.';
  end if;
  return new;
end;
$$;
create trigger trg_stores_reserved_slug before insert or update on stores
  for each row execute function check_reserved_slug();

-- ============ SUBSCRIPTIONS ============
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  plan_id uuid not null references plans(id) on delete restrict,
  status subscription_status not null default 'trialing',
  starts_at timestamptz not null default now(),
  ends_at timestamptz, -- null = lifetime, never expires
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_subs_updated before update on subscriptions
  for each row execute function set_updated_at();

create or replace function is_subscription_active(p_store_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from subscriptions s
    join stores st on st.id = s.store_id
    where s.store_id = p_store_id
      and st.is_active = true
      and s.status in ('trialing','active')
      and (s.ends_at is null or s.ends_at > now())
  );
$$;

-- ============ CATEGORIES ============
create table categories (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);
create trigger trg_categories_updated before update on categories
  for each row execute function set_updated_at();

-- ============ PRODUCTS ============
create table products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text,
  weight_kg numeric(6,2),
  is_active boolean not null default true,
  options_json jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_store_active on products(store_id, is_active);
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();

-- ============ PRODUCT IMAGES ============
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  display_order int not null default 0
);

-- ============ CUSTOMERS (guest, unauthenticated) ============
create table customers (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  address text,
  created_at timestamptz not null default now(),
  unique (store_id, phone)
);

-- ============ ORDERS ============
create table orders (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete restrict,
  customer_id uuid references customers(id) on delete set null,
  order_number text not null,
  total_amount numeric(10,2) not null default 0,
  status order_status not null default 'new',
  payment_method text,
  payment_status text default 'pending',
  shipping_carrier text,
  shipping_address_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, order_number)
);
create index idx_orders_store_status on orders(store_id, status);
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();

-- ============ ORDER ITEMS ============
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null
);

-- ============ PAYMENT / SHIPPING SETTINGS ============
create table payment_settings (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null unique references stores(id) on delete cascade,
  cod_enabled boolean default true,
  bank_transfer_enabled boolean default false,
  bank_details_text text,
  wallet_enabled boolean default false,
  wallet_number text,
  paymob_enabled boolean default false,
  paypal_enabled boolean default false
);

create table shipping_settings (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null unique references stores(id) on delete cascade,
  bosta_enabled boolean default false,
  bosta_api_key text,
  mylerz_enabled boolean default false,
  mylerz_api_key text,
  manual_shipping_enabled boolean default true,
  shipping_fee numeric(10,2) default 0
);

-- ============ ATOMIC CHECKOUT RPC FUNCTION ============
create or replace function place_order(
  p_store_id uuid,
  p_customer jsonb,      -- {name, phone, email, address}
  p_items jsonb,         -- [{product_id, quantity}, ...]
  p_payment_method text,
  p_shipping_address jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_product record;
  v_total numeric(10,2) := 0;
  v_order_number text;
begin
  if not is_subscription_active(p_store_id) then
    raise exception 'This store is currently unavailable.';
  end if;

  insert into customers (store_id, name, phone, email, address)
  values (p_store_id, p_customer->>'name', p_customer->>'phone', p_customer->>'email', p_customer->>'address')
  on conflict (store_id, phone) do update set name = excluded.name
  returning id into v_customer_id;

  v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || substr(replace(uuid_generate_v4()::text,'-',''), 1, 6);

  insert into orders (store_id, customer_id, order_number, status, payment_method, shipping_address_json)
  values (p_store_id, v_customer_id, v_order_number, 'new', p_payment_method, p_shipping_address)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products
      where id = (v_item->>'product_id')::uuid and store_id = p_store_id
      for update; -- row lock: prevents concurrent overselling

    if v_product is null then
      raise exception 'Product not found in this store.';
    end if;

    if v_product.stock_quantity < (v_item->>'quantity')::int then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;

    update products set stock_quantity = stock_quantity - (v_item->>'quantity')::int
      where id = v_product.id;

    insert into order_items (order_id, product_id, product_name_snapshot, quantity, unit_price, total_price)
    values (v_order_id, v_product.id, v_product.name, (v_item->>'quantity')::int,
            v_product.price, v_product.price * (v_item->>'quantity')::int);

    v_total := v_total + v_product.price * (v_item->>'quantity')::int;
  end loop;

  update orders set total_amount = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- ============ ROW LEVEL SECURITY (RLS) ============
alter table profiles enable row level security;
alter table plans enable row level security;
alter table stores enable row level security;
alter table subscriptions enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payment_settings enable row level security;
alter table shipping_settings enable row level security;

-- Products RLS
create policy "Owner manages own products"
on products for all
using (store_id in (select id from stores where owner_id = auth.uid()))
with check (
  store_id in (select id from stores where owner_id = auth.uid())
  and is_subscription_active(store_id)
);

create policy "Public reads active products"
on products for select
using (
  is_active = true
  and store_id in (select id from stores where is_active = true)
);

create policy "Super admin full access on products"
on products for all
using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

-- Storage setup
insert into storage.buckets (id, name, public) values ('store-assets', 'store-assets', true);

create policy "Public read store assets"
on storage.objects for select
using (bucket_id = 'store-assets');

create policy "Owners upload to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'store-assets'
  and (storage.foldername(name))[1] in (select id::text from stores where owner_id = auth.uid())
);
`;
