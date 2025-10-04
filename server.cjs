require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS Middleware Setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://climax-frontend.vercel.app',
  'https://watchclimax.vercel.app',
  'https://climaxott.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Vercel domains and localhost
      if (!origin || 
          allowedOrigins.includes(origin) || 
          origin.endsWith('.vercel.app')) {
        callback(null, true);
      if (!origin || 
          allowedOrigins.includes(origin) || 
          origin.endsWith('.vercel.app')) {
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

// Simple root route
app.get('/', (req, res) => {
  res.json({ message: 'Climax OTT Backend API is running!' });
});

// Route Imports with error handling
try {
  const authRoutes = require('./routes/authRoutes.cjs');
  const googleAuthRoutes = require('./routes/googleAuth.cjs');
  const contentRoutes = require('./routes/contentRoutes.cjs');
  const paymentRoutes = require('./routes/paymentRoutes.cjs');
  const paymentSettingsRoutes = require('./routes/paymentSettingsRoutes.cjs');

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/auth', googleAuthRoutes);
  app.use('/api/contents', contentRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/payment-settings', paymentSettingsRoutes);
  
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});