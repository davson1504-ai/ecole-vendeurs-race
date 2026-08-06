-- Audit post-migration strictement en lecture seule.
-- À exécuter uniquement sur le staging navpnanyltussvtlxouk après vérification du ref lié.

select version, name
from supabase_migrations.schema_migrations
order by version;

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;

select
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;

select
  c.conname,
  c.contype,
  pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid = 'public.profiles'::regclass
order by c.conname;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'profiles'
order by indexname;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee in ('anon', 'authenticated', 'service_role')
order by grantee, privilege_type;

select grantee, column_name, privilege_type
from information_schema.role_column_grants
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee in ('anon', 'authenticated', 'service_role')
order by grantee, column_name, privilege_type;

select
  n.nspname as schema_name,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_get_triggerdef(t.oid) as definition
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where not t.tgisinternal
  and ((n.nspname = 'auth' and c.relname = 'users')
    or (n.nspname = 'public' and c.relname = 'profiles'))
order by n.nspname, c.relname, t.tgname;

select
  n.nspname as schema_name,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  p.prosecdef as security_definer,
  p.proconfig as function_config,
  p.proacl as access_control,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('handle_new_user', 'set_profile_role')
order by p.proname;

select role::text, count(*)
from public.profiles
group by role::text
order by role::text;

select 'auth.users' as relation, count(*) as row_count from auth.users
union all select 'profiles', count(*) from public.profiles
union all select 'courses', count(*) from public.courses
union all select 'modules', count(*) from public.modules
union all select 'lessons', count(*) from public.lessons
union all select 'products', count(*) from public.products
union all select 'orders', count(*) from public.orders
union all select 'payments', count(*) from public.payments
union all select 'enrollments', count(*) from public.enrollments
union all select 'affiliates', count(*) from public.affiliates
union all select 'commissions', count(*) from public.commissions
order by relation;
