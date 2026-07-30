# École des Vendeurs de Race

Plateforme de formation progressive destinée aux vendeurs professionnels. L’application fournit actuellement une base Next.js connectée à Supabase, l’authentification par email et mot de passe, des espaces privés et une administration protégée par rôle.

## Technologies

- Next.js 16 et React 19
- TypeScript
- Supabase Auth, PostgreSQL et Row Level Security
- Tailwind CSS

## Installation locale

Prérequis : Node.js 20.9 ou une version plus récente.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Renseignez uniquement votre fichier local `.env.local`. Il est exclu de Git et ne doit jamais être partagé ou committé.

L’application est ensuite accessible sur [http://localhost:3000](http://localhost:3000).

## Variables d’environnement

Le fichier `.env.example` documente les noms attendus avec des valeurs vides ou factices. Les clés privées, mots de passe, cookies de session et identifiants réels ne doivent jamais être ajoutés au dépôt.

## Commandes

```bash
npm run dev
npx tsc --noEmit
npm run lint
npm run build
npm run start
```

Le projet ne possède pas encore de script de tests automatisés distinct.

## Migrations Supabase

Les migrations versionnées se trouvent dans `supabase/migrations/`. Elles doivent être relues et testées avant toute application sur un environnement partagé. Aucune commande de réinitialisation destructive ne doit être utilisée sur la base existante.

## Contribution GitHub

Toute évolution doit suivre la chaîne suivante :

1. créer ou sélectionner une issue GitHub décrivant le changement et ses critères d’acceptation ;
2. réaliser un seul changement logique ;
3. référencer l’issue dans chaque commit concerné ;
4. valider TypeScript, le lint, le build et les tests disponibles ;
5. pousser le commit ;
6. fermer l’issue uniquement lorsque tous ses critères sont satisfaits.

Les règles détaillées se trouvent dans [CONTRIBUTING.md](CONTRIBUTING.md).
