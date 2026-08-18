---
name: Ecole des Vendeurs de Race
description: Une academie numerique de vente sobre, precise et centree sur la progression.
colors:
  academic-ink: "#071B3A"
  ink: "#101828"
  progression-gold: "#D8AD46"
  pedagogical-bronze: "#B98722"
  fresh-paper: "#F8FAFC"
  surface: "#FFFFFF"
  surface-muted: "#F2F4F7"
  border: "#E4E7EC"
  divider: "#EAECF0"
  text-muted: "#667085"
  success: "#16794A"
  warning: "#A15C07"
  danger: "#B42318"
typography:
  display:
    fontFamily: "Geist Sans, Inter, Arial, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "normal"
  headline:
    fontFamily: "Geist Sans, Inter, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Geist Sans, Inter, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Geist Sans, Inter, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Sans, Inter, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "normal"
rounded:
  control-compact: "6px"
  control: "8px"
  card: "12px"
  panel: "16px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  20: "80px"
components:
  button-primary:
    backgroundColor: "{colors.academic-ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "40px"
  button-accent:
    backgroundColor: "{colors.progression-gold}"
    textColor: "{colors.academic-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  badge:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
---

# Design System: Ecole des Vendeurs de Race

## Overview

**Creative North Star: "L'Academie de precision"**

L'Ecole des Vendeurs de Race doit ressembler a une institution numerique contemporaine plutot qu'a une collection de composants SaaS. Son langage est sobre, structure, rassurant, precis et premium. La progression pedagogique est le principal signal visuel distinctif : elle donne du rythme aux parcours sans introduire de gamification enfantine.

La qualite de finition recherchee reprend la discipline des meilleures interfaces Apple : navigation compacte, typographie mesuree, surfaces propres, hierarchie calme, espace intentionnel et interactions discretes. Cette reference fixe un niveau d'execution, pas une identite a copier. L'ancrage propre au produit vient de l'Encre academique, de l'Or de progression, du Bronze pedagogique, des contenus de vente et d'une voix d'ecole exigeante mais accessible.

**Key Characteristics:**
- Surfaces blanches ou gris tres clair, avec une densite calme et fonctionnelle.
- Navigation compacte et texte petit, fonce, net et parfaitement lisible.
- Accent dore rare, associe a une progression, une selection, un accomplissement ou une action importante.
- Composants legers, bordures discretes, rayons mesures et ombres exceptionnelles.
- Mobile traite comme un contexte principal, jamais comme une reduction tardive du desktop.

## Colors

La palette associe une base froide, claire et silencieuse a une encre institutionnelle et un accent dore volontairement rare.

### Primary
- **Encre academique** : porte l'identite, les textes institutionnels forts, les boutons primaires et certaines navigations. Elle ne doit pas remplir systematiquement de grandes surfaces.

### Secondary
- **Or de progression** : signale la progression, la selection, l'accomplissement et quelques actions importantes. Sa rarete fait sa valeur.
- **Bronze pedagogique** : sert aux libelles pedagogiques, aux accents de lecture et aux variantes plus sobres de l'or; il ne remplace pas une couleur de texte standard.

### Neutral
- **Papier frais** : fond principal des pages applicatives et des zones de respiration.
- **Surface** : fond des controles, cartes et contenus prioritaires.
- **Surface attenuee** : groupes secondaires, lignes alternees et zones de contexte.
- **Encre de lecture** : texte principal a fort contraste.
- **Texte secondaire** : metadonnees et explications sans sacrifier la lisibilite.
- **Bordure et separateur** : structure presque silencieuse entre les elements.

### Named Rules

**The Rare Gold Rule.** L'or ne colore jamais une page entiere et ne sert pas d'accent decoratif repetitif; chaque occurrence doit communiquer une importance reelle.

**The White Surface Rule.** Une surface blanche reste plate par defaut. La structure vient d'abord de l'espace, ensuite d'une bordure, et seulement en dernier recours d'une ombre.

**The Semantic State Rule.** Succes, avertissement et danger conservent leurs couleurs fonctionnelles et ne sont jamais remplaces par l'or de marque.

## Typography

**Display Font:** Geist Sans (avec Inter, Arial et sans-serif en repli)
**Body Font:** Geist Sans (avec Inter, Arial et sans-serif en repli)

**Character:** Une sans-serif neutre, contemporaine et tres lisible permet aux contenus pedagogiques de dominer. Le contraste repose sur la taille, le poids et l'espace, pas sur une accumulation de graisses fortes.

### Hierarchy
- **Display** (700, 48px, 1.15) : reserve aux grands titres de pages publiques; descend a 40px puis 32px selon l'espace disponible.
- **Headline** (700, 32px, 1.25) : titres de page et moments structurants; 24px sur mobile dense.
- **Title** (600, 20px, 1.25) : sections, cartes majeures et titres de modules.
- **Body** (400, 16px, 1.5) : texte courant, limite a environ 70 caracteres par ligne pour les contenus pedagogiques.
- **Label** (500, 14px, 1.35) : navigation, controles et metadonnees. Les petites metadonnees peuvent descendre a 12 ou 13px avec contraste renforce.

### Named Rules

**The Quiet Weight Rule.** Le poids 700 est reserve aux titres de page et aux chiffres vraiment prioritaires; boutons, labels et navigation utilisent 500 ou 600.

**The No Viewport Type Rule.** Les tailles de texte ne dependent pas directement de la largeur du viewport; elles changent par paliers responsives explicites.

**The Readable Small Text Rule.** Un texte petit doit etre fonce, espace normalement et accompagne d'une hauteur de ligne suffisante; petit ne signifie jamais pale.

## Layout

Le systeme utilise une grille fluide avec marges laterales de 16px sur mobile, 24px sur tablette et 32px sur desktop. Les conteneurs ont un role clair : 560px pour les formulaires, 720px pour la lecture, 1120px pour les interfaces applicatives, 1200px pour les pages publiques et 1280px comme plafond absolu.

L'espacement suit une base de 4px. Les composants utilisent principalement 8 a 24px; les separations de sections utilisent 40 a 80px. Un titre recoit toujours plus d'espace au-dessus qu'entre lui et le contenu qu'il introduit.

La navigation desktop tient dans une barre de 56 a 60px. Sur mobile, elle devient une barre de 52 a 56px et ouvre un panneau controle, plutot qu'une seconde ligne permanente. Les sidebars apprenant et administration deviennent une navigation mobile dediee. Le lecteur privilegie une colonne de lecture stable et un sommaire repliable accessible.

**The One Container Role Rule.** Chaque surface choisit un seul role de conteneur; les largeurs arbitraires ne doivent pas proliferer d'une page a l'autre.

**The Mobile Is Primary Rule.** Chaque parcours critique doit fonctionner a 320px sans debordement horizontal, texte tronque essentiel ou action inaccessible.

## Elevation & Depth

Le systeme est plat et utilise principalement la couleur de surface, l'espace et des bordures fines. L'ombre basse sert seulement a detacher legerement un element interactif important. L'ombre flottante est reservee aux menus, tiroirs et dialogues qui passent reellement au-dessus du contenu.

### Shadow Vocabulary
- **Ambient low** (`0 1px 2px rgba(16, 24, 40, 0.05)`) : carte interactive ou controle qui requiert une separation minimale.
- **Floating** (`0 8px 24px rgba(16, 24, 40, 0.08)`) : menu, tiroir ou dialogue uniquement.

### Named Rules

**The Flat By Default Rule.** Les surfaces au repos sont plates; une ombre doit correspondre a une elevation ou une interaction reelle.

**The One Depth Signal Rule.** Une carte n'additionne jamais fond colore, bordure forte et ombre pour exprimer la meme separation.

## Shapes

Les controles compacts emploient des coins precis de 6px; les boutons et champs utilisent 8px; les cartes utilisent 12px; les panneaux exceptionnels peuvent atteindre 16px. Les pilules sont reservees aux badges, statuts et segments dont la forme porte un sens. Les images suivent le rayon de leur conteneur sans creer une silhouette plus ronde que le reste du systeme.

**The Radius Hierarchy Rule.** Plus un element est grand, plus son rayon peut augmenter, mais aucun rayon n'est applique par reflexe. Les grands rayons repetes et les cartes en forme de capsule sont interdits.

## Components

Les composants sont compacts, silencieux et explicites. Leur etat, leur libelle et leur relation au parcours priment sur leur decoration.

### Buttons
- **Shape:** rectangle compact a coins precis (8px), hauteur standard de 40px et hauteur tactile de 44px sur mobile.
- **Primary:** Encre academique sur texte blanc, poids 600 maximum; une seule action primaire dominante par zone.
- **Accent:** Or de progression sur Encre academique, reserve aux actions importantes liees a la progression ou a la selection.
- **Secondary:** surface blanche, texte principal et bordure discrete; les actions tertiaires restent des liens ou boutons fantomes.
- **Hover / Focus:** variation de ton breve, sans translation decorative; focus visible de 2px avec offset de 2px.

### Chips
- **Style:** petits badges a forme pilule, texte de 12 ou 13px, fond attenue et contraste eleve.
- **State:** une selection peut utiliser un fond dore tres pale et un contour Bronze pedagogique; un statut metier utilise toujours sa couleur semantique.

### Cards / Containers
- **Corner Style:** courbe mesuree (12px), panneau exceptionnel a 16px.
- **Background:** surface blanche ou attenuee, jamais un gradient decoratif.
- **Shadow Strategy:** plate par defaut; ombre basse uniquement si l'interaction exige une separation.
- **Border:** ligne discrete de 1px.
- **Internal Padding:** 16px sur mobile, 20 ou 24px sur desktop selon la densite.

### Inputs / Fields
- **Style:** hauteur minimale de 44px, surface blanche, bordure de 1px, coins de 8px et libelle visible au-dessus du champ.
- **Focus:** bordure Encre academique et anneau de 2px avec offset; le focus ne depend jamais de la couleur seule.
- **Error / Disabled:** message associe au champ, couleur semantique et attributs accessibles; le disabled reste lisible et ne ressemble pas a un champ vide.

### Navigation
- **Desktop:** barre de 56 a 60px, libelles de 13 ou 14px en poids 500, aucune pilule active. L'etat courant utilise un texte plus fonce et un indicateur inferieur de 2px.
- **Mobile:** barre de 52 a 56px, logo compact, compte et bouton menu. Le panneau possede fermeture explicite, focus gere, `aria-expanded`, groupes lisibles et actions prioritaires en bas.
- **Application:** les sidebars affichent une selection claire avec `aria-current`; sur mobile elles deviennent un tiroir ou une barre adaptee, pas une liste empilee au-dessus du contenu.

### Progress Indicator

La progression est le composant signature. Elle peut prendre la forme d'une ligne, d'un compteur ou d'une sequence d'etapes, mais reste informative et sobre. L'Or de progression represente l'avancement reel; les etapes verrouillees et incompletes restent neutres. Aucune confetti, badge ludique ou animation de recompense enfantine.

### Motion

Les retours simples durent 120ms, les transitions standard 180ms et les panneaux 240ms avec `cubic-bezier(.2, .8, .2, 1)`. Les animations modifient principalement opacite, couleur et legere position. Elles ne retardent jamais l'acces au contenu et sont neutralisees par `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** utiliser l'espace, la typographie et les separateurs avant d'ajouter un conteneur.
- **Do** reserver l'Or de progression aux etats et actions qui ont une importance pedagogique ou decisionnelle reelle.
- **Do** conserver des textes de navigation petits, fonces, courts et lisibles.
- **Do** offrir une cible tactile d'au moins 44px sur mobile et un focus visible sur chaque controle.
- **Do** concevoir les tableaux, lecteurs, formulaires et menus pour le mobile avant leur extension desktop.

### Don't:
- **Don't** reproduire une identite Apple, ses composants proprietaires ou son vocabulaire de marque.
- **Don't** utiliser de gradients decoratifs, de gros aplats bleu nuit repetitifs ou de cartes imbriquees.
- **Don't** appliquer de grands rayons, des pilules ou des ombres a chaque composant.
- **Don't** surcharger les dashboards de cartes metriques equivalentes ou de chiffres sans priorite.
- **Don't** utiliser une typographie excessivement grande ou grasse pour fabriquer artificiellement de la hierarchie.
- **Don't** introduire une gamification enfantine, des animations spectaculaires ou une esthetique de template SaaS generee.
