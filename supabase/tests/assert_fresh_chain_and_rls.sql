\set ON_ERROR_STOP on

insert into auth.users (id, email, raw_user_meta_data) values
  ('20000000-0000-0000-0000-000000000001', 'learner@example.test',
    '{"full_name":"Learner Public","phone":"+22800000001","role":"admin"}'),
  ('20000000-0000-0000-0000-000000000002', 'admin@example.test',
    '{"full_name":"Admin Public","role":"super_admin"}'),
  ('20000000-0000-0000-0000-000000000003', 'super@example.test',
    '{"full_name":"Super Public"}'),
  ('20000000-0000-0000-0000-000000000004', 'target@example.test',
    '{"full_name":"Target Public"}');

do $$
declare
  role_default text;
  role_type text;
  policy_count integer;
begin
  select column_default, data_type
    into role_default, role_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'profiles' and column_name = 'role';

  if role_default not like '%apprenant%' or role_type <> 'text' then
    raise exception 'Colonne role incorrecte: default %, type %.', role_default, role_type;
  end if;

  if exists (select 1 from public.profiles where role <> 'apprenant') then
    raise exception 'Le trigger a fait confiance à un rôle public.';
  end if;

  if not exists (
    select 1 from public.profiles
    where email = 'learner@example.test'
      and full_name = 'Learner Public'
      and phone = '+22800000001'
  ) then
    raise exception 'Les métadonnées personnelles autorisées ne sont pas conservées.';
  end if;

  select count(*) into policy_count
  from pg_policies
  where schemaname = 'public' and tablename = 'profiles'
    and policyname in ('profiles_select_own', 'profiles_update_own');

  if policy_count <> 2 then
    raise exception 'Policies profiles attendues: 2, obtenues: %.', policy_count;
  end if;
end
$$;

-- Prépare les rôles privilégiés par une opération de maintenance, jamais par
-- une entrée publique.
update public.profiles set role = 'admin' where email = 'admin@example.test';
update public.profiles set role = 'super_admin' where email = 'super@example.test';

-- ANON : aucune lecture.
set role anon;
do $$
begin
  perform * from public.profiles;
  raise exception 'Anon a pu lire profiles.';
exception
  when insufficient_privilege then null;
end
$$;
reset role;

-- APPRENANT : lecture et modification de ses seuls champs personnels.
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', false);
set role authenticated;

do $$
declare visible_rows integer;
begin
  select count(*) into visible_rows from public.profiles;
  if visible_rows <> 1 then
    raise exception 'RLS apprenant: 1 profil visible attendu, % obtenu(s).', visible_rows;
  end if;
end
$$;

update public.profiles set full_name = 'Learner Updated'
where id = '20000000-0000-0000-0000-000000000001';

update public.profiles set full_name = 'Forbidden Change'
where id = '20000000-0000-0000-0000-000000000004';

do $$
begin
  update public.profiles set role = 'admin'
  where id = '20000000-0000-0000-0000-000000000001';
  raise exception 'Auto-promotion directe vers admin autorisée.';
exception
  when insufficient_privilege then null;
end
$$;

do $$
begin
  perform public.set_profile_role(
    '20000000-0000-0000-0000-000000000001', 'super_admin'
  );
  raise exception 'Auto-promotion RPC vers super_admin autorisée.';
exception
  when insufficient_privilege then null;
end
$$;

reset role;

do $$
begin
  if (select full_name from public.profiles where email = 'target@example.test') <> 'Target Public' then
    raise exception 'Un apprenant a modifié un autre profil.';
  end if;
  if (select role from public.profiles where email = 'learner@example.test') <> 'apprenant' then
    raise exception 'Un apprenant a modifié son rôle.';
  end if;
end
$$;

-- ADMIN : authentifié et lisible par le DAL, mais aucune promotion de rôle.
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', false);
set role authenticated;
do $$
begin
  if (select role from public.profiles where id = auth.uid()) <> 'admin' then
    raise exception 'Le profil admin autorisé n''est pas lisible.';
  end if;
  perform public.set_profile_role(
    '20000000-0000-0000-0000-000000000002', 'super_admin'
  );
  raise exception 'Un admin a pu devenir super_admin.';
exception
  when insufficient_privilege then null;
end
$$;
reset role;

-- SUPER_ADMIN : seule voie autorisée pour une promotion contrôlée.
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000003', false);
set role authenticated;
select public.set_profile_role(
  '20000000-0000-0000-0000-000000000004', 'admin'
);
reset role;

do $$
begin
  if (select role from public.profiles where email = 'target@example.test') <> 'admin' then
    raise exception 'La promotion contrôlée par super_admin a échoué.';
  end if;
end
$$;

select 'fresh_chain_trigger_and_rls_ok' as test_result;
