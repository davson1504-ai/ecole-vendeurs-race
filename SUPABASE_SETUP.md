# Connexion Supabase — École des Vendeurs de Race

## 1. Créer le projet Supabase
Créer un projet Supabase, puis récupérer :

- Project URL
- anon public key
- service_role key

À coller dans `.env.local` :

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

Ne jamais mettre `SUPABASE_SERVICE_ROLE_KEY` dans du code client.

## 2. Configurer les URL d’authentification
Dans Supabase > Authentication > URL Configuration :

- Site URL : `http://localhost:3000`
- Redirect URLs :
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**`

## 3. Exécuter le SQL
Dans Supabase > SQL Editor, copier tout le contenu de :

```txt
supabase/EDVR_SUPABASE_SCHEMA.sql
```

Puis exécuter.

## 4. Email / mot de passe
Pour accélérer en développement, tu peux désactiver temporairement la confirmation email :

Authentication > Providers > Email > Confirm email = OFF

En production, il faudra remettre une configuration propre.

## 5. Connexion Google et Apple
Les boutons sont présents dans l’interface. Pour qu’ils fonctionnent réellement :

- Google : configurer le provider Google dans Supabase avec les identifiants Google Cloud.
- Apple : Supabase utilise le provider `apple`, pas un provider séparé appelé iCloud. Côté interface, on affiche “Continuer avec Apple”.

Sans cette configuration OAuth, les boutons peuvent retourner une erreur Supabase.

## 6. Premier compte admin
Créer un compte depuis `/inscription`, puis dans Supabase SQL Editor :

```sql
update public.profiles
set role = 'super_admin'
where email = 'TON_EMAIL_ICI';
```

Ensuite reconnecte-toi.

## 7. Tester
```txt
http://localhost:3000/inscription
http://localhost:3000/connexion
http://localhost:3000/dashboard
```
