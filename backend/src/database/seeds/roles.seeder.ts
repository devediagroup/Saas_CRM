import { DataSource } from 'typeorm';

export class RolesSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const rolesRepository = this.dataSource.getRepository('user_roles');

    // الأدوار الأساسية
    const roles = [
      {
        id: '1',
        name: 'SUPER_ADMIN',
        display_name: 'مدير النظام',
        description: 'مدير النظام مع جميع الصلاحيات',
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '2',
        name: 'COMPANY_ADMIN',
        display_name: 'مدير الشركة',
        description: 'مدير الشركة مع صلاحيات إدارية كاملة',
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '3',
        name: 'MANAGER',
        display_name: 'مدير',
        description: 'مدير مع صلاحيات إدارية محدودة',
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '4',
        name: 'AGENT',
        display_name: 'وكيل',
        description: 'وكيل مبيعات مع صلاحيات أساسية',
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '5',
        name: 'VIEWER',
        display_name: 'مشاهد',
        description: 'مستخدم مع صلاحيات قراءة فقط',
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    try {
      // حذف الأدوار الموجودة
      await rolesRepository.clear();

      // إدراج الأدوار الجديدة
      for (const role of roles) {
        await rolesRepository.save(role);
      }

      console.log('✅ تم إنشاء الأدوار الأساسية بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الأدوار:', error);
      throw error;
    }
  }
}
