# Database Setup Guide - EchoOps CRM

## 🚀 Quick Start

### 1. Prerequisites
- MySQL 8.0+ installed and running
- Node.js 18+ and npm
- Git

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Edit .env with your database credentials
nano .env
```

### 3. Database Creation
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE echoops_crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional, for security)
CREATE USER 'echoops_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON echoops_crm_db.* TO 'echoops_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Migrations
```bash
# Run all migrations
npm run migration:run

# Check migration status
npm run typeorm -- migration:show
```

### 6. Run Seeders (Optional)
```bash
npm run seed:run
```

### 7. Start Application
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📊 Database Schema Overview

### Core Tables
- **companies** - Multi-tenant company information
- **users** - User accounts and authentication
- **roles** - User roles and permissions
- **leads** - Sales leads and prospects
- **deals** - Sales opportunities and deals
- **properties** - Real estate properties/units
- **activities** - User activities and interactions

### New Tables (Added in Latest Update)
- **developers** - Real estate developers
- **projects** - Real estate projects
- **audit_logs** - Security audit trail
- **subscriptions** - Subscription plans and billing

### Relationships
```
Company (1) → (Many) Users, Developers, Projects, Properties, etc.
Developer (1) → (Many) Projects
Project (1) → (Many) Properties
Property (Many) → (1) Project, Developer
User (Many) → (1) Company, Role
```

## 🔧 Migration Commands

### View Available Commands
```bash
npm run typeorm -- --help
```

### Generate New Migration
```bash
npm run migration:generate -- -n MigrationName
```

### Create Empty Migration
```bash
npm run migration:create -- -n MigrationName
```

### Run Migrations
```bash
npm run migration:run
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Show Migration Status
```bash
npm run typeorm -- migration:show
```

## 🧪 Testing Migrations

### Test Script
```bash
# Make script executable
chmod +x test-migrations.sh

# Run test script
./test-migrations.sh
```

### Manual Testing
```bash
# Check if tables exist
mysql -u root -p -e "USE echoops_crm_db; SHOW TABLES;"

# Check table structure
mysql -u root -p -e "USE echoops_crm_db; DESCRIBE developers;"
mysql -u root -p -e "USE echoops_crm_db; DESCRIBE projects;"
mysql -u root -p -e "USE echoops_crm_db; DESCRIBE properties;"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if MySQL is running
sudo systemctl status mysql
# or
brew services list | grep mysql

# Start MySQL if stopped
sudo systemctl start mysql
# or
brew services start mysql
```

#### 2. Access Denied
```bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Migration Errors
```bash
# Check migration status
npm run typeorm -- migration:show

# Revert problematic migration
npm run migration:revert

# Check logs
tail -f logs/app.log
```

#### 4. Build Errors
```bash
# Clean and rebuild
npm run clean
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### Reset Database (Development Only)
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS echoops_crm_db; CREATE DATABASE echoops_crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
npm run migration:run

# Run seeders
npm run seed:run
```

## 📈 Production Considerations

### Security
- Use strong passwords for database users
- Limit database user permissions
- Enable SSL connections
- Regular security updates

### Performance
- Configure MySQL buffer pool size
- Enable query cache
- Monitor slow queries
- Regular maintenance

### Backup
- Set up automated backups
- Test restore procedures
- Monitor backup success/failure
- Store backups securely

## 🔗 Useful Links

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeORM Documentation](https://typeorm.io/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Project README](../README.md)
- [Migrations README](src/database/migrations/README.md)

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review error logs
3. Check migration status
4. Consult project documentation
5. Create an issue in the project repository
