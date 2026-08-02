\set ON_ERROR_STOP on

-- Reproduit les grants automatiques observés sur le staging avant 0004.
-- Ce fixture est strictement réservé à la base PostgreSQL jetable des tests.
grant select, insert, update, delete, truncate, references, trigger
on table
  public.courses,
  public.modules,
  public.lessons,
  public.products,
  public.orders,
  public.payments,
  public.enrollments,
  public.affiliates,
  public.commissions
to anon, authenticated, service_role;

grant execute on function public.handle_new_user() to anon, authenticated, service_role;
