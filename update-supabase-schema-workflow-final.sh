#!/usr/bin/env bash
set -euo pipefail

printf "\n=== EDVR — Schéma Supabase V2 workflow final ===\n"
PROJECT_ROOT="$(pwd)"
printf "Racine projet: %s\n" "$PROJECT_ROOT"

mkdir -p supabase
BACKUP_DIR=".backup-schema-v2-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f "supabase/EDVR_SUPABASE_SCHEMA.sql" ]; then
  cp "supabase/EDVR_SUPABASE_SCHEMA.sql" "$BACKUP_DIR/EDVR_SUPABASE_SCHEMA.sql.bak"
fi
if [ -f "supabase/EDVR_SUPABASE_SCHEMA_V2.sql" ]; then
  cp "supabase/EDVR_SUPABASE_SCHEMA_V2.sql" "$BACKUP_DIR/EDVR_SUPABASE_SCHEMA_V2.sql.bak"
fi

cat > supabase/EDVR_SUPABASE_SCHEMA_V2.sql <<'SQL'
-- ============================================================================
-- EDVR — Schéma Supabase V2
-- Plateforme École des Vendeurs de Race
-- Workflow final : auth, profils, formations payantes par étapes, examens,
-- marketplace, paiements, activité, relances, attestations, affiliation, admin.
-- ============================================================================

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) Fonctions utilitaires
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
      and p.status = 'active'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'super_admin'
      and p.status = 'active'
  );
$$;

create or replace function public.user_has_course_access(target_user_id uuid, target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_enrollments ce
    where ce.user_id = target_user_id
      and ce.course_id = target_course_id
      and ce.status in ('active', 'completed')
  );
$$;

create or replace function public.user_completed_course(target_user_id uuid, target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_enrollments ce
    where ce.user_id = target_user_id
      and ce.course_id = target_course_id
      and ce.status = 'completed'
      and ce.completed_at is not null
  );
$$;

-- ---------------------------------------------------------------------------
-- 2) Profils, rôles, activité
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text unique;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists role text not null default 'student';
alter table public.profiles add column if not exists is_affiliate boolean not null default false;
alter table public.profiles add column if not exists affiliate_code text unique;
alter table public.profiles add column if not exists referred_by uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists email_verified_at timestamptz;
alter table public.profiles add column if not exists last_login_at timestamptz;
alter table public.profiles add column if not exists last_activity_at timestamptz;
alter table public.profiles add column if not exists total_active_seconds integer not null default 0;
alter table public.profiles add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('student', 'admin', 'super_admin'));

alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check
  check (status in ('active', 'pending_email_verification', 'suspended', 'blocked', 'deleted'));

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_affiliate_code on public.profiles(affiliate_code);
create index if not exists idx_profiles_last_activity on public.profiles(last_activity_at);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.user_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null default 'activity',
  page_url text,
  course_id uuid,
  step_id uuid,
  lesson_id uuid,
  active_seconds integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_activity_user_date on public.user_activity_logs(user_id, created_at desc);
create index if not exists idx_user_activity_event_type on public.user_activity_logs(event_type);

-- ---------------------------------------------------------------------------
-- 3) Formations, étapes, leçons, progression
-- ---------------------------------------------------------------------------

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists title text not null default 'Formation sans titre';
alter table public.courses add column if not exists slug text unique;
alter table public.courses add column if not exists short_description text;
alter table public.courses add column if not exists description text;
alter table public.courses add column if not exists cover_image_url text;
alter table public.courses add column if not exists level text default 'debutant';
alter table public.courses add column if not exists estimated_duration_minutes integer not null default 0;
alter table public.courses add column if not exists price_xof integer not null default 0;
alter table public.courses add column if not exists is_paid boolean not null default true;
alter table public.courses add column if not exists prerequisite_course_id uuid references public.courses(id) on delete set null;
alter table public.courses add column if not exists position integer not null default 0;
alter table public.courses add column if not exists status text not null default 'draft';
alter table public.courses add column if not exists published_at timestamptz;
alter table public.courses add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.courses add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.courses drop constraint if exists courses_status_check;
alter table public.courses add constraint courses_status_check
  check (status in ('draft', 'published', 'archived'));

alter table public.courses drop constraint if exists courses_level_check;
alter table public.courses add constraint courses_level_check
  check (level in ('debutant', 'intermediaire', 'avance', 'expert'));

create index if not exists idx_courses_slug on public.courses(slug);
create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_prerequisite on public.courses(prerequisite_course_id);

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create table if not exists public.course_steps (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 1,
  step_type text not null default 'lesson',
  is_required boolean not null default true,
  unlock_after_step_id uuid references public.course_steps(id) on delete set null,
  estimated_duration_minutes integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(course_id, position)
);

alter table public.course_steps drop constraint if exists course_steps_step_type_check;
alter table public.course_steps add constraint course_steps_step_type_check
  check (step_type in ('lesson', 'quiz', 'mixed', 'final'));

alter table public.course_steps drop constraint if exists course_steps_status_check;
alter table public.course_steps add constraint course_steps_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists idx_course_steps_course_position on public.course_steps(course_id, position);
create index if not exists idx_course_steps_unlock_after on public.course_steps(unlock_after_step_id);

drop trigger if exists set_course_steps_updated_at on public.course_steps;
create trigger set_course_steps_updated_at
before update on public.course_steps
for each row execute function public.set_updated_at();

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.course_steps(id) on delete cascade,
  title text not null,
  description text,
  content_type text not null default 'text',
  text_content text,
  video_provider text,
  video_url text,
  video_duration_seconds integer,
  minimum_watch_percent integer not null default 90,
  minimum_read_seconds integer not null default 0,
  pdf_path text,
  external_url text,
  position integer not null default 1,
  is_required boolean not null default true,
  is_preview boolean not null default false,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(step_id, position)
);

alter table public.lessons drop constraint if exists lessons_content_type_check;
alter table public.lessons add constraint lessons_content_type_check
  check (content_type in ('text', 'video', 'youtube', 'pdf', 'file', 'mixed'));

alter table public.lessons drop constraint if exists lessons_status_check;
alter table public.lessons add constraint lessons_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists idx_lessons_step_position on public.lessons(step_id, position);
create index if not exists idx_lessons_status on public.lessons(status);

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  order_id uuid,
  status text not null default 'active',
  progress_percent numeric(5,2) not null default 0,
  current_step_id uuid references public.course_steps(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, course_id)
);

alter table public.course_enrollments drop constraint if exists course_enrollments_status_check;
alter table public.course_enrollments add constraint course_enrollments_status_check
  check (status in ('active', 'completed', 'locked', 'refunded', 'cancelled'));

create index if not exists idx_course_enrollments_user on public.course_enrollments(user_id);
create index if not exists idx_course_enrollments_course on public.course_enrollments(course_id);
create index if not exists idx_course_enrollments_status on public.course_enrollments(status);

drop trigger if exists set_course_enrollments_updated_at on public.course_enrollments;
create trigger set_course_enrollments_updated_at
before update on public.course_enrollments
for each row execute function public.set_updated_at();

create table if not exists public.course_step_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  step_id uuid not null references public.course_steps(id) on delete cascade,
  status text not null default 'locked',
  unlocked_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  locked_until timestamptz,
  attempts_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, step_id)
);

alter table public.course_step_progress drop constraint if exists course_step_progress_status_check;
alter table public.course_step_progress add constraint course_step_progress_status_check
  check (status in ('locked', 'available', 'in_progress', 'completed', 'failed', 'waiting_retry'));

create index if not exists idx_step_progress_user_course on public.course_step_progress(user_id, course_id);
create index if not exists idx_step_progress_step on public.course_step_progress(step_id);
create index if not exists idx_step_progress_locked_until on public.course_step_progress(locked_until);

drop trigger if exists set_course_step_progress_updated_at on public.course_step_progress;
create trigger set_course_step_progress_updated_at
before update on public.course_step_progress
for each row execute function public.set_updated_at();

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started',
  watched_seconds integer not null default 0,
  read_seconds integer not null default 0,
  progress_percent numeric(5,2) not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, lesson_id)
);

alter table public.lesson_progress drop constraint if exists lesson_progress_status_check;
alter table public.lesson_progress add constraint lesson_progress_status_check
  check (status in ('not_started', 'in_progress', 'completed'));

create index if not exists idx_lesson_progress_user on public.lesson_progress(user_id);
create index if not exists idx_lesson_progress_lesson on public.lesson_progress(lesson_id);

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4) Examens, banque de questions, tentatives
-- ---------------------------------------------------------------------------

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  step_id uuid references public.course_steps(id) on delete cascade,
  title text not null,
  description text,
  question_count integer not null default 10,
  passing_score_percent integer not null default 70,
  retry_delay_hours integer not null default 24,
  max_attempts integer,
  time_limit_minutes integer,
  randomize_questions boolean not null default true,
  randomize_answers boolean not null default true,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.quizzes drop constraint if exists quizzes_status_check;
alter table public.quizzes add constraint quizzes_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists idx_quizzes_course on public.quizzes(course_id);
create index if not exists idx_quizzes_step on public.quizzes(step_id);

drop trigger if exists set_quizzes_updated_at on public.quizzes;
create trigger set_quizzes_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'single_choice',
  explanation text,
  points integer not null default 1,
  position integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.quiz_questions drop constraint if exists quiz_questions_type_check;
alter table public.quiz_questions add constraint quiz_questions_type_check
  check (question_type in ('single_choice', 'multiple_choice', 'true_false', 'short_answer'));

alter table public.quiz_questions drop constraint if exists quiz_questions_status_check;
alter table public.quiz_questions add constraint quiz_questions_status_check
  check (status in ('active', 'inactive', 'archived'));

create index if not exists idx_quiz_questions_quiz on public.quiz_questions(quiz_id);

drop trigger if exists set_quiz_questions_updated_at on public.quiz_questions;
create trigger set_quiz_questions_updated_at
before update on public.quiz_questions
for each row execute function public.set_updated_at();

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer_text text not null,
  is_correct boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_quiz_answers_question on public.quiz_answers(question_id);

drop trigger if exists set_quiz_answers_updated_at on public.quiz_answers;
create trigger set_quiz_answers_updated_at
before update on public.quiz_answers
for each row execute function public.set_updated_at();

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  step_id uuid references public.course_steps(id) on delete cascade,
  attempt_number integer not null default 1,
  status text not null default 'in_progress',
  score_percent numeric(5,2),
  total_points integer not null default 0,
  earned_points numeric(8,2) not null default 0,
  question_ids uuid[] not null default '{}',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.quiz_attempts drop constraint if exists quiz_attempts_status_check;
alter table public.quiz_attempts add constraint quiz_attempts_status_check
  check (status in ('in_progress', 'passed', 'failed', 'expired', 'cancelled'));

create index if not exists idx_quiz_attempts_user_quiz on public.quiz_attempts(user_id, quiz_id, created_at desc);
create index if not exists idx_quiz_attempts_status on public.quiz_attempts(status);
create index if not exists idx_quiz_attempts_locked_until on public.quiz_attempts(locked_until);

drop trigger if exists set_quiz_attempts_updated_at on public.quiz_attempts;
create trigger set_quiz_attempts_updated_at
before update on public.quiz_attempts
for each row execute function public.set_updated_at();

create table if not exists public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer_id uuid references public.quiz_answers(id) on delete set null,
  free_text_answer text,
  is_correct boolean,
  points_awarded numeric(8,2) not null default 0,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_quiz_attempt_answers_attempt on public.quiz_attempt_answers(attempt_id);
create index if not exists idx_quiz_attempt_answers_question on public.quiz_attempt_answers(question_id);

-- ---------------------------------------------------------------------------
-- 5) Marketplace, commandes, paiements, accès
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  short_description text,
  description text,
  cover_image_url text,
  product_type text not null default 'digital_book',
  price_xof integer not null default 0,
  status text not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.products drop constraint if exists products_type_check;
alter table public.products add constraint products_type_check
  check (product_type in ('digital_book', 'pdf', 'template', 'guide', 'audio', 'video', 'pack', 'other'));

alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create table if not exists public.product_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text,
  file_path text not null,
  file_type text not null default 'pdf',
  download_limit integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_product_assets_product on public.product_assets(product_id);

drop trigger if exists set_product_assets_updated_at on public.product_assets;
create trigger set_product_assets_updated_at
before update on public.product_assets
for each row execute function public.set_updated_at();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_number text unique,
  total_amount_xof integer not null default 0,
  currency text not null default 'XOF',
  status text not null default 'pending',
  payment_gateway text default 'cinetpay',
  affiliate_code text,
  referral_id uuid,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('draft', 'pending', 'paid', 'failed', 'cancelled', 'refunded'));

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null,
  course_id uuid references public.courses(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  title_snapshot text not null,
  quantity integer not null default 1,
  unit_amount_xof integer not null default 0,
  total_amount_xof integer not null default 0,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.order_items drop constraint if exists order_items_type_check;
alter table public.order_items add constraint order_items_type_check
  check (item_type in ('course', 'product'));

alter table public.order_items drop constraint if exists order_items_target_check;
alter table public.order_items add constraint order_items_target_check
  check (
    (item_type = 'course' and course_id is not null and product_id is null)
    or
    (item_type = 'product' and product_id is not null and course_id is null)
  );

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_course on public.order_items(course_id);
create index if not exists idx_order_items_product on public.order_items(product_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  provider text not null default 'cinetpay',
  provider_transaction_id text,
  provider_payment_token text,
  amount_xof integer not null default 0,
  currency text not null default 'XOF',
  status text not null default 'pending',
  paid_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.payments drop constraint if exists payments_status_check;
alter table public.payments add constraint payments_status_check
  check (status in ('pending', 'succeeded', 'failed', 'cancelled', 'refunded'));

create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_provider_tx on public.payments(provider_transaction_id);

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create table if not exists public.product_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  status text not null default 'active',
  download_count integer not null default 0,
  purchased_at timestamptz not null default now(),
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, product_id, order_id)
);

alter table public.product_purchases drop constraint if exists product_purchases_status_check;
alter table public.product_purchases add constraint product_purchases_status_check
  check (status in ('active', 'refunded', 'cancelled'));

create index if not exists idx_product_purchases_user on public.product_purchases(user_id);
create index if not exists idx_product_purchases_product on public.product_purchases(product_id);

drop trigger if exists set_product_purchases_updated_at on public.product_purchases;
create trigger set_product_purchases_updated_at
before update on public.product_purchases
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6) Attestations, notifications, relances
-- ---------------------------------------------------------------------------

create table if not exists public.certificate_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrollment_id uuid references public.course_enrollments(id) on delete set null,
  status text not null default 'pending',
  admin_note text,
  processed_by uuid references public.profiles(id) on delete set null,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, course_id)
);

alter table public.certificate_requests drop constraint if exists certificate_requests_status_check;
alter table public.certificate_requests add constraint certificate_requests_status_check
  check (status in ('pending', 'processing', 'sent', 'rejected', 'cancelled'));

create index if not exists idx_certificate_requests_status on public.certificate_requests(status);
create index if not exists idx_certificate_requests_user on public.certificate_requests(user_id);

drop trigger if exists set_certificate_requests_updated_at on public.certificate_requests;
create trigger set_certificate_requests_updated_at
before update on public.certificate_requests
for each row execute function public.set_updated_at();

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  request_id uuid references public.certificate_requests(id) on delete set null,
  certificate_number text unique,
  title text not null default 'Certificat de formation',
  status text not null default 'pending',
  file_path text,
  issued_at timestamptz,
  sent_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, course_id)
);

alter table public.certificates drop constraint if exists certificates_status_check;
alter table public.certificates add constraint certificates_status_check
  check (status in ('pending', 'generated', 'sent', 'revoked'));

create index if not exists idx_certificates_user on public.certificates(user_id);
create index if not exists idx_certificates_course on public.certificates(course_id);

drop trigger if exists set_certificates_updated_at on public.certificates;
create trigger set_certificates_updated_at
before update on public.certificates
for each row execute function public.set_updated_at();

create table if not exists public.email_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  sent_by uuid references public.profiles(id) on delete set null,
  notification_type text not null default 'generic',
  recipient_email text not null,
  subject text not null,
  body text,
  status text not null default 'pending',
  provider text,
  provider_message_id text,
  sent_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.email_notifications drop constraint if exists email_notifications_status_check;
alter table public.email_notifications add constraint email_notifications_status_check
  check (status in ('pending', 'sent', 'failed', 'cancelled'));

create index if not exists idx_email_notifications_user on public.email_notifications(user_id);
create index if not exists idx_email_notifications_type on public.email_notifications(notification_type);
create index if not exists idx_email_notifications_status on public.email_notifications(status);

create table if not exists public.user_relaunches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  admin_id uuid references public.profiles(id) on delete set null,
  reason text not null default 'inactivity',
  message text,
  status text not null default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.user_relaunches drop constraint if exists user_relaunches_status_check;
alter table public.user_relaunches add constraint user_relaunches_status_check
  check (status in ('draft', 'sent', 'failed', 'cancelled'));

create index if not exists idx_user_relaunches_user on public.user_relaunches(user_id);
create index if not exists idx_user_relaunches_admin on public.user_relaunches(admin_id);
create index if not exists idx_user_relaunches_status on public.user_relaunches(status);

-- ---------------------------------------------------------------------------
-- 7) Affiliation
-- ---------------------------------------------------------------------------

create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete set null,
  referral_code text not null,
  source_url text,
  status text not null default 'registered',
  registered_at timestamptz not null default now(),
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.affiliate_referrals drop constraint if exists affiliate_referrals_status_check;
alter table public.affiliate_referrals add constraint affiliate_referrals_status_check
  check (status in ('registered', 'converted', 'cancelled'));

create index if not exists idx_affiliate_referrals_affiliate on public.affiliate_referrals(affiliate_id);
create index if not exists idx_affiliate_referrals_user on public.affiliate_referrals(referred_user_id);
create index if not exists idx_affiliate_referrals_code on public.affiliate_referrals(referral_code);

drop trigger if exists set_affiliate_referrals_updated_at on public.affiliate_referrals;
create trigger set_affiliate_referrals_updated_at
before update on public.affiliate_referrals
for each row execute function public.set_updated_at();

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete set null,
  referral_id uuid references public.affiliate_referrals(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  amount_xof integer not null default 0,
  rate_percent numeric(5,2) not null default 0,
  status text not null default 'pending',
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.affiliate_commissions drop constraint if exists affiliate_commissions_status_check;
alter table public.affiliate_commissions add constraint affiliate_commissions_status_check
  check (status in ('pending', 'validated', 'paid', 'cancelled'));

create index if not exists idx_affiliate_commissions_affiliate on public.affiliate_commissions(affiliate_id);
create index if not exists idx_affiliate_commissions_order on public.affiliate_commissions(order_id);
create index if not exists idx_affiliate_commissions_status on public.affiliate_commissions(status);

drop trigger if exists set_affiliate_commissions_updated_at on public.affiliate_commissions;
create trigger set_affiliate_commissions_updated_at
before update on public.affiliate_commissions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8) Administration, paramètres plateforme
-- ---------------------------------------------------------------------------

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_logs_actor on public.admin_logs(actor_id);
create index if not exists idx_admin_logs_action on public.admin_logs(action);
create index if not exists idx_admin_logs_created_at on public.admin_logs(created_at desc);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_platform_settings_updated_at on public.platform_settings;
create trigger set_platform_settings_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

insert into public.platform_settings(key, value, description)
values
  ('quiz_default_retry_delay_hours', '24'::jsonb, 'Délai par défaut avant reprise d’un examen échoué.'),
  ('quiz_default_passing_score_percent', '70'::jsonb, 'Score minimum par défaut pour réussir un examen.'),
  ('affiliate_default_rate_percent', '20'::jsonb, 'Taux de commission affilié par défaut.'),
  ('activity_inactivity_days_before_relaunch', '3'::jsonb, 'Nombre de jours d’inactivité avant relance.'),
  ('first_course_payment_popup_enabled', 'true'::jsonb, 'Active le pop-up de paiement de la première formation.')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 9) Trigger création profil après inscription Supabase Auth
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  raw_full_name text;
  raw_first_name text;
  raw_last_name text;
  raw_phone text;
  raw_ref text;
  affiliate_user_id uuid;
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  raw_full_name := nullif(trim(coalesce(meta->>'full_name', meta->>'name', '')), '');
  raw_first_name := nullif(trim(coalesce(meta->>'first_name', split_part(coalesce(raw_full_name, ''), ' ', 1))), '');
  raw_last_name := nullif(trim(coalesce(meta->>'last_name', '')), '');
  raw_phone := nullif(trim(coalesce(meta->>'phone', meta->>'phone_number', '')), '');
  raw_ref := nullif(trim(coalesce(meta->>'ref', meta->>'affiliate_code', '')), '');

  if raw_ref is not null then
    select p.id into affiliate_user_id
    from public.profiles p
    where p.affiliate_code = raw_ref
    limit 1;
  end if;

  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    phone,
    referred_by,
    status,
    email_verified_at,
    metadata
  ) values (
    new.id,
    new.email,
    raw_first_name,
    raw_last_name,
    coalesce(raw_full_name, trim(coalesce(raw_first_name, '') || ' ' || coalesce(raw_last_name, ''))),
    raw_phone,
    affiliate_user_id,
    case when new.email_confirmed_at is null then 'pending_email_verification' else 'active' end,
    new.email_confirmed_at,
    jsonb_build_object('signup_ref', raw_ref)
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone),
    referred_by = coalesce(public.profiles.referred_by, excluded.referred_by),
    email_verified_at = excluded.email_verified_at,
    updated_at = now();

  if affiliate_user_id is not null then
    insert into public.affiliate_referrals (
      affiliate_id,
      referred_user_id,
      referral_code,
      status,
      metadata
    ) values (
      affiliate_user_id,
      new.id,
      raw_ref,
      'registered',
      jsonb_build_object('source', 'signup')
    ) on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 10) RLS — activation
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_activity_logs enable row level security;
alter table public.courses enable row level security;
alter table public.course_steps enable row level security;
alter table public.lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_step_progress enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.products enable row level security;
alter table public.product_assets enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.product_purchases enable row level security;
alter table public.certificate_requests enable row level security;
alter table public.certificates enable row level security;
alter table public.email_notifications enable row level security;
alter table public.user_relaunches enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_commissions enable row level security;
alter table public.admin_logs enable row level security;
alter table public.platform_settings enable row level security;

-- ---------------------------------------------------------------------------
-- 11) RLS — politiques
-- ---------------------------------------------------------------------------

-- Profiles
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Activity
drop policy if exists user_activity_select_own_or_admin on public.user_activity_logs;
create policy user_activity_select_own_or_admin on public.user_activity_logs
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_activity_insert_own on public.user_activity_logs;
create policy user_activity_insert_own on public.user_activity_logs
for insert with check (user_id = auth.uid());

-- Courses public catalog + admin write
drop policy if exists courses_select_published_or_admin on public.courses;
create policy courses_select_published_or_admin on public.courses
for select using (status = 'published' or public.is_admin());

drop policy if exists courses_admin_all on public.courses;
create policy courses_admin_all on public.courses
for all using (public.is_admin()) with check (public.is_admin());

-- Steps are visible when course published; content access stays controlled in lessons/quizzes.
drop policy if exists course_steps_select_published_or_admin on public.course_steps;
create policy course_steps_select_published_or_admin on public.course_steps
for select using (
  public.is_admin()
  or exists (
    select 1 from public.courses c
    where c.id = course_steps.course_id and c.status = 'published'
  )
);

drop policy if exists course_steps_admin_all on public.course_steps;
create policy course_steps_admin_all on public.course_steps
for all using (public.is_admin()) with check (public.is_admin());

-- Lessons: previews visible; full content only if enrolled or admin.
drop policy if exists lessons_select_preview_or_access on public.lessons;
create policy lessons_select_preview_or_access on public.lessons
for select using (
  public.is_admin()
  or is_preview = true
  or exists (
    select 1
    from public.course_steps cs
    join public.course_enrollments ce on ce.course_id = cs.course_id
    where cs.id = lessons.step_id
      and ce.user_id = auth.uid()
      and ce.status in ('active', 'completed')
  )
);

drop policy if exists lessons_admin_all on public.lessons;
create policy lessons_admin_all on public.lessons
for all using (public.is_admin()) with check (public.is_admin());

-- Enrollments and progress
drop policy if exists course_enrollments_select_own_or_admin on public.course_enrollments;
create policy course_enrollments_select_own_or_admin on public.course_enrollments
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists course_enrollments_admin_all on public.course_enrollments;
create policy course_enrollments_admin_all on public.course_enrollments
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists course_step_progress_select_own_or_admin on public.course_step_progress;
create policy course_step_progress_select_own_or_admin on public.course_step_progress
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists course_step_progress_write_own_or_admin on public.course_step_progress;
create policy course_step_progress_write_own_or_admin on public.course_step_progress
for all using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists lesson_progress_select_own_or_admin on public.lesson_progress;
create policy lesson_progress_select_own_or_admin on public.lesson_progress
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists lesson_progress_write_own_or_admin on public.lesson_progress;
create policy lesson_progress_write_own_or_admin on public.lesson_progress
for all using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- Quizzes/questions/answers visible only with course access or admin.
drop policy if exists quizzes_select_access_or_admin on public.quizzes;
create policy quizzes_select_access_or_admin on public.quizzes
for select using (
  public.is_admin()
  or exists (
    select 1 from public.course_enrollments ce
    where ce.course_id = quizzes.course_id
      and ce.user_id = auth.uid()
      and ce.status in ('active', 'completed')
  )
);

drop policy if exists quizzes_admin_all on public.quizzes;
create policy quizzes_admin_all on public.quizzes
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists quiz_questions_select_access_or_admin on public.quiz_questions;
create policy quiz_questions_select_access_or_admin on public.quiz_questions
for select using (
  public.is_admin()
  or exists (
    select 1
    from public.quizzes q
    join public.course_enrollments ce on ce.course_id = q.course_id
    where q.id = quiz_questions.quiz_id
      and ce.user_id = auth.uid()
      and ce.status in ('active', 'completed')
  )
);

drop policy if exists quiz_questions_admin_all on public.quiz_questions;
create policy quiz_questions_admin_all on public.quiz_questions
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists quiz_answers_select_access_or_admin on public.quiz_answers;
create policy quiz_answers_select_access_or_admin on public.quiz_answers
for select using (
  public.is_admin()
  or exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    join public.course_enrollments ce on ce.course_id = q.course_id
    where qq.id = quiz_answers.question_id
      and ce.user_id = auth.uid()
      and ce.status in ('active', 'completed')
  )
);

drop policy if exists quiz_answers_admin_all on public.quiz_answers;
create policy quiz_answers_admin_all on public.quiz_answers
for all using (public.is_admin()) with check (public.is_admin());

-- Attempts
drop policy if exists quiz_attempts_select_own_or_admin on public.quiz_attempts;
create policy quiz_attempts_select_own_or_admin on public.quiz_attempts
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists quiz_attempts_write_own_or_admin on public.quiz_attempts;
create policy quiz_attempts_write_own_or_admin on public.quiz_attempts
for all using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists quiz_attempt_answers_select_own_or_admin on public.quiz_attempt_answers;
create policy quiz_attempt_answers_select_own_or_admin on public.quiz_attempt_answers
for select using (
  public.is_admin()
  or exists (
    select 1 from public.quiz_attempts qa
    where qa.id = quiz_attempt_answers.attempt_id and qa.user_id = auth.uid()
  )
);

drop policy if exists quiz_attempt_answers_write_own_or_admin on public.quiz_attempt_answers;
create policy quiz_attempt_answers_write_own_or_admin on public.quiz_attempt_answers
for all using (
  public.is_admin()
  or exists (
    select 1 from public.quiz_attempts qa
    where qa.id = quiz_attempt_answers.attempt_id and qa.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.quiz_attempts qa
    where qa.id = quiz_attempt_answers.attempt_id and qa.user_id = auth.uid()
  )
);

-- Marketplace
drop policy if exists products_select_published_or_admin on public.products;
create policy products_select_published_or_admin on public.products
for select using (status = 'published' or public.is_admin());

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_assets_select_purchased_or_admin on public.product_assets;
create policy product_assets_select_purchased_or_admin on public.product_assets
for select using (
  public.is_admin()
  or exists (
    select 1 from public.product_purchases pp
    where pp.product_id = product_assets.product_id
      and pp.user_id = auth.uid()
      and pp.status = 'active'
  )
);

drop policy if exists product_assets_admin_all on public.product_assets;
create policy product_assets_admin_all on public.product_assets
for all using (public.is_admin()) with check (public.is_admin());

-- Orders/payments/order items
drop policy if exists orders_select_own_or_admin on public.orders;
create policy orders_select_own_or_admin on public.orders
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own on public.orders
for insert with check (user_id = auth.uid());

drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists order_items_select_own_or_admin on public.order_items;
create policy order_items_select_own_or_admin on public.order_items
for select using (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  )
);

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists payments_select_own_or_admin on public.payments;
create policy payments_select_own_or_admin on public.payments
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists payments_admin_all on public.payments;
create policy payments_admin_all on public.payments
for all using (public.is_admin()) with check (public.is_admin());

-- Product purchases
drop policy if exists product_purchases_select_own_or_admin on public.product_purchases;
create policy product_purchases_select_own_or_admin on public.product_purchases
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists product_purchases_admin_all on public.product_purchases;
create policy product_purchases_admin_all on public.product_purchases
for all using (public.is_admin()) with check (public.is_admin());

-- Certificates
drop policy if exists certificate_requests_select_own_or_admin on public.certificate_requests;
create policy certificate_requests_select_own_or_admin on public.certificate_requests
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists certificate_requests_admin_all on public.certificate_requests;
create policy certificate_requests_admin_all on public.certificate_requests
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists certificates_select_own_or_admin on public.certificates;
create policy certificates_select_own_or_admin on public.certificates
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists certificates_admin_all on public.certificates;
create policy certificates_admin_all on public.certificates
for all using (public.is_admin()) with check (public.is_admin());

-- Emails/relaunches
drop policy if exists email_notifications_select_own_or_admin on public.email_notifications;
create policy email_notifications_select_own_or_admin on public.email_notifications
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists email_notifications_admin_all on public.email_notifications;
create policy email_notifications_admin_all on public.email_notifications
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists user_relaunches_select_own_or_admin on public.user_relaunches;
create policy user_relaunches_select_own_or_admin on public.user_relaunches
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_relaunches_admin_all on public.user_relaunches;
create policy user_relaunches_admin_all on public.user_relaunches
for all using (public.is_admin()) with check (public.is_admin());

-- Affiliate
drop policy if exists affiliate_referrals_select_own_or_admin on public.affiliate_referrals;
create policy affiliate_referrals_select_own_or_admin on public.affiliate_referrals
for select using (affiliate_id = auth.uid() or referred_user_id = auth.uid() or public.is_admin());

drop policy if exists affiliate_referrals_admin_all on public.affiliate_referrals;
create policy affiliate_referrals_admin_all on public.affiliate_referrals
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists affiliate_commissions_select_own_or_admin on public.affiliate_commissions;
create policy affiliate_commissions_select_own_or_admin on public.affiliate_commissions
for select using (affiliate_id = auth.uid() or public.is_admin());

drop policy if exists affiliate_commissions_admin_all on public.affiliate_commissions;
create policy affiliate_commissions_admin_all on public.affiliate_commissions
for all using (public.is_admin()) with check (public.is_admin());

-- Admin and settings
drop policy if exists admin_logs_admin_only on public.admin_logs;
create policy admin_logs_admin_only on public.admin_logs
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists platform_settings_select_all on public.platform_settings;
create policy platform_settings_select_all on public.platform_settings
for select using (true);

drop policy if exists platform_settings_admin_all on public.platform_settings;
create policy platform_settings_admin_all on public.platform_settings
for all using (public.is_admin()) with check (public.is_admin());

commit;

-- ============================================================================
-- Fin EDVR_SUPABASE_SCHEMA_V2.sql
-- ============================================================================
SQL

cat > SUPABASE_SCHEMA_V2_WORKFLOW.md <<'MD'
# EDVR — Schéma Supabase V2

Ce schéma correspond au workflow final validé :

- page publique vitrine ;
- inscription avec email, profil et téléphone ;
- espace utilisateur connecté ;
- formations payantes verrouillées ;
- étapes de formation progressives ;
- leçons texte, vidéo, YouTube, PDF ;
- examens avec banque de questions ;
- blocage temporaire après échec ;
- déblocage de la formation suivante via prérequis ;
- marketplace produits numériques ;
- commandes et paiements ;
- activité utilisateur ;
- relance utilisateur ;
- demande d’attestation ;
- affiliation ;
- administration et journaux.

## Fichier SQL généré

```txt
supabase/EDVR_SUPABASE_SCHEMA_V2.sql
```

## Exécution

1. Ouvrir Supabase.
2. Aller dans **SQL Editor**.
3. Créer une nouvelle requête.
4. Coller tout le contenu de `supabase/EDVR_SUPABASE_SCHEMA_V2.sql`.
5. Cliquer sur **Run**.

## Tables principales

- `profiles`
- `user_activity_logs`
- `courses`
- `course_steps`
- `lessons`
- `course_enrollments`
- `course_step_progress`
- `lesson_progress`
- `quizzes`
- `quiz_questions`
- `quiz_answers`
- `quiz_attempts`
- `quiz_attempt_answers`
- `products`
- `product_assets`
- `orders`
- `order_items`
- `payments`
- `product_purchases`
- `certificate_requests`
- `certificates`
- `email_notifications`
- `user_relaunches`
- `affiliate_referrals`
- `affiliate_commissions`
- `admin_logs`
- `platform_settings`

## Règles importantes

- Les utilisateurs voient leurs propres données.
- Les admins et super admins voient les données globales.
- Les contenus de leçons ne sont accessibles qu’après inscription à la formation.
- Les fichiers produits ne sont accessibles qu’après achat.
- Les formations peuvent avoir un prérequis.
- Les examens peuvent imposer score minimum, délai de reprise et tirage aléatoire.
- Les attestations passent par une demande traitée par l’admin.

## Après exécution

Tester :

1. inscription ;
2. création automatique dans `profiles` ;
3. connexion ;
4. création du premier super admin ;
5. insertion d’une formation test ;
6. insertion d’un produit marketplace test.
MD

printf "\n=== Terminé ===\n"
printf "Fichiers créés:\n"
printf "  - supabase/EDVR_SUPABASE_SCHEMA_V2.sql\n"
printf "  - SUPABASE_SCHEMA_V2_WORKFLOW.md\n"
printf "Sauvegarde éventuelle: %s\n" "$BACKUP_DIR"
printf "\nProchaine action:\n"
printf "  Copier le SQL V2 dans Supabase SQL Editor puis exécuter Run.\n"