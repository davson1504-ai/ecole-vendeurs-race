create extension if not exists pgcrypto;

create type app_role as enum ('learner', 'affiliate', 'admin', 'super_admin');
create type publish_status as enum ('draft', 'published', 'archived');
create type order_status as enum ('pending', 'payment_initiated', 'paid', 'failed', 'cancelled');
create type payment_status as enum ('created', 'waiting', 'accepted', 'refused', 'cancelled', 'error');
create type commission_status as enum ('pending', 'approved', 'paid', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null default '',
  phone text,
  role app_role not null default 'learner',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  long_description text,
  status publish_status not null default 'draft',
  price_xof integer not null check (price_xof >= 0 and price_xof % 5 = 0),
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null,
  unique(course_id, position)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  lesson_type text not null default 'video',
  content_text text,
  storage_path text,
  position integer not null,
  is_preview boolean not null default false,
  unique(module_id, position)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  price_xof integer not null check (price_xof > 0 and price_xof % 5 = 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id),
  product_id uuid not null references public.products(id),
  status order_status not null default 'pending',
  amount_xof integer not null,
  currency text not null default 'XOF',
  referral_code text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'cinetpay',
  provider_transaction_id text not null unique,
  status payment_status not null default 'created',
  amount_xof integer not null,
  raw_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  order_id uuid not null references public.orders(id),
  activated_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  referral_code text not null unique,
  commission_rate numeric(5,4) not null default 0.1000,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  payment_id uuid unique references public.payments(id) on delete set null,
  base_amount_xof integer not null,
  commission_amount_xof integer not null,
  status commission_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.enrollments enable row level security;
alter table public.affiliates enable row level security;
alter table public.commissions enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
