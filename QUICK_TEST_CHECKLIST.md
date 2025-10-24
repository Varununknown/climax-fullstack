# 🧪 Quick Test Checklist - Climax Lock

**Date:** October 24, 2025  
**Deploy URL:** https://climaxott.vercel.app  
**Status:** Should auto-deploy in 2-3 minutes

---

## 🚀 Test Steps (Copy-Paste)

### Step 1: Open Browser
```
Go to: https://climaxott.vercel.app
Open DevTools: Press F12
Go to Console tab
```

### Step 2: Click Any Premium Content
- Should see in console:
  ```
  🎬 Fetching content: [id]
  ✅ Content loaded: [title]
  💳 Pre-play payment check...
  ❌ User already paid - climax locked
  ```

### Step 3: Watch for Badge
- Look at TOP RIGHT of video player
- Should see RED BADGE: **"🔒 CLIMAX PREMIUM"** (if not paid)
- Badge should be ANIMATED (pulsing)

### Step 4: Look at Progress Bar
- Progress bar at bottom of video
- GRAY area = can seek freely
- DARK RED area = locked zone
- Label "🔒 Locked" should show boundary

### Step 5: Play Video to Climax Point
- Video plays normally
- At climax timestamp (e.g., 30 seconds):
  - ❌ VIDEO SHOULD PAUSE AUTOMATICALLY
  - Payment modal should POP UP
  - In console: `🔒 Entering locked zone`

### Step 6: Try to Seek Past Climax (Before Paying)
- Try to drag progress bar to 100%
- Should REWIND automatically
- Payment modal should APPEAR
- In console: `🚫 Seek blocked`

### Step 7: Click Unlock Button
- In payment modal, click: **"💳 Unlock (₹X)"**
- Complete payment
- Modal closes

### Step 8: Verify Unlock Happened
- ✅ Badge DISAPPEARED from top-right
- ✅ "Full Access Unlocked" message shows in center
- ✅ Progress bar NO LONGER has dark red zone
- ✅ Video resumes playing automatically
- ✅ Can seek to ANY part (including past climax)
- In console: `✅ Payment verified - full access unlocked!`

### Step 9: Go Back and Click SAME Video Again
- Go back to home page
- Click the SAME premium video again
- ✅ Badge should NOT show (user already paid)
- ✅ Video should play freely without any locks
- ✅ No payment modal should ever appear

---

## ✅ Expected Results

| Action | Expected | Status |
|--------|----------|--------|
| Badge shows on first load | "🔒 CLIMAX PREMIUM" visible | ✅ |
| Video plays to climax | Plays normally 0→climax | ✅ |
| Video at climax | PAUSES (not just modal) | ✅ |
| Seek past climax | REWINDS + Modal pops | ✅ |
| Progress bar | Gray (safe) + Dark Red (locked) | ✅ |
| Payment success | Modal closes + badge gone | ✅ |
| After unlock | Can seek freely | ✅ |
| Second visit | No badge + plays freely | ✅ |

---

## ❌ Known Issues to Check

### Issue 1: Badge Doesn't Appear
**Diagnosis:** Open console, check for payment check log
```javascript
// In console, check:
hasPaid  // Should be false if locked
content.climaxTimestamp  // Should be a number
```
**Fix:** Wait for content to load, refresh page

---

### Issue 2: Video Doesn't Pause at Climax
**Diagnosis:** Check current time vs climax
```javascript
currentTime  // Should equal or exceed climaxTimestamp
content.climaxTimestamp  // Compare these
```
**Possible Cause:** Video duration too short, or climax timestamp > duration

---

### Issue 3: Payment Modal Never Appears
**Diagnosis:** Check if seeking triggers it
- Try clicking near end of progress bar
- Should trigger payment modal
- Check console for `🚫 Seek blocked` message

---

### Issue 4: Badge Doesn't Disappear After Payment
**Diagnosis:** Payment might not have verified
```javascript
// In console after payment:
hasPaid  // Should be true (not false!)
```
**Fix:** Check if payment actually went through, refresh page

---

## 📸 Visual Checklist

- [ ] Red badge "🔒 CLIMAX PREMIUM" appears (top right)
- [ ] Badge is animated (pulsing)
- [ ] Progress bar has TWO colors (gray + dark red)
- [ ] "🔒 Locked" label on progress bar
- [ ] Unlock button shows price: "💳 Unlock (₹X)"
- [ ] After unlock: "✅ Full Access Unlocked" message appears
- [ ] Badge disappears smoothly after payment

---

## 🎯 Test Different Scenarios

### Scenario A: Free Content (premiumPrice = 0)
- [ ] NO badge shows
- [ ] Video plays completely
- [ ] NO payment modal
- [ ] NO locked zone on progress bar

### Scenario B: Premium Content (premiumPrice > 0)
- [ ] Badge shows "🔒 CLIMAX PREMIUM"
- [ ] Locked zone visible on progress bar
- [ ] Video stops at climax
- [ ] Modal pops up on climax/seek
- [ ] After payment: badge disappears

### Scenario C: Different Climax Points
- [ ] Try content with climax = 10 seconds
- [ ] Try content with climax = 30 seconds
- [ ] Try content with climax = 60 seconds
- [ ] All should lock at their respective timestamps

---

## 🔧 Troubleshooting Commands

### Check Payment Status
```javascript
// In browser console:
hasPaid
// Should be: true (paid) or false (not paid)
```

### Check Climax Point
```javascript
// In browser console:
content.climaxTimestamp
// Should be a number like: 30
```

### Check Current Video Time
```javascript
// In browser console:
currentTime
// Should increase as video plays
```

### Force Payment Check
```javascript
// In browser console (advanced):
// Reload data from backend
location.reload()
```

---

## 📋 Report Template

If something breaks, include:

**What Happened:**
- Describe the issue

**Expected Behavior:**
- What should have happened

**Actual Behavior:**
- What actually happened

**Console Errors:**
- Copy any red error messages from F12 Console

**Browser:**
- Chrome / Safari / Firefox / etc.

**URL:**
- https://climaxott.vercel.app

---

## 🎉 Success Criteria

Mark test as ✅ PASS when:

1. ✅ Badge appears on first load
2. ✅ Video pauses at climax (not just modal)
3. ✅ Seek is blocked past climax
4. ✅ Payment modal appears on lock attempt
5. ✅ Payment processes successfully
6. ✅ Badge disappears after payment
7. ✅ Video resumes automatically
8. ✅ Can seek anywhere after unlock
9. ✅ Second visit shows no badge or locks
10. ✅ No console errors

---

**Ready? Test now and let me know if anything breaks! 🚀**
