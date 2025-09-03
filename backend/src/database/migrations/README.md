# Database Migrations

This directory contains TypeORM migrations for the EchoOps CRM database schema.

## Migration Files

### 1. CreateDevelopersTable (1693248000000)
- Creates the `developers` table
- Includes all developer fields: name, description, contact_info, logo_url, etc.
- Creates indexes for company_id, status, type, and name
- Establishes foreign key relationship with companies table

### 2. CreateProjectsTable (1693248100000)
- Creates the `projects` table
- Includes all project fields: name, description, type, status, location, etc.
- Creates indexes for company_id, developer_id, status, type, location, and name
- Establishes foreign key relationships with companies and developers tables

### 3. AddProjectIdToProperties (1693248200000)
- Adds `project_id` column to the existing `properties` table
- Creates index for project_id
- Establishes foreign key relationship with projects table
- Allows properties to be linked to specific projects

### 4. CreateAuditLogsTable (1693248300000)
- Creates the `audit_logs` table for security and audit tracking
- Includes fields for action, resource, status, severity, user tracking, etc.
- Creates comprehensive indexes for efficient querying
- Establishes foreign key relationships with companies and users tables

### 5. CreateSubscriptionsTable (1693248400000)
- Creates the `subscriptions` table for subscription management
- Includes fields for plan, status, billing cycle, pricing, features, etc.
- Creates indexes for company_id, status, plan, billing cycle, and dates
- Establishes foreign key relationship with companies table

## Running Migrations

### Prerequisites
- Ensure your database connection is properly configured in `.env`
- Make sure the database exists and is accessible

### Commands

```bash
# Run all pending migrations
npm run migration:run

# Generate a new migration (if needed)
npm run migration:generate -- -n MigrationName

# Create a new empty migration
npm run migration:create -- -n MigrationName

# Revert the last migration
npm run migration:revert

# View migration status
npm run typeorm -- migration:show
```

### Environment Variables
Make sure these are set in your `.env` file:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=echoops_crm_db
```

## Migration Order
Migrations are executed in timestamp order. The current order is:
1. CreateDevelopersTable
2. CreateProjectsTable  
3. AddProjectIdToProperties
4. CreateAuditLogsTable
5. CreateSubscriptionsTable

## Rollback
To rollback migrations, use:
```bash
npm run migration:revert
```

**Note**: Be careful with rollbacks in production as they can cause data loss.

## Troubleshooting

### Common Issues
1. **Connection Error**: Check database credentials and connection
2. **Permission Error**: Ensure database user has CREATE, ALTER, DROP permissions
3. **Table Already Exists**: Check if tables were created manually or by synchronize

### Reset Database (Development Only)
```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS echoops_crm_db; CREATE DATABASE echoops_crm_db;"

# Run migrations
npm run migration:run

# Run seeders
npm run seed:run
```

## Production Considerations
- **Never** use `synchronize: true` in production
- Always test migrations on staging environment first
- Backup database before running migrations
- Consider downtime requirements for large schema changes
- Monitor migration execution time and performance impact
