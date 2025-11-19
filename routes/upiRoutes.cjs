const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment.cjs');
const User = require('../models/User.cjs');

console.log('✅ UPI Deep Link routes loaded');

// ✅ POST - Verify UPI Transaction (Simple - Just check if unique and unlock)
router.post('/verify-upi', async (req, res) => {
  try {
    const { userId, contentId, transactionId } = req.body;

    console.log('🔍 [UPI Verify] Starting verification...');
    console.log('🔍 [UPI Verify] Received:', { userId, contentId, transactionId });

    if (!userId || !contentId || !transactionId) {
      console.log('❌ [UPI Verify] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔍 [UPI Verify] Validating transaction ID format:', transactionId);

    // Validate transaction ID format (12+ alphanumeric characters)
    const txnIdPattern = /^[A-Z0-9]{12,}$/i;
    if (!txnIdPattern.test(transactionId)) {
      console.log('❌ [UPI Verify] Invalid transaction ID format:', transactionId);
      return res.status(400).json({
        success: false,
        error: 'INVALID_FORMAT',
        message: 'Transaction ID must be 12+ alphanumeric characters'
      });
    }

    console.log('🔍 [UPI Verify] Checking for duplicate payment...');
    
    // Check if this transaction already exists (must be unique)
    const existingPayment = await Payment.findOne({
      transactionId: transactionId,
      status: 'approved'
    });

    if (existingPayment) {
      console.log('⚠️ [UPI Verify] Duplicate payment attempt:', transactionId);
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE',
        message: 'This payment already exists in our system'
      });
    }

    console.log('✅ [UPI Verify] No duplicate found, creating payment record...');

    // Create successful payment record
    const payment = new Payment({
      userId,
      contentId,
      amount: 0, // Amount will be from content pricing
      status: 'approved',
      gateway: 'upi',
      transactionId: transactionId,
      createdAt: new Date()
    });

    const savedPayment = await payment.save();
    console.log('✅ [UPI Verify] Payment record created:', savedPayment._id);

    console.log('🔍 [UPI Verify] Looking up user:', userId);

    // Unlock content for user
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ [UPI Verify] User not found:', userId);
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    console.log('✅ [UPI Verify] User found:', user._id);

    if (!user.purchasedContent) {
      user.purchasedContent = [];
      console.log('📝 [UPI Verify] Created purchasedContent array');
    }
    
    if (!user.purchasedContent.includes(contentId)) {
      user.purchasedContent.push(contentId);
      console.log('📝 [UPI Verify] Added content to user purchases:', contentId);
    } else {
      console.log('⚠️ [UPI Verify] Content already in user purchases');
    }

    const savedUser = await user.save();
    console.log('✅ [UPI Verify] User updated:', savedUser._id);

    console.log('✅ [UPI Verify] Verification complete - returning success');

    res.json({
      success: true,
      message: 'Payment verified! Content unlocked.',
      transactionId: transactionId,
      contentId: contentId
    });
  } catch (error) {
    console.error('❌ [UPI Verify] EXCEPTION:', error);
    console.error('❌ [UPI Verify] Error message:', error.message);
    console.error('❌ [UPI Verify] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'VERIFICATION_ERROR',
      message: 'Failed to verify payment',
      details: error.message
    });
  }
});

module.exports = router;

