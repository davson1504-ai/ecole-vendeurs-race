begin;

alter table public.profiles
  add column if not exists city_country text,
  add column if not exists avatar_url text,
  add column if not exists affiliate_code text,
  add column if not exists terms_accepted_at timestamptz;

grant update (full_name, phone, city_country, avatar_url, affiliate_code, terms_accepted_at)
  on public.profiles to authenticated;

alter table public.orders
  alter column product_id drop not null,
  add column if not exists course_id uuid references public.courses(id) on delete restrict,
  add column if not exists payment_method text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('mobile_money', 'card', 'manual_validation'));

grant select, insert, update on public.orders to authenticated;

drop policy if exists orders_select_own_or_admin on public.orders;
drop policy if exists orders_insert_own_pending on public.orders;
drop policy if exists orders_update_own_pending on public.orders;
drop policy if exists orders_admin_all on public.orders;

create policy orders_select_own_or_admin on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or private.is_active_admin());

create policy orders_insert_own_pending on public.orders for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending' and course_id is not null and payment_method is not null and amount_xof >= 0);

create policy orders_update_own_pending on public.orders for update to authenticated
  using (user_id = (select auth.uid()) and status = 'pending')
  with check (user_id = (select auth.uid()) and status = 'pending' and course_id is not null and payment_method is not null);

create policy orders_admin_all on public.orders for all to authenticated
  using (private.is_active_admin()) with check (private.is_active_admin());

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders
  for each row execute function public.touch_updated_at();

create or replace function public.get_public_course_outline(course_slug text)
returns table (
  course_id uuid, module_id uuid, module_title text, module_description text,
  module_position integer, lesson_id uuid, lesson_slug text, lesson_title text,
  lesson_objective text, lesson_duration_minutes integer, lesson_position integer,
  is_preview boolean, locked boolean
)
language sql stable security definer set search_path = ''
as $$
  select c.id, m.id, m.title, m.description, m.position, l.id, l.slug, l.title,
    l.objective, l.duration_minutes, l.position, l.is_preview,
    not (l.is_preview or private.is_active_admin() or exists (
      select 1 from public.enrollments e
      where e.course_id = c.id and e.user_id = (select auth.uid()) and e.active
        and (e.expires_at is null or e.expires_at > now())
    )) as locked
  from public.courses c
  join public.modules m on m.course_id = c.id
  join public.lessons l on l.module_id = m.id
  where c.slug = course_slug and c.status = 'published'
  order by m.position, l.position;
$$;

revoke all on function public.get_public_course_outline(text) from public;
grant execute on function public.get_public_course_outline(text) to anon, authenticated;

commit;
