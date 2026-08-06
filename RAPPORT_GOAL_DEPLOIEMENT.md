# Rapport du goal de déploiement

## État

L’application locale n’utilise plus `demo-data.ts` dans les parcours principaux. Architecture finale : Next.js 16.3.0 App Router, Supabase SSR/RLS, Server Actions centralisées par `requireAdmin`, Node 22.x.

Migration ajoutée : `20260805235140_complete_learning_platform.sql`. Tables utilisées : profiles, courses, modules, lessons, enrollments, lesson_progress et admin_logs. Policies : catalogue publié, modules publiés, aperçus publics, contenu complet par enrollment actif, progression propriétaire, CRUD formation/inscription réservé aux admins actifs, rôles réservés au super_admin.

Seed vérifié localement et sur le staging : 3 formations, 15 modules, 30 leçons, un aperçu par formation.

Workflows : catalogue/lecteur/dashboard et administration CRUD reliés à Supabase. Création, modification, publication, archivage, réordonnancement et suppression confirmée des modules/leçons sont implémentés. Paiement, CinetPay, affiliation et certificats sont explicitement désactivés ou indiqués « bientôt disponible ».

## Validations locales

- `npm ci` : réussi ;
- `npm run lint` : réussi ;
- `npm run typecheck` : réussi le 6 août 2026 ;
- `npm run build` : réussi avec Next.js 16.3.0 le 6 août 2026 ;
- `npm test` : 9/9 réussis ;
- `npm run test:migrations` : base fraîche et legacy réussies, y compris contrôle admin/super-admin et revalidation d’enrollment ;
- vulnérabilités : 4 high avant, 0 après mise à jour compatible et `npm audit fix` non forcé.

## Déploiement

Staging Supabase validé : `ecole-vendeurs-staging` (`navpnanyltussvtlxouk`, `eu-west-1`, `ACTIVE_HEALTHY`). Les migrations distantes historiques `0001`, `0002` et `0003` ont été comparées aux fichiers locaux. Les deux migrations manquantes ont été revues et appliquées dans l’ordre : `0004_secure_business_tables_rls`, puis `20260805235140_complete_learning_platform`. Le connecteur a enregistré ces noms avec les versions plateforme `20260806011229` et `20260806011253`.

RLS est active sur les 12 tables publiques. L’activation de RLS sur `modules` et `lessons` a été déplacée dans la même transaction que la création de leurs policies. Les tests transactionnels distants couvrent public, apprenant non inscrit, apprenant inscrit, administrateur, super-administrateur, progression et interdiction d’auto-promotion.

Deux comptes de démonstration actifs ont été créés avec mots de passe aléatoires non affichés et non écrits dans le dépôt : `admin.demo@ecole-vendeurs.com` et `apprenant.demo@ecole-vendeurs.com`. L’apprenant possède une inscription active à une formation seedée.

Preview Vercel : https://ecole-vendeurs-race-jjrn48lmj-davson1504s-projects.vercel.app — cible `preview`, état `READY`, déploiement `dpl_81GhJUaYKa3raS2JqcxANyCp1w2n`. La Preview est protégée par Vercel Authentication. Le smoke HTTP authentifié passe : pages publiques, endpoint health, session SSR admin, CRUD formation/module/leçon, inscription, session SSR apprenant, lecteur privé et progression. Les données temporaires du smoke ont été supprimées et les compteurs seed ont été revérifiés.

Les advisors ne signalent aucune table publique sans RLS. Les avertissements restants portent sur les deux RPC `SECURITY DEFINER` intentionnelles et contrôlées en interne, la protection contre les mots de passe compromis à activer dans Auth, et des optimisations de policies/index à planifier.
