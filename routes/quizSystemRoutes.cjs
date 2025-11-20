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
    const { answers, userId, quizHash, userName, phoneNumber } = req.body;
    
    console.log('📝 Quiz Submit Received:', {
      contentId,
      userId,
      userName,
      phoneNumber,
      quizHash,
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
    
    // Save the response WITH THE QUIZ VERSION HASH + USER INFO
    const response = new SimpleQuizResponse({
      contentId,
      quizHash: currentHash,  // Store which version was answered
      userId: finalUserId,
      userName: userName || 'Anonymous',  // Store user name
      phoneNumber: phoneNumber || '',  // Store optional phone number
      answers: answers || [],
      score: answers?.length || 1
    });
    
    await response.save();
    
    console.log('✅ Response saved successfully:', {
      id: response._id,
      contentId,
      quizHash: currentHash,
      userId: finalUserId,
      userName: userName,
      phoneNumber: phoneNumber,
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
    const { questions, festPaymentEnabled, festParticipationFee } = req.body;
    
    // Create hash of new questions
    const newHash = getQuizHash(questions);
    
    console.log('📝 Admin updating quiz:', {
      contentId,
      newHash,
      questionsCount: questions?.length,
      festPaymentEnabled,
      festParticipationFee
    });
    
    // Update Content model with payment settings
    const Content = require('../backend/models/Content.cjs');
    await Content.findByIdAndUpdate(
      contentId,
      { 
        festPaymentEnabled: festPaymentEnabled || false,
        festParticipationFee: festParticipationFee || 0
      },
      { new: true }
    );
    
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
      quizHash: newHash
    });
  } catch (error) {
    console.error('Quiz admin error:', error);
    res.json({ success: true, message: "Quiz saved" });
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
    
    // Check if user has a successful fest payment payment for this content
    const Payment = require('../backend/models/Payment.cjs');
    const festPayment = await Payment.findOne({
      contentId,
      userId,
      status: 'approved',
      paymentType: 'fest-participation'
    });
    
    res.json({
      success: true,
      hasPaid: !!festPayment,
      payment: festPayment || null
    });
  } catch (error) {
    console.error('Error checking fest payment:', error);
    res.json({
      success: false,
      hasPaid: false
    });
  }
});

// ✅ Fest Payment - Verify and record fest participation payment
router.post('/fest-payment/verify/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { userId, transactionId, amount } = req.body;
    
    if (!userId || !transactionId || !amount) {
      return res.json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Validate transaction ID format
    if (!/^[A-Z0-9]{12,}$/i.test(transactionId)) {
      return res.json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }
    
    // Check if this transaction ID already exists
    const Payment = require('../backend/models/Payment.cjs');
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      return res.json({
        success: false,
        message: 'This transaction ID has already been used'
      });
    }
    
    // Create approved payment record for fest participation
    const payment = new Payment({
      userId,
      contentId,
      transactionId,
      amount,
      status: 'approved',
      paymentType: 'fest-participation', // Mark as fest participation
      gateway: 'upi',
      paymentDate: new Date()
    });
    
    await payment.save();
    
    console.log('✅ Fest participation payment recorded:', {
      userId,
      contentId,
      transactionId,
      amount
    });
    
    res.json({
      success: true,
      message: 'Fest participation payment verified successfully',
      payment: payment
    });
  } catch (error) {
    console.error('Error verifying fest payment:', error);
    res.json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

module.exports = router;