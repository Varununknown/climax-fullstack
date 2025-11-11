# 🔐 Login Setup Guide - CREATE TEST USER FIRST

## ⚠️ Problem
You have no test users in the database yet, so login won't work. You need to **create a user first** before you can login.

---

## ✅ Quick Fix - Create Admin User

### Option A: Use the automated script (RECOMMENDED)

1. **Open terminal** in VS Code or PowerShell
2. **Navigate to backend folder**:
```powershell
cd backend
```

3. **Run the admin creation script**:
```powershell
node create-admin.cjs
```

4. **You should see**:
```
✅ Connected to MongoDB Atlas
✅ Admin user created successfully!
📧 Email: admin@example.com
🔐 Password: admin123

💡 Use these credentials to login on localhost
```

### Option B: Manual registration on the app

1. Go to your app
2. Click **"Sign Up"** on login page
3. **Fill in details**:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123`
4. Click **"Sign Up"**
5. Then login with those same credentials

---

## 🔧 How Login Works

```
Frontend Login Form
     ↓
POST /api/auth/login {email, password}
     ↓
Backend: Find user in MongoDB by email
     ↓
Backend: Compare password with bcrypt hash
     ↓
Backend: Create JWT token if match
     ↓
Return token + user data to frontend
     ↓
Frontend: Save token to localStorage
     ↓
Frontend: Redirect to home page ✅
```

---

## 📊 Why Login Failed Before

1. **No users exist** in the database
2. Backend searches for email → **Not found** → Returns "Invalid credentials"
3. Frontend shows error message

---

## ✅ After Creating User

Once you create a user (either method):

1. ✅ Login form will work
2. ✅ Token gets saved to localStorage
3. ✅ You'll be redirected to home page
4. ✅ Edit content will work (once MongoDB IP whitelist is added)
5. ✅ All features enabled

---

## 🚀 Complete Workflow for Tomorrow's Deployment

### Right Now:
1. Run: `node create-admin.cjs` in backend folder
2. Wait for success message ✅

### Then:
1. Try logging in with: `admin@example.com` / `admin123`
2. Verify you can see the dashboard ✅

### Finally:
1. Add MongoDB IP whitelist to Atlas (as per PRODUCTION_FIX_STEPS.md)
2. Redeploy on Render
3. Test edit content works
4. ✅ Ready for production!

---

## 🐛 Troubleshooting

**Error: "Cannot connect to MongoDB"**
- Check if you're running from `backend` folder
- Verify `.env` file exists with MONGO_URI
- MONGO_URI should be: `mongodb+srv://myuser:ott123@ott.zcmaqmh.mongodb.net/ottdb?retryWrites=true&w=majority&appName=ott`

**Error: "Admin user already exists"**
- Admin is already created
- Just use: `admin@example.com` / `admin123` to login

**Login still fails after running script**
- Make sure MongoDB IP whitelist is configured (0.0.0.0/0)
- Restart your backend server
- Clear browser localStorage and try again

---

## 📝 Test Users Reference

After running `create-admin.cjs`:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |

Or create more via signup form on the app.

---

## ✅ Next Steps

1. **Right Now**: Run `node create-admin.cjs` ✅
2. **Test Login**: Use admin@example.com / admin123 ✅
3. **Setup MongoDB**: Add IP whitelist to Atlas
4. **Deploy**: Redeploy on Render
5. **Test Everything**: Edit, add, delete content
6. **Go Live**: Tomorrow! 🚀
