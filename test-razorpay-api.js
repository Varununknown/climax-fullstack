// 🧪 Test Razorpay API auto-detection endpoint
const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

async function testAutoVerify() {
  try {
    console.log('🧪 Testing Razorpay API Auto-Detection Endpoint...\n');
    
    // Use a test user and content ID
    const userId = '67c1234567890123456789ab'; // Replace with actual user ID
    const contentId = '67c1234567890123456789cd'; // Replace with actual content ID
    const amount = 199; // Test amount

    console.log('📤 POST /payments/auto-verify-razorpay');
    console.log('Request body:', { userId, contentId, amount });
    console.log('---\n');

    const response = await API.post('/payments/auto-verify-razorpay', {
      userId,
      contentId,
      amount
    });

    console.log('✅ Response Status:', response.status);
    console.log('📨 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testAutoVerify();
