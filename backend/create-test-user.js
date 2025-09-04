#!/usr/bin/env ts-node

const { exec } = require('child_process');
const bcrypt = require('bcryptjs');

// Simple script to create test user using psql
async function createTestUser() {
    const password = await bcrypt.hash('password123', 10);

    const sql = `
    INSERT INTO users (
      id, 
      email, 
      password_hash, 
      first_name, 
      last_name, 
      phone, 
      role, 
      status,
      is_email_verified,
      company_id,
      created_at,
      updated_at
    ) 
    SELECT 
      gen_random_uuid(),
      'test@example.com',
      '${password}',
      'Test',
      'User',
      '+966500000000',
      'super_admin',
      'active',
      true,
      (SELECT id FROM companies LIMIT 1),
      NOW(),
      NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE email = 'test@example.com'
    );
  `;

    console.log('Creating test user...');
    console.log('Email: test@example.com');
    console.log('Password: password123');

    const command = `psql "${process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/crm_db'}" -c "${sql.replace(/\n/g, ' ')}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error:', error);
            return;
        }
        if (stderr) {
            console.error('Error:', stderr);
            return;
        }
        console.log('Test user created successfully!');
        console.log(stdout);
    });
}

createTestUser();
