# EDVR — Schéma Supabase V2

Ce schéma correspond au workflow final validé :

- page publique vitrine ;
- inscription avec email, profil et téléphone ;
- espace utilisateur connecté ;
- formations payantes verrouillées ;
- étapes de formation progressives ;
- leçons texte, vidéo, YouTube, PDF ;
- examens avec banque de questions ;
- blocage temporaire après échec ;
- déblocage de la formation suivante via prérequis ;
- marketplace produits numériques ;
- commandes et paiements ;
- activité utilisateur ;
- relance utilisateur ;
- demande d’attestation ;
- affiliation ;
- administration et journaux.

## Fichier SQL généré

```txt
supabase/EDVR_SUPABASE_SCHEMA_V2.sql
```

## Exécution

1. Ouvrir Supabase.
2. Aller dans **SQL Editor**.
3. Créer une nouvelle requête.
4. Coller tout le contenu de `supabase/EDVR_SUPABASE_SCHEMA_V2.sql`.
5. Cliquer sur **Run**.

## Tables principales

- `profiles`
- `user_activity_logs`
- `courses`
- `course_steps`
- `lessons`
- `course_enrollments`
- `course_step_progress`
- `lesson_progress`
- `quizzes`
- `quiz_questions`
- `quiz_answers`
- `quiz_attempts`
- `quiz_attempt_answers`
- `products`
- `product_assets`
- `orders`
- `order_items`
- `payments`
- `product_purchases`
- `certificate_requests`
- `certificates`
- `email_notifications`
- `user_relaunches`
- `affiliate_referrals`
- `affiliate_commissions`
- `admin_logs`
- `platform_settings`

## Règles importantes

- Les utilisateurs voient leurs propres données.
- Les admins et super admins voient les données globales.
- Les contenus de leçons ne sont accessibles qu’après inscription à la formation.
- Les fichiers produits ne sont accessibles qu’après achat.
- Les formations peuvent avoir un prérequis.
- Les examens peuvent imposer score minimum, délai de reprise et tirage aléatoire.
- Les attestations passent par une demande traitée par l’admin.

## Après exécution

Tester :

1. inscription ;
2. création automatique dans `profiles` ;
3. connexion ;
4. création du premier super admin ;
5. insertion d’une formation test ;
6. insertion d’un produit marketplace test.
