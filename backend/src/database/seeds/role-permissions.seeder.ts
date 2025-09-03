import { DataSource } from 'typeorm';

export class RolePermissionsSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const rolePermissionsRepository =
      this.dataSource.getRepository('role_permissions');

    // ربط الأدوار بالصلاحيات
    const rolePermissions = [
      // SUPER_ADMIN - جميع الصلاحيات
      { role_id: '1', permission_id: '1' }, // users.create
      { role_id: '1', permission_id: '2' }, // users.read
      { role_id: '1', permission_id: '3' }, // users.update
      { role_id: '1', permission_id: '4' }, // users.delete
      { role_id: '1', permission_id: '5' }, // developers.create
      { role_id: '1', permission_id: '6' }, // developers.read
      { role_id: '1', permission_id: '7' }, // developers.update
      { role_id: '1', permission_id: '8' }, // developers.delete
      { role_id: '1', permission_id: '9' }, // projects.create
      { role_id: '1', permission_id: '10' }, // projects.read
      { role_id: '1', permission_id: '11' }, // projects.update
      { role_id: '1', permission_id: '12' }, // projects.delete
      { role_id: '1', permission_id: '13' }, // properties.create
      { role_id: '1', permission_id: '14' }, // properties.read
      { role_id: '1', permission_id: '15' }, // properties.update
      { role_id: '1', permission_id: '16' }, // properties.delete
      { role_id: '1', permission_id: '17' }, // leads.create
      { role_id: '1', permission_id: '18' }, // leads.read
      { role_id: '1', permission_id: '19' }, // leads.update
      { role_id: '1', permission_id: '20' }, // leads.delete
      { role_id: '1', permission_id: '21' }, // deals.create
      { role_id: '1', permission_id: '22' }, // deals.read
      { role_id: '1', permission_id: '23' }, // deals.update
      { role_id: '1', permission_id: '24' }, // deals.delete
      { role_id: '1', permission_id: '25' }, // activities.create
      { role_id: '1', permission_id: '26' }, // activities.read
      { role_id: '1', permission_id: '27' }, // activities.update
      { role_id: '1', permission_id: '28' }, // activities.delete
      { role_id: '1', permission_id: '29' }, // analytics.read
      { role_id: '1', permission_id: '30' }, // settings.read
      { role_id: '1', permission_id: '31' }, // settings.update

      // COMPANY_ADMIN - صلاحيات إدارية كاملة
      { role_id: '2', permission_id: '1' }, // users.create
      { role_id: '2', permission_id: '2' }, // users.read
      { role_id: '2', permission_id: '3' }, // users.update
      { role_id: '2', permission_id: '5' }, // developers.create
      { role_id: '2', permission_id: '6' }, // developers.read
      { role_id: '2', permission_id: '7' }, // developers.update
      { role_id: '2', permission_id: '9' }, // projects.create
      { role_id: '2', permission_id: '10' }, // projects.read
      { role_id: '2', permission_id: '11' }, // projects.update
      { role_id: '2', permission_id: '13' }, // properties.create
      { role_id: '2', permission_id: '14' }, // properties.read
      { role_id: '2', permission_id: '15' }, // properties.update
      { role_id: '2', permission_id: '17' }, // leads.create
      { role_id: '2', permission_id: '18' }, // leads.read
      { role_id: '2', permission_id: '19' }, // leads.update
      { role_id: '2', permission_id: '21' }, // deals.create
      { role_id: '2', permission_id: '22' }, // deals.read
      { role_id: '2', permission_id: '23' }, // deals.update
      { role_id: '2', permission_id: '25' }, // activities.create
      { role_id: '2', permission_id: '26' }, // activities.read
      { role_id: '2', permission_id: '27' }, // activities.update
      { role_id: '2', permission_id: '29' }, // analytics.read
      { role_id: '2', permission_id: '30' }, // settings.read

      // MANAGER - صلاحيات إدارية محدودة
      { role_id: '3', permission_id: '2' }, // users.read
      { role_id: '3', permission_id: '6' }, // developers.read
      { role_id: '3', permission_id: '7' }, // developers.update
      { role_id: '3', permission_id: '10' }, // projects.read
      { role_id: '3', permission_id: '11' }, // projects.update
      { role_id: '3', permission_id: '14' }, // properties.read
      { role_id: '3', permission_id: '15' }, // properties.update
      { role_id: '3', permission_id: '18' }, // leads.read
      { role_id: '3', permission_id: '19' }, // leads.update
      { role_id: '3', permission_id: '22' }, // deals.read
      { role_id: '3', permission_id: '23' }, // deals.update
      { role_id: '3', permission_id: '26' }, // activities.read
      { role_id: '3', permission_id: '27' }, // activities.update
      { role_id: '3', permission_id: '29' }, // analytics.read

      // AGENT - صلاحيات أساسية
      { role_id: '4', permission_id: '6' }, // developers.read
      { role_id: '4', permission_id: '10' }, // projects.read
      { role_id: '4', permission_id: '14' }, // properties.read
      { role_id: '4', permission_id: '17' }, // leads.create
      { role_id: '4', permission_id: '18' }, // leads.read
      { role_id: '4', permission_id: '19' }, // leads.update
      { role_id: '4', permission_id: '21' }, // deals.create
      { role_id: '4', permission_id: '22' }, // deals.read
      { role_id: '4', permission_id: '23' }, // deals.update
      { role_id: '4', permission_id: '25' }, // activities.create
      { role_id: '4', permission_id: '26' }, // activities.read
      { role_id: '4', permission_id: '27' }, // activities.update

      // VIEWER - صلاحيات قراءة فقط
      { role_id: '5', permission_id: '2' }, // users.read
      { role_id: '5', permission_id: '6' }, // developers.read
      { role_id: '5', permission_id: '10' }, // projects.read
      { role_id: '5', permission_id: '14' }, // properties.read
      { role_id: '5', permission_id: '18' }, // leads.read
      { role_id: '5', permission_id: '22' }, // deals.read
      { role_id: '5', permission_id: '26' }, // activities.read
      { role_id: '5', permission_id: '29' }, // analytics.read
    ];

    try {
      // حذف الربط الموجود
      await rolePermissionsRepository.clear();

      // إدراج الربط الجديد
      for (const rolePermission of rolePermissions) {
        await rolePermissionsRepository.save({
          ...rolePermission,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      console.log('✅ تم ربط الأدوار بالصلاحيات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في ربط الأدوار بالصلاحيات:', error);
      throw error;
    }
  }
}
