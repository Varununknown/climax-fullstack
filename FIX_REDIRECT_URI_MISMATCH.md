## 🔧 FIX FOR: redirect_uri_mismatch ERROR

### **What's Wrong:**
Google Console has a different redirect URI than what your code is sending.

Your Code Says: `https://climaxott.vercel.app`
Google Console Expects: (needs to be updated)

---

### **YOUR TASK - Update Google Cloud Console:**

1. **Go to**: https://console.cloud.google.com/

2. **Find your OAuth credentials**:
   - Click on your Project (if not selected)
   - Left menu → APIs & Services → Credentials
   - Look for "OAuth 2.0 Client ID" (with your email)
   - Click on it to edit

3. **Update Authorized redirect URIs**:
   - Find the section: "Authorized redirect URIs"
   - You'll see the old one: `https://climaxott.vercel.app/auth/google/callback`
   - Delete it (click the trash icon)
   - Add NEW one: `https://climaxott.vercel.app`
   - Click "Save"

4. **Wait 1-2 minutes** for Google to update

5. **Test Google Login** again: https://climaxott.vercel.app

---

### **Also Update Render Environment Variables:**

Go to https://dashboard.render.com/ and update:

```
GOOGLE_REDIRECT_URI = https://climaxott.vercel.app
```

(Remove the "/auth/google/callback" part)

---

### **Expected Result:**
✅ Click Google button → Login works → Auto-create/login account ✅
