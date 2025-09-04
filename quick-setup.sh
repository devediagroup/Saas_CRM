#!/bin/bash

# EchoOps CRM Quick Setup Script
# This script sets up the development environment quickly

set -e

echo "🚀 EchoOps CRM Quick Setup"
echo "=========================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << 'EOF'
# Development Environment Variables

# Database
POSTGRES_DB=echoops_crm_dev
POSTGRES_USER=echoops_dev
POSTGRES_PASSWORD=dev_password_123

# JWT (Development only - change for production!)
JWT_SECRET=dev_jwt_secret_key_not_for_production_use_only_development
JWT_REFRESH_SECRET=dev_jwt_refresh_secret_key_not_for_production_use_only_development
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=EchoOps CRM (Dev)
VITE_APP_VERSION=1.0.0-dev
VITE_APP_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8080

# Admin
PGADMIN_EMAIL=admin@dev.local
PGADMIN_PASSWORD=admin123

# Redis Commander
REDIS_COMMANDER_USER=admin
REDIS_COMMANDER_PASSWORD=admin123
EOF
    print_success ".env file created"
else
    print_status ".env file already exists"
fi

# Create SSL directory and certificates for development
print_status "Setting up SSL certificates for development..."
mkdir -p ssl
if [ ! -f "ssl/cert.pem" ]; then
    openssl req -x509 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=SA/ST=Riyadh/L=Riyadh/O=EchoOps-Dev/CN=localhost" > /dev/null 2>&1
    print_success "SSL certificates generated"
fi

# Create necessary directories
print_status "Creating directories..."
mkdir -p logs uploads backups
print_success "Directories created"

# Start services
print_status "Starting EchoOps CRM services..."
docker-compose -f docker-compose-postgres.yml up -d

print_status "Waiting for services to start..."
sleep 15

# Check if services are running
print_status "Checking service status..."
if docker-compose -f docker-compose-postgres.yml ps | grep -q "Up"; then
    print_success "Services are starting up!"
else
    print_warning "Some services may not be running. Check with: docker-compose -f docker-compose-postgres.yml ps"
fi

echo ""
print_success "🎉 EchoOps CRM Setup Complete!"
echo ""
print_status "Access your application:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  ⚡ Backend API: http://localhost:3001"
echo "  🔧 Database Admin: http://localhost:8082 (admin@dev.local / admin123)"
echo "  📊 Redis Commander: http://localhost:8081 (admin / admin123)"
echo "  🌍 Nginx Proxy: http://localhost:8080"
echo ""
print_status "Useful commands:"
echo "  📊 View logs: docker-compose -f docker-compose-postgres.yml logs -f"
echo "  ⏹️  Stop services: docker-compose -f docker-compose-postgres.yml down"
echo "  🔄 Restart: docker-compose -f docker-compose-postgres.yml restart"
echo "  🔍 Service status: docker-compose -f docker-compose-postgres.yml ps"
echo ""
print_warning "This is a DEVELOPMENT setup. For production, use the deployment guide!"
