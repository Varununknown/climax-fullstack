const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment.cjs');
const User = require('../models/User.cjs');
const Content = require('../models/Content.cjs');

// 📝 Log helper
const log = (...args) => console.log('[💰 Payment]', ...args);

// Save a payment (auto-approve)
router.post('/', async (req, res) => {
  try {
    const { userId, contentId, amount, transactionId } = req.body;

    if (!userId || !contentId || !amount || !transactionId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate ObjectId formats
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format. Must be a valid MongoDB ObjectId.' });
    }
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: 'Invalid contentId format. Must be a valid MongoDB ObjectId.' });
    }

    // Convert to ObjectIds
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const contentIdObj = new mongoose.Types.ObjectId(contentId);

    // If payment exists, ensure it's approved and return success
    const existing = await Payment.findOne({ userId: userIdObj, contentId: contentIdObj });
    if (existing) {
      if (existing.status !== 'approved') {
        existing.status = 'approved';
        await existing.save();
      }
      return res.status(200).json({ 
        message: 'Payment already exists, unlocked', 
        paid: true,
        alreadyPaid: true,
        payment: existing
      });
    }

    // Create auto-approved payment for instant unlock
    const newPayment = new Payment({ 
      userId: userIdObj, 
      contentId: contentIdObj, 
      amount, 
      transactionId,
      status: 'approved'
    });
    await newPayment.save();

    log('✅ Payment saved & approved:', transactionId);
    return res.status(201).json({ 
      message: 'Payment approved successfully',
      paid: true,
      alreadyPaid: false,
      payment: newPayment
    });
  } catch (err) {
    console.error('❌ Error saving payment:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Check if approved payment exists
router.get('/check', async (req, res) => {
  const { userId, contentId } = req.query;
  try {
    if (!userId || !contentId) {
      return res.status(400).json({ message: 'Missing query parameters' });
    }

    // Validate ObjectId formats
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format. Must be a valid MongoDB ObjectId.' });
    }
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: 'Invalid contentId format. Must be a valid MongoDB ObjectId.' });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const contentIdObj = new mongoose.Types.ObjectId(contentId);

    const payment = await Payment.findOne({ 
      userId: userIdObj, 
      contentId: contentIdObj,
      status: 'approved'
    });
    return res.status(200).json({ paid: !!payment, payment });
  } catch (err) {
    console.error('❌ Error checking payment:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Fetch all payments with user + content info
router.get('/all', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      payments.map(async (p) => {
        const user = await User.findById(p.userId).select('name email');
        const content = await Content.findById(p.contentId).select('title');
        return {
          _id: p._id,
          userId: p.userId,
          contentId: p.contentId,
          amount: p.amount,
          transactionId: p.transactionId,
          createdAt: p.createdAt,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
          contentTitle: content?.title || 'Untitled'
        };
      })
    );

    return res.json(enriched);
  } catch (err) {
    console.error('❌ Error fetching payments:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete payment (admin rejection)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Payment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    log('🗑️ Deleted payment:', deleted.transactionId);
    return res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting payment:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
