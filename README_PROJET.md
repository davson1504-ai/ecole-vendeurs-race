# École des Vendeurs de Race — Phase 1 MVP

## Stack
- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase Auth / PostgreSQL / Storage
- CinetPay
- Vercel

## Lancement
```bash
cp .env.local.example .env.local
npm run dev
```

Windows PowerShell :
```powershell
Copy-Item .env.local.example .env.local
npm run dev
```

URL : http://localhost:3000

## Routes prêtes
- /
- /formations
- /formations/vendre-avec-methode
- /connexion
- /inscription
- /dashboard
- /affiliation
- /admin
- /paiement/retour
- /api/health
- /api/webhooks/cinetpay

## Prochaine étape
Créer Supabase, renseigner .env.local, exécuter supabase/migrations/0001_initial_schema.sql, puis brancher l'auth réelle.
