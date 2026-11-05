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

- [ ] Les 12 fiches `/coloriages/noel/<slug>` servent le bouton « Carte à plier » (HTML servi à l'origine, 12 / 12) ;
      les fiches animaux et dinosaures ne le servent pas (0 sur `/coloriages/animaux/chat`).
- [ ] Le PDF produit pour 2 fiches (sapin, boule) : 1 page, A4 paysage (297 × 210 mm, lu par `pdfinfo` ou équivalent),
      dessin entièrement contenu dans la moitié droite avec marge, moitié gauche sans image. Fichiers joints au
      « Retour dev » ou captures décrites.
- [ ] Au clic, un événement `coloriage-telecharge` part avec `format: "carte"` et le `slug` (vu dans l'onglet réseau
      ou un test) ; le bouton A4 existant envoie toujours son événement inchangé.
- [ ] `/guides/carte-de-noel-a-colorier` répond 200 à l'origine, un seul `<h1`, 12 liens distincts vers
      `/coloriages/noel/<slug>`, présent dans `/sitemap.xml` (une URL de plus qu'avant la MEP) et dans `/guides`.
- [ ] Le hub `/coloriages/noel` contient `href="/guides/carte-de-noel-a-colorier"` ; build et lint verts.

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

## Validation PM
