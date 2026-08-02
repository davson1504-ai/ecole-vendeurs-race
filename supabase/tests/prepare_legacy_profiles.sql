\set ON_ERROR_STOP on

-- Simule une base partiellement migrée où role est devenu text et où toutes
-- les valeurs historiques coexistent.
alter table public.profiles alter column role drop default;
alter table public.profiles alter column role type text using role::text;
alter table public.profiles alter column role set default 'learner';

insert into auth.users (id, email, raw_user_meta_data) values
  ('10000000-0000-0000-0000-000000000001', 'learner@example.test',  '{"full_name":"Learner Test"}'),
  ('10000000-0000-0000-0000-000000000002', 'student@example.test',  '{"full_name":"Student Test"}'),
  ('10000000-0000-0000-0000-000000000003', 'affiliate@example.test','{"full_name":"Affiliate Test"}'),
  ('10000000-0000-0000-0000-000000000004', 'apprenant@example.test','{"full_name":"Apprenant Test"}'),
  ('10000000-0000-0000-0000-000000000005', 'admin@example.test',    '{"full_name":"Admin Test"}'),
  ('10000000-0000-0000-0000-000000000006', 'super@example.test',    '{"full_name":"Super Test"}');

update public.profiles set role = 'learner'     where email = 'learner@example.test';
update public.profiles set role = 'student'     where email = 'student@example.test';
update public.profiles set role = 'affiliate'   where email = 'affiliate@example.test';
update public.profiles set role = 'apprenant'   where email = 'apprenant@example.test';
update public.profiles set role = 'admin'       where email = 'admin@example.test';
update public.profiles set role = 'super_admin' where email = 'super@example.test';

insert into public.affiliates (user_id, referral_code)
values ('10000000-0000-0000-0000-000000000003', 'LEGACY-AFFILIATE');
