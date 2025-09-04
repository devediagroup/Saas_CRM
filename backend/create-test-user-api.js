const axios = require('axios');

async function createTestUser() {
    try {
        console.log('Creating test user via API...');

        // Register a new user with company
        const userData = {
            email: 'test@example.com',
            password: 'Password123!',
            firstName: 'Test',
            lastName: 'User',
            companyName: 'Test Company',
            phone: '+966500000000'
        };

        const response = await axios.post('http://localhost:3000/auth/register', userData);

        if (response.data) {
            console.log('Test user created successfully!');
            console.log('Email: test@example.com');
            console.log('Password: Password123!');
            console.log('User ID:', response.data.user?.id);
            console.log('Company:', response.data.user?.company_name);
        }
    } catch (error) {
        if (error.response?.status === 409) {
            console.log('Test user already exists');
            console.log('Email: test@example.com');
            console.log('Password: Password123!');
        } else {
            console.error('Error creating test user:', error.response?.data || error.message);
        }
    }
}

createTestUser();
