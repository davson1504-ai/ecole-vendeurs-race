do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name='first_login_welcome_seen_at'
      and data_type='timestamp with time zone'
  ) then raise exception 'La date du message de première connexion est absente.'; end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name='preferred_learning_pace'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name='weekly_lesson_goal'
  ) then raise exception 'Les préférences d’apprentissage sont absentes.'; end if;

  if not exists (
    select 1 from pg_tables
    where schemaname='public' and tablename='contact_messages' and rowsecurity
  ) then raise exception 'RLS doit être active sur contact_messages.'; end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='contact_messages'
      and policyname='contact_messages_public_insert' and cmd='INSERT'
  ) then raise exception 'La policy d’insertion publique des contacts est absente.'; end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='contact_messages'
      and policyname='contact_messages_admin_select' and cmd='SELECT'
  ) then raise exception 'La lecture administrateur des contacts est absente.'; end if;

  if has_table_privilege('anon','public.contact_messages','SELECT')
     or has_table_privilege('anon','public.contact_messages','UPDATE')
     or has_table_privilege('anon','public.contact_messages','DELETE') then
    raise exception 'Le rôle anon possède des privilèges de lecture ou modification interdits.';
  end if;
end $$;

select 'contact_welcome_security_ok' as test_result;
