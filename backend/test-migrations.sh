#!/bin/bash

# Test Database Migrations Script
# This script helps test the database migrations

echo "🚀 Testing Database Migrations for EchoOps CRM"
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy env.example to .env and configure your database settings"
    exit 1
fi

# Load environment variables
source .env

echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_DATABASE"
echo "   Username: $DB_USERNAME"
echo ""

# Check if database exists
echo "🔍 Checking database connection..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "USE $DB_DATABASE;" 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your database configuration in .env file"
    exit 1
fi

# Check if migrations table exists
echo "🔍 Checking migrations table..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT * FROM migrations LIMIT 1;" "$DB_DATABASE" 2>/dev/null; then
    echo "✅ Migrations table exists"
else
    echo "⚠️  Migrations table doesn't exist (this is normal for new databases)"
fi

echo ""
echo "📋 Available Migration Files:"
ls -la src/database/migrations/

echo ""
echo "🔄 To run migrations, use:"
echo "   npm run migration:run"
echo ""
echo "🔄 To revert migrations, use:"
echo "   npm run migration:revert"
echo ""
echo "🔍 To check migration status, use:"
echo "   npm run typeorm -- migration:show"
echo ""
echo "🧪 To test the application after migrations:"
echo "   npm run build"
echo "   npm run start:dev"
echo ""
echo "✅ Migration testing setup complete!"
