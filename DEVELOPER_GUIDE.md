# 👨‍💻 دليل المطور - EchoOps CRM

## 📋 جدول المحتويات

- [🏗️ نظرة عامة على المشروع](#-نظرة-عامة-على-المشروع)
- [🛠️ إعداد بيئة التطوير](#-إعداد-بيئة-التطوير)
- [🏛️ البنية التقنية](#-البنية-التقنية)
- [📊 قاعدة البيانات](#-قاعدة-البيانات)
- [🔧 الـ APIs](#-ال-apis)
- [🎨 الفرونت اند](#-الفرونت-اند)
- [🧪 الاختبارات](#-الاختبارات)
- [🚀 النشر](#-النشر)
- [🔒 الأمان](#-الأمان)
- [📈 الأداء](#-الأداء)
- [🐛 استكشاف الأخطاء](#-استكشاف-الأخطاء)

---

## 🏗️ نظرة عامة على المشروع

### EchoOps CRM
نظام إدارة علاقات العملاء المتكامل لشركات العقارات، مبني باستخدام:
- **Backend**: NestJS + TypeScript + MySQL
- **Frontend**: React + TypeScript + Vite
- **DevOps**: Docker + PM2 + Nginx

### المميزات الرئيسية
- 🏢 Multi-tenant architecture
- 👥 RBAC مع 6 أنواع مستخدمين
- 🎯 AI-powered lead scoring
- 💬 WhatsApp Business API integration
- 💳 Stripe payments integration
- 📊 Advanced analytics و reporting

---

## 🛠️ إعداد بيئة التطوير

### المتطلبات الأساسية

```bash
# Node.js 18+ و npm
node --version  # يجب أن يكون 18 أو أحدث
npm --version

# Docker (اختياري)
docker --version
docker-compose --version

# Git
git --version
```

### التثبيت السريع

```bash
# 1. نسخ المشروع
git clone <repository-url>
cd echoops-crm

# 2. تشغيل النظام بالكامل
./START_PROJECT.sh
```

### التثبيت اليدوي

```bash
# 1. إعداد المتغيرات البيئية
cd backend
cp .env.example .env

# 2. تثبيت التبعيات
npm install
cd ../frontend
npm install

# 3. تشغيل قاعدة البيانات
docker-compose up -d mysql redis

# 4. تشغيل Backend
cd ../backend
npm run start:dev

# 5. تشغيل Frontend (terminal جديد)
cd ../frontend
npm run dev
```

### البيانات التجريبية

| النوع | البريد الإلكتروني | كلمة المرور | الصلاحيات |
|-------|-------------------|--------------|-----------|
| Super Admin | `admin@echoops.com` | `Admin123!` | كاملة |
| Company Admin | `company-admin@echoops.com` | `Admin123!` | إدارة الشركة |
| Sales Agent | `agent@echoops.com` | `Admin123!` | المبيعات |

---

## 🏛️ البنية التقنية

### Backend Architecture

```
backend/src/
├── main.ts                 # نقطة الدخول
├── app.module.ts          # الوحدة الرئيسية
├── config/                # إعدادات التطبيق
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
├── auth/                  # نظام المصادقة
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── guards/
│   └── strategies/
├── companies/             # إدارة الشركات
├── users/                 # إدارة المستخدمين
├── leads/                 # إدارة العملاء المحتملين
├── properties/            # إدارة العقارات
├── deals/                 # إدارة الصفقات
├── activities/            # إدارة الأنشطة
├── whatsapp/              # تكامل WhatsApp
├── notifications/         # نظام الإشعارات
├── payments/              # نظام الدفع
├── ai/                    # الذكاء الاصطناعي
├── email/                 # نظام البريد الإلكتروني
└── analytics/             # التحليلات
```

### Frontend Architecture

```
frontend/src/
├── main.tsx               # نقطة الدخول
├── App.tsx               # التطبيق الرئيسي
├── index.css            # التصميم العام
├── lib/
│   ├── api.ts          # API client
│   └── utils.ts        # المساعدات
├── components/
│   ├── layout/         # تخطيط الصفحات
│   ├── pwa/           # PWA components
│   └── ui/            # مكونات واجهة المستخدم
├── pages/              # صفحات التطبيق
└── hooks/              # React hooks مخصصة
```

### نمط المشروع

- **Repository Pattern**: فصل المنطق عن البيانات
- **Dependency Injection**: إدارة التبعيات
- **DTO Pattern**: نقل البيانات بأمان
- **Guard Pattern**: حماية الطرق
- **Interceptor Pattern**: معالجة الطلبات والاستجابات

---

## 📊 قاعدة البيانات

### الجداول الرئيسية

```sql
-- الشركات (Multi-tenant)
companies: id, name, subdomain, email, phone, ...

-- المستخدمين
users: id, first_name, last_name, email, role, status, company_id, ...

-- العملاء المحتملين
leads: id, first_name, last_name, email, phone, status, priority, company_id, ...

-- العقارات
properties: id, title, property_type, price, city, company_id, ...

-- الصفقات
deals: id, title, stage, amount, probability, lead_id, property_id, company_id, ...

-- الأنشطة
activities: id, type, title, description, due_date, lead_id, property_id, company_id, ...
```

### العلاقات

```typescript
// Company -> Users (One to Many)
@OneToMany(() => User, user => user.company)
users: User[];

// Lead -> Activities (One to Many)
@OneToMany(() => Activity, activity => activity.lead)
activities: Activity[];

// Deal -> Lead (Many to One)
@ManyToOne(() => Lead, lead => lead.deals)
lead: Lead;

// Deal -> Property (Many to One)
@ManyToOne(() => Property, property => property.deals)
property: Property;
```

### الفهارس

```sql
-- فهارس الأداء
CREATE INDEX idx_leads_company_status ON leads(company_id, status);
CREATE INDEX idx_properties_company_type ON properties(company_id, property_type);
CREATE INDEX idx_deals_company_stage ON deals(company_id, stage);
CREATE INDEX idx_activities_company_due_date ON activities(company_id, due_date);
```

---

## 🔧 الـ APIs

### Authentication APIs

```typescript
// تسجيل الدخول
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// تسجيل حساب جديد
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "الاسم الأول",
  "last_name": "الاسم الأخير",
  "company_name": "اسم الشركة"
}

// التحقق من المستخدم الحالي
GET /api/auth/me
Authorization: Bearer <token>
```

### CRUD APIs

```typescript
// قائمة العناصر
GET /api/leads?page=1&limit=10&sort=created_at:desc

// إنشاء عنصر جديد
POST /api/leads
{
  "first_name": "أحمد",
  "last_name": "محمد",
  "email": "ahmed@example.com",
  "phone": "+966501234567",
  "status": "new",
  "priority": "high"
}

// تحديث عنصر
PUT /api/leads/:id
{
  "status": "contacted",
  "notes": "تم التواصل مع العميل"
}

// حذف عنصر
DELETE /api/leads/:id
```

### Advanced APIs

```typescript
// البحث والفلترة
GET /api/properties?property_type=apartment&min_price=300000&max_price=800000&city=الرياض

// الإحصائيات
GET /api/analytics/dashboard
GET /api/analytics/sales?period=month
GET /api/analytics/leads?source=website

// WhatsApp APIs
POST /api/whatsapp/messages
{
  "to": "+966501234567",
  "message": "مرحباً بك في شركتنا",
  "type": "text"
}

// AI APIs
GET /api/ai/scoring?lead_id=123
GET /api/ai/forecast?period=6months
GET /api/ai/recommendations?type=leads
```

---

## 🎨 الفرونت اند

### إعداد API Client

```typescript
// lib/api.ts
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor للتوكن
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor لمعالجة الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### استخدام React Query

```typescript
// استخدام useQuery لجلب البيانات
const { data: leads, isLoading, error } = useQuery({
  queryKey: ['leads'],
  queryFn: () => api.getLeads({ limit: 10, sort: 'created_at:desc' }),
});

// استخدام useMutation للعمليات
const createLeadMutation = useMutation({
  mutationFn: (data) => api.createLead(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    toast({ title: "تم إضافة العميل بنجاح" });
  },
});
```

### إدارة الحالة

```typescript
// Context للمصادقة
const AuthContext = createContext();

// Hook مخصص للمصادقة
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### مكونات واجهة المستخدم

```typescript
// مكون جدول البيانات
const DataTable = ({ data, columns }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

---

## 🧪 الاختبارات

### Backend Tests

```typescript
// Unit Test للخدمة
describe('LeadsService', () => {
  let service: LeadsService;
  let repository: Repository<Lead>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a lead', async () => {
    const leadData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
    };

    const result = await service.create(leadData);
    expect(result).toBeDefined();
    expect(result.email).toBe(leadData.email);
  });
});
```

### Frontend Tests

```typescript
// اختبار المكونات
describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByText('تسجيل الدخول')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText('البريد الإلكتروني'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText('كلمة المرور'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('دخول'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

### E2E Tests (قريباً)

```typescript
// اختبار شامل للتطبيق
describe('Lead Management Flow', () => {
  it('should create and manage leads', () => {
    // زيارة الصفحة
    cy.visit('/leads');

    // تسجيل الدخول
    cy.get('[data-cy="email"]').type('admin@echoops.com');
    cy.get('[data-cy="password"]').type('Admin123!');
    cy.get('[data-cy="login-button"]').click();

    // إضافة عميل جديد
    cy.get('[data-cy="add-lead-button"]').click();
    cy.get('[data-cy="first-name"]').type('أحمد');
    cy.get('[data-cy="last-name"]').type('محمد');
    cy.get('[data-cy="email"]').type('ahmed@example.com');
    cy.get('[data-cy="save-button"]').click();

    // التحقق من الإضافة
    cy.contains('أحمد محمد').should('be.visible');
  });
});
```

### تشغيل الاختبارات

```bash
# Backend tests
cd backend
npm run test                    # جميع الاختبارات
npm run test:watch             # مع إعادة التشغيل
npm run test:cov               # مع تقرير التغطية
npm run test:e2e               # الاختبارات الشاملة

# Frontend tests
cd frontend
npm run test                   # جميع الاختبارات
npm run test:ui                # اختبارات واجهة المستخدم
```

---

## 🚀 النشر

### إعداد الإنتاج

```bash
# 1. بناء التطبيق
cd backend && npm run build
cd ../frontend && npm run build

# 2. إعداد PM2
cd backend
pm2 start dist/main.js --name "echoops-crm"
pm2 startup && pm2 save

# 3. إعداد Nginx
sudo cp nginx.conf /etc/nginx/sites-available/echoops-crm
sudo ln -s /etc/nginx/sites-available/echoops-crm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Docker Production

```bash
# بناء الصور
docker-compose -f docker-compose.prod.yml build

# تشغيل الإنتاج
docker-compose -f docker-compose.prod.yml up -d

# مراقبة السجلات
docker-compose logs -f
```

### CI/CD Pipeline (قريباً)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          echo "Deploying to production..."
          # خطوات النشر
```

---

## 🔒 الأمان

### Authentication & Authorization

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### Guards

```typescript
// JWT Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    return requiredRoles.some(role => user.role === role);
  }
}
```

### Security Best Practices

```typescript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);

// CORS
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
});
```

---

## 📈 الأداء

### Database Optimization

```sql
-- فهارس الأداء
CREATE INDEX idx_leads_company_status ON leads(company_id, status);
CREATE INDEX idx_properties_company_price ON properties(company_id, price);
CREATE INDEX idx_deals_company_stage ON deals(company_id, stage);

-- استعلامات محسنة
SELECT * FROM leads
WHERE company_id = ? AND status = ?
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

### Caching Strategy

```typescript
// Redis caching للإحصائيات
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get(key: string) {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 300) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }
}
```

### Performance Monitoring

```typescript
// PM2 monitoring
pm2 monit

// Application metrics
app.use('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  });
});
```

---

## 🐛 استكشاف الأخطاء

### أخطاء شائعة وحلولها

#### 1. خطأ قاعدة البيانات

```bash
# فحص اتصال قاعدة البيانات
mysql -h localhost -u echoops_user -p echoops_crm_db

# فحص السجلات
tail -f backend/logs/app.log
```

#### 2. خطأ في الباك اند

```bash
# تشغيل في وضع debugging
cd backend
npm run start:debug

# فحص المنافذ المستخدمة
netstat -tlnp | grep :3000
```

#### 3. خطأ في الفرونت اند

```bash
# فحص console المتصفح
F12 -> Console

# فحص network requests
F12 -> Network -> XHR

# تشغيل مع verbose logging
cd frontend
npm run dev -- --verbose
```

#### 4. خطأ في Docker

```bash
# فحص containers
docker ps -a

# فحص السجلات
docker-compose logs mysql
docker-compose logs backend

# إعادة بناء
docker-compose down
docker-compose up --build
```

### Logs و Debugging

```typescript
// Logging في الباك اند
import { Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  someMethod() {
    this.logger.log('Info message');
    this.logger.error('Error message');
    this.logger.warn('Warning message');
    this.logger.debug('Debug message');
  }
}
```

```typescript
// Logging في الفرونت اند
import { logger } from '@/lib/logger';

const MyComponent = () => {
  const handleClick = () => {
    logger.info('Button clicked');
    try {
      // some operation
    } catch (error) {
      logger.error('Error occurred:', error);
    }
  };

  return <button onClick={handleClick}>Click me</button>;
};
```

### Health Checks

```bash
# فحص صحة النظام
curl http://localhost:3000/health

# فحص قاعدة البيانات
curl http://localhost:3000/health/database

# فحص Redis
curl http://localhost:3000/health/redis
```

### Backup و Recovery

```bash
# نسخ احتياطي من قاعدة البيانات
mysqldump -u echoops_user -p echoops_crm_db > backup.sql

# استعادة من النسخ الاحتياطي
mysql -u echoops_user -p echoops_crm_db < backup.sql

# نسخ احتياطي من الملفات
tar -czf uploads_backup.tar.gz backend/uploads/
```

---

## 📚 الموارد الإضافية

### التوثيق الرسمي

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### أدوات مفيدة

- [Postman](https://www.postman.com/) - لاختبار APIs
- [TablePlus](https://tableplus.com/) - لإدارة قاعدة البيانات
- [Redis Insight](https://redis.com/redis-enterprise/redis-insight/) - لمراقبة Redis
- [PM2 Dashboard](https://pm2.io/docs/plus/overview/) - لمراقبة التطبيق

### المجتمعات

- [NestJS Community](https://discord.gg/nestjs)
- [React Community](https://reactjs.org/community)
- [TypeScript Community](https://www.typescriptlang.org/community/)

---

## 🎯 أفضل الممارسات

### Backend Best Practices

1. **استخدم DTOs** للتحقق من صحة البيانات
2. **طبقات منفصلة** للمنطق التجاري
3. **معالجة الأخطاء** الشاملة
4. **وحدات الاختبار** لجميع الخدمات
5. **توثيق APIs** باستخدام Swagger

### Frontend Best Practices

1. **TypeScript** للكتابة الثابتة
2. **React Query** لإدارة البيانات
3. **Tailwind CSS** للتصميم المتسق
4. **Component composition** لإعادة الاستخدام
5. **Error boundaries** لمعالجة الأخطاء

### DevOps Best Practices

1. **Docker** للحاويات
2. **CI/CD** للنشر التلقائي
3. **Monitoring** للأداء
4. **Backup** للبيانات
5. **Security** للحماية

---

## 🚀 الخطوات التالية

### للمطور الجديد

1. **اقرأ README.md** - فهم المشروع
2. **اتبع دليل التثبيت** - إعداد البيئة
3. **جرب البيانات التجريبية** - فهم النظام
4. **اقرأ كود الباك اند** - فهم البنية
5. **ساهم في المشروع** - إضافة مميزات

### للمطور المخضرم

1. **راجع البنية التقنية** - تحسين الأداء
2. **أضف اختبارات** - تحسين الجودة
3. **حسّن الأمان** - تطبيق أفضل الممارسات
4. **أضف monitoring** - تتبع الأداء
5. **ساهم في المشروع** - إضافة مميزات متقدمة

---

## 📞 الدعم

### قنوات الدعم

- **📧 البريد الإلكتروني**: dev-support@echoops.com
- **💬 Discord**: [EchoOps Developers](https://discord.gg/echoops)
- **📱 WhatsApp**: +966501234567
- **🐛 GitHub Issues**: للإبلاغ عن المشاكل

### أوقات الدعم

- **السبت - الخميس**: 9:00 ص - 6:00 م
- **الجمعة**: 2:00 م - 6:00 م
- **استجابة سريعة**: خلال 24 ساعة

---

## 🎉 ختام

**EchoOps CRM** هو مشروع متقدم ومتكامل يجمع بين أحدث التقنيات والممارسات الأفضل في تطوير البرمجيات.

**🚀 استمتع بالتطوير وإضافة المميزات الجديدة!**

**📚 للمزيد من التفاصيل، راجع:**
- [README.md](README.md) - النظرة العامة
- [API Documentation](http://localhost:3000/api/docs) - توثيق APIs
- [User Guide](USER_GUIDE.md) - دليل المستخدم