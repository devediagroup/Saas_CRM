# 🏢 EchoOps Real Estate CRM Backend

A comprehensive, multi-tenant SaaS backend for real estate CRM built with NestJS, TypeScript, and MySQL.

## 📋 Overview

EchoOps CRM is a complete real estate management platform that supports multiple companies with isolated data and comprehensive CRM features including lead management, property listings, deal tracking, WhatsApp integration, analytics, and AI-powered insights.

## 🏗️ Architecture

### Technology Stack
- **Framework**: NestJS v10.x
- **Language**: TypeScript 5.x
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Validation**: class-validator

### Key Features
- ✅ **Multi-tenant Architecture** - Complete data isolation per company
- ✅ **Authentication & Authorization** - JWT-based with RBAC
- ✅ **Lead Management** - Complete lead lifecycle tracking
- ✅ **Property Management** - Real estate listings with images
- ✅ **Deal Pipeline** - Sales process management
- ✅ **Activity Tracking** - Comprehensive activity logging
- ✅ **WhatsApp Integration** - Business API integration
- ✅ **Real-time Notifications** - Push and email notifications
- ✅ **Analytics & Reporting** - Dashboard KPIs and custom reports
- ✅ **Subscription Management** - SaaS billing and usage tracking
- ✅ **Security & Audit** - Comprehensive security monitoring
- ✅ **AI Features** - Lead scoring and smart recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js v18.x or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd echoops-crm-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=echoops_crm_db

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h

   # Application Configuration
   NODE_ENV=development
   PORT=3000
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   ```sql
   -- Create database
   CREATE DATABASE echoops_crm_db;

   -- The application will automatically create tables on first run
   -- (synchronize: true in development)
   ```

5. **Start the Application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the Application**
   - **API Base URL**: http://localhost:3000/api
   - **API Documentation**: http://localhost:3000/api/docs
   - **Health Check**: http://localhost:3000/health

## 📚 API Documentation

Once the application is running, visit `http://localhost:3000/api/docs` for interactive API documentation.

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh access token

#### Companies (Multi-tenant)
- `GET /api/companies` - List all companies (Super Admin)
- `POST /api/companies` - Create new company
- `GET /api/companies/:id` - Get company details
- `GET /api/companies/:id/stats` - Get company statistics

#### Users Management
- `GET /api/users` - List company users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `GET /api/users/stats` - Get user statistics

#### Leads Management
- `GET /api/leads` - List company leads
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `GET /api/leads/sources` - Get lead sources
- `GET /api/leads/stats` - Get lead statistics
- `PATCH /api/leads/:id/assign` - Assign lead to user

#### Properties Management
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/stats` - Get property statistics
- `GET /api/properties/search` - Advanced search
- `PATCH /api/properties/:id/status` - Update property status

#### Deals Management
- `GET /api/deals` - List deals
- `POST /api/deals` - Create deal
- `GET /api/deals/:id` - Get deal details
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal
- `GET /api/deals/stats` - Get deal statistics
- `GET /api/deals/pipeline` - Get pipeline view
- `PATCH /api/deals/:id/stage` - Update deal stage
- `PATCH /api/deals/:id/assign` - Assign deal to user
- `GET /api/deals/overdue` - Get overdue deals

#### Activities Management
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get activity details
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/activities/stats` - Get activity statistics
- `GET /api/activities/calendar/:year/:month` - Get calendar view
- `GET /api/activities/overdue` - Get overdue activities
- `GET /api/activities/today` - Get today's activities
- `GET /api/activities/upcoming/:hours` - Get upcoming activities
- `PATCH /api/activities/:id/complete` - Complete activity
- `PATCH /api/activities/:id/cancel` - Cancel activity
- `PATCH /api/activities/:id/postpone` - Postpone activity

#### WhatsApp Integration
- `POST /api/whatsapp/send` - Send WhatsApp message
- `POST /api/whatsapp/send/lead-welcome` - Send welcome to lead
- `POST /api/whatsapp/send/property-details` - Send property details
- `POST /api/whatsapp/send/appointment-reminder` - Send appointment reminder
- `POST /api/whatsapp/send/follow-up` - Send follow-up message
- `POST /api/whatsapp/send/template` - Send template message
- `POST /api/whatsapp/webhook` - Handle incoming messages
- `GET /api/whatsapp/chat-history/:phoneNumber` - Get chat history
- `GET /api/whatsapp/statistics` - Get WhatsApp statistics
- `GET /api/whatsapp/templates` - Get message templates
- `POST /api/whatsapp/campaign` - Create bulk campaign

#### Notifications System
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `GET /api/notifications/stats` - Get notification statistics
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `POST /api/notifications/lead-assigned` - Lead assigned notification
- `POST /api/notifications/deal-stage-changed` - Deal stage notification
- `POST /api/notifications/activity-reminder` - Activity reminder
- `POST /api/notifications/overdue-activity` - Overdue activity alert

#### AI & Analytics
- `GET /api/ai/leads/:leadId/score` - Calculate lead score
- `GET /api/ai/deals/:dealId/predict` - Predict deal outcome
- `GET /api/ai/leads/:leadId/recommendations` - Property recommendations
- `GET /api/ai/analytics/leads` - Lead analytics & insights
- `GET /api/ai/analytics/sales-forecast` - Sales forecasting
- `GET /api/ai/analytics/performance` - Performance analytics

#### Payments & Subscriptions
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment/:id` - Confirm payment
- `POST /api/payments/create-subscription` - Create subscription
- `POST /api/payments/cancel-subscription/:id` - Cancel subscription
- `GET /api/payments/plans` - Get subscription plans
- `GET /api/payments/history/payments` - Payment history
- `GET /api/payments/history/subscriptions` - Subscription history
- `GET /api/payments/analytics` - Payment analytics
- `POST /api/payments/webhook` - Stripe webhook handler

## 🗄️ Database Schema

### Core Entities
- **companies** - Multi-tenant root entities
- **users** - Company users with roles (Super Admin, Company Admin, Sales Manager, Sales Agent, Marketing, Support)
- **leads** - Potential customers with 7-stage pipeline
- **properties** - Real estate listings (Apartments, Villas, Offices, Shops, Land, Warehouses)
- **deals** - Sales opportunities with 7-stage pipeline
- **activities** - All user activities (Calls, Emails, Meetings, WhatsApp, Site Visits, etc.)
- **lead_sources** - Lead origin tracking
- **whatsapp_chats** - WhatsApp conversations (Future)
- **notifications** - System notifications (Future)
- **audit_logs** - Security audit trail (Future)

### Core Tables
- **companies** - Multi-tenant root entities
- **users** - Company users with roles
- **leads** - Potential customers
- **properties** - Real estate listings
- **deals** - Sales opportunities
- **activities** - All user activities
- **lead_sources** - Lead origin tracking
- **whatsapp_chats** - WhatsApp conversations
- **notifications** - System notifications
- **audit_logs** - Security audit trail

### Relationships
```
companies (1) ─── (many) users
companies (1) ─── (many) leads
companies (1) ─── (many) properties
companies (1) ─── (many) deals
leads (many) ─── (many) deals
leads (many) ─── (many) activities
```

## 🔐 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Company-level data isolation
- Password hashing with bcrypt

### API Security
- Rate limiting per company
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet security headers

### Data Protection
- AES-256 encryption at rest
- TLS 1.3 in transit
- PII data masking
- GDPR compliance features

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring & Logging

### Health Checks
- Application health: `/health`
- Database connectivity
- Memory usage monitoring

### Logging
- Winston logger configuration
- Structured logging with levels
- Error tracking and alerts

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set strong JWT secrets
- [ ] Configure SSL certificates
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📈 Performance Optimization

### Database Optimizations
- Indexed queries for performance
- Connection pooling
- Query result caching
- Optimized foreign keys

### Application Optimizations
- Request compression
- Static file caching
- Rate limiting
- Background job processing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] NestJS setup with TypeScript
- [x] MySQL database integration
- [x] JWT authentication
- [x] Multi-tenant architecture
- [x] Basic user management

### Phase 2: Core Features ✅
- [x] Complete lead management
- [x] Property management
- [x] Deal pipeline
- [x] Activity tracking
- [x] WhatsApp integration

### Phase 3: Advanced Features 🚧
- [ ] Subscription management
- [ ] AI features implementation
- [ ] Advanced analytics
- [ ] Security enhancements

### Phase 4: Production Ready 🚧
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation completion
- [ ] Deployment automation

---

**EchoOps CRM Backend** - Built for scale, designed for success! 🏢✨