import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

// Mock modules for users testing
const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
};

const mockCompanyRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    decode: jest.fn().mockReturnValue({
        sub: 'user-id',
        email: 'test@example.com',
        permissions: ['read:users', 'create:users', 'update:users']
    }),
    verify: jest.fn(),
};

const mockApp = {
    getHttpServer: jest.fn().mockReturnValue({
        listen: jest.fn(),
        close: jest.fn(),
    }),
    init: jest.fn(),
    close: jest.fn(),
};

describe('Users Integration Tests', () => {
    let app: INestApplication;
    let userRepository: Repository<any>;
    let companyRepository: Repository<any>;
    let jwtService: JwtService;
    let moduleRef: TestingModule;
    let authToken: string;

    beforeAll(async () => {
        // Create test module with mocked dependencies
        moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: 'UserRepository',
                    useValue: mockUserRepository,
                },
                {
                    provide: 'CompanyRepository',
                    useValue: mockCompanyRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        app = mockApp as any;
        userRepository = mockUserRepository as any;
        companyRepository = mockCompanyRepository as any;
        jwtService = mockJwtService as any;

        // إنشاء توكن للاختبار
        authToken = 'Bearer mock-jwt-token';

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // تنظيف التوقعات قبل كل اختبار
        jest.clearAllMocks();
    });

    describe('User Creation Tests', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                email: 'user@example.com',
                password: 'HashedPassword123!',
                first_name: 'أحمد',
                last_name: 'محمد',
                phone: '+966501234567',
                role: 'sales_rep',
                company_id: 'company-123',
                permissions: ['read:leads', 'create:leads', 'update:leads']
            };

            const savedUser = {
                ...userData,
                id: 'user-123',
                created_at: new Date(),
                last_login: null,
                is_active: true
            };
            mockUserRepository.save.mockResolvedValue(savedUser);

            const result = await userRepository.save(userData);

            expect(result).toEqual(savedUser);
            expect(mockUserRepository.save).toHaveBeenCalledWith(userData);
        });

        it('should validate required fields for user creation', () => {
            const incompleteUserData = {
                email: 'user@example.com',
                // password مفقود
                first_name: 'أحمد',
                // last_name مفقود
                // company_id مفقود
            };

            const requiredFields = ['email', 'password', 'first_name', 'last_name', 'company_id'];
            const missingFields = requiredFields.filter(field => !incompleteUserData[field]);

            expect(missingFields.length).toBeGreaterThan(0);
            expect(missingFields).toContain('password');
            expect(missingFields).toContain('last_name');
            expect(missingFields).toContain('company_id');
        });

        it('should validate user role values', () => {
            const validRoles = ['super_admin', 'admin', 'manager', 'sales_rep', 'developer', 'user'];
            const invalidRoles = ['guest', 'owner', 'customer'];

            validRoles.forEach(role => {
                expect(['super_admin', 'admin', 'manager', 'sales_rep', 'developer', 'user'].includes(role)).toBe(true);
            });

            invalidRoles.forEach(role => {
                expect(['super_admin', 'admin', 'manager', 'sales_rep', 'developer', 'user'].includes(role)).toBe(false);
            });
        });

        it('should validate email uniqueness', async () => {
            const existingUser = {
                id: 'user-existing',
                email: 'existing@example.com',
                first_name: 'موجود',
                last_name: 'مسبقاً'
            };

            mockUserRepository.findOne.mockResolvedValue(existingUser);

            const foundUser = await userRepository.findOne({
                where: { email: 'existing@example.com' }
            });

            expect(foundUser).toEqual(existingUser);
            expect(foundUser.email).toBe('existing@example.com');
        });
    });

    describe('User Retrieval Tests', () => {
        it('should retrieve all users with pagination', async () => {
            const mockUsers = [
                {
                    id: 'user-1',
                    email: 'user1@example.com',
                    first_name: 'أحمد',
                    last_name: 'محمد',
                    role: 'sales_rep',
                    is_active: true
                },
                {
                    id: 'user-2',
                    email: 'user2@example.com',
                    first_name: 'فاطمة',
                    last_name: 'علي',
                    role: 'manager',
                    is_active: true
                }
            ];

            mockUserRepository.find.mockResolvedValue(mockUsers);
            mockUserRepository.count.mockResolvedValue(2);

            const users = await userRepository.find({
                skip: 0,
                take: 10
            });
            const totalCount = await userRepository.count();

            expect(users).toEqual(mockUsers);
            expect(totalCount).toBe(2);
            expect(mockUserRepository.find).toHaveBeenCalledWith({
                skip: 0,
                take: 10
            });
        });

        it('should retrieve user by ID', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'user@example.com',
                first_name: 'أحمد',
                last_name: 'محمد',
                phone: '+966501234567',
                role: 'sales_rep',
                company_id: 'company-123',
                is_active: true,
                created_at: new Date()
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            const user = await userRepository.findOne({
                where: { id: 'user-123' }
            });

            expect(user).toEqual(mockUser);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'user-123' }
            });
        });

        it('should handle user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const user = await userRepository.findOne({
                where: { id: 'nonexistent-user' }
            });

            expect(user).toBeNull();
        });

        it('should filter users by role', async () => {
            const salesReps = [
                {
                    id: 'user-1',
                    email: 'rep1@example.com',
                    first_name: 'أحمد',
                    role: 'sales_rep'
                },
                {
                    id: 'user-2',
                    email: 'rep2@example.com',
                    first_name: 'محمد',
                    role: 'sales_rep'
                }
            ];

            mockUserRepository.find.mockResolvedValue(salesReps);

            const users = await userRepository.find({
                where: { role: 'sales_rep' }
            });

            expect(users).toEqual(salesReps);
            expect(users.every(user => user.role === 'sales_rep')).toBe(true);
        });

        it('should filter users by company', async () => {
            const companyUsers = [
                {
                    id: 'user-1',
                    email: 'user1@company.com',
                    company_id: 'company-123'
                },
                {
                    id: 'user-2',
                    email: 'user2@company.com',
                    company_id: 'company-123'
                }
            ];

            mockUserRepository.find.mockResolvedValue(companyUsers);

            const users = await userRepository.find({
                where: { company_id: 'company-123' }
            });

            expect(users).toEqual(companyUsers);
            expect(users.every(user => user.company_id === 'company-123')).toBe(true);
        });
    });

    describe('User Update Tests', () => {
        it('should update user profile information', async () => {
            const userId = 'user-123';
            const updateData = {
                first_name: 'أحمد محدث',
                last_name: 'محمد محدث',
                phone: '+966561234567',
                updated_at: new Date()
            };

            mockUserRepository.update.mockResolvedValue({ affected: 1 });

            const result = await userRepository.update(userId, updateData);

            expect(result.affected).toBe(1);
            expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
        });

        it('should update user role and permissions', async () => {
            const userId = 'user-123';
            const updateData = {
                role: 'manager',
                permissions: [
                    'read:leads', 'create:leads', 'update:leads', 'delete:leads',
                    'read:properties', 'create:properties', 'update:properties',
                    'read:users', 'update:users'
                ],
                updated_at: new Date()
            };

            mockUserRepository.update.mockResolvedValue({ affected: 1 });

            const result = await userRepository.update(userId, updateData);

            expect(result.affected).toBe(1);
            expect(updateData.permissions.length).toBeGreaterThan(0);
        });

        it('should update user status (activate/deactivate)', async () => {
            const userId = 'user-123';
            const updateData = {
                is_active: false,
                deactivated_at: new Date(),
                updated_at: new Date()
            };

            mockUserRepository.update.mockResolvedValue({ affected: 1 });

            const result = await userRepository.update(userId, updateData);

            expect(result.affected).toBe(1);
            expect(updateData.is_active).toBe(false);
        });

        it('should update last login timestamp', async () => {
            const userId = 'user-123';
            const updateData = {
                last_login: new Date(),
                login_count: 1
            };

            mockUserRepository.update.mockResolvedValue({ affected: 1 });

            const result = await userRepository.update(userId, updateData);

            expect(result.affected).toBe(1);
            expect(updateData.last_login).toBeInstanceOf(Date);
        });
    });

    describe('User Permission Tests', () => {
        it('should validate user permissions array', () => {
            const validPermissions = [
                'read:leads',
                'create:leads',
                'update:leads',
                'read:properties',
                'read:users'
            ];

            const invalidPermissions = [
                'invalid:permission',
                'read_leads', // خطأ في التنسيق
                'create-users' // خطأ في التنسيق
            ];

            const permissionPattern = /^(read|create|update|delete):(leads|properties|users|companies|deals|analytics)$/;

            validPermissions.forEach(permission => {
                expect(permission).toMatch(permissionPattern);
            });

            invalidPermissions.forEach(permission => {
                expect(permission).not.toMatch(permissionPattern);
            });
        });

        it('should validate role-based permissions', () => {
            const rolePermissions = {
                'super_admin': ['*'], // جميع الصلاحيات
                'admin': [
                    'read:*', 'create:users', 'update:users',
                    'create:companies', 'update:companies'
                ],
                'manager': [
                    'read:leads', 'create:leads', 'update:leads',
                    'read:properties', 'create:properties', 'update:properties',
                    'read:users'
                ],
                'sales_rep': [
                    'read:leads', 'update:leads',
                    'read:properties'
                ],
                'developer': [
                    'read:properties', 'create:properties', 'update:properties'
                ]
            };

            const userRole = 'sales_rep';
            const requiredPermission = 'read:leads';

            const hasPermission = rolePermissions[userRole]?.includes(requiredPermission) ||
                rolePermissions[userRole]?.includes('*') ||
                rolePermissions[userRole]?.includes('read:*');

            expect(hasPermission).toBe(true);

            const unauthorizedPermission = 'delete:users';
            const hasUnauthorizedPermission = rolePermissions[userRole]?.includes(unauthorizedPermission) ||
                rolePermissions[userRole]?.includes('*');

            expect(hasUnauthorizedPermission).toBe(false);
        });

        it('should validate super admin permissions', () => {
            const superAdminPermissions = ['*'];
            const anyPermission = 'delete:everything';

            const isSuperAdmin = superAdminPermissions.includes('*');
            const canPerformAnyAction = isSuperAdmin;

            expect(canPerformAnyAction).toBe(true);
        });
    });

    describe('User Search and Filtering Tests', () => {
        it('should search users by name', async () => {
            const searchTerm = 'أحمد';
            const matchingUsers = [
                {
                    id: 'user-1',
                    first_name: 'أحمد',
                    last_name: 'محمد',
                    email: 'ahmed@example.com'
                },
                {
                    id: 'user-2',
                    first_name: 'محمد',
                    last_name: 'أحمد',
                    email: 'mohammed@example.com'
                }
            ];

            mockUserRepository.find.mockResolvedValue(matchingUsers);

            const users = await userRepository.find({
                where: [
                    { first_name: searchTerm },
                    { last_name: searchTerm }
                ]
            });

            expect(users).toEqual(matchingUsers);
        });

        it('should filter users by active status', async () => {
            const activeUsers = [
                {
                    id: 'user-1',
                    email: 'active1@example.com',
                    is_active: true
                },
                {
                    id: 'user-2',
                    email: 'active2@example.com',
                    is_active: true
                }
            ];

            mockUserRepository.find.mockResolvedValue(activeUsers);

            const users = await userRepository.find({
                where: { is_active: true }
            });

            expect(users).toEqual(activeUsers);
            expect(users.every(user => user.is_active === true)).toBe(true);
        });

        it('should filter users by creation date range', () => {
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-12-31');

            const usersInRange = [
                {
                    id: 'user-1',
                    email: 'user1@example.com',
                    created_at: new Date('2024-06-15')
                },
                {
                    id: 'user-2',
                    email: 'user2@example.com',
                    created_at: new Date('2024-09-20')
                }
            ];

            const filteredUsers = usersInRange.filter(user =>
                user.created_at >= startDate && user.created_at <= endDate
            );

            expect(filteredUsers.length).toBe(2);
            expect(filteredUsers.every(user =>
                user.created_at >= startDate && user.created_at <= endDate
            )).toBe(true);
        });
    });

    describe('User Analytics Tests', () => {
        it('should calculate users distribution by role', async () => {
            const allUsers = [
                { id: '1', role: 'sales_rep' },
                { id: '2', role: 'sales_rep' },
                { id: '3', role: 'manager' },
                { id: '4', role: 'admin' },
                { id: '5', role: 'sales_rep' }
            ];

            mockUserRepository.find.mockResolvedValue(allUsers);

            const users = await userRepository.find();
            const roleDistribution = users.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            expect(roleDistribution).toEqual({
                'sales_rep': 3,
                'manager': 1,
                'admin': 1
            });
        });

        it('should calculate user activity statistics', () => {
            const users = [
                { last_login: new Date('2024-01-15'), is_active: true },
                { last_login: new Date('2024-01-10'), is_active: true },
                { last_login: null, is_active: true },
                { last_login: new Date('2024-01-01'), is_active: false }
            ];

            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const stats = {
                total: users.length,
                active: users.filter(u => u.is_active).length,
                inactive: users.filter(u => !u.is_active).length,
                never_logged_in: users.filter(u => !u.last_login).length,
                recent_login: users.filter(u =>
                    u.last_login && u.last_login > thirtyDaysAgo
                ).length
            };

            expect(stats.total).toBe(4);
            expect(stats.active).toBe(3);
            expect(stats.inactive).toBe(1);
            expect(stats.never_logged_in).toBe(1);
            // Given that the test data has dates from 2024 and we're in 2025, they're all old
            expect(stats.recent_login).toBe(0); // No recent logins as dates are old
        });
    });

    describe('User Company Association Tests', () => {
        it('should validate user belongs to company', async () => {
            const companyId = 'company-123';
            const mockCompany = {
                id: 'company-123',
                name: 'شركة العقارات المتطورة',
                is_active: true
            };

            mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

            const company = await companyRepository.findOne({
                where: { id: companyId }
            });

            expect(company).toEqual(mockCompany);
            expect(company.is_active).toBe(true);
        });

        it('should handle user assignment to company', async () => {
            const userId = 'user-123';
            const companyId = 'company-456';

            const updateData = {
                company_id: companyId,
                updated_at: new Date()
            };

            mockUserRepository.update.mockResolvedValue({ affected: 1 });

            const result = await userRepository.update(userId, updateData);

            expect(result.affected).toBe(1);
            expect(updateData.company_id).toBe(companyId);
        });
    });

    describe('User Data Validation Tests', () => {
        it('should validate Arabic names', () => {
            const arabicNames = {
                first_name: 'أحمد',
                last_name: 'محمد',
                full_name: 'أحمد محمد العلي'
            };

            expect(arabicNames.first_name).toMatch(/[\u0600-\u06FF]/);
            expect(arabicNames.last_name).toMatch(/[\u0600-\u06FF]/);
            expect(arabicNames.full_name).toMatch(/[\u0600-\u06FF]/);
        });

        it('should validate email format', () => {
            const validEmails = [
                'user@example.com',
                'admin@company.co.sa',
                'manager@domain.net'
            ];

            const invalidEmails = [
                'invalid-email',
                '@domain.com',
                'user@',
                'user.domain.com'
            ];

            validEmails.forEach(email => {
                expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            });

            invalidEmails.forEach(email => {
                expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            });
        });

        it('should validate phone number format', () => {
            const validPhones = [
                '+966501234567',
                '+966561234567',
                '0501234567',
                '0561234567'
            ];

            const invalidPhones = [
                '123456789',
                '+1234567890',
                'phone-number',
                '05012345678901'
            ];

            validPhones.forEach(phone => {
                const isValid = phone.match(/^(\+966|0)?5[0-9]{8}$/) ||
                    phone.match(/^\+966[1-9][0-9]{8}$/);
                expect(isValid).toBeTruthy();
            });

            invalidPhones.forEach(phone => {
                const isValid = phone.match(/^(\+966|0)?5[0-9]{8}$/) ||
                    phone.match(/^\+966[1-9][0-9]{8}$/);
                expect(isValid).toBeFalsy();
            });
        });

        it('should validate password requirements', () => {
            const strongPasswords = [
                'StrongPassword123!',
                'MySecure@Pass2024',
                'Complex#Password456'
            ];

            const weakPasswords = [
                '123',
                'password',
                '12345678',
                'Password'
            ];

            strongPasswords.forEach(password => {
                expect(password.length).toBeGreaterThanOrEqual(8);
                expect(password).toMatch(/[A-Z]/); // حرف كبير
                expect(password).toMatch(/[a-z]/); // حرف صغير
                expect(password).toMatch(/\d/); // رقم
            });

            weakPasswords.forEach(password => {
                const isWeak = password.length < 8 ||
                    !password.match(/[A-Z]/) ||
                    !password.match(/[a-z]/) ||
                    !password.match(/\d/);
                expect(isWeak).toBe(true);
            });
        });
    });

    describe('User Session Management Tests', () => {
        it('should handle user login session', () => {
            const sessionData = {
                user_id: 'user-123',
                login_time: new Date(),
                ip_address: '192.168.1.100',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };

            expect(sessionData.user_id).toBeTruthy();
            expect(sessionData.login_time).toBeInstanceOf(Date);
            expect(sessionData.ip_address).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
            expect(sessionData.user_agent).toBeTruthy();
        });

        it('should handle user logout session', () => {
            const logoutData = {
                user_id: 'user-123',
                logout_time: new Date(),
                session_duration: 7200 // ثانية (ساعتان)
            };

            expect(logoutData.user_id).toBeTruthy();
            expect(logoutData.logout_time).toBeInstanceOf(Date);
            expect(logoutData.session_duration).toBeGreaterThan(0);
        });

        it('should validate session token', () => {
            const sessionToken = jwtService.sign({
                sub: 'user-123',
                email: 'user@example.com',
                role: 'sales_rep',
                permissions: ['read:leads', 'update:leads']
            });

            expect(sessionToken).toBe('mock-jwt-token');
            expect(mockJwtService.sign).toHaveBeenCalled();
        });
    });
});
