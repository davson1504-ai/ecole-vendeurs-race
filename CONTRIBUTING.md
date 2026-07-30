# Règles de contribution

## Une issue avant toute fonctionnalité

Aucune fonctionnalité ou correction ne doit être développée sans issue GitHub correspondante. L’issue doit expliquer le besoin, définir des critères d’acceptation vérifiables et mentionner ses dépendances.

## Un changement logique par commit

- Chaque commit référence son issue, par exemple `Refs #12`.
- Un commit ne contient qu’un changement logique.
- Des changements indépendants nécessitent des issues et des commits séparés.
- Une correction sans rapport ne doit pas être mélangée au travail en cours.
- `Closes #12` est utilisé uniquement lorsque tous les critères de l’issue sont validés.

## Validation avant push

Exécuter les contrôles disponibles :

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Ajouter les tests automatisés pertinents lorsqu’un script de tests sera disponible.

## Sécurité

- Ne jamais committer `.env.local`, une clé privée, un token, un mot de passe, un cookie ou un fichier d’identifiants.
- Utiliser `.env.example` uniquement avec des valeurs vides ou factices.
- Ne jamais exposer la clé Supabase `service_role` au navigateur.
- Ne jamais contourner les politiques RLS ou les contrôles d’autorisation côté serveur.
- Ne jamais utiliser de force push sur `main`.
