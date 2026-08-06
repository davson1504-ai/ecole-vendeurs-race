alter table public.profiles
  add column if not exists first_login_welcome_seen_at timestamptz;

grant update (first_login_welcome_seen_at) on public.profiles to authenticated;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  subject text not null check (char_length(subject) between 3 and 160),
  message text not null check (char_length(message) between 10 and 3000),
  status text not null default 'new' check (status in ('new', 'processed', 'archived')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.enforce_contact_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if (
    select count(*) >= 3
    from public.contact_messages
    where lower(email) = lower(new.email)
      and created_at >= now() - interval '15 minutes'
  ) then
    raise exception 'contact_rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_contact_rate_limit() from public, anon, authenticated;

drop trigger if exists contact_messages_rate_limit on public.contact_messages;
create trigger contact_messages_rate_limit
before insert on public.contact_messages
for each row execute function private.enforce_contact_rate_limit();

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;

drop policy if exists contact_messages_public_insert on public.contact_messages;
create policy contact_messages_public_insert
on public.contact_messages for insert
to anon, authenticated
with check (
  status = 'new'
  and processed_at is null
  and char_length(full_name) between 2 and 120
  and char_length(email) between 5 and 254
  and char_length(subject) between 3 and 160
  and char_length(message) between 10 and 3000
);

drop policy if exists contact_messages_admin_select on public.contact_messages;
create policy contact_messages_admin_select
on public.contact_messages for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'active'
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists contact_messages_admin_update on public.contact_messages;
create policy contact_messages_admin_update
on public.contact_messages for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'active'
      and p.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'active'
      and p.role in ('admin', 'super_admin')
  )
);
