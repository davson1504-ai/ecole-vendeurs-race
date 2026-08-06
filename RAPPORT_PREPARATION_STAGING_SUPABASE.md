# Préparation du staging Supabase

## 1. Résumé

Le projet Supabase `ecole-vendeurs-staging` a été identifié et audité exclusivement en lecture seule. Son project ref réel est `navpnanyltussvtlxouk`, sa région `eu-west-1` et son état `ACTIVE_HEALTHY`. L’inventaire distant confirme zéro migration, zéro table `public`, zéro utilisateur Auth et aucune structure métier.

La chaîne locale `0001 → 0002 → 0003` est présente et son test PostgreSQL 16 jetable réussit. Aucune migration distante, donnée ou compte n’a été créé pendant cette préparation.

Niveau de preuve : confirmé par commandes locales, métadonnées Supabase et requêtes SQL agrégées en lecture seule.

## 2. Project ref ciblé

| Élément | Valeur |
|---|---|
| Projet autorisé | `ecole-vendeurs-staging` |
| Project ref autorisé et lié | `navpnanyltussvtlxouk` |
| Région | `eu-west-1` |
| État | `ACTIVE_HEALTHY` |
| Moteur distant | PostgreSQL 17, version signalée `17.6.1.155` |
| Project ref interdit | `swzynvmfrbkqebswfjbf` |

Avant chaque interrogation distante, le contenu local de `supabase/.temp/project-ref` a été comparé au ref autorisé. Il était exactement `navpnanyltussvtlxouk` et différent du ref interdit.

## 3. Preuve qu’il s’agit du staging

La preuve repose sur trois signaux concordants :

1. confirmation explicite de l’utilisateur que le projet est réservé exclusivement au staging, vide, jetable et recréable;
2. liaison locale enregistrée vers `navpnanyltussvtlxouk` uniquement;
3. métadonnées Supabase retournant le nom `ecole-vendeurs-staging`, la région `eu-west-1` et le même ref.

Le projet principal interdit n’est pas lié : le seul fichier de liaison contient le ref staging et non `swzynvmfrbkqebswfjbf`. Aucune commande ni requête n’a ciblé le ref interdit.

Niveau de preuve : confirmé par déclaration utilisateur, inspection locale et métadonnées distantes.

## 4. État Git

| Élément | Valeur |
|---|---|
| Branche | `fix/p0-migrations-roles` |
| SHA | `c1b7c894b4de36a5bb41f1695a02000ddce4b8b4` |
| Changement fonctionnel après ce SHA | aucun |
| Commit créé pendant cette phase | aucun |
| Push Git | aucun |

Les fichiers de configuration et rapports produits restent non suivis. Le commit de correction P0 n’a pas été amendé.

## 5. Version Supabase CLI

`npx supabase --version` retourne `2.111.0`. Node.js est en `v24.14.0`, npm en `11.9.0` et Docker en `29.6.2`.

La CLI fonctionne localement. L’authentification et la liaison ont été effectuées dans le terminal interactif utilisateur. Le sous-processus non interactif de l’agent ne reçoit pas le token local; l’inventaire distant a donc été recoupé via la connexion Supabase authentifiée, sans exposer de secret.

## 6. Configuration locale créée

`npx supabase init` a créé :

- `supabase/config.toml`;
- `supabase/.gitignore`.

Les trois migrations existantes ont été préservées sans écrasement. Les métadonnées internes `.temp` sont ignorées par la configuration Supabase. Aucun token, mot de passe ou chaîne de connexion n’a été écrit dans un fichier suivi ou dans ce rapport.

## 7. Liaison au projet

Le fichier interne `supabase/.temp/project-ref` contient exactement `navpnanyltussvtlxouk`. La liaison au projet principal interdit est donc fausse. Le contrôle du ref a été répété avant chaque appel distant.

Niveau de preuve : confirmé par inspection locale. Le fichier interne n’est pas destiné à être suivi.

## 8. Historique des migrations

L’historique distant retourné est vide : **0 migration appliquée**.

| Migration locale | Locale | Distante |
|---|---:|---:|
| `0001_initial_schema.sql` | oui | non |
| `0002_secure_auth_admin_roles.sql` | oui | non |
| `0003_unify_profiles_roles.sql` | oui | non |

Le résultat fourni par `npx supabase migration list` a été recoupé par l’API Supabase de liste des migrations, qui retourne une liste vide. Aucun `migration repair` n’a été exécuté.

## 9. Tables présentes

Nombre de tables de base dans le schéma `public` : **0**.

- tables métier du projet : 0;
- tables d’affiliation (`affiliates`, `commissions`, `affiliate_referrals`, `affiliate_commissions`) : 0;
- structures V2 recherchées : 0.

Niveau de preuve : confirmé par la liste détaillée des tables et une requête agrégée sur `information_schema`.

## 10. État de profiles

La table `public.profiles` est absente.

| Contrôle | Résultat |
|---|---:|
| table présente | non |
| colonnes | 0 |
| profils | 0, puisqu’aucune table `profiles` n’existe |
| utilisateurs `auth.users` | 0 |
| type de `profiles.role` | sans objet avant migrations |

Aucune donnée personnelle n’a été lue ou retournée.

## 11. Policies et grants présents

Pour `public.profiles`, avant migration :

- policies : 0;
- privilèges de colonnes : 0;
- triggers : 0;
- fonctions liées `handle_new_user`/`set_profile_role` : 0.

Ces zéros sont cohérents avec l’absence de la table et du schéma métier.

## 12. Classification A à F

**CAS A — aucune migration appliquée.**

Il n’existe aucun écart indiquant une application manuelle du schéma legacy ou V2. Aucune réparation d’historique ni migration de convergence supplémentaire n’est nécessaire avant la chaîne locale prévue.

## 13. Validation que le projet est vide

La base métier est confirmée vide par les contrôles suivants :

- 0 migration distante;
- 0 table `public`;
- `profiles` absente;
- 0 utilisateur Auth;
- 0 table d’affiliation;
- 0 structure V2;
- déclaration utilisateur : aucune donnée réelle autorisée et environnement jetable.

## 14. Ordre prévu des migrations

Ordre unique prévu :

1. `0001_initial_schema.sql` — création du socle historique;
2. `0002_secure_auth_admin_roles.sql` — privilèges intermédiaires compatibles;
3. `0003_unify_profiles_roles.sql` — convergence vers `apprenant`, `admin`, `super_admin`, trigger et RLS.

Validation locale finale : `npm run test:migrations` réussi, exit 0, sur deux bases PostgreSQL 16 jetables (chaîne vide et profils legacy synthétiques). `git diff --check` réussit.

## 15. Risques

- le staging distant utilise PostgreSQL 17 alors que le test local reproductible utilise PostgreSQL 16;
- la première migration créera plusieurs tables et types en une opération;
- `0003` convertira `profiles.role` d’enum vers texte et prendra un verrou, mais la table sera vide;
- les nouvelles règles Supabase exigent des grants explicites pour l’exposition Data API; `profiles` en reçoit selon le périmètre prévu, les autres tables devront être auditées après application;
- la CLI non interactive de l’agent n’hérite pas de l’authentification utilisateur : la prochaine commande doit être lancée depuis le terminal Supabase authentifié;
- le dry-run doit être relu avant tout push réel.

## 16. Stratégie de retour arrière

Le projet est déclaré jetable et recréable, sans donnée réelle. Pour la prochaine phase :

1. exécuter d’abord uniquement le dry-run;
2. si le dry-run révèle un écart, ne rien appliquer et corriger localement;
3. lors d’un futur push autorisé, s’appuyer sur les transactions des migrations pour annuler un fichier en échec;
4. si une migration est validée puis qu’un défaut structurel apparaît avant toute donnée, supprimer/recréer exclusivement ce projet staging ou restaurer un snapshot staging, après confirmation explicite;
5. ne jamais utiliser `db reset --linked` ni `migration repair` sans une nouvelle autorisation documentée;
6. ne jamais appliquer cette stratégie au projet principal interdit.

## 17. Commande exacte proposée pour appliquer les migrations

Pour la prochaine étape, exécuter d’abord, depuis le terminal authentifié et après un nouveau contrôle du ref :

```powershell
npx supabase db push --dry-run --linked
```

Cette commande est **proposée mais n’a pas été exécutée** pendant cette phase. Un push réel nécessitera une validation distincte après lecture du dry-run.

## 18. Verdict

**PRÊT À APPLIQUER LES MIGRATIONS SUR STAGING**, en commençant obligatoirement par le dry-run proposé et uniquement sur `navpnanyltussvtlxouk`.

Conditions confirmées : project ref exact, CAS A, base vide, aucune donnée réelle, CLI disponible, liaison correcte, trois migrations locales présentes et aucun écart distant détecté.

## 19. Prochaine action exacte

Dans une nouvelle phase explicitement validée :

1. relire `supabase/.temp/project-ref` et arrêter s’il diffère de `navpnanyltussvtlxouk`;
2. exécuter uniquement `npx supabase db push --dry-run --linked` dans le terminal authentifié;
3. consigner la liste exacte des migrations proposées;
4. ne lancer aucun push réel avant une nouvelle validation humaine du dry-run.
