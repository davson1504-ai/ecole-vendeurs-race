\set ON_ERROR_STOP on

do $$
declare
  total_profiles integer;
  learner_profiles integer;
  admin_profiles integer;
  super_profiles integer;
  affiliate_rows integer;
begin
  select count(*) into total_profiles from public.profiles;
  select count(*) into learner_profiles from public.profiles where role = 'apprenant';
  select count(*) into admin_profiles from public.profiles where role = 'admin';
  select count(*) into super_profiles from public.profiles where role = 'super_admin';
  select count(*) into affiliate_rows from public.affiliates where referral_code = 'LEGACY-AFFILIATE';

  if total_profiles <> 6 then
    raise exception 'Profils préservés: 6 attendus, % obtenus.', total_profiles;
  end if;
  if learner_profiles <> 4 or admin_profiles <> 1 or super_profiles <> 1 then
    raise exception 'Conversion incorrecte: apprenant %, admin %, super_admin %.',
      learner_profiles, admin_profiles, super_profiles;
  end if;
  if affiliate_rows <> 1 then
    raise exception 'La donnée métier affiliation n''a pas été préservée.';
  end if;
  if exists (
    select 1 from public.profiles
    where role not in ('apprenant', 'admin', 'super_admin')
  ) then
    raise exception 'Une ancienne valeur de rôle subsiste.';
  end if;
  if not exists (
    select 1 from public.profiles
    where email = 'affiliate@example.test' and full_name = 'Affiliate Test'
  ) then
    raise exception 'Les données personnelles du profil affilié ont changé.';
  end if;
end
$$;

select 'legacy_convergence_ok' as test_result;
