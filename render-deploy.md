# Render Backend Deployment Config
# This file contains instructions for deploying the backend on Render

## Service Configuration:
- **Service Type**: Web Service
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: `/` (monorepo root)
- **Node Version**: 18.x or higher

## Environment Variables to set on Render:
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret_key
- PORT=5000
- NODE_ENV=production

## Auto-Deploy Settings:
- **Branch**: main
- **Auto-Deploy**: Yes
- **Root Directory**: Leave empty (uses monorepo root)

## Important Notes:
1. Render will automatically detect this is a Node.js service
2. Make sure to set all environment variables in Render dashboard
3. The build command will navigate to backend folder and install dependencies
4. The start command will run the Express server from the backend folder