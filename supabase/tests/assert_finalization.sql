do $$
declare
  outline_count integer;
  exposed_content_columns integer;
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='terms_accepted_at') then
    raise exception 'Le profil ne permet pas de finaliser le compte.';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_insert_own_pending') then
    raise exception 'La policy de demande pending est absente.';
  end if;
  select count(*) into outline_count from public.get_public_course_outline('les-fondamentaux-de-la-vente');
  if outline_count <> 10 then raise exception 'Le programme public doit exposer 10 métadonnées de leçons, obtenu %.', outline_count; end if;
  select count(*) into exposed_content_columns
  from information_schema.parameters
  where specific_schema='public' and specific_name like 'get_public_course_outline_%'
    and parameter_name in ('content','exercise','video_url','resource_url');
  if exposed_content_columns <> 0 then raise exception 'La fonction de programme expose du contenu privé.'; end if;
end $$;

select 'finalization_security_ok' as test_result;
