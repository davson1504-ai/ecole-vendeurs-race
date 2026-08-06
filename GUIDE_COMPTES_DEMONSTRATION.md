# Guide des comptes de démonstration

Aucun mot de passe ni utilisateur n’est créé par SQL.

1. Créer l’utilisateur via l’interface d’inscription ou Supabase Auth.
2. Pour un apprenant, conserver le rôle `apprenant`; l’administrateur l’inscrit depuis `/admin/inscriptions`.
3. Pour un administrateur, un `super_admin` actif appelle `set_profile_role(<id>, 'admin')` dans une session authentifiée autorisée.
4. Le premier `super_admin` doit être attribué manuellement par le propriétaire dans un contexte SQL privilégié, après vérification exacte de l’UUID et de l’email. Ne jamais inclure cette commande avec une identité codée en dur dans une migration.
5. Vérifier ensuite `/api/admin/verification`; un compte inactif doit recevoir un refus.

Les mots de passe sont transmis séparément au client et ne doivent jamais être commités ni copiés dans un rapport.
