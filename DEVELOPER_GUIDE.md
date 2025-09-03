# 👨‍💻 **دليل المطور - نظام EchoOps Real Estate CRM**

## 📋 **جدول المحتويات**
1. [نظرة عامة على النظام](#نظرة-عامة-على-النظام)
2. [الهيكل التقني](#الهيكل-التقني)
3. [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
4. [هيكل المشروع](#هيكل-المشروع)
5. [قاعدة البيانات](#قاعدة-البيانات)
6. [الواجهة الخلفية (Backend)](#الواجهة-الخلفية-backend)
7. [الواجهة الأمامية (Frontend)](#الواجهة-الأمامية-frontend)
8. [نظام الصلاحيات](#نظام-الصلاحيات)
9. [API Documentation](#api-documentation)
10. [اختبار النظام](#اختبار-النظام)
11. [النشر والإنتاج](#النشر-والإنتاج)
12. [أفضل الممارسات](#أفضل-الممارسات)

---

## 🏗️ **نظرة عامة على النظام**

### **وصف النظام**
EchoOps Real Estate CRM هو نظام إدارة علاقات العملاء متخصص في مجال العقارات، مبني باستخدام:
- **Backend**: NestJS + TypeORM + MySQL
- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: JWT + Role-Based Access Control
- **Security**: Row-Level Security (RLS)

### **الميزات التقنية**
- ✅ **معمارية متعددة الطبقات** (Multi-layered Architecture)
- ✅ **نظام صلاحيات متقدم** مع 5 مستويات من الأدوار
- ✅ **أمان على مستوى الصفوف** لحماية البيانات
- ✅ **API RESTful** مع توثيق شامل
- ✅ **نظام هجرات قاعدة البيانات** (Database Migrations)
- ✅ **نظام البذور** (Database Seeders)

---

## 🛠️ **الهيكل التقني**

### **التقنيات المستخدمة**

#### **Backend Stack**
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: MySQL 8.x
- **ORM**: TypeORM 0.3.x
- **Authentication**: JWT + Passport
- **Validation**: Class-validator + Class-transformer
- **Testing**: Jest + Supertest

#### **Frontend Stack**
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: React Query (TanStack Query)
- **UI Components**: Shadcn/ui
- **Internationalization**: react-i18next
- **Testing**: Jest + React Testing Library

#### **DevOps & Tools**
- **Package Manager**: npm
- **Version Control**: Git
- **Containerization**: Docker
- **Process Manager**: PM2
- **Web Server**: Nginx
- **SSL**: Let's Encrypt

---

## 🚀 **إعداد بيئة التطوير**

### **المتطلبات الأساسية**
- **Node.js**: 18.x أو أحدث
- **npm**: 9.x أو أحدث
- **MySQL**: 8.x أو أحدث
- **Git**: 2.x أو أحدث

### **خطوات الإعداد**

#### **1. استنساخ المشروع**
```bash
git clone https://github.com/your-org/echoops-crm.git
cd echoops-crm
```

#### **2. تثبيت التبعيات**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

#### **3. إعداد قاعدة البيانات**
```bash
# إنشاء قاعدة البيانات
mysql -u root -p
CREATE DATABASE echoops_crm;
CREATE USER 'echoops_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON echoops_crm.* TO 'echoops_user'@'localhost';
FLUSH PRIVILEGES;
```

#### **4. إعداد متغيرات البيئة**
```bash
# Backend (.env)
cd backend
cp .env.example .env

# Frontend (.env)
cd ../frontend
cp .env.example .env
```

#### **5. تشغيل الهجرات والبذور**
```bash
cd backend
npm run migration:run
npm run seed
```

#### **6. تشغيل النظام**
```bash
# Backend (Terminal 1)
cd backend
npm run start:dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

---

## 📁 **هيكل المشروع**

### **هيكل المجلدات**

```
echoops-crm/
├── backend/                 # الواجهة الخلفية
│   ├── src/
│   │   ├── auth/           # نظام المصادقة
│   │   ├── users/          # إدارة المستخدمين
│   │   ├── companies/      # إدارة الشركات
│   │   ├── developers/     # إدارة المطورين
│   │   ├── projects/       # إدارة المشاريع
│   │   ├── properties/     # إدارة الوحدات
│   │   ├── leads/          # إدارة العملاء المحتملين
│   │   ├── deals/          # إدارة الصفقات
│   │   ├── activities/     # إدارة الأنشطة
│   │   ├── analytics/      # التحليلات والتقارير
│   │   ├── notifications/  # نظام الإشعارات
│   │   ├── payments/       # إدارة المدفوعات
│   │   ├── database/       # قاعدة البيانات
│   │   └── config/         # إعدادات النظام
│   ├── dist/               # الملفات المترجمة
│   ├── test/               # اختبارات الوحدة
│   └── package.json
├── frontend/                # الواجهة الأمامية
│   ├── src/
│   │   ├── components/     # مكونات React
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── hooks/          # React Hooks
│   │   ├── contexts/       # React Contexts
│   │   ├── lib/            # مكتبات مساعدة
│   │   ├── locales/        # ملفات الترجمة
│   │   └── assets/         # الصور والموارد
│   ├── public/             # الملفات العامة
│   └── package.json
├── docker-compose.yml       # تكوين Docker
├── nginx.conf               # إعدادات Nginx
└── README.md
```

---

## 🗄️ **قاعدة البيانات**

### **المخطط العام**

#### **الجداول الأساسية**
- **users**: المستخدمون
- **companies**: الشركات
- **user_roles**: الأدوار
- **permissions**: الصلاحيات
- **role_permissions**: ربط الأدوار بالصلاحيات
- **user_company_roles**: ربط المستخدمين بالشركات والأدوار

#### **جداول الأعمال**
- **developers**: المطورون
- **projects**: المشاريع
- **properties**: الوحدات العقارية
- **leads**: العملاء المحتملون
- **deals**: الصفقات
- **activities**: الأنشطة

### **العلاقات الرئيسية**
```sql
-- المستخدمون والشركات
users -> user_company_roles -> companies
users -> user_company_roles -> user_roles

-- المشاريع والوحدات
developers -> projects -> properties

-- العملاء والصفقات
leads -> deals
properties -> leads (unit_id)
properties -> deals (unit_id)
```

### **الهجرات (Migrations)**
```bash
# إنشاء هجرة جديدة
npm run migration:create -- -n MigrationName

# تشغيل الهجرات
npm run migration:run

# التراجع عن الهجرة الأخيرة
npm run migration:revert
```

---

## ⚙️ **الواجهة الخلفية (Backend)**

### **هيكل NestJS**

#### **الوحدات (Modules)**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    AuthModule,
  ],
  controllers: [EntityController],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule {}
```

#### **الخدمات (Services)**
```typescript
@Injectable()
export class EntityService {
  constructor(
    @InjectRepository(Entity)
    private entityRepository: Repository<Entity>,
    private permissionsService: PermissionsService,
  ) {}

  async findAll(userId: string): Promise<Entity[]> {
    // فحص الصلاحيات
    await this.permissionsService.checkPermission(userId, 'entity.read');
    
    // استعلام قاعدة البيانات مع RLS
    return this.entityRepository.find({
      where: { company_id: await this.getCompanyId(userId) }
    });
  }
}
```

#### **المتحكمات (Controllers)**
```typescript
@Controller('entities')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EntityController {
  @Get()
  @Permissions('entity.read')
  async findAll(@User('id') userId: string) {
    return this.entityService.findAll(userId);
  }

  @Post()
  @Permissions('entity.create')
  async create(
    @Body() createEntityDto: CreateEntityDto,
    @User('id') userId: string,
  ) {
    return this.entityService.create(createEntityDto, userId);
  }
}
```

### **نظام الصلاحيات**

#### **Guard الأساسي**
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredPermission = Reflect.getMetadata('permission', context.getHandler());
    
    if (!requiredPermission) return true;
    
    return this.permissionsService.hasPermission(user.id, requiredPermission);
  }
}
```

#### **Decorator الصلاحيات**
```typescript
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permission', permissions);
```

---

## 🎨 **الواجهة الأمامية (Frontend)**

### **هيكل React**

#### **المكونات الأساسية**
```typescript
// PermissionGuard.tsx
export const Can: React.FC<CanProps> = ({ 
  permission, 
  children, 
  fallback 
}) => {
  const { can } = usePermissions();
  
  if (can(permission)) {
    return <>{children}</>;
  }
  
  return fallback || null;
};
```

#### **Hook الصلاحيات**
```typescript
export const usePermissions = () => {
  const { user, permissions } = useAuth();
  
  const can = (permission: string): boolean => {
    return permissions.includes(permission);
  };
  
  const canAny = (permissions: string[]): boolean => {
    return permissions.some(can);
  };
  
  return { can, canAny, permissions, user };
};
```

#### **Context المصادقة**
```typescript
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  
  const login = async (credentials: LoginCredentials) => {
    // منطق تسجيل الدخول
  };
  
  const logout = () => {
    // منطق تسجيل الخروج
  };
  
  return (
    <AuthContext.Provider value={{ user, permissions, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### **إدارة الحالة**
```typescript
// استخدام React Query للبيانات
const { data: leads, isLoading } = useQuery({
  queryKey: ['leads', filters],
  queryFn: () => api.getLeads(filters),
});

// استخدام React Query للطفرات
const createMutation = useMutation({
  mutationFn: (data: CreateLeadDto) => api.createLead(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    toast.success('تم إنشاء العميل المحتمل بنجاح');
  },
});
```

---

## 🔐 **نظام الصلاحيات**

### **الأدوار والصلاحيات**

#### **الأدوار المتاحة**
1. **SUPER_ADMIN**: جميع الصلاحيات
2. **COMPANY_ADMIN**: صلاحيات الشركة
3. **MANAGER**: صلاحيات الإدارة
4. **AGENT**: صلاحيات المبيعات
5. **VIEWER**: صلاحيات القراءة فقط

#### **الصلاحيات المتاحة**
```typescript
const PERMISSIONS = {
  // المستخدمون
  'users.create': 'إنشاء مستخدمين',
  'users.read': 'قراءة بيانات المستخدمين',
  'users.update': 'تحديث بيانات المستخدمين',
  'users.delete': 'حذف المستخدمين',
  
  // المطورون
  'developers.create': 'إنشاء مطورين',
  'developers.read': 'قراءة بيانات المطورين',
  'developers.update': 'تحديث بيانات المطورين',
  'developers.delete': 'حذف المطورين',
  
  // المشاريع
  'projects.create': 'إنشاء مشاريع',
  'projects.read': 'قراءة بيانات المشاريع',
  'projects.update': 'تحديث بيانات المشاريع',
  'projects.delete': 'حذف المشاريع',
  
  // الوحدات
  'properties.create': 'إنشاء وحدات',
  'properties.read': 'قراءة بيانات الوحدات',
  'properties.update': 'تحديث بيانات الوحدات',
  'properties.delete': 'حذف الوحدات',
  
  // العملاء المحتملون
  'leads.create': 'إنشاء عملاء محتملين',
  'leads.read': 'قراءة بيانات العملاء المحتملين',
  'leads.update': 'تحديث بيانات العملاء المحتملين',
  'leads.delete': 'حذف العملاء المحتملين',
  
  // الصفقات
  'deals.create': 'إنشاء صفقات',
  'deals.read': 'قراءة بيانات الصفقات',
  'deals.update': 'تحديث بيانات الصفقات',
  'deals.delete': 'حذف الصفقات',
  
  // الأنشطة
  'activities.create': 'إنشاء أنشطة',
  'activities.read': 'قراءة بيانات الأنشطة',
  'activities.update': 'تحديث بيانات الأنشطة',
  'activities.delete': 'حذف الأنشطة',
  
  // التحليلات
  'analytics.read': 'قراءة التحليلات والتقارير',
  
  // الإشعارات
  'notifications.create': 'إنشاء إشعارات',
  'notifications.read': 'قراءة الإشعارات',
  'notifications.update': 'تحديث الإشعارات',
  'notifications.delete': 'حذف الإشعارات',
  
  // المدفوعات
  'payments.create': 'إنشاء مدفوعات',
  'payments.read': 'قراءة بيانات المدفوعات',
  'payments.update': 'تحديث بيانات المدفوعات',
};
```

### **تطبيق الصلاحيات**

#### **في Backend**
```typescript
// فحص الصلاحيات في الخدمات
async createEntity(data: CreateEntityDto, userId: string) {
  await this.permissionsService.checkPermission(userId, 'entity.create');
  // ... باقي المنطق
}

// حماية المسارات
@Post()
@Permissions('entity.create')
async create(@Body() data: CreateEntityDto, @User('id') userId: string) {
  return this.entityService.create(data, userId);
}
```

#### **في Frontend**
```typescript
// حماية المكونات
<Can permission="entity.create">
  <Button onClick={handleCreate}>إنشاء جديد</Button>
</Can>

// حماية الصفحات
<Route 
  path="/entities" 
  element={
    <ProtectedRoute permission="entity.read">
      <EntitiesPage />
    </ProtectedRoute>
  } 
/>
```

---

## 📚 **API Documentation**

### **نقاط النهاية الأساسية**

#### **المصادقة**
```http
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
```

#### **المستخدمون**
```http
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

#### **المطورون**
```http
GET    /developers
POST   /developers
GET    /developers/:id
PUT    /developers/:id
DELETE /developers/:id
```

#### **المشاريع**
```http
GET    /projects
POST   /projects
GET    /projects/:id
PUT    /projects/:id
DELETE /projects/:id
```

#### **الوحدات**
```http
GET    /properties
POST   /properties
GET    /properties/:id
PUT    /properties/:id
DELETE /properties/:id
```

#### **العملاء المحتملون**
```http
GET    /leads
POST   /leads
GET    /leads/:id
PUT    /leads/:id
DELETE /leads/:id
GET    /leads/by-unit/:unitId
GET    /leads/by-project/:projectId
GET    /leads/by-developer/:developerId
```

#### **الصفقات**
```http
GET    /deals
POST   /deals
GET    /deals/:id
PUT    /deals/:id
DELETE /deals/:id
GET    /deals/by-unit/:unitId
GET    /deals/by-project/:projectId
GET    /deals/by-developer/:developerId
```

### **نماذج البيانات (DTOs)**

#### **إنشاء عميل محتمل**
```typescript
export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('SA')
  phone: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  unit_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

---

## 🧪 **اختبار النظام**

### **اختبارات Backend**

#### **اختبارات الوحدة**
```bash
# تشغيل جميع الاختبارات
npm run test

# تشغيل الاختبارات مع التغطية
npm run test:cov

# تشغيل الاختبارات في وضع المراقبة
npm run test:watch
```

#### **اختبارات التكامل**
```bash
# تشغيل اختبارات التكامل
npm run test:e2e
```

#### **أمثلة الاختبارات**
```typescript
describe('LeadsService', () => {
  let service: LeadsService;
  let repository: Repository<Lead>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
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
    const createLeadDto = {
      name: 'Test Lead',
      email: 'test@example.com',
      phone: '+966501234567',
    };

    const result = await service.create(createLeadDto, 'user-id');
    expect(result.name).toBe(createLeadDto.name);
  });
});
```

### **اختبارات Frontend**

#### **اختبارات الوحدة**
```bash
# تشغيل الاختبارات
npm run test

# تشغيل الاختبارات مع التغطية
npm run test:coverage
```

#### **أمثلة الاختبارات**
```typescript
import { render, screen } from '@testing-library/react';
import { LeadsPage } from './LeadsPage';

describe('LeadsPage', () => {
  it('renders leads table', () => {
    render(<LeadsPage />);
    expect(screen.getByText('العملاء المحتملون')).toBeInTheDocument();
  });

  it('shows create button for users with permission', () => {
    render(<LeadsPage />);
    expect(screen.getByText('إضافة عميل محتمل')).toBeInTheDocument();
  });
});
```

---

## 🚀 **النشر والإنتاج**

### **إعدادات الإنتاج**

#### **متغيرات البيئة**
```bash
# Backend
NODE_ENV=production
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=echoops_crm
DATABASE_USER=echoops_user
DATABASE_PASSWORD=secure_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Frontend
VITE_API_URL=https://api.echoops.com
VITE_APP_NAME=EchoOps CRM
```

#### **بناء التطبيق**
```bash
# Backend
npm run build
npm run start:prod

# Frontend
npm run build
```

### **Docker Deployment**

#### **Dockerfile Backend**
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

#### **Dockerfile Frontend**
```dockerfile
FROM nginx:alpine

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### **Docker Compose**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: echoops_crm
      MYSQL_USER: echoops_user
      MYSQL_PASSWORD: user_password
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### **PM2 Process Manager**
```bash
# تثبيت PM2
npm install -g pm2

# تشغيل التطبيق
pm2 start ecosystem.config.js

# مراقبة التطبيق
pm2 monit

# إعادة تشغيل التطبيق
pm2 restart all
```

---

## 💡 **أفضل الممارسات**

### **Backend Best Practices**

#### **1. إدارة الأخطاء**
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

#### **2. Validation**
```typescript
export class CreateEntityDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

#### **3. Logging**
```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class EntityService {
  private readonly logger = new Logger(EntityService.name);

  async create(data: CreateEntityDto) {
    this.logger.log(`Creating entity: ${data.name}`);
    // ... منطق الإنشاء
  }
}
```

### **Frontend Best Practices**

#### **1. Error Boundaries**
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>حدث خطأ ما.</h1>;
    }

    return this.props.children;
  }
}
```

#### **2. Lazy Loading**
```typescript
const LeadsPage = lazy(() => import('./pages/Leads'));
const DealsPage = lazy(() => import('./pages/Deals'));

function App() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <Routes>
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/deals" element={<DealsPage />} />
      </Routes>
    </Suspense>
  );
}
```

#### **3. Performance Optimization**
```typescript
// استخدام useMemo للقيم المحسوبة
const filteredData = useMemo(() => {
  return data.filter(item => item.status === statusFilter);
}, [data, statusFilter]);

// استخدام useCallback للدوال
const handleSubmit = useCallback((data: FormData) => {
  submitMutation.mutate(data);
}, [submitMutation]);
```

---

## 🔧 **استكشاف الأخطاء**

### **مشاكل شائعة وحلولها**

#### **1. مشاكل قاعدة البيانات**
```bash
# فحص اتصال قاعدة البيانات
mysql -u echoops_user -p -h localhost echoops_crm

# إعادة تشغيل خدمة MySQL
sudo systemctl restart mysql

# فحص السجلات
sudo tail -f /var/log/mysql/error.log
```

#### **2. مشاكل Backend**
```bash
# فحص السجلات
pm2 logs backend

# إعادة تشغيل الخدمة
pm2 restart backend

# فحص حالة الخدمة
pm2 status
```

#### **3. مشاكل Frontend**
```bash
# مسح ذاكرة التخزين المؤقت
npm run build -- --force

# فحص التبعيات
npm audit

# إعادة تثبيت التبعيات
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 **الدعم والتواصل**

### **فريق التطوير**
- **Lead Developer**: [اسم المطور]
- **Backend Developer**: [اسم المطور]
- **Frontend Developer**: [اسم المطور]
- **DevOps Engineer**: [اسم المهندس]

### **قنوات التواصل**
- **Email**: dev@echoops.com
- **Slack**: #echoops-dev
- **GitHub Issues**: [رابط المستودع]
- **Documentation**: [رابط التوثيق]

---

## 📝 **ملاحظات التطوير**

### **قواعد التطوير**
1. **Git Flow**: استخدم Git Flow workflow
2. **Code Review**: جميع التغييرات تحتاج مراجعة
3. **Testing**: اكتب اختبارات لكل ميزة جديدة
4. **Documentation**: حدث التوثيق مع كل تغيير
5. **Security**: راجع الأمان في كل مراجعة

### **معايير الكود**
- **TypeScript**: استخدم TypeScript لجميع الملفات
- **ESLint**: اتبع قواعد ESLint
- **Prettier**: استخدم Prettier لتنسيق الكود
- **Conventional Commits**: استخدم Conventional Commits

---

**آخر تحديث**: ديسمبر 2024  
**الإصدار**: 1.0.0  
**النظام**: EchoOps Real Estate CRM
