const path = require('path');
const fs = require('fs');

// Find the correct directory
let projectRoot = process.cwd();

// Look for backend folder
if (!fs.existsSync(path.join(projectRoot, 'backend'))) {
  // Try parent directory
  projectRoot = path.dirname(projectRoot);
  
  if (!fs.existsSync(path.join(projectRoot, 'backend'))) {
    // Try going up one more level
    projectRoot = path.dirname(projectRoot);
  }
}

console.log('Project root:', projectRoot);
console.log('Backend path:', path.join(projectRoot, 'backend'));

// Change to project root
process.chdir(projectRoot);

// Start the server
require('./backend/server.cjs');