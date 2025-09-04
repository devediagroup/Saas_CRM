# 🚀 EchoOps CRM Production Deployment Guide

## 📋 Pre-Deployment Checklist

### System Requirements
- ✅ Docker Engine 20.10+
- ✅ Docker Compose 2.0+  
- ✅ 4GB+ RAM
- ✅ 50GB+ Storage
- ✅ Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+

### Security Requirements
- ✅ Strong passwords configured
- ✅ SSL certificates ready
- ✅ Firewall configured
- ✅ SSH access secured

---

## 🔧 Deployment Steps

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd crm-strapi

# Create production environment file
cp .env.production.template .env.production

# Edit production environment (CRITICAL!)
nano .env.production
```

**🚨 CRITICAL: Update these values in .env.production:**
- `JWT_SECRET` - Generate 64-character random string
- `JWT_REFRESH_SECRET` - Generate 64-character random string  
- `POSTGRES_PASSWORD` - Strong database password
- `VITE_API_URL` - Your domain API URL
- `CORS_ORIGIN` - Your domain URLs

### 2. Generate Secure Secrets

```bash
# Generate JWT secrets (run these commands)
openssl rand -hex 64  # Use for JWT_SECRET
openssl rand -hex 64  # Use for JWT_REFRESH_SECRET
```

### 3. SSL Certificate Setup

**For Development/Testing (Self-signed):**
```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
    -subj "/C=SA/ST=Riyadh/L=Riyadh/O=EchoOps/CN=localhost"
```

**For Production (Let's Encrypt):**
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

### 4. Deploy Services

```bash
# Make deployment script executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

**Or manually:**
```bash
# Pull and build services
docker-compose -f docker-compose-postgres.yml --env-file .env.production up -d --build

# Check service status
docker-compose -f docker-compose-postgres.yml ps
```

### 5. Verify Deployment

```bash
# Check service health
docker-compose -f docker-compose-postgres.yml logs backend
docker-compose -f docker-compose-postgres.yml logs frontend

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:3000/
```

---

## 🌍 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:3001 | REST API |
| **Nginx Proxy** | http://localhost:8080 | Load balancer |
| **pgAdmin** | http://localhost:8082 | Database admin |
| **Redis Commander** | http://localhost:8081 | Cache admin |

---

## 🔐 Production Security Configuration

### 1. Firewall Setup (Ubuntu/CentOS)

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 8080  # Nginx proxy
sudo ufw enable

# Block direct access to internal services
sudo ufw deny 3001   # Backend
sudo ufw deny 5432   # PostgreSQL
sudo ufw deny 6379   # Redis
```

### 2. Database Security

```bash
# Create backup user
docker-compose -f docker-compose-postgres.yml exec postgres psql -U echoops_user -d echoops_crm -c "
CREATE USER backup_user WITH PASSWORD 'secure_backup_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
"
```

### 3. Regular Updates

```bash
# Create update script
cat > update-production.sh << 'EOF'
#!/bin/bash
docker-compose -f docker-compose-postgres.yml pull
docker-compose -f docker-compose-postgres.yml up -d --build
docker system prune -f
EOF

chmod +x update-production.sh
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose-postgres.yml ps

# View logs
docker-compose -f docker-compose-postgres.yml logs -f backend
docker-compose -f docker-compose-postgres.yml logs -f frontend

# Monitor resources
docker stats
```

### Backup Setup

```bash
# Create backup script
cat > backup-database.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose-postgres.yml exec -T postgres pg_dump -U echoops_user echoops_crm > backups/backup_$DATE.sql
find backups/ -name "backup_*.sql" -mtime +30 -delete
EOF

chmod +x backup-database.sh

# Setup cron job for daily backups
echo "0 2 * * * /path/to/backup-database.sh" | crontab -
```

---

## 🚨 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check logs
docker-compose -f docker-compose-postgres.yml logs

# Restart services
docker-compose -f docker-compose-postgres.yml restart
```

**Database connection issues:**
```bash
# Check PostgreSQL
docker-compose -f docker-compose-postgres.yml exec postgres psql -U echoops_user -d echoops_crm -c "SELECT 1;"
```

**Frontend build issues:**
```bash
# Rebuild frontend
docker-compose -f docker-compose-postgres.yml build --no-cache frontend
```

### Performance Optimization

**Database optimization:**
```sql
-- Run these in pgAdmin
VACUUM ANALYZE;
REINDEX DATABASE echoops_crm;
```

**Cache optimization:**
```bash
# Clear Redis cache
docker-compose -f docker-compose-postgres.yml exec redis redis-cli FLUSHALL
```

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/crm-strapi
            git pull origin main
            ./deploy-production.sh
```

---

## 📝 Final Checklist

- [ ] ✅ Environment variables configured
- [ ] ✅ SSL certificates installed
- [ ] ✅ Firewall configured
- [ ] ✅ Database backups scheduled
- [ ] ✅ Monitoring setup
- [ ] ✅ Health checks passing
- [ ] ✅ Performance tested
- [ ] ✅ Security review completed

---

## 🎉 Success!

Your EchoOps CRM is now running in production! 

**Next Steps:**
1. 🔍 Monitor logs for the first 24 hours
2. 📊 Set up application monitoring (optional)
3. 🔄 Configure automated backups
4. 📧 Set up alerts for system issues
5. 📈 Monitor performance metrics

**Support:**
- Check logs: `docker-compose logs`
- Restart services: `docker-compose restart`
- Update system: `./update-production.sh`
