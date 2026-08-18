# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

L'utilisateur prioritaire est l'apprenant ou vendeur francophone, debutant ou deja commercial, qui veut progresser de maniere structuree dans la vente. Le marche prioritaire est l'Afrique francophone, sans limiter le produit a un pays. L'usage doit etre particulierement adapte au mobile et aux moyens de paiement locaux.

Les responsables commerciaux constituent un public secondaire pour les parcours de pilotage de l'activite.

## Product Purpose

L'Ecole des Vendeurs de Race est une ecole numerique de vente. Elle permet a l'apprenant de suivre un parcours progressif, de pratiquer, de valider ses acquis et de rendre sa progression visible jusqu'a l'obtention d'un certificat ou d'une attestation.

Le succes produit signifie que l'apprenant avance reellement dans un parcours encadre et peut appliquer les acquis sur le terrain, plutot que de simplement consommer une bibliotheque de videos.

## Positioning

Le produit se differencie par un parcours commercial progressif et encadre : formations structurees en modules et lecons, exercices et evaluations, suivi de progression, regles pedagogiques de deblocage, validation de paiement avant acces payant, certificats et accompagnement du parcours.

## Operating Context

- Consultation et apprentissage frequents sur mobile, avec adaptation tablette et ordinateur.
- Parcours de l'inscription a la selection d'une formation, au paiement, a la validation administrative ou serveur, puis a l'apprentissage et au suivi de progression.
- Paiements via CinetPay, Mobile Money ou carte selon les options disponibles.
- Administration des utilisateurs, roles, formations, inscriptions, paiements et contenus.

## Capabilities and Constraints

- Authentification et roles securises via Supabase.
- Roles administrateur et super-administrateur dont les garanties de securite ne doivent jamais etre affaiblies.
- Formations composees de modules et de lecons.
- Exercices, examens ou evaluations et validation des acquis.
- Suivi de progression et deblocage progressif selon les regles pedagogiques et de paiement.
- Certificats ou attestations a l'issue des parcours eligibles.
- Dashboard apprenant et administration.
- Affiliation et marketplace prevues dans l'evolution du produit; elles ne doivent pas etre presentees comme entierement disponibles tant qu'elles ne le sont pas.
- Paiement CinetPay avec validation cote serveur obligatoire avant tout deblocage d'un acces payant.
- Les parcours fonctionnels existants doivent etre preserves pendant toute refonte progressive.

## Brand Commitments

Le nom "Ecole des Vendeurs de Race" doit etre conserve.

La voix doit evoquer une veritable ecole numerique de vente : structuree, concrete, credible et orientee vers la progression sur le terrain.

Contrainte visuelle confirmee pour les travaux futurs : finition proche des interfaces Apple, avec navigation compacte, textes petits mais fonces et lisibles, espace maitrise, sobriete, precision typographique et micro-interactions discretes, tout en conservant une identite propre au produit. Les decisions detaillees de direction visuelle restent du ressort du travail de design, pas du present document produit.

## Evidence on Hand

- Parcours publics, authentification, onboarding, dashboard apprenant, lecteur de cours, progression et administration deja presents dans `src/app`.
- Contenus de demonstration et catalogue dans `src/lib` et `supabase/seed.sql`.
- Images de formations, d'authentification et de formateurs dans `public/images`.
- Schema, migrations, politiques de securite et tests Supabase dans `supabase`.
- Integration et routes de paiement CinetPay dans `src/app/api` et `src/app/paiement`.
- Aucune identite detaillee des contributeurs, aucun temoignage client et aucune preuve commerciale non valides ne doivent etre inventes.

## Product Principles

1. Faire progresser l'apprenant par des etapes explicites, mesurables et applicables sur le terrain.
2. Concevoir d'abord pour les usages mobiles et les realites de l'Afrique francophone, sans enfermer le produit dans un seul pays.
3. Ne jamais simuler une validation pedagogique, un paiement, un acces ou une preuve qui n'a pas reellement eu lieu.
4. Preserver la securite des roles et valider cote serveur tout acces lie a un paiement.
5. Faire evoluer l'interface progressivement sans regression des parcours fonctionnels.

## Accessibility & Inclusion

L'interface doit assurer la navigation au clavier, un focus visible, des contrastes suffisants, des textes alternatifs pertinents, une adaptation mobile/tablette/ordinateur et le respect de `prefers-reduced-motion`.
