# 🚀 PayU Gateway - Quick Visual Guide

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: GET CREDENTIALS                  │
│                                                              │
│  Sign up on PayU Test → https://merchant.payu.in/signup     │
│         ↓                                                    │
│  Login → Get Merchant Key & Salt                            │
│         ↓                                                    │
│  SAVE: 8Dy0ij (Key) & P7D4E8K9M2N5Q1R3 (Salt)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               STEP 2: UPDATE .ENV FILE                      │
│                                                              │
│  Open: backend/.env                                         │
│  Find: PAYU_MERCHANT_KEY=...                               │
│  Replace: PAYU_MERCHANT_KEY=8Dy0ij                         │
│  Replace: PAYU_MERCHANT_SALT=P7D4E8K9M2N5Q1R3              │
│  Save: Ctrl + S                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│            STEP 3: ADD TO MONGODB DATABASE                  │
│                                                              │
│  Open: MongoDB Atlas → ottdb → paymentsettings             │
│  Insert Document with:                                      │
│  - payuEnabled: true                                        │
│  - payuMerchantKey: "8Dy0ij"                               │
│  - upiId & qrCodeUrl (your values)                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│           STEP 4: RESTART BACKEND SERVER                    │
│                                                              │
│  Terminal:                                                  │
│  $ cd backend                                               │
│  $ npm start                                                │
│                                                              │
│  Wait for: ✅ Merchant Key: Set                            │
│           ✅ Merchant Salt: Set                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│            STEP 5: TEST ON FRONTEND                         │
│                                                              │
│  1. Open: http://localhost:5173                            │
│  2. Login → Click any premium content                       │
│  3. Click: "Watch Now" → Payment Modal opens               │
│  4. Select: "Fast Checkout" tab                            │
│  5. Click: "Continue to PayU" button                       │
│  6. Use test card: 5123456789012346                        │
│  7. Complete payment ✅                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    ✅ DONE! 🎉
```

---

## File Locations Reference

```
📂 Project Root
│
├── backend/
│   ├── .env ← UPDATE THIS (Step 2)
│   ├── routes/
│   │   ├── payuRoutes.cjs ← Already set up ✅
│   │   └── paymentRoutes.cjs
│   └── server.cjs ← Already mounted ✅
│
├── frontend/
│   └── src/
│       └── components/
│           └── common/
│               └── PaymentModal.tsx ← Already working ✅
│
└── PAYU_GATEWAY_SETUP_GUIDE.md ← This file explains everything
```

---

## Environment Variables (.env)

### LOCATION
```
📂 d:\Varun (SELF)\Start\Climax\newott\backend\.env
```

### WHAT TO CHANGE
```diff
- PAYU_MERCHANT_KEY=your_payu_merchant_key
+ PAYU_MERCHANT_KEY=8Dy0ij

- PAYU_MERCHANT_SALT=your_payu_merchant_salt
+ PAYU_MERCHANT_SALT=P7D4E8K9M2N5Q1R3

- PAYU_ENVIRONMENT=test
+ PAYU_ENVIRONMENT=test
```

---

## MongoDB Document Example

### LOCATION
```
MongoDB Atlas → ottdb → paymentsettings → Insert Document
```

### WHAT TO INSERT
```json
{
  "upiId": "yourname@upi",
  "qrCodeUrl": "https://your-qr-url.jpg",
  "merchantName": "Climax Premium",
  "isActive": true,
  "payuEnabled": true,
  "payuMerchantKey": "8Dy0ij"
}
```

---

## PayU Test Card Numbers

| Type | Card Number | Expiry | CVV |
|------|-------------|--------|-----|
| ✅ Success | 5123456789012346 | 05/25 | 123 |
| ❌ Decline | 5111111111111111 | 05/25 | 123 |

---

## Expected Console Output (After Restart)

```
🔐 PayU Configuration:
  Merchant Key: ✅ Set
  Merchant Salt: ✅ Set
  Environment: test
  Gateway URL: https://sandboxsecure.payu.in/_payment
```

If you see ❌ Not set, check your `.env` file!

---

## Troubleshooting Checklist

```
✓ Is .env file saved? (Ctrl+S)
✓ Are values pasted without quotes? (PAYU_MERCHANT_KEY=8Dy0ij NOT ="8Dy0ij")
✓ Did you restart backend? (npm start)
✓ Is MongoDB document inserted? (Check MongoDB Atlas)
✓ Frontend showing "Fast Checkout" tab? (If yes, ✅ working)
✓ PayU window opens when clicking "Continue to PayU"?
```

---

## Timeline

```
📅 Get PayU Account: 5 minutes (instant if approved)
📅 Update .env: 2 minutes
📅 Add MongoDB: 5 minutes
📅 Restart Server: 1 minute
📅 First Test: 5 minutes
📅 Total Time: ~20 minutes
```

---

## When Everything Works ✅

You should see:

1. **Frontend Modal** displays "Fast Checkout" tab
2. **Click Button** opens PayU window
3. **Enter Card** 5123456789012346
4. **Click Pay** → Payment processed
5. **Redirect** back to your app
6. **Content** shows as unlocked ✅

---

## Production Checklist (When Ready)

- [ ] Business documents prepared
- [ ] Bank account verified with PayU
- [ ] Get production Merchant Key
- [ ] Update `.env` with production credentials
- [ ] Set PAYU_ENVIRONMENT=production
- [ ] Test with small transaction
- [ ] Deploy to production server

---

That's it! Follow the 5 steps and you'll have a fully working PayU payment gateway! 🚀
