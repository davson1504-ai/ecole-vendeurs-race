-- Verrouillage provisoire des tables métier selon un modèle de refus par défaut.
-- Les règles de lecture du catalogue, du lecteur sécurisé, du paiement et de la
-- progression seront ajoutées ultérieurement, avec leurs besoins fonctionnels.

begin;

-- Toutes les tables exposées par le schéma public restent protégées par RLS.
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.enrollments enable row level security;
alter table public.affiliates enable row level security;
alter table public.commissions enable row level security;

-- Les privilèges de table ne sont pas soumis aux prédicats RLS : ils ouvrent la
-- porte avant que RLS filtre les lignes. Les clients n'ont donc aucun droit
-- d'écriture direct tant que les opérations serveur contrôlées ne sont pas prêtes.
revoke insert, update, delete, truncate, references, trigger
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
from anon, authenticated;

-- Modules et leçons restent entièrement fermés aux clients pendant cette phase.
-- Aucune policy permissive ne sera créée avant le lecteur pédagogique sécurisé.
revoke select on table public.modules, public.lessons from anon, authenticated;

-- L'inventaire local et staging ne contient actuellement aucune policy sur ces
-- deux tables. Cette boucle retire aussi toute policy issue d'une dérive manuelle,
-- afin de garantir l'état final documenté : RLS actif, zéro policy client.
do $policy_cleanup$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('modules', 'lessons')
  loop
    execute format(
      'drop policy %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end
$policy_cleanup$;

-- Cette fonction est appelée par le trigger auth.users sous le propriétaire de
-- la fonction. Les rôles clients n'ont pas besoin de pouvoir l'exécuter.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Les privilèges validés de profiles et de set_profile_role sont volontairement
-- laissés inchangés. Les privilèges serveur de service_role sont conservés.

commit;
