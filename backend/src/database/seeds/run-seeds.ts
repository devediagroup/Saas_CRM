import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { RolesSeeder } from './roles.seeder';
import { PermissionsSeeder } from './permissions.seeder';
import { RolePermissionsSeeder } from './role-permissions.seeder';

// تحميل متغيرات البيئة
config();

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'crm_strapi',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    logging: true,
  });

  try {
    // الاتصال بقاعدة البيانات
    await dataSource.initialize();
    console.log('🔌 تم الاتصال بقاعدة البيانات بنجاح');

    // تنفيذ seeders
    console.log('\n🌱 بدء تنفيذ Seeders...\n');

    // 1. إنشاء الأدوار
    console.log('📋 إنشاء الأدوار...');
    const rolesSeeder = new RolesSeeder(dataSource);
    await rolesSeeder.run();

    // 2. إنشاء الصلاحيات
    console.log('\n🔐 إنشاء الصلاحيات...');
    const permissionsSeeder = new PermissionsSeeder(dataSource);
    await permissionsSeeder.run();

    // 3. ربط الأدوار بالصلاحيات
    console.log('\n🔗 ربط الأدوار بالصلاحيات...');
    const rolePermissionsSeeder = new RolePermissionsSeeder(dataSource);
    await rolePermissionsSeeder.run();

    console.log('\n🎉 تم تنفيذ جميع Seeders بنجاح!');
    console.log('\n📊 ملخص ما تم إنشاؤه:');
    console.log('   • 5 أدوار أساسية');
    console.log('   • 31 صلاحية');
    console.log('   • ربط كامل بين الأدوار والصلاحيات');
  } catch (error) {
    console.error('❌ خطأ في تنفيذ Seeders:', error);
    process.exit(1);
  } finally {
    // إغلاق الاتصال
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات');
    }
  }
}

// تنفيذ الـ seeds
runSeeds();
