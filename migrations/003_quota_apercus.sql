-- Quota d'aperçus gratuits.
--
-- L'aperçu est la seule porte du site qui dépense de l'argent sans en gagner :
-- chaque appel est facturé par le fournisseur du modèle. Un script qui boucle
-- dessus vide le budget en une nuit.
--
-- Le compteur vit en base et non en mémoire : le conteneur redémarre à chaque
-- déploiement, bien plus souvent qu'un abuseur ne se lasse.

CREATE TABLE IF NOT EXISTS quotas_apercu (
  -- « compte:<id> » pour un visiteur connecté, « ip:<adresse> » sinon.
  cle       TEXT NOT NULL,
  jour      DATE NOT NULL,
  -- La contrainte protège du remboursement de trop : le décompte est rendu
  -- quand le modèle échoue, et rien ne doit passer sous zéro.
  utilisees INTEGER NOT NULL DEFAULT 0 CHECK (utilisees >= 0),
  PRIMARY KEY (cle, jour)
);

-- Sert uniquement à la purge des jours passés.
CREATE INDEX IF NOT EXISTS quotas_apercu_jour_idx ON quotas_apercu (jour);
