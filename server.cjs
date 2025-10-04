require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS setup
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://climaxott.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 5,
  bufferMaxEntries: 0
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎬 Climax OTT Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Import and use individual route files
try {
  const authRoutes = require('./routes/authRoutes.cjs');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

try {
  const contentRoutes = require('./routes/contentRoutes.cjs');
  app.use('/api/contents', contentRoutes);
  console.log('✅ Content routes loaded');
} catch (error) {
  console.error('❌ Failed to load content routes:', error.message);
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});