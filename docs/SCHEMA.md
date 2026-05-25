# Schéma de données Foga-Tech v1.0

PostgreSQL 14+. 5 tables principales + `_migrations` (track migrations).

## Tables

### `devis_requests`
Demandes de devis soumises via le formulaire `/devis`.

| Colonne | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `reference` | text | format `YYYY-NNNN` |
| `nom` | text NOT NULL | |
| `tel` | text NOT NULL | |
| `profile` | text | particulier / entreprise / public |
| `email` | text | |
| `categorie` | text | gros œuvre / second œuvre / etc |
| `budget` | text | fourchette texte |
| `description` | text | description libre |
| `ville`, `quartier`, `surface` | text | localisation |
| `status` | text DEFAULT 'pending' | pending / contacted / closed |
| `created_at` | timestamptz | |

### `contact_messages`
Messages page Contact.

| Colonne | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `nom` | text NOT NULL | |
| `email` | text | |
| `sujet` | text | |
| `message` | text NOT NULL | |
| `status` | text DEFAULT 'new' | |
| `created_at` | timestamptz | |

### `engins`
Catalogue location + stock temps réel.

| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | slug stable (ex: `bull`, `grue`) |
| `icon` | text | Material Symbol name |
| `name` | text | libellé affiché |
| `available` | int | stock disponible |
| `total` | int | parc total |
| `price` | text | ex `250K FCFA/j` |
| `tag` | text | Disponible / Limité / Stock complet |
| `sort_order` | int | ordre affichage |
| `updated_at` | timestamptz | |

### `reviews`
Avis clients (modération manuelle via `verified`).

| Colonne | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `client_name` | text NOT NULL | |
| `project_type` | text | |
| `rating` | smallint 1-5 | CHECK |
| `comment` | text NOT NULL | |
| `ville` | text | |
| `verified` | bool DEFAULT false | publication conditionnée |
| `created_at` | timestamptz | |

### `newsletter_subscribers`
Inscriptions newsletter.

| Colonne | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `email` | text UNIQUE NOT NULL | |
| `source` | text | footer / contact / popup |
| `created_at` | timestamptz | |

## Index

- `idx_devis_created_at` — tri DESC pour admin
- `idx_devis_status` — filtre par status
- `idx_contact_created_at`
- `idx_reviews_verified_created` — composite pour query liste publique

## Migrations

Stockées dans `api/migrations/*.sql`, exécutées dans l'ordre alphabétique par `npm run migrate`. Tracking via table `_migrations`.

Ajouter une migration : créer `api/migrations/003_<description>.sql` et relancer `npm run migrate`.
