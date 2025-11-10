import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import API from '../services/api';

// UPDATED: 2025-11-09 - Fans Fest Integration v2.2 (Use API service)

interface Question {
  _id?: string; // Optional ID for participation questions
  questionIndex: number;
  questionText: string;
  options: Array<{ optionText: string }>;
}

interface QuizData {
  contentId: string;
  contentName: string;
  isPaid: boolean;
  questions: Question[];
  totalQuestions: number;
}

export const ParticipatePage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check for debug mode
  const searchParams = new URLSearchParams(window.location.search);
  const isDebugMode = searchParams.get('debug') === 'true';

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!contentId) {
      navigate('/');
      return;
    }

    fetchQuiz();
  }, [contentId, user]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching Fans Fest questions for content:', contentId);
      
      // Try participation (Fans Fest) endpoint first
      const participationResponse = await API.get(`/participation/user/${contentId}/questions`);
      const participationData = participationResponse.data;

      console.log('📊 Participation response:', {
        success: participationData.success,
        hasData: !!participationData.data,
        questionsCount: participationData.data?.questions?.length,
        fullResponse: participationData
      });

      // Store debug data
      if (isDebugMode) {
        setDebugData({
          apiResponse: participationData,
          timestamp: new Date().toISOString(),
          contentId,
          userInfo: user
        });
      }

      if (participationData.success && participationData.data?.questions?.length > 0) {
        console.log('✅ Loaded Fans Fest questions:', participationData.data.questions.length);
        // Format participation data to match quiz format
        setQuiz({
          contentId: contentId!,
          contentName: participationData.data.content.title,
          isPaid: participationData.data.settings.isPaid || false,
          questions: participationData.data.questions.map((q: any, idx: number) => ({
            _id: q._id, // Include question ID for submission
            questionIndex: idx,
            questionText: q.questionText,
            options: q.options.map((opt: string) => ({ optionText: opt }))
          })),
          totalQuestions: participationData.data.questions.length
        });
        return;
      }

      console.log('⚠️ No participation questions, falling back to quiz endpoint');

      // Fallback to old quiz endpoint if no participation questions
      const response = await API.get(`/quiz/user/${contentId}`);
      const data = response.data;

      if (data.success) {
        console.log('✅ Loaded quiz questions:', data.questions?.length || 0);
        setQuiz(data);
      } else {
        console.log('❌ Quiz endpoint returned no data');
        setMessage({ type: 'error', text: 'No questions found for this content' });
      }
    } catch (err: any) {
      console.error('❌ Error loading questions:', err);
      console.error('❌ Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        statusText: err.response?.statusText
      });
      setMessage({ type: 'error', text: 'Error loading quiz' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, option: string) => {
    setAnswers({
      ...answers,
      [questionIndex]: option
    });
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    if (!quiz || Object.keys(answers).length !== quiz.questions.length) {
      setMessage({ type: 'error', text: 'Please answer all questions' });
      return;
    }

    setSubmitting(true);
    try {
      console.log('📤 Submitting answers...');
      
      // Try participation (Fans Fest) endpoint first
      const participationAnswers = quiz.questions.map((q, idx) => ({
        questionId: q._id || idx, // Use question ID if available
        selectedOption: answers[idx]
      }));

      const participationResponse = await API.post(`/participation/user/${contentId}/submit`, {
        answers: participationAnswers
      });

      const participationData = participationResponse.data;

      if (participationData.success) {
        console.log('✅ Participation submitted successfully');
        setResult(participationData);
        setSubmitted(true);
        setMessage({ type: 'success', text: '🎉 Participation submitted successfully!' });
        return;
      }

      // Fallback to quiz endpoint if participation fails
      const formattedAnswers = quiz.questions.map((_, idx) => ({
        questionIndex: idx,
        selectedOption: answers[idx]
      }));

      const response = await API.post(`/quiz/user/submit`, {
        userId: user?.id,
        contentId: contentId,
        userEmail: user?.email,
        userName: user?.name,
        answers: formattedAnswers
      });

      const data = response.data;

      if (data.success) {
        setResult(data);
        setSubmitted(true);
        setMessage({ type: 'success', text: 'Quiz submitted successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error submitting quiz' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please login to participate in quizzes</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Loading quiz...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#cc3333' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 20px' }} />
        <p>Quiz not found for this content</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Go Back
        </button>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <div
          style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}
        >
          <CheckCircle size={64} style={{ color: '#28a745', margin: '0 auto 20px' }} />
          <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Quiz Submitted!</h2>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#155724' }}>
            Your Score: {result.score}/{result.totalQuestions}
            <span style={{ fontSize: '18px', marginLeft: '10px' }}>
              ({result.percentage}%)
            </span>
          </div>
          <p style={{ color: '#155724', marginBottom: '30px' }}>
            {result.percentage >= 80
              ? '🎉 Excellent performance!'
              : result.percentage >= 50
              ? '👍 Good job!'
              : '💪 Keep practicing!'}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        <ArrowLeft size={16} style={{ marginRight: '8px', marginTop: '2px' }} />
        Back
      </button>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>Get Entertained & Win Rewards! 🎁</h1>
        <p style={{ color: '#666', marginBottom: '10px' }}>Content: <strong>{quiz.contentName}</strong></p>
        {quiz.isPaid && (
          <div style={{ color: '#ff9800', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '4px', marginBottom: '10px' }}>
            ⚠️ This is a paid participation
          </div>
        )}
        <p style={{ color: '#999' }}>Total Questions: {quiz.totalQuestions}</p>
      </div>

      {message.text && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message.text}
        </div>
      )}

      <div>
        {quiz.questions.map((question, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              marginBottom: '15px',
              borderRadius: '8px',
              border: '1px solid #eee'
            }}
          >
            <h3 style={{ color: '#333', marginBottom: '15px' }}>
              Question {idx + 1}: {question.questionText}
            </h3>

            <div>
              {question.options.map((option, oIdx) => (
                <label
                  key={oIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    marginBottom: '8px',
                    backgroundColor: answers[idx] === option.optionText ? '#e3f2fd' : '#f9f9f9',
                    border: `2px solid ${answers[idx] === option.optionText ? '#2196f3' : '#ddd'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name={`question_${idx}`}
                    value={option.optionText}
                    checked={answers[idx] === option.optionText}
                    onChange={e => handleAnswerChange(idx, e.target.value)}
                    style={{ marginRight: '10px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#333' }}>{option.optionText}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: Object.keys(answers).length === quiz.questions.length ? '#4CAF50' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: Object.keys(answers).length === quiz.questions.length ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 'bold',
          marginTop: '20px'
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>

      <p style={{ textAlign: 'center', color: '#999', marginTop: '15px', fontSize: '14px' }}>
        {Object.keys(answers).length}/{quiz.questions.length} questions answered
      </p>

      {/* Debug Mode Display */}
      {isDebugMode && debugData && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#1a1a1a', 
          border: '2px solid #00ff00', 
          borderRadius: '8px',
          color: '#00ff00',
          fontFamily: 'monospace'
        }}>
          <h3 style={{ color: '#00ff00', marginBottom: '15px' }}>🐛 DEBUG MODE - API Response</h3>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            fontSize: '12px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
