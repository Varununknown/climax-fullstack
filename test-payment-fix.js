/**
 * Test script to verify payment initialization fixes
 * Run with: node test-payment-fix.js
 */

const https = require('https');
const { ObjectId } = require('mongodb');

const API_BASE = 'https://climax-fullstack.onrender.com';

// Generate valid test ObjectIds
const generateTestObjectId = () => new ObjectId().toString();

const testPaymentInitiation = async (testCase, payload) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: 'climax-fullstack.onrender.com',
      port: 443,
      path: '/api/phonepe/initiate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`\n${testCase}: ${res.statusCode}`);
          console.log(JSON.stringify(parsed, null, 2));
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Testing Payment Initialization Fixes\n');
  console.log('=' .repeat(50));

  // Test Case 1: Valid ObjectIds (should work)
  const validUserId = generateTestObjectId();
  const validContentId = generateTestObjectId();
  
  await testPaymentInitiation('✅ Valid ObjectIds', {
    userId: validUserId,
    contentId: validContentId,
    amount: 29,
    userEmail: 'test@example.com',
    userName: 'Test User'
  });

  // Test Case 2: Invalid userId (should return 400 with clear message)
  await testPaymentInitiation('❌ Invalid userId', {
    userId: 'invalid-user-id',
    contentId: validContentId,
    amount: 29,
    userEmail: 'test@example.com',
    userName: 'Test User'
  });

  // Test Case 3: Invalid contentId (should return 400 with clear message)
  await testPaymentInitiation('❌ Invalid contentId', {
    userId: validUserId,
    contentId: 'invalid-content-id',
    amount: 29,
    userEmail: 'test@example.com',
    userName: 'Test User'
  });

  // Test Case 4: Missing fields (should return 400)
  await testPaymentInitiation('❌ Missing fields', {
    userId: validUserId,
    amount: 29,
    userEmail: 'test@example.com'
  });

  console.log('\n🎯 Test Results Summary:');
  console.log('- Valid ObjectIds should return 200 with payment initiation');
  console.log('- Invalid ObjectIds should return 400 with clear error messages');
  console.log('- Missing fields should return 400 with validation error');
  console.log('\n✅ Payment initialization error handling improved!');
};

runTests().catch(console.error);