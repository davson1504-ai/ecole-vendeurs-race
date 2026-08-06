# Déploiement de présentation client

## Supabase staging

1. Authentifier le CLI : `npx supabase@2.111.0 login`.
2. Vérifier que le projet lié est le staging : `npx supabase@2.111.0 migration list`.
3. Appliquer uniquement `supabase/migrations/` avec la commande CLI confirmée par `npx supabase@2.111.0 db push --help`.
4. Exécuter le seed idempotent `supabase/seed.sql` sur le staging.
5. Vérifier 3 formations, 15 modules, 30 leçons et les advisors sécurité.

## Vercel Preview

- Framework : Next.js ; racine du dépôt ; `npm ci` ; `npm run build` ; sortie automatique ; Node 22.x.
- Variables : celles de `VARIABLES_VERCEL.example`, sans CinetPay et sans service role si inutile.
- Déployer avec `vercel deploy`, jamais `--prod`.
- Ajouter l’URL Preview exacte et `/auth/callback` aux Redirect URLs Supabase.
- Exécuter `npm run test:e2e` avec `PLAYWRIGHT_BASE_URL` égal à la Preview, puis la checklist.

État : accès Vercel disponible ; accès Supabase Management bloqué tant que le propriétaire n’a pas authentifié le CLI.
