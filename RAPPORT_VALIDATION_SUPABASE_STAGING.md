# Validation Supabase staging — Migration P0

## 1. Résumé exécutif

La validation sur runtime Supabase réel n’a pas commencé, conformément à la règle d’arrêt de sécurité. Aucun environnement staging isolé n’est formellement identifiable depuis le dépôt : Supabase CLI absente, aucun `supabase/config.toml`, aucune liaison de project ref et aucune preuve locale distinguant staging de production.

**Verdict : P0 NON VALIDÉ SUR STAGING.** La correction reste validée localement sur PostgreSQL 16 avec stubs, mais aucune affirmation n’est faite sur une base distante.

Niveau de preuve : confirmé par commande et inspection locale.

## 2. Environnement utilisé

Uniquement le dépôt local `C:\Users\LENOVO\Documents\projet_lobo\ecole-vendeurs-race`. Aucune connexion Supabase distante n’a été tentée. Aucun clone, branche Supabase ou projet jetable distant n’a été utilisé.

Niveau de preuve : confirmé par commande.

## 3. Preuve qu’il s’agit du staging

**Aucune preuve disponible.** Les éléments suivants manquent :

- nom du projet staging;
- project ref staging;
- organisation propriétaire;
- région;
- environnement déclaré;
- URL publique identifiée comme staging;
- branche Supabase/clone éventuel;
- confirmation écrite que ce project ref n’est pas celui de production.

Les variables `.env.local` utilisent des noms génériques sans marqueur `staging`, `stage`, `preview` ou `test`. Leurs valeurs n’ont pas été affichées.

Niveau de preuve : confirmé par inspection locale.

## 4. État Git

| Élément | Valeur |
|---|---|
| Branche | `fix/p0-migrations-roles` |
| HEAD | `c1b7c894b4de36a5bb41f1695a02000ddce4b8b4` |
| Derniers commits | `c1b7c89`, `4c97f21`, `8ae216f` |
| Changement fonctionnel après le commit | aucun |
| Rapport initial non suivi | `RAPPORT_ETAT_ACTUEL_AVANT_DEPLOIEMENT.md` |
| Présent rapport | non suivi, sans commit |

Le commit `c1b7c894b4de36a5bb41f1695a02000ddce4b8b4` n’a pas été modifié. Niveau de preuve : confirmé par `git status`, `git rev-parse`, `git show`, `git diff HEAD^ HEAD` et `git diff --check`.

## 5. Versions des outils

| Outil | Résultat |
|---|---|
| Node.js | `v24.14.0` |
| npm | `11.9.0` |
| Docker | `29.6.2` |
| Supabase CLI | non installée |
| `supabase/config.toml` | absent |
| project ref lié | absent/non identifiable |

Niveau de preuve : confirmé par commande.

## 6. Historique distant des migrations

Non récupéré. `supabase migration list` n’a pas été exécuté, car la CLI et la liaison staging sont absentes.

Niveau de preuve : non vérifiable.

## 7. Structure réelle de profiles

Non récupérée. Aucun accès distant n’a été utilisé.

Type réel de `profiles.role`, défaut, nullabilité, contraintes, index, triggers et fonctions : non vérifiables.

## 8. Valeurs de rôles avant migration

Non récupérées. Aucun agrégat distant n’a été interrogé afin d’éviter de contacter un projet potentiellement de production.

## 9. Policies et grants avant migration

Non récupérés. Policies et privilèges réels de `anon`, `authenticated` et `service_role` : non vérifiables.

## 10. Classification de l’état distant

**CAS F — état partiel ou inconnu**, faute d’environnement staging identifié et d’historique distant.

Conséquences :

- `0003` ne peut pas être appliquée directement;
- aucune migration supplémentaire ne peut encore être décidée;
- aucune réparation d’historique n’est justifiée;
- risque principal : cibler la production ou un historique incompatible;
- retour arrière : sans objet, car aucune écriture n’a eu lieu.

## 11. Sauvegarde et restauration

Aucune sauvegarde staging n’a été réalisée ou confirmée, puisqu’aucun staging n’est identifié. La capacité de restauration est non vérifiable.

La validation ne doit pas reprendre avant qu’un snapshot daté et une procédure de restauration testable soient confirmés.

## 12. Test sur clone ou branche isolée

Non exécuté. Aucun clone, branche Supabase ou projet jetable réel n’est configuré.

## 13. Application de 0003

Non appliquée. Aucun SQL distant n’a été exécuté.

## 14. Valeurs de rôles après migration

Sans objet/non vérifiable puisque `0003` n’a pas été appliquée.

## 15. Vérification de conservation des données

Nombre de profils, utilisateurs Auth et lignes d’affiliation avant/après : non vérifiables. Aucune donnée distante n’a été modifiée ou copiée.

## 16. Tests anon

Non exécutés sur runtime Supabase réel.

## 17. Tests apprenant

Non exécutés sur runtime Supabase réel.

## 18. Tests admin

Non exécutés sur runtime Supabase réel.

## 19. Tests super_admin

Non exécutés sur runtime Supabase réel.

## 20. Tests d’inscription malveillante

Non exécutés sur runtime Supabase réel. Les tests PostgreSQL simulés du commit précédent restent réussis, mais ne constituent pas cette validation staging.

## 21. Tests applicatifs

Non exécutés avec des comptes staging réels. Les redirections `/dashboard`, `/admin`, `/api/admin/verification` et la déconnexion restent à valider.

## 22. TypeScript, ESLint, build et migrations

Les résultats du commit de correction restent documentés dans `RAPPORT_CORRECTION_P0_MIGRATIONS.md` : TypeScript, ESLint, build et `test:migrations` réussis. Ils n’ont pas été relancés dans cette tentative, car aucune validation staging n’a pu commencer et aucun code fonctionnel n’a changé.

`git diff HEAD^ HEAD --check` : réussi. Niveau de preuve : confirmé par commande.

## 23. Incidents ou écarts

- Supabase CLI absente;
- `supabase/config.toml` absent;
- aucune métadonnée de liaison locale;
- environnement staging non identifiable;
- aucune preuve de sauvegarde/restauration;
- aucune possibilité sûre de distinguer l’URL générique locale d’un projet de production;
- aucune commande distante exécutée.

## 24. Risques restants

- historique réel possiblement différent des migrations locales;
- ancien `0002` potentiellement enregistré;
- schéma V2 possiblement appliqué manuellement;
- valeurs de rôles inconnues;
- grants/policies/fonctions divergents;
- verrou de table lors de la conversion de `profiles.role`;
- incompatibilité éventuelle de `admin_logs`;
- absence de rollback confirmé.

## 25. Procédure de rollback

Aucun rollback nécessaire pour cette tentative : aucune écriture distante n’a été faite.

Avant une future application : créer un snapshot staging, confirmer une restauration possible, relever uniquement les agrégats autorisés, tester d’abord sur clone/branche isolée et s’appuyer sur le rollback transactionnel de `0003` en cas d’erreur. Une restauration du snapshot reste la voie de retour après commit.

## 26. Verdict

**P0 NON VALIDÉ SUR STAGING.**

Cause : environnement staging absent ou non prouvé. Ce verdict ne remet pas en cause les tests locaux; il interdit seulement de conclure que le runtime Supabase réel est validé.

## 27. Prochaine action exacte

Fournir hors chat de secrets, puis configurer localement de manière non suivie :

1. le nom, l’organisation, la région et le project ref du staging;
2. une preuve écrite que ce project ref n’est pas la production;
3. une branche Supabase, un clone ou un projet jetable dédié pour le premier essai;
4. la confirmation d’un snapshot staging daté et restaurable;
5. une authentification Supabase CLI locale via le flux officiel, sans coller de token dans le chat;
6. un `supabase/config.toml`/lien local pointant explicitement vers le staging, conservé selon la politique de sécurité du projet.

Ensuite, reprendre strictement par `supabase migration list` et l’inventaire SQL agrégé en lecture seule, avant toute application de `0003`.
