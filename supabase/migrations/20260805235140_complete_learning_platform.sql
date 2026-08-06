begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.courses
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists level text not null default 'Débutant',
  add column if not exists duration_minutes integer not null default 0 check (duration_minutes >= 0),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

update public.courses
set description = coalesce(description, long_description, short_description, '')
where description is null;

alter table public.modules
  add column if not exists description text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.lessons
  add column if not exists slug text,
  add column if not exists objective text,
  add column if not exists content text,
  add column if not exists exercise text,
  add column if not exists video_url text,
  add column if not exists resource_url text,
  add column if not exists duration_minutes integer not null default 10 check (duration_minutes >= 0),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.lessons
set content = coalesce(content, content_text, ''),
    slug = coalesce(slug, id::text)
where content is null or slug is null;

create unique index if not exists lessons_module_slug_key
  on public.lessons(module_id, slug);

alter table public.enrollments
  alter column order_id drop not null,
  add column if not exists active boolean not null default true,
  add column if not exists enrolled_at timestamptz not null default now(),
  add column if not exists expires_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  last_position_seconds integer check (last_position_seconds is null or last_position_seconds >= 0),
  last_viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, lesson_id)
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'active'
      and role in ('admin', 'super_admin')
  );
$$;

revoke all on function private.is_active_admin() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_active_admin() to anon, authenticated;

create or replace function public.set_profile_status(target_profile_id uuid, target_active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role text;
  target_current_role text;
begin
  if not private.is_active_admin() then
    raise exception 'Administrateur actif requis.' using errcode = '42501';
  end if;

  select role into actor_role from public.profiles where id = auth.uid();
  select role into target_current_role from public.profiles where id = target_profile_id;
  if target_current_role = 'super_admin' and actor_role <> 'super_admin' then
    raise exception 'Un admin ne peut pas modifier un super_admin.' using errcode = '42501';
  end if;

  update public.profiles
  set status = case when target_active then 'active' else 'inactive' end
  where id = target_profile_id;

  if not found then
    raise exception 'Profil introuvable.' using errcode = 'P0002';
  end if;

  insert into public.admin_logs(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'profile_status_changed', 'profile', target_profile_id,
    jsonb_build_object('active', target_active));
end;
$$;

revoke all on function public.set_profile_status(uuid, boolean) from public, anon;
grant execute on function public.set_profile_status(uuid, boolean) to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $triggers$
declare table_name text;
begin
  foreach table_name in array array['courses','modules','lessons','enrollments','lesson_progress']
  loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_touch_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', table_name || '_touch_updated_at', table_name);
  end loop;
end
$triggers$;

alter table public.lesson_progress enable row level security;
alter table public.admin_logs enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;

grant select on public.courses, public.modules, public.lessons to anon, authenticated;
grant select on public.enrollments, public.lesson_progress to authenticated;
grant insert, update, delete on public.courses, public.modules, public.lessons to authenticated;
grant insert, update on public.enrollments to authenticated;
grant insert, update, delete on public.lesson_progress to authenticated;
grant select on public.profiles to authenticated;

drop policy if exists courses_public_read_published on public.courses;
drop policy if exists courses_admin_all on public.courses;
create policy courses_public_read_published on public.courses for select to anon, authenticated
  using (status = 'published' or private.is_active_admin());
create policy courses_admin_all on public.courses for all to authenticated
  using (private.is_active_admin()) with check (private.is_active_admin());

drop policy if exists modules_public_read on public.modules;
drop policy if exists modules_admin_all on public.modules;
create policy modules_public_read on public.modules for select to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published') or private.is_active_admin());
create policy modules_admin_all on public.modules for all to authenticated
  using (private.is_active_admin()) with check (private.is_active_admin());

drop policy if exists lessons_preview_or_enrolled on public.lessons;
drop policy if exists lessons_admin_all on public.lessons;
create policy lessons_preview_or_enrolled on public.lessons for select to anon, authenticated
  using (
    private.is_active_admin()
    or (is_preview and exists (
      select 1 from public.modules m join public.courses c on c.id = m.course_id
      where m.id = module_id and c.status = 'published'
    ))
    or exists (
      select 1 from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = module_id and e.user_id = auth.uid() and e.active
        and (e.expires_at is null or e.expires_at > now())
    )
  );
create policy lessons_admin_all on public.lessons for all to authenticated
  using (private.is_active_admin()) with check (private.is_active_admin());

drop policy if exists enrollments_select_own_or_admin on public.enrollments;
drop policy if exists enrollments_admin_insert on public.enrollments;
drop policy if exists enrollments_admin_update on public.enrollments;
create policy enrollments_select_own_or_admin on public.enrollments for select to authenticated
  using (user_id = auth.uid() or private.is_active_admin());
create policy enrollments_admin_insert on public.enrollments for insert to authenticated
  with check (private.is_active_admin());
create policy enrollments_admin_update on public.enrollments for update to authenticated
  using (private.is_active_admin()) with check (private.is_active_admin());

drop policy if exists lesson_progress_select_own_or_admin on public.lesson_progress;
drop policy if exists lesson_progress_insert_own on public.lesson_progress;
drop policy if exists lesson_progress_update_own on public.lesson_progress;
drop policy if exists lesson_progress_delete_own on public.lesson_progress;
create policy lesson_progress_select_own_or_admin on public.lesson_progress for select to authenticated
  using (profile_id = auth.uid() or private.is_active_admin());
create policy lesson_progress_insert_own on public.lesson_progress for insert to authenticated
  with check (profile_id = auth.uid() and exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.enrollments e on e.course_id = m.course_id
    where l.id = lesson_id and e.user_id = auth.uid() and e.active
      and (e.expires_at is null or e.expires_at > now())
  ));
create policy lesson_progress_update_own on public.lesson_progress for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.enrollments e on e.course_id = m.course_id
    where l.id = lesson_id and e.user_id = auth.uid() and e.active
      and (e.expires_at is null or e.expires_at > now())
  ));
create policy lesson_progress_delete_own on public.lesson_progress for delete to authenticated
  using (profile_id = auth.uid());

drop policy if exists profiles_admin_read on public.profiles;
create policy profiles_admin_read on public.profiles for select to authenticated
  using (private.is_active_admin());

drop policy if exists admin_logs_admin_read on public.admin_logs;
create policy admin_logs_admin_read on public.admin_logs for select to authenticated
  using (private.is_active_admin());

commit;
