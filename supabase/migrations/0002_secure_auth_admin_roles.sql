-- Sécurisation intermédiaire compatible avec le schéma créé par 0001.
--
-- Cette migration historique ne tente plus de changer le vocabulaire des rôles :
-- 0001 utilise encore l'enum legacy app_role. La conversion non destructive est
-- réalisée par 0003, qui sait traiter une colonne enum ou texte.

begin;

alter table public.profiles enable row level security;

-- Les clients publics ne créent pas les profils directement : le trigger Auth
-- s'en charge. Un utilisateur authentifié ne peut modifier que les deux champs
-- personnels réellement présents dans 0001 et utilisés par l'application.
revoke all privileges on table public.profiles from anon;
revoke all privileges on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

commit;
