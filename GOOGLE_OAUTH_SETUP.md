# 🔐 Google OAuth Setup - Complete Guide

## ❌ Current Error
```
Error 400: redirect_uri_mismatch
```

## ✅ Solution

Google requires **EXACT** matching of redirect URIs. You need to add BOTH URIs to Google Cloud Console.

---

## 📋 Step-by-Step Fix

### **Step 1: Go to Google Cloud Console**

1. Open: https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find and click your OAuth 2.0 Client ID:
   ```
   461020836001-u2cl51tsq132e6pkjvpgf9imp23nu331.apps.googleusercontent.com
   ```

### **Step 2: Add BOTH Redirect URIs**

Under **Authorized redirect URIs**, click **Add URI** and add:

#### **URI 1 - Local Development**
```
http://localhost:5000/auth/google/callback
```

#### **URI 2 - Production**
```
https://climaxott.vercel.app/auth/google/callback
```

Your final list should look like:
```
✅ http://localhost:5000/auth/google/callback
✅ https://climaxott.vercel.app/auth/google/callback
```

### **Step 3: Click SAVE**

---

## ✅ Current Configuration

### **Frontend**
- Google Client ID: `461020836001-u2cl51tsq132e6pkjvpgf9imp23nu331.apps.googleusercontent.com`
- Flow: auth-code flow ✅
- Backend endpoint: `/api/auth/google/callback` (POST)

### **Backend**
- Redirect URI: `https://climaxott.vercel.app/auth/google/callback` ✅
- Handles both GET and POST requests ✅
- Auto-creates users ✅

---

## 🧪 Test After Setup

### **Local Testing**
1. Start backend: `npm start` (from `/backend`)
2. Start frontend: `npm run dev` (from `/frontend`)
3. Click "Sign in with Google"
4. Should work! ✅

### **Production Testing**
1. Visit: https://climaxott.vercel.app/
2. Click "Sign in with Google"
3. Should work! ✅

---

## 📝 Troubleshooting

If you still get `redirect_uri_mismatch`:

1. **Check exact spelling** - URIs are case-sensitive
2. **No trailing slashes** - Use `/auth/google/callback` NOT `/auth/google/callback/`
3. **Wait 5-10 minutes** - Google takes time to propagate changes
4. **Clear browser cache** - Ctrl+Shift+Delete
5. **Try incognito mode** - Eliminates cache issues

---

## 🔗 Important URLs

| Component | URL |
|-----------|-----|
| Google Cloud Console | https://console.cloud.google.com/apis/credentials |
| OAuth Playground | https://developers.google.com/oauthplayground |
| Your App (Local) | http://localhost:5173 |
| Your App (Prod) | https://climaxott.vercel.app |
