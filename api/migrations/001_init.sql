-- Foga-Tech BTP — Schema initial PostgreSQL natif v1.0
-- Compatible PostgreSQL 14+

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- devis_requests : demandes de devis (formulaire site)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devis_requests (
  id           BIGSERIAL PRIMARY KEY,
  reference    TEXT,
  nom          TEXT NOT NULL,
  tel          TEXT NOT NULL,
  profile      TEXT,
  email        TEXT,
  categorie    TEXT,
  budget       TEXT,
  description  TEXT,
  ville        TEXT,
  quartier     TEXT,
  surface      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_devis_created_at ON devis_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devis_status     ON devis_requests (status);

-- ─────────────────────────────────────────────────────────────────────────────
-- contact_messages : messages page Contact
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  nom        TEXT NOT NULL,
  email      TEXT,
  sujet      TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- engins : catalogue location + stock temps réel
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engins (
  id          TEXT PRIMARY KEY,
  icon        TEXT NOT NULL,
  name        TEXT NOT NULL,
  available   INTEGER NOT NULL DEFAULT 0,
  total       INTEGER NOT NULL DEFAULT 0,
  price       TEXT,
  tag         TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 100,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- reviews : avis clients (modération manuelle via verified)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           BIGSERIAL PRIMARY KEY,
  client_name  TEXT NOT NULL,
  project_type TEXT,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT NOT NULL,
  ville        TEXT,
  verified     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_verified_created ON reviews (verified, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- newsletter_subscribers : inscriptions newsletter
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  source     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
