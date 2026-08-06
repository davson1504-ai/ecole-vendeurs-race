\set ON_ERROR_STOP on

do $tests$
declare n integer;
begin
  select count(*) into n from public.courses where status='published';
  if n < 3 then raise exception 'Seed: 3 formations publiées attendues, obtenu %', n; end if;
  select count(*) into n from public.modules;
  if n < 15 then raise exception 'Seed: 15 modules attendus, obtenu %', n; end if;
  select count(*) into n from public.lessons;
  if n < 30 then raise exception 'Seed: 30 leçons attendues, obtenu %', n; end if;
  select count(*) into n from public.lessons where is_preview;
  if exists (
    select 1
    from public.courses c
    where c.status = 'published'
      and not exists (
        select 1
        from public.modules m
        join public.lessons l on l.module_id = m.id
        where m.course_id = c.id and l.is_preview
      )
  ) then raise exception 'Seed: every published course must have a preview'; end if;
  if exists (
    select 1
    from pg_class c
    join pg_namespace nsp on nsp.oid = c.relnamespace
    where nsp.nspname = 'public'
      and c.relkind in ('r', 'p')
      and not c.relrowsecurity
  ) then raise exception 'A public table has RLS disabled'; end if;
  if n < 3 then raise exception 'Seed: au moins 3 aperçus attendus, obtenu %', n; end if;
  if not (select relrowsecurity from pg_class where oid='public.lesson_progress'::regclass) then raise exception 'RLS absente de lesson_progress'; end if;
  if has_column_privilege('authenticated','public.profiles','role','UPDATE') or has_column_privilege('authenticated','public.profiles','status','UPDATE') then raise exception 'Rôle/statut directement modifiables'; end if;
  if has_function_privilege('anon','public.set_profile_status(uuid,boolean)','EXECUTE') then raise exception 'Anon peut changer un statut'; end if;
end
$tests$;

-- Public: brouillons invisibles, modules publiés visibles, seules les leçons preview visibles.
set role anon;
do $$ declare visible integer; begin
  select count(*) into visible from public.courses;
  if visible <> 3 then raise exception 'Catalogue public incorrect: %',visible; end if;
end $$;
reset role;

-- Jeu de rôles jetable pour tester ownership, enrollment et administration.
insert into auth.users(id,email) values
 ('30000000-0000-0000-0000-000000000001','platform-learner1@example.test'),
 ('30000000-0000-0000-0000-000000000002','platform-learner2@example.test'),
 ('30000000-0000-0000-0000-000000000003','platform-admin@example.test');
update public.profiles set role='admin' where id='30000000-0000-0000-0000-000000000003';
insert into public.enrollments(user_id,course_id,active)
select '30000000-0000-0000-0000-000000000001',id,true from public.courses order by slug limit 1;

set role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000001',false);
do $$ declare visible integer; begin
  select count(*) into visible from public.lessons;
  if visible < 10 then raise exception 'Apprenant inscrit ne voit pas toutes ses leçons'; end if;
end $$;
reset role;

select set_config('test.private_lesson_id',(select id::text from public.lessons where not is_preview limit 1),false);
set role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000002',false);
do $$ begin
  insert into public.lesson_progress(profile_id,lesson_id) values ('30000000-0000-0000-0000-000000000002',current_setting('test.private_lesson_id')::uuid);
  raise exception 'Progression sans enrollment acceptée';
exception when insufficient_privilege or check_violation then null; end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000003',false);
do $$ declare test_id uuid; begin
  insert into public.courses(slug,title,status,price_xof) values('test-admin-course','Test admin','draft',0) returning id into test_id;
  update public.courses set status='published' where id=test_id;
  if not found then raise exception 'Admin ne peut pas publier'; end if;
  delete from public.courses where id=test_id;
end $$;
reset role;

-- Un admin simple ne peut pas désactiver un super_admin.
update public.profiles set role='super_admin' where id='30000000-0000-0000-0000-000000000001';
set role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000003',false);
do $$ begin
  perform public.set_profile_status('30000000-0000-0000-0000-000000000001', false);
  raise exception 'Admin a modifié un super_admin';
exception when insufficient_privilege then null; end $$;
reset role;

select 'learning_platform_security_ok' as test_result;
