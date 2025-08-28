#!/bin/bash

# EchoOps CRM - Quick Start Script
# This script helps developers get started quickly

set -e

echo "🚀 Starting EchoOps CRM..."
echo "=============================="

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

if ! command_exists mysql; then
    echo "⚠️  MySQL is not installed locally. Make sure MySQL is running or use Docker."
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Navigate to backend directory
cd "$SCRIPT_DIR/backend"

echo "📁 Working in: $(pwd)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your configuration."
fi

# Check if Docker is available for database
if command_exists docker && command_exists docker-compose; then
    echo "🐳 Docker detected. Starting database..."
    docker-compose up -d mysql redis

    # Wait for MySQL to be ready
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 30
else
    echo "⚠️  Docker not available. Please ensure MySQL is running locally."
fi

# Start the backend server
echo "🚀 Starting backend server..."
npm run start:dev &

BACKEND_PID=$!

# Navigate to frontend directory
cd "$SCRIPT_DIR/frontend"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Start the frontend server
echo "🚀 Starting frontend server..."
npm run dev &

FRONTEND_PID=$!

echo ""
echo "🎉 EchoOps CRM is starting up!"
echo "==============================="
echo "📊 Backend API: http://localhost:3000"
echo "🎨 Frontend: http://localhost:5173"
echo "📚 API Documentation: http://localhost:3000/api/docs"
echo "🏥 Health Check: http://localhost:3000/health"
echo ""
echo "📝 Demo Credentials:"
echo "   Super Admin: admin@echoops.com / Admin123!"
echo "   Company Admin: company-admin@echoops.com / Admin123!"
echo "   Sales Agent: agent@echoops.com / Admin123!"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"

# Wait for user interrupt
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Keep the script running
wait
