-- Harmonise le rôle public avec le vocabulaire produit et empêche toute
-- auto-promotion via la Data API. Cette migration ne supprime aucune donnée.

begin;

alter table public.profiles
  alter column role set default 'apprenant';

update public.profiles
set role = 'apprenant'
where role = 'student';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('apprenant', 'admin', 'super_admin'));

-- Le trigger auth crée les profils. Les clients authentifiés n'ont besoin
-- que de lire leur profil et d'éditer les champs personnels autorisés.
revoke all privileges on table public.profiles from anon;
revoke all privileges on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (
  first_name,
  last_name,
  full_name,
  phone,
  avatar_url,
  last_activity_at
) on table public.profiles to authenticated;

commit;
