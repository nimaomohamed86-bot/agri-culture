# Production Deployment Guide

This guide covers deploying the Agricultural Products Supply Management System to production.

## Architecture Overview

```
[Client Browser] → [CDN/Static Host] → React SPA (Vite build)
                          ↓
                   [Reverse Proxy (Nginx)]
                          ↓
                   [Node.js API (PM2)]
                          ↓
                   [PostgreSQL Database]
                          ↓
              [Cloudinary (optional media)]
```

---

## 1. Database (PostgreSQL)

### Option A: Managed PostgreSQL (Recommended)

Use **Neon**, **Supabase**, **Railway**, or **AWS RDS**:

1. Create a production database
2. Copy the connection string
3. Set `DATABASE_URL` in backend environment:

```
DATABASE_URL="postgresql://user:password@host:5432/agri_supply?schema=public&sslmode=require"
```

### Option B: Self-hosted

```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb agri_supply
sudo -u postgres createuser agri_user -P
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agri_supply TO agri_user;"
```

---

## 2. Backend Deployment

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=<generate-a-strong-64-char-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-domain.com

# Email (recommended for production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM="Agri Supply <noreply@your-domain.com>"

# Cloudinary (recommended for production file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Build & Migrate

```bash
cd backend
npm ci --production=false
npx prisma generate
npx prisma migrate deploy   # or: npx prisma db push
npm run db:seed             # first deploy only
```

### Run with PM2

```bash
npm install -g pm2
pm2 start src/server.js --name agri-supply-api
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }
}
```

Enable HTTPS with Certbot:

```bash
sudo certbot --nginx -d api.your-domain.com
```

---

## 3. Frontend Deployment

### Build

```bash
cd frontend
npm ci
npm run build
```

Output is in `frontend/dist/`.

### Option A: Vercel / Netlify

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://api.your-domain.com/api`
5. Configure redirects for SPA routing:

**Netlify** `_redirects`:
```
/*    /index.html   200
```

**Vercel** `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Option B: Nginx Static Hosting

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/agri-supply/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
    }
}
```

---

## 4. Cloudinary Setup (Recommended)

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret
3. Add to backend `.env`
4. Product images will upload to Cloudinary instead of local disk

Without Cloudinary, files are stored in `backend/uploads/` — ensure persistent storage or volume mounts in Docker.

---

## 5. Docker Deployment (Optional)

### Backend Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: agri_supply
      POSTGRES_USER: agri_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://agri_user:${DB_PASSWORD}@db:5432/agri_supply
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      - db

volumes:
  pgdata:
```

```bash
docker compose up -d
docker compose exec api node prisma/seed.js
```

---

## 6. Security Checklist

- [ ] Use strong `JWT_SECRET` (64+ random bytes)
- [ ] Enable HTTPS everywhere
- [ ] Set `NODE_ENV=production`
- [ ] Restrict CORS to your frontend domain only
- [ ] Use managed PostgreSQL with SSL
- [ ] Never commit `.env` files
- [ ] Configure rate limiting (consider `express-rate-limit`)
- [ ] Set up database backups (daily automated)
- [ ] Use Cloudinary or S3 for file storage (not local disk in production)
- [ ] Configure SMTP for password reset emails

---

## 7. Monitoring & Maintenance

### Health Check

```bash
curl https://api.your-domain.com/api/health
```

### Logs

```bash
pm2 logs agri-supply-api
```

### Database Backup

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Updates

```bash
git pull
cd backend && npm ci && npx prisma migrate deploy && pm2 restart agri-supply-api
cd ../frontend && npm ci && npm run build
# redeploy dist/ to static host
```

---

## 8. Platform-Specific Guides

| Platform | Backend | Frontend | Database |
|----------|---------|----------|----------|
| Railway | Deploy backend folder | Deploy frontend folder | Railway PostgreSQL addon |
| Render | Web Service (Node) | Static Site | Render PostgreSQL |
| Vercel | Serverless (needs adapter) | Static/Vite | Neon/Supabase external |
| AWS | EC2/ECS + PM2 | S3 + CloudFront | RDS PostgreSQL |
| DigitalOcean | App Platform / Droplet | App Platform | Managed DB |

### Railway Quick Deploy

1. Push repo to GitHub
2. Create new project → Add PostgreSQL
3. Add backend service: root `backend`, start `npm start`
4. Set env vars from `.env.example`
5. Add frontend static site or deploy to Vercel

---

## Support

For issues, check:
- API docs: `https://api.your-domain.com/api/docs`
- Prisma logs: `DEBUG=prisma:* npm start`
- Browser network tab for frontend API errors
