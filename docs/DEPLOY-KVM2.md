# Déploiement Foga-Tech v1.0 — KVM2 Hostinger

Guide pas-à-pas pour déployer le site sur un VPS **Hostinger KVM2** sous Ubuntu 22.04.

## 1. Provision VPS

- Commander KVM2 Ubuntu 22.04 LTS (min. 2 vCPU / 8 GB RAM / 100 GB SSD)
- Pointer le DNS `foga-tech.com` (A record) vers l'IP du VPS

## 2. Accès SSH + sécurité initiale

```bash
ssh root@<IP-KVM2>

# Créer utilisateur dédié
adduser foga
usermod -aG sudo foga
rsync --archive --chown=foga:foga ~/.ssh /home/foga

# Désactiver login root SSH (édition /etc/ssh/sshd_config)
#   PermitRootLogin no
#   PasswordAuthentication no
systemctl restart ssh

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## 3. Installation stack

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 16
sudo apt install -y postgresql-16

# Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# PM2 process manager
sudo npm install -g pm2

# Chromium pour Puppeteer
sudo apt install -y chromium-browser fonts-liberation libxss1 libnss3

# Outils
sudo apt install -y git rsync ufw fail2ban
```

## 4. Setup PostgreSQL

```bash
sudo -u postgres psql

CREATE USER foga WITH PASSWORD 'MOT_DE_PASSE_FORT_ICI';
CREATE DATABASE foga_tech OWNER foga;
\q
```

Optionnel — accès local seulement (par défaut OK avec `peer` + `md5` localhost).

## 5. Cloner le projet

```bash
sudo mkdir -p /var/www/foga-tech
sudo chown foga:foga /var/www/foga-tech
cd /var/www/foga-tech

git clone <URL-REPO-GIT> .
# ou rsync depuis votre poste:
#   rsync -avz foga-tech-v1.0/ foga@<IP>:/var/www/foga-tech/
```

## 6. Configurer .env

```bash
cp .env.example .env
nano .env
```

Régler :
- `DATABASE_URL=postgresql://foga:<password>@localhost:5432/foga_tech`
- `NODE_ENV=production`
- `SMTP_*` (credentials Hostinger réels)
- `CORS_ORIGINS=https://foga-tech.com,https://www.foga-tech.com`
- `PUBLIC_BASE=https://foga-tech.com`
- `VITE_API_URL=` (vide — même origine via Nginx proxy)

## 7. Backend (API)

```bash
cd /var/www/foga-tech/api
npm install
npm run migrate     # crée tables + seeds

# Puppeteer: pointer vers Chromium système (évite le download)
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Lancer via PM2
pm2 start index.js --name foga-api --time
pm2 save
pm2 startup        # exécuter la commande indiquée
```

## 8. Frontend (web)

```bash
cd /var/www/foga-tech/web
npm install
npm run build
# Sortie: dist/  → servie statiquement par Nginx
```

## 9. Nginx config

Créer `/etc/nginx/sites-available/foga-tech` :

```nginx
server {
    listen 80;
    server_name foga-tech.com www.foga-tech.com;

    # Frontend statique
    root /var/www/foga-tech/web/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache assets long
    location ~* \.(js|css|woff2?|svg|webp|jpg|jpeg|png|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1024;

    client_max_body_size 5M;
}
```

Activer :

```bash
sudo ln -s /etc/nginx/sites-available/foga-tech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 10. SSL Let's Encrypt

```bash
sudo certbot --nginx -d foga-tech.com -d www.foga-tech.com
# Auto-renew déjà configuré via systemd timer
```

## 11. Backup DB cron

```bash
sudo mkdir -p /var/backups/foga-tech
sudo nano /etc/cron.d/foga-backup
```

Contenu :

```cron
0 3 * * * postgres pg_dump foga_tech | gzip > /var/backups/foga-tech/db-$(date +\%Y\%m\%d).sql.gz
0 4 * * * root find /var/backups/foga-tech -name "db-*.sql.gz" -mtime +30 -delete
```

## 12. Monitoring

```bash
# Logs API
pm2 logs foga-api

# Logs Nginx
tail -f /var/log/nginx/access.log /var/log/nginx/error.log

# Status
pm2 status
systemctl status nginx postgresql
```

Optionnel : installer **Uptime Kuma** dans un container léger pour ping externe.

## 13. Mise à jour

```bash
cd /var/www/foga-tech
git pull
cd api && npm install && npm run migrate && pm2 restart foga-api
cd ../web && npm install && npm run build
sudo systemctl reload nginx
```

## Checklist de mise en ligne

- [ ] DNS A record propagé (`dig foga-tech.com`)
- [ ] PostgreSQL accessible, migrations passées
- [ ] API répond sur `/health`
- [ ] `web/dist/` build présent
- [ ] Nginx config validée + reload
- [ ] SSL Let's Encrypt actif (https://)
- [ ] Test formulaire devis end-to-end (DB + email reçu)
- [ ] Backup cron actif
- [ ] PM2 startup configuré (survie au reboot)
