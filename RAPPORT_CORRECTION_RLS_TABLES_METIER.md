# Correction RLS des tables métier

## 1. Résumé exécutif

Une migration locale `0004` corrige le modèle de sécurité des tables métier selon un refus par défaut. Elle active RLS sur les dix tables, retire les écritures directes de `anon` et `authenticated` sur les neuf tables métier hors `profiles`, ferme entièrement `modules` et `lessons` aux clients et retire l'exécution client de `handle_new_user()`.

La chaîne `0001 → 0002 → 0003 → 0004` et les contrôles globaux réussissent sur PostgreSQL 16 jetable. Le dry-run staging n'a pas pu produire de plan, car le sous-processus non interactif n'avait pas accès à l'authentification Supabase. Aucune migration n'a été appliquée à distance.

## 2. État Git

- Branche de départ : `fix/p0-migrations-roles`
- SHA de départ : `c1b7c894b4de36a5bb41f1695a02000ddce4b8b4`
- Branche de travail : `fix/p0-rls-content-security`
- Commit local de correction : `aa1fc537d39a6d099bac411398f98487ac23c470`
- Aucun changement suivi ne précédait cette correction
- Les rapports et la configuration Supabase locale ont été conservés non suivis

## 3. Défaut initial

- RLS désactivé sur `public.modules` et `public.lessons`;
- grants complets de table accordés à `anon` et `authenticated` sur les tables métier;
- absence de policies métier, sauf les deux policies propres à `profiles`;
- `EXECUTE` accordé à `anon` et `authenticated` sur `public.handle_new_user()`.

Sur `modules` et `lessons`, l'association grants larges + RLS désactivé permettait un accès client direct non filtré.

## 4. Tables et privilèges audités

| Objet | État initial | Usage applicatif actuel | Décision |
|---|---|---|---|
| `profiles` | RLS + 2 policies; grants validés | auth et autorisation | inchangé |
| `courses` | RLS, aucune policy, grants larges | `/api/health/supabase` seulement | retirer les écritures; refus RLS conservé |
| `modules`, `lessons` | RLS absent, aucune policy, grants larges | lecteur actuel sur données démo | RLS actif; aucun accès client |
| `products`, `orders`, `payments` | RLS, aucune policy, grants larges | paiement réel non implémenté | retirer les écritures directes |
| `enrollments` | RLS, aucune policy, grants larges | progression réelle non implémentée | retirer les écritures directes |
| `affiliates`, `commissions` | RLS, aucune policy, grants larges | écrans sur données démo | retirer les écritures directes |
| `handle_new_user()` | trigger sécurisé mais exécutable par clients | trigger Auth uniquement | révoquer les clients |
| `set_profile_role(uuid,text)` | super-admin actif contrôlé | gestion serveur des rôles | inchangé |

Les privilèges `service_role` sont conservés.

## 5. Modèle d’accès provisoire

- `anon` : aucune écriture directe sur les tables métier et aucun accès direct à `modules`/`lessons`;
- `authenticated` : mêmes interdictions, sauf `SELECT` sur `profiles` soumis à RLS et `UPDATE(full_name, phone)`;
- aucune policy permissive ajoutée;
- les opérations d'administration futures devront passer par des actions serveur ou fonctions contrôlées;
- les règles du catalogue, du lecteur, du paiement et de la progression sont reportées à leurs phases fonctionnelles.

## 6. Migration 0004

Fichier : `supabase/migrations/0004_secure_business_tables_rls.sql`.

La migration est transactionnelle, ne supprime aucune table ni donnée et ne modifie pas `0001`, `0002` ou `0003`. Elle active RLS, révoque les privilèges clients excessifs, retire les éventuelles policies sur `modules`/`lessons` et durcit le droit d'exécution du trigger.

## 7. RLS activé

Après `0004`, RLS est vérifié actif sur :

- `profiles`, `courses`, `modules`, `lessons`, `products`;
- `orders`, `payments`, `enrollments`, `affiliates`, `commissions`.

Le test global échoue automatiquement si l'une de ces dix tables perd RLS.

## 8. Privilèges révoqués

Pour `anon` et `authenticated`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` et `TRIGGER` sont révoqués sur les neuf tables métier hors `profiles`. `SELECT` est également révoqué sur `modules` et `lessons`.

Les droits `profiles` restent : `authenticated SELECT` et `authenticated UPDATE(full_name, phone)`. Aucun `UPDATE` n'existe sur `id`, `email`, `role`, `status` ou `created_at`; `anon` n'a aucun privilège sur `profiles`.

## 9. Policies créées ou supprimées

Aucune policy permissive n'est créée. L'inventaire local et staging ne montrait aucune policy sur `modules` ou `lessons`; une boucle transactionnelle retire néanmoins toute policy issue d'une dérive, garantissant l'état final RLS actif sans policy.

Les policies `profiles_select_own` et `profiles_update_own` sont conservées.

## 10. Durcissement de handle_new_user

`EXECUTE` est révoqué de `PUBLIC`, `anon` et `authenticated`. La logique, le propriétaire, `SECURITY DEFINER` et le `search_path` vide ne sont pas modifiés.

Le test prouve que le trigger `auth.users` continue à créer un profil `apprenant` et ignore toute tentative de rôle dans les métadonnées publiques.

## 11. Vérification de set_profile_role

- aucun `EXECUTE` pour `anon`;
- `EXECUTE` conservé pour `authenticated`;
- appel apprenant refusé;
- promotion par un admin refusée;
- changement par un `super_admin` actif autorisé.

La fonction n'est pas modifiée par `0004`.

## 12. Tests sur base vide

La chaîne complète `0001 → 0002 → 0003 → 0004` réussit. Les dix tables existent. Le fixture reproduit avant `0004` les grants larges observés sur staging afin d'éviter un test trivial.

Résultat : `business_tables_security_ok` puis `fresh_chain_trigger_and_rls_ok`.

## 13. Tests des privilèges anon

Réussis : absence de lecture sur `modules` et `lessons`, absence des six privilèges dangereux sur les neuf tables métier, aucun privilège sur `profiles`, aucun `EXECUTE` sur les deux fonctions sensibles sauf les droits serveur non concernés.

## 14. Tests des privilèges authenticated

Réussis : absence de lecture sur `modules` et `lessons`, absence d'écriture directe sur les neuf tables métier et préservation exclusive de `SELECT profiles` et `UPDATE(full_name, phone)` sous RLS.

## 15. Test global RLS

Le nouveau test `assert_business_tables_security.sql` contrôle automatiquement les dix tables et échoue si RLS manque ou si un grant dangereux réapparaît. Il couvre aussi les ACL de fonctions et les privilèges de colonnes de `profiles`.

Le scénario legacy applique également `0004` et réussit avec `legacy_convergence_ok`.

## 16. Impact applicatif

- `/api/health/supabase` interroge actuellement `courses` avec une clé publique. Comme `courses` n'a aucune policy, cet endpoint peut retourner une erreur et devra être corrigé séparément pour ne pas dépendre d'une table métier protégée;
- les pages catalogue, lecteur, administration, paiement et affiliation utilisent actuellement des données de démonstration;
- leurs futurs accès Supabase resteront bloqués jusqu'à l'ajout de policies métier dédiées;
- aucun contournement avec `service_role` n'a été ajouté.

## 17. TypeScript, ESLint et build

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit --pretty false` | réussi, code 0 |
| `npm run lint` | réussi, code 0 |
| `npm run build` | réussi, code 0 |
| `git diff --check` | réussi, code 0 |
| scan secret/SQL destructif | aucun motif inattendu |
| fichiers `.env` suivis | seulement `.env.example` |

## 18. Dry-run staging

Ref vérifié avant commande : `navpnanyltussvtlxouk`, différent de `swzynvmfrbkqebswfjbf`.

Commande tentée :

```powershell
npx supabase db push --dry-run --linked
```

Résultat : code 1, `LegacyPlatformAuthRequiredError`. Aucun plan n'a été produit; la migration proposée n'est donc pas vérifiable dans ce sous-processus. Aucun push réel n'a été exécuté.

Commande manuelle à lancer dans le PowerShell authentifié :

```powershell
npx supabase db push --dry-run --linked
```

La sortie attendue doit proposer uniquement `0004_secure_business_tables_rls.sql`.

## 19. Risques restants

- dry-run distant encore à confirmer;
- accès client au catalogue et aux fonctions métier volontairement fermé;
- `/api/health/supabase` dépend encore de `courses`;
- les futures policies devront être minimales et testées contre les parcours réels;
- le test local utilise PostgreSQL 16 alors que staging utilise PostgreSQL 17.

## 20. Procédure d’application staging

Dans une phase séparée : vérifier le ref lié, obtenir un dry-run proposant uniquement `0004`, faire relire le plan, puis demander une autorisation explicite avant tout `npx supabase db push --linked`. Ne jamais inclure de seed.

## 21. Procédure de rollback

Avant application, aucun rollback n'est nécessaire. Après une future application, privilégier une nouvelle migration corrective rétablissant explicitement les grants/policies validés. Ne pas utiliser `db reset --linked` ou `migration repair`. Le staging vide peut être recréé uniquement après autorisation explicite.

## 22. Verdict

**CORRECTION RLS LOCALE VALIDÉE, DRY-RUN NON EXÉCUTÉ**

## 23. Prochaine action exacte

Exécuter `npx supabase db push --dry-run --linked` depuis le PowerShell Supabase authentifié, après vérification du ref `navpnanyltussvtlxouk`, puis confirmer que seule `0004_secure_business_tables_rls.sql` est proposée. Ne pas appliquer la migration sans nouvelle instruction.
