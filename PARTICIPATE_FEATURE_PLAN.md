# Participate & Win Feature - Implementation Plan

## 📋 Feature Scope

This is a **completely separate, new feature** that will NOT modify any existing code or UI.

### User Flow:
1. User views content details page
2. "Participate & Win" button available (new)
3. Click → Opens new Participate page
4. Show MCQ questions specific to that content
5. User answers questions
6. Responses saved to database
7. Success message

### Admin Flow:
1. Admin dashboard → New "Participate Manager" tab
2. Select content
3. Add/Edit/Delete questions with options
4. Toggle Free/Paid participation
5. View results (content → user emails → responses)
6. Clear all data for content (questions + responses)

---

## 🗄️ Database Schema (NEW - Won't touch existing models)

### Model: `Participation.cjs`
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference User),
  contentId: ObjectId (reference Content),
  answers: [
    {
      questionId: ObjectId,
      selectedOption: String,
      answerText: String
    }
  ],
  totalScore: Number (optional, for future gamification),
  submittedAt: Date,
  createdAt: Date
}
```

### Model: `ParticipationQuestion.cjs`
```javascript
{
  _id: ObjectId,
  contentId: ObjectId (reference Content),
  questionText: String,
  options: [String],
  correctAnswer: String (optional, for future scoring),
  isRequired: Boolean,
  createdAt: Date
}
```

### Model: `ParticipationSettings.cjs`
```javascript
{
  _id: ObjectId,
  contentId: ObjectId (reference Content, unique),
  isPaid: Boolean,
  pricePerParticipation: Number (if isPaid: true),
  isActive: Boolean,
  updatedAt: Date
}
```

---

## 🔧 Backend Routes (NEW - Won't modify existing routes)

### Base Route: `/api/participation`

**Admin Routes:**
- `GET /api/participation/admin/contents` - List all contents with participation status
- `POST /api/participation/admin/settings/:contentId` - Create/update participation settings
- `GET /api/participation/admin/settings/:contentId` - Get settings for content
- `POST /api/participation/admin/questions/:contentId` - Add question
- `GET /api/participation/admin/questions/:contentId` - Get all questions for content
- `DELETE /api/participation/admin/questions/:questionId` - Delete question
- `GET /api/participation/admin/results/:contentId` - Get participation results
- `DELETE /api/participation/admin/clear/:contentId` - Delete all data (questions + responses)

**User Routes:**
- `GET /api/participation/user/:contentId/questions` - Get questions for content
- `GET /api/participation/user/:contentId/status` - Check if user already participated
- `POST /api/participation/user/:contentId/submit` - Submit answers
- `GET /api/participation/user/history` - Get user's participation history

---

## 🎨 Frontend Components (NEW - Won't modify existing UI)

### New Components:
1. **ParticipateButton.tsx** (on ContentDetailsPage)
   - Small button to open participate modal
   - Shows if content has active participation
   - Disabled if already participated

2. **ParticipateModal.tsx** (new modal)
   - Shows MCQ questions
   - Radio/Checkbox options
   - Submit button
   - Loading state
   - Success screen

3. **Admin Tab: ParticipationManager.tsx**
   - Content selector dropdown
   - Tab 1: Settings (Free/Paid toggle)
   - Tab 2: Questions (Add/Edit/Delete questions)
   - Tab 3: Results (View responses)
   - Tab 4: Clear Data (With confirmation)

---

## 🛡️ Safety Guarantees

- ✅ No modifications to existing routes
- ✅ No modifications to existing components (except adding 1 small button)
- ✅ No modifications to existing models
- ✅ New files only in `/models`, `/routes`, `/components/participate`
- ✅ Separate database collections
- ✅ No schema migrations needed
- ✅ Can be disabled/removed without affecting other features
- ✅ Admin-only access for manage functions

---

## 📂 File Structure

```
backend/
  models/
    Participation.cjs (NEW)
    ParticipationQuestion.cjs (NEW)
    ParticipationSettings.cjs (NEW)
  routes/
    participationRoutes.cjs (NEW)

frontend/
  src/
    components/
      participate/ (NEW folder)
        ParticipateButton.tsx (NEW)
        ParticipateModal.tsx (NEW)
        ParticipationManager.tsx (NEW)
    pages/ (modify)
      ContentDetailsPage.tsx (add 1 button only)
    types/
      index.ts (add Participation types)
```

---

## 🚀 Implementation Steps

1. Create 3 new MongoDB models
2. Create participation routes
3. Create frontend components
4. Add button to ContentDetailsPage
5. Add tab to AdminDashboard
6. Test thoroughly
7. Deploy

---

## ✅ Non-Intrusive Changes

Only 1 existing file will be modified:
- **ContentDetailsPage.tsx**: Add `<ParticipateButton />` component (1 line)

All other changes are NEW files only.

---

## 🔒 Admin Protection

All admin endpoints will check:
- User role === 'admin'
- If not admin → 403 Forbidden response

---

Ready to proceed? I'll build this completely separate from your existing code! 🎉
