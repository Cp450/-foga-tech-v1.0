# Foga-Tech BTP — Site officiel v1.0

Site institutionnel & opérationnel de **Foga-Tech International** — entreprise congolaise de BTP basée à Brazzaville (Génie Civil, Génie Rural, Location d'engins).

## Stack

- **Frontend** (`web/`) — React 19 + Vite 8 (Rolldown) + Tailwind CSS + Framer Motion
- **Backend** (`api/`) — Node.js 20 + Express 5 + PostgreSQL 16 + Puppeteer (PDF devis) + Nodemailer (SMTP)
- **Base de données** — PostgreSQL natif (pas de Supabase, pas de Docker en prod)

## Structure

```
foga-tech-v1.0/
├── web/             Frontend Vite/React
├── api/             Backend Express + PostgreSQL
├── docs/            Guides déploiement, schéma, env
├── docker-compose.yml   PostgreSQL local pour dev
├── .env.example     Variables d'environnement
└── .gitignore
```

## Quick start (dev local)

### 1. Prérequis

- Node.js 20 LTS
- Docker (pour PostgreSQL local) **ou** PostgreSQL 16 installé localement
- Compte SMTP Hostinger pour tester l'envoi d'emails (optionnel en dev)

### 2. Installation

```bash
# Clone + copie env
cp .env.example .env
# (Édite .env si besoin)

# Lance PostgreSQL local
docker compose up -d

# Backend
cd api
npm install
npm run migrate     # applique schema + seeds
npm run dev         # API sur http://localhost:3001

# Frontend (nouveau terminal)
cd web
npm install
npm run dev         # Web sur http://localhost:5173
```

### 3. Vérifier

- API health : http://localhost:3001/health
- API engins : http://localhost:3001/api/engins
- Site : http://localhost:5173

## Déploiement production (KVM2)

Voir [`docs/DEPLOY-KVM2.md`](./docs/DEPLOY-KVM2.md) pour le guide complet (Ubuntu 22.04 + Nginx + PM2 + Certbot).

## Documentation

- [`docs/DEPLOY-KVM2.md`](./docs/DEPLOY-KVM2.md) — Déploiement VPS Hostinger KVM2
- [`docs/SCHEMA.md`](./docs/SCHEMA.md) — Modèle de données
- [`docs/ENV.md`](./docs/ENV.md) — Variables d'environnement

## Licence

Propriété de Foga-Tech International. Tous droits réservés.
