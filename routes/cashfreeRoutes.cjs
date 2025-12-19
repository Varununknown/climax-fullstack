const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment.cjs');
const User = require('../models/User.cjs');

// Cashfree Configuration
const CASHFREE_CONFIG = {
  APP_ID: process.env.CASHFREE_APP_ID || '',
  SECRET_KEY: process.env.CASHFREE_SECRET_KEY || '',
  CLIENT_ID: process.env.CASHFREE_CLIENT_ID || '',
  API_BASE: process.env.NODE_ENV === 'production' 
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'
};

const log = (...args) => console.log('[💳 Cashfree]', ...args);

// ═══════════════════════════════════════════════════════════════
// 1️⃣ INITIATE PAYMENT - Create order and return payment token
// ═══════════════════════════════════════════════════════════════
router.post('/initiate', async (req, res) => {
  console.log('\n🔥🔥🔥 CASHFREE /initiate CALLED 🔥🔥🔥');
  console.log('Full Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Request Headers:', req.headers);
  
  try {
    const { userId, contentId, amount, email, phone, userName } = req.body;

    console.log('\n📥 Parsed Fields:');
    console.log('  userId:', userId, typeof userId);
    console.log('  contentId:', contentId, typeof contentId);
    console.log('  amount:', amount, typeof amount);
    console.log('  email:', email, typeof email);
    console.log('  phone:', phone, typeof phone);
    console.log('  userName:', userName, typeof userName);

    console.log('\n🔑 Environment Variables:');
    console.log('  CASHFREE_APP_ID:', process.env.CASHFREE_APP_ID ? '✅ SET' : '❌ NOT SET');
    console.log('  CASHFREE_SECRET_KEY:', process.env.CASHFREE_SECRET_KEY ? '✅ SET' : '❌ NOT SET');
    console.log('  CASHFREE_CLIENT_ID:', process.env.CASHFREE_CLIENT_ID ? '✅ SET' : '❌ NOT SET');

    // RELAXED VALIDATION - accept any truthy values
    if (!userId || !contentId || !amount) {
      console.log('\n❌ VALIDATION FAILED - Missing critical fields');
      console.log('  Missing: userId:', !userId, 'contentId:', !contentId, 'amount:', !amount);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        received: req.body,
        missing: {
          userId: !userId,
          contentId: !contentId,
          amount: !amount,
          email: !email,
          phone: !phone,
          userName: !userName
        }
      });
    }

    // Use fallback values for optional fields
    const finalEmail = email || 'user@climax.com';
    const finalPhone = phone || '9999999999';
    const finalUserName = userName || 'User';
    const finalAmount = parseFloat(amount) || 1;

    console.log('\n✅ VALIDATION PASSED');
    console.log('Final values:', { userId, contentId, email: finalEmail, phone: finalPhone, userName: finalUserName, amount: finalAmount });

    log('📝 Initiating Cashfree payment for:', { userId, contentId, finalAmount });

    // Generate unique order ID
    const orderId = `CLX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare Cashfree payload
    const payload = {
      order_id: orderId,
      order_amount: finalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
        customer_email: finalEmail,
        customer_phone: finalPhone,
        customer_name: finalUserName
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL || 'https://climax-fullstack.onrender.com'}/payment-status?orderId=${orderId}&contentId=${contentId}`,
        notify_url: `${process.env.BACKEND_URL || 'https://climax-fullstack.onrender.com/api'}/cashfree/webhook`,
        payment_methods: 'cc,dc,nb,upi'
      },
      custom_metadata: {
        contentId: contentId,
        userId: userId
      }
    };

    log('📤 Sending to Cashfree API:', JSON.stringify(payload));

    // Call Cashfree API to create order
    const response = await axios.post(
      `${CASHFREE_CONFIG.API_BASE}/orders`,
      payload,
      {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_CONFIG.CLIENT_ID,
          'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    log('✅ Order created:', response.data);

    // Save or update payment record in our DB (upsert to handle retries)
    const payment = await Payment.findOneAndUpdate(
      { userId, contentId },
      {
        $set: {
          userId,
          contentId,
          amount: finalAmount,
          transactionId: orderId,
          method: 'cashfree',
          status: 'pending',
          metadata: {
            orderId: orderId,
            cashfreeOrderId: response.data.cf_order_id,
            cashfreePaymentSessionId: response.data.payment_session_id
          }
        }
      },
      { upsert: true, new: true }
    );

    log('✅ Payment record saved/updated');

    // For Cashfree PG 2.0 (v2023-08-01), use the cf_token parameter
    // This is the correct way to redirect to checkout
    const checkoutUrl = `https://sandbox.cashfree.com/pg/checkout/post/submit/?cf_token=${response.data.payment_session_id}`;

    // Return payment info for frontend
    res.json({
      success: true,
      orderId: orderId,
      paymentSessionId: response.data.payment_session_id,
      checkoutUrl: checkoutUrl,
      amount: finalAmount,
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.log('\n❌ CASHFREE ERROR:');
    console.log('Status:', error.response?.status);
    console.log('Response Data:', error.response?.data);
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);
    
    res.status(error.response?.status || 500).json({ 
      message: 'Failed to initiate payment',
      details: error.response?.data || error.message,
      requestBody: req.body,
      error: error.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// 2️⃣ VERIFY PAYMENT - Check payment status from Cashfree
// ═══════════════════════════════════════════════════════════════
router.post('/verify', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID required' });
    }

    log('🔍 Verifying payment for order:', orderId);

    // Fetch payment status from Cashfree
    const response = await axios.get(
      `${CASHFREE_CONFIG.API_BASE}/orders/${orderId}`,
      {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_CONFIG.CLIENT_ID,
          'x-client-secret': CASHFREE_CONFIG.SECRET_KEY
        }
      }
    );

    log('Cashfree response:', response.data);

    const orderStatus = response.data.orderStatus;
    const paymentStatus = response.data.paymentStatus;

    // Update our payment record
    const payment = await Payment.findOne({ transactionId: orderId });

    if (payment) {
      if (orderStatus === 'PAID' && paymentStatus === 'SUCCESS') {
        payment.status = 'approved';
        log('✅ Payment approved!');
      } else if (orderStatus === 'ACTIVE') {
        payment.status = 'pending';
        log('⏳ Payment pending');
      } else if (orderStatus === 'FAILED') {
        payment.status = 'failed';
        log('❌ Payment failed');
      }

      await payment.save();
    }

    res.json({
      success: true,
      status: payment?.status || 'unknown',
      orderStatus: orderStatus,
      paymentStatus: paymentStatus,
      payment: payment,
      message: `Payment status: ${paymentStatus}`
    });

  } catch (error) {
    log('❌ Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to verify payment',
      error: error.response?.data || error.message 
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// 3️⃣ WEBHOOK - Cashfree sends payment updates
// ═══════════════════════════════════════════════════════════════
router.post('/webhook', async (req, res) => {
  try {
    log('📨 Webhook received:', req.body);

    const { orderId, orderStatus, paymentStatus, cf_payment_id } = req.body;

    // Verify webhook signature
    const signature = req.headers['x-webhook-signature'];
    if (!verifyWebhookSignature(req.body, signature)) {
      log('❌ Invalid webhook signature');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Update payment status
    const payment = await Payment.findOne({ transactionId: orderId });

    if (payment) {
      if (orderStatus === 'PAID' && paymentStatus === 'SUCCESS') {
        payment.status = 'approved';
        payment.metadata.cf_payment_id = cf_payment_id;
        log('✅ Payment confirmed via webhook');
      } else if (orderStatus === 'FAILED') {
        payment.status = 'failed';
        log('❌ Payment failed via webhook');
      }

      await payment.save();
    }

    res.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    log('❌ Webhook error:', error.message);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// ═══════════════════════════════════════════════════════════════
// 4️⃣ GET PAYMENT STATUS - Check if user paid for content
// ═══════════════════════════════════════════════════════════════
router.get('/status/:userId/:contentId', async (req, res) => {
  try {
    const { userId, contentId } = req.params;

    const payment = await Payment.findOne({
      userId,
      contentId,
      method: 'cashfree',
      status: 'approved'
    });

    res.json({
      paid: !!payment,
      payment: payment || null
    });

  } catch (error) {
    log('❌ Error checking payment status:', error.message);
    res.status(500).json({ message: 'Error checking payment status' });
  }
});

// ═══════════════════════════════════════════════════════════════
// Endpoint: Get Checkout Form (serves HTML that auto-submits to Cashfree)
// ═══════════════════════════════════════════════════════════════
router.post('/checkout-form', (req, res) => {
  try {
    const { paymentSessionId } = req.body;

    console.log('📋 /checkout-form called with sessionId:', paymentSessionId?.substring(0, 50));

    if (!paymentSessionId) {
      console.error('❌ Missing paymentSessionId');
      return res.status(400).json({ success: false, message: 'Payment session ID required' });
    }

    // Safely escape the session ID for HTML
    const safeSessionId = paymentSessionId
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    // Return HTML form that auto-submits to Cashfree
    const htmlForm = `<!DOCTYPE html>
<html>
<head>
  <title>Processing Payment...</title>
</head>
<body>
  <form id="cashfreeForm" method="POST" action="https://sandbox.cashfree.com/checkout/post/">
    <input type="hidden" name="token" value="${safeSessionId}">
  </form>
  <script>
    document.getElementById('cashfreeForm').submit();
  </script>
  <p>Redirecting to payment gateway...</p>
</body>
</html>`;

    console.log('✅ Sending checkout form to frontend');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlForm);

  } catch (error) {
    console.error('❌ Error in /checkout-form:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating checkout form',
      error: error.message 
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// HELPER: Verify Webhook Signature
// ═══════════════════════════════════════════════════════════════
function verifyWebhookSignature(payload, signature) {
  try {
    // Cashfree signature verification
    const message = JSON.stringify(payload);
    const hash = crypto
      .createHmac('sha256', CASHFREE_CONFIG.SECRET_KEY)
      .update(message)
      .digest('base64');

    return hash === signature;
  } catch (error) {
    log('❌ Signature verification error:', error.message);
    return false;
  }
}

module.exports = router;
