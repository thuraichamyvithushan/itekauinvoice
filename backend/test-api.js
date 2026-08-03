import axios from 'axios';

const test = async () => {
    try {
        console.log('Testing Login...');
        const res = await axios.post('http://localhost:5005/api/auth/login', {
            email: 'admin@gmail.com',
            password: 'admin@12'
        });
        console.log('Login Success:', res.status);
    } catch (error) {
        console.error('Login Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }

    try {
        console.log('\nTesting Registration...');
        const res = await axios.post('http://localhost:5005/api/auth/register', {
            email: `test-${Date.now()}@test.com`,
            password: 'password123',
            companyProfile: { name: 'Test Corp' }
        });
        console.log('Register Success:', res.status);
    } catch (error) {
        console.error('Register Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

test();
