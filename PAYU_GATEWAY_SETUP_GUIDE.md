# 🚀 PayU Gateway Setup Guide - Step by Step

This guide will walk you through **every manual step** needed to make the PayU Gateway (Fast Checkout) payment method fully workable on your Climax OTT platform.

---

## 📋 Overview - What You Need to Do

There are **5 main steps** to get PayU working:

1. **Get PayU Merchant Credentials** (from PayU official)
2. **Update Backend Environment Variables** (.env file)
3. **Add Payment Settings to Database** (MongoDB)
4. **Test on Frontend** (with test credentials)
5. **Deploy to Production** (when ready)

---

## ⏰ Estimated Time: 30-60 minutes

(Most time is waiting for PayU to approve your account)

---

# STEP 1: Create PayU Account & Get Merchant Credentials

### 1.1 - Create Account on PayU

Go to **PayU Test Environment** (Sandbox):

```
📌 URL: https://merchant.payu.in/signup
```

OR

Go to **PayU Production Environment**:

```
📌 URL: https://www.payu.in/merchants/
```

**For NOW, use TEST environment** - it's free and perfect for testing!

### 1.2 - Sign Up on PayU Test Environment

1. Open: `https://merchant.payu.in/signup`
2. Fill in the form:
   - **Email**: Your business email
   - **Password**: Create a strong password
   - **Company Name**: Your company/brand name (e.g., "Climax OTT")
   - **Phone**: Your contact number
   - **Country**: Select India
3. Click **"Sign Up"**
4. **Check your email** for verification link
5. Click the link in email to verify

### 1.3 - Login & Get Your Merchant Credentials

After verification:

1. Go to: `https://merchant.payu.in/login`
2. Login with your email and password
3. Go to **Settings** or **Merchant Details**
4. Look for:

   ```
   🔐 Merchant Key: (e.g., "8Dy0ij")
   🔐 Merchant Salt: (e.g., "xxxxxxxxxxxxxxxx")
   ```

5. **Copy these and SAVE them somewhere safe** (use notepad)

### Example (TEST Credentials - These are FAKE):

```
PAYU_MERCHANT_KEY = 8Dy0ij
PAYU_MERCHANT_SALT = P7D4E8K9M2N5Q1R3
PAYU_ENVIRONMENT = test
```

---

# STEP 2: Update Backend Environment Variables (.env)

Now you'll add the credentials you got from PayU to your backend `.env` file.

### 2.1 - Open Backend .env File

Navigate to:

```
📂 d:\Varun (SELF)\Start\Climax\newott\backend\.env
```

### 2.2 - Find the PayU Section

Look for this section in your `.env`:

```
# ✅ PayU Gateway Configuration
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_MERCHANT_SALT=your_payu_merchant_salt
PAYU_ENVIRONMENT=test
```

### 2.3 - Replace with Your Actual Credentials

**BEFORE:**
```
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_MERCHANT_SALT=your_payu_merchant_salt
PAYU_ENVIRONMENT=test
```

**AFTER** (Replace with YOUR actual credentials from PayU):
```
PAYU_MERCHANT_KEY=8Dy0ij
PAYU_MERCHANT_SALT=P7D4E8K9M2N5Q1R3
PAYU_ENVIRONMENT=test
```

### 2.4 - Save the File

- Press **Ctrl + S** to save
- You should see a confirmation that the file was saved

### ✅ Step 2 Complete!

---

# STEP 3: Add Payment Settings to MongoDB Database

Now you need to add a document to your MongoDB database with PayU enabled.

### 3.1 - Open MongoDB Atlas

1. Go to: `https://cloud.mongodb.com/`
2. Login with your credentials
3. Click on your **"ottdb"** database (from your connection string)
4. Click **"Collections"** or **"Browse Collections"**

### 3.2 - Find Collections

You should see collections like:
- `users`
- `payments`
- `contents`
- `paymentsettings` (or similar)

### 3.3 - Click on PaymentSettings Collection

1. Look for a collection named `paymentsettings` (or similar)
2. Click on it
3. If it doesn't exist, you'll need to create one

### 3.4 - Insert New Document

1. Click **"Insert Document"** button (usually a green + button)
2. Delete the `_id` line if you want MongoDB to auto-generate it
3. Paste this JSON document:

```json
{
  "upiId": "yourname@upi",
  "qrCodeUrl": "https://your-qr-code-url.jpg",
  "merchantName": "Climax Premium",
  "isActive": true,
  "payuEnabled": true,
  "payuMerchantKey": "8Dy0ij",
  "createdAt": {
    "$date": "2025-10-25T00:00:00Z"
  },
  "updatedAt": {
    "$date": "2025-10-25T00:00:00Z"
  }
}
```

### 3.5 - Update the Values

Replace these with YOUR actual values:

| Field | Example | Where to Get |
|-------|---------|--------------|
| `upiId` | `varun@upi` or `9876543210@paytm` | Your UPI ID |
| `qrCodeUrl` | `https://cdn.yourserver.com/qr.jpg` | Your QR code image URL (or use any valid image URL for testing) |
| `merchantName` | `Climax Premium` | Your business name |
| `payuMerchantKey` | `8Dy0ij` | From PayU (Step 2) |

### 3.6 - Insert the Document

1. Click **"Insert"** button
2. You should see: ✅ **"Document inserted successfully"**

### ✅ Step 3 Complete!

---

# STEP 4: Restart Backend Server

After updating `.env`, you need to restart your backend server so it reads the new variables.

### 4.1 - Stop the Current Server

If your backend is running:

1. Press **Ctrl + C** in the terminal where backend is running
2. Wait for it to stop

### 4.2 - Start Backend Again

Navigate to backend directory and start:

```bash
cd backend
npm start
```

or

```bash
node server.cjs
```

Wait for the server to start. You should see:

```
🔐 PayU Configuration:
  Merchant Key: ✅ Set
  Merchant Salt: ✅ Set
  Environment: test
  Gateway URL: https://sandboxsecure.payu.in/_payment
```

### ⚠️ If You See ❌ Not set

This means your `.env` was not read correctly. Check:
- Did you save the `.env` file? (Ctrl+S)
- Did you restart the server?
- Did you use the correct key names? (copy from example above)

---

# STEP 5: Test Payment Flow on Frontend

Now you can test the complete PayU payment flow!

### 5.1 - Open Your App

1. Go to: `http://localhost:5173` (or your frontend URL)
2. Login to your account
3. Click on any premium content
4. Click **"Watch Now"** or **"Unlock"**
5. The **Payment Modal** should open

### 5.2 - Test Gateway Payment

1. The modal should show **2 tabs**:
   - ✅ **"Fast Checkout"** (PayU) - This should be **DEFAULT/SELECTED**
   - "QR Code" (UPI)

2. Click on **"Fast Checkout"** tab (if not already selected)

3. You should see:
   - Gateway icon/badge
   - A button that says **"Continue to PayU"** or similar

### 5.3 - Click "Continue to PayU"

1. Click the **"Continue to PayU"** button
2. A new browser window should open
3. You'll be redirected to PayU's payment page

### 5.4 - Use PayU Test Credentials

**For Test Environment**, PayU provides test card details:

#### ✅ Test Card (Success):
```
Card Number: 5123456789012346
Expiry: 05/25
CVV: 123
Name: Test User
```

#### ❌ Test Card (Failure - for testing):
```
Card Number: 5111111111111111
Expiry: 05/25
CVV: 123
Name: Test User
```

### 5.5 - Complete the Payment

1. Enter test card details
2. Click **"Pay Now"**
3. After successful payment, you'll be redirected back to your app
4. You should see: ✅ **"Payment successful! Content unlocked!"**

### ✅ Step 5 Complete!

---

# STEP 6 (OPTIONAL): Go to Production

When you're ready to accept real payments:

### 6.1 - Create PayU Production Account

1. Go to: `https://www.payu.in/merchants/`
2. Sign up for production account
3. Provide:
   - Business registration documents
   - Bank account details
   - KYC verification

### 6.2 - Get Production Credentials

Once approved by PayU:
1. Login to production dashboard
2. Get your **Production Merchant Key** and **Merchant Salt**

### 6.3 - Update .env for Production

Replace test credentials with production:

```
PAYU_MERCHANT_KEY=your_production_key
PAYU_MERCHANT_SALT=your_production_salt
PAYU_ENVIRONMENT=production
```

### 6.4 - Restart Server

```bash
npm start
```

### ✅ Now accepting REAL payments! 🎉

---

# ❓ Troubleshooting

### Problem 1: "Payment gateway not configured"

**Solution:**
- Check if `.env` file has correct values
- Restart backend server (npm start)
- Check console for: "✅ Merchant Key: Set"

### Problem 2: PayU window doesn't open

**Solution:**
- Check browser's popup blocker
- Allow popups for your domain
- Check browser console (F12) for errors

### Problem 3: Payment marked as pending, not approved

**Solution:**
- Check PayU test environment credentials
- Ensure you're using test card details
- Check backend console for payment status

### Problem 4: MongoDB document insert failed

**Solution:**
- Ensure you're in the correct database (ottdb)
- Check if paymentsettings collection exists
- Copy-paste the JSON example exactly as shown

### Problem 5: "Content already unlocked" after payment

**This is NORMAL!** ✅
- Once payment is approved, content is unlocked
- This prevents double payments

---

# 📞 Need Help?

## Check These Logs

### Backend Console (Server Logs)

When you make a payment, you should see:

```
═══════════════════════════════════════════════════════
🔐 PayU Payment Initiation
User: (your user ID)
Content: (content ID)
Amount: 99
═══════════════════════════════════════════════════════
✅ PayU hash generated
✅ Payment record created
═══════════════════════════════════════════════════════
```

### Browser Console (F12)

In browser, press **F12** and check **Console** tab for:
- No red errors
- PayU form generated successfully
- Window opened successfully

---

# 🎯 Checklist - Before You Start

Make sure you have:

- [ ] PayU test account created
- [ ] Merchant Key copied
- [ ] Merchant Salt copied
- [ ] Backend `.env` file updated
- [ ] Payment settings added to MongoDB
- [ ] Backend server restarted
- [ ] Frontend running
- [ ] Test payment method ready

---

# 📝 Quick Reference - All Commands

```bash
# 1. Open backend directory
cd backend

# 2. Start backend
npm start

# 3. Check if running
# You should see: "✅ Merchant Key: Set"

# 4. Frontend is usually:
# http://localhost:5173
```

---

# 🔐 Security Notes

⚠️ **NEVER** share these publicly:
- PAYU_MERCHANT_KEY
- PAYU_MERCHANT_SALT
- `.env` file

These are like passwords - keep them safe!

---

# 📚 Helpful Resources

- **PayU Sandbox Portal**: https://merchant.payu.in/
- **PayU Production Portal**: https://www.payu.in/merchants/
- **PayU Documentation**: https://www.payu.in/documents/
- **PayU Test Cards**: https://www.payu.in/test/

---

**🎉 That's it! You now have a working PayU Gateway on your OTT platform!**
