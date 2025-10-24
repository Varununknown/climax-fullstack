# 🧪 CLIMAX OTT - Testing & Verification Guide

**Date:** October 24, 2025

---

## 🎯 Quick Test (5 minutes)

### Test 1: Frontend Accessibility
```bash
# Should respond with status 200
curl https://climaxott.vercel.app

# OR visit in browser:
# https://climaxott.vercel.app
```

### Test 2: Backend Connectivity  
```bash
# Should respond with JSON data
curl https://climax-fullstack.onrender.com/api/contents

# Should return list of content items
# Should include fields: title, videoUrl, climaxTimestamp, premiumPrice
```

### Test 3: Content Loading
```bash
# Get first content item
curl https://climax-fullstack.onrender.com/api/contents?limit=1

# Should show:
# {
#   "_id": "68f3c2b39760cc50bba9e6fd",
#   "title": "Test Premium Movie",
#   "videoUrl": "https://...",
#   "climaxTimestamp": 10,
#   "premiumPrice": 99
# }
```

---

## 🎬 Full Payment Flow Test (10 minutes)

### Prerequisites
- Have https://climaxott.vercel.app open in a browser
- Have browser DevTools open (F12) on Console tab
- Connected to internet

### Step 1: Load Content Page
1. Go to https://climaxott.vercel.app
2. **Expected:** See content grid with video thumbnails
3. **Check Console:** Should see "✅ Content loaded" messages
4. **If Issue:** Check:
   - Network tab: See /api/contents request
   - Status should be 200
   - Response should have 9 items

---

### Step 2: Play Premium Content
1. Click on any content item (e.g., "Test Premium Movie")
2. **Expected:** Video player loads
3. **Check Console:** Should show:
   ```
   🎬 Fetching content: [id]
   ✅ Content loaded: [title]
   💳 Checking payment status...
   ❌ No payment
   ```
4. **If Issue:** 
   - Check if video URL loads (test URL in new tab)
   - Check backend connectivity

---

### Step 3: Trigger Climax Lock
1. Video starts playing automatically
2. Wait ~10 seconds for climax point (depends on content)
3. **Expected:** 
   - Video pauses automatically at climax
   - Payment modal appears
   - Shows "💳 Unlock" button with price
4. **Check Console:** Should show climax point reached
5. **If Issue:**
   - Check `climaxTimestamp` in content (test console: `content.climaxTimestamp`)
   - Verify video actually paused

---

### Step 4: Unlock Content (Test Payment)
1. Click the "💳 Unlock (₹X)" button
2. **Expected:** Payment modal pops up
3. **Check Console:** Should show payment submission logs
4. **If Issue:**
   - Check Network tab for POST /api/payments
   - Verify response has `success: true`

---

### Step 5: Verify Payment
1. After payment modal closes:
2. **Expected:**
   - Video automatically resumes
   - Can seek anywhere in video
   - Video plays to completion
3. **Check Console:** Should show:
   ```
   ✅ Payment completed - verifying...
   ✅ Payment verified - resuming
   ```
4. **If Issue:**
   - Check Network tab for GET /payments/check
   - Verify payment was saved to database

---

## 🔍 Troubleshooting Checklist

### Issue: "Cannot read property 'climaxTimestamp'"
**Diagnosis:**
```javascript
// In browser console, type:
content  // Should show full content object
content.climaxTimestamp  // Should show a number (e.g., 10)
```
**Fix:** Wait for content to load, check network tab

---

### Issue: "Payment modal doesn't appear"
**Diagnosis:**
```javascript
// Check in console:
hasPaid  // Should be false
climaxTimestamp  // Should be e.g. 10
currentTime  // Should increase as video plays
```
**Fix:** 
- Check if climax point is reached
- Verify climaxTimestamp is less than video duration
- Check browser console for errors

---

### Issue: "Video won't resume after payment"
**Diagnosis:**
```javascript
// After payment, check in console:
hasPaid  // Should be true (not false!)
```
**Fix:**
- Check Network tab: POST /api/payments succeeded?
- Check Network tab: GET /payments/check returned paid=true?
- Check MongoDB: Is payment record created?

---

### Issue: "Backend returning 500 error"
**Diagnosis:**
```bash
# Check Render logs at https://dashboard.render.com
# Look for error messages like:
# - "Cannot connect to MongoDB"
# - "CORS error"
# - "Payment route error"
```
**Fix:**
- Check MONGO_URI is correct
- Check database is running
- Check backend logs in Render dashboard

---

### Issue: "Content API timeout"
**Diagnosis:**
- Backend might be sleeping (Render free tier)
- First request after sleep takes 10-30 seconds

**Fix:**
```bash
# Wake up backend first
curl https://climax-fullstack.onrender.com

# Wait 10 seconds
sleep 10

# Then try content request
curl https://climax-fullstack.onrender.com/api/contents
```

---

## 📊 What Should Happen (Normal Flow)

```
User Visits https://climaxott.vercel.app
           ↓
Frontend loads React app
           ↓
Fetch content from /api/contents
           ↓
Check payment status: GET /api/payments/check
           ↓
User clicks video
           ↓
Player loads with climax lock
           ↓
Video plays normally
           ↓
❌ CLIMAX REACHED (unpaid)
           ↓
Video pauses at climaxTimestamp
Payment modal appears
           ↓
User clicks "💳 Unlock"
           ↓
Modal shows payment form
           ↓
User enters card details / clicks pay
           ↓
POST /api/payments submitted
           ↓
✅ Payment auto-approved (sandbox)
           ↓
Modal closes
           ↓
RE-VERIFY: GET /payments/check
           ↓
✅ hasPaid = true
           ↓
Video resumes from pause point
           ↓
User can seek anywhere
           ↓
Video plays to completion
           ↓
✅ SUCCESS
```

---

## 🧬 Database Verification

### Check if MongoDB is connected
```bash
# Should show 9 content items
curl https://climax-fullstack.onrender.com/api/contents/seed
```

### Check if payment was created
```bash
# After payment, check MongoDB:
# Collections: payments
# Should have record:
# {
#   "userId": "user_id",
#   "contentId": "content_id", 
#   "status": "approved"
# }
```

### Check if content has proper schema
```bash
# Should have climaxTimestamp field
curl https://climax-fullstack.onrender.com/api/contents/68f3c2b39760cc50bba9e6fd
```

---

## 🎯 Test Scenarios

### Scenario 1: Free Content (premiumPrice = 0)
1. Click free content
2. Video should play completely without payment modal
3. Should NOT show unlock button

**Result:** ✅ Pass / ❌ Fail

---

### Scenario 2: Premium Content (premiumPrice > 0)
1. Click premium content
2. Video should play until climaxTimestamp
3. Should show payment modal
4. After payment, video should resume

**Result:** ✅ Pass / ❌ Fail

---

### Scenario 3: Seek Before Payment
1. In player before paying, try to seek past climax
2. Should rewind to last valid position
3. Should not let user seek past climax

**Result:** ✅ Pass / ❌ Fail

---

### Scenario 4: Seek After Payment
1. After paying, try to seek anywhere
2. Should allow seeking to any point
3. Video should continue playing

**Result:** ✅ Pass / ❌ Fail

---

### Scenario 5: Multiple Payments
1. Pay for content twice
2. Second time should not show payment modal
3. Should recognize user already paid

**Result:** ✅ Pass / ❌ Fail

---

## 📈 Performance Benchmarks

What should take:

| Action | Expected Time | Actual Time | Status |
|--------|---|---|---|
| Page load | < 3s | ? | ✅/❌ |
| API response | < 500ms | ? | ✅/❌ |
| Video start | < 2s | ? | ✅/❌ |
| Payment process | < 3s | ? | ✅/❌ |
| Backend cold start | 10-30s | ? | ✅/❌ |

---

## 🔐 Security Checks

- [ ] HTTPS on all URLs (frontend, backend)
- [ ] No API keys exposed in frontend code
- [ ] Payment data not logged to console
- [ ] User IDs used correctly in payment checks
- [ ] Payment can't be faked via console

---

## 📱 Mobile Testing

Test on actual mobile device:

- [ ] Page loads correctly on small screen
- [ ] Video player is responsive
- [ ] Play/pause button works with touch
- [ ] Progress bar works with swipe
- [ ] Payment modal displays properly
- [ ] No layout shifting during payment
- [ ] Portrait and landscape orientation work

---

## 🎯 Sign-Off Checklist

Before declaring "ready for production":

- [ ] ✅ All 9 content items play successfully
- [ ] ✅ Payment flow completes 100% successfully
- [ ] ✅ No console errors on any page
- [ ] ✅ Mobile responsive and working
- [ ] ✅ Backend responding consistently
- [ ] ✅ Database records created correctly
- [ ] ✅ Google OAuth login working (if enabled)
- [ ] ✅ Performance acceptable (< 3s load)
- [ ] ✅ Error handling working
- [ ] ✅ 5+ manual test runs successful

---

## 🚀 How to Report Issues

When reporting a bug, include:

1. **What you did:** Step-by-step reproduction
2. **What you expected:** What should happen
3. **What actually happened:** What went wrong
4. **Screenshots/Video:** Visual evidence
5. **Console errors:** From F12 Developer Tools
6. **Network errors:** From Network tab
7. **Browser/Device:** Chrome, Safari, iPhone, etc.
8. **URL:** https://climaxott.vercel.app (which page)

---

**Testing Status: READY**

Go test the full payment flow and report any issues!
