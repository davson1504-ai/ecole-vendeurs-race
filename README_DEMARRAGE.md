# École des Vendeurs de Race — Guide de démarrage

## Dossier du projet

```
C:\Users\LENOVO\Documents\projet_lobo\ecole-vendeurs-race\
```

## Commande pour lancer le projet

```powershell
Set-Location "C:\Users\LENOVO\Documents\projet_lobo\ecole-vendeurs-race"
npm run dev
```

Le projet démarre sur **http://localhost:3000**

---

## Étape obligatoire : renseigner les clés Supabase

Le fichier `.env.local` contient des clés vides. Le projet démarre et compile, mais les pages
authentifiées (connexion, inscription, dashboard) ne fonctionneront que lorsque les clés seront renseignées.

### Où trouver les clés

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet EDVR
3. Aller dans **Project Settings → API**
4. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Renseigner le fichier `.env.local`

Éditer `C:\Users\LENOVO\Documents\projet_lobo\ecole-vendeurs-race\.env.local` :

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...votre_service_role_key

# CinetPay (optionnel pour les tests)
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_SECRET_KEY=
CINETPAY_MODE=sandbox
CINETPAY_NOTIFY_URL=http://localhost:3000/api/webhooks/cinetpay
CINETPAY_RETURN_URL=http://localhost:3000/paiement/retour
```

> ⚠️ Ne jamais committer `.env.local` dans Git (déjà dans `.gitignore`).
> ⚠️ Ne jamais utiliser `SUPABASE_SERVICE_ROLE_KEY` côté client/navigateur.

### Vérifier la connexion

Après avoir renseigné les clés et relancé `npm run dev` :

```
GET http://localhost:3000/api/health/supabase
```

Réponse attendue : `{ "ok": true, "message": "Connexion Supabase opérationnelle", ... }`

---

## Étape : installer le schéma SQL dans Supabase

Le script SQL complet du projet est dans :

```
supabase/EDVR_SUPABASE_SCHEMA_V2.sql
```

Il crée :
- **27 tables** (profiles, courses, enrollments, payments, affiliations, etc.)
- **54 politiques RLS** (sécurité ligne par ligne)
- **6 fonctions** (is_admin, is_super_admin, handle_new_user, etc.)
- **22 triggers** (updated_at automatique, création de profil à l'inscription)

### Comment l'exécuter

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet EDVR
3. Aller dans **SQL Editor**
4. Cliquer **New query**
5. Copier-coller le contenu de `supabase/EDVR_SUPABASE_SCHEMA_V2.sql`
6. Cliquer **Run**

Le script est idempotent (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`) — il peut être exécuté plusieurs fois sans erreur.

---

## Structure du projet

```
src/
├── app/
│   ├── page.tsx                    # Page d'accueil publique
│   ├── (auth)/
│   │   ├── connexion/page.tsx      # Connexion email + OAuth
│   │   ├── inscription/page.tsx    # Inscription + code affilié
│   │   └── actions.ts              # Server Actions Supabase Auth
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx      # Espace apprenant (protégé)
│   │   ├── admin/page.tsx          # Dashboard admin
│   │   └── affiliation/page.tsx    # Espace affilié
│   ├── formations/                 # Catalogue public
│   ├── cours/[slug]/               # Lecteur de cours
│   ├── paiement/                   # Page de paiement CinetPay
│   ├── certificat/                 # Aperçu certificat
│   └── api/
│       ├── health/route.ts                  # Health check app
│       ├── health/supabase/route.ts         # Test connexion Supabase
│       ├── paiement/simulation/route.ts     # Simulation paiement
│       └── webhooks/cinetpay/route.ts       # Webhook CinetPay
├── components/
│   ├── brand.tsx                   # Composants UI partagés
│   ├── site-header.tsx             # Header générique
│   └── auth/social-auth-buttons.tsx
└── lib/
    ├── supabase/
    │   ├── browser.ts              # Client côté navigateur
    │   ├── server.ts               # Client côté serveur (cookies)
    │   └── admin.ts                # Client admin (service_role, server only)
    ├── demo-data.ts                # Données simulées (à remplacer par Supabase)
    ├── constants.ts                # Constantes de l'app
    └── utils.ts                    # cn(), formatXof()
```

---

## Workflow d'authentification

1. **Inscription** → `signUpAction` → `supabase.auth.signUp` → trigger `handle_new_user` crée un profil dans `public.profiles`
2. **Connexion** → `signInAction` → `supabase.auth.signInWithPassword` → redirect `/dashboard`
3. **OAuth** → `signInWithGoogle` / `signInWithApple` → redirect Supabase → callback `/auth/callback` → session
4. **Déconnexion** → `signOutAction` → `supabase.auth.signOut` → redirect `/connexion`
5. **Middleware** → protège `/dashboard`, `/affiliation`, `/cours`, `/admin` — redirige vers `/connexion` si non connecté

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrage en mode développement (Turbopack) |
| `npm run build` | Build de production |
| `npm run start` | Démarrage du build de production |
| `npm run lint` | Vérification ESLint |
| `npx tsc --noEmit` | Vérification TypeScript |
