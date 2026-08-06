# Application et audit des migrations Supabase staging

## Résumé exécutif

Les migrations `0001`, `0002` et `0003` sont présentes dans l'historique distant du staging `navpnanyltussvtlxouk`. Les dix tables attendues existent et sont vides. `profiles`, son modèle de rôles, son trigger, ses policies, ses grants et `set_profile_role` sont conformes aux attentes.

L'audit révèle cependant une permission dangereuse : RLS est désactivé sur `public.modules` et `public.lessons`, alors que `anon` et `authenticated` y disposent des privilèges de table `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` et `TRIGGER`. Ces deux tables sont donc exposées sans filtrage de lignes. Aucune correction n'a été appliquée pendant cet audit en lecture seule.

## État Git

- Branche : `fix/p0-migrations-roles`
- SHA : `c1b7c894b4de36a5bb41f1695a02000ddce4b8b4`
- Diff suivi : aucun
- Rapports, configuration Supabase et script d'audit : non suivis
- Aucun commit, push Git ou déploiement effectué

Les empreintes des migrations sont inchangées :

| Migration | SHA-256 |
|---|---|
| `0001_initial_schema.sql` | `F257FEBA93775368DD7E6F71A11858C8D85061CA7608F3E228A2384010997E2F` |
| `0002_secure_auth_admin_roles.sql` | `AAC2611F9012F46B55CFF4871DD190F313912F2708176E919E8F77B293495B5F` |
| `0003_unify_profiles_roles.sql` | `A06D8F5EDE8BA45DBA921E3E1626AE36F67F1E4198BBA596C084ABD8AC7D9CF4` |

## Projet ciblé

- Nom : `ecole-vendeurs-staging`
- Project ref : `navpnanyltussvtlxouk`
- Région : `eu-west-1`
- État : `ACTIVE_HEALTHY`
- PostgreSQL : `17.6.1.155`

Le ref local a été vérifié avant chaque appel distant. Il était exactement `navpnanyltussvtlxouk` et différent du ref principal interdit `swzynvmfrbkqebswfjbf`. Le projet principal n'a pas été interrogé ou modifié.

## Résultat réel du db push

La nouvelle consigne confirme que le `db push` réel a réussi, sans seed, et a appliqué dans l'ordre :

1. `0001_initial_schema.sql`
2. `0002_secure_auth_admin_roles.sql`
3. `0003_unify_profiles_roles.sql`

La sortie originale du push n'était pas disponible dans le sous-processus d'audit. Son résultat structurel et son historique ont toutefois été confirmés indépendamment en lecture seule par le connecteur Supabase authentifié.

## Historique local/distant

| Version | Locale | Distante | État |
|---|---:|---:|---|
| `0001 initial_schema` | oui | oui | alignée |
| `0002 secure_auth_admin_roles` | oui | oui | alignée |
| `0003 unify_profiles_roles` | oui | oui | alignée |

Aucune migration supplémentaire et aucun écart d'historique n'ont été détectés. La CLI locale non interactive n'était pas authentifiée; aucun contournement n'a été tenté.

## Tables créées

Les dix tables `public` attendues sont présentes.

| Table | Lignes | RLS | Clé primaire | Principales clés étrangères |
|---|---:|---:|---|---|
| `profiles` | 0 | oui | `id` | `id → auth.users.id` |
| `courses` | 0 | oui | `id` | aucune |
| `modules` | 0 | **non** | `id` | `course_id → courses.id` |
| `lessons` | 0 | **non** | `id` | `module_id → modules.id` |
| `products` | 0 | oui | `id` | `course_id → courses.id` |
| `orders` | 0 | oui | `id` | `user_id → profiles.id`, `product_id → products.id` |
| `payments` | 0 | oui | `id` | `order_id → orders.id` |
| `enrollments` | 0 | oui | `id` | `user_id → profiles.id`, `course_id → courses.id`, `order_id → orders.id` |
| `affiliates` | 0 | oui | `id` | `user_id → profiles.id` |
| `commissions` | 0 | oui | `id` | `affiliate_id → affiliates.id`, `order_id → orders.id`, `payment_id → payments.id` |

## Structure de profiles

| Colonne | Type | Nullable | Défaut |
|---|---|---:|---|
| `id` | `uuid` | non | aucun |
| `email` | `text` | oui | aucun |
| `full_name` | `text` | non | chaîne vide |
| `phone` | `text` | oui | aucun |
| `role` | `text` | non | `apprenant` |
| `status` | `text` | non | `active` |
| `created_at` | `timestamptz` | non | `now()` |

Les colonnes interdites `first_name`, `last_name`, `avatar_url` et `last_activity_at` sont absentes. La clé primaire est `profiles_pkey(id)`, `email` est unique et `id` référence `auth.users(id)` avec suppression en cascade. Les index présents sont `profiles_pkey` et `profiles_email_key`.

## Rôle par défaut

`profiles.role` est de type `text`, non nullable, avec le défaut exact `'apprenant'::text`.

## Contrainte des rôles

La contrainte `profiles_role_check` autorise uniquement :

- `apprenant`
- `admin`
- `super_admin`

L'agrégation des rôles retourne un ensemble vide, cohérent avec zéro profil.

## Trigger d’inscription

Le trigger `on_auth_user_created` existe sur `auth.users`, après insertion, et appelle `public.handle_new_user()`.

La fonction est `SECURITY DEFINER` avec `search_path` vide. Elle :

- impose toujours `role = 'apprenant'`;
- ne lit dans `raw_user_meta_data` que `full_name`, `phone` et `phone_number`;
- n'utilise aucune métadonnée client pour choisir le rôle;
- utilise `ON CONFLICT (id) DO NOTHING`.

Elle possède toutefois un droit `EXECUTE` explicite pour `anon`, en plus de `authenticated` et `service_role`. Une fonction trigger n'est pas appelée directement comme une fonction SQL ordinaire, mais ce grant est plus large que nécessaire et devra être revu dans la correction de sécurité.

## Policies RLS

`profiles` a RLS activé et exactement deux policies pour `authenticated` :

- `profiles_select_own` : lecture si `auth.uid() = id`;
- `profiles_update_own` : `USING` et `WITH CHECK` exigent `auth.uid() = id`.

Aucune policy n'accorde d'accès anonyme à `profiles`.

État des autres tables :

- RLS désactivé et aucune policy : `modules`, `lessons`;
- RLS activé mais aucune policy : `courses`, `products`, `orders`, `payments`, `enrollments`, `affiliates`, `commissions`.

Pour ces sept dernières tables, l'absence de policy bloque les accès via RLS malgré les grants généraux. Cela peut être volontaire temporairement, mais rend les fonctionnalités correspondantes inutilisables côté client jusqu'à définition de policies explicites.

## Grants

Pour `profiles` :

- `anon` : aucun privilège de table ou de colonne relevé;
- `authenticated` : `SELECT` sur la table et toutes les colonnes; `UPDATE` uniquement sur `full_name` et `phone`;
- `authenticated` n'a aucun `UPDATE` sur `id`, `email`, `role`, `status` ou `created_at`;
- `service_role` : privilèges complets attendus.

Écart critique hors `profiles` : `modules` et `lessons` accordent tous les privilèges de table à `anon` et `authenticated` sans protection RLS. Les autres tables métier accordent aussi ces privilèges généraux, mais leur RLS activé bloque les lignes faute de policy.

## Fonction set_profile_role

`public.set_profile_role(target_profile_id uuid, target_role text)` existe. Elle est `SECURITY DEFINER`, avec `search_path` vide.

- `EXECUTE` : `authenticated` et `service_role`; pas `anon`;
- exige un appelant authentifié;
- exige que l'appelant possède un profil `super_admin` avec `status = 'active'`;
- accepte uniquement `apprenant`, `admin`, `super_admin`;
- lève une erreur `P0002` si le profil cible n'existe pas;
- journalise dans `admin_logs` seulement si cette table existe, en supportant les variantes `actor_id` ou `admin_id`.

La fonction n'a pas été appelée pendant l'audit.

## Données présentes

| Relation | Nombre de lignes |
|---|---:|
| `auth.users` | 0 |
| `profiles` | 0 |
| `courses` | 0 |
| `modules` | 0 |
| `lessons` | 0 |
| `products` | 0 |
| `orders` | 0 |
| `payments` | 0 |
| `enrollments` | 0 |
| `affiliates` | 0 |
| `commissions` | 0 |

Aucune donnée personnelle n'a été retournée. Aucune seed, donnée métier ou compte n'a été créé.

## Résultats des contrôles locaux

| Contrôle | Résultat |
|---|---|
| `npm run test:migrations` | réussi, code 0 |
| `npx tsc --noEmit --pretty false` | réussi, code 0 |
| `npm run lint` | réussi, code 0 |
| `npm run build` | réussi, code 0 |
| `git diff --check` | réussi, code 0 |
| migrations locales inchangées | oui, empreintes identiques |
| scan de secrets des rapports/configuration/script d'audit | aucun motif détecté |
| changement Git suivi | aucun |

Le script de repli `supabase/audits/audit_post_migration_staging_readonly.sql` reste non suivi et ne contient que des requêtes `SELECT`.

## Écarts détectés

1. **Critique :** RLS désactivé sur `public.modules` et `public.lessons` alors que `anon` et `authenticated` disposent de tous les privilèges de table.
2. **Fonctionnel/sécurité :** sept autres tables métier ont RLS activé mais aucune policy; elles sont actuellement inaccessibles côté client malgré leurs grants généraux.
3. **À durcir :** `public.handle_new_user()` est exécutable par `anon`; ce grant explicite paraît inutile pour son usage comme trigger.
4. **Traçabilité :** le résultat du push est confirmé par l'utilisateur et par l'état distant obtenu, mais sa sortie CLI originale n'a pas été capturée dans ce sous-processus.

## Risques restants

- lecture et modification anonymes possibles sur `modules` et `lessons` tant que RLS ou les grants ne sont pas corrigés;
- aucune policy métier définie pour les cours, produits, commandes, paiements, inscriptions, affiliations et commissions;
- les tests locaux valident surtout `profiles`, son trigger et ses rôles; ils ne détectent pas l'absence de RLS sur `modules` et `lessons`;
- aucune correction distante ne doit être improvisée : les besoins de lecture publique, lecture apprenant et administration doivent être définis avant d'écrire la migration corrective.

## Verdict

**STRUCTURE STAGING NON CONFORME**

L'historique, les tables, `profiles`, les rôles et les données sont conformes, mais la permission dangereuse sur `modules` et `lessons` empêche toute validation de sécurité du staging.

## Prochaine action exacte

Créer localement une nouvelle migration corrective, sans modifier `0001` à `0003`, qui active RLS sur `modules` et `lessons`, révoque ou réduit leurs grants et ajoute uniquement les policies correspondant au modèle d'accès validé. Étendre le même audit de policies aux sept autres tables métier et retirer le grant `EXECUTE` anonyme de `handle_new_user` si aucun usage justifié n'est identifié. Tester cette migration sur PostgreSQL jetable, puis effectuer un nouveau dry-run staging dans une phase séparée avant toute application.
