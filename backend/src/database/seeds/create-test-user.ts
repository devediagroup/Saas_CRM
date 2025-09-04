import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';

async function createTestUser() {
    // Use existing connection or create new one
    const AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'crm_db',
        entities: [User],
        synchronize: false,
    });

    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('Database connection established');

        const userRepository = AppDataSource.getRepository(User);

        // Check if test user already exists
        const existingUser = await userRepository.findOne({
            where: { email: 'test@example.com' }
        });

        if (existingUser) {
            console.log('Test user already exists');
            return;
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
            company_id: '00000000-0000-0000-0000-000000000000', // Default company
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
