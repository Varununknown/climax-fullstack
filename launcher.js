const path = require('path');
const fs = require('fs');

// Debug: Show where we are
console.log('Starting directory:', process.cwd());
console.log('Files in starting directory:', fs.readdirSync(process.cwd()));

// Render runs from /opt/render/project/src but we need /opt/render/project
let projectRoot = '/opt/render/project';

// Fallback: try to find project root dynamically
if (!fs.existsSync(projectRoot)) {
  projectRoot = process.cwd();
  
  // Go up directories until we find backend folder
  while (!fs.existsSync(path.join(projectRoot, 'backend')) && projectRoot !== '/') {
    projectRoot = path.dirname(projectRoot);
    console.log('Checking directory:', projectRoot);
  }
}

console.log('Final project root:', projectRoot);
console.log('Files in project root:', fs.readdirSync(projectRoot));

// Verify backend exists
const backendPath = path.join(projectRoot, 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('Backend folder not found at:', backendPath);
  process.exit(1);
}

console.log('Backend found at:', backendPath);
console.log('Files in backend:', fs.readdirSync(backendPath));

// Change to project root
process.chdir(projectRoot);
console.log('Changed working directory to:', process.cwd());

// Start the server
console.log('Starting server...');
require('./backend/server.cjs');