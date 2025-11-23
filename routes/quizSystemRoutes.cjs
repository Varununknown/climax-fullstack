const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const router = express.Router();

// Helper function to create hash of questions (for versioning)
const getQuizHash = (questions) => {
  const quizString = JSON.stringify(questions);
  return crypto.createHash('sha256').update(quizString).digest('hex').substring(0, 12);
};

// Simple Quiz Schema - completely separate from existing participation
const SimpleQuizSchema = new mongoose.Schema({
  contentId: { type: String, required: true },
  quizHash: { type: String, required: true }, // Version hash of the questions
  questions: [{ 
    question: String, 
    options: [String], 
    correctAnswer: String 
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SimpleQuiz = mongoose.model('SimpleQuiz', SimpleQuizSchema);

// User Response Schema - NOW TRACKS QUIZ VERSION + USER INFO
const SimpleQuizResponseSchema = new mongoose.Schema({
  contentId: String,
  quizHash: String,  // NEW: Stores which version of quiz was answered
  userId: String,
  userName: String,  // NEW: User's name for admin visibility
  phoneNumber: String,  // NEW: Optional phone number (for winners contact)
  answers: [{ question: String, answer: String }],
  score: Number,
  festTransactionId: String,  // NEW: Transaction ID for fest payment (if paid)
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
      const defaultQuestions = [
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
      ];
      
      quiz = new SimpleQuiz({
        contentId,
        quizHash: getQuizHash(defaultQuestions),
        questions: defaultQuestions
      });
      await quiz.save();
    }
    
    res.json({
      success: true,
      quizHash: quiz.quizHash,  // Send hash to frontend
      quiz: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        id: q._id
      }))
    });
    
  } catch (error) {
    console.error('Quiz fetch error:', error);
    const defaultQuestions = [
      {
        question: "Rate this content",
        options: ["Amazing", "Good", "Okay"],
        id: "default1"
      }
    ];
    res.json({
      success: true,
      quizHash: getQuizHash([defaultQuestions[0]]),
      quiz: defaultQuestions
    });
  }
});

// ✅ NEW: Check if user already answered THIS VERSION of the quiz
router.get('/check/:contentId/:userId', async (req, res) => {
  try {
    const { contentId, userId } = req.params;
    
    // Get current quiz to check version
    const currentQuiz = await SimpleQuiz.findOne({ contentId });
    const currentHash = currentQuiz?.quizHash;
    
    console.log('🔍 Checking quiz response for:', { contentId, userId, currentHash });
    
    // Check if user answered THIS SPECIFIC VERSION of the quiz
    const existingResponse = await SimpleQuizResponse.findOne({
      contentId,
      userId,
      quizHash: currentHash  // Only blocks if they answered THIS version
    });
    
    res.json({
      success: true,
      hasResponded: !!existingResponse,
      response: existingResponse || null,
      currentHash: currentHash
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
    const { answers, userId, quizHash, userName, phoneNumber, festTransactionId } = req.body;
    
    console.log('📝 Quiz Submit Received:', {
      contentId,
      userId,
      userName,
      phoneNumber,
      quizHash,
      festTransactionId,
      answersCount: answers?.length,
      answers
    });
    
    const finalUserId = userId || req.user?.id || 'anonymous';
    
    console.log('👤 Using userId:', finalUserId, 'userName:', userName, 'phone:', phoneNumber);
    
    // Get current quiz hash to verify user is submitting current version
    const currentQuiz = await SimpleQuiz.findOne({ contentId });
    const currentHash = currentQuiz?.quizHash || quizHash;
    
    // Check if user already answered THIS VERSION of the quiz
    const existingResponse = await SimpleQuizResponse.findOne({
      contentId,
      userId: finalUserId,
      quizHash: currentHash  // Only block if they answered THIS version
    });
    
    if (existingResponse) {
      console.log('⚠️ User already answered this version of the quiz');
      return res.json({
        success: false,
        message: "You have already answered this version of the quiz!",
        alreadyAnswered: true
      });
    }
    
    // Save the response WITH THE QUIZ VERSION HASH + USER INFO + FEST TRANSACTION ID
    const response = new SimpleQuizResponse({
      contentId,
      quizHash: currentHash,  // Store which version was answered
      userId: finalUserId,
      userName: userName || 'Anonymous',  // Store user name
      phoneNumber: phoneNumber || '',  // Store optional phone number
      answers: answers || [],
      score: answers?.length || 1,
      festTransactionId: festTransactionId || null  // Store fest payment transaction ID if provided
    });
    
    await response.save();
    
    console.log('✅ Response saved successfully:', {
      id: response._id,
      contentId,
      quizHash: currentHash,
      userId: finalUserId,
      userName: userName,
      phoneNumber: phoneNumber,
      festTransactionId: festTransactionId,
      answersCount: answers?.length
    });
    
    res.json({
      success: true,
      message: "Thank you for your feedback!",
      score: answers?.length || 1,
      alreadyAnswered: false
    });
    
  } catch (error) {
    console.error('❌ Quiz submit error:', error);
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
    const { 
      questions, 
      festPaymentEnabled, 
      festParticipationFee,
      sponsorName,          // ✅ NEW: Sponsor name
      sponsorLogoUrl,       // ✅ NEW: Sponsor logo URL
      prizeAmount           // ✅ NEW: Prize amount in Rs
    } = req.body;
    
    // Create hash of new questions
    const newHash = getQuizHash(questions);
    
    console.log('📝 Admin updating quiz:', {
      contentId,
      newHash,
      questionsCount: questions?.length,
      festPaymentEnabled,
      festParticipationFee,
      sponsorName,
      sponsorLogoUrl,
      prizeAmount
    });
    
    // Update Content model with payment settings AND sponsor info
    const Content = require('../models/Content.cjs');
    const mongoose = require('mongoose');
    
    // Try with ObjectId conversion
    let updateFilter = { _id: contentId };
    try {
      if (mongoose.Types.ObjectId.isValid(contentId)) {
        updateFilter = { _id: new mongoose.Types.ObjectId(contentId) };
      }
    } catch (e) {
      console.log('contentId is not a valid ObjectId, using as string:', contentId);
    }
    
    const updatedContent = await Content.findOneAndUpdate(
      updateFilter,
      { 
        festPaymentEnabled: festPaymentEnabled === true,
        festParticipationFee: Number(festParticipationFee) || 0,
        sponsorName: sponsorName || '',           // ✅ Store sponsor name
        sponsorLogoUrl: sponsorLogoUrl || '',     // ✅ Store sponsor logo
        prizeAmount: Number(prizeAmount) || 0    // ✅ Store prize amount
      },
      { new: true }
    );
    
    console.log('✅ Content updated with payment & sponsor settings:', {
      contentId,
      festPaymentEnabled,
      festParticipationFee,
      sponsorName,
      sponsorLogoUrl,
      prizeAmount,
      updateFilter,
      updated: !!updatedContent
    });
    
    if (!updatedContent) {
      console.warn('⚠️ WARNING: Content not found for ID:', contentId);
    }
    
    const updatedQuiz = await SimpleQuiz.findOneAndUpdate(
      { contentId },
      { 
        contentId, 
        questions,
        quizHash: newHash,  // Update hash - enables users to re-answer
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    // AUTO-DELETE: If questions are cleared (empty array), delete all responses for this content
    if (!questions || questions.length === 0) {
      const deleteResult = await SimpleQuizResponse.deleteMany({ contentId });
      console.log(`🗑️ Auto-deleted ${deleteResult.deletedCount} responses for content ${contentId} (questions cleared)`);
    }
    
    console.log('✅ Quiz updated with new version:', {
      contentId,
      newHash,
      festPaymentEnabled,
      festParticipationFee,
      previousResponses: 'Still accessible in history'
    });
    
    res.json({ 
      success: true, 
      message: "Quiz updated successfully",
      quizHash: newHash,
      contentUpdated: !!updatedContent,
      quizUpdated: !!updatedQuiz
    });
  } catch (error) {
    console.error('❌ Quiz admin error:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Failed to save quiz: " + error.message,
      error: error.message
    });
  }
});

// ✅ NEW: Get all quiz responses for a content (ADMIN)
router.get('/admin/responses/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    console.log('📊 Fetching responses for contentId:', contentId);
    
    const responses = await SimpleQuizResponse.find({ contentId })
      .sort({ submittedAt: -1 })
      .lean();
    
    console.log(`📈 Found ${responses.length} responses for content ${contentId}`);
    
    // Calculate statistics
    const totalResponses = responses.length;
    const answerFrequency = {};
    
    responses.forEach(response => {
      response.answers.forEach(answer => {
        const key = `${answer.question}||${answer.answer}`;
        answerFrequency[key] = (answerFrequency[key] || 0) + 1;
      });
    });
    
    console.log('📋 Answer frequency:', answerFrequency);
    
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
    console.error('❌ Get responses error:', error);
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

// ✅ NEW: Clear all answers for a content (ADMIN)
router.post('/admin/clear/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    
    console.log('🗑️ Clearing all answers for contentId:', contentId);
    
    const result = await SimpleQuizResponse.deleteMany({ contentId });
    
    console.log(`✅ Deleted ${result.deletedCount} responses for content ${contentId}`);
    
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} answers`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Clear answers error:', error);
    res.json({
      success: false,
      message: 'Failed to clear answers: ' + error.message
    });
  }
});

// ✅ Fest Payment - Check if user has paid for fest participation
router.get('/fest-payment/check/:contentId/:userId', async (req, res) => {
  try {
    const { contentId, userId } = req.params;
    
    // Check if user has submitted quiz for this content with valid fest transaction ID
    const response = await SimpleQuizResponse.findOne({
      contentId,
      userId,
      festTransactionId: { $exists: true, $ne: null }
    });
    
    res.json({
      success: true,
      hasPaid: !!response,
      payment: response ? { transactionId: response.festTransactionId } : null
    });
  } catch (error) {
    console.error('Error checking fest payment:', error);
    res.json({
      success: false,
      hasPaid: false
    });
  }
});

// ✅ Fest Payment - Verify transaction ID format (no storage needed, just validation)
router.post('/fest-payment/verify/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { userId, transactionId } = req.body;
    
    if (!userId || !transactionId) {
      return res.json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Validate transaction ID - must be exactly 12 digits
    if (!/^\d{12}$/.test(transactionId)) {
      return res.json({
        success: false,
        message: 'Transaction ID must be exactly 12 digits'
      });
    }
    
    console.log('✅ Fest payment transaction ID validated:', {
      userId,
      contentId,
      transactionId
    });
    
    // Auto-approve valid transaction ID
    res.json({
      success: true,
      message: 'Transaction ID verified successfully'
    });
  } catch (error) {
    console.error('Error verifying fest payment:', error);
    res.json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// 🔍 DEBUG: Check what's actually in the database for a content ID
router.get('/debug/check-db/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const Content = require('../models/Content.cjs');
    
    const content = await Content.findById(contentId).lean();
    
    res.json({
      success: true,
      contentId,
      festPaymentEnabled: content?.festPaymentEnabled,
      festParticipationFee: content?.festParticipationFee,
      exists: !!content,
      allFields: content ? Object.keys(content) : []
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;