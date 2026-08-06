# Rapport d’état actuel — École des Vendeurs

> Audit réalisé le 2 août 2026 depuis `C:\Users\LENOVO\Documents\projet_lobo\ecole-vendeurs-race`. Périmètre strictement en lecture, hors génération normale de `.next` par le build. Le présent rapport est le seul fichier créé. Aucun code fonctionnel, média, schéma, donnée distante, commit ou déploiement n’a été modifié.

## 1. Résumé exécutif

**Verdict : non déployable pour une démonstration client complète**, malgré un build de production réussi.

Le dépôt est propre, sur `main`, et parfaitement aligné avec `origin/main` au SHA `4c97f214bd6d9c5e4bd8e7179c89edde0aa45e2d`. L’application Next.js 16.2.12 compile, passe TypeScript et ESLint. En revanche, il s’agit encore largement d’un MVP visuel : les formations, progressions, paiements, affiliations et statistiques affichés proviennent surtout de `src/lib/demo-data.ts`; aucun parcours `/progression`, quiz, évaluation ou profil n’existe; le lecteur de cours ne persiste rien; le paiement simule toujours un succès; le webhook n’authentifie ni ne traite une transaction.

Deux blocages P0 dominent :

1. la chaîne de migrations locale est incohérente (`learner`/`affiliate` dans l’enum de `0001`, puis `apprenant`/`student` dans `0002`) et `0002` cible aussi des colonnes absentes de `0001`;
2. l’application ne possède pas de flux de paiement fiable : achat codé en dur, simulation de succès, webhook sans validation ni écriture.

La base Supabase distante est **non vérifiable** : le script de connexion s’arrête avant le test réseau, car `SUPABASE_SERVICE_ROLE_KEY` n’est pas renseignée localement. Il serait dangereux de déduire l’état distant des gros scripts SQL non intégrés à `supabase/migrations/`.

| Indicateur | Résultat | Niveau de preuve |
|---|---:|---|
| Routes applicatives analysées | 21 (14 pages, 7 handlers) | confirmé par inspection et build |
| Pages terminées | 0 | confirmé par inspection fonctionnelle |
| Pages incomplètes/maquettes | 14 | confirmé par inspection |
| Emplacements d’images manquantes | 25 rendus potentiels, issus de 9 appels source | confirmé par inspection |
| Images cassées | 0 référence cassée détectée | confirmé par commande |
| Images présentes mais inutilisées | 5 SVG de démarrage | confirmé par commande |
| Formations locales provisoires | 5, et non 4 | confirmé par inspection |
| Formations Supabase distantes | non vérifiable | test distant bloqué |
| `/progression` | absente | confirmé par inspection et build |
| Tests automatisés | aucun | confirmé par commande |

## 2. État Git réel

| Élément | Constat | Preuve |
|---|---|---|
| Dépôt local | `C:/Users/LENOVO/Documents/projet_lobo/ecole-vendeurs-race` | `git rev-parse --show-toplevel` |
| Branche active | `main` | `git branch --show-current` |
| Dernier commit local | `4c97f214bd6d9c5e4bd8e7179c89edde0aa45e2d` — `chore: publier l’état stable initial du projet` | `git log -1` |
| Dernier commit distant réel | même SHA sur `refs/heads/main` | `git ls-remote --heads origin` (lecture distante, sans fetch) |
| Worktree avant rapport | propre | `git status --short --branch` |
| Divergence | 0 commit local non poussé; 0 commit distant connu non récupéré | `git rev-list --left-right --count HEAD...@{u}` → `0 0`; confirmé aussi par `ls-remote` |
| Branches | seulement `main` et `remotes/origin/main` | `git branch -a -vv` |
| Remote | `origin` → `https://github.com/davson1504-ai/ecole-vendeurs-race.git` | `git remote -v` |
| Historique | 2 commits seulement | `git log -20` |
| Issues référencées | aucune référence `#n`, `GH-n` ou URL d’issue dans les deux commits | inspection des sujets récents |
| Secrets suivis | aucun `.env.local`; seul `.env.example` est suivi | `git ls-files` et recherche de noms sensibles |
| État final attendu | ce rapport doit être le seul fichier non suivi | `git status --short` après création |

Le dépôt suivi pèse environ 529 Ko; `.git` environ 278 Ko. Les plus gros fichiers suivis sont `package-lock.json` (238 Ko), `update-supabase-schema-workflow-final.sh` (61,7 Ko) et `supabase/EDVR_SUPABASE_SCHEMA_V2.sql` (58,6 Ko). Aucun binaire média volumineux n’est suivi.

## 3. Architecture et technologies

| Domaine | État réel |
|---|---|
| Framework | Next.js 16.2.12, App Router, React 19.2.4 |
| Langage | TypeScript 5.9.3, mode `strict`, `noEmit` |
| UI | Tailwind CSS 4, `lucide-react`, composants maison; aucune bibliothèque d’animation |
| Données | Supabase JS 2.110.8 et `@supabase/ssr` 0.12.3, mais UI métier majoritairement alimentée par des données codées en dur |
| Validation | Zod installé mais aucune utilisation trouvée |
| Utilitaires | `clsx`, `tailwind-merge` |
| Auth | actions serveur email/mot de passe et OAuth, callback et proxy de rafraîchissement; rôles contrôlés dans `profiles` |
| Paiement | CinetPay annoncé, mais aucune intégration opérationnelle |
| Tests | aucun framework ni fichier de test applicatif |
| Déploiement | aucun `vercel.json`, Dockerfile ou workflow CI; configuration Next vide |

Scripts disponibles dans `package.json` : `dev`, `build`, `start`, `lint`. Aucun script `typecheck`, `test`, `format`, migration ou seed. Les versions applicatives sont verrouillées dans `package-lock.json`, mais plusieurs paquets extraneous sont présents dans `node_modules` (`@emnapi/*`, `@napi-rs/*`, `@tybys/*`). `npm ls --depth=0` retourne néanmoins 0.

Structure principale :

```text
src/app/                  App Router : 14 pages et 7 Route Handlers
src/components/           marque, navigation, auth, cartes
src/lib/                  auth, clients Supabase, constantes, données de démo
supabase/migrations/      seulement 0001 et 0002
supabase/*.sql            schémas autonomes non intégrés à la chaîne de migrations
public/                   5 SVG génériques inutilisés
proxy.ts                  rafraîchissement de session Supabase
```

Les variables attendues, sans valeurs, sont : `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_SECRET_KEY`, `CINETPAY_MODE`, `CINETPAY_NOTIFY_URL`, `CINETPAY_RETURN_URL`. `.env.local` est correctement ignoré. La clé `NEXT_PUBLIC_SUPABASE_ANON_KEY` reste une convention legacy; elle est publiquement exposée par conception et doit être protégée par RLS, tandis que `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais atteindre le navigateur.

## 4. Inventaire des routes

| Route | Fonction | Accès attendu / réel | Source | Données | État | Priorité |
|---|---|---|---|---|---|---|
| `/` | accueil commercial | public / public | `src/app/page.tsx` | `featuredCourses` locales | partielle | P1 |
| `/formations` | catalogue | public / public | `src/app/formations/page.tsx` | 5 cours locaux | maquette | P1 |
| `/formations/[slug]` | détail formation | public / public | `src/app/formations/[slug]/page.tsx` | cours local par slug | maquette | P1 |
| `/connexion` | connexion | public | `src/app/(auth)/connexion/page.tsx` | Supabase Auth | partielle | P1 |
| `/inscription` | inscription | public | `src/app/(auth)/inscription/page.tsx` | Supabase Auth | partielle | P1 |
| `/dashboard` | espace apprenant | apprenant / auth requise dans la page | `src/app/(dashboard)/dashboard/page.tsx` | profil Supabase + cours locaux | partielle | P1 |
| `/cours/[slug]` | lecteur de cours | apprenant attendu / **public actuellement** | `src/app/cours/[slug]/page.tsx` | cours local | maquette, sécurité absente | P0 |
| `/affiliation` | espace affilié | apprenant / auth requise dans la page | `src/app/(dashboard)/affiliation/page.tsx` | profil Supabase + ventes locales | maquette | P1 |
| `/certificat` | certificat | apprenant attendu / **public** | `src/app/certificat/page.tsx` | valeurs codées en dur | maquette | P1 |
| `/paiement` | achat | apprenant attendu / public | `src/app/paiement/page.tsx` | toujours `courses[0]` | cassée fonctionnellement | P0 |
| `/paiement/retour` | résultat paiement | public | `src/app/paiement/retour/page.tsx` | aucun état serveur | maquette | P0 |
| `/admin` | dashboard admin | admin/super_admin, double contrôle | `src/app/(dashboard)/admin/page.tsx` | profil Supabase + paiements locaux | partielle | P1 |
| `/admin/formations` | gestion formations | admin/super_admin via layout | `src/app/(dashboard)/admin/formations/page.tsx` | 4 cours locaux | maquette | P1 |
| `/admin/paiements` | gestion paiements | admin/super_admin via layout | `src/app/(dashboard)/admin/paiements/page.tsx` | paiements locaux | maquette | P1 |
| `/api/health` | santé application | public | `src/app/api/health/route.ts` | aucune | partielle (expose timestamp/nom) | P2 |
| `/api/health/supabase` | santé REST Supabase | public | `src/app/api/health/supabase/route.ts` | requête REST `courses` | partielle | P2 |
| `/api/admin/verification` | contrôle accès admin/RLS | admin | `src/app/api/admin/verification/route.ts` | `profiles`, `admin_logs` | partielle | P1 |
| `/api/paiement/simulation` | simule paiement | public | `src/app/api/paiement/simulation/route.ts` | réponse codée en dur | maquette dangereuse | P0 |
| `/api/webhooks/cinetpay` | webhook CinetPay | public | `src/app/api/webhooks/cinetpay/route.ts` | corps/token lus, non vérifiés | cassée fonctionnellement | P0 |
| `/auth/callback` | callback OAuth/email | public | `src/app/auth/callback/route.ts` | Supabase Auth + `profiles` | partielle | P1 |
| `/auth/deconnexion` | déconnexion | session | `src/app/auth/deconnexion/route.ts` | Supabase Auth | partielle | P2 |

Routes explicitement absentes : `/a-propos`, `/progression`, `/profil`, pages de quiz, exercice et évaluation, gestion admin utilisateurs, gestion détaillée modules/leçons, page d’erreur personnalisée, `loading.tsx`, `error.tsx`, `not-found.tsx`. Le build génère seulement le `_not-found` par défaut.

## 5. État des pages

| Page | Composants / données | Contenu | Problème principal | Preuve |
|---|---|---|---|---|
| Accueil | `PublicHeader`, `SiteFooter`, `PlaceholderImage`, 3 cours locaux | provisoire | hero sans photo, témoignages fictifs, mention « MVP » visible | `src/app/page.tsx:14,26,53-79` |
| Catalogue | cartes locales, filtres visuels | provisoire | recherche et catégories sont des `span`, aucune interaction; affiche 5 cours | `src/app/formations/page.tsx:19-31` |
| Détail formation | cours local, curriculum | provisoire | achat sans slug, instructeur générique, vidéo/formateur placeholders | `src/app/formations/[slug]/page.tsx:19,25,66-68` |
| Connexion | Server Action Supabase | partiel | mot de passe oublié pointe sur `#`; états/erreurs sommaires | `src/app/(auth)/connexion/page.tsx:40-49` |
| Inscription | Server Action Supabase | partiel | image manquante; validation essentiellement HTML/serveur manuel | `src/app/(auth)/inscription/page.tsx:23` |
| Dashboard | profil réel + 4 cours locaux | mixte | inscriptions et pourcentages fictifs; pas de progression serveur | `src/app/(dashboard)/dashboard/page.tsx:17-29,57` |
| Lecteur | cours local + placeholder vidéo | provisoire | public, toujours première leçon, précédent/suivant renvoient au dashboard, aucun suivi | `src/app/cours/[slug]/page.tsx:13,25,46,63-64` |
| Affiliation | profil réel + ventes/stats locales | provisoire | chiffres, ventes et lien de parrainage non validés métier | `src/app/(dashboard)/affiliation/page.tsx:9-22,124-125` |
| Certificat | carte statique | provisoire | public; PDF non généré (`href="#"`) | `src/app/certificat/page.tsx:5-23` |
| Paiement | premier cours local | provisoire | options non sélectionnables, promo inactive, succès simulé | `src/app/paiement/page.tsx:6,21-33,45` |
| Retour paiement | texte statique | provisoire | ignore le paramètre et l’état serveur | `src/app/paiement/retour/page.tsx:4` |
| Admin | métriques/paiements locaux | provisoire | données métier fictives | `src/app/(dashboard)/admin/page.tsx:5,85` |
| Admin formations | 4 cours locaux | provisoire | aucune action CRUD, boutons décoratifs | `src/app/(dashboard)/admin/formations/page.tsx:43-54` |
| Admin paiements | paiements locaux | provisoire | « Voir détails » sans action | `src/app/(dashboard)/admin/paiements/page.tsx:57` |

Navigation : `PublicHeader` masque la navigation principale sur mobile sans menu de remplacement (`src/components/brand.tsx:35-52`). Plusieurs pages utilisent des en-têtes différents, ce qui crée une incohérence. Les formulaires d’auth ont un état pending, mais aucune UI globale de chargement, erreur ou notification n’existe.

Accessibilité : bonne présence générale de texte visible et de focus via contrôles natifs, mais les faux boutons/filtres en `span`, les radios dessinées sans `<input>`, les liens `#`, l’absence de navigation mobile et les SVG sociaux décoratifs réduisent l’accessibilité. Aucun `next/image` ni `<img>` n’existe, donc aucun `alt` cassé aujourd’hui; tous les futurs médias devront en recevoir un. Les contrastes exacts et débordements restent non vérifiés par outil visuel.

SEO : seulement un titre et une description globaux (`src/app/layout.tsx:5-8`); pas de titres par page, `metadataBase`, canonical, Open Graph, Twitter cards, sitemap ou robots. Un favicon existe (`src/app/favicon.ico`).

## 6. Inventaire des images présentes

| Fichier | Taille | Utilisation | Verdict |
|---|---:|---:|---|
| `public/file.svg` | 391 o | 0 | inutilisé, reliquat Create Next App |
| `public/globe.svg` | 1 035 o | 0 | inutilisé |
| `public/next.svg` | 1 375 o | 0 | inutilisé |
| `public/vercel.svg` | 128 o | 0 | inutilisé |
| `public/window.svg` | 385 o | 0 | inutilisé |
| `src/app/favicon.ico` | 25 931 o | favicon automatique | utilisé, identité générique à valider |

Commandes : `Get-ChildItem public -Recurse -File`, hachage SHA-256, puis `rg -F <nom>` hors `public`. Aucun JPG, JPEG, PNG, WebP ou AVIF n’est présent. Aucun fichier ni référence contenant `melvin`, `lbbb`, `WhatsApp Image`, `hero-home`, `about`, `team`, `founder` ou `mentor` n’a été trouvé.

Les quatre photos fournies décrites dans la demande ne sont donc **pas présentes dans le dépôt et pas référencées par le code**. Leur contenu visuel ne peut pas être évalué sans fichiers sources.

## 7. Images manquantes ou incorrectes

Le composant `PlaceholderImage` (`src/components/brand.tsx:97-105`) produit seulement un fond CSS décoratif et une icône. Il ne réserve pas une véritable image optimisée. Les 9 appels source produisent jusqu’à 25 emplacements rendus avec les 5 formations locales.

| Route / section | Composant et preuve | Actuel / problème | Fonction et sujet recommandés | Orientation / ratio | Format / nom | Alt proposé | Client / libre | Priorité |
|---|---|---|---|---|---|---|---|---|
| `/` hero | `PlaceholderImage`, `src/app/page.tsx:26` | placeholder | portrait fondateur Melvin en situation professionnelle | portrait cadrable paysage, 4:3 ou 5:4, ≥1600×1280 | WebP/AVIF, `home/melvin-hero.webp` | « Melvin, fondateur de l’École des Vendeurs, en costume » | photo client prioritaire | P1 |
| `/` 3 formations | `page.tsx:55` | 3 placeholders | couvertures distinctes vente, négociation, prospection | paysage 16:9, 1200×675 | WebP, `courses/<slug>-cover.webp` | titre de chaque formation | client possible, sinon libre | P1 |
| `/inscription` panneau | `inscription/page.tsx:23` | placeholder | groupe de vendeurs/communauté africaine | portrait 4:5, ≥1200×1500 | WebP/AVIF, `auth/sales-community.webp` | « Communauté de professionnels de la vente en formation » | libre de droits ou client | P2 |
| `/formations` cartes | `formations/page.tsx:33` | 5 placeholders | couverture propre à chaque formation | paysage 16:9 | WebP, `courses/<slug>-cover.webp` | titre de chaque formation | idem accueil | P1 |
| `/formations/[slug]` présentation | `formations/[slug]/page.tsx:19` | 5 placeholders potentiels | miniature vidéo/couverture | paysage 16:9, 1280×720 | WebP, `courses/<slug>-intro.webp` | « Présentation de la formation <titre> » | client ou libre | P1 |
| `/formations/[slug]` formateur | `formations/[slug]/page.tsx:66` | 5 placeholders potentiels; nom fictif | portrait de l’intervenant réel | portrait 4:5, 1000×1250 | WebP, `team/<prenom-nom>-mentor.webp` | « <Nom>, formateur en vente » | photo client prioritaire | P1 |
| `/cours/[slug]` lecteur | `cours/[slug]/page.tsx:46` | 5 placeholders potentiels; aucune vidéo | ressource pédagogique ou vignette vidéo | paysage 16:9, 1280×720 | WebP pour poster, vidéo externe/Storage séparée | « Illustration de la leçon <titre> » | client/libre selon contenu | P1 |
| `/admin/formations` miniatures | `admin/formations/page.tsx:45` | 4 placeholders | réutiliser les couvertures cours | paysage 16:9, affichage 96×80 | WebP, mêmes fichiers cover | titre du cours | réutilisation | P2 |
| Témoignages accueil | `page.tsx:72-79` | aucune image ni preuve sociale | avatars uniquement si témoignages réels et consentis | carré 1:1, 400×400 | WebP, `testimonials/<nom>.webp` | « Portrait de <nom> » | client uniquement | P2 |

Images cassées : **0**. Il n’existe aucune référence vers un fichier réel absent ou une URL distante. Ce chiffre ne signifie pas que l’imagerie est complète : elle est remplacée par des placeholders.

Qualité : aucun poids/ratio/qualité de photo ne peut être mesuré. Lors de l’intégration, conserver les originaux hors `public`, produire WebP/AVIF raisonnablement compressés, fournir `sizes`, dimensions explicites et priorité seulement au hero LCP. Utiliser `next/image` conformément au guide local Next.js 16.

## 8. Proposition d’organisation des médias

```text
public/images/
├── brand/               logo, symboles, Open Graph
├── home/                hero et témoignages validés
├── about/               histoire et photos institutionnelles
├── team/                fondateur, mentors, intervenants
├── courses/             couvertures et posters de cours
├── lessons/             illustrations pédagogiques
└── placeholders/        fallback explicite, non contenu final
```

Noms recommandés :

| Photo décrite | Destination proposée | Nom recommandé | Usage à valider |
|---|---|---|---|
| Melvin, lunettes et costume (troisième photo transmise) | `images/home/` et éventuellement dérivé `team/` | `melvin-hero.webp`, `melvin-founder.webp` | hero accueil prioritaire |
| Femme en veste noire | `images/team/` | `<prenom-nom>-mentor.webp` | mentor/intervenante, avec identité et consentement |
| Homme maquillage artistique, cape et lance | `images/about/` ou campagne | `<prenom-nom>-creative-portrait.webp` | à confirmer : l’imagerie peut être incohérente avec une plateforme de vente |
| Homme en chemise marron | `images/team/` | `<prenom-nom>-mentor.webp` | équipe/mentor après validation de rôle |

Ne jamais conserver les noms WhatsApp, espaces, accents ou dates. Créer des dérivés plutôt que d’écraser les originaux. Documenter droits, crédit, consentement et date d’expiration éventuelle.

## 9. État des formations

| Élément | Local UI | Schéma/migrations | Distant | Verdict |
|---|---|---|---|---|
| Structure `courses` | type TS simple | présente dans `0001`; modèle différent dans V2 | non vérifiable | incohérent |
| Quatre formations demandées | les 4 premières existent | un script legacy contient des seeds, V2 doit être vérifié | non vérifiable | partiel |
| Nombre réel local | **5** (ajout `leadership-commercial`) | non représentatif du distant | non vérifiable | incohérent avec « quatre » |
| Ordre | ordre du tableau TS | `position`/prérequis seulement dans V2 autonome | non vérifiable | partiel |
| Prérequis | absent | `prerequisite_course_id` uniquement dans V2 | non vérifiable | absent de l’app |
| Publication | toutes visibles sans statut | `status` dans `0001` | non vérifiable | incohérent |
| Prix | présents et codés en dur | contraintes XOF dans `0001` | non vérifiable | partiel |
| Couvertures | absentes | champs `cover_url`/`cover_image_url` divergent | non vérifiable | absent |
| Modules/leçons | titres seulement dans TS | tables présentes; V2 restructure en steps | non vérifiable | partiel |
| Exercices/quiz/évaluation | absents de l’app | tables seulement dans V2 autonome | non vérifiable | absent/non appliqué |
| Progression | pourcentages fictifs | `lesson_progress` dans `0001`; moteur enrichi V2 | non vérifiable | incohérent |
| Déverrouillage | absent | seulement V2 autonome | non vérifiable | absent |
| Relation utilisateurs | aucune inscription UI réelle | `enrollments` dans `0001` | non vérifiable | partiel |
| RLS | dépend du serveur | tables activées mais politiques métier absentes de `0001` | non vérifiable | critique |

Les quatre premières formations locales sont : Devenir vendeur professionnel, Négociation commerciale avancée, Prospection B2B efficace, Techniques de closing (`src/lib/demo-data.ts:15-85`). La cinquième, Leadership commercial, est à `:86-101`. Elles ont des modules/titres, pas de vrais contenus de leçon, exercices ou quiz.

## 10. État des cours et contenus

Il n’existe **aucun cours complet de démonstration**. Le lecteur affiche la première leçon d’un tableau local et du texte générique, sans persistance ni contenu séquencé (`src/app/cours/[slug]/page.tsx:13-64`).

Le dossier `supabase/migrations` ne contient que la structure initiale et une migration de rôles. `supabase/EDVR_SUPABASE_SCHEMA.sql`, `EDVR_SUPABASE_SCHEMA_V2.sql` et le script shell contiennent davantage de tables, politiques et seeds, mais ne constituent pas l’historique de migration réellement applicable. Leur présence n’établit ni leur application distante ni leur cohérence mutuelle.

Éléments métier : introduction partielle (description), leçons texte réelles absentes, ressource visuelle absente, exercice absent, quiz absent, évaluation finale absente, séquencement absent, reprise absente, progression serveur absente.

## 11. État de la progression

`/progression` est absente du système de fichiers et de la table des routes du build. Aucun moteur associé n’est appelé par l’application.

| Contrôle | État |
|---|---|
| chemin vertical/zigzag | absent |
| responsive du parcours | absent |
| terminé/courant/verrouillé | affichages isolés et fictifs dans le lecteur; aucune logique |
| payé mais prérequis en attente | absent |
| disponible à l’achat | catalogue public sans état de parcours |
| « Continuer mon parcours » | absent; dashboard dit « Continuer la formation » |
| persistance serveur | absente de l’application |
| anti-falsification navigateur | non applicable/absente |
| loading/vide/erreur | absent |
| accessibilité/performance mobile | non vérifiable puisque page absente |

Le schéma V2 propose `course_enrollments`, `course_step_progress`, des statuts et des fonctions de contrôle, mais ce fichier n’est pas une migration. Il faut d’abord unifier le modèle, puis calculer côté serveur la prochaine étape autorisée.

## 12. État des animations

Animations fonctionnelles métier : **aucune**. Aucun Framer Motion, CSS keyframes ou View Transitions n’a été trouvé. Les seules transitions sont décoratives (`transition`, `hover:*`) sur boutons/liens et cartes; elles n’ont aucun lien serveur. Absents : validation, complétion, déverrouillage, progression de chemin, reprise, feedback de quiz. Le respect de `prefers-reduced-motion` n’est pas traité.

## 13. État de Supabase et des RLS

### État local

`0001_initial_schema.sql` crée 10 tables métier (`profiles`, `courses`, `modules`, `lessons`, `products`, `orders`, `payments`, `enrollments`, `affiliates`, `commissions`), active RLS sur 8 tables seulement et ne crée **aucune policy**. `modules` et `lessons` ne reçoivent même pas `enable row level security` dans cette migration (`supabase/migrations/0001_initial_schema.sql:112-119`). Le trigger profil utilise `raw_user_meta_data` uniquement pour `full_name`, pas pour une autorisation (`:121-128`), ce qui est acceptable pour ce champ mais doit rester sans rôle.

`0002_secure_auth_admin_roles.sql` est incompatible avec `0001` :

- `profiles.role` est un enum `app_role` contenant `learner`, `affiliate`, `admin`, `super_admin` (`0001:3,14`), mais `0002:7-11` utilise `apprenant` et `student`;
- `0002:17-18` tente une contrainte texte sur l’enum sans faire évoluer le type;
- `0002:25-32` accorde l’update sur `first_name`, `last_name`, `avatar_url`, `last_activity_at`, colonnes absentes de `0001`.

Une installation neuve doit donc échouer sur `0002` avant même la sécurisation attendue. C’est un P0 confirmé par inspection SQL.

### Schémas parallèles

Le V2 autonome définit un modèle bien plus large : steps, quiz, questions/réponses, tentatives, progression, prérequis, commandes/paiements, logs et nombreuses policies. Toutefois :

- il utilise le rôle `student` alors que l’application attend `apprenant` (`src/lib/auth/authorization.ts:6`);
- plusieurs fonctions `SECURITY DEFINER` sont dans `public`; leurs droits `EXECUTE`, `search_path` et vérifications internes doivent être audités avant exposition;
- l’état d’application distant et les grants Data API sont non vérifiables;
- le schéma legacy et le V2 divergent sur noms de tables/colonnes (`modules` vs `course_steps`, `enrollments` vs `course_enrollments`, `cover_url` vs `cover_image_url`).

### Application

Le proxy met à jour les cookies et protège certains chemins, mais la défense réelle repose sur les pages/layouts et RLS. Le layout `/admin` appelle `requireAdmin` (`src/app/(dashboard)/admin/layout.tsx:6-7`). Le dashboard et l’affiliation font leurs propres contrôles. En revanche `/cours/[slug]`, `/certificat` et `/paiement` ne vérifient ni session, ni inscription, ni achat. Le service role n’est importé que dans un helper serveur, sans appel trouvé; il n’est pas exposé au client.

### Distant

Le test `./test-supabase-connection.ps1` retourne 1 avant tout appel REST : `SUPABASE_SERVICE_ROLE_KEY` manque. On ne peut donc confirmer ni tables, ni policies, ni Storage, ni quatre formations, ni comptes de test. Le script exige inutilement la clé service role pour des lectures anon; cela devra être amélioré plus tard, pas pendant cet audit.

Storage : un bucket `course-files` et ses policies existent dans le schéma legacy autonome, mais pas dans les migrations appliquables; état distant non vérifiable. Aucune URL publique/signée n’est utilisée par l’application.

## 14. Résultats TypeScript, ESLint, build et tests

| Contrôle | Commande | Résultat | Preuve résumée |
|---|---|---|---|
| Installation | présence `node_modules`, `package-lock`, `npm ls --depth=0` | OK avec paquets extraneous | exit 0 |
| TypeScript | `npx tsc --noEmit --pretty false` | **réussi** | exit 0, aucune sortie |
| ESLint | `npm run lint` | **réussi** | exit 0, aucun warning |
| Build | `npm run build` | **réussi** | Next 16.2.12, compilation et 15 pages statiques générées |
| Tests unitaires/intégration/E2E | découverte `rg --files -g '*test*' -g '*spec*'` | **absents** | seul script de connexion PowerShell |
| Connexion Supabase | `./test-supabase-connection.ps1` | **bloquée** | variable serveur manquante; exit 1 |
| Test manuel navigateur | navigateur intégré | **non vérifiable** | défaut de l’outil de session; aucune affirmation visuelle |
| Santé locale | GET `http://127.0.0.1:3010/api/health` | **réussi** | JSON `ok:true` |

Le build prouve la compilabilité et la génération des routes, pas le fonctionnement métier, les rôles, les paiements ou la progression.

## 15. État de préparation au déploiement

| Domaine | État | Blocage |
|---|---|---|
| dépendances/build | prêt techniquement | non |
| variables locales | Supabase public présent, service role absent; CinetPay non validé | oui pour fonctions serveur/démo |
| migrations | chaîne incohérente | **oui P0** |
| domaines/callbacks auth | aucune preuve de configuration Supabase distante | oui P1 |
| paiement/webhook | simulation uniquement | **oui P0** |
| données démo | locales seulement; comptes distants inconnus | oui P1 |
| images | toutes manquantes, 5 reliquats inutilisés | oui P1 pour démo client |
| contenu pédagogique | aucun cours complet | oui P1 |
| progression | absente | oui P1 |
| sécurité routes | lecteur/certificat/paiement publics | oui P0/P1 |
| observabilité | health minimal; pas de monitoring | P2 |
| Vercel/hébergeur | aucune liaison/config versionnée vérifiable | P1 |
| fichiers sensibles | `.env.local` ignoré | OK |

Un déploiement technique pourrait compiler, mais ne doit pas être présenté comme une plateforme fonctionnelle. Il ne faut pas configurer Vercel avant d’avoir une migration reproductible et des données de démonstration maîtrisées.

## 16. Problèmes bloquants

| ID | Priorité | Problème | Preuve | Effet |
|---|---|---|---|---|
| B-01 | P0 | migrations `0001`/`0002` incompatibles | `0001:3,14`; `0002:7-18,25-32` | installation neuve non reproductible |
| B-02 | P0 | paiement et webhook simulés/non authentifiés | `paiement/page.tsx:45`; simulation handler; webhook `route.ts:2-11` | faux succès, aucun droit d’accès fiable |
| B-03 | P0 | lecteur de cours accessible sans session/inscription/prérequis | `cours/[slug]/page.tsx:9-64` | contournement du paywall et du parcours |
| B-04 | P1 | état Supabase distant/RLS/données non vérifiable | test connexion exit 1 | impossibilité de certifier sécurité et démo |
| B-05 | P1 | aucun cours complet, quiz, évaluation ni progression | absence de routes/fichiers | promesse produit non démontrable |
| B-06 | P1 | 25 emplacements visuels restent des placeholders | appels `PlaceholderImage` | démo non présentable |
| B-07 | P1 | données métier admin/apprenant codées en dur | `src/lib/demo-data.ts` et pages dashboard/admin | résultats trompeurs |
| B-08 | P1 | aucune suite de tests ni comptes de test documentés | `package.json`, recherche tests | régressions et rôles non certifiés |
| B-09 | P1 | callbacks/domaines/auth OAuth non vérifiés | configuration distante indisponible | connexion déployée incertaine |

Totaux : **3 problèmes P0** et **6 problèmes P1** dans cette classification de blocage.

## 17. Problèmes non bloquants

| Priorité | Problème | Preuve |
|---|---|---|
| P2 | navigation mobile sans menu | `src/components/brand.tsx:35-52` |
| P2 | aucune page loading/error/not-found personnalisée | recherche des conventions de fichiers vide |
| P2 | SEO limité aux métadonnées globales | `src/app/layout.tsx:5-8` |
| P2 | cinq SVG Create Next App inutilisés | inventaire `public` |
| P2 | incohérence d’en-têtes et styles | `SiteHeader` et `PublicHeader` coexistent |
| P2 | Zod installé mais inutilisé | recherche des imports |
| P2 | états vides/notifications absents | inspection pages |
| P2 | health Supabase public divulgue des détails d’erreur | `api/health/supabase/route.ts:38` |
| P2 | paquets extraneous dans `node_modules` | `npm ls --depth=0` |
| P3 | favicon/brand assets à finaliser | `src/app/favicon.ico` |

## 18. Plan de correction priorisé

| Ordre / phase | Objectif et tâches | Fichiers/dossiers | Dépendances / risques | Validation | Charge / blocant | Issue recommandée | Commit proposé |
|---|---|---|---|---|---|---|---|
| 1 — Sécuriser Git | relire rapport, ouvrir branche dédiée, figer état et conventions; ne pas embarquer backups | Git, docs | validation du modèle cible | worktree maîtrisé, PR dédiée | faible / bloquant | `chore: cadrer la reprise technique` | `chore: cadrer la reprise avant stabilisation` |
| 2 — Corriger les blocages | choisir vocabulaire rôles/modèle; créer migrations incrémentales reproductibles; protéger cours/paiement; retirer simulation publique | `supabase/migrations`, auth, API paiement, pages protégées | accès projet Supabase + sauvegarde; risque données existantes | reset local neuf, migration list, tests RLS, build | forte / bloquant | `fix: rendre le schéma et les accès reproductibles` | `fix: unifier le schéma et sécuriser les accès` |
| 3 — Photos client | collecter originaux/droits, sélectionner, recadrer, nommer, organiser | `public/images/home`, `about`, `team` | fichiers sources et consentements | revue visuelle 3 tailles, poids/LCP | moyenne / bloquant démo | `feat: intégrer les portraits clients` | `feat: intégrer les médias fournis` |
| 4 — Images manquantes | produire couvertures/posters/fallbacks; `next/image`, sizes, alt, OG | `public/images/courses`, pages publiques | direction artistique | audit chemins, Lighthouse, aucun placeholder | moyenne / bloquant démo | `feat: finaliser les visuels du catalogue` | `feat: ajouter les visuels optimisés` |
| 5 — Cours démo | créer modèle et seed contrôlé, contenus, exercice, quiz, final | migrations/seed, admin, lecteur | phases 1-2 | scénario complet en base neuve | forte / bloquant | `feat: cours démo fondamentaux vente moderne` | `feat: ajouter le cours de démonstration` |
| 6 — Parcours/animations | créer `/progression`, calcul serveur, états, transitions accessibles | nouvelle route, composants progression, actions serveur | cours démo + règles métier | E2E verrouillage/reprise; reduced motion | forte / bloquant démo | `feat: parcours progressif sécurisé` | `feat: implémenter le parcours de progression` |
| 7 — Tests rôles/progression | unitaires, intégration RLS, E2E apprenant/admin/super_admin | tests, CI | environnement de test isolé | matrice autorisations verte | forte / bloquant | `test: couvrir rôles et progression` | `test: couvrir les parcours critiques` |
| 8 — Données démo | seed idempotent, comptes dédiés, scénarios payé/verrouillé/terminé | seed/scripts/doc | politique secrets; environnement dédié | remise à zéro reproductible | moyenne / bloquant démo | `chore: préparer les données de démonstration` | `chore: ajouter le jeu de démonstration` |
| 9 — Déploiement | lier projet, renseigner env, callbacks, CinetPay sandbox, migrations, preview puis production | Vercel/Supabase/CinetPay | phases précédentes; rollback | preview verte, smoke tests, logs propres | forte / bloquant | `ops: préparer le déploiement` | `chore: préparer la configuration de déploiement` |
| 10 — Post-déploiement | smoke/E2E, mobiles, paiement sandbox, logs, rollback, validation client | environnement déployé | phase 9 | checklist signée | moyenne / bloquant lancement | `test: recette après déploiement` | `test: valider la recette de production` |

## 19. Plan d’intégration des images

1. Obtenir les quatre originaux, l’identité/rôle des personnes, leur consentement et les droits d’usage.
2. Valider Melvin comme hero; tester un recadrage portrait et un recadrage 4:3 sans texte incrusté.
3. Définir un traitement colorimétrique commun (bleu nuit/or), sans dégrader les carnations.
4. Exporter WebP et éventuellement AVIF; conserver les originaux hors dépôt public.
5. Produire les couvertures 16:9 des formations avec un gabarit cohérent.
6. Intégrer via `next/image`, dimensions, `sizes`, `alt`; précharger seulement le hero.
7. Tester 360, 768, 1024 et 1440 px, mode réseau lent, CLS et LCP.
8. Supprimer les placeholders et SVG inutilisés seulement après validation séparée.

## 20. Plan du cours de démonstration

Titre provisoire : **Les fondamentaux de la vente moderne**.

| Étape | Type | Contenu/test couvert | Déverrouillage |
|---:|---|---|---|
| 1 | introduction | objectifs, durée, règles, diagnostic initial | inscription active |
| 2 | leçon texte | posture et éthique du vendeur moderne | après introduction |
| 3 | leçon texte + visuel | comprendre persona, besoin, douleur; carte visuelle | après étape 2 |
| 4 | exercice | rédiger cinq questions de découverte; sauvegarde brouillon | après étape 3 |
| 5 | leçon texte | proposition de valeur et argumentaire | exercice soumis |
| 6 | quiz | 5 questions, seuil 80 %, feedback, nouvelle tentative | après étape 5 |
| 7 | leçon texte | objections et conclusion | quiz réussi |
| 8 | mise en situation | choix de réponses face à une objection prix | après étape 7 |
| 9 | évaluation finale | 10 questions + mini-cas, score persistant | toutes étapes précédentes |
| 10 | clôture | résultat, certificat si réussite, prochaine formation | final réussi |

Chaque mutation de progression doit être une action serveur qui recalcule l’éligibilité depuis la base; le client ne doit jamais envoyer un pourcentage ou un statut faisant autorité. Prévoir reprise via `current_step_id`, idempotence, horodatage, tentative et audit.

## 21. Plan de tests

| Couche | Cas minimum |
|---|---|
| migrations | base vide → toutes migrations; données existantes → upgrade; rollback documenté |
| RLS anon | seulement formations publiées et previews autorisées; aucun profil/paiement/progrès |
| RLS apprenant | propre profil/champs permis, propres inscriptions/progrès, aucun autre utilisateur |
| RLS admin | gestion métier prévue, sans capacité super_admin réservée |
| super_admin | opérations de rôle explicitement auditées et journalisées |
| auth | inscription, confirmation, connexion, OAuth, logout, lien expiré, reset password |
| achat | bon cours/bon montant, abandon, refus, callback dupliqué, signature invalide |
| parcours | verrouillé, disponible, réussite/échec, reprise autre appareil, concurrence, falsification |
| contenu | texte, image, PDF/vidéo autorisée, ressource absente, alt |
| UI | 360/768/1024/1440, clavier, focus, reduced motion, contrastes, erreurs/vides/loaders |
| E2E | public → inscription → achat sandbox → cours → quiz → certificat; admin → publication |
| non-régression | TypeScript, ESLint, build, tests en CI sur chaque PR |

## 22. Procédure de déploiement recommandée

1. Corriger et tester la chaîne de migrations sur un projet Supabase local/éphémère; sauvegarder l’existant distant avant toute intervention.
2. Comparer schéma distant et migrations (`migration list`, diff en lecture), puis produire une migration de convergence relue.
3. Créer un projet de staging distinct; appliquer migrations et seed de démonstration idempotent.
4. Configurer variables Vercel par environnement sans valeur dans Git; vérifier URL publique Supabase, clé publishable/anon, secrets serveur CinetPay et service role strictement serveur.
5. Configurer Site URL et redirect URLs Supabase pour localhost, preview contrôlée et domaine final.
6. Configurer CinetPay en sandbox : notify URL HTTPS, return URL, signature/secret, idempotence et vérification serveur du montant/commande.
7. Déployer une preview, exécuter la matrice de tests et vérifier logs/réseau/console/SEO/mobile.
8. Geler les changements, planifier rollback, appliquer migration production, déployer puis lancer les smoke tests.
9. Ne promouvoir publiquement qu’après validation paiement, rôles, parcours et médias.

## 23. Checklist avant démonstration client

- [ ] schéma distant identifié, sauvegardé et aligné aux migrations;
- [ ] 3 P0 et 6 P1 de ce rapport fermés ou acceptés explicitement;
- [ ] quatre formations finales confirmées, ordonnées, publiées et tarifées;
- [ ] cours « Les fondamentaux de la vente moderne » complet;
- [ ] `/progression` fonctionnelle, persistante et non falsifiable;
- [ ] compte apprenant aux états nouveau/en cours/terminé;
- [ ] compte admin et super_admin séparés;
- [ ] paiement sandbox réussi, refusé et callback dupliqué testés;
- [ ] photos client validées juridiquement et visuellement;
- [ ] aucun placeholder ni texte « bientôt », « MVP » ou donnée fictive visible;
- [ ] reset password, OAuth choisi et callbacks testés;
- [ ] responsive/clavier/contraste/alt/loaders/erreurs validés;
- [ ] TypeScript, ESLint, build, unitaires, intégration et E2E verts;
- [ ] preview relue sur appareils réels;
- [ ] monitoring et procédure de rollback prêts.

## 24. Conclusion et prochaine action exacte

Le socle front compile et les bases de l’authentification sont présentes, mais le dépôt est encore une maquette fonctionnelle partielle. L’écart entre les migrations, les schémas SQL parallèles et le vocabulaire de rôles empêche de considérer la donnée comme sûre ou reproductible. L’imagerie et le cœur pédagogique restent à construire.

**Prochaine action exacte recommandée :** faire relire ce rapport, puis ouvrir une issue P0 et une branche dédiée pour reproduire l’application de `supabase/migrations/0001_initial_schema.sql` puis `0002_secure_auth_admin_roles.sql` sur une base Supabase jetable, choisir définitivement le vocabulaire de rôles et le modèle V2, et produire une migration de convergence testée — avant toute intégration d’image, création de cours ou tentative de déploiement.

### Résumé terminal demandé

```text
Branche active                         main
SHA local                              4c97f214bd6d9c5e4bd8e7179c89edde0aa45e2d
SHA distant                            4c97f214bd6d9c5e4bd8e7179c89edde0aa45e2d
Worktree avant rapport                 propre
Routes analysées                       21 (14 pages + 7 handlers)
Pages incomplètes                      14
Emplacements d’images manquantes       25 rendus potentiels (9 appels source)
Images cassées                         0
Images inutilisées                     5
Quatre formations                      présentes localement parmi 5; distant non vérifiable
Cours de démonstration                 absent
/progression                            absente
TypeScript                              réussi (exit 0)
ESLint                                  réussi (exit 0)
Build                                   réussi (exit 0)
Tests                                   absents; test connexion Supabase bloqué (exit 1)
Problèmes P0                            3
Problèmes P1                            6
Verdict                                 NON DÉPLOYABLE pour démonstration client
Prochaine action                        reproduire/corriger les migrations sur une base jetable
```
