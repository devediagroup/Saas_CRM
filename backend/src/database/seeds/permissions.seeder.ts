import { DataSource } from 'typeorm';

export class PermissionsSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const permissionsRepository = this.dataSource.getRepository('permissions');

    // الصلاحيات الأساسية
    const permissions = [
      // Users permissions
      {
        id: '1',
        name: 'users.create',
        display_name: 'إنشاء مستخدمين',
        description: 'إنشاء مستخدمين جدد',
        resource: 'users',
        action: 'create',
      },
      {
        id: '2',
        name: 'users.read',
        display_name: 'قراءة المستخدمين',
        description: 'عرض قائمة المستخدمين وبياناتهم',
        resource: 'users',
        action: 'read',
      },
      {
        id: '3',
        name: 'users.update',
        display_name: 'تحديث المستخدمين',
        description: 'تعديل بيانات المستخدمين',
        resource: 'users',
        action: 'update',
      },
      {
        id: '4',
        name: 'users.delete',
        display_name: 'حذف المستخدمين',
        description: 'حذف المستخدمين من النظام',
        resource: 'users',
        action: 'delete',
      },

      // Developers permissions
      {
        id: '5',
        name: 'developers.create',
        display_name: 'إنشاء مطورين',
        description: 'إضافة مطورين جدد',
        resource: 'developers',
        action: 'create',
      },
      {
        id: '6',
        name: 'developers.read',
        display_name: 'قراءة المطورين',
        description: 'عرض قائمة المطورين وبياناتهم',
        resource: 'developers',
        action: 'read',
      },
      {
        id: '7',
        name: 'developers.update',
        display_name: 'تحديث المطورين',
        description: 'تعديل بيانات المطورين',
        resource: 'developers',
        action: 'update',
      },
      {
        id: '8',
        name: 'developers.delete',
        display_name: 'حذف المطورين',
        description: 'حذف المطورين من النظام',
        resource: 'developers',
        action: 'delete',
      },

      // Projects permissions
      {
        id: '9',
        name: 'projects.create',
        display_name: 'إنشاء مشاريع',
        description: 'إضافة مشاريع جديدة',
        resource: 'projects',
        action: 'create',
      },
      {
        id: '10',
        name: 'projects.read',
        display_name: 'قراءة المشاريع',
        description: 'عرض قائمة المشاريع وبياناتها',
        resource: 'projects',
        action: 'read',
      },
      {
        id: '11',
        name: 'projects.update',
        display_name: 'تحديث المشاريع',
        description: 'تعديل بيانات المشاريع',
        resource: 'projects',
        action: 'update',
      },
      {
        id: '12',
        name: 'projects.delete',
        display_name: 'حذف المشاريع',
        description: 'حذف المشاريع من النظام',
        resource: 'projects',
        action: 'delete',
      },

      // Properties permissions
      {
        id: '13',
        name: 'properties.create',
        display_name: 'إنشاء خصائص',
        description: 'إضافة خصائص جديدة',
        resource: 'properties',
        action: 'create',
      },
      {
        id: '14',
        name: 'properties.read',
        display_name: 'قراءة الخصائص',
        description: 'عرض قائمة الخصائص وبياناتها',
        resource: 'properties',
        action: 'read',
      },
      {
        id: '15',
        name: 'properties.update',
        display_name: 'تحديث الخصائص',
        description: 'تعديل بيانات الخصائص',
        resource: 'properties',
        action: 'update',
      },
      {
        id: '16',
        name: 'properties.delete',
        display_name: 'حذف الخصائص',
        description: 'حذف الخصائص من النظام',
        resource: 'properties',
        action: 'delete',
      },

      // Leads permissions
      {
        id: '17',
        name: 'leads.create',
        display_name: 'إنشاء عملاء محتملين',
        description: 'إضافة عملاء محتملين جدد',
        resource: 'leads',
        action: 'create',
      },
      {
        id: '18',
        name: 'leads.read',
        display_name: 'قراءة العملاء المحتملين',
        description: 'عرض قائمة العملاء المحتملين وبياناتهم',
        resource: 'leads',
        action: 'read',
      },
      {
        id: '19',
        name: 'leads.update',
        display_name: 'تحديث العملاء المحتملين',
        description: 'تعديل بيانات العملاء المحتملين',
        resource: 'leads',
        action: 'update',
      },
      {
        id: '20',
        name: 'leads.delete',
        display_name: 'حذف العملاء المحتملين',
        description: 'حذف العملاء المحتملين من النظام',
        resource: 'leads',
        action: 'delete',
      },

      // Deals permissions
      {
        id: '21',
        name: 'deals.create',
        display_name: 'إنشاء صفقات',
        description: 'إضافة صفقات جديدة',
        resource: 'deals',
        action: 'create',
      },
      {
        id: '22',
        name: 'deals.read',
        display_name: 'قراءة الصفقات',
        description: 'عرض قائمة الصفقات وبياناتها',
        resource: 'deals',
        action: 'read',
      },
      {
        id: '23',
        name: 'deals.update',
        display_name: 'تحديث الصفقات',
        description: 'تعديل بيانات الصفقات',
        resource: 'deals',
        action: 'update',
      },
      {
        id: '24',
        name: 'deals.delete',
        display_name: 'حذف الصفقات',
        description: 'حذف الصفقات من النظام',
        resource: 'deals',
        action: 'delete',
      },

      // Activities permissions
      {
        id: '25',
        name: 'activities.create',
        display_name: 'إنشاء أنشطة',
        description: 'إضافة أنشطة جديدة',
        resource: 'activities',
        action: 'create',
      },
      {
        id: '26',
        name: 'activities.read',
        display_name: 'قراءة الأنشطة',
        description: 'عرض قائمة الأنشطة وبياناتها',
        resource: 'activities',
        action: 'read',
      },
      {
        id: '27',
        name: 'activities.update',
        display_name: 'تحديث الأنشطة',
        description: 'تعديل بيانات الأنشطة',
        resource: 'activities',
        action: 'update',
      },
      {
        id: '28',
        name: 'activities.delete',
        display_name: 'حذف الأنشطة',
        description: 'حذف الأنشطة من النظام',
        resource: 'activities',
        action: 'delete',
      },

      // Analytics permissions
      {
        id: '29',
        name: 'analytics.read',
        display_name: 'قراءة التحليلات',
        description: 'عرض التقارير والتحليلات',
        resource: 'analytics',
        action: 'read',
      },

      // Settings permissions
      {
        id: '30',
        name: 'settings.read',
        display_name: 'قراءة الإعدادات',
        description: 'عرض إعدادات النظام',
        resource: 'settings',
        action: 'read',
      },
      {
        id: '31',
        name: 'settings.update',
        display_name: 'تحديث الإعدادات',
        description: 'تعديل إعدادات النظام',
        resource: 'settings',
        action: 'update',
      },
    ];

    try {
      // حذف الصلاحيات الموجودة
      await permissionsRepository.clear();

      // إدراج الصلاحيات الجديدة
      for (const permission of permissions) {
        await permissionsRepository.save({
          ...permission,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      console.log('✅ تم إنشاء الصلاحيات الأساسية بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الصلاحيات:', error);
      throw error;
    }
  }
}
