require('dotenv').config();

const express = require('express');
const cors = require('cors');

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});