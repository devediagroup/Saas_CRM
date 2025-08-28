#!/bin/bash

# EchoOps CRM - Environment Setup Script
# This script sets up all required environment variables and configurations

set -e

echo "🔧 Setting up EchoOps CRM Environment..."
echo "==========================================="

# Function to generate a secure random key
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to create .env file
create_env_file() {
    local env_file="$1"

    if [ -f "$env_file" ]; then
        echo "⚠️  $env_file already exists. Skipping..."
        return 0
    fi

    echo "📝 Creating $env_file..."

    cat > "$env_file" << EOF
# ============================================
# EchoOps CRM - Environment Configuration
# Generated on: $(date)
# ============================================

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=echoops_crm_db

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=$(generate_secret)
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=$(generate_secret)
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=development
PORT=3000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# ============================================
# WHATSAPP BUSINESS API CONFIGURATION
# ============================================
# Get these from: https://developers.facebook.com/docs/whatsapp/
WHATSAPP_API_KEY=your_whatsapp_api_key_here
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=$(generate_secret)

# ============================================
# STRIPE PAYMENT CONFIGURATION
# ============================================
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
# For Gmail: Use App Passwords https://support.google.com/accounts/answer/185833
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Alternative: SendGrid
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your_sendgrid_api_key

# ============================================
# REDIS CONFIGURATION (Optional)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# ============================================
# SECURITY CONFIGURATION
# ============================================
ENCRYPTION_KEY=$(generate_secret)
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# ============================================
# LOGGING CONFIGURATION
# ============================================
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14

# ============================================
# API CONFIGURATION
# ============================================
API_DOCS_ENABLED=true
API_PREFIX=api
API_VERSION=v1

# ============================================
# MONITORING CONFIGURATION
# ============================================
# Prometheus Metrics
METRICS_ENABLED=true
METRICS_PORT=9090

# Health Check
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health

# ============================================
# CACHE CONFIGURATION
# ============================================
CACHE_TTL=300
CACHE_MAX_ITEMS=1000

# ============================================
# BACKUP CONFIGURATION
# ============================================
BACKUP_ENABLED=true
BACKUP_PATH=./backups
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30

# ============================================
# DEVELOPMENT CONFIGURATION
# ============================================
DEBUG_MODE=true
SWAGGER_ENABLED=true
CORS_DEBUG=true

# ============================================
# PRODUCTION OVERRIDES
# ============================================
# Uncomment and modify for production
# NODE_ENV=production
# DEBUG_MODE=false
# SWAGGER_ENABLED=false
# CORS_ORIGIN=https://yourdomain.com
# DB_HOST=your-production-db-host
# REDIS_HOST=your-redis-host

# ============================================
# ADDITIONAL SECURITY HEADERS
# ============================================
SECURITY_HEADERS=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true

EOF

    echo "✅ $env_file created successfully!"
    echo "🔑 Generated secure keys:"
    echo "   JWT_SECRET: $(grep "JWT_SECRET=" "$env_file" | cut -d'=' -f2)"
    echo "   ENCRYPTION_KEY: $(grep "ENCRYPTION_KEY=" "$env_file" | cut -d'=' -f2)"
    echo ""
    echo "⚠️  IMPORTANT: Please update the following with your actual values:"
    echo "   - WHATSAPP_API_KEY (from Facebook Developers)"
    echo "   - WHATSAPP_PHONE_NUMBER_ID (from Facebook Developers)"
    echo "   - STRIPE_SECRET_KEY (from Stripe Dashboard)"
    echo "   - STRIPE_WEBHOOK_SECRET (from Stripe Dashboard)"
    echo "   - SMTP_USER and SMTP_PASS (your email credentials)"
    echo ""
}

# Function to create docker-compose override
create_docker_override() {
    local override_file="$1"

    if [ -f "$override_file" ]; then
        echo "⚠️  $override_file already exists. Skipping..."
        return 0
    fi

    echo "🐳 Creating $override_file..."

    cat > "$override_file" << EOF
version: '3.8'

services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: echoops_root_password
      MYSQL_DATABASE: echoops_crm_db
      MYSQL_USER: echoops_user
      MYSQL_PASSWORD: echoops_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - DB_PASSWORD=echoops_password
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run start:dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      timeout: 30s
      retries: 10
      interval: 30s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:3000/api
    depends_on:
      - backend
    command: npm run dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173"]
      timeout: 30s
      retries: 10
      interval: 30s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:

networks:
  default:
    name: echoops_network
EOF

    echo "✅ $override_file created successfully!"
}

# Function to create nginx configuration
create_nginx_config() {
    local nginx_file="$1"

    if [ -f "$nginx_file" ]; then
        echo "⚠️  $nginx_file already exists. Skipping..."
        return 0
    fi

    echo "🌐 Creating $nginx_file..."

    cat > "$nginx_file" << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=uploads:10m rate=1r/s;

    upstream echoops_backend {
        server backend:3000;
    }

    upstream echoops_frontend {
        server frontend:5173;
    }

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # API endpoints
        location /api/ {
            proxy_pass http://echoops_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;

            # Rate limiting for API
            limit_req zone=api burst=20 nodelay;

            # CORS
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since";
        }

        # Frontend
        location / {
            proxy_pass http://echoops_frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # File uploads
        location /uploads/ {
            proxy_pass http://echoops_backend;
            limit_req zone=uploads burst=5 nodelay;
            client_max_body_size 10M;
        }

        # Health check
        location /health {
            proxy_pass http://echoops_backend;
            access_log off;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # SSL Configuration (uncomment when you have SSL certificates)
    # server {
    #     listen 443 ssl http2;
    #     server_name your-domain.com;
    #
    #     ssl_certificate /etc/ssl/certs/your-domain.crt;
    #     ssl_certificate_key /etc/ssl/certs/your-domain.key;
    #
    #     # SSL Settings
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    #     ssl_prefer_server_ciphers off;
    #
    #     location / {
    #         proxy_pass http://echoops_frontend;
    #         # ... rest of configuration
    #     }
    # }
}
EOF

    echo "✅ $nginx_file created successfully!"
}

# Function to create SSL directory structure
create_ssl_directory() {
    local ssl_dir="$1"

    if [ -d "$ssl_dir" ]; then
        echo "⚠️  $ssl_dir already exists. Skipping..."
        return 0
    fi

    echo "🔒 Creating SSL directory structure..."
    mkdir -p "$ssl_dir"
    chmod 700 "$ssl_dir"

    cat > "$ssl_dir/README.md" << EOF
# SSL Certificates Directory

Place your SSL certificates here:

- your-domain.crt (SSL certificate)
- your-domain.key (SSL private key)
- intermediate.crt (Intermediate certificate if required)

## Auto-renewal with Let's Encrypt

\`\`\`bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./your-domain.crt
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./your-domain.key

# Set proper permissions
sudo chmod 600 ./your-domain.key
sudo chown nginx:nginx ./your-domain.crt ./your-domain.key
\`\`\`

## Automatic Renewal

\`\`\`bash
# Add to crontab
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet --post-hook "nginx -s reload"
\`\`\`
EOF

    echo "✅ SSL directory created successfully!"
}

# Function to create PM2 ecosystem file
create_pm2_ecosystem() {
    local pm2_file="$1"

    if [ -f "$pm2_file" ]; then
        echo "⚠️  $pm2_file already exists. Skipping..."
        return 0
    fi

    echo "⚙️  Creating $pm2_file..."

    cat > "$pm2_file" << EOF
module.exports = {
  apps: [{
    name: 'echoops-crm',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    autorestart: true,
    min_uptime: '10s',
    max_restarts: 10,
    listen_timeout: 3000,
    kill_timeout: 5000,
    wait_ready: true,
    health_check: {
      enabled: true,
      url: '/health',
      interval: 30000,
      timeout: 5000,
      retries: 3,
    },
  }],
};
EOF

    echo "✅ $pm2_file created successfully!"
}

# Function to create backup script
create_backup_script() {
    local backup_file="$1"

    if [ -f "$backup_file" ]; then
        echo "⚠️  $backup_file already exists. Skipping..."
        return 0
    fi

    echo "💾 Creating backup script..."

    cat > "$backup_file" << 'EOF'
#!/bin/bash

# EchoOps CRM - Database Backup Script

set -e

# Configuration
BACKUP_DIR="./backups"
DB_HOST=${DB_HOST:-"localhost"}
DB_USER=${DB_USER:-"echoops_user"}
DB_PASS=${DB_PASS:-"echoops_password"}
DB_NAME=${DB_NAME:-"echoops_crm_db"}
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/echoops_backup_$TIMESTAMP.sql"

echo "🔄 Creating database backup..."

# Create backup using mysqldump
mysqldump \
  --host="$DB_HOST" \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --databases "$DB_NAME" \
  --no-tablespaces \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --compress \
  > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

echo "✅ Backup created: $BACKUP_FILE"

# Clean old backups
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -name "*.gz" -type f -mtime +"$RETENTION_DAYS" -delete

echo "✅ Backup process completed!"
echo "📂 Backup location: $BACKUP_FILE"
echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Optional: Upload to cloud storage
# Uncomment and configure as needed

# AWS S3 Upload
# if command -v aws &> /dev/null; then
#     echo "☁️  Uploading to S3..."
#     aws s3 cp "$BACKUP_FILE" "s3://your-bucket/backups/"
#     echo "✅ Backup uploaded to S3"
# fi

# Google Cloud Storage Upload
# if command -v gsutil &> /dev/null; then
#     echo "☁️  Uploading to GCS..."
#     gsutil cp "$BACKUP_FILE" "gs://your-bucket/backups/"
#     echo "✅ Backup uploaded to GCS"
# fi
EOF

    chmod +x "$backup_file"
    echo "✅ Backup script created and made executable!"
}

# Main setup process
echo "📁 Working in directory: $(pwd)"
echo ""

# Create backend .env
if [ -d "backend" ]; then
    create_env_file "backend/.env"
fi

# Create docker-compose override
if [ -f "docker-compose.yml" ]; then
    create_docker_override "docker-compose.override.yml"
fi

# Create nginx configuration
create_nginx_config "nginx.conf"

# Create SSL directory
create_ssl_directory "ssl"

# Create PM2 ecosystem
if [ -d "backend" ]; then
    create_pm2_ecosystem "backend/ecosystem.config.js"
fi

# Create backup script
create_backup_script "backup.sh"

echo ""
echo "🎉 Environment setup completed!"
echo "================================="
echo ""
echo "📋 What was created:"
echo "   ✅ backend/.env - Environment variables"
echo "   ✅ docker-compose.override.yml - Docker services"
echo "   ✅ nginx.conf - Reverse proxy configuration"
echo "   ✅ ssl/ - SSL certificates directory"
echo "   ✅ backend/ecosystem.config.js - PM2 configuration"
echo "   ✅ backup.sh - Database backup script"
echo ""
echo "🔧 Next steps:"
echo "   1. Update the .env file with your actual API keys"
echo "   2. Run: docker-compose up -d"
echo "   3. Run: ./START_PROJECT.sh"
echo "   4. Access: http://localhost:3000/api/docs"
echo ""
echo "🔐 Security Notes:"
echo "   - Change default passwords"
echo "   - Set up SSL certificates for production"
echo "   - Configure firewall rules"
echo "   - Set up monitoring and alerts"
echo ""
echo "📞 Support:"
echo "   - Documentation: backend/README.md"
echo "   - API Docs: http://localhost:3000/api/docs"
echo "   - Logs: backend/logs/app.log"
