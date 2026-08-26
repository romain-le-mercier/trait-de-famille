-- Bibliothèque de coloriages gratuits.
--
-- Les *sujets* (quoi dessiner) vivent dans le dépôt, pas ici : c'est de
-- l'éditorial, ça se relit en revue de code. Cette table ne contient que ce
-- qui est produit à l'exécution depuis l'administration — le dessin et son
-- état de publication.
--
-- Le slug est la clé : il identifie déjà le sujet côté dépôt, inutile d'y
-- ajouter une séquence. Régénérer un dessin écrase le précédent.

CREATE TABLE IF NOT EXISTS coloriages (
  slug         TEXT PRIMARY KEY,
  theme        TEXT NOT NULL,
  -- brouillon : généré, en attente de relecture humaine.
  -- publie     : visible sur le site public.
  -- rejete     : raté, gardé pour ne pas le régénérer par inadvertance.
  statut       TEXT NOT NULL DEFAULT 'brouillon'
               CHECK (statut IN ('brouillon', 'publie', 'rejete')),
  largeur      INTEGER NOT NULL CHECK (largeur > 0),
  hauteur      INTEGER NOT NULL CHECK (hauteur > 0),
  -- Le modèle renvoie le format qu'il veut — souvent du JPEG, parfois du PNG.
  -- On le retient parce que l'adresse publique de l'image en porte
  -- l'extension : une URL en .png qui sert du JPEG ment sur son contenu.
  mime         TEXT NOT NULL,
  genere_le    TIMESTAMPTZ NOT NULL DEFAULT now(),
  publie_le    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS coloriages_theme_statut_idx
  ON coloriages (theme, statut);

-- L'image dans sa propre table : elle pèse plusieurs centaines de kilo-octets
-- et ni la liste de l'administration ni les pages de thème n'en ont besoin.
-- Les séparer évite de la charger sans le vouloir.
--
-- ⚠️ Postgres n'est pas un serveur de fichiers. C'est tenable pour quelques
-- centaines de dessins — et ça évite de monter du stockage objet pour un lot
-- pilote — mais au-delà, il faut sortir les images vers S3/R2 : les
-- sauvegardes de la base deviendraient sinon énormes et lentes.
CREATE TABLE IF NOT EXISTS coloriage_images (
  slug    TEXT PRIMARY KEY REFERENCES coloriages (slug) ON DELETE CASCADE,
  donnees BYTEA NOT NULL
);
