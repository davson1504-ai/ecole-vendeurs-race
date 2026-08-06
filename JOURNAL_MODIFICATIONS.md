# Journal des modifications

## 5 août 2026

- audit initial confirmé ;
- migration additive `20260805235140_complete_learning_platform.sql` créée via Supabase CLI ;
- modèle courses/modules/lessons/enrollments/progression complété ; RLS public/apprenant/admin ajoutée ;
- seed idempotent de 3 formations, 15 modules et 30 leçons ;
- catalogue, détail, lecteur, dashboard et administration connectés à Supabase ;
- création/modification/publication, modules, leçons, utilisateurs et inscriptions manuelles ajoutés ;
- récupération de mot de passe, validation Zod, statut actif et origine de callback durcis ;
- paiement, simulation et webhook CinetPay neutralisés ;
- Next.js 16.3.0 et dépendances compatibles ; audit npm passé de 4 high à 0 ;
- Node 22 figé, scripts typecheck/test/E2E ajoutés ;
- lint, TypeScript, build, tests applicatifs et SQL exécutés.
- édition et réordonnancement des modules/leçons complétés, avec suppressions confirmées ;
- RLS de mise à jour de progression renforcée pour revalider l’enrollment ;
- un admin simple ne peut plus activer/désactiver un super-admin ;
- second cycle complet vert le 6 août 2026 : lint, TypeScript, build, tests applicatifs, tests SQL et audit npm.
