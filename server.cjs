require('dotenv').config();

// Memory optimization for free hosting
process.env.NODE_OPTIONS = '--max-old-space-size=256';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route Imports - now in root directory
const authRoutes = require('./routes/authRoutes.cjs');
const googleAuthRoutes = require('./routes/googleAuth.cjs');
const contentRoutes = require('./routes/contentRoutes.cjs');
const paymentRoutes = require('./routes/paymentRoutes.cjs');
const paymentSettingsRoutes = require('./routes/paymentSettingsRoutes.cjs');

const app = express();

// CORS Middleware Setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://climax-frontend.vercel.app',
  'https://watchclimax.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Not Allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});