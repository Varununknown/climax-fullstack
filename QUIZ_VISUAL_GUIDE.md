# 🎁 Quiz & Rewards System - Visual Quick Guide

## 📺 User Experience Flow

```
┌─────────────────────────────────────────────┐
│  User Content Details Page                  │
│  ┌─────────────────────────────────────┐   │
│  │  [Image: Movie/Product Poster]      │   │
│  │                                     │   │
│  │  Title: "Avengers Endgame"         │   │
│  │  Rating: UA 16+ | 3h 2m | Action   │   │
│  │                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │ ▶ Watch Now │  │ 🎁 Participate│ │   │
│  │  │ (Existing)  │  │   (NEW!)    │ │   │
│  │  └─────────────┘  └─────────────┘ │   │
│  │        ┌──┐     ┌──┐     ┌──┐     │   │
│  │        │♡ │     │✎ │     │↗ │     │   │
│  │        └──┘     └──┘     └──┘     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Tabs] ▐Synopsis  Cast  Videos▌           │
│                                             │
└─────────────────────────────────────────────┘
         Click "🎁 Participate" ⬇️
         ┌─────────────────────────────────────┐
         │  Participate Page                   │
         │  ┌───────────────────────────────┐ │
         │  │ Get Entertained & Win Rewards!│ │
         │  │ Content: Avengers Endgame     │ │
         │  │ Total Questions: 5            │ │
         │  └───────────────────────────────┘ │
         │                                     │
         │  Q1: What is Thor's hammer?       │
         │  ○ Mjolnir ← Selected             │
         │  ○ Stormbreaker                   │
         │  ○ The Odinforce                  │
         │  ○ Gungnir                        │
         │                                     │
         │  Q2: Who is the leader?           │
         │  ○ Iron Man                       │
         │  ○ Captain America                │
         │  ○ ← (select option)              │
         │  ○                                │
         │                                     │
         │  ... [2 more questions]           │
         │                                     │
         │  [Submit Quiz]  (2/5 answered)    │
         │                                     │
         └─────────────────────────────────────┘
              ⬇️ Click Submit
         ┌─────────────────────────────────────┐
         │  Results Screen                     │
         │                                     │
         │  ✅ Quiz Submitted!                │
         │                                     │
         │  Your Score: 4/5 (80%)            │
         │  🎉 Excellent performance!        │
         │                                     │
         │  [← Back to Content]               │
         │                                     │
         └─────────────────────────────────────┘
```

---

## 👨‍💼 Admin Experience Flow

```
┌──────────────────────────────────────────────┐
│  Admin Dashboard                              │
│  ┌────────────────────────────────────────┐ │
│  │ [Dashboard] [Content] [Users] [Payments]  │
│  │ [Analytics] [Quiz Mgmt] [Quiz Results]    │
│  │                                        │ │
│  │  ◀── Click "Quiz Management" ──▶      │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
              ⬇️
┌────────────────────────────────────────────────┐
│ Quiz Management Tab                            │
│ ┌───────────────────┐  ┌──────────────────┐  │
│ │ Existing Quizzes  │  │ Create New Quiz  │  │
│ │                   │  │                  │  │
│ │ • Avengers (4 Q)  │──→ Content: [____] │  │
│ │ • Inception (3 Q) │  │ ☐ Paid Quiz     │  │
│ │ • Interstellar(5Q)│  │                  │  │
│ │                   │  │ [Add Question]   │  │
│ │                   │  │                  │  │
│ │ [🗑 Clear]        │  │ Q1: What is...? │  │
│ │                   │  │ Option A ◉       │  │
│ │                   │  │ Option B         │  │
│ │                   │  │ Option C         │  │
│ │                   │  │                  │  │
│ │                   │  │ [+ Add Option]   │  │
│ │                   │  │ [Remove Q]       │  │
│ │                   │  │                  │  │
│ │                   │  │ [Save Quiz] ⬅️  │  │
│ │                   │  │                  │  │
│ └───────────────────┘  └──────────────────┘  │
└────────────────────────────────────────────────┘
              ⬇️ Switch to Results
┌────────────────────────────────────────────────┐
│ Quiz Results Tab                               │
│ ┌──────────────┐  ┌──────────────────────┐  │
│ │ Quizzes:     │  │ Participant Results  │  │
│ │              │  │                      │  │
│ │ • Avengers ──┼─→ Email: user@email.com│  │
│ │   (12 users) │  │ Score: 4/5 (80%)     │  │
│ │              │  │                      │  │
│ │ • Inception  │  │ Answers:             │  │
│ │   (8 users)  │  │ ├─ Q1: Answer B ✓    │  │
│ │              │  │ ├─ Q2: Answer C ✓    │  │
│ │ • Interstellar│  │ ├─ Q3: Answer D ✗    │  │
│ │   (5 users)  │  │ ├─ Q4: Answer A ✓    │  │
│ │              │  │ └─ Q5: Answer C ✓    │  │
│ │ [🔄 Refresh] │  │                      │  │
│ │ [🗑 Clear]   │  │ [← Back] [Next ▶]    │  │
│ │              │  │                      │  │
│ └──────────────┘  └──────────────────────┘  │
│                  Click "Clear All" ⟹         │
│   ⚠️ Confirm: Delete all for Avengers?      │
│   [Cancel]  [Delete - Removed 12 records]   │
└────────────────────────────────────────────────┘
```

---

## 🗄️ Data Flow

```
┌─────────────────────────────────────────┐
│ Admin Creates Quiz                      │
├─────────────────────────────────────────┤
│ - Content: Movie Title                 │
│ - Paid: Yes/No                         │
│ - Questions: [{Q1, [Opts]}, {Q2...}]   │
└────────┬────────────────────────────────┘
         │ POST /api/quiz/admin/upsert
         ▼
┌──────────────────────────┐
│ MongoDB                  │
│ ┌──────────────────────┐ │
│ │ Quiz Collection      │ │
│ │ ├─ contentId         │ │
│ │ ├─ questions []      │ │
│ │ ├─ options []        │ │
│ │ └─ isPaid            │ │
│ └──────────────────────┘ │
└──────────────────────────┘


┌─────────────────────────────────────────┐
│ User Answers Questions                  │
├─────────────────────────────────────────┤
│ GET /api/quiz/user/:id (Get Questions)  │
│ ↓                                       │
│ User selects answers                    │
│ ↓                                       │
│ POST /api/quiz/user/submit (Submit)     │
└────────┬────────────────────────────────┘
         │
         ├─ Validate answers
         ├─ Calculate score
         └─ Save result
         ▼
┌──────────────────────────────┐
│ MongoDB                      │
│ ┌────────────────────────────┐ │
│ │ QuizParticipant Collection │ │
│ │ ├─ userId                  │ │
│ │ ├─ answers [          ]    │ │
│ │ ├─ score & total           │ │
│ │ └─ participatedAt          │ │
│ └────────────────────────────┘ │
└──────────────────────────────┘


┌─────────────────────────────────────────┐
│ Admin Views Results                     │
├─────────────────────────────────────────┤
│ GET /api/quiz/admin/results/:id         │
│ (Get all answers for that quiz)         │
└────────┬────────────────────────────────┘
         │
         ▼ Display in Admin Panel
    ┌──────────────────────┐
    │ All Participants     │
    │ ├─ user1@email.com   │
    │ ├─ user2@email.com   │
    │ └─ user3@email.com   │
    │   (with scores)      │
    └──────────────────────┘
```

---

## 🎯 Key Interactions

### Admin Creating Quiz
```
1️⃣  Click Tab: "Quiz Management"
2️⃣  Enter: Content name
3️⃣  Toggle: Free or Paid
4️⃣  Add Questions:
    - Type question
    - Add 2-4 options
    - Mark correct answer (radio)
5️⃣  Save Quiz
✅ Users now see "Participate" button
```

### User Taking Quiz
```
1️⃣  Click: "🎁 Participate" button
2️⃣  Read: Question text
3️⃣  Select: One option per question
4️⃣  Check: Progress counter (3/5)
5️⃣  Click: "Submit Quiz"
✅ See score immediately
```

### Admin Viewing Results
```
1️⃣  Click Tab: "Quiz Results"
2️⃣  Select: Content from list
3️⃣  See: All participants
4️⃣  Expand: View each answer
✅ Detailed breakdown per question
```

### Admin Clearing Data
```
1️⃣  Click: "Clear All" button
2️⃣  Confirm: "Delete all for X?"
✅ Questions + all answers deleted
```

---

## 🎨 UI Components

### Admin Quiz Form
```
┌─────────────────────────────────┐
│ Quiz Management                 │
│                                 │
│ Content Name:                   │
│ [Avengers Endgame________]      │
│                                 │
│ ☑ This is a paid participation  │
│                                 │
│ Q1: What is Thor's name?       │
│ ○ Mjolnir (Correct Answer)     │
│ ○ Stormbreaker                 │
│ ○ Gungnir                      │
│ [+ Add Option] [Remove]        │
│                                 │
│ [+ Add Question]                │
│                                 │
│ [Save Quiz] [Cancel]            │
└─────────────────────────────────┘
```

### User Quiz Page
```
┌──────────────────────────────────┐
│ Get Entertained & Win Rewards!   │
│ Content: Avengers Endgame        │
│ Questions: 1/5                   │
│                                  │
│ Question 1                       │
│ What is Thor's hammer called?   │
│                                  │
│ ○ Mjolnir ← (Selectable)        │
│ ○ Stormbreaker                  │
│ ○ Gungnir                       │
│ ○ The Odinforce                 │
│                                  │
│          ┌──────────────┐        │
│          │ Submit Quiz  │        │
│          └──────────────┘        │
│                                  │
│ Progress: 1/5 answered           │
│                                  │
│ [← Back]                         │
└──────────────────────────────────┘
```

### Results Breakdown
```
Participant: user@example.com
Score: 4/5 (80%)
Date: Oct 28, 2025

Q1: What is Thor's name?
   ┌─ User answered: Mjolnir ✓
   └─ Correct Answer

Q2: Who built Iron Man suit?
   ┌─ User answered: Pepper Potts ✗
   └─ Correct Answer: Tony Stark

... [More questions]
```

---

## 🔐 Data Security

### What's Stored
```
✅ User answers (what they selected)
✅ User email & name
✅ Score (correct/total)
✅ Timestamp
✅ Correct answers (for admin only)

❌ NOT stored: Password, payment info, personal data beyond email/name
```

### What Admin Can Do
```
✅ Create questions
✅ Set correct answers
✅ View all participant results
✅ Delete entire quiz & answers
✅ Export data (future feature)

❌ Cannot edit submitted answers
❌ Cannot see user passwords
❌ Cannot access payments
```

---

## 📊 Score Calculation

```
Total Questions: 5
User Answers:
  ✓ Q1 Correct
  ✗ Q2 Wrong
  ✓ Q3 Correct
  ✓ Q4 Correct
  ✓ Q5 Correct

Score = 4 Correct out of 5
Display = "4/5 (80%)"

Feedback:
  80%+ → 🎉 Excellent!
  50-80% → 👍 Good job!
  <50% → 💪 Keep trying!
```

---

## ✨ Features at a Glance

```
Admin                          | User
-------------------------------|------------------------------
Create quiz questions          | See "Participate" button
Set free or paid mode          | Answer quiz questions
Mark correct answers           | Get instant score
View all responses             | See encouraging feedback
See score breakdown            | Option to retry (later)
Clear old quizzes              |
Track participation            |
```

---

That's it! 🎉 Your Quiz & Rewards system is fully visual, intuitive, and ready to use!
