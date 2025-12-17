# Cashfree Payment Gateway Integration Guide

## ✅ Setup Complete!

Your Climax app now has **Cashfree Payment Gateway** integrated. Follow these steps to get it working:

---

## 🔑 Step 1: Get Your Cashfree Credentials

1. Log in to [Cashfree Dashboard](https://www.cashfree.com/)
2. Go to **Settings → API Keys** (or **Merchant Settings**)
3. Find and copy:
   - **App ID** (also called Merchant ID)
   - **Secret Key** (keep this private!)
   - **Client ID** (for frontend)

---

## 📝 Step 2: Add Environment Variables

### Backend (.env file in root directory)

```env
# Cashfree Configuration
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_CLIENT_ID=your_client_id_here

# URLs
FRONTEND_URL=https://your-frontend-url.com
BACKEND_URL=https://your-backend-url.com
```

### Frontend (Add to your index.html)

Add the Cashfree SDK script in the `<head>` section:

```html
<script src="https://sdk.cashfree.com/js/core/cashfree.js"></script>
```

---

## 🎯 Step 3: Implementation in Your Components

### Use in Video Player (ContentDetailsPage.tsx)

```tsx
import CashfreePaymentModal from '../components/common/CashfreePaymentModal';

export const ContentDetailsPage = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const content = useGetContent(); // Your content fetching logic

  const handleWatchContent = async () => {
    // Check if user already paid
    const paymentStatus = await CashfreeService.checkPaymentStatus(
      user._id,
      content._id
    );

    if (paymentStatus.paid) {
      // User has access, show video player
      navigateToPlayer();
    } else {
      // Show payment modal
      setShowPaymentModal(true);
    }
  };

  return (
    <>
      {/* Content details... */}
      
      <button onClick={handleWatchContent} className="btn-primary">
        Watch Now - ₹{content.price}
      </button>

      {/* Payment Modal */}
      <CashfreePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        contentId={content._id}
        contentTitle={content.title}
        amount={content.price}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          navigateToPlayer();
        }}
      />
    </>
  );
};
```

---

## 🔌 API Endpoints Created

### 1. **Initiate Payment**
```
POST /api/cashfree/initiate
Body: {
  userId: string,
  contentId: string,
  amount: number,
  email: string,
  phone: string,
  userName: string
}
Response: {
  success: true,
  orderId: string,
  paymentSessionId: string,
  amount: number
}
```

### 2. **Verify Payment**
```
POST /api/cashfree/verify
Body: { orderId: string }
Response: {
  success: true,
  status: 'approved' | 'pending' | 'failed',
  orderStatus: string,
  paymentStatus: string
}
```

### 3. **Check Payment Status**
```
GET /api/cashfree/status/:userId/:contentId
Response: {
  paid: boolean,
  payment: Payment | null
}
```

### 4. **Webhook** (Automated)
```
POST /api/cashfree/webhook
- Cashfree sends payment updates automatically
- No manual integration needed
```

---

## 📋 Payment Flow

1. **User clicks "Watch Now"** → Check if already paid
2. **Not paid?** → Show Payment Modal
3. **User clicks "Pay Now"** → Call `/api/cashfree/initiate`
4. **Cashfree checkout opens** → User completes payment
5. **Post-payment** → Redirect to `/payment-status?orderId=xxx`
6. **Status page verifies** → Calls `/api/cashfree/verify`
7. **If approved** → Redirect to video player
8. **Webhook updates** → Payment record confirmed (if delayed)

---

## 🧪 Testing

### Sandbox Mode
- Your routes automatically use **sandbox** endpoints if `NODE_ENV !== 'production'`
- Test cards in Sandbox:
  - **Visa**: 4111 1111 1111 1111
  - **Expiry**: Any future date
  - **CVV**: Any 3 digits
  - **OTP**: 123456

### Production Mode
- Set `NODE_ENV=production` to use live endpoints
- **Only real payments** will be processed
- Your verified Cashfree account will receive payments

---

## 🔒 Security Checklist

- ✅ **Secret Key stored in .env** (never in code)
- ✅ **Webhook signature verification** (enabled)
- ✅ **Amount verification** on payment completion
- ✅ **User authentication required** for payments
- ✅ **Payment records in MongoDB** for audit trail

---

## 📊 Payment Records

All payments are stored in your **Payment collection** with:
- `userId` - Who paid
- `contentId` - What they paid for
- `amount` - How much
- `status` - 'approved', 'pending', 'failed'
- `transactionId` - Cashfree Order ID
- `metadata` - Additional Cashfree details
- `createdAt` - Timestamp

---

## ⚠️ Common Issues & Fixes

### "Cashfree SDK not loaded"
- Add the SDK script to your HTML `<head>`
- Check browser console for errors

### "Invalid Client ID"
- Verify CASHFREE_CLIENT_ID in .env matches Cashfree dashboard
- Restart backend after changing .env

### "Payment verification timeout"
- Webhook may be delayed, retry after 3 seconds
- Check Cashfree logs in dashboard

### "CORS errors"
- CORS is already configured in server.cjs
- No additional setup needed

---

## 📞 Support

- **Cashfree Docs**: https://docs.cashfree.com/
- **Sandbox Dashboard**: https://sandbox.cashfree.com/
- **Live Dashboard**: https://dashboard.cashfree.com/

---

## ✨ Next Steps

1. ✅ Add environment variables
2. ✅ Add Cashfree SDK to your HTML
3. ✅ Integrate CashfreePaymentModal in your content pages
4. ✅ Deploy to production
5. ✅ Enable webhook verification in Cashfree dashboard

**Your Cashfree integration is ready to go! 🚀**
