# T-009 — Corriger les trois intros Noël qui décrivent mal leur dessin

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** (suite de T-007, même pari : aucune des 12 fiches Noël « Explorée, non indexée » au 20/11, ≥ 150 impressions/28 j au 15/12) : une fiche dont l'intro (= meta description) contredit sa propre section « Ce que montre le dessin » est le signal de faible qualité que T-007 veut retirer |
| Chantier roadmap | Fenêtre Noël (T-007, T-008) |
| KPI visé | Impressions/28 j des 12 fiches Noël |
| Créé le | 2026-10-29 par le chef d'orchestre (remontée du dev de T-007) |
| Estimation | < 1 h |
| Niveau de revue | léger |

## Pourquoi

Le dev de T-007 a regardé les images publiées : trois intros existantes (`intro` dans `src/lib/coloriages/themes.ts`,
servie aussi en meta description) décrivent le prompt, pas le dessin.
- `cadeau-de-noel` : « chacun avec son ruban et son nœud » ; un seul paquet porte un nœud, au sommet. La fiche se
  contredit depuis T-007.
- `pere-noel` : « la hotte » est un sac ; « la barbe jusqu'à la ceinture » est exagéré (barbe sur la poitrine).
- `buche-de-noel` : « champignons en meringue » ne se voient pas ; « le 25 » est une date en chiffres.

## Quoi

Réécrire ces trois `intro` d'après l'image publiée (la regarder), même longueur (≈ 30-40 mots, 150-160 caractères
utiles pour la meta description), même ton. Rien d'autre.

## Critère de fin (vérifiable par le dev, seul)

- [x] Les trois intros avant / après dans le Retour dev, chacune avec la phrase de l'image qui la justifie.
      Preuve : section « Retour dev » ci-dessous (images téléchargées en prod le 2026-10-30, lecture seule).
- [x] Rendu HTML des trois fiches : `<meta name="description">` = nouvelle intro ; aucun « hotte », « ceinture » (pour la
      barbe), « meringue », « chacun avec son ruban » ; aucune contradiction avec « Ce que montre le dessin ».
      Preuve : build de prod de `ticket/T-009` (commit 480e6c5) sur Postgres jetable (12 fiches Noël publiées),
      `curl localhost:3091/coloriages/noel/<slug>` : meta description = nouvelle intro sur les trois ; grep
      `hotte|meringue|chacun avec son ruban|jusqu'à la ceinture|le 25` hors `<script>` → 0 occurrence sur les trois.
- [x] Les 9 autres intros, `<title>`, canonical, JSON-LD : inchangés (`git diff` limité aux trois lignes).
      Preuve : `git diff main...ticket/T-009 --stat -- src` → `themes.ts | 6 +++---` (3 lignes `intro`). Build de `main`
      côte à côte : 9 autres fiches identiques à main (HTML hors `<script>`/`/_next/`, lignes triées) ; sur les trois
      fiches, seuls changent meta/og/twitter description et le paragraphe d'intro ; `<title>` et canonical identiques ;
      JSON-LD identique hors `ImageObject.description`, qui reprend l'intro par construction (`page.tsx:130`).
      `/coloriages/noel` et `sitemap.xml` identiques à main.

## Hors périmètre

Les sections de T-007, les `nom` (prompts), les images, les autres fiches.

## Prérequis

T-007 sur main.

## À consigner dans journal.md

- Date et commit de MEP, vérifiés en ligne (meta description des trois fiches).

## Retour dev

**Fait.** Revue adversariale du 2026-10-30 (niveau léger, `reviewer-seo` seul) : 2 défauts rapportés, 2 corrigés
(mineurs, avec ligne et scénario), 0 hérité, 0 réfuté.
- Meta description trop longue (190-220 car., coupée vers 155) → les trois intros ramenées à 155-159 car., 27-32 mots.
- Intro Père Noël qui recopiait mot pour mot la phrase « Ce que montre le dessin » → reformulée.

Avant / après, avec ce que montre l'image publiée (`/coloriages/image/coloriage-<slug>-a-imprimer.png`, regardée) :
- `cadeau-de-noel` — avant : « Trois paquets empilés, du plus grand au plus petit, chacun avec son ruban et son nœud. Le
  papier est laissé à motifs simples : rayures, pois, étoiles — une couleur par paquet suffit à les distinguer. »
  Après : « Trois paquets empilés, du plus grand au plus petit, ceinturés de rubans, et un grand nœud au sommet. Rayures,
  pois, étoiles : une couleur par paquet suffit. » Image : chaque paquet est croisé d'un ruban, un seul nœud, sur le
  paquet du haut (étoiles) ; milieu à pois, bas à rayures.
- `pere-noel` — avant : « Le Père Noël de face, la barbe jusqu'à la ceinture et la hotte débordant de jouets sur
  l'épaule. Le manteau se remplit en deux coups de feutre rouge ; la barbe, elle, se laisse blanche. »
  Après : « Le Père Noël de face, la barbe sur la poitrine et son sac de jouets sur l'épaule. Le manteau se remplit en
  deux coups de feutre rouge ; la barbe reste blanche. » Image : la barbe s'arrête au haut de la poitrine, bien au-dessus
  de la ceinture ; il tient sur l'épaule un sac en toile noué d'où sortent un ourson, un camion et des paquets.
- `buche-de-noel` — avant : « Une bûche sur son plat, l'écorce striée à la fourchette et décorée de houx et de
  champignons en meringue. À colorier en chocolat, en marron glacé ou en framboise — selon celle qu'on mangera le 25. »
  Après : « Une bûche sur son plat, l'écorce striée, garnie de houx et de petits champignons. À colorier en chocolat ou
  en framboise, selon celle qu'on mangera à Noël. » Image : quatre petits champignons sont bien dessinés (le ticket dit
  qu'ils « ne se voient pas » : faux, ce qui ne se voit pas c'est la meringue) ; houx à baies sur l'écorce et le plat.

Ce qui s'est révélé faux dans le ticket : « champignons en meringue ne se voient pas » — les champignons se voient,
seule la matière « meringue » n'est pas lisible. Gardés comme « petits champignons », cohérent avec la section dessin.

Ce que le PM ne peut pas voir : l'intro alimente aussi `ImageObject.description` du JSON-LD (pas seulement la meta) ;
ce champ change donc, c'est voulu. « marron glacé » retiré pour tenir la longueur. Non poussé, non déployé : MEP au
chef d'orchestre après /valider ; à vérifier en ligne (meta description des trois fiches) avant le gel.
