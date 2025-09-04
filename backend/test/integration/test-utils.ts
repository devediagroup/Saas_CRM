import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

// Test configuration for integration tests
export interface TestConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
    headers: Record<string, string>;
}

export const defaultTestConfig: TestConfig = {
    baseUrl: 'http://localhost:3001',
    timeout: 30000,
    retries: 3,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'ar,en'
    }
};

// Test utilities
export class TestHelper {
    private static authToken: string | null = null;

    static async loginUser(app: INestApplication, credentials: { email: string; password: string }) {
        const response = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send(credentials)
            .expect(200);

        this.authToken = response.body.access_token;
        return response.body;
    }

    static getAuthHeaders() {
        return {
            Authorization: `Bearer ${this.authToken}`,
            ...defaultTestConfig.headers
        };
    }

    static generateMockUser(overrides: Partial<any> = {}) {
        return {
            email: `test-${Date.now()}@example.com`,
            password: 'TestPassword123!',
            first_name: 'أحمد',
            last_name: 'محمد',
            phone: '+966501234567',
            role: 'sales_rep',
            company_id: 'test-company-123',
            ...overrides
        };
    }

    static generateMockLead(overrides: Partial<any> = {}) {
        return {
            first_name: 'عميل',
            last_name: 'محتمل',
            email: `lead-${Date.now()}@example.com`,
            phone: '+966501234567',
            source: 'website',
            status: 'new',
            budget_min: 500000,
            budget_max: 1000000,
            property_type: 'apartment',
            location: 'الرياض',
            notes: 'عميل محتمل مهتم بالشراء',
            ...overrides
        };
    }

    static generateMockProperty(overrides: Partial<any> = {}) {
        return {
            title: `عقار تجريبي ${Date.now()}`,
            description: 'وصف العقار التجريبي',
            type: 'apartment',
            status: 'available',
            price: 750000,
            bedrooms: 3,
            bathrooms: 2,
            area: 120,
            location: 'الرياض - حي النرجس',
            latitude: 24.7136,
            longitude: 46.6753,
            features: ['مكيف', 'مواقف سيارات'],
            developer_id: 'test-developer-123',
            ...overrides
        };
    }

    static async waitForCondition(
        condition: () => Promise<boolean>,
        timeout: number = 5000,
        interval: number = 100
    ): Promise<boolean> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        return false;
    }

    static validateArabicText(text: string): boolean {
        return /[\u0600-\u06FF]/.test(text);
    }

    static validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static validateSaudiPhone(phone: string): boolean {
        return /^(\+966|0)?5[0-9]{8}$/.test(phone) || /^\+966[1-9][0-9]{8}$/.test(phone);
    }

    static validatePrice(price: number): boolean {
        return typeof price === 'number' && price > 0;
    }

    static validateCoordinates(lat: number, lng: number): boolean {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    static async cleanup() {
        // Reset auth token
        this.authToken = null;
    }
}

// Error handling utilities
export class TestErrorHandler {
    static handleHttpError(error: any, context: string) {
        console.error(`HTTP Error in ${context}:`, {
            status: error.status,
            message: error.message,
            response: error.response?.body,
            timestamp: new Date().toISOString()
        });
    }

    static handleDatabaseError(error: any, context: string) {
        console.error(`Database Error in ${context}:`, {
            code: error.code,
            message: error.message,
            detail: error.detail,
            timestamp: new Date().toISOString()
        });
    }

    static handleValidationError(error: any, context: string) {
        console.error(`Validation Error in ${context}:`, {
            field: error.field,
            value: error.value,
            constraints: error.constraints,
            timestamp: new Date().toISOString()
        });
    }
}

// Performance monitoring utilities
export class TestPerformanceMonitor {
    private static metrics: Record<string, number[]> = {};

    static startTimer(testName: string): () => number {
        const startTime = Date.now();

        return () => {
            const duration = Date.now() - startTime;
            this.recordMetric(testName, duration);
            return duration;
        };
    }

    static recordMetric(testName: string, duration: number) {
        if (!this.metrics[testName]) {
            this.metrics[testName] = [];
        }
        this.metrics[testName].push(duration);
    }

    static getMetrics(testName?: string) {
        if (testName) {
            const durations = this.metrics[testName] || [];
            return {
                test: testName,
                count: durations.length,
                avg: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
                min: durations.length > 0 ? Math.min(...durations) : 0,
                max: durations.length > 0 ? Math.max(...durations) : 0
            };
        }

        return Object.keys(this.metrics).map(test => this.getMetrics(test));
    }

    static reset() {
        this.metrics = {};
    }

    static generateReport() {
        const allMetrics = this.getMetrics();
        console.log('\n=== Performance Report ===');

        allMetrics.forEach(metric => {
            console.log(`${(metric as any).test}:`);
            console.log(`  Tests run: ${(metric as any).count}`);
            console.log(`  Average: ${(metric as any).avg.toFixed(2)}ms`);
            console.log(`  Min: ${(metric as any).min}ms`);
            console.log(`  Max: ${(metric as any).max}ms`);
            console.log('');
        });
    }
}

// Test data factories
export class TestDataFactory {
    static createUser(role: string = 'sales_rep', overrides: Partial<any> = {}) {
        const baseUser = TestHelper.generateMockUser();

        const roleSpecificData = {
            sales_rep: {
                permissions: ['read:leads', 'update:leads', 'read:properties']
            },
            manager: {
                permissions: [
                    'read:leads', 'create:leads', 'update:leads',
                    'read:properties', 'read:users'
                ]
            },
            admin: {
                permissions: [
                    'read:*', 'create:users', 'update:users',
                    'create:companies', 'update:companies'
                ]
            },
            super_admin: {
                permissions: ['*']
            }
        };

        return {
            ...baseUser,
            role,
            ...(roleSpecificData[role] || {}),
            ...overrides
        };
    }

    static createLead(status: string = 'new', overrides: Partial<any> = {}) {
        const baseLead = TestHelper.generateMockLead();

        const statusSpecificData = {
            new: {
                assigned_to: null,
                contact_attempts: 0
            },
            contacted: {
                assigned_to: 'sales-rep-123',
                contact_attempts: 1,
                last_contact: new Date()
            },
            qualified: {
                assigned_to: 'sales-rep-123',
                contact_attempts: 3,
                qualification_notes: 'عميل مؤهل للشراء'
            },
            proposal: {
                assigned_to: 'sales-rep-123',
                proposal_sent: new Date(),
                proposal_value: 850000
            }
        };

        return {
            ...baseLead,
            status,
            ...(statusSpecificData[status] || {}),
            ...overrides
        };
    }

    static createProperty(type: string = 'apartment', overrides: Partial<any> = {}) {
        const baseProperty = TestHelper.generateMockProperty();

        const typeSpecificData = {
            apartment: {
                bedrooms: 3,
                bathrooms: 2,
                area: 120,
                features: ['مكيف', 'مواقف سيارات', 'مصعد']
            },
            villa: {
                bedrooms: 5,
                bathrooms: 4,
                area: 300,
                features: ['مكيف', 'مواقف سيارات', 'حديقة', 'مسبح', 'غرفة خادمة']
            },
            office: {
                bedrooms: 0,
                bathrooms: 2,
                area: 80,
                features: ['مكيف', 'مواقف سيارات', 'أمن وحراسة', 'مصعد']
            }
        };

        return {
            ...baseProperty,
            type,
            ...(typeSpecificData[type] || {}),
            ...overrides
        };
    }
}

// Test suite runner
export class IntegrationTestRunner {
    private static results: Array<{
        suite: string;
        tests: number;
        passed: number;
        failed: number;
        duration: number;
    }> = [];

    static async runSuite(suiteName: string, testFn: () => Promise<void>) {
        console.log(`\n🚀 Running ${suiteName} integration tests...`);

        const startTime = Date.now();
        const endTimer = TestPerformanceMonitor.startTimer(suiteName);

        try {
            await testFn();
            const duration = endTimer();

            console.log(`✅ ${suiteName} completed in ${duration}ms`);

            this.results.push({
                suite: suiteName,
                tests: 0, // Will be updated by Jest
                passed: 0,
                failed: 0,
                duration
            });

        } catch (error) {
            const duration = endTimer();
            console.error(`❌ ${suiteName} failed after ${duration}ms:`, error);

            this.results.push({
                suite: suiteName,
                tests: 0,
                passed: 0,
                failed: 1,
                duration
            });

            throw error;
        }
    }

    static generateSummaryReport() {
        console.log('\n=== Integration Tests Summary ===');

        const totalSuites = this.results.length;
        const totalDuration = this.results.reduce((sum, result) => sum + result.duration, 0);
        const failedSuites = this.results.filter(result => result.failed > 0).length;

        console.log(`Total Suites: ${totalSuites}`);
        console.log(`Passed Suites: ${totalSuites - failedSuites}`);
        console.log(`Failed Suites: ${failedSuites}`);
        console.log(`Total Duration: ${totalDuration}ms`);
        console.log('');

        this.results.forEach(result => {
            const status = result.failed > 0 ? '❌' : '✅';
            console.log(`${status} ${result.suite}: ${result.duration}ms`);
        });

        console.log('\n=== End Summary ===\n');
    }

    static reset() {
        this.results = [];
        TestPerformanceMonitor.reset();
    }
}

// All classes and utilities are exported above
