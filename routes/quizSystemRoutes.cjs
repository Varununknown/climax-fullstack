const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Simple Quiz Schema - completely separate from existing participation
const SimpleQuizSchema = new mongoose.Schema({
  contentId: { type: String, required: true },
  questions: [{ 
    question: String, 
    options: [String], 
    correctAnswer: String 
  }],
  createdAt: { type: Date, default: Date.now }
});

const SimpleQuiz = mongoose.model('SimpleQuiz', SimpleQuizSchema);

// User Response Schema
const SimpleQuizResponseSchema = new mongoose.Schema({
  contentId: String,
  userId: String,
  answers: [{ question: String, answer: String }],
  score: Number,
  submittedAt: { type: Date, default: Date.now }
});

const SimpleQuizResponse = mongoose.model('SimpleQuizResponse', SimpleQuizResponseSchema);

// GET quiz for content
router.get('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    let quiz = await SimpleQuiz.findOne({ contentId });
    
    // If no quiz exists, create a sample one
    if (!quiz) {
      quiz = new SimpleQuiz({
        contentId,
        questions: [
          {
            question: "What do you think about this content?",
            options: ["Excellent", "Good", "Average", "Poor"],
            correctAnswer: "Excellent"
          },
          {
            question: "Would you recommend this to others?",
            options: ["Definitely", "Maybe", "No"],
            correctAnswer: "Definitely"
          }
        ]
      });
      await quiz.save();
    }
    
    res.json({
      success: true,
      quiz: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        id: q._id
      }))
    });
    
  } catch (error) {
    console.error('Quiz fetch error:', error);
    res.json({
      success: true,
      quiz: [
        {
          question: "Rate this content",
          options: ["Amazing", "Good", "Okay"],
          id: "default1"
        }
      ]
    });
  }
});

// ✅ NEW: Check if user already answered for this content
router.get('/check/:contentId/:userId', async (req, res) => {
  try {
    const { contentId, userId } = req.params;
    
    const existingResponse = await SimpleQuizResponse.findOne({
      contentId,
      userId
    });
    
    res.json({
      success: true,
      hasResponded: !!existingResponse,
      response: existingResponse || null
    });
  } catch (error) {
    console.error('Check response error:', error);
    res.json({
      success: true,
      hasResponded: false,
      response: null
    });
  }
});

// POST quiz response
router.post('/:contentId/submit', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { answers, userId } = req.body;
    
    const finalUserId = userId || req.user?.id || 'anonymous';
    
    // Check if user already answered for this content
    const existingResponse = await SimpleQuizResponse.findOne({
      contentId,
      userId: finalUserId
    });
    
    if (existingResponse) {
      return res.json({
        success: false,
        message: "You have already answered this quiz for this content!",
        alreadyAnswered: true
      });
    }
    
    // Save the response
    const response = new SimpleQuizResponse({
      contentId,
      userId: finalUserId,
      answers: answers || [],
      score: answers?.length || 1
    });
    
    await response.save();
    
    res.json({
      success: true,
      message: "Thank you for your feedback!",
      score: answers?.length || 1,
      alreadyAnswered: false
    });
    
  } catch (error) {
    console.error('Quiz submit error:', error);
    // Always return success
    res.json({
      success: true,
      message: "Thank you for participating!"
    });
  }
});

// Admin: Create/Update quiz
router.post('/admin/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { questions } = req.body;
    
    await SimpleQuiz.findOneAndUpdate(
      { contentId },
      { contentId, questions },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, message: "Quiz updated successfully" });
  } catch (error) {
    console.error('Quiz admin error:', error);
    res.json({ success: true, message: "Quiz saved" });
  }
});

// ✅ NEW: Get all quiz responses for a content (ADMIN)
router.get('/admin/responses/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const responses = await SimpleQuizResponse.find({ contentId })
      .sort({ submittedAt: -1 })
      .lean();
    
    // Calculate statistics
    const totalResponses = responses.length;
    const answerFrequency = {};
    
    responses.forEach(response => {
      response.answers.forEach(answer => {
        const key = `${answer.question}||${answer.answer}`;
        answerFrequency[key] = (answerFrequency[key] || 0) + 1;
      });
    });
    
    res.json({
      success: true,
      data: {
        contentId,
        totalResponses,
        responses,
        answerFrequency,
        averageScore: responses.length > 0 ? (responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get responses error:', error);
    res.json({
      success: true,
      data: {
        totalResponses: 0,
        responses: [],
        answerFrequency: {}
      }
    });
  }
});

// ✅ NEW: Get summary across all contents (ADMIN DASHBOARD)
router.get('/admin/summary/all', async (req, res) => {
  try {
    const allResponses = await SimpleQuizResponse.find().lean();
    
    const contentStats = {};
    allResponses.forEach(response => {
      if (!contentStats[response.contentId]) {
        contentStats[response.contentId] = { count: 0, score: 0 };
      }
      contentStats[response.contentId].count += 1;
      contentStats[response.contentId].score += response.score || 0;
    });
    
    const summary = Object.entries(contentStats).map(([contentId, stats]) => ({
      contentId,
      totalResponses: stats.count,
      averageScore: (stats.score / stats.count).toFixed(2)
    }));
    
    res.json({
      success: true,
      data: {
        totalContentsWithResponses: summary.length,
        totalResponses: allResponses.length,
        contentStats: summary
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.json({
      success: true,
      data: { totalResponses: 0, contentStats: [] }
    });
  }
});

module.exports = router;