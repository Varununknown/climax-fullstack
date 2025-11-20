const mongoose = require('mongoose');

const festPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true // globally unique
  },
  gateway: {
    type: String,
    enum: ['upi', 'payu', 'other'],
    default: 'upi'
  },
  paymentDate: {
    type: Date,
    default: () => Date.now()
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'approved',
    required: true
  }
}, { timestamps: true });

// ✅ Prevent duplicate: same user cannot pay twice for same fest
festPaymentSchema.index({ userId: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('FestPayment', festPaymentSchema);
