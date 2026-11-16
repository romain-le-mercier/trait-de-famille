# T-017 — Faire de chaque coloriage de Noël une carte de vœux à imprimer et plier

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** : si les 12 fiches Noël proposent aussi un PDF « carte à plier » et qu'une page `/guides/carte-de-noel-a-colorier` répond à cette requête, les téléchargements au format carte passent de 0 (format inexistant, 2026-11-05) à ≥ 8 sur les 28 j finissant le 2026-12-20 ; tous formats, `coloriage-telecharge` passe de 4 / 28 j (2026-11-04) à ≥ 20 |
| Chantier roadmap | H2 fenêtre Noël, bibliothèque gratuite ; seuil de gel D-007 |
| KPI visé | Événement Umami `coloriage-telecharge` (`conversions.js`), propriété `format=carte` ; indexation et impressions de la page guide (GSC) |
| Créé le | 2026-11-05 par pm-lead |
| Estimation | < 1 jour |
| Niveau de revue | léger |

## Pourquoi

Le téléchargement est la seule conversion que le site peut produire tant que Stripe est fermé : **4 `coloriage-telecharge`
sur 28 j** au 2026-11-04 (`conversions.js`), pour 40 visites dont 19 venues de google.com et 5 fiches Noël parmi les
8 pages les plus vues (Umami). Un parent qui cherche un coloriage en décembre cherche souvent un **usage** : « carte de
Noël à colorier » est une requête distincte des requêtes « coloriage <sujet> », et nos fiches la suggèrent déjà sans la
servir (fiche boule : « collée sur la face d'un carton plié, elle fait une carte de vœux », relevé à l'origine le
2026-11-05). Aujourd'hui le seul PDF est une page A4 pleine : en faire une carte demande de découper et coller.

## Quoi

1. Sur chacune des 12 fiches Noël, à côté de « Télécharger en PDF (A4) », un second bouton « Carte à plier (PDF) » :
   un PDF A4 **paysage** à plier en deux, dessin sur la moitié droite (la face), moitié gauche vierge (le dos),
   intérieur vierge pour écrire à la main. Fabriqué dans le navigateur à partir de l'image déjà servie, par une
   variante de `buildColoringPdf` (`src/lib/pdf.ts`), sans dupliquer la mise en page. Un trait de pliage fin et
   discret au milieu est permis ; tout texte reste du texte PDF (comme le pied de page actuel), jamais dans l'image.
2. Mesure : `suivre("coloriage-telecharge", { format: "carte", slug })` au clic, sur le modèle du bouton existant.
3. Un guide `/guides/carte-de-noel-a-colorier` déclaré dans `src/lib/guides.ts` : comment imprimer (A4, 100 %,
   papier 160 g+ conseillé), plier, quoi écrire dedans selon l'âge, puis les 12 dessins Noël (vignette + lien vers la
   fiche où se trouve le bouton). Title ≤ 65 caractères servi avec « carte de Noël à colorier » ; meta « gratuite à imprimer ».
4. Un lien vers ce guide depuis le hub `/coloriages/noel` (bloc « Pendant l'Avent » ou équivalent).

## Critère de fin (vérifiable par le dev, seul)

- [x] Les 12 fiches `/coloriages/noel/<slug>` servent le bouton « Carte à plier » (HTML servi à l'origine, 12 / 12) ;
      les fiches animaux et dinosaures ne le servent pas (0 sur `/coloriages/animaux/chat`).
      **Preuve (local, `next start` + Postgres jetable semé des 12 slugs Noël + chat)** : `curl … | grep -c "Carte à plier"`
      = 1 sur chacune des 12 fiches → **12/12** ; `/coloriages/animaux/chat` → **0**. Côté code : `carte={theme.slug === "noel"}`.
      À rejouer à l'origine après MEP.
- [x] Le PDF produit pour 2 fiches (sapin, boule) : 1 page, A4 paysage (297 × 210 mm, lu par `pdfinfo` ou équivalent),
      dessin entièrement contenu dans la moitié droite avec marge, moitié gauche sans image. Fichiers joints au
      « Retour dev » ou captures décrites.
      **Preuve** : `buildColoringCardPdf` exécuté sur un dessin au trait portrait (843×1264, cas sapin) et le même tourné
      paysage (1264×843, cas boule) : `pdfinfo` → `Pages: 1`, `Page size: 841.89 x 595.28 pts (A4)` (297 × 210 mm) ;
      `pdfimages -list` → **une seule image** ; traits sombres mesurés sur le rendu 72 dpi : portrait x 164,4 → 286,8 mm,
      y 13,1 → 196,5 mm ; paysage x 164,4 → 286,5 mm, y 63,9 → 145,7 mm. Pli à 148,5 mm : marge ≥ 16 mm côté pli, ≥ 10 mm
      au bord. Moitié gauche : seulement le pied de page en texte PDF. Même résultat dans Chrome headless avec le vrai
      bouton (PDF téléchargé `coloriage-sapin-de-noel-a-imprimer-carte-a-plier.pdf`, A4 paysage, 1 page, 1 image).
      Les PDF ne sont pas joints (scratchpad de session, non versionné) : fabriqués à partir d'un dessin de démo, pas des
      PNG de production, absents en local.
- [x] Au clic, un événement `coloriage-telecharge` part avec `format: "carte"` et le `slug` (vu dans l'onglet réseau
      ou un test) ; le bouton A4 existant envoie toujours son événement inchangé.
      **Preuve** : Chrome headless (CDP), `window.umami.track` intercepté, clic sur les deux boutons de
      `/coloriages/noel/sapin-de-noel` → `[["coloriage-telecharge",{"format":"carte","slug":"sapin-de-noel"}],
      ["coloriage-telecharge",{"format":"pdf","slug":"sapin-de-noel"}]]`, aucune erreur affichée, deux PDF téléchargés.
- [x] `/guides/carte-de-noel-a-colorier` répond 200 à l'origine, un seul `<h1`, 12 liens distincts vers
      `/coloriages/noel/<slug>`, présent dans `/sitemap.xml` (une URL de plus qu'avant la MEP) et dans `/guides`.
      **Preuve (local)** : **200**, `<h1` × **1**, `href="/coloriages/noel/…"` distincts = **12** ; `/sitemap.xml` contient
      l'URL (1 occurrence ; le sitemap lit `GUIDES`, passé de 6 à 7 guides, donc +1 exactement) ; `/guides` la lie (1).
      **À l'origine : à rejouer après MEP** (statut, 12 liens, sitemap = compte d'avant + 1).
- [x] Le hub `/coloriages/noel` contient `href="/guides/carte-de-noel-a-colorier"` ; build et lint verts.
      **Preuve** : hub local → 1 occurrence (et le lien Avent toujours présent : 1) ; `next build` vert (route
      `ƒ /guides/carte-de-noel-a-colorier`), `tsc --noEmit` et `eslint .` sans sortie, relancés après la revue.

## Hors périmètre

- **Aucun nouveau dessin, aucune image générée par IA, aucun texte incrusté dans une image** (pas de « Joyeux Noël »
  dessiné sur la carte : l'enfant l'écrit).
- Pas de carte personnalisée par photo, pas de lien vers l'offre payante ou `/creer` depuis ce bouton.
- Pas d'enveloppe, de format A5 recto-verso ni de second gabarit : un seul format carte.
- Pas de bouton carte hors thème Noël. Ne pas toucher au pack des 12 (T-015) ni aux title/meta des fiches (T-013).

## Prérequis

Aucun. Si T-015 est déjà passé et a factorisé la fabrication de PDF, s'appuyer dessus plutôt que dupliquer.

## À consigner dans journal.md

- Date et commit de MEP, vérifiés à l'origine (bouton 12 / 12, guide 200, sitemap +1).
- `coloriage-telecharge` sur 28 j au jour de la MEP (`conversions.js`), pour la lecture avant / après.
- Title et meta servis du guide.
- Rappel du pari : ≥ 8 téléchargements `format=carte` et ≥ 20 `coloriage-telecharge` sur les 28 j finissant le 2026-12-20.

---

## Retour dev

**Fait.** Commits `f041670` (carte, bouton, guide, lien hub) et `a3b1592` (corrections de revue), branche `ticket/T-017`,
non poussée.

Revue adversariale du 2026-11-16 (niveau léger, reviewer-fiabilite seul) : 3 défauts rapportés, 3 corrigés (tous
mineurs), 0 hérité, 0 réfuté. Corrigés : l'intro du guide disait le dos blanc alors qu'il porte le pied de page ; le
nombre de cartes du texte est compté depuis la base (une fiche dépubliée ne laisse plus « 12 » en dur) ; la réserve de
pied de page sous le dessin est supprimée côté face (pied de page au dos), le dessin est recentré verticalement.

Title servi : « Carte de Noël à colorier à imprimer et plier · Trait de Famille » (63 caractères). Meta : « Une carte de
Noël à colorier gratuite à imprimer : 12 dessins en PDF A4 à plier en deux, le dessin sur la face, l'intérieur libre
pour un mot écrit à la main. » H1 : « Une carte de Noël à colorier, à imprimer et plier ».

Ce que le PM ne voit pas :
- **`dessinerPage` (`pdf.ts`) prend désormais une zone optionnelle** : sans zone, calcul identique à avant (vérifié par
  le reviewer) pour le PDF A4, le pack T-015, `/merci` et `/mes-coloriages`. La carte réutilise cette mise en page sur
  la moitié droite, pas de duplication.
- **Textes du hub modifiés** (nécessaire pour qu'ils restent vrais) : « deux téléchargements » → « trois », et l'idée
  « Des cartes de vœux » ne dit plus de découper et coller mais renvoie au guide (ancre « carte de Noël à colorier »).
  `idees.lien` devient `idees.liens[]` dans `themes.ts`. Le `reviseLe` du hub n'a pas bougé. Le texte de la fiche boule
  (« collée sur la face d'un carton plié ») n'est pas touché : hors périmètre, à reprendre si le PM le juge utile.
- La meta du guide garde « 12 dessins » en dur (comme le guide Avent garde « 24 ») ; le corps de page, lui, compte.
- `updated: 2026-11-16` dans `guides.ts` : si la MEP glisse, la date affichée et le `lastmod` resteront au 16/11.
- Le guide entre aussi dans la liste des guides du pied de page (comportement existant de `guides.ts`).
- Vérifications faites en local avec une base Postgres jetable (tmpfs, détruite) ; les vignettes du guide pointent vers
  les images servies en ligne. **Le build a demandé de mettre de côté `.next`** (sous-dossiers appartenant à root,
  laissés par Docker) : renommé le temps du build puis remis en place à l'identique, rien supprimé.
- **Disque WSL à ~300 Mo libres** : une MEP qui build en local risque d'échouer.
- À la MEP : `curl --resolve trait-de-famille.fr:443:51.210.6.44` sur le guide (200, 12 liens, 1 h1), une fiche Noël
  (bouton carte présent) et `/coloriages/animaux/chat` (absent), sitemap +1 ; puis demander l'indexation du guide dans GSC.
- Pari (pour la lecture) : ≥ 8 `format=carte` et ≥ 20 `coloriage-telecharge` sur les 28 j finissant le 2026-12-20 ;
  baseline 4 / 28 j au 2026-11-04. Le relevé au jour de la MEP (`conversions.js`) revient au chef d'orchestre.

## Validation PM
