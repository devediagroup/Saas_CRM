# 🎨 Frontend - React CRM Dashboard

## 📋 نظرة عامة

واجهة المستخدم الأمامية لنظام CRM المبنية باستخدام **React 18** و **TypeScript**. توفر تجربة مستخدم حديثة ومتجاوبة مع دعم كامل للغة العربية.

## 🌟 المميزات

- **React 18** مع Concurrent Features
- **TypeScript** للكود المكتوب بقوة
- **Tailwind CSS** للتصميم السريع
- **Shadcn/ui** مكونات واجهة مستخدم جميلة
- **RTL Support** دعم كامل للعربية
- **Responsive Design** تصميم متجاوب
- **Dark/Light Mode** نظام الألوان
- **Real-time Updates** تحديثات فورية

## 🛠️ التقنيات

### Core Technologies
- **React 18.0** - مكتبة واجهة المستخدم
- **TypeScript 5.0** - البرمجة المكتوبة
- **Vite 4.0** - أداة البناء السريعة
- **React Router 6** - التوجيه

### UI & Styling
- **Tailwind CSS** - إطار العمل للتصميم
- **Shadcn/ui** - مكونات واجهة المستخدم
- **Lucide React** - مكتبة الأيقونات
- **Cairo Font** - خط عربي جميل

### State Management
- **React Query** - إدارة حالة الخادم
- **React Hook Form** - إدارة النماذج
- **Zod** - التحقق من البيانات
- **Context API** - إدارة الحالة العامة

### HTTP & APIs
- **Axios** - HTTP Client
- **React Query** - API State Management

## 📋 المتطلبات

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 أو **yarn** >= 1.22.0
- **Backend Server** - يعمل على localhost:1337

## 🚀 التثبيت والتشغيل

### 1. تثبيت التبعيات
```bash
npm install
# أو
yarn install
```

### 2. إعداد متغيرات البيئة
```bash
# نسخ ملف البيئة
cp .env.example .env

# تحديث الإعدادات
VITE_API_URL=http://localhost:1337
VITE_APP_NAME=EchoOps CRM
```

### 3. تشغيل الخادم المحلي
```bash
# في وضع التطوير
npm run dev
# أو
yarn dev

# في وضع الإنتاج
npm run build
npm run preview
```

### 4. الوصول للتطبيق
- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin

## 📁 هيكل المشروع

```
frontend/
├── public/                    # الملفات الثابتة
│   ├── favicon.ico           # أيقونة الموقع
│   ├── logo.svg              # شعار التطبيق
│   └── robots.txt            # ملف SEO
├── src/
│   ├── components/           # مكونات React
│   │   ├── layout/          # مكونات التخطيط
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── NotificationDropdown.tsx
│   │   └── ui/              # مكونات واجهة المستخدم
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       └── ... (50+ مكون)
│   ├── pages/               # صفحات التطبيق
│   │   ├── Dashboard.tsx    # لوحة التحكم
│   │   ├── Leads.tsx        # العملاء المحتملين
│   │   ├── Deals.tsx        # الصفقات
│   │   ├── Properties.tsx   # العقارات
│   │   └── ... (25+ صفحة)
│   ├── hooks/               # React Hooks مخصصة
│   │   ├── useNotifications.ts
│   │   ├── useSettings.ts
│   │   └── use-mobile.tsx
│   ├── lib/                 # المكتبات المساعدة
│   │   ├── api.ts          # إعدادات API
│   │   └── utils.ts        # الوظائف المساعدة
│   ├── assets/             # الصور والأصول
│   └── main.tsx            # نقطة دخول التطبيق
├── components.json          # إعدادات Shadcn/ui
├── tailwind.config.ts       # إعدادات Tailwind
├── vite.config.ts          # إعدادات Vite
└── tsconfig.json           # إعدادات TypeScript
```

## 🎨 تصميم النظام

### نظام الألوان
```css
/* الألوان الأساسية */
--primary: 221.2 83.2% 53.3%    /* أزرق EchoOps */
--accent: 210 40% 98%          /* أبيض */
--neutral: 210 40% 98%         /* رمادي فاتح */

/* ألوان الحالة */
--success: 142.1 76.2% 36.3%   /* أخضر */
--warning: 32.5 94.6% 43.7%    /* برتقالي */
--error: 0 84.2% 60.2%         /* أحمر */
```

### الخطوط
- **Cairo** - خط عربي جميل وواضح
- **Fallback** - Arial, sans-serif

### RTL Support
```css
/* دعم الاتجاه من اليمين لليسار */
.rtl {
  direction: rtl;
  text-align: right;
}

.ltr {
  direction: ltr;
  text-align: left;
}
```

## 🔧 الإعدادات

### متغيرات البيئة (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:1337
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=EchoOps CRM
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Features
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WHATSAPP=true

# Theme
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

### إعدادات Vite (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
    },
  },
})
```

### إعدادات Tailwind (tailwind.config.ts)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        accent: 'hsl(var(--accent))',
        // ... باقي الألوان
      },
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

## 📚 المكونات الرئيسية

### DashboardLayout
مكون التخطيط الرئيسي يتضمن:
- **Header** - الشريط العلوي
- **Sidebar** - القائمة الجانبية
- **Main Content** - المحتوى الرئيسي

### API Client (lib/api.ts)
```typescript
// إعداد Axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
})

// API Functions
export const leadsAPI = {
  getLeads: (params?: any) => apiClient.get('/leads', { params }),
  createLead: (data: Lead) => apiClient.post('/leads', { data }),
  updateLead: (id: number, data: Partial<Lead>) => apiClient.put(`/leads/${id}`, { data }),
  deleteLead: (id: number) => apiClient.delete(`/leads/${id}`),
}
```

### React Query Setup
```typescript
// إعداد React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
})

// استخدام في المكونات
const { data: leads, isLoading } = useQuery({
  queryKey: ['leads'],
  queryFn: leadsAPI.getLeads,
})
```

## 🚀 المميزات المتقدمة

### إدارة الحالة
- **React Query** للبيانات من الخادم
- **Context API** للحالة العامة
- **Local Storage** للتفضيلات

### الأداء
- **Code Splitting** - تقسيم الكود
- **Lazy Loading** - تحميل كسول
- **Image Optimization** - تحسين الصور
- **Caching** - التخزين المؤقت

### إمكانية الوصول
- **Keyboard Navigation** - التنقل بالكيبورد
- **Screen Reader Support** - دعم قارئ الشاشة
- **High Contrast** - تباين عالي
- **Focus Management** - إدارة التركيز

## 🧪 الاختبار

### اختبارات الوحدة
```bash
# تشغيل اختبارات Jest
npm test

# مع تغطية الكود
npm run test:coverage
```

### اختبارات E2E
```bash
# اختبارات Playwright
npm run test:e2e

# في وضع المراقبة
npm run test:e2e:watch
```

### اختبارات المكونات
```bash
# اختبارات Storybook
npm run storybook
```

## 🚀 النشر

### بناء التطبيق للإنتاج
```bash
# بناء التطبيق
npm run build

# معاينة البناء
npm run preview

# تحليل حجم الحزمة
npm run analyze
```

### نشر على Vercel
```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر
vercel

# إعداد متغيرات البيئة
vercel env add VITE_API_URL
```

### نشر على Netlify
```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# نشر
netlify deploy --prod

# إعداد متغيرات البيئة
netlify env:set VITE_API_URL
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### مشكلة في API
```javascript
// فحص اتصال API
const checkAPI = async () => {
  try {
    const response = await apiClient.get('/health')
    console.log('API is working:', response.data)
  } catch (error) {
    console.error('API Error:', error)
  }
}
```

#### مشكلة في التصميم
```bash
# إعادة بناء Tailwind
npm run build:css

# فحص الأخطاء في Console
# فحص Network tab
```

#### مشكلة في الأداء
```bash
# تحليل الحزمة
npm run analyze

# فحص React DevTools
# فحص Network tab للطلبات
```

## 📱 التطبيقات المتجاوبة

### نقاط التوقف (Breakpoints)
```css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### دعم الأجهزة
- **Mobile** - 320px - 767px
- **Tablet** - 768px - 1023px
- **Desktop** - 1024px - 1279px
- **Large Desktop** - 1280px+

## 🎯 أفضل الممارسات

### كتابة الكود
- استخدم TypeScript لجميع الملفات
- اتبع اتفاقيات التسمية
- استخدم ESLint و Prettier
- اكتب اختبارات للكود

### الأداء
- استخدم React.memo للمكونات
- تجنب re-renders غير الضرورية
- استخدم lazy loading للمكونات
- حسن الصور والأصول

### إمكانية الوصول
- أضف alt text للصور
- استخدم semantic HTML
- دعم التنقل بالكيبورد
- اختبر مع screen readers

## 📚 المزيد من المعلومات

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Query](https://tanstack.com/query/latest)

## 🤝 المساهمة

نرحب بمساهماتكم في تطوير Frontend:

1. Fork المشروع
2. أنشئ فرع للمميزة الجديدة
3. اكتب الكود مع الاختبارات
4. تأكد من اجتياز جميع الاختبارات
5. أرسل Pull Request

## 📞 الدعم

للمساعدة أو الاستفسارات:
- 📧 Email: frontend-support@echoops.com
- 📖 [Frontend Documentation](https://docs.echoops.com/frontend)
- 🐛 [Report Issues](https://github.com/devediagroup/strapi_crm/issues)

---

**تم التطوير بـ ❤️ بواسطة فريق EchoOps**