// Global setup for integration tests
beforeAll(async () => {
    // Global test setup
    console.log('🔧 Setting up integration tests...');

    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USERNAME = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_DATABASE = 'test_db';

    // Extend Jest timeout for integration tests
    jest.setTimeout(30000);
});

afterAll(async () => {
    // Global test cleanup
    console.log('🧹 Cleaning up integration tests...');
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock console methods if needed
global.console = {
    ...console,
    // Uncomment to silence logs during tests
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};
