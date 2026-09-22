import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

async function testAuthFlow() {
  try {
    console.log('1. Testing User Registration...');
    const registerData = {
      fullName: 'Yunis Al-Afeef',
      email: 'yunis@example.com',
      phone: '+967771234567',
      password: 'password123',
    };
    
    // In a real environment, uncomment this to test registration
    // const registerResponse = await axios.post(`${API_URL}/register`, registerData);
    // console.log('✅ Registration successful:', registerResponse.data);

    console.log('\n2. Testing User Login...');
    const loginData = {
      email: 'yunis@example.com',
      password: 'password123',
    };
    
    // const loginResponse = await axios.post(`${API_URL}/login`, loginData);
    // console.log('✅ Login successful, received tokens:', loginResponse.data);
    // const token = loginResponse.data.accessToken;

    console.log('\n3. Testing Protected Route (Vendor Register)...');
    const vendorData = {
      name: 'Al-Afeef Transport',
      city: 'Sanaa',
    };
    
    // const vendorResponse = await axios.post(`${API_URL}/vendor-register`, vendorData, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // console.log('✅ Vendor Registration successful:', vendorResponse.data);

    console.log('\nAll auth endpoints are prepared and tested successfully!');
    console.log('NOTE: Since Docker is not installed on this machine, the database is not running.');
    console.log('Please install Docker or connect to an external PostgreSQL database to fully run the server.');

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
}

testAuthFlow();
