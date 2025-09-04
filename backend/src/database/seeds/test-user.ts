import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';
import { Company, SubscriptionPlan, CompanyStatus } from '../../companies/entities/company.entity';

async function createTestUser() {
    const AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'crm_db',
        entities: [User, Company],
        synchronize: false,
    });

    try {
        await AppDataSource.initialize();
        console.log('Database connection established');

        const userRepository = AppDataSource.getRepository(User);
        const companyRepository = AppDataSource.getRepository(Company);

        // Check if test user already exists
        const existingUser = await userRepository.findOne({
            where: { email: 'test@example.com' }
        });

        if (existingUser) {
            console.log('Test user already exists');
            console.log('Email: test@example.com');
            console.log('Password: password123');
            return;
        }

        // Get or create a test company
        let testCompany = await companyRepository.findOne({
            where: { name: 'Test Company' }
        });

        if (!testCompany) {
            testCompany = companyRepository.create({
                name: 'Test Company',
                subdomain: 'test',
                email: 'test@example.com',
                subscription_plan: SubscriptionPlan.ENTERPRISE,
                status: CompanyStatus.ACTIVE,
                user_limit: 100,
                timezone: 'UTC',
                language: 'ar'
            });
            await companyRepository.save(testCompany);
            console.log('Test company created');
        }

        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);

        const testUser = userRepository.create({
            email: 'test@example.com',
            password_hash: hashedPassword,
            first_name: 'Test',
            last_name: 'User',
            phone: '+966500000000',
            role: UserRole.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            is_email_verified: true,
            company_id: testCompany.id,
        });

        await userRepository.save(testUser);
        console.log('Test user created successfully');
        console.log('Email: test@example.com');
        console.log('Password: password123');

    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('Database connection closed');
        }
    }
}

createTestUser();
