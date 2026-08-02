\set ON_ERROR_STOP on

do $security_audit$
declare
  table_name text;
  role_name text;
  privilege_name text;
  missing_rls text;
  dangerous_grants text;
  policy_count integer;
  handle_function oid := 'public.handle_new_user()'::regprocedure;
begin
  select string_agg(c.relname, ', ' order by c.relname)
    into missing_rls
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = any (array[
      'profiles', 'courses', 'modules', 'lessons', 'products',
      'orders', 'payments', 'enrollments', 'affiliates', 'commissions'
    ])
    and not c.relrowsecurity;

  if missing_rls is not null then
    raise exception 'Tables métier sans RLS: %.', missing_rls;
  end if;

  foreach table_name in array array[
    'courses', 'modules', 'lessons', 'products', 'orders',
    'payments', 'enrollments', 'affiliates', 'commissions'
  ]
  loop
    foreach role_name in array array['anon', 'authenticated']
    loop
      foreach privilege_name in array array[
        'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'
      ]
      loop
        if has_table_privilege(role_name, format('public.%I', table_name), privilege_name) then
          dangerous_grants := concat_ws(', ', dangerous_grants,
            format('%s:%s:%s', table_name, role_name, privilege_name));
        end if;
      end loop;
    end loop;
  end loop;

  if dangerous_grants is not null then
    raise exception 'Privilèges clients dangereux restants: %.', dangerous_grants;
  end if;

  if has_table_privilege('anon', 'public.modules', 'SELECT')
     or has_table_privilege('anon', 'public.lessons', 'SELECT')
     or has_table_privilege('authenticated', 'public.modules', 'SELECT')
     or has_table_privilege('authenticated', 'public.lessons', 'SELECT') then
    raise exception 'Un rôle client conserve SELECT sur modules ou lessons.';
  end if;

  select count(*) into policy_count
  from pg_policies
  where schemaname = 'public' and tablename in ('modules', 'lessons');

  if policy_count <> 0 then
    raise exception 'Modules/lessons doivent rester sans policy, obtenu: %.', policy_count;
  end if;

  if has_table_privilege('anon', 'public.profiles', 'SELECT')
     or has_any_column_privilege('anon', 'public.profiles', 'SELECT,UPDATE') then
    raise exception 'Anon conserve un privilège sur profiles.';
  end if;

  if not has_table_privilege('authenticated', 'public.profiles', 'SELECT')
     or not has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE')
     or not has_column_privilege('authenticated', 'public.profiles', 'phone', 'UPDATE') then
    raise exception 'Les privilèges profiles validés ont régressé.';
  end if;

  foreach privilege_name in array array['id', 'email', 'role', 'status', 'created_at']
  loop
    if has_column_privilege('authenticated', 'public.profiles', privilege_name, 'UPDATE') then
      raise exception 'Authenticated peut modifier profiles.%.', privilege_name;
    end if;
  end loop;

  if exists (
    select 1
    from pg_proc p,
      lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
    where p.oid = handle_function
      and acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
  ) then
    raise exception 'PUBLIC conserve EXECUTE sur handle_new_user.';
  end if;

  if has_function_privilege('anon', handle_function, 'EXECUTE')
     or has_function_privilege('authenticated', handle_function, 'EXECUTE') then
    raise exception 'Un rôle client conserve EXECUTE sur handle_new_user.';
  end if;

  if has_function_privilege('anon', 'public.set_profile_role(uuid,text)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.set_profile_role(uuid,text)', 'EXECUTE') then
    raise exception 'Les grants de set_profile_role ont régressé.';
  end if;
end
$security_audit$;

-- Vérifie aussi le refus effectif de lecture, pas seulement les ACL catalogues.
set role anon;
do $$
begin
  perform * from public.modules;
  raise exception 'Anon a pu lire modules.';
exception when insufficient_privilege then null;
end
$$;
do $$
begin
  perform * from public.lessons;
  raise exception 'Anon a pu lire lessons.';
exception when insufficient_privilege then null;
end
$$;
reset role;

set role authenticated;
do $$
begin
  perform * from public.modules;
  raise exception 'Authenticated a pu lire modules.';
exception when insufficient_privilege then null;
end
$$;
do $$
begin
  perform * from public.lessons;
  raise exception 'Authenticated a pu lire lessons.';
exception when insufficient_privilege then null;
end
$$;
reset role;

select 'business_tables_security_ok' as test_result;
