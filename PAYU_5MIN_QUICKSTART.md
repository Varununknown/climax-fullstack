# ⚡ PayU Gateway - 5 Minute Quick Start

**TLDR: Do these 5 things and you're done!**

---

## 1️⃣ Sign Up for PayU Test Account (5 min)

```
🌐 URL: https://merchant.payu.in/signup

📝 Fill form:
   Email: your@email.com
   Password: strong_password
   Company: Climax OTT
   Country: India

✅ Verify email → Login

📌 GO TO SETTINGS → Copy these:
   MERCHANT_KEY = (copy this)
   MERCHANT_SALT = (copy this)
```

---

## 2️⃣ Update .env File (1 min)

**Open file:**
```
d:\Varun (SELF)\Start\Climax\newott\backend\.env
```

**Find these lines:**
```
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_MERCHANT_SALT=your_payu_merchant_salt
```

**Replace with your values from PayU:**
```
PAYU_MERCHANT_KEY=8Dy0ij
PAYU_MERCHANT_SALT=P7D4E8K9M2N5Q1R3
PAYU_ENVIRONMENT=test
```

**Save:** Ctrl+S

---

## 3️⃣ Add to MongoDB (1 min)

**Go to:** MongoDB Atlas → ottdb → Collections → paymentsettings

**Click:** Insert Document

**Paste this:**
```json
{
  "upiId": "yourname@upi",
  "qrCodeUrl": "https://via.placeholder.com/300?text=QR",
  "merchantName": "Climax Premium",
  "isActive": true,
  "payuEnabled": true,
  "payuMerchantKey": "8Dy0ij"
}
```

**Click:** Insert

---

## 4️⃣ Restart Backend (1 min)

```bash
# In terminal:
Ctrl+C  (stop current server)

cd backend
npm start

# Wait for:
✅ Merchant Key: Set
✅ Merchant Salt: Set
```

---

## 5️⃣ Test Payment (1 min)

1. Open: http://localhost:5173
2. Login
3. Click premium content → "Watch Now"
4. Payment modal opens
5. Click "Fast Checkout" tab
6. Click "Continue to PayU"
7. New window opens
8. Enter card: **5123456789012346**
9. Expiry: **05/25**
10. CVV: **123**
11. Click "Pay"
12. ✅ **Payment complete!**

---

## ✅ Done! Your PayU Gateway is Live!

**Frontend shows:** "Fast Checkout" tab
**Users can:** Click to pay with PayU
**Content unlocks:** Immediately after payment

---

## 🚨 Quick Fixes If Something Goes Wrong

| Problem | Fix |
|---------|-----|
| Tab doesn't show | Restart backend + hard refresh (Ctrl+Shift+R) |
| Window won't open | Allow popups in browser settings |
| Payment fails | Use test card: 5123456789012346 |
| 404 Error | Add payment settings to MongoDB |
| "Not configured" | Check .env file + restart backend |

---

## 📚 Need More Details?

- **Full Guide:** PAYU_GATEWAY_SETUP_GUIDE.md
- **Visual Guide:** PAYU_QUICK_GUIDE.md
- **Troubleshooting:** PAYU_TROUBLESHOOTING.md

---

**You're done! 🎉**
