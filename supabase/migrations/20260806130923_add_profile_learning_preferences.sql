alter table public.profiles
  add column if not exists preferred_learning_pace text not null default 'regular',
  add column if not exists weekly_lesson_goal smallint not null default 3;

alter table public.profiles drop constraint if exists profiles_preferred_learning_pace_check;
alter table public.profiles add constraint profiles_preferred_learning_pace_check
  check (preferred_learning_pace in ('flexible', 'regular', 'intensive'));

alter table public.profiles drop constraint if exists profiles_weekly_lesson_goal_check;
alter table public.profiles add constraint profiles_weekly_lesson_goal_check
  check (weekly_lesson_goal between 1 and 20);

grant update (preferred_learning_pace, weekly_lesson_goal)
  on public.profiles to authenticated;
