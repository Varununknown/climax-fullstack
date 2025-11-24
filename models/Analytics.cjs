const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  },
  watchTimeSeconds: {
    type: Number,
    default: 0 // Time actually watched in seconds
  },
  completionPercentage: {
    type: Number,
    default: 0 // 0-100
  },
  amountPaid: {
    type: Number,
    default: 0 // Revenue from this view
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet', 'smarttv'],
    default: 'mobile'
  },
  status: {
    type: String,
    enum: ['started', 'in_progress', 'completed'],
    default: 'started'
  }
});

// Index for faster queries
analyticsSchema.index({ contentId: 1, viewedAt: -1 });
analyticsSchema.index({ userId: 1, viewedAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
