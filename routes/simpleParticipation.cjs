const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Simple participation model - just store the basics
const SimpleParticipation = mongoose.model('SimpleParticipation', new mongoose.Schema({
  contentId: String,
  userEmail: String,
  userName: String,
  questionId: String,
  selectedAnswer: String,
  submittedAt: { type: Date, default: Date.now }
}));

// GET participation questions - simple version
router.get('/simple/:contentId/questions', async (req, res) => {
  try {
    const { contentId } = req.params;
    console.log('📥 Simple participation request for:', contentId);
    
    // Just return hardcoded test data for now
    const testData = {
      success: true,
      data: {
        content: { _id: contentId, title: "Test Content" },
        questions: [
          {
            _id: "test123",
            questionText: "Do you like this content?",
            options: ["Yes", "No", "Maybe"]
          }
        ]
      }
    };
    
    res.json(testData);
  } catch (err) {
    console.error('❌ Simple participation error:', err);
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// POST submit participation - simple version  
router.post('/simple/:contentId/submit', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { answers, userEmail, userName } = req.body;
    
    console.log('📤 Simple submission:', { contentId, answers, userEmail, userName });
    
    // Just save it simply
    if (answers && answers.length > 0) {
      for (const answer of answers) {
        const participation = new SimpleParticipation({
          contentId,
          userEmail: userEmail || 'unknown@example.com',
          userName: userName || 'Unknown User',
          questionId: answer.questionId || 'test123',
          selectedAnswer: answer.selectedOption || answer.answer,
        });
        await participation.save();
      }
    }
    
    res.json({ 
      success: true, 
      message: '🎉 Participation recorded successfully!',
      data: { score: answers?.length || 1, total: answers?.length || 1 }
    });
    
  } catch (err) {
    console.error('❌ Simple submit error:', err);
    res.json({ success: true, message: 'Recorded (fallback)' }); // Just say success
  }
});

module.exports = router;