// Fallback server entry point for Render
// This ensures Render has a simple entry point if submodule loading fails

const path = require('path');

// Try to load backend server
try {
  console.log('📦 Attempting to load backend/server.cjs...');
  require('./backend/server.cjs');
} catch (error) {
  console.error('❌ Failed to load backend/server.cjs:', error.message);
  
  // Minimal fallback express server
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 5000;
  
  console.log('⚠️  Using minimal fallback server');
  
  app.get('/', (req, res) => {
    res.json({ message: '🎬 Climax OTT (Fallback Server)', status: 'running' });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: 'fallback', message: 'Backend submodule failed to load' });
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fallback server running on port ${PORT}`);
  });
}
