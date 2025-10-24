// Main entry point for Climax OTT Backend
// Handles both full backend and fallback scenarios

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;
const app = express();

// Basic middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://climax-frontend.vercel.app',
    'https://watchclimax.vercel.app',
    'https://climaxott.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

console.log('\n🚀 Climax OTT Backend Starting...');
console.log('📌 Environment:', process.env.NODE_ENV || 'development');
console.log('📌 Port:', PORT);

// Try to load full backend with database
let fullBackendLoaded = false;
try {
  console.log('\n� Checking backend directory...');
  const backendPath = path.join(__dirname, 'backend', 'server.cjs');
  if (fs.existsSync(backendPath)) {
    console.log('✅ Backend found at:', backendPath);
    console.log('📦 Loading backend/server.cjs...');
    require('./backend/server.cjs');
    fullBackendLoaded = true;
    console.log('✅ Full backend loaded successfully!');
  } else {
    console.log('⚠️  Backend not found at:', backendPath);
  }
} catch (error) {
  console.error('\n❌ Error loading full backend:');
  console.error('   Error:', error.message);
  console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
}

// If full backend didn't load, use fallback
if (!fullBackendLoaded) {
  console.log('\n⚠️  Using fallback backend with basic endpoints');
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: '🎬 Climax OTT Backend',
      status: 'running',
      mode: 'fallback',
      timestamp: new Date().toISOString()
    });
  });
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      mode: 'fallback',
      message: 'Fallback backend is running',
      note: 'Full backend with database not available',
      timestamp: new Date().toISOString()
    });
  });
  
  // API status
  app.get('/api/status', (req, res) => {
    res.json({
      backend: 'online',
      mode: 'fallback',
      routes: ['health', 'status'],
      message: 'Backend is partially operational'
    });
  });
  
  // Payments endpoint (fallback)
  app.get('/api/payments', (req, res) => {
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Database backend not initialized',
      mode: 'fallback'
    });
  });
  
  // Generic 404
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
      message: 'Endpoint not available in fallback mode'
    });
  });
  
  // Start fallback server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Fallback server running on port ${PORT}`);
    console.log(`📍 Base URL: http://localhost:${PORT}`);
  });
}
