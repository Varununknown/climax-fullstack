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
// 1️⃣ INITIATE PAYMENT - Create Payment Link and redirect URL
// ═══════════════════════════════════════════════════════════════
router.post('/initiate', async (req, res) => {
  console.log('\n🔥🔥🔥 CASHFREE /initiate 🔥🔥🔥');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { userId, contentId, amount, email, phone, userName } = req.body;

    console.log('Extracted fields:');
    console.log('  userId:', userId, typeof userId);
    console.log('  contentId:', contentId, typeof contentId);
    console.log('  amount:', amount, typeof amount);
    console.log('  email:', email);
    console.log('  phone:', phone);
    console.log('  userName:', userName);

    const finalEmail = email || 'user@climax.com';
    const finalPhone = phone || '9999999999';
    const finalUserName = userName || 'User';
    const finalAmount = parseFloat(amount) || 1;

    if (!userId || !contentId || !amount) {
      console.log('❌ VALIDATION FAILED');
      console.log('  userId:', !userId, '(required)');
      console.log('  contentId:', !contentId, '(required)');
      console.log('  amount:', !amount, '(required)');
      
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: userId, contentId, amount',
        received: { userId, contentId, amount },
        missing: {
          userId: !userId,
          contentId: !contentId,
          amount: !amount
        }
      });
    }

    log('📝 Creating payment link for:', { userId, contentId, finalAmount });

    const linkId = `CLX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Payment Links API - this is the ONLY way for PG 2.0 hosted checkout
    const payload = {
      link_id: linkId,
      link_amount: finalAmount,
      link_currency: 'INR',
      link_purpose: `Climax OTT - Content ${contentId}`,
      customer_details: {
        customer_id: userId,
        customer_email: finalEmail,
        customer_phone: finalPhone,
        customer_name: finalUserName
      },
      link_notify: {
        send_sms: false,
        send_email: false
      },
      link_meta: {
        return_url: `${process.env.FRONTEND_URL || 'https://climax-fullstack.vercel.app'}/payment-success?linkId=${linkId}`,
        notify_url: `${process.env.BACKEND_URL || 'https://climax-fullstack.onrender.com/api'}/cashfree/webhook`
      }
    };

    console.log('📤 Calling Payment Links API at:', `${CASHFREE_CONFIG.API_BASE}/links`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      `${CASHFREE_CONFIG.API_BASE}/links`,
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

    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));

    const linkUrl = response.data.link_url;
    
    if (!linkUrl) {
      throw new Error('No link_url in response: ' + JSON.stringify(response.data));
    }

    log('✅ Payment Link created:', linkUrl);

    await Payment.findOneAndUpdate(
      { userId, contentId },
      {
        $set: {
          userId,
          contentId,
          amount: finalAmount,
          transactionId: linkId,
          method: 'cashfree',
          status: 'pending',
          metadata: {
            linkId: linkId,
            linkUrl: linkUrl,
            cfLinkId: response.data.cf_link_id
          }
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      linkId: linkId,
      linkUrl: linkUrl,
      amount: finalAmount,
      message: 'Payment link created successfully'
    });

  } catch (error) {
    console.log('\n❌ CASHFREE API ERROR:');
    console.log('Status:', error.response?.status);
    console.log('URL:', error.response?.url);
    console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Error Message:', error.message);
    
    // Return detailed error for debugging
    res.status(error.response?.status || 500).json({ 
      success: false,
      message: 'Failed to create payment link',
      error: error.response?.data?.message || error.message,
      details: error.response?.data,
      apiEndpoint: `${CASHFREE_CONFIG.API_BASE}/links`,
      credentials: {
        clientId: CASHFREE_CONFIG.CLIENT_ID ? 'SET' : 'NOT SET',
        secretKey: CASHFREE_CONFIG.SECRET_KEY ? 'SET' : 'NOT SET'
      }
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
// Endpoint: Checkout Form (serves HTML that submits to Cashfree)
// ═══════════════════════════════════════════════════════════════
router.post('/checkout', (req, res) => {
  try {
    console.log('📋 /checkout called');
    console.log('   req.body:', req.body);
    console.log('   req.query:', req.query);
    
    // Support both JSON and form-encoded data
    let token = req.body?.token || req.query?.token;

    if (!token) {
      console.error('❌ Missing token in request');
      return res.status(400).json({ success: false, message: 'Token required' });
    }

    console.log('✅ Token received, generating HTML form...');

    // Try multiple Cashfree checkout endpoints (in order of priority)
    const checkoutEndpoints = [
      // Try 1: Direct checkout URL with token parameter (most likely)
      `https://sandbox.cashfree.com/pg/checkout/?token=${encodeURIComponent(token)}`,
      // Try 2: Old form-based endpoint
      'https://sandbox.cashfree.com/pg/post/'
    ];

    const checkoutUrl = checkoutEndpoints[0]; // Use the first endpoint
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Processing Payment...</title>
  <meta charset="UTF-8">
</head>
<body>
  <p>Redirecting to Cashfree payment gateway...</p>
  <script>
    console.log('🔗 Redirecting to:', '${checkoutUrl}');
    window.location.href = '${checkoutUrl}';
  </script>
  <noscript>
    <p><a href="${checkoutUrl}">Click here to continue to payment</a></p>
  </noscript>
</body>
</html>`;

    console.log('✅ Sending HTML form to client');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('❌ Error in /checkout:', error.message, error);
    res.status(500).json({ success: false, message: 'Error processing checkout', error: error.message });
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
