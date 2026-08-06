# Plan après présentation

1. Intégrer CinetPay uniquement avec clés et documentation fournisseur validées : signature, vérification serveur, idempotence et rapprochement montant/devise.
2. Ajouter certificats vérifiables, quiz et notifications sans élargir les policies existantes.
3. Ajouter observabilité avec redaction, alertes, CSP et rate limiting.
4. Ajouter médias de cours dans un bucket privé dont les policies vérifient l’enrollment.
5. Étendre les tests E2E authentifiés dans CI avec identités staging éphémères gérées hors dépôt.
