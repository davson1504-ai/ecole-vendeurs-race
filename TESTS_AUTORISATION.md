# Tests d’autorisation

`npm run test:migrations` exécute PostgreSQL 16 jetable sur base fraîche et legacy. La suite vérifie notamment : RLS sur les tables sensibles, catalogue publié public, aperçus, accès aux leçons par enrollment, refus de progression sans enrollment, propriété de progression, impossibilité de modifier rôle/statut directement, administration active, création/publication et unicité du seed.

`npm test` couvre les redirections internes et la neutralisation des routes paiement/webhook. `npm run test:e2e` couvre le parcours public desktop/mobile ; les parcours authentifiés seront exécutés sur staging avec les comptes créés selon le guide.

Dernier résultat local : tests applicatifs 9/9 réussis ; tests SQL base fraîche + legacy réussis.
