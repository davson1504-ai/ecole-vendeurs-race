# Audit technique et préparation au déploiement

Date de l'audit : 5 août 2026  
Projet : École des Vendeurs de Race  
Portée : dépôt local, code et migrations versionnés, contrôles locaux. Aucun déploiement, commit, push, migration distante ou modification fonctionnelle n'a été effectué. Les valeurs des secrets et l'URL Supabase ne sont volontairement jamais reproduites.

## 1. Résumé exécutif

Le projet est une application Next.js 16 App Router compacte, visuellement avancée mais encore majoritairement au stade de prototype fonctionnel. L'authentification Supabase email/mot de passe et OAuth est branchée, les pages administratives font une vérification serveur du rôle, et la chaîne de migrations récente adopte une stratégie RLS de refus par défaut. En revanche, formations, progression, affiliation, paiements, certificats et statistiques reposent encore sur des données codées en dur ou des écrans sans action réelle.

Décision : **non prêt à déployer en production**.

Motifs principaux :

- 2 problèmes CRITIQUES : absence de contrôle d'achat sur le lecteur de cours ; webhook CinetPay non authentifié et payload journalisé ;
- 10 problèmes IMPORTANTS, notamment schémas Supabase divergents, migrations métier volontairement fermées, paiement simulé, données fictives et 4 vulnérabilités npm élevées ;
- le build réussit, tout comme ESLint et TypeScript ; le test SQL n'a pas été exécuté car Docker Desktop n'était pas démarré ;
- le projet est techniquement hébergeable sur Vercel, mais les blocages applicatifs et de sécurité interdisent une mise en production sérieuse.

## 2. Stack et architecture

| Élément | Constat vérifié |
|---|---|
| Framework | Next.js 16.2.12, App Router sous `src/app` |
| React | 19.2.4 / React DOM 19.2.4 |
| TypeScript | plage `^5`, version installée 5.9.3, mode `strict` |
| Gestionnaire | npm ; `package-lock.json` présent |
| Node | Next.js installé exige au minimum 20.9 ; aucune contrainte `engines`/`.nvmrc` dans le dépôt |
| Styles | Tailwind CSS 4 via `@tailwindcss/postcss`, CSS global |
| Auth | Supabase Auth SSR : email/mot de passe, Google, Apple, cookies et `proxy.ts` |
| Base | Supabase/PostgreSQL, 4 migrations numérotées et 2 scripts de schéma alternatifs |
| Validation | validation manuelle minimale ; Zod est installé mais inutilisé |
| UI | `lucide-react`, composants maison ; aucun kit UI |

Scripts `package.json` : `dev`, `build`, `start`, `lint`, `test:migrations`. Aucun script `typecheck` ni test applicatif unitaire/E2E.

Organisation :

- `src/app` : pages App Router, Server Actions et Route Handlers ;
- `src/components` : marque, en-têtes et boutons d'authentification ;
- `src/lib` : autorisation, données de démonstration, clients Supabase ;
- `supabase/migrations` : chaîne actuellement reproductible ;
- `supabase/tests` : scénarios PostgreSQL jetables pour migrations/RLS ;
- `public` : seulement les assets par défaut de Next.js.

Le projet utilise correctement les API asynchrones de Next.js 16 (`params`, `searchParams`, `cookies()`, `headers()`) et le nouveau fichier `proxy.ts`. Selon la documentation Next.js installée, Proxy ne remplace toutefois pas les contrôles d'autorisation au point d'accès.

## 3. Fonctionnalités et parcours

| Route | Objectif / public | État | Supabase | Constats et recommandation |
|---|---|---|---|---|
| `/` | accueil public | maquette soignée | aucun | catalogue issu de `demo-data.ts` |
| `/formations` | catalogue public | maquette | aucun | aucune lecture `courses`; connecter un catalogue publié |
| `/formations/[slug]` | détail public | maquette | aucun | achat mène toujours au même produit de démonstration |
| `/connexion` | connexion | fonctionnel partiel | Auth + `profiles` | lien « mot de passe oublié » vaut `#` |
| `/inscription` | création de compte | fonctionnel partiel | Auth ; profil créé par trigger | validation faible, code affilié collecté mais non traité par le schéma migré |
| `/auth/callback` | échange OAuth | partiel | Auth + `profiles` | ignore le paramètre `next`; erreurs silencieuses vers dashboard |
| `/auth/deconnexion` | déconnexion | fonctionnel | Auth | route GET modifiant la session : préférer POST/Server Action |
| `/dashboard` | espace apprenant | maquette authentifiée | Auth + profil | achats, progression et certificats sont fictifs |
| `/cours/[slug]` | lecteur | **cassé/sensible** | aucun | Proxy exige une session, mais aucun contrôle d'inscription/achat ; contenu codé en dur |
| `/certificat` | certificat | maquette publique | aucun | données fictives et téléchargement `#`; devrait être protégé |
| `/affiliation` | espace affilié | maquette authentifiée | Auth + requête profil | sélectionne `affiliate_code` et `is_affiliate`, colonnes absentes des migrations ; toutes les ventes sont fictives ; bouton copier inactif |
| `/paiement` | checkout | maquette publique | aucun | produit fixe, choix et coupon inactifs, succès simulé par simple lien |
| `/paiement/retour` | retour fournisseur | maquette | aucun | ignore totalement le statut serveur |
| `/admin` | tableau admin | maquette protégée | Auth + profil | rôle + statut actif vérifiés par layout ; métriques/utilisateurs/paiements fictifs ; lien Utilisateurs `#` |
| `/admin/formations` | gestion contenu | maquette protégée | Auth + profil | boutons ajouter/modifier/rechercher inactifs |
| `/admin/paiements` | gestion paiements | maquette protégée | Auth + profil | filtre/détails inactifs, données fictives |
| `/api/health` | santé basique | fonctionnel public | aucun | réponse statique |
| `/api/health/supabase` | santé Data API | partiel public | REST `courses` avec clé publique | renvoie le corps d'erreur amont au client ; limiter les détails et l'exposition |
| `/api/admin/verification` | vérification admin | cassé selon migrations | Auth + `profiles`, `admin_logs` | `admin_logs` n'existe pas dans la chaîne des migrations |
| `/api/paiement/simulation` | simulation | maquette publique | aucun | retourne toujours `accepted` |
| `/api/webhooks/cinetpay` | notification paiement | **critique** | aucun | aucune signature/token, aucune validation/relecture fournisseur, payload complet dans les logs |

Modules absents : récupération de mot de passe, quiz/examens, résultats/scores réels, notifications, gestion d'utilisateurs, gestion de rôles dans l'UI, profil/paramètres, certificats réels, uploads, statistiques réelles et tests E2E. Le responsive est généralement prévu par Tailwind, mais les tableaux administratifs ont une largeur minimale sans conteneur `overflow-x-auto` sur certaines pages et aucun menu mobile complet.

Boutons/liens sans action réelle confirmés : mot de passe oublié, utilisateurs admin, filtre et détails paiements, ajout/modification formation, recherche, copie affiliation, marquer la leçon terminée, leçons suivante/précédente, ressources, choix de moyen de paiement, coupon, certificat PDF et liens légaux/réseaux sociaux.

## 4. Audit Supabase

### 4.1 Source de vérité et migrations

Ordre :

1. `0001_initial_schema.sql` : types, 10 tables, trigger de profil et RLS partiel ;
2. `0002_secure_auth_admin_roles.sql` : révocation des privilèges profil et mise à jour limitée ;
3. `0003_unify_profiles_roles.sql` : convergence non destructive des rôles, policies profil, fonction contrôlée de changement de rôle ;
4. `0004_secure_business_tables_rls.sql` : RLS sur toutes les tables métier et révocation des écritures, modules/leçons totalement fermés.

Les fichiers `EDVR_SUPABASE_SCHEMA.sql` (13 tables, bucket `course-files`) et `EDVR_SUPABASE_SCHEMA_V2.sql` (27 tables) ne font pas partie de cette chaîne et décrivent des modèles incompatibles entre eux et avec les migrations. Les appliquer manuellement en production créerait une dérive non traçable. Ils doivent être considérés comme références historiques jusqu'à consolidation explicite.

### 4.2 Tables de la chaîne de migrations

| Table | Clé / relations et colonnes majeures | RLS après 0004 |
|---|---|---|
| `profiles` | PK/FK `id -> auth.users`; email, nom, téléphone, rôle, statut | activée ; SELECT/UPDATE de sa propre ligne ; UPDATE limité à nom/téléphone par GRANT |
| `courses` | UUID ; slug, descriptions, statut, prix | activée ; aucune policy métier dans la chaîne |
| `modules` | UUID ; FK course, position | activée ; SELECT révoqué, zéro policy |
| `lessons` | UUID ; FK module, type, contenu, chemin stockage, aperçu, position | activée ; SELECT révoqué, zéro policy |
| `products` | UUID ; FK course, titre, prix, actif | activée ; écritures client révoquées, aucune policy |
| `orders` | UUID ; FK profil/produit, statut, montant, référence | activée ; écritures client révoquées, aucune policy |
| `payments` | UUID ; FK commande, transaction fournisseur, statut, payload | activée ; écritures client révoquées, aucune policy |
| `enrollments` | UUID ; FK profil/cours/commande, activation | activée ; écritures client révoquées, aucune policy |
| `affiliates` | UUID ; FK profil, code, taux, actif | activée ; écritures client révoquées, aucune policy |
| `commissions` | UUID ; FK affilié/commande/paiement, montants, statut | activée ; écritures client révoquées, aucune policy |

Enums initiaux : `app_role`, `publish_status`, `order_status`, `payment_status`, `commission_status`. `profiles.role` est ensuite converti en texte contraint à `apprenant|admin|super_admin`; `affiliate` devient `apprenant` car l'affiliation est un statut métier, pas un privilège.

Fonctions/triggers :

- `handle_new_user()` est `SECURITY DEFINER`, `search_path=''`, ignore tout rôle fourni par les métadonnées utilisateur et force `apprenant`; exécution révoquée aux rôles clients ; trigger `on_auth_user_created` ;
- `set_profile_role(uuid,text)` est `SECURITY DEFINER`, vérifie `auth.uid()`, le statut actif et le rôle `super_admin`; exécutable seulement par `authenticated`. Son audit vers `admin_logs` est conditionnel car cette table n'est pas migrée.

Aucune vue n'est créée par les migrations. Aucun bucket ou policy Storage n'est créé par les migrations. Le bucket `course-files` existe uniquement dans l'ancien script autonome et sa policy de lecture accorde l'accès à tout utilisateur authentifié, sans vérifier l'achat : elle ne doit pas être reprise telle quelle.

### 4.3 Cohérence et risques

- RLS est activée sur les 10 tables sensibles après `0004` ; c'est sûr mais non fonctionnel pour le catalogue, les achats et la progression.
- Un utilisateur ne peut sélectionner ou modifier que son profil ; le rôle et le statut ne sont pas modifiables directement grâce aux GRANT de colonnes.
- Le service role n'est importé que dans `src/lib/supabase/admin.ts`, marqué `server-only`, et ce module n'est actuellement utilisé nulle part. Aucune clé privilégiée n'est exposée au navigateur.
- Le code référence `admin_logs`, absent des migrations, ainsi que `profiles.affiliate_code` et `profiles.is_affiliate`, absents des migrations.
- Les dix tables migrées, hormis `profiles`, ne sont jamais lues par l'application ; l'interface utilise `demo-data.ts`.
- L'état réel du projet Supabase distant n'a pas pu être certifié par l'audit anonyme : les requêtes de contrôle n'ont obtenu aucune réponse HTTP exploitable. Les constats RLS ci-dessus décrivent donc la chaîne SQL du dépôt, pas une garantie de conformité du distant.
- Le test de migrations existe et couvre base fraîche, legacy et RLS, mais n'a pas tourné pendant cet audit faute de moteur Docker.

## 5. Variables d'environnement

| Nom | Utilisation réelle | Portée | Obligatoire | Documentée | Vercel |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | actions auth, lien affilié | client/public | oui en production | oui | Preview + Production |
| `NEXT_PUBLIC_SUPABASE_URL` | clients browser/serveur/admin, Proxy, health | client/public | oui | oui | tous environnements |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clients browser/serveur, Proxy, health | client/public | oui | oui | tous environnements |
| `SUPABASE_SERVICE_ROLE_KEY` | client admin serveur inutilisé | serveur privé | non actuellement ; requis pour futures opérations privilégiées | oui | seulement si utilisé, jamais Preview non fiable/client |

Présentes dans `.env.example` mais inutilisées dans le code : `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_SECRET_KEY`, `CINETPAY_MODE`, `CINETPAY_NOTIFY_URL`, `CINETPAY_RETURN_URL`. Elles seront nécessaires seulement après intégration réelle ; clés et secret doivent rester serveur. Aucun fichier `.env` n'est suivi par Git. Le scan ciblé des fichiers suivis n'a trouvé aucun JWT ; les occurrences détectées par heuristique sont des noms/documentation ou le nom d'un header, pas des valeurs de secret.

`NEXT_PUBLIC_APP_URL` devrait idéalement être remplacée/complétée par une fonction d'origine fiable prenant en compte l'URL de production et l'URL Vercel Preview, sans faire confiance aveuglément au header `Origin`.

## 6. Qualité, sécurité et performances

### CRITIQUE (2)

| Fichier / zone | Problème et risque | Correction recommandée |
|---|---|---|
| `src/app/cours/[slug]/page.tsx:9-13` | Aucun contrôle de session local ni d'`enrollment`; toute session authentifiée peut ouvrir tout slug. Proxy n'est qu'un filtre optimiste. Risque de contournement du paywall. | Charger cours/leçon côté serveur, appeler une fonction d'autorisation testée sur `enrollments`, refuser par défaut et protéger aussi les assets Storage. |
| `src/app/api/webhooks/cinetpay/route.ts:3-10` | Tout appel est accepté, le token n'est jamais vérifié, aucune signature/requête de confirmation fournisseur, et le payload est logué. Risque de fraude et fuite de données dès que l'écriture paiement sera branchée. | Vérification cryptographique/fournisseur, validation stricte, idempotence, comparaison montant/devise/commande, journalisation expurgée, refus 4xx et tests de rejeu. |

### IMPORTANT (10)

1. `supabase/EDVR_SUPABASE_SCHEMA*.sql` et `supabase/migrations/*` : trois modèles divergents ; choisir une chaîne unique avant staging/production.
2. `0004_secure_business_tables_rls.sql` : toutes les opérations métier sont fermées sans opérations serveur correspondantes ; le produit ne peut pas fonctionner sur les données réelles.
3. `src/app/paiement/*` et API simulation : aucune transaction réelle, confirmation ou création d'inscription.
4. `src/lib/demo-data.ts` et dashboards : catalogue, achats, progression, revenus, utilisateurs et affiliation fictifs, certains ressemblant à des données personnelles.
5. `src/app/(dashboard)/affiliation/page.tsx:118-125` et API admin : colonnes/table absentes des migrations ; erreurs silencieuses et valeurs de repli trompeuses.
6. Dépendances : `npm audit` signale 4 vulnérabilités élevées (`brace-expansion`, `next` via `postcss` et `sharp`) ; mise à niveau testée vers une version corrigée requise, sans `--force` aveugle.
7. `src/app/(auth)/actions.ts:40-43` : origine de callback issue du header `Origin`; construire depuis une configuration de confiance et une allowlist.
8. `src/app/api/health/supabase/route.ts:37-46` : expose le corps d'erreur Supabase à tout visiteur ; réponse publique minimale uniquement.
9. `src/app/(auth)/connexion/page.tsx:42` : récupération de mot de passe absente, parcours de compte incomplet.
10. Aucun test applicatif/auth/paiement/E2E ; le seul test SQL dépend de Docker et n'a pas pu être exécuté lors de l'audit.

### MOYEN

- `src/app/auth/callback/route.ts` ignore `next` et ne présente pas les erreurs OAuth ;
- validation manuelle et partielle ; Zod inutilisé, aucune validation métier serveur du téléphone/code affilié ;
- pas de `loading.tsx`, `error.tsx`, `global-error.tsx` ou `not-found.tsx` personnalisé ;
- erreurs Supabase souvent ignorées (`profile` nul devient une valeur de démonstration) ;
- fichiers longs : affiliation (234 lignes), marque (126), données démo (127), actions auth (141) ;
- contrôle admin dupliqué dans les pages malgré le layout ; l'une des pages ne vérifie pas directement `status`, même si le layout le fait ;
- `src/components/social-auth-buttons.tsx` duplique un composant actif mais ses boutons sont inertes ;
- aucune métadonnée spécifique par page, sitemap, robots, Open Graph ou instrumentation ;
- navigation mobile incomplète ; tableaux et actions iconiques manquent parfois de libellés accessibles ;
- pas d'en-têtes CSP/HSTS/Permissions-Policy configurés dans le dépôt.

### MINEUR

- `zod` est inutilisé ; `src/lib/utils.ts`, clients Supabase browser/admin et ancien composant social ne sont importés nulle part ; `clsx`/`tailwind-merge` ne sont donc utiles qu'à du code mort ;
- exports/public par défaut Next.js inutilisés ;
- deux systèmes d'en-tête et de marque créent de l'incohérence ;
- absence de contrainte Node dans `package.json` ;
- dépendances mineures disponibles (`@supabase/*`, types React, Lucide, React) et versions majeures à évaluer séparément (ESLint/TypeScript/types Node).

Points positifs : TypeScript strict sans `any` détecté, peu de composants client, aucune image distante/non optimisée, redirection `next` filtrée contre les URLs absolues dans les Server Actions, autorisation admin effectuée côté serveur, service role isolé par `server-only`, migrations de rôle prudentes et non destructives.

## 7. Résultats techniques

| Contrôle | Commande | Résultat | Détail |
|---|---|---|---|
| Installation | `npm ci` | succès avec avertissement | 374 paquets ajoutés ; audit : 4 vulnérabilités élevées |
| Lint | `npm run lint` | succès | aucun diagnostic |
| TypeScript | `npx tsc --noEmit` | succès | aucun diagnostic ; commande directe car aucun script `typecheck` |
| Tests | `npm run test:migrations` | échec/non exécuté fonctionnellement | Docker Desktop indisponible ; aucun scénario SQL lancé |
| Build | `npm run build` | succès | Next 16.2.12/Turbopack ; 15 pages statiques générées, routes dynamiques listées sans erreur |
| Dépendances | `npm audit --json` | avertissement bloquant | 0 critique, 4 élevées, correctifs annoncés disponibles ; aucun fix appliqué |

Environnement de contrôle : Node 24.14.0, npm 11.9.0. Le build a chargé `.env.local`; aucune valeur n'est reproduite ici.

## 8. Compatibilité et procédure Vercel

Compatibilité structurelle : **oui**. Next.js 16 est nativement supporté, `npm run build` fonctionne, aucune WebSocket, tâche permanente, cron, middleware legacy ou dépendance native personnalisée n'a été détectée. Sortie standard `.next`; ne pas définir de dossier de sortie manuel.

Préconditions bloquantes : résoudre P0, figer le schéma/migrations, appliquer et valider sur staging, configurer les variables et callbacks, tester paiement/auth/autorisation, corriger les vulnérabilités élevées et relancer la suite SQL.

Procédure proposée :

1. Préparer une branche dédiée, conserver `package-lock.json`, ajouter une contrainte Node compatible (au minimum 20.9 ; choisir une version LTS supportée par Vercel) et obtenir un arbre Git propre/revu.
2. Créer/connecter le projet Vercel via l'intégration GitHub, sans déploiement Production initial.
3. Framework Preset : Next.js ; Root Directory : racine du dépôt.
4. Install Command : `npm ci`; Build Command : `npm run build`; Output Directory : automatique ; Node : version LTS figée.
5. Ajouter les variables listées dans `VARIABLES_VERCEL.example` séparément pour Preview et Production. Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` avec `NEXT_PUBLIC_`.
6. Créer un projet Supabase de staging distinct, appliquer uniquement la chaîne de migrations approuvée, lancer les tests et audits RLS, puis comparer le schéma distant à la chaîne locale.
7. Dans Supabase Auth, définir l'URL de site Production exacte et autoriser `http://localhost:3000/**`, le callback Preview Vercel contrôlé et `https://domaine-production/auth/callback`; configurer Google/Apple pour ces environnements. En production, préférer des URLs exactes.
8. Créer un déploiement Preview, jamais Production à ce stade.
9. Vérifier : accueil, inscription/confirmation, login/logout/OAuth, séparation apprenant/admin, accès refusé sans achat, création/validation paiement, rejeu webhook, RLS multi-utilisateurs, responsive, logs sans données sensibles et health minimal.
10. Une fois les critères P0/P1 validés, promouvoir l'artefact Preview déjà testé plutôt que reconstruire un artefact différent.
11. Rollback : conserver le déploiement Vercel précédent et utiliser la promotion/rollback d'alias ; pour la base, uniquement migrations forward non destructives et sauvegarde vérifiée. Ne jamais tenter de « rollback » par suppression de données.

## 9. Plan d'amélioration

### P0 — Bloquants avant déploiement

| Tâche | Fichiers | Difficulté / risque / dépendances | Estimation | Critère de fin |
|---|---|---|---|---|
| Unifier le schéma Supabase et produire une chaîne staging reproductible | `supabase/*` | élevée / élevé / audit distant + Docker | L | une base vierge et une base legacy convergent, tests RLS verts, diff distant nul |
| Autoriser cours et assets par achat | lecteur, authorization, migrations, Storage | élevée / élevé / enrollments | L | tests prouvent qu'un non-acheteur ne lit ni leçon ni fichier, acheteur oui |
| Implémenter le paiement CinetPay sûr | paiement, webhook, orders/payments | élevée / élevé / documentation fournisseur + secrets | L | signature/confirmation/idempotence/rejeu testés, montant vérifié, aucun payload sensible logué |
| Corriger les vulnérabilités élevées | `package.json`, lockfile | moyenne / moyen / tests complets | S-M | `npm audit` sans high/critical et build/tests verts |
| Exécuter la validation staging complète | tests SQL + parcours E2E | moyenne / élevé / Docker + staging | M | tests migrations, auth, RLS et smoke Preview tous verts |

### P1 — Corrections importantes

| Tâche | Fichiers | Difficulté / risque / dépendances | Estimation | Critère de fin |
|---|---|---|---|---|
| Remplacer les données fictives par les tables réelles | pages catalogue/dashboard/admin/affiliation | élevée / moyen / P0 schéma | L | aucune donnée personnelle/statistique démo dans les vues production |
| Fiabiliser origine et callbacks Auth | actions, callback, config Vercel/Supabase | moyenne / élevé / domaines | M | tests localhost/Preview/Production sans redirection hors allowlist |
| Ajouter récupération de mot de passe et erreurs auth | pages/actions auth | moyenne / moyen / SMTP/Auth | M | email, callback et nouveau mot de passe testés |
| Réduire l'endpoint health | route health Supabase | faible / faible | S | aucun détail Supabase interne renvoyé publiquement |
| Ajouter tests app/auth/admin | nouveau socle tests | moyenne / faible | M | CI couvre 401/403, rôles, erreurs et happy paths |

### P2 — Améliorations fonctionnelles

- progression et navigation de leçons persistées (L, dépend de P0) ; fini lorsque reprise et taux sont exacts ;
- quiz, tentatives, scores et critères de réussite (L) ; fini avec correction serveur et anti-altération ;
- certificats vérifiables et PDF privé (M) ; fini avec URL de vérification et contrôle d'éligibilité ;
- gestion admin des formations/utilisateurs/paiements (L) ; fini quand CRUD validé, journalisé et autorisé ;
- affiliation réelle (L) ; fini quand attribution, taux, commissions et confidentialité sont testés.

### P3 — Visuel et confort

- navigation mobile cohérente et tableaux responsives (M) ;
- états loading/empty/error/success et feedback de formulaires (M) ;
- accessibilité clavier, focus, libellés des boutons iconiques, contraste (M) ;
- unifier les en-têtes/composants et retirer les écrans inertes (S-M) ;
- métadonnées/SEO/sitemap/OG et vraies illustrations optimisées (M).

### P4 — Optimisations futures

- observabilité structurée avec redaction et alertes ;
- analytics respectueux de la vie privée et métriques métier calculées serveur ;
- cache ciblé du catalogue publié, invalidation après édition ;
- rate limiting des endpoints auth/paiement et CSP stricte ;
- stratégie Preview Supabase par branche, sauvegardes/restauration testées.

## 10. Conclusion

Le socle technique compile proprement et les récentes migrations de rôles/RLS montrent une bonne direction de sécurité. Le produit visible reste toutefois une maquette connectée à l'authentification plutôt qu'une plateforme de formation transactionnelle. Le prochain travail ne doit pas être une refonte visuelle : il faut d'abord figer le modèle Supabase, sécuriser l'accès au contenu et le paiement, puis valider le tout sur staging. **Décision finale : non prêt.**
