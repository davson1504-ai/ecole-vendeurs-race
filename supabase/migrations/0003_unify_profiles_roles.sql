-- Convergence non destructive des rôles de sécurité de profiles.
-- Vocabulaire officiel : apprenant, admin, super_admin.
-- L'affiliation reste une fonctionnalité métier et ne confère aucun privilège.

begin;

do $$
declare
  role_data_type text;
  role_udt_schema text;
  role_udt_name text;
  role_type_kind "char";
  role_constraint record;
  invalid_roles text;
begin
  if to_regclass('public.profiles') is null then
    raise exception using
      message = '0003_unify_profiles_roles: table public.profiles absente.',
      hint = 'Appliquer 0001_initial_schema.sql avant cette migration.';
  end if;

  select c.data_type, c.udt_schema, c.udt_name, t.typtype
    into role_data_type, role_udt_schema, role_udt_name, role_type_kind
  from information_schema.columns c
  left join pg_namespace n on n.nspname = c.udt_schema
  left join pg_type t on t.typnamespace = n.oid and t.typname = c.udt_name
  where c.table_schema = 'public'
    and c.table_name = 'profiles'
    and c.column_name = 'role';

  if role_data_type is null then
    raise exception using
      message = '0003_unify_profiles_roles: colonne public.profiles.role absente.',
      hint = 'État de schéma inconnu : ne pas poursuivre sans audit.';
  end if;

  if not (
    role_data_type in ('text', 'character varying', 'character')
    or (role_data_type = 'USER-DEFINED' and role_type_kind = 'e')
  ) then
    raise exception using
      message = format(
        '0003_unify_profiles_roles: type dangereux ou inconnu pour profiles.role: %s (%I.%I).',
        role_data_type,
        role_udt_schema,
        role_udt_name
      ),
      hint = 'Types acceptés : enum PostgreSQL, text, varchar ou char.';
  end if;

  select string_agg(distinct role::text, ', ' order by role::text)
    into invalid_roles
  from public.profiles
  where role is null
     or role::text not in ('learner', 'student', 'affiliate', 'apprenant', 'admin', 'super_admin');

  if invalid_roles is not null
     or exists (select 1 from public.profiles where role is null) then
    raise exception using
      message = format(
        '0003_unify_profiles_roles: valeurs de rôle inconnues détectées: %s.',
        coalesce(invalid_roles, '<NULL>')
      ),
      hint = 'Auditer et mapper explicitement ces valeurs avant de relancer.';
  end if;

  alter table public.profiles alter column role drop default;

  -- Supprime uniquement les contraintes CHECK qui dépendent de role. Les clés,
  -- index et autres contraintes de profiles sont préservés.
  for role_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ~* '\mrole\M'
  loop
    execute format(
      'alter table public.profiles drop constraint %I',
      role_constraint.conname
    );
  end loop;

  -- Une colonne texte rend la migration compatible avec les enums legacy et
  -- les schémas V2 partiellement appliqués sans supprimer l'ancien type enum.
  alter table public.profiles
    alter column role type text using role::text;

  update public.profiles
  set role = case role
    when 'learner' then 'apprenant'
    when 'student' then 'apprenant'
    when 'affiliate' then 'apprenant'
    else role
  end;

  alter table public.profiles
    alter column role set default 'apprenant',
    alter column role set not null;

  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('apprenant', 'admin', 'super_admin'));
end
$$;

-- Le trigger accepte seulement les métadonnées personnelles nécessaires.
-- Toute clé role/admin/super_admin de raw_user_meta_data est volontairement ignorée.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), ''),
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'phone',
      new.raw_user_meta_data ->> 'phone_number'
    )), ''),
    'apprenant'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS et privilèges : les policies limitent les lignes; les GRANT de colonnes
-- empêchent en plus toute modification directe de role, status, email ou id.
alter table public.profiles enable row level security;

revoke all privileges on table public.profiles from anon;
revoke all privileges on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_update_self_or_admin on public.profiles;
drop policy if exists profiles_select_own_or_admin on public.profiles;
drop policy if exists profiles_update_own_or_admin on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Les changements de rôle passent exclusivement par cette opération contrôlée.
-- Un admin ne peut pas l'appeler avec succès : seul un super_admin actif le peut.
create or replace function public.set_profile_role(
  target_profile_id uuid,
  target_role text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role text;
begin
  if actor_id is null then
    raise exception 'Authentification requise.' using errcode = '42501';
  end if;

  select role into actor_role
  from public.profiles
  where id = actor_id and status = 'active';

  if actor_role is distinct from 'super_admin' then
    raise exception 'Seul un super_admin actif peut modifier un rôle.'
      using errcode = '42501';
  end if;

  if target_role not in ('apprenant', 'admin', 'super_admin') then
    raise exception 'Rôle cible invalide: %.', target_role
      using errcode = '22023';
  end if;

  update public.profiles
  set role = target_role
  where id = target_profile_id;

  if not found then
    raise exception 'Profil cible introuvable: %.', target_profile_id
      using errcode = 'P0002';
  end if;

  -- Les deux variantes historiques de admin_logs sont supportées si la table
  -- existe. L'absence de cette table dans 0001 n'empêche pas la convergence.
  if to_regclass('public.admin_logs') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'admin_logs'
        and column_name = 'actor_id'
    ) then
      execute $audit$
        insert into public.admin_logs
          (actor_id, action, entity_type, entity_id, metadata)
        values ($1, 'profile_role_changed', 'profile', $2,
          jsonb_build_object('new_role', $3))
      $audit$ using actor_id, target_profile_id, target_role;
    elsif exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'admin_logs'
        and column_name = 'admin_id'
    ) then
      execute $audit$
        insert into public.admin_logs
          (admin_id, action, entity_type, entity_id, metadata)
        values ($1, 'profile_role_changed', 'profile', $2,
          jsonb_build_object('new_role', $3))
      $audit$ using actor_id, target_profile_id, target_role;
    end if;
  end if;
end;
$$;

revoke all on function public.set_profile_role(uuid, text) from public;
revoke all on function public.set_profile_role(uuid, text) from anon;
grant execute on function public.set_profile_role(uuid, text) to authenticated;

commit;
