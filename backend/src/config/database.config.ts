import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'echoops_crm_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production', // Disable in production
  logging: process.env.NODE_ENV === 'development',
  charset: 'utf8mb4',
  timezone: '+00:00',
  dropSchema: false,
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
};
