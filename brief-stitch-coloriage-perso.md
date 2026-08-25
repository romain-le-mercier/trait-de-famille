# Brief UX — Coloriage personnalisé à partir d'une photo
### À coller dans Google Stitch pour générer l'UX

> **Nom de travail :** *Trait de Famille* (double sens : le trait du dessin + le « trait de famille »).
> Alternatives SEO/mémorables si tu préfères : **Crayonne**, **MonColoriage**, **Gribouille**.
> Remplace le nom partout dans le fichier si tu en changes.

---

## 0. Comment utiliser ce fichier avec Stitch

Stitch donne ses meilleurs résultats quand on **pose d'abord le thème (design tokens), puis qu'on génère écran par écran** en référençant ces tokens à chaque prompt. Marche à suivre :

1. **Medium = Web**, pensé **mobile-first** (Stitch est plus fort sur mobile ; on garde les écrans simples et verticaux).
2. Colle d'abord le **bloc « FONDATION / THÈME »** (section 2) → génère l'identité visuelle de base.
3. Puis colle **un prompt d'écran à la fois** (section 4), dans l'ordre. Chaque prompt est autosuffisant : composants + copy français inclus.
4. Utilise la sélection multi-écrans de Stitch pour appliquer un ajustement de thème à tout le projet d'un coup si besoin.
5. Le copy est en **tutoiement**, ton chaleureux et complice (audience : parents, grands-parents, profs — mais on tutoie pour la proximité). Adapte si tu vises plutôt un ton « vouvoiement premium ».

---

## 1. Le produit en une phrase

Un site où l'on **envoie une photo (famille, enfants, animal…)**, qui la **transforme en dessin au trait prêt à colorier**, et qu'on **télécharge en HD imprimable** contre une micro-transaction. Aperçu gratuit filigrané avant paiement.

**Job de la page d'accueil :** faire comprendre la magie en 3 secondes (photo → dessin au trait → à colorier) et faire uploader une photo.

**Émotion visée :** la joie créative + le souvenir. On ne vend pas un fichier, on vend *un moment* (un mercredi pluvieux, un cadeau qui touche les grands-parents, l'atelier d'anniversaire).

---

## 2. FONDATION / THÈME  *(prompt à coller en premier dans Stitch)*

```
Crée le thème visuel d'une web-app grand public, joyeuse et créative, autour du coloriage.
Ambiance : "boîte de crayons" moderne — chaleureuse, ludique, mais soignée et rassurante
(l'acheteur est un adulte : parent, grand-parent, prof). PAS enfantin-bon-marché, PAS Comic Sans.
Référence mentale : une jolie papeterie créative / marque de loisirs créatifs premium.

CANVAS = feuille de coloriage : fond blanc pur, beaucoup d'espace, comme une page à colorier.
Le concept signature : l'interface joue la transformation "trait → couleur".
Les cartes sont bordées d'un trait fin (2px) façon dessin au trait (line-art), plutôt que
des ombres portées lourdes — les cartes ressemblent à des cases de coloriage.
Icônes exclusivement en style "outline"/line-art (cohérent avec le produit).
Petits gribouillis dessinés à la main (étoiles, traits, soleils) en accents, comme les dessins
dans la marge d'un cahier — utilisés avec parcimonie.

COULEURS (tokens) :
- Canvas / papier (fond principal) : #FFFFFF
- Fond de section alterné (papier teinté) : #F3F0FF (lavande très pâle)
- Encre / le trait (texte principal, bordures line-art) : #201B2E (aubergine-charbon, jamais noir pur)
- Texte secondaire / discret : #6B6577
- Bordures douces : #ECE9F5
- PRIMAIRE (Grape) — boutons, liens, actions clés : #7B61FF
- Primaire foncé (hover/pressed) : #5B3FE0
- SECONDAIRE (Tangerine) — highlights, badges "HD/Premium", CTA secondaire : #FF9F1C
- Succès : #34C77B
- Erreur : #FF4B5C
- Palette "crayons" (accents, pastilles de catégorie, confettis, gribouillis) :
  Cerise #FF4B5C · Mandarine #FF9F1C · Soleil #FFD23F · Feuille #34C77B ·
  Ciel #3AA0FF · Raisin #7B61FF · Chewing-gum #FF5FA2

TYPOGRAPHIE (Google Fonts) :
- Display / titres : "Baloo 2" (arrondie, chaleureuse, caractère sans être puéril) — poids 600/700.
- Corps / UI : "Nunito Sans" — terminaisons douces, très lisible — poids 400/600.
- Accent manuscrit (annotations, micro-labels type "fait avec amour") : "Caveat" — TRÈS parcimonieux.
Échelle de type nette et affirmée : gros titres généreux, contraste fort titre/corps.

FORMES & COMPOSANTS :
- Coins arrondis généreux (rayon ~16–20px), boutons "pilule" bien ronds.
- Boutons primaires : fond Grape #7B61FF, texte blanc, léger effet "sticker" (petit décalage
  de contour possible). Boutons secondaires : contour Grape, fond blanc.
- Ombres : douces, colorées et diffuses (teinte violette légère), jamais grises et dures.

MOUVEMENT (discret) :
- Sur le hero, une zone du dessin au trait se "remplit" de couleur au scroll/hover
  (démo instantanée du produit).
- Petit "press" sur les boutons. Confettis-crayons à l'écran de succès. Rien de plus.
- Respecte prefers-reduced-motion.

TON DE VOIX : chaleureux, simple, encourageant, complice. Phrases courtes, verbes actifs,
sentence case. Les erreurs expliquent quoi faire, sans s'excuser. Un écran vide invite à agir.
```

---

## 3. Le parcours (flow) & la monétisation

Flow principal (le cœur de la conversion) :

**Accueil → Upload photo → Aperçu FILIGRANÉ gratuit (le déclic) → Paywall → Téléchargement HD → Upsell**

Mécanique de micro-transaction :
- **Aperçu gratuit** : on génère une version basse résolution avec filigrane. L'utilisateur *voit* sa famille en dessin au trait. C'est ça qui convertit.
- **Déblocage payant** : PDF haute définition, format A4, sans filigrane, imprimable à volonté.
- **Prix** : `1 coloriage = 2,99 €` · `Pack 3 = 6,99 €` · `Pack 10 = 14,99 €` (crédits, meilleur rapport → monte le panier moyen).
- **Upsells** (plus tard) : variantes d'âge (gros traits tout-petits), livret à colorier compilant plusieurs dessins, tirage papier/poster expédié, pack multi-photos.

---

## 4. Écrans  *(prompts à coller un par un, dans l'ordre)*

### Écran 1 — Accueil (landing)

```
Génère une landing page web responsive (mobile-first) pour "Trait de Famille", en appliquant
le thème défini. Sections, de haut en bas :

1. HEADER simple : logo "Trait de Famille" à gauche (avec un petit gribouillis crayon),
   liens "Exemples", "Comment ça marche", "Tarifs", et un bouton primaire "Créer mon coloriage".

2. HERO — signature de la page : à gauche le texte, à droite une démo AVANT/APRÈS.
   - Titre (H1) : "Transforme tes photos en coloriages."
   - Sous-titre : "Envoie une photo de famille, on la transforme en dessin au trait prêt à colorier.
     À imprimer à la maison en 2 minutes."
   - Bouton primaire : "Créer mon coloriage"
   - Lien secondaire : "Voir des exemples"
   - Petites réassurances sous les boutons (icônes outline) : "Aperçu gratuit" · "Sans abonnement" · "Photos supprimées après"
   - Visuel : une photo de famille qui se transforme en dessin au trait ; quelques zones du dessin
     se remplissent de couleurs "crayon" (le motif signature).

3. COMMENT ÇA MARCHE — 3 étapes horizontales (cartes line-art, icônes outline) :
   - "1. Choisis ta photo" — "Famille, enfants, le chien… nette et bien éclairée, c'est parfait."
   - "2. On dessine le trait" — "Notre outil transforme ta photo en dessin au trait, prêt à colorier."
   - "3. Imprime et colorie" — "Télécharge en HD, sors les crayons, et c'est parti."

4. GALERIE D'EXEMPLES — grille de vignettes avant/après (photo → coloriage). Titre : "Ça donne ça."

5. CAS D'USAGE — 4 cartes courtes : 
   "Un mercredi pluvieux", "Un cadeau qui touche" (grands-parents), 
   "L'anniversaire des enfants", "En classe ou en atelier".

6. TARIFS — 3 cartes (la carte du milieu mise en avant avec badge Tangerine "Le préféré") :
   - "1 coloriage — 2,99 €" · "Pack 3 — 6,99 €" · "Pack 10 — 14,99 € — Le préféré des familles"
   - Sous les cartes : "Aperçu gratuit avant de payer · Paiement sécurisé · Sans abonnement."

7. CONFIANCE / RGPD — bandeau avec 3 réassurances (icônes outline) :
   "🔒 Tes photos sont supprimées après traitement" · "Paiement 100% sécurisé" · "Pas d'abonnement, pas de surprise".

8. FAQ (accordéon) — questions : 
   "Quelles photos marchent le mieux ?", "Je peux imprimer plusieurs fois ?", 
   "Vous gardez mes photos ?", "C'est quel format de fichier ?", 
   "Il faut un abonnement ?", "Ça marche avec les animaux ?".

9. CTA FINAL pleine largeur (fond lavande #F3F0FF) : 
   Titre "Prêt à colorier ta première photo ?" + bouton "Créer mon coloriage".

10. FOOTER : liens (Mentions légales, CGV, Confidentialité, Contact) + note "Fait avec ❤️ en France".
```

---

### Écran 2 — Upload de la photo

```
Génère un écran d'upload, épuré et centré, appliquant le thème.
- Titre : "Ajoute ta photo"
- Sous-titre : "Une photo nette et bien éclairée donne le plus beau résultat."
- Grande ZONE DE DÉPÔT (dropzone) bordée d'un trait fin en pointillés (line-art), avec icône outline :
  Texte principal : "Glisse ta photo ici ou clique pour parcourir"
  Texte secondaire : "JPG ou PNG · jusqu'à 10 Mo"
- Sous la dropzone, un petit encadré CONSEILS (icônes outline) :
  "Pour un beau coloriage : visages nets · bonne lumière · arrière-plan pas trop chargé."
- Réassurance confidentialité en ligne, discrète : "🔒 Ta photo est traitée en privé et supprimée après."
- ÉTAT D'ERREUR (à prévoir) : "Cette image n'a pas fonctionné. Essaie une photo JPG ou PNG, plus nette."
- Bouton primaire (désactivé tant qu'aucune photo) : "Transformer ma photo"
```

---

### Écran 3 — Aperçu & personnalisation *(le moment clé)*

```
Génère l'écran d'aperçu du coloriage, appliquant le thème. C'est l'écran émotionnel : l'utilisateur
découvre sa photo transformée en dessin au trait (avec filigrane).

- Titre : "Voilà ton coloriage ✨"
- APERÇU CENTRAL : grande zone montrant le dessin au trait généré, avec un filigrane discret en diagonale.
  Option : petit toggle avant/après (photo ↔ dessin).
- PANNEAU DE RÉGLAGES (à droite sur desktop, sous l'aperçu sur mobile), cartes line-art :
  - "Épaisseur du trait" : boutons segmentés → Fin · Moyen · Épais
  - "Niveau de détail" : Tout-petit · Enfant · Ado & adultes
  - "Recadrer" : bouton secondaire
  - (chaque changement régénère l'aperçu)
- Bandeau info sous l'aperçu : "Aperçu avec filigrane. Débloque la version HD pour imprimer."
- CTA PRIMAIRE bien visible : "Débloquer en HD — 2,99 €"
- Lien secondaire : "Essayer une autre photo"
- ÉTAT DE CHARGEMENT (pendant génération) : animation légère + texte qui tourne parmi :
  "On affûte les crayons…", "On trace les contours…", "On prépare la feuille…"
```

---

### Écran 4 — Paywall / Paiement

```
Génère un écran/modal de paiement clair et rassurant, appliquant le thème.
- Titre : "Débloque ton coloriage"
- Bloc "CE QUE TU REÇOIS" (liste avec coches Succès #34C77B) :
  "✓ Fichier PDF haute définition · ✓ Format A4 prêt à imprimer · ✓ Sans filigrane · ✓ À toi pour toujours"
- CHOIX DE L'OFFRE — 3 options en cartes sélectionnables (la carte "Pack 10" avec badge Tangerine "Meilleur prix") :
  - "1 coloriage — 2,99 €"
  - "Pack 3 — 6,99 €  ·  2,33 € l'unité"
  - "Pack 10 — 14,99 €  ·  1,50 € l'unité  ·  Le préféré des familles"
- MOYENS DE PAIEMENT : boutons Apple Pay, Google Pay, puis champ Carte bancaire.
- Bouton primaire : "Payer et télécharger"
- Réassurance sous le bouton : "Paiement sécurisé · Téléchargement immédiat · Sans abonnement."
```

---

### Écran 5 — Succès / Téléchargement

```
Génère un écran de succès joyeux, appliquant le thème, avec confettis "crayons" (couleurs de la palette) au chargement.
- Titre : "C'est prêt ! 🎉"
- Aperçu miniature du coloriage HD (sans filigrane).
- Bouton primaire large : "Télécharger mon coloriage (PDF)"
- Encadré CONSEILS D'IMPRESSION (icônes outline) :
  "Imprime en A4 · papier un peu épais (120g+) pour les feutres · en couleur ou noir & blanc, comme tu veux."
- Bloc UPSELL (2 cartes line-art) :
  - "Encore une photo ? Les packs reviennent moins cher." → bouton "Créer un autre coloriage"
  - "Fais-en un livret à colorier." → bouton secondaire "En savoir plus"
- Bouton partage discret : "Partage à un parent qui va adorer."
- Si crédits restants : petite ligne "Il te reste 7 coloriages."
```

---

### Écran 6 — Compte & historique *(optionnel, pour plus tard)*

```
Génère un espace compte simple, appliquant le thème.
- Titre : "Mes coloriages"
- En-tête : "Crédits restants : 7" (badge Tangerine) + bouton "Acheter des crédits".
- GRILLE de coloriages passés (cartes line-art) : miniature + date + bouton "Retélécharger".
- ÉTAT VIDE : illustration line-art + "Pas encore de coloriage. Ajoute ta première photo !" + bouton "Créer mon coloriage".
```

---

## 5. Banque de copy réutilisable

**Accroches hero (A/B à tester) :**
- "Transforme tes photos en coloriages."
- "Votre famille, version coloriage."
- "Une photo aujourd'hui, un coloriage dans 2 minutes."

**Boutons (garder le même verbe dans tout le flow) :**
Créer mon coloriage · Transformer ma photo · Débloquer en HD · Payer et télécharger · Télécharger mon coloriage (PDF)

**Réassurances courtes :** Aperçu gratuit · Sans abonnement · Photos supprimées après traitement · Paiement sécurisé · Téléchargement immédiat

**FAQ (réponses) :**
- *Quelles photos marchent le mieux ?* — "Les photos nettes, bien éclairées, avec des visages visibles. Évite le flou et les arrière-plans très chargés."
- *Je peux imprimer plusieurs fois ?* — "Oui. Le PDF est à toi : imprime-le autant de fois que tu veux."
- *Vous gardez mes photos ?* — "Non. Ta photo est supprimée automatiquement après la transformation."
- *C'est quel format de fichier ?* — "Un PDF haute définition, prêt à imprimer en A4 (A3 possible)."
- *Il faut un abonnement ?* — "Non. Tu paies à l'unité, ou tu prends un pack de crédits — sans engagement."
- *Ça marche avec les animaux ?* — "Bien sûr ! Le chien, le chat, le poney… ils adorent finir en coloriage."

**États d'erreur / vide (voix de l'interface, sans excuses) :**
- Upload raté : "Cette image n'a pas fonctionné. Essaie une photo JPG ou PNG, plus nette."
- Visages peu détectables : "On a du mal à voir les visages. Une photo plus lumineuse et plus nette aidera."
- Historique vide : "Pas encore de coloriage. Ajoute ta première photo !"

---

## 6. Notes pour la mise en œuvre (hors Stitch)

- **RGPD** : puisqu'on uploade des photos de personnes (souvent des enfants), la suppression auto après traitement n'est pas qu'un argument de conv' — c'est un vrai point de conformité. Prévois : suppression réelle après génération, pas de revente/entraînement sur les images, mention claire dans la politique de confidentialité, et pas de stockage des originaux plus longtemps que nécessaire.
- **Le déclencheur de conversion, c'est l'aperçu.** Investis dans la qualité du dessin au trait de l'aperçu même filigrané : c'est lui qui vend.
- **Point de vigilance produit** : la qualité de la conversion photo→trait fait tout. Un mauvais rendu = pas de vente. Teste plusieurs approches (modèles de "line art / edge detection", styles) avant de scaler l'acquisition.
```
