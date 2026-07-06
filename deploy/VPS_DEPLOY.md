## NexaOps VPS deployment (Option A)

This deploys **web + api + postgres + redis** on a single VPS using Docker Compose, with Nginx + HTTPS on the host.

### 1) Create DNS records

- `your-domain.com` → VPS public IP (A record)
- `www.your-domain.com` → VPS public IP (A record)
- `api.your-domain.com` → VPS public IP (A record)

### 2) Server prerequisites (Ubuntu)

Install Docker + Compose plugin, and Nginx:

```bash
sudo apt update -y
sudo apt install -y ca-certificates curl gnupg nginx
```

Install Docker (official docs recommended). After install:

```bash
docker --version
docker compose version
```

### 3) Clone your repo

```bash
git clone git@github.com:kartik-sharma-0786/NexaOps.git
cd NexaOps
```

### 4) Configure environment

Create `.env` (never commit this):

```bash
cp .env.example .env
nano .env
```

Fill at minimum:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL`
- `JWT_SECRET`
- `POSTGRES_PASSWORD`
- `DATABASE_URL` (must match `POSTGRES_PASSWORD`)

### 5) Start the stack (production override)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker ps
```

Sanity checks:

```bash
curl -i http://127.0.0.1:3000
curl -i http://127.0.0.1:4000/health
```

### 6) Configure Nginx reverse proxy

Copy the template and edit domains:

```bash
sudo cp deploy/nginx/nexaops.conf /etc/nginx/sites-available/nexaops.conf
sudo nano /etc/nginx/sites-available/nexaops.conf
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/nexaops.conf /etc/nginx/sites-enabled/nexaops.conf
sudo nginx -t
sudo systemctl reload nginx
```

At this point (HTTP only):
- `http://your-domain.com` → web
- `http://api.your-domain.com` → api

### 7) Enable HTTPS (Let’s Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
```

### 8) Updates / redeploy

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

