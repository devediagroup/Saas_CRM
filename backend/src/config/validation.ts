import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    // Application
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    PORT: Joi.number().default(3000),

    // Database
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow('').default(''),
    DB_DATABASE: Joi.string().required(),

    // JWT - Required and strong
    JWT_SECRET: Joi.string().min(64).required(),
    JWT_EXPIRES_IN: Joi.string().default('24h'),
    JWT_REFRESH_SECRET: Joi.string().min(64).required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

    // CORS
    CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

    // Rate Limiting
    RATE_LIMIT_TTL: Joi.number().default(60),
    RATE_LIMIT_LIMIT: Joi.number().default(100),

    // File Upload
    MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
    UPLOAD_DEST: Joi.string().default('./uploads'),

    // Redis (optional)
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_TTL: Joi.number().default(3600),
    REDIS_MAX_ITEMS: Joi.number().default(1000),

    // Email (optional)
    SMTP_HOST: Joi.string().optional(),
    SMTP_PORT: Joi.number().optional(),
    SMTP_USER: Joi.string().optional(),
    SMTP_PASS: Joi.string().optional(),

    // WhatsApp (optional)
    WHATSAPP_API_KEY: Joi.string().allow('').optional(),
    WHATSAPP_API_URL: Joi.string().allow('').optional(),

    // Logging
    LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'debug', 'verbose')
        .default('info'),

    // Encryption
    ENCRYPTION_KEY: Joi.string().min(32).required(),

    // API Documentation
    API_DOCS_ENABLED: Joi.boolean().default(true),
});

/**
 * Validate environment variables
 * @param config - Environment variables object
 * @returns Validated configuration
 * @throws Error if validation fails
 */
export function validateEnvironment(config: Record<string, unknown>) {
    const { error, value } = envValidationSchema.validate(config, {
        allowUnknown: true,
        abortEarly: false,
    });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
    }

    return value;
}