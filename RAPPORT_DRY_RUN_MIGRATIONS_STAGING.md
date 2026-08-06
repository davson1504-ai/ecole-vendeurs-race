# Dry-run des migrations Supabase staging

## 1. Résumé exécutif

Les contrôles locaux sont tous réussis et la cible liée a été vérifiée comme étant exclusivement le staging `navpnanyltussvtlxouk`. La commande autorisée `npx supabase db push --dry-run --linked` a été lancée, mais le sous-processus non interactif n'avait pas accès à l'authentification Supabase. Elle s'est arrêtée avec le code 1 avant de produire un plan distant. Aucune migration, donnée ou modification distante n'a été appliquée.

## 2. État Git

- Branche : `fix/p0-migrations-roles`
- SHA : `c1b7c894b4de36a5bb41f1695a02000ddce4b8b4`
- Dernier commit : `c1b7c89 fix: unifier les rôles et rendre les migrations reproductibles`
- Diff suivi : aucun
- Fichiers non suivis avant ce rapport : `RAPPORT_ETAT_ACTUEL_AVANT_DEPLOIEMENT.md`, `RAPPORT_PREPARATION_STAGING_SUPABASE.md`, `RAPPORT_VALIDATION_SUPABASE_STAGING.md`, `supabase/.gitignore`, `supabase/config.toml`
- Aucun commit, push Git ou déploiement effectué.

## 3. Projet Supabase lié

Le fichier local `supabase/.temp/project-ref` contenait exactement `navpnanyltussvtlxouk` avant chaque commande distante, y compris immédiatement avant le dry-run. Ce ref correspond au projet `ecole-vendeurs-staging`, région `eu-west-1`.

## 4. Preuve projet principal non lié

Le ref interdit `swzynvmfrbkqebswfjbf` est différent du seul ref lié localement. Chaque garde préalable exigeait simultanément que le ref soit égal à `navpnanyltussvtlxouk` et différent de `swzynvmfrbkqebswfjbf`; les contrôles ont réussi. Aucune commande n'a ciblé le projet principal.

## 5. Historique distant avant dry-run

L'inventaire de préparation authentifié avait confirmé un historique distant vide : zéro migration appliquée, zéro table `public`, table `profiles` absente et zéro utilisateur Auth. Dans le présent sous-processus, `npx supabase migration list --linked` n'a pas pu renouveler cette preuve : code 1, authentification non interactive absente. Aucun `migration repair` n'a été exécuté.

## 6. Migrations locales détectées

Trois fichiers seulement sont présents, dans l'ordre lexical attendu :

1. `0001_initial_schema.sql`
2. `0002_secure_auth_admin_roles.sql`
3. `0003_unify_profiles_roles.sql`

L'analyse statique n'a détecté ni reset distant, ni suppression de base/schéma, ni troncature, ni ref de production, ni URL de connexion, ni clé `service_role`. Les libellés historiques `learner`, `student` et `affiliate` sont limités à la création historique et à leur conversion contrôlée vers `apprenant` dans `0003`.

## 7. Empreintes SHA-256

| Migration | SHA-256 |
|---|---|
| `0001_initial_schema.sql` | `F257FEBA93775368DD7E6F71A11858C8D85061CA7608F3E228A2384010997E2F` |
| `0002_secure_auth_admin_roles.sql` | `AAC2611F9012F46B55CFF4871DD190F313912F2708176E919E8F77B293495B5F` |
| `0003_unify_profiles_roles.sql` | `A06D8F5EDE8BA45DBA921E3E1626AE36F67F1E4198BBA596C084ABD8AC7D9CF4` |

## 8. Résultats tests locaux

| Contrôle | Résultat |
|---|---|
| `npm run test:migrations` | réussi, code 0; chaîne vide, convergence legacy, trigger et RLS validés |
| `npx tsc --noEmit` | réussi, code 0 |
| `npm run lint` | réussi, code 0 |
| `npm run build` | réussi, code 0 |
| `git diff --check` | réussi, code 0 |

Les notices PostgreSQL relatives aux `DROP ... IF EXISTS` sont attendues sur une base vide et ne constituent pas des erreurs.

## 9. Commande dry-run exécutée

Commande lancée après validation du ref :

```powershell
npx supabase db push --dry-run --linked
```

La CLI a confirmé le mode dry-run, puis l'authentification a bloqué avant la génération du plan. Au sens opérationnel, le dry-run n'a donc pas été exécuté contre la base distante.

## 10. Code sortie

Code de sortie : `1`.

Erreur : `LegacyPlatformAuthRequiredError` — le jeton d'accès n'était pas disponible dans le sous-processus non interactif. Aucun secret n'a été demandé, lu ou consigné.

## 11. Ordre proposé

Ordre local prévu : `0001 → 0002 → 0003`.

L'ordre proposé par Supabase n'est pas vérifiable dans cette exécution, car aucun plan distant n'a été retourné.

## 12. Analyse 0001

`0001_initial_schema.sql` crée le socle historique : types, tables, contraintes, RLS et trigger initial de profil. Sur le staging vide confirmé en préparation, elle constitue la migration de base. Le test local sur base vide réussit. Son inclusion effective dans le plan distant reste à confirmer par un dry-run authentifié.

## 13. Analyse 0002

`0002_secure_auth_admin_roles.sql` applique les privilèges intermédiaires de manière compatible avec la chaîne historique. Elle réussit dans les deux scénarios locaux. Son inclusion effective et tout avertissement distant restent à confirmer par un dry-run authentifié.

## 14. Analyse 0003

`0003_unify_profiles_roles.sql` convertit les rôles historiques vers `apprenant`, `admin`, `super_admin`, sécurise le trigger de création de profil, les policies RLS et la fonction contrôlée de changement de rôle. Les scénarios base vide et profils legacy réussissent localement. Sur le staging vide, le verrou lié à la conversion ne porte sur aucune donnée métier; la compatibilité PostgreSQL 17 reste toutefois à confirmer par le dry-run distant.

## 15. Avertissements

- Le staging distant utilise PostgreSQL 17 tandis que les tests jetables utilisent PostgreSQL 16.
- Les commandes `projects list` et `migration list --linked` ont subi le même blocage d'authentification dans ce sous-processus.
- Aucun avertissement SQL ou Supabase propre au plan distant n'a pu être collecté.
- Les règles d'exposition Data API et les grants devront être revérifiés après une future application autorisée.

## 16. Erreurs/blocages

Blocage unique : l'authentification réalisée dans le terminal interactif utilisateur n'est pas transmise au sous-processus de l'agent. Conformément aux contraintes, aucune demande de token, nouvelle connexion, migration, insertion, création de compte ou tentative de contournement n'a été faite.

## 17. Risques restants

- ordre réellement calculé par la CLI non confirmé;
- compatibilité effective avec PostgreSQL 17 non confirmée à distance;
- avertissements, objets proposés, migrations ignorées et éventuel besoin de réparation d'historique non observables sans plan;
- l'état distant vide repose sur l'inventaire authentifié de préparation et n'a pas pu être rafraîchi dans ce sous-processus.

## 18. Retour arrière

Comme aucune migration n'a été appliquée, aucun retour arrière n'est nécessaire. Pour une future application explicitement autorisée : interrompre en cas d'écart, s'appuyer sur la transaction d'une migration en échec et, uniquement pour ce staging vide et jetable, envisager sa recréation ou la restauration d'un snapshot après confirmation explicite. Ne jamais utiliser `supabase db reset --linked` ou `migration repair` sans nouvelle autorisation, et ne jamais agir sur `swzynvmfrbkqebswfjbf`.

## 19. Verdict

**DRY-RUN NON EXÉCUTÉ**

Les validations locales sont favorables, mais aucun plan distant authentifié n'a été obtenu. Il est donc impossible de déclarer les migrations prêtes à être appliquées sur la seule base de cette tentative.

## 20. Prochaine action exacte

Dans le PowerShell interactif où Supabase est déjà authentifié, vérifier d'abord que `supabase/.temp/project-ref` contient exactement `navpnanyltussvtlxouk`, puis lancer uniquement :

```powershell
npx supabase db push --dry-run --linked
```

Conserver la sortie complète pour analyse. Ne lancer aucun `db push` réel avant une nouvelle validation explicite du plan.
