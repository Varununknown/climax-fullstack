const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnail: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['movie', 'series', 'show'], required: true },
  duration: { type: Number, required: true }, // in seconds
  climaxTimestamp: { type: Number, required: true }, // in seconds
  premiumPrice: { type: Number, required: true },
  genre: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  language: { 
    type: String, 
    required: true,
    enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'],
    default: 'English'
  }, // ✅ Language field with all 10 languages
  festPaymentEnabled: { type: Boolean, default: false }, // ✅ Enable paid fest participation
  festParticipationFee: { type: Number, default: 0 }, // ✅ Fee for paid fest participation
  sponsorName: { type: String, default: '' },           // ✅ Sponsor name for fan fest
  sponsorLogoUrl: { type: String, default: '' },       // ✅ Sponsor logo URL
  prizeAmount: { type: Number, default: 0 },           // ✅ Prize amount in Rs
  isActive: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: () => Date.now()
  }
});

module.exports = mongoose.model('Content', contentSchema);
