# ⚠️ PayU Gateway - Common Issues & Solutions

## Issue 1: "Payment gateway not configured"

### Error Message
```
❌ Message: "Payment gateway not configured. Please try UPI payment instead."
```

### Root Causes
1. `.env` file not updated
2. `.env` file not saved
3. Backend server not restarted after .env change
4. Wrong key/value format in .env

### Solution

**Step 1:** Check `.env` file
```
File: backend/.env
```

**Step 2:** Verify exact format (NO QUOTES):
```
✅ CORRECT:
PAYU_MERCHANT_KEY=8Dy0ij
PAYU_MERCHANT_SALT=P7D4E8K9M2N5Q1R3

❌ WRONG:
PAYU_MERCHANT_KEY="8Dy0ij"
PAYU_MERCHANT_SALT="P7D4E8K9M2N5Q1R3"

❌ WRONG (spaces):
PAYU_MERCHANT_KEY = 8Dy0ij
```

**Step 3:** Save file
```
Press: Ctrl + S
```

**Step 4:** Restart backend
```bash
# Press Ctrl+C to stop current server
# Then restart:
cd backend
npm start
```

**Step 5:** Check console output
```
Should see:
✅ Merchant Key: Set
✅ Merchant Salt: Set
```

---

## Issue 2: PayU Tab Not Showing

### Problem
```
Modal shows only "QR Code" tab, no "Fast Checkout" tab
```

### Root Causes
1. MongoDB `paymentSettings` document doesn't exist
2. `payuEnabled` is set to `false` in database
3. Document not fetched properly

### Solution

**Step 1:** Check MongoDB
```
Go to: MongoDB Atlas → ottdb → paymentsettings
```

**Step 2:** Look for a document with:
```json
{
  "payuEnabled": true
}
```

**Step 3:** If document doesn't exist, create it
```json
{
  "upiId": "yourname@upi",
  "qrCodeUrl": "https://example.com/qr.jpg",
  "merchantName": "Climax Premium",
  "isActive": true,
  "payuEnabled": true,
  "payuMerchantKey": "8Dy0ij"
}
```

**Step 4:** If document exists but `payuEnabled: false`, update it
```
Click on document → Edit → Change payuEnabled to true → Save
```

**Step 5:** Hard refresh browser
```
Press: Ctrl + Shift + R (or Cmd + Shift + R on Mac)
```

---

## Issue 3: PayU Window Doesn't Open

### Problem
```
Click "Continue to PayU" button → Nothing happens
No new window appears
```

### Root Causes
1. Browser popup blocker is enabled
2. JavaScript error in console
3. PayU form not generated correctly

### Solution

**Step 1:** Disable popup blocker
```
1. Browser address bar right side → Popup blocked icon
2. Click it → Allow popups for this site
3. Refresh page
4. Try payment again
```

**Step 2:** Check browser console
```
Press: F12
Go to: Console tab
Look for RED errors
```

**Step 3:** If you see errors, report them

**Step 4:** Check if form is being created
```
Console should show something like:
✅ PayU form ready
✅ Submitting to PayU...
```

**Step 5:** Manually allow popups if needed
```
For Chrome:
Settings → Privacy and security → Site settings → Pop-ups and redirects
Add your domain → Allow

For Firefox:
about:preferences → Privacy → Permissions → Block pop-up windows
Uncheck the box OR add exception
```

---

## Issue 4: "Invalid Transaction ID" Error

### Problem
```
After entering transaction ID, get error:
❌ "This transaction ID has already been used"
```

### Root Causes
1. Transaction ID was used before
2. Trying same test transaction twice

### Solution

**Option 1:** Use a NEW transaction ID each time
```
Format: txn_20250101_12345
Just make sure it's different each time
```

**Option 2:** Clear payments from database
```
MongoDB Atlas → ottdb → payments
Find your test payment → Delete it
Try again with same transaction ID
```

**Option 3:** For testing
```
Use timestamps in transaction ID:
txn_[Date.now()]_[userId]
Example: txn_1729873452612_507f1f77bcf86cd799439011
```

---

## Issue 5: PayU Payment Shows "Pending" Instead of "Approved"

### Problem
```
After payment, status shows "pending" not "approved"
Content doesn't unlock
```

### Root Causes
1. Wrong test card used
2. PayU gateway returning failure response
3. Hash verification failed
4. Backend not processing callback

### Solution

**Step 1:** Use correct test card
```
✅ SUCCESS Card: 5123456789012346
Expiry: 05/25
CVV: 123
```

**Step 2:** Check backend logs
```
Terminal where server is running should show:
✅ PayU Success Callback Received
✅ Payment status updated to: approved
```

**Step 3:** If you don't see callback logs
```
Backend might not be receiving response from PayU
Check:
1. Is BACKEND_URL correct in .env?
2. Is backend reachable from internet? (for production)
3. Check PayU webhook configuration
```

**Step 4:** Manually update in database
```
MongoDB Atlas → ottdb → payments
Find your payment → Edit status to "approved"
Save → Hard refresh app (Ctrl+Shift+R)
```

---

## Issue 6: "Already Unlocked" Message

### Problem
```
After first payment, second attempt shows:
"You already have access to this content"
```

### This is NORMAL! ✅

### Explanation
```
System prevents duplicate payments:
1. User pays once → Content unlocked
2. User tries to watch again → Payment already approved
3. System shows message: "Already unlocked"
4. User watches content directly without payment modal
```

### This is a SECURITY FEATURE
```
It prevents:
- Accidental double charges
- Payment fraud
- System abuse
```

---

## Issue 7: Frontend Connection Error

### Problem
```
Error: Failed to connect to backend
Cannot reach PayU endpoint
```

### Root Causes
1. Backend server not running
2. Wrong BACKEND_URL in environment
3. CORS issues

### Solution

**Step 1:** Check if backend is running
```bash
# In terminal:
# If not running, start it:
cd backend
npm start

# Wait for message:
Server running on port 5000
```

**Step 2:** Check BACKEND_URL
```
frontend/.env or vite config should have:
BACKEND_URL=http://localhost:5000
```

**Step 3:** Verify backend is accessible
```
Open in browser:
http://localhost:5000/api/payment-settings

Should return JSON (not error)
```

**Step 4:** Check CORS configuration
```
backend/server.cjs should have:
app.use(cors());

If frontend is on different domain, 
might need to configure CORS properly
```

---

## Issue 8: MongoDB Connection Failed

### Problem
```
Error: Cannot connect to MongoDB
```

### Root Causes
1. MongoDB URI incorrect in .env
2. IP address not whitelisted
3. MongoDB connection string expired

### Solution

**Step 1:** Check connection string
```
backend/.env

Should start with: mongodb+srv://
Ends with: ?retryWrites=true&w=majority
```

**Step 2:** Verify MongoDB is running
```
Go to: https://cloud.mongodb.com/
Login → Check if cluster is active (green)
```

**Step 3:** Whitelist your IP
```
MongoDB Atlas → Network Access
Add your IP address (or 0.0.0.0 for testing)
```

**Step 4:** Test connection
```bash
# In terminal:
cd backend
npm start

Look for: ✅ Connected to MongoDB
```

---

## Issue 9: Payment Settings Endpoint Returns 404

### Problem
```
Error: GET /api/payment-settings returns 404
```

### Root Causes
1. Payment settings collection doesn't exist
2. No document in collection
3. Wrong collection name

### Solution

**Step 1:** Check collection name
```
MongoDB Atlas → ottdb → Collections
Should see: paymentsettings (lowercase)
```

**Step 2:** Verify document exists
```
Go to: paymentsettings collection
Should have at least 1 document
```

**Step 3:** If collection doesn't exist, create it
```
Click "Create Collection"
Name: paymentsettings
Click "Create"
Then insert a document (see Issue 2)
```

**Step 4:** Restart backend
```bash
npm start
```

---

## Issue 10: Hash Mismatch Error

### Problem
```
❌ Error: Hash verification failed
Payment marked as declined
```

### Root Causes
1. Wrong merchant salt used
2. PayU credentials don't match
3. Tampered request

### Solution

**Step 1:** Verify credentials match exactly
```
.env PAYU_MERCHANT_KEY must match:
PayU Dashboard → Merchant Key

.env PAYU_MERCHANT_SALT must match:
PayU Dashboard → Merchant Salt
```

**Step 2:** Check for trailing spaces
```
❌ WRONG: "8Dy0ij " (space at end)
✅ CORRECT: "8Dy0ij" (no spaces)
```

**Step 3:** Restart backend after any .env change
```bash
Ctrl+C (stop server)
npm start (restart)
```

---

## Quick Diagnostics Checklist

```
When payment fails, check in order:

☐ Backend running? (npm start)
☐ .env has credentials? (PAYU_MERCHANT_KEY set)
☐ MongoDB connected? (console shows ✅)
☐ Payment settings in DB? (payuEnabled: true)
☐ Browser popup blocked? (Allow it)
☐ Using test card? (5123456789012346)
☐ Test environment selected? (PAYU_ENVIRONMENT=test)
☐ Hard refreshed? (Ctrl+Shift+R)
☐ Cleared browser cache? (F12 → Application → Clear storage)
```

---

## Debug Mode - Enable Detailed Logging

To see more details in backend console:

**Edit:** backend/server.cjs

**Add before routes:**
```javascript
// Debug logging
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});
```

Restart server to see detailed request logs.

---

## Getting Help

If you're stuck, provide:

1. **Error message** (exact text)
2. **Backend console output** (screenshot)
3. **Browser console errors** (F12 → Console)
4. **Frontend URL** (what are you accessing)
5. **Steps to reproduce** (what did you click)

---

## Quick Contact Points

- **PayU Support**: https://www.payu.in/contact/
- **PayU Documentation**: https://www.payu.in/documents/
- **Backend Logs**: Check terminal where server is running
- **Frontend Logs**: Press F12 in browser

---

**🎯 Most Common Fix: Restart Backend After Any Change!**

```bash
# Stop:
Ctrl+C

# Start:
npm start

# Check for ✅ signs in console
```

