require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

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

// Test auth route
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth routes are working!', status: 'success' });
});

// Import User model for direct auth routes
const User = require('./models/User.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Direct auth routes (bypass import issues)
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Register attempt:', req.body);
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add contents route directly
const Content = require('./models/Content.cjs');

app.get('/api/contents', async (req, res) => {
  try {
    const contents = await Content.find({ isActive: true });
    res.json(contents);
  } catch (error) {
    console.error('❌ Contents error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get individual content by ID
app.get('/api/contents/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    console.error('❌ Content by ID error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Payment check route
app.get('/api/payments/check', async (req, res) => {
  try {
    const { userId, contentId } = req.query;
    // For now, return that payment is required (free content)
    // You can implement actual payment logic later
    res.json({ paid: false, message: 'Payment required for premium content' });
  } catch (error) {
    console.error('❌ Payment check error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files for frontend (if any)
app.use(express.static('frontend/dist'));

// Catch-all handler for SPA routing - must be LAST
app.get('*', (req, res) => {
  // Don't interfere with API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  // For all other routes, serve the React app
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
});