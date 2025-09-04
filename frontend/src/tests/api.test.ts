import { ApiError } from '../lib/api';

// Mock axios
jest.mock('axios', () => {
    const actualAxios = jest.requireActual('axios');
    return {
        ...actualAxios,
        create: jest.fn(() => ({
            defaults: {
                headers: {
                    common: {}
                }
            },
            interceptors: {
                request: {
                    use: jest.fn()
                },
                response: {
                    use: jest.fn()
                }
            },
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn()
        }))
    };
});

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
});

describe('API Utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockClear();
        mockLocalStorage.setItem.mockClear();
        mockLocalStorage.removeItem.mockClear();
    });

    describe('ApiError', () => {
        it('should create ApiError with message and status code', () => {
            const error = new ApiError('Test error message', 400);

            expect(error.message).toBe('Test error message');
            expect(error.status).toBe(400);
            expect(error.name).toBe('ApiError');
            expect(error instanceof Error).toBe(true);
        });

        it('should create ApiError with default values', () => {
            const error = new ApiError('Test error message');

            expect(error.message).toBe('Test error message');
            expect(error.status).toBeUndefined();
            expect(error.code).toBeUndefined();
            expect(error.details).toBeUndefined();
        });

        it('should create ApiError with all parameters', () => {
            const details = { field: 'username', value: 'invalid' };
            const error = new ApiError('Validation error', 422, 'VALIDATION_ERROR', details);

            expect(error.message).toBe('Validation error');
            expect(error.status).toBe(422);
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.details).toEqual(details);
        });

        it('should create ApiError with code but no status', () => {
            const error = new ApiError('Network error', undefined, 'NETWORK_ERROR');

            expect(error.message).toBe('Network error');
            expect(error.status).toBeUndefined();
            expect(error.code).toBe('NETWORK_ERROR');
        });

        it('should inherit from Error class properly', () => {
            const error = new ApiError('Test error');

            expect(error instanceof Error).toBe(true);
            expect(error instanceof ApiError).toBe(true);
            expect(error.name).toBe('ApiError');
            expect(typeof error.stack).toBe('string');
        });
    });

    describe('Error Handling Scenarios', () => {
        it('should handle authentication errors', () => {
            const error = new ApiError(
                'غير مصرح بالدخول',
                401,
                'UNAUTHORIZED'
            );

            expect(error.message).toBe('غير مصرح بالدخول');
            expect(error.status).toBe(401);
            expect(error.code).toBe('UNAUTHORIZED');
        });

        it('should handle authorization errors', () => {
            const error = new ApiError(
                'ليس لديك الصلاحيات الكافية',
                403,
                'FORBIDDEN'
            );

            expect(error.message).toBe('ليس لديك الصلاحيات الكافية');
            expect(error.status).toBe(403);
            expect(error.code).toBe('FORBIDDEN');
        });

        it('should handle not found errors', () => {
            const error = new ApiError(
                'المورد المطلوب غير موجود',
                404,
                'NOT_FOUND'
            );

            expect(error.message).toBe('المورد المطلوب غير موجود');
            expect(error.status).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
        });

        it('should handle validation errors with details', () => {
            const validationDetails = {
                errors: [
                    { field: 'email', message: 'Invalid email format' },
                    { field: 'password', message: 'Password too short' }
                ]
            };

            const error = new ApiError(
                'بيانات غير صحيحة',
                422,
                'VALIDATION_ERROR',
                validationDetails
            );

            expect(error.message).toBe('بيانات غير صحيحة');
            expect(error.status).toBe(422);
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.details).toEqual(validationDetails);
        });

        it('should handle server errors', () => {
            const error = new ApiError(
                'حدث خطأ في الخادم',
                500,
                'INTERNAL_SERVER_ERROR'
            );

            expect(error.message).toBe('حدث خطأ في الخادم');
            expect(error.status).toBe(500);
            expect(error.code).toBe('INTERNAL_SERVER_ERROR');
        });

        it('should handle network errors', () => {
            const error = new ApiError(
                'فشل في الاتصال بالخادم',
                0,
                'NETWORK_ERROR'
            );

            expect(error.message).toBe('فشل في الاتصال بالخادم');
            expect(error.status).toBe(0);
            expect(error.code).toBe('NETWORK_ERROR');
        });

        it('should handle timeout errors', () => {
            const error = new ApiError(
                'انتهت مهلة الطلب',
                408,
                'TIMEOUT_ERROR'
            );

            expect(error.message).toBe('انتهت مهلة الطلب');
            expect(error.status).toBe(408);
            expect(error.code).toBe('TIMEOUT_ERROR');
        });
    });

    describe('Error Message Localization', () => {
        it('should support Arabic error messages', () => {
            const arabicMessages = [
                'غير مصرح بالدخول',
                'ليس لديك الصلاحيات الكافية',
                'المورد المطلوب غير موجود',
                'بيانات غير صحيحة',
                'حدث خطأ في الخادم',
                'فشل في الاتصال بالخادم'
            ];

            arabicMessages.forEach((message, index) => {
                const error = new ApiError(message, 400 + index);
                expect(error.message).toBe(message);
            });
        });

        it('should support English error messages', () => {
            const englishMessages = [
                'Unauthorized access',
                'Insufficient permissions',
                'Resource not found',
                'Invalid data',
                'Internal server error',
                'Network connection failed'
            ];

            englishMessages.forEach((message, index) => {
                const error = new ApiError(message, 400 + index);
                expect(error.message).toBe(message);
            });
        });
    });

    describe('Error Serialization', () => {
        it('should be serializable to JSON', () => {
            const error = new ApiError(
                'Test error',
                422,
                'TEST_ERROR',
                { field: 'test', value: 'invalid' }
            );

            const serialized = JSON.stringify(error);
            const parsed = JSON.parse(serialized);

            expect(parsed.message).toBe('Test error');
            expect(parsed.status).toBe(422);
            expect(parsed.code).toBe('TEST_ERROR');
            expect(parsed.details).toEqual({ field: 'test', value: 'invalid' });
        });

        it('should handle circular references in details', () => {
            const circularObject: any = { name: 'test' };
            circularObject.self = circularObject;

            const error = new ApiError('Circular error', 500, 'CIRCULAR', circularObject);

            expect(error.details).toBe(circularObject);
            expect(error.message).toBe('Circular error');
        });
    });

    describe('Error Comparison', () => {
        it('should allow error comparison by status', () => {
            const error401 = new ApiError('Unauthorized', 401);
            const error403 = new ApiError('Forbidden', 403);
            const anotherError401 = new ApiError('Auth failed', 401);

            expect(error401.status).toBe(anotherError401.status);
            expect(error401.status).not.toBe(error403.status);
        });

        it('should allow error comparison by code', () => {
            const networkError1 = new ApiError('Network failed', 0, 'NETWORK_ERROR');
            const networkError2 = new ApiError('Connection lost', 0, 'NETWORK_ERROR');
            const timeoutError = new ApiError('Timeout', 408, 'TIMEOUT_ERROR');

            expect(networkError1.code).toBe(networkError2.code);
            expect(networkError1.code).not.toBe(timeoutError.code);
        });
    });

    describe('Error Context', () => {
        it('should preserve error context information', () => {
            const context = {
                endpoint: '/api/users',
                method: 'POST',
                requestId: '12345',
                timestamp: new Date().toISOString()
            };

            const error = new ApiError(
                'Request failed',
                500,
                'REQUEST_ERROR',
                context
            );

            expect(error.details).toEqual(context);
            expect(error.details.endpoint).toBe('/api/users');
            expect(error.details.method).toBe('POST');
            expect(error.details.requestId).toBe('12345');
        });
    });
});
