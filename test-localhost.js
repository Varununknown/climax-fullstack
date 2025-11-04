const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testAPIs() {
  console.log('🚀 Testing localhost backend APIs\n');
  
  // Test 1: Get contents
  console.log('📚 TEST 1: GET /api/contents');
  try {
    const result = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/contents',
      method: 'GET'
    });
    console.log(`Status: ${result.status}`);
    console.log(`Data: ${typeof result.body === 'object' ? JSON.stringify(result.body).substring(0, 100) : result.body}\n`);
  } catch (err) {
    console.log(`❌ Error: ${err.message}\n`);
  }
  
  // Test 2: Login
  console.log('🔐 TEST 2: POST /api/auth/login');
  try {
    const loginData = JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const result = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, loginData);
    
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`❌ Error: ${err.message}\n`);
  }
  
  // Test 3: Register new user
  console.log('📝 TEST 3: POST /api/auth/register');
  try {
    const registerData = JSON.stringify({
      name: 'Test User',
      email: `testuser${Date.now()}@test.com`,
      password: 'test123'
    });
    
    const result = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, registerData);
    
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (err) {
    console.log(`❌ Error: ${err.message}\n`);
  }
}

testAPIs();
