
## Github Link : https://github.com/Varununknown/climax-fullstack


# 🎬 Climax OTT Platform - Full Stack Monorepo

A modern OTT (Over-The-Top) streaming platform with a unique "climax-moment" monetization model. Users can watch content for free up to the climax point, then pay to unlock the remaining content.

## 📚 **IMPORTANT: Documentation for Content Management** ⭐

### **🟢 START HERE** (Forms are now fully functional!)
- **[FORMS_INDEX.md](./FORMS_INDEX.md)** - Complete reference guide for all form documentation
- **[FORMS_FIX_SUMMARY.md](./FORMS_FIX_SUMMARY.md)** - What was fixed and how to use new logging
- **[TEST_FORMS_GUIDE.md](./TEST_FORMS_GUIDE.md)** - How to test add/edit/delete forms (5 min)

### **🔴 CRITICAL FOR PRODUCTION**
- **[PRODUCTION_STATUS.md](./PRODUCTION_STATUS.md)** - Complete deployment checklist
- **[MONGODB_IP_WHITELIST_FIX.md](./MONGODB_IP_WHITELIST_FIX.md)** - Required for production!

### **🔵 FOR DEBUGGING**
- **[FORM_SUBMISSION_DEBUG.md](./FORM_SUBMISSION_DEBUG.md)** - Detailed debugging guide with console logs

## 🏗️ **Monorepo Structure**

```
climax-fullstack/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Node.js + Express + MongoDB
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.cjs
│   └── package.json
├── package.json       # Root workspace config
├── vercel.json        # Frontend deployment config
└── render-deploy.md   # Backend deployment guide
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account

### 1. Clone & Install
```bash
git clone https://github.com/Varununknown/climax-fullstack.git
cd climax-fullstack
npm run install:all
```

### 2. Environment Setup
Create `.env` file in root:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
VITE_BACKEND_URL=http://localhost:5000/api
```

### 3. Development
```bash
# Run both frontend & backend simultaneously
npm run dev

# Or run individually:
npm run dev:frontend  # React dev server (http://localhost:5173)
npm run dev:backend   # Express server (http://localhost:5000)
```

## 🎯 **Core Features**

### **🎭 Unique Business Model**
- **Free Preview**: Watch until climax timestamp
- **Pay-to-Continue**: Unlock remaining content via UPI payment
- **Natural Monetization**: Paywall at peak engagement moments

### **👥 User Roles**
- **Users**: Browse, watch previews, make payments
- **Admins**: Content management, payment verification

### **📱 Tech Stack**
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB, JWT
- **Payments**: UPI integration with QR codes
- **Deployment**: Vercel (Frontend) + Render (Backend)

## 🔧 **Available Scripts**

```bash
# Development
npm run dev              # Run both frontend & backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Production Build
npm run build            # Build both applications
npm run build:frontend   # Build React app
npm run build:backend    # Prepare backend for production

# Deployment
npm run start            # Start production backend
npm run start:frontend   # Preview built frontend
npm run start:backend    # Start backend server

# Utilities
npm run install:all      # Install all dependencies
npm run clean           # Remove all node_modules
npm run lint            # Lint frontend code
```

## 🌐 **Deployment**

### **Frontend (Vercel)**
1. Connect your GitHub repo to Vercel
2. Set root directory to project root
3. Vercel will automatically detect `vercel.json` config
4. Environment variables: `VITE_BACKEND_URL`

### **Backend (Render)**
1. Create new Web Service on Render
2. Connect your GitHub repo
3. Use settings from `render-deploy.md`
4. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`

## 📊 **API Endpoints**

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Content Management
- `GET /api/contents` - List all content
- `GET /api/contents/:id` - Get specific content
- `POST /api/contents` - Create content (admin)
- `PUT /api/contents/:id` - Update content (admin)
- `DELETE /api/contents/:id` - Delete content (admin)

### Payments
- `POST /api/payments` - Submit payment proof
- `GET /api/payments/check` - Check payment status
- `GET /api/payments/all` - List all payments (admin)

## 🎨 **Frontend Architecture**

### Key Components
- **UserDashboard**: Main content browsing interface
- **VideoPlayer**: Streaming with paywall integration
- **AdminDashboard**: Content & payment management
- **PaymentModal**: UPI payment flow

### Context Providers
- **AuthContext**: User authentication state
- **ContentContext**: Content management state

## 🔒 **Security Features**

- JWT-based authentication
- bcryptjs password hashing
- CORS protection
- Input validation
- Role-based access control

## 📱 **Mobile Responsive**

- Mobile-first design with Tailwind CSS
- Touch-friendly navigation
- UPI payment integration for mobile users
- Progressive Web App capabilities

## 🛠️ **Development Guidelines**

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Write meaningful commit messages

## 📞 **Support**

- **Author**: Varun
- **Repository**: [GitHub](https://github.com/Varununknown/climax-fullstack)
- **Issues**: [GitHub Issues](https://github.com/Varununknown/climax-fullstack/issues)

## 📄 **License**

MIT License - see LICENSE file for details.

---

**🎬 Happy Streaming with Climax!** 
