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

// Start Server FIRST - then add routes
const PORT = process.env.PORT || 5000;

// Simple root route BEFORE everything else
app.get('/', (req, res) => {
  console.log('✅ Root route hit!');
  res.json({ 
    message: 'Climax OTT Backend API is running!', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working!', status: 'success' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
});