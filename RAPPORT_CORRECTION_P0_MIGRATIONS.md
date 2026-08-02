# Correction P0 — Migrations et rôles

## 1. Résumé

Le blocage P0 local a été corrigé sur la branche `fix/p0-migrations-roles`. La chaîne `0001 → 0002 → 0003` s’applique sur une base PostgreSQL 16 vide jetable. La convergence transforme `learner`, `student` et `affiliate` en `apprenant`, conserve `admin` et `super_admin`, sécurise le trigger d’inscription, les privilèges et les RLS de `profiles`.

Niveau de preuve : **confirmé par inspection, commande et tests SQL**. La base Supabase distante reste **non vérifiable** et n’a pas été touchée.

## 2. État Git de départ

| Élément | Valeur | Preuve |
|---|---|---|
| Branche | `main` | confirmé par commande |
| SHA local | `4c97f214bd6d9c5e4bd8e7179c89edde0aa45e2d` | confirmé par commande |
| SHA `origin/main` | même SHA | confirmé par commande |
| Diff suivi | aucun | confirmé par `git diff` |
| Fichier non suivi | `RAPPORT_ETAT_ACTUEL_AVANT_DEPLOIEMENT.md` uniquement | confirmé par commande |
| Branche créée | `fix/p0-migrations-roles` | confirmé par commande |

Le rapport initial a été conservé sans modification.

## 3. Incohérences trouvées

| Incohérence | Preuve | Décision |
|---|---|---|
| enum `app_role` = `learner`, `affiliate`, `admin`, `super_admin` | `0001_initial_schema.sql:3` | conserver 0001 historique; convertir en 0003 |
| défaut `learner` | `0001:14` | converger vers `apprenant` |
| `0002` utilisait `apprenant` et `student` sur cet enum | ancienne version `0002:7-18` | retirer toute conversion de 0002 |
| `0002` accordait des colonnes absentes de 0001 | ancienne version `0002:25-32` | limiter à `full_name`, `phone` |
| V2 autonome utilise `student` et une colonne texte | `EDVR_SUPABASE_SCHEMA_V2.sql:107-120` | 0003 accepte enum ou texte |
| scripts historiques divergent des migrations | fichiers SQL racine et script shell | ne pas les traiter comme migrations applicables |
| contrôles admin dispersés | pages admin et handler | centraliser dans `isAdminRole` |

Niveau de preuve : **confirmé par inspection**.

## 4. Inventaire des rôles

| Fichier/catégorie | Valeurs | Fonction | Décision |
|---|---|---|---|
| `supabase/migrations/0001_initial_schema.sql:3,14` | learner, affiliate, admin, super_admin | historique applicable | conservé, puis convergé |
| `supabase/migrations/0002_secure_auth_admin_roles.sql` | aucune conversion | historique applicable corrigé | sécurisation compatible 0001 |
| `supabase/migrations/0003_unify_profiles_roles.sql` | apprenant, admin, super_admin | convergence applicable | source SQL officielle après application |
| `supabase/EDVR_SUPABASE_SCHEMA.sql:8,38` | learner, affiliate, admin, super_admin | schéma autonome historique | non modifié, non appliqué par la chaîne |
| `supabase/EDVR_SUPABASE_SCHEMA_V2.sql:107-120` | student, admin, super_admin | schéma autonome V2 | non modifié |
| `update-supabase-schema-workflow-final.sh:126-139` | student, admin, super_admin | script historique | non modifié |
| `src/lib/auth/authorization.ts` | apprenant, admin, super_admin | code applicatif actuel | aligné et centralisé |
| actions/callback | rôle lu depuis `profiles`, jamais fourni à l’inscription | auth actuelle | conservé |
| affiliation | tables et code métier distincts | fonctionnalité métier | aucun rôle global |

Les occurrences `student` dans `demo-data.ts` sont des noms de propriétés de lignes commerciales, pas des rôles. Niveau de preuve : **confirmé par inspection**.

## 5. Décision fonctionnelle

Le vocabulaire officiel est `apprenant | admin | super_admin`. Le rôle par défaut est `apprenant`. `learner`, `student` et `affiliate` convergent vers `apprenant`. L’affiliation reste dans les structures métier `affiliates`/commissions et ne donne aucun privilège global.

Un client ne reçoit aucun `GRANT UPDATE` sur `profiles.role`. La seule opération de changement de rôle est `set_profile_role(uuid,text)`, accessible aux authentifiés mais refusant toute exécution si l’appelant n’est pas un `super_admin` actif.

Niveau de preuve : **confirmé par test SQL**.

## 6. Audit de profiles

| Colonne | 0001 | Ancien 0002 | Utilisée par l’app | Nécessaire maintenant | Décision |
|---|---:|---:|---:|---:|---|
| `id` | oui | indirect | oui | oui | conservée, non modifiable |
| `email` | oui | non | oui | oui | conservée, non modifiable via profil |
| `full_name` | oui | oui | oui | oui | modifiable par le propriétaire |
| `phone` | oui | oui | inscription | oui | modifiable par le propriétaire |
| `role` | oui | oui | oui | oui | texte contraint, modification directe interdite |
| `status` | oui | non | oui | oui | conservée, non modifiable par apprenant |
| `created_at` | oui | non | non | oui | conservée |
| `first_name` | non | oui | non | non | non ajoutée |
| `last_name` | non | oui | non | non | non ajoutée |
| `avatar_url` | non | oui | non | non | non ajoutée |
| `last_activity_at` | non | oui | non | non | non ajoutée |

Colonnes ajoutées : **aucune**. Niveau de preuve : **confirmé par inspection et test SQL**.

## 7. Stratégie de migration retenue

Stratégie hybride minimale :

1. conserver `0001` inchangée pour ne pas réécrire son modèle historique;
2. corriger `0002`, car sa version précédente ne pouvait pas s’appliquer après `0001` et empêchait mécaniquement toute base vide d’atteindre `0003`;
3. ajouter `0003` comme migration de convergence robuste pour les bases neuves et partiellement migrées.

La stratégie B pure était impossible pour une base vide : `0002` échouait avant `0003`. Le risque de checksum/historique distant est traité par une vérification staging obligatoire avant application.

Niveau de preuve : **confirmé par inspection et test SQL**.

## 8. Migrations modifiées ou ajoutées

| Fichier | Changement |
|---|---|
| `0001_initial_schema.sql` | inchangé |
| `0002_secure_auth_admin_roles.sql` | retrait des opérations incompatibles; RLS et GRANT seulement sur `full_name`, `phone` |
| `0003_unify_profiles_roles.sql` | validation d’état, conversion enum/texte, contrainte, défaut, trigger, RLS, privilèges, RPC super-admin |

`0003` refuse avec un message explicite une table/colonne absente, un type autre qu’enum/texte ou une valeur de rôle inconnue. Elle ne supprime aucune table ni ligne et conserve l’ancien type enum inutilisé afin d’éviter une suppression potentiellement destructive.

Niveau de preuve : **confirmé par inspection et test SQL**.

## 9. Conversion des anciens rôles

| Avant | Après | Test |
|---|---|---|
| learner | apprenant | réussi |
| student | apprenant | réussi |
| affiliate | apprenant | réussi; ligne `affiliates` préservée |
| apprenant | apprenant | réussi |
| admin | admin | réussi |
| super_admin | super_admin | réussi |

Six profils de test ont été migrés, sans suppression et avec conservation du nom et de la donnée d’affiliation. Niveau de preuve : **confirmé par test SQL**.

## 10. Trigger de création de profil

`handle_new_user` définit explicitement `role = 'apprenant'`. Il accepte seulement `full_name` et `phone`/`phone_number`, fonctionne avec une métadonnée vide (cas OAuth) et utilise `ON CONFLICT DO NOTHING`. Les clés `role`, `admin` ou `super_admin` présentes dans `raw_user_meta_data` sont ignorées.

Deux inscriptions malveillantes de test demandant respectivement `admin` et `super_admin` ont produit des profils `apprenant`. Niveau de preuve : **confirmé par test SQL**.

## 11. Politiques RLS

| Acteur | Règle testée | Résultat |
|---|---|---|
| anon | lecture de `profiles` | refusée |
| apprenant | lecture propre | autorisée, une ligne |
| apprenant | lecture/modification autre profil | aucune ligne visible/modifiée |
| apprenant | update `full_name`, `phone` propres | autorisé |
| apprenant | update direct `role` | permission refusée |
| apprenant | promotion via RPC | permission refusée |
| admin | lecture de son propre profil pour le DAL | autorisée |
| admin | promotion vers super_admin via RPC | permission refusée |
| super_admin actif | changement contrôlé de rôle | autorisé |

Les policies sont `profiles_select_own` et `profiles_update_own`. Les privilèges `authenticated` sont `SELECT` et `UPDATE(full_name, phone)` seulement. Les anciennes policies trop larges sont supprimées. Si `admin_logs` existe avec `actor_id` ou `admin_id`, le RPC écrit un audit; son absence dans 0001 ne bloque pas la migration.

Niveau de preuve : **confirmé par test SQL**.

## 12. Fichiers TypeScript modifiés

- `src/lib/auth/authorization.ts` : tuple `APP_ROLES`, type dérivé `AppRole`, fonction `isAdminRole`;
- trois pages admin et `/api/admin/verification` : réutilisation de `isAdminRole`.

Les actions d’inscription et le callback étaient déjà conformes : aucune valeur de rôle n’est envoyée lors du signup, et les redirections lisent `profiles.role`. Niveau de preuve : **confirmé par inspection et TypeScript**.

## 13. Tests sur base vide

Commande : `npm run test:migrations`.

Environnement : conteneur `postgres:16-alpine`, supprimé automatiquement, avec stubs locaux `auth.users`, `auth.uid()`, `anon`, `authenticated`, `service_role`. Application séquentielle de `0001`, `0002`, `0003` : **réussie**. Table, type texte, défaut `apprenant`, contrainte et deux policies vérifiés.

Niveau de preuve : **confirmé par test SQL**. Ce test reproduit les primitives nécessaires, mais n’est pas un test du runtime Supabase complet.

## 14. Tests sur base existante

Une seconde base jetable simule une colonne `role` texte partiellement migrée et six profils. Résultat : 4 `apprenant`, 1 `admin`, 1 `super_admin`, 6 lignes conservées, donnée `affiliates` conservée.

Niveau de preuve : **confirmé par test SQL**.

## 15. Tests d’auto-promotion

Les tentatives suivantes échouent : update direct vers `admin`, RPC vers `super_admin` par apprenant, modification du profil d’un tiers et RPC d’un admin vers `super_admin`. La voie super-admin contrôlée réussit.

Niveau de preuve : **confirmé par test SQL**.

## 16. Résultats TypeScript, ESLint et build

| Contrôle | Résultat | Preuve |
|---|---|---|
| `npm ls --depth=0` | exit 0; paquets extraneous préexistants | commande |
| `npx tsc --noEmit --pretty false` | réussi, exit 0 | commande |
| `npm run lint` | réussi, exit 0 | commande |
| `npm run build` | réussi, 21 routes listées | commande |
| `npm run test:migrations` | réussi deux fois | test SQL |
| `git diff --check` | réussi, exit 0 | commande |

## 17. Recherche de secrets

Recherche par motifs de clés privées, AWS, Stripe et service role : deux correspondances dans des documentations suivies préexistantes. Inspection sans afficher les valeurs : une valeur contient explicitement un marqueur de placeholder, l’autre est une courte ellipse. Aucun secret réel détecté; `.env.local` reste ignoré et n’est pas indexé.

Niveau de preuve : **confirmé par commande et inspection**.

## 18. Limites et points non vérifiés

- Supabase CLI absent localement;
- test réalisé sur PostgreSQL 16 avec stubs, pas sur l’image Supabase complète;
- base distante, migrations déjà enregistrées, policies et données réelles non vérifiées;
- rôles/grants de production non inspectés;
- schémas autonomes legacy/V2 volontairement non réécrits;
- `admin_logs` absent de la chaîne 0001 actuelle, donc audit RPC non exercé dans le scénario frais;
- aucun test applicatif avec une vraie session Supabase distante.

## 19. Risques pour la base distante

Le principal risque est l’historique : si `0002` a déjà été enregistrée avec un contenu différent, modifier son fichier local peut créer un écart de checksum ou de compréhension. Si le SQL autonome V2 a été appliqué manuellement, la structure réelle peut contenir davantage de colonnes, policies et fonctions. Il ne faut appliquer aucun fichier en production avant inventaire de staging et sauvegarde.

`0003` convertit `profiles.role` en texte. Cette opération prend un verrou de table; sur une grande table, planifier une fenêtre. Les valeurs inconnues provoquent volontairement un rollback complet.

Niveau de preuve distant : **non vérifiable**.

## 20. Procédure d’application sur staging

1. Sauvegarder la base staging et exporter structure/policies/grants sans secrets.
2. Exécuter `supabase migration list` avec une CLI authentifiée sur staging.
3. Vérifier si `0001`/`0002` sont enregistrées et comparer leur contenu/historique.
4. Rechercher les valeurs réelles : `select role::text, count(*) from public.profiles group by 1`.
5. Vérifier type, défaut, contraintes, policies et privilèges de `profiles`.
6. Si `0002` est déjà enregistrée, ne pas la réappliquer; définir avec l’équipe la réconciliation d’historique puis appliquer uniquement la convergence adaptée.
7. Appliquer dans une transaction de maintenance sur staging.
8. Rejouer les tests d’inscription, RLS et promotion avec de vrais comptes staging.
9. Vérifier les logs, le nombre de profils avant/après et les données d’affiliation.
10. N’envisager la production qu’après recette et plan de rollback validés.

## 21. Procédure de rollback

Rollback recommandé : restauration de la sauvegarde staging/production prise immédiatement avant migration. Un rollback SQL automatique vers l’enum legacy n’est pas fourni, car il réintroduirait les rôles supprimés et pourrait perdre le vocabulaire officiel.

En cas d’échec pendant `0003`, la transaction annule automatiquement les changements. En cas de problème détecté après commit : bloquer les écritures de rôles, relever les comptes et données, restaurer le snapshot, puis analyser hors production. Ne jamais reconvertir à l’aveugle les `apprenant` vers `learner` ou `affiliate`, car cette distinction historique n’est plus récupérable depuis le rôle de sécurité seul.

## 22. Verdict

**P0 migrations corrigé localement et confirmé par tests SQL reproductibles.**

La chaîne locale est cohérente et testée sur base vide et état legacy simulé. Le P0 ne peut pas être déclaré résolu sur la base distante tant que son historique et son schéma réels n’ont pas été audités sur staging.

## 23. Prochaine action recommandée

Après validation du commit local, connecter une Supabase CLI à un environnement staging isolé, exécuter d’abord l’inventaire de la section 20, puis tester `0003` avec de vrais rôles Supabase et des copies anonymisées des états de profils — sans toucher à la production.
