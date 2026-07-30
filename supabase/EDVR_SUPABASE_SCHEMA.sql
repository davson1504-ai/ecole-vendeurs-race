-- École des Vendeurs de Race — Schéma Supabase Phase 1 MVP
-- À exécuter dans Supabase > SQL Editor.

create extension if not exists pgcrypto;

-- Types métier. Les valeurs restent en anglais côté base pour garder des identifiants stables.
do $$ begin
  create type public.app_role as enum ('learner', 'affiliate', 'admin', 'super_admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.publish_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'payment_initiated', 'paid', 'failed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('created', 'waiting', 'accepted', 'refused', 'cancelled', 'error');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.commission_status as enum ('pending', 'approved', 'paid', 'rejected');
exception when duplicate_object then null;
end $$;

-- Profils utilisateurs liés à auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null default '',
  phone text,
  role public.app_role not null default 'learner',
  status text not null default 'active',
  affiliate_code text unique,
  referred_by uuid references public.profiles(id),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text unique;
alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role public.app_role not null default 'learner';
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists affiliate_code text unique;
alter table public.profiles add column if not exists referred_by uuid references public.profiles(id);
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  long_description text,
  level text not null default 'Débutant',
  duration text not null default '4 semaines',
  status public.publish_status not null default 'draft',
  price_xof integer not null check (price_xof >= 0),
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists level text not null default 'Débutant';
alter table public.courses add column if not exists duration text not null default '4 semaines';
alter table public.courses add column if not exists cover_url text;
alter table public.courses add column if not exists updated_at timestamptz not null default now();

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position integer not null,
  created_at timestamptz not null default now(),
  unique(course_id, position)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  lesson_type text not null default 'video',
  content_text text,
  video_url text,
  pdf_path text,
  storage_path text,
  duration_minutes integer default 0,
  position integer not null,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  unique(module_id, position)
);

alter table public.lessons add column if not exists video_url text;
alter table public.lessons add column if not exists pdf_path text;
alter table public.lessons add column if not exists duration_minutes integer default 0;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  price_xof integer not null check (price_xof > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists updated_at timestamptz not null default now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id),
  status public.order_status not null default 'pending',
  amount_xof integer not null,
  currency text not null default 'XOF',
  referral_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists updated_at timestamptz not null default now();

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'cinetpay',
  provider_transaction_id text unique,
  status public.payment_status not null default 'created',
  amount_xof integer not null,
  raw_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  order_id uuid references public.orders(id),
  activated_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  referral_code text not null unique,
  commission_rate numeric(5,4) not null default 0.2000,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.affiliates add column if not exists updated_at timestamptz not null default now();

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  payment_id uuid unique references public.payments(id) on delete set null,
  base_amount_xof integer not null,
  commission_amount_xof integer not null,
  status public.commission_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commissions add column if not exists updated_at timestamptz not null default now();

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_number text not null unique,
  issued_at timestamptz not null default now(),
  pdf_path text,
  unique(user_id, course_id)
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Fonctions utilitaires.
create or replace function public.generate_affiliate_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  code text;
begin
  loop
    code := 'EDVR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.profiles where affiliate_code = code);
  end loop;
  return code;
end;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_user_role() in ('admin'::public.app_role, 'super_admin'::public.app_role), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ref_code text;
  referrer_id uuid;
  generated_code text;
begin
  ref_code := upper(nullif(new.raw_user_meta_data ->> 'affiliate_code', ''));

  if ref_code is not null then
    select id into referrer_id from public.profiles where affiliate_code = ref_code limit 1;
  end if;

  generated_code := public.generate_affiliate_code();

  insert into public.profiles (id, email, full_name, phone, role, affiliate_code, referred_by)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'learner'::public.app_role,
    generated_code,
    referrer_id
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Triggers updated_at.
drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute procedure public.touch_updated_at();

drop trigger if exists courses_touch_updated_at on public.courses;
create trigger courses_touch_updated_at before update on public.courses for each row execute procedure public.touch_updated_at();

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products for each row execute procedure public.touch_updated_at();

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders for each row execute procedure public.touch_updated_at();

-- RLS.
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.affiliates enable row level security;
alter table public.commissions enable row level security;
alter table public.certificates enable row level security;
alter table public.admin_logs enable row level security;

-- Profiles.
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
for select to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin on public.profiles
for update to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- Courses, modules, lessons, products.
drop policy if exists courses_public_read_published on public.courses;
create policy courses_public_read_published on public.courses
for select to anon, authenticated
using (status = 'published'::public.publish_status or public.is_admin());

drop policy if exists courses_admin_all on public.courses;
create policy courses_admin_all on public.courses
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists modules_public_read on public.modules;
create policy modules_public_read on public.modules
for select to anon, authenticated
using (exists (select 1 from public.courses c where c.id = modules.course_id and (c.status = 'published'::public.publish_status or public.is_admin())));

drop policy if exists modules_admin_all on public.modules;
create policy modules_admin_all on public.modules
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists lessons_public_preview_or_admin on public.lessons;
create policy lessons_public_preview_or_admin on public.lessons
for select to anon, authenticated
using (
  is_preview = true
  or public.is_admin()
  or exists (
    select 1
    from public.enrollments e
    join public.modules m on m.id = lessons.module_id
    where e.course_id = m.course_id and e.user_id = auth.uid()
  )
);

drop policy if exists lessons_admin_all on public.lessons;
create policy lessons_admin_all on public.lessons
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists products_public_read_active on public.products;
create policy products_public_read_active on public.products
for select to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Orders and payments.
drop policy if exists orders_select_self_or_admin on public.orders;
create policy orders_select_self_or_admin on public.orders
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_insert_self on public.orders;
create policy orders_insert_self on public.orders
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists payments_select_owner_or_admin on public.payments;
create policy payments_select_owner_or_admin on public.payments
for select to authenticated
using (
  public.is_admin()
  or exists (select 1 from public.orders o where o.id = payments.order_id and o.user_id = auth.uid())
);

drop policy if exists payments_admin_all on public.payments;
create policy payments_admin_all on public.payments
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Enrollments and progress.
drop policy if exists enrollments_select_self_or_admin on public.enrollments;
create policy enrollments_select_self_or_admin on public.enrollments
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists enrollments_admin_all on public.enrollments;
create policy enrollments_admin_all on public.enrollments
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists lesson_progress_self_or_admin on public.lesson_progress;
create policy lesson_progress_self_or_admin on public.lesson_progress
for all to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- Affiliation.
drop policy if exists affiliates_select_self_or_admin on public.affiliates;
create policy affiliates_select_self_or_admin on public.affiliates
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists affiliates_insert_self_or_admin on public.affiliates;
create policy affiliates_insert_self_or_admin on public.affiliates
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists affiliates_update_self_or_admin on public.affiliates;
create policy affiliates_update_self_or_admin on public.affiliates
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists commissions_select_self_or_admin on public.commissions;
create policy commissions_select_self_or_admin on public.commissions
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.affiliates a
    where a.id = commissions.affiliate_id and a.user_id = auth.uid()
  )
);

drop policy if exists commissions_admin_all on public.commissions;
create policy commissions_admin_all on public.commissions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Certificates and logs.
drop policy if exists certificates_select_self_or_admin on public.certificates;
create policy certificates_select_self_or_admin on public.certificates
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists certificates_admin_all on public.certificates;
create policy certificates_admin_all on public.certificates
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists admin_logs_admin_read on public.admin_logs;
create policy admin_logs_admin_read on public.admin_logs
for select to authenticated
using (public.is_admin());

drop policy if exists admin_logs_admin_insert on public.admin_logs;
create policy admin_logs_admin_insert on public.admin_logs
for insert to authenticated
with check (public.is_admin());

-- Stockage Supabase: contenus de cours privés.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-files',
  'course-files',
  false,
  524288000,
  array['application/pdf', 'video/mp4', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

drop policy if exists course_files_authenticated_read on storage.objects;
create policy course_files_authenticated_read on storage.objects
for select to authenticated
using (bucket_id = 'course-files');

drop policy if exists course_files_admin_write on storage.objects;
create policy course_files_admin_write on storage.objects
for insert to authenticated
with check (bucket_id = 'course-files' and public.is_admin());

drop policy if exists course_files_admin_update on storage.objects;
create policy course_files_admin_update on storage.objects
for update to authenticated
using (bucket_id = 'course-files' and public.is_admin())
with check (bucket_id = 'course-files' and public.is_admin());

drop policy if exists course_files_admin_delete on storage.objects;
create policy course_files_admin_delete on storage.objects
for delete to authenticated
using (bucket_id = 'course-files' and public.is_admin());

-- Données de démonstration.
with c as (
  insert into public.courses (slug, title, short_description, long_description, level, duration, status, price_xof)
  values (
    'devenir-vendeur-professionnel',
    'Devenir vendeur professionnel',
    'Parcours complet pour apprendre les bases solides de la vente professionnelle.',
    'Formation pratique pour structurer sa prospection, comprendre le client, présenter une offre et conclure proprement.',
    'Débutant',
    '6 semaines',
    'published'::public.publish_status,
    150000
  )
  on conflict (slug) do update set
    title = excluded.title,
    short_description = excluded.short_description,
    long_description = excluded.long_description,
    level = excluded.level,
    duration = excluded.duration,
    status = excluded.status,
    price_xof = excluded.price_xof,
    updated_at = now()
  returning id
), p as (
  insert into public.products (course_id, title, price_xof, is_active)
  select id, 'Accès formation — Devenir vendeur professionnel', 150000, true from c
  on conflict do nothing
  returning id
), m1 as (
  insert into public.modules (course_id, title, description, position)
  select id, 'Fondations du vendeur professionnel', 'Comprendre le métier et l’état d’esprit du vendeur.', 1 from c
  on conflict (course_id, position) do update set title = excluded.title, description = excluded.description
  returning id
), m2 as (
  insert into public.modules (course_id, title, description, position)
  select id, 'Prospection et argumentaire', 'Préparer ses contacts, son discours et ses objections.', 2 from c
  on conflict (course_id, position) do update set title = excluded.title, description = excluded.description
  returning id
)
insert into public.lessons (module_id, title, lesson_type, content_text, position, is_preview)
select id, 'Comprendre le rôle du vendeur', 'video', 'Introduction au rôle du vendeur professionnel.', 1, true from m1
union all
select id, 'Les erreurs fréquentes à éviter', 'video', 'Analyse des erreurs qui font perdre des ventes.', 2, false from m1
union all
select id, 'Construire un argumentaire simple', 'video', 'Méthode pour présenter une offre claire.', 1, false from m2
union all
select id, 'Exercice pratique de prospection', 'pdf', 'Exercice guidé pour préparer une séquence de prospection.', 2, false from m2
on conflict (module_id, position) do update set
  title = excluded.title,
  lesson_type = excluded.lesson_type,
  content_text = excluded.content_text,
  is_preview = excluded.is_preview;

-- Commande utile après création de ton compte admin:
-- update public.profiles set role = 'super_admin' where email = 'TON_EMAIL_ICI';
