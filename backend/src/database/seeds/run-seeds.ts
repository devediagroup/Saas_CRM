import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { CompaniesService } from '../../companies/companies.service';
import { UsersService } from '../../users/users.service';
import { LeadsService } from '../../leads/leads.service';
import { PropertiesService } from '../../properties/properties.service';
import { DealsService } from '../../deals/deals.service';
import { ActivitiesService } from '../../activities/activities.service';
import { Company, SubscriptionPlan } from '../../companies/entities/company.entity';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';
import { Lead, LeadStatus, LeadPriority } from '../../leads/entities/lead.entity';
import { Property, PropertyType, PropertyStatus, ListingType } from '../../properties/entities/property.entity';
import { Deal, DealStage, DealPriority, DealType } from '../../deals/entities/deal.entity';
import { Activity, ActivityType, ActivityStatus, ActivityPriority } from '../../activities/entities/activity.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const companiesService = app.get(CompaniesService);
  const usersService = app.get(UsersService);
  const leadsService = app.get(LeadsService);
  const propertiesService = app.get(PropertiesService);
  const dealsService = app.get(DealsService);
  const activitiesService = app.get(ActivitiesService);

  console.log('🌱 Starting database seeding...');

  try {
    // Create demo company
    console.log('📍 Creating demo company...');
    const company = await companiesService.create({
      name: 'EchoOps Real Estate',
      email: 'admin@echoops.com',
      subdomain: 'echoops-demo',
      subscription_plan: SubscriptionPlan.PRO,
      is_trial: true,
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    console.log(`✅ Created company: ${company.name}`);

    // Create super admin user
    console.log('👤 Creating super admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const superAdmin = await usersService.create({
      first_name: 'Super',
      last_name: 'Admin',
      email: 'admin@echoops.com',
      password_hash: hashedPassword,
      phone: '+966501234567',
      role: UserRole.SUPER_ADMIN,
      company_id: company.id,
      status: UserStatus.ACTIVE,
      is_email_verified: true,
      is_phone_verified: true,
    });

    console.log(`✅ Created super admin: ${superAdmin.email}`);

    // Create company admin
    const companyAdmin = await usersService.create({
      first_name: 'Company',
      last_name: 'Admin',
      email: 'company-admin@echoops.com',
      password_hash: hashedPassword,
      phone: '+966507654321',
      role: UserRole.COMPANY_ADMIN,
      company_id: company.id,
      status: UserStatus.ACTIVE,
      is_email_verified: true,
    });

    console.log(`✅ Created company admin: ${companyAdmin.email}`);

    // Create sales agent
    const salesAgent = await usersService.create({
      first_name: 'Sales',
      last_name: 'Agent',
      email: 'agent@echoops.com',
      password_hash: hashedPassword,
      phone: '+966509876543',
      role: UserRole.SALES_AGENT,
      company_id: company.id,
      status: UserStatus.ACTIVE,
      is_email_verified: true,
    });

    console.log(`✅ Created sales agent: ${salesAgent.email}`);

    // Create sample leads
    console.log('🎯 Creating sample leads...');
    const sampleLeads = [
      {
        first_name: 'أحمد',
        last_name: 'محمد',
        company_name: 'شركة الأمل للتجارة',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        status: LeadStatus.NEW,
        priority: LeadPriority.HIGH,
        requirements: 'يبحث عن شقة 3 غرف في الرياض',
        budget_min: 800000,
        budget_max: 1200000,
        timeline: 'خلال 3 أشهر',
        company_id: company.id,
      },
      {
        first_name: 'فاطمة',
        last_name: 'علي',
        email: 'fatima@example.com',
        phone: '+966507654321',
        status: LeadStatus.QUALIFIED,
        priority: LeadPriority.MEDIUM,
        requirements: 'تبحث عن فيلا في جدة',
        budget_min: 2000000,
        budget_max: 3000000,
        timeline: 'خلال 6 أشهر',
        company_id: company.id,
      },
      {
        first_name: 'خالد',
        last_name: 'سعد',
        company_name: 'مكتب الخالدي للاستشارات',
        email: 'khaled@example.com',
        phone: '+966509876543',
        status: LeadStatus.PROPOSAL,
        priority: LeadPriority.HIGH,
        requirements: 'يبحث عن مكتب تجاري في الدمام',
        budget_min: 500000,
        budget_max: 800000,
        timeline: 'خلال شهر',
        company_id: company.id,
      },
    ];

    for (const leadData of sampleLeads) {
      const lead = await leadsService.create(leadData);
      console.log(`✅ Created lead: ${lead.first_name} ${lead.last_name}`);
    }

    // Create sample properties
    console.log('🏠 Creating sample properties...');
    const sampleProperties = [
      {
        title: 'شقة فاخرة في الرياض',
        description: 'شقة 3 غرف وصالة في حي المعذر مع جميع المرافق',
        property_type: PropertyType.APARTMENT,
        status: PropertyStatus.AVAILABLE,
        listing_type: ListingType.SALE,
        price: 1200000,
        bedrooms: 3,
        bathrooms: 2,
        area: 180,
        address: 'حي المعذر، الرياض',
        city: 'الرياض',
        country: 'السعودية',
        features: ['مطبخ مجهز', 'موقف سيارة', 'أمن 24/7'],
        company_id: company.id,
      },
      {
        title: 'فيلا راقية في جدة',
        description: 'فيلا 5 غرف مع حديقة ومسابحة في أحد أرقى أحياء جدة',
        property_type: PropertyType.VILLA,
        status: PropertyStatus.RESERVED,
        listing_type: ListingType.SALE,
        price: 3500000,
        bedrooms: 5,
        bathrooms: 4,
        area: 450,
        address: 'حي الصفا، جدة',
        city: 'جدة',
        country: 'السعودية',
        features: ['حديقة خاصة', 'مسابحة', 'مطبخ مجهز', 'غرفة خادمة'],
        company_id: company.id,
      },
      {
        title: 'مكتب تجاري في الدمام',
        description: 'مكتب تجاري في مركز أعمال الدمام مع جميع المرافق',
        property_type: PropertyType.OFFICE,
        status: PropertyStatus.AVAILABLE,
        listing_type: ListingType.RENT,
        price: 15000,
        rent_price: 15000,
        bedrooms: 0,
        bathrooms: 2,
        area: 120,
        address: 'وسط الدمام، الدمام',
        city: 'الدمام',
        country: 'السعودية',
        features: ['إنترنت عالي السرعة', 'استقبال', 'موقف سيارة'],
        company_id: company.id,
      },
    ];

    for (const propertyData of sampleProperties) {
      const property = await propertiesService.create(propertyData);
      console.log(`✅ Created property: ${property.title}`);
    }

    // Create sample deals
    console.log('💼 Creating sample deals...');
    const sampleDeals = [
      {
        title: 'صفقة شقة الرياض - أحمد محمد',
        amount: 1200000,
        stage: DealStage.PROPOSAL,
        priority: DealPriority.HIGH,
        deal_type: DealType.SALE,
        probability: 75,
        expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        notes: 'العميل مهتم جداً، يحتاج لتمويل إضافي',
        lead_id: (await leadsService.findAll(company.id)).find(l => l.first_name === 'أحمد')?.id,
        property_id: (await propertiesService.findAll(company.id)).find(p => p.title.includes('شقة فاخرة'))?.id,
        assigned_to_id: salesAgent.id,
        company_id: company.id,
      },
      {
        title: 'صفقة فيلا جدة - فاطمة علي',
        amount: 3500000,
        stage: DealStage.NEGOTIATION,
        priority: DealPriority.MEDIUM,
        deal_type: DealType.SALE,
        probability: 60,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: 'مفاوضات حول السعر، العميل يطلب تخفيض 200,000 ريال',
        lead_id: (await leadsService.findAll(company.id)).find(l => l.first_name === 'فاطمة')?.id,
        property_id: (await propertiesService.findAll(company.id)).find(p => p.title.includes('فيلا راقية'))?.id,
        assigned_to_id: salesAgent.id,
        company_id: company.id,
      },
      {
        title: 'صفقة مكتب الدمام - خالد سعد',
        amount: 15000,
        stage: DealStage.CONTRACT,
        priority: DealPriority.HIGH,
        deal_type: DealType.RENT,
        probability: 90,
        expected_close_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        notes: 'العقد جاهز للتوقيع، العميل يريد بدء الإيجار من الأول من الشهر القادم',
        lead_id: (await leadsService.findAll(company.id)).find(l => l.first_name === 'خالد')?.id,
        property_id: (await propertiesService.findAll(company.id)).find(p => p.title.includes('مكتب تجاري'))?.id,
        assigned_to_id: salesAgent.id,
        company_id: company.id,
      },
    ];

    for (const dealData of sampleDeals) {
      const deal = await dealsService.create(dealData);
      console.log(`✅ Created deal: ${deal.title}`);
    }

    // Create sample activities
    console.log('📅 Creating sample activities...');
    const sampleActivities = [
      {
        title: 'اجتماع مع أحمد محمد',
        description: 'مناقشة تفاصيل الشقة في الرياض',
        type: ActivityType.MEETING,
        status: ActivityStatus.SCHEDULED,
        priority: ActivityPriority.HIGH,
        scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration_minutes: 60,
        notes: 'يجب إعداد عرض تقديمي مع صور الشقة',
        send_notification: true,
        reminder_minutes_before: 30,
        lead_id: (await leadsService.findAll(company.id)).find(l => l.first_name === 'أحمد')?.id,
        property_id: (await propertiesService.findAll(company.id)).find(p => p.title.includes('شقة فاخرة'))?.id,
        user_id: salesAgent.id,
        company_id: company.id,
      },
      {
        title: 'زيارة موقع فيلا جدة',
        description: 'اصطحاب فاطمة علي لزيارة الفيلا في جدة',
        type: ActivityType.SITE_VISIT,
        status: ActivityStatus.COMPLETED,
        priority: ActivityPriority.MEDIUM,
        scheduled_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        duration_minutes: 90,
        outcome: 'العميل راضي عن الفيلا، يريد مفاوضة السعر',
        notes: 'الفيلا بحالة ممتازة، لكن يحتاج صيانة طفيفة',
        lead_id: (await leadsService.findAll(company.id)).find(l => l.first_name === 'فاطمة')?.id,
        property_id: (await propertiesService.findAll(company.id)).find(p => p.title.includes('فيلا راقية'))?.id,
        user_id: salesAgent.id,
        company_id: company.id,
      },
      {
        title: 'مكالمة هاتفية مع خالد سعد',
        description: 'متابعة إجراءات استئجار المكتب',
        type: ActivityType.CALL,
        status: ActivityStatus.SCHEDULED,
        priority: ActivityPriority.HIGH,
        scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        duration_minutes: 15,
        notes: 'تأكيد موعد التوقيع على العقد',
        send_notification: true,
        reminder_minutes_before: 15,
        lead_id: (await leadsService.findAll(company.id)).find(l => l.first_name === 'خالد')?.id,
        property_id: (await propertiesService.findAll(company.id)).find(p => p.title.includes('مكتب تجاري'))?.id,
        user_id: salesAgent.id,
        company_id: company.id,
      },
      {
        title: 'إرسال عرض أسعار',
        description: 'إرسال عرض أسعار مفصل للشقة',
        type: ActivityType.EMAIL,
        status: ActivityStatus.COMPLETED,
        priority: ActivityPriority.MEDIUM,
        scheduled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration_minutes: 30,
        outcome: 'تم إرسال العرض بنجاح',
        notes: 'شمل العرض جميع التفاصيل والصور',
        lead_id: (await leadsService.findAll(company.id)).find(l => l.first_name === 'أحمد')?.id,
        user_id: salesAgent.id,
        company_id: company.id,
      },
    ];

    for (const activityData of sampleActivities) {
      const activity = await activitiesService.create(activityData);
      console.log(`✅ Created activity: ${activity.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Demo Credentials:');
    console.log('Super Admin: admin@echoops.com / Admin123!');
    console.log('Company Admin: company-admin@echoops.com / Admin123!');
    console.log('Sales Agent: agent@echoops.com / Admin123!');
    console.log('');
    console.log('🌐 API Documentation: http://localhost:3000/api/docs');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
