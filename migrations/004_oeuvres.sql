-- Les coloriages personnalisés, côté serveur.
--
-- Jusqu'ici le fichier sans filigrane était écrit dans l'IndexedDB du visiteur
-- dès la génération : ce qu'on vendait était déjà livré avant d'être payé, et
-- le filigrane ne protégeait que la vignette. Le fichier vit désormais sur un
-- volume, et cette table dit à qui il appartient et s'il a été payé.
--
-- Les octets ne sont pas ici : une base n'est pas un serveur de fichiers, et
-- celle-ci est ce qu'on sauvegarde et restaure. Voir `src/lib/server/stockage.ts`.

CREATE TABLE IF NOT EXISTS oeuvres (
  id            TEXT PRIMARY KEY,

  -- « compte:<sub Google> », ou « anon:<jeton> » tant que le visiteur n'a pas
  -- de compte. Un aperçu se fait sans se connecter — c'est tout l'entonnoir —
  -- donc l'œuvre doit pouvoir être réclamée plus tard, à la connexion.
  proprietaire  TEXT NOT NULL,

  mime          TEXT NOT NULL,
  largeur       INTEGER NOT NULL CHECK (largeur > 0),
  hauteur       INTEGER NOT NULL CHECK (hauteur > 0),
  octets        INTEGER NOT NULL CHECK (octets > 0),

  -- Reprises du brouillon client : elles permettront à la galerie de suivre le
  -- compte, et à la détection de doublon de fonctionner d'un appareil à
  -- l'autre. Les stocker maintenant coûte trois colonnes ; les ajouter après
  -- coup coûterait une migration sur des données vivantes.
  nom_fichier     TEXT,
  empreinte_photo TEXT,
  reglages        JSONB,

  -- Nul tant que l'œuvre n'est qu'un essai. Non nul = payée, donc gardée.
  debloquee_le  TIMESTAMPTZ,
  creee_le      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS oeuvres_proprietaire_idx
  ON oeuvres (proprietaire, creee_le DESC);

-- L'expiration ne concerne que les essais jamais payés : un coloriage acheté
-- est gardé sans limite. L'index partiel ne porte donc que sur eux.
CREATE INDEX IF NOT EXISTS oeuvres_essais_expirables_idx
  ON oeuvres (creee_le) WHERE debloquee_le IS NULL;

-- Sert à retrouver un dessin déjà produit pour la même photo et les mêmes
-- réglages, sans rappeler le modèle.
CREATE INDEX IF NOT EXISTS oeuvres_empreinte_idx
  ON oeuvres (proprietaire, empreinte_photo);
