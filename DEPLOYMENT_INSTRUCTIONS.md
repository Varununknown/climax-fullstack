# Deployment Instructions for Hosted Live Site

## ✅ **FIXED: Production Backend URL**

### Frontend Changes:
1. ✅ Updated backend URL to: `https://climax-backend.onrender.com`
2. ✅ Added `.env.production` file
3. ✅ Increased API timeout to 10 seconds for production
4. ✅ Better logging for debugging

### **To Make Content Display on Hosted Live Site:**

#### **Step 1: Verify Backend Deployment**
Your backend needs to be deployed to Render.com:
1. Go to https://render.com/
2. Make sure `climax-backend` service is deployed
3. The URL should be: `https://climax-backend.onrender.com`
4. Verify it's running by visiting: `https://climax-backend.onrender.com/api/contents`

#### **Step 2: Set Vercel Environment Variables**
On your Vercel project (https://vercel.com/):
1. Go to your project → Settings → Environment Variables
2. Add: `VITE_BACKEND_URL` = `https://climax-backend.onrender.com`
3. Redeploy your frontend

#### **Step 3: Verify CORS**
Backend already has CORS configured for:
- ✅ `https://climax-frontend.vercel.app`
- ✅ `https://watchclimax.vercel.app`
- ✅ `https://climaxott.vercel.app`

If your Vercel domain is different, add it to `backend/server.cjs` allowedOrigins array.

#### **Step 4: Check Backend is Live**
Test your backend:
```bash
curl https://climax-backend.onrender.com/api/contents
```

Should return JSON array of content.

### **Alternative: Use Vercel for Backend Too**
If you want to deploy backend on Vercel instead of Render:
1. Create `vercel.json` in backend folder
2. Deploy backend to Vercel
3. Update frontend `VITE_BACKEND_URL` to new Vercel backend URL

### **Debug Production Issues:**
Open browser console on live site and check:
```javascript
console.log(window.__BACKEND__)  // Shows which backend URL is being used
```

### **Current Setup:**
- **Frontend**: Vercel (auto-deployed from main branch)
- **Backend**: Should be on Render.com at `climax-backend.onrender.com`
- **Database**: MongoDB Atlas (already connected)

---

**Everything is pushed and ready!** Just need to:
1. ✅ Verify backend is deployed on Render
2. ✅ Add environment variable on Vercel
3. ✅ Redeploy frontend

Then content will display on your hosted live site! 🚀
