# Variables d'environnement

## Backend (`api/.env`)

| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port d'écoute Express | `3001` |
| `NODE_ENV` | `development` ou `production` | `production` |
| `DATABASE_URL` | URL PostgreSQL complète | `postgresql://foga:pwd@localhost:5432/foga_tech` |
| `CORS_ORIGINS` | Origines autorisées (CSV) en prod | `https://foga-tech.com,https://www.foga-tech.com` |
| `PUBLIC_BASE` | URL publique pour logos PDF | `https://foga-tech.com` |
| `SMTP_HOST` | Serveur SMTP Hostinger | `smtp.hostinger.com` |
| `SMTP_PORT` | Port SMTP | `465` |
| `SMTP_SECURE` | TLS strict | `true` |
| `SMTP_USER` | Utilisateur SMTP | `contact@foga-tech.com` |
| `SMTP_PASS` | Mot de passe SMTP | `***` |
| `SMTP_FROM` | Adresse expéditrice | `contact@foga-tech.com` |
| `DEVIS_TO` | Destinataire interne devis | `contact@foga-tech.com` |
| `DEVIS_REPLY_TO` | Reply-To optionnel | `` |
| `PUPPETEER_SKIP_DOWNLOAD` | Skip download Chromium bundle | `true` (prod KVM2) |
| `PUPPETEER_EXECUTABLE_PATH` | Chemin Chromium système | `/usr/bin/chromium-browser` |

## Frontend (`web/.env`)

| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL API (vide = même origine via Nginx) | `` en prod, `http://localhost:3001` en dev |

## Sécurité

- Ne jamais commit `.env`
- Rotation `SMTP_PASS` régulière
- `DATABASE_URL` : utiliser un mot de passe fort (32+ caractères)
- En prod : `NODE_ENV=production` impératif pour activer le CORS restrictif
