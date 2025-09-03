const { DataSource } = require('typeorm');
require('dotenv').config();

module.exports = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'echoops_crm_db',
  entities: [], // Empty for migrations only
  migrations: [__dirname + '/src/database/migrations/*.js'], // Use .js files
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  charset: 'utf8mb4',
  timezone: '+00:00',
  extra: {
    connectionLimit: 10,
  },
});
