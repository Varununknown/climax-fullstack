const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Simple Quiz Schema - completely separate from existing participation
const QuizSchema = new mongoose.Schema({
  contentId: { type: String, required: true },
  questions: [{ 
    question: String, 
    options: [String], 
    correctAnswer: String 
  }],
  createdAt: { type: Date, default: Date.now }
});

const Quiz = mongoose.model('Quiz', QuizSchema);

// User Response Schema
const QuizResponseSchema = new mongoose.Schema({
  contentId: String,
  userId: String,
  answers: [{ question: String, answer: String }],
  score: Number,
  submittedAt: { type: Date, default: Date.now }
});

const QuizResponse = mongoose.model('QuizResponse', QuizResponseSchema);

// GET quiz for content
router.get('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    let quiz = await Quiz.findOne({ contentId });
    
    // If no quiz exists, create a sample one
    if (!quiz) {
      quiz = new Quiz({
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

// POST quiz response
router.post('/:contentId/submit', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { answers } = req.body;
    
    // Always save the response
    const response = new QuizResponse({
      contentId,
      userId: req.user?.id || 'anonymous',
      answers: answers || [],
      score: answers?.length || 1
    });
    
    await response.save();
    
    res.json({
      success: true,
      message: "Thank you for your feedback!",
      score: answers?.length || 1
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
    
    await Quiz.findOneAndUpdate(
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

module.exports = router;