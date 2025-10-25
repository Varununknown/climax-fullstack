/**
 * GOOGLE OAUTH DIAGNOSTIC TEST
 * 
 * Run this in browser console or via curl to test each step
 */

// ============================================
// 1. TEST: Can we reach the backend?
// ============================================
console.log('🔍 TEST 1: Backend Connectivity');
fetch('http://localhost:5000/api/auth/google/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'test' })
})
  .then(r => r.json())
  .then(d => {
    console.log('✅ Backend is reachable');
    console.log('Response:', d);
  })
  .catch(e => {
    console.error('❌ Backend not reachable:', e.message);
  });

// ============================================
// 2. TEST: Check environment variables
// ============================================
console.log('\n🔍 TEST 2: Environment Variables (from frontend)');
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL || 'NOT SET (using localhost:5000)');
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID || 'NOT SET');

// ============================================
// 3. COMMON ERRORS & SOLUTIONS
// ============================================
console.log('\n🔍 COMMON GOOGLE AUTH ERRORS:');
console.log(`
1. "redirect_uri_mismatch" 
   → Redirect URI doesn't match Google Console
   → Should be: https://climaxott.vercel.app/auth/google/callback
   
2. "Authorization code required"
   → Code not being sent from frontend
   → Check GoogleLoginButton flow: auth-code
   
3. "invalid_client"
   → GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET wrong
   → Check backend .env or Render env vars
   
4. "Failed to get user data"
   → JWT verification failed
   → Check GOOGLE_CLIENT_ID is correct in verifyIdToken
   
5. "500 error"
   → Missing env vars on Render (JWT_SECRET, MONGO_URI, etc)
   → Check Render dashboard Environment tab
`);
