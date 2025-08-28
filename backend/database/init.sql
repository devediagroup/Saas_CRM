-- EchoOps CRM Database Initialization
-- This script creates the initial database structure

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS echoops_crm_db;
USE echoops_crm_db;

-- Create user for the application
CREATE USER IF NOT EXISTS 'echoops_user'@'%' IDENTIFIED BY 'echoops_password';
GRANT ALL PRIVILEGES ON echoops_crm_db.* TO 'echoops_user'@'%';
FLUSH PRIVILEGES;

-- Set SQL mode and charset
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Set character set
ALTER DATABASE echoops_crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create initial tables (will be managed by TypeORM migrations in production)
-- The application will create tables automatically with synchronize: true in development

COMMIT;
