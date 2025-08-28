#!/bin/bash

# 🏢 EchoOps CRM - Complete Project Setup Script
# This script sets up and runs the entire EchoOps CRM system

set -e

echo "🚀 Starting EchoOps CRM - Full Stack Setup"
echo "============================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📁 Working in: $SCRIPT_DIR"

# Function to setup and run backend
setup_backend() {
    echo ""
    echo "🔧 Setting up Backend..."
    echo "========================"

    cd "$SCRIPT_DIR/backend"

    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm install

    # Create uploads directory
    mkdir -p uploads logs

    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "🔧 Creating .env file..."
        cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=echoops_crm_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-token-secret-here-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=3000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads

# WhatsApp API (if using)
WHATSAPP_API_KEY=
WHATSAPP_API_URL=

# Redis (for caching - optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Logging
LOG_LEVEL=info

# Encryption
ENCRYPTION_KEY=your-encryption-key-here-change-in-production

# API Documentation
API_DOCS_ENABLED=true
EOF
        echo "✅ .env file created. Please update with your configuration."
    fi

    echo "✅ Backend setup completed!"
}

# Function to setup database
setup_database() {
    echo ""
    echo "🗄️ Setting up Database..."
    echo "========================="

    if command_exists docker && command_exists docker-compose; then
        echo "🐳 Starting database with Docker..."

        cd "$SCRIPT_DIR"

        # Start MySQL and Redis
        docker-compose up -d mysql redis

        # Wait for MySQL to be ready
        echo "⏳ Waiting for MySQL to be ready..."
        sleep 30

        echo "✅ Database containers started!"
    else
        echo "⚠️  Docker not available. Please ensure MySQL is running locally."
        echo "   Make sure MySQL is running on localhost:3306"
        echo "   Database: echoops_crm_db"
        echo "   Username: root"
        echo "   Password: password"
    fi
}

# Function to run database migrations and seeds
setup_database_data() {
    echo ""
    echo "🌱 Setting up Database Data..."
    echo "=============================="

    cd "$SCRIPT_DIR/backend"

    # Wait a bit for database to be fully ready
    sleep 5

    echo "🔄 Running database seeds..."
    npm run seed:run

    echo "✅ Database seeded with sample data!"
}

# Function to setup and run frontend
setup_frontend() {
    echo ""
    echo "🎨 Setting up Frontend..."
    echo "========================"

    cd "$SCRIPT_DIR/frontend"

    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    npm install

    echo "✅ Frontend setup completed!"
}

# Function to start all services
start_services() {
    echo ""
    echo "🚀 Starting All Services..."
    echo "==========================="

    # Start backend in background
    echo "🔧 Starting Backend Server..."
    cd "$SCRIPT_DIR/backend"
    npm run start:dev &
    BACKEND_PID=$!

    # Wait for backend to start
    sleep 10

    # Start frontend in background
    echo "🎨 Starting Frontend Server..."
    cd "$SCRIPT_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!

    echo ""
    echo "🎉 EchoOps CRM is running!"
    echo "=========================="
    echo ""
    echo "📊 Services Status:"
    echo "   ✅ Backend API: http://localhost:3000"
    echo "   ✅ API Documentation: http://localhost:3000/api/docs"
    echo "   ✅ Frontend: http://localhost:5173"
    echo "   ✅ Health Check: http://localhost:3000/health"
    echo ""
    echo "📋 Demo Credentials:"
    echo "   Super Admin: admin@echoops.com / Admin123!"
    echo "   Company Admin: company-admin@echoops.com / Admin123!"
    echo "   Sales Agent: agent@echoops.com / Admin123!"
    echo ""
    echo "📚 Available Features:"
    echo "   ✅ Companies Management (Multi-tenant)"
    echo "   ✅ Users Management (RBAC)"
    echo "   ✅ Leads Management (7-stage pipeline)"
    echo "   ✅ Properties Management (6 property types)"
    echo "   ✅ Deals Management (7-stage pipeline)"
    echo "   ✅ Activities Management (11 activity types)"
    echo "   ✅ JWT Authentication"
    echo "   ✅ Role-based Access Control"
    echo "   ✅ API Documentation (Swagger)"
    echo "   ✅ Sample Data (3 companies, 3 leads, 3 properties, 3 deals, 4 activities)"
    echo ""
    echo "🛑 Press Ctrl+C to stop all services"

    # Wait for user interrupt
    trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

    # Keep the script running
    wait
}

# Main execution
echo "🔄 Step 1: Setting up Backend..."
setup_backend

echo "🔄 Step 2: Setting up Database..."
setup_database

echo "🔄 Step 3: Setting up Frontend..."
setup_frontend

echo "🔄 Step 4: Seeding Database..."
setup_database_data

echo "🔄 Step 5: Starting Services..."
start_services
