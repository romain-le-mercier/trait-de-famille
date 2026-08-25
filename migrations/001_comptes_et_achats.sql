-- Comptes et achats.
--
-- L'identifiant de compte est le `sub` Google (stable, fourni par Auth.js) :
-- pas de séquence, pas de table d'identités à synchroniser.

CREATE TABLE IF NOT EXISTS accounts (
  id         TEXT PRIMARY KEY,
  email      TEXT,
  name       TEXT,
  -- La contrainte est la dernière ligne de défense : même en cas de bug
  -- applicatif, un solde ne peut pas devenir négatif.
  credits    INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- L'identifiant de session Stripe est la clé primaire : c'est ce qui rend le
-- crédit idempotent. Le webhook et la vérification au retour de paiement
-- peuvent arriver dans n'importe quel ordre, le second insert échoue et rien
-- n'est crédité deux fois.
CREATE TABLE IF NOT EXISTS purchases (
  stripe_session_id TEXT PRIMARY KEY,
  account_id        TEXT NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  pack_id           TEXT NOT NULL,
  credits           INTEGER NOT NULL CHECK (credits > 0),
  -- En centimes, comme chez Stripe : jamais de flottant sur de l'argent.
  amount            INTEGER NOT NULL CHECK (amount >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchases_account_created_idx
  ON purchases (account_id, created_at DESC);
