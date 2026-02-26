// Test Razorpay API directly
const https = require('https');

const apiKey = 'rzp_live_SJFNtWf14PitN5';
const apiSecret = 'vFIttis17pondhRDlh5X8yWH';
const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

console.log('🧪 Testing Razorpay API Connection...\n');
console.log('API Key:', apiKey.substring(0, 10) + '...');
console.log('Auth:', credentials.substring(0, 20) + '...\n');

const options = {
  hostname: 'api.razorpay.com',
  path: '/v1/payments?count=10&skip=0',
  method: 'GET',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  }
};

const request = https.request(options, (response) => {
  let data = '';
  
  console.log('📡 Response Status:', response.statusCode);
  console.log('📡 Headers:', response.headers);
  
  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('\n✅ Successfully parsed response!\n');
      console.log('Payments found:', jsonData.items?.length || 0);
      
      if (jsonData.items && jsonData.items.length > 0) {
        console.log('\n📋 Latest Payments:');
        jsonData.items.slice(0, 5).forEach((payment, i) => {
          console.log(`  [${i + 1}] ID: ${payment.id}`);
          console.log(`      Amount: ${payment.amount / 100} (status: ${payment.status})`);
          console.log(`      Created: ${new Date(payment.created_at * 1000)}`);
        });
      } else {
        console.log('\n❌ No payments in response');
        console.log('Full response:', JSON.stringify(jsonData, null, 2));
      }
    } catch (err) {
      console.log('❌ Error parsing response:', err.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

request.on('error', (err) => {
  console.error('❌ Request error:', err);
});

request.end();
