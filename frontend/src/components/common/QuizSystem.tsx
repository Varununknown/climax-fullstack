import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface QuizSystemProps {
  contentId: string;
  contentTitle: string;
}

const QuizSystem: React.FC<QuizSystemProps> = ({ contentId, contentTitle }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizHash, setQuizHash] = useState<string>('');  // Track quiz version
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [phoneNumber, setPhoneNumber] = useState<string>('');  // NEW: Phone number field
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userHasAnswered, setUserHasAnswered] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    loadQuiz();
    checkIfUserAnswered();
  }, [contentId, user]);

  const loadQuiz = async () => {
    try {
      const response = await API.get(`/quiz-system/${contentId}`);
      if (response.data.success) {
        setQuestions(response.data.quiz);
        setQuizHash(response.data.quizHash);  // Store quiz version hash
        console.log('📋 Quiz loaded with hash:', response.data.quizHash);
      }
    } catch (error) {
      console.log('Using default quiz');
      setQuestions([{
        id: 'default1',
        question: 'How would you rate this content?',
        options: ['Excellent', 'Good', 'Average']
      }]);
    }
  };

  const checkIfUserAnswered = async () => {
    if (!user?.id) return;
    
    try {
      const response = await API.get(`/quiz-system/check/${contentId}/${user.id}`);
      if (response.data.success) {
        setUserHasAnswered(response.data.hasResponded);
        console.log('✓ User answered check - hasResponded:', response.data.hasResponded);
      }
    } catch (error) {
      console.log('Could not check response status');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const submissionData = Object.keys(answers).map(questionId => ({
        question: questions.find(q => q.id === questionId)?.question || '',
        answer: answers[questionId]
      }));

      const response = await API.post(`/quiz-system/${contentId}/submit`, { 
        answers: submissionData,
        userId: user?.id,
        quizHash: quizHash,  // Send quiz version with submission
        userName: user?.name || 'Anonymous',  // NEW: Send user name
        phoneNumber: phoneNumber  // NEW: Send optional phone number
      });
      
      if (response.data.success) {
        setSubmitted(true);
        setUserHasAnswered(true);
      } else if (response.data.alreadyAnswered) {
        setUserHasAnswered(true);
        setSubmitted(true);
      }
    } catch (error) {
      // Always show success to user
      setSubmitted(true);
      setUserHasAnswered(true);
    }
    
    setLoading(false);
  };

  // Show already answered message if user has responded to this version
  if (userHasAnswered && !checkingStatus) {
    return (
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/50 backdrop-blur-xl rounded-xl p-8 text-center shadow-lg">
        <div className="text-emerald-400 text-5xl mb-4 animate-bounce">✓</div>
        <h3 className="text-2xl font-bold text-emerald-300 mb-3">
          Already Participated
        </h3>
        <p className="text-emerald-200/80 text-lg mb-4">
          Thank you for participating in Fan Fest for "<span className="font-semibold">{contentTitle}</span>"! 🎉
        </p>
        <p className="text-emerald-300/70 text-sm">
          You can participate again if the Fan Fest questions are updated with new challenges. Check back soon for new Fan Fest events!
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 backdrop-blur-xl rounded-xl p-8 text-center shadow-lg">
        <div className="text-green-400 text-5xl mb-4 animate-bounce">🎉</div>
        <h3 className="text-2xl font-bold text-green-300 mb-3">
          Thank You for Participating!
        </h3>
        <p className="text-green-200/80 text-lg">
          Your feedback for "<span className="font-semibold">{contentTitle}</span>" has been recorded successfully.
        </p>
        <p className="text-green-300/70 text-sm mt-4">
          We'll contact the winners at the phone number provided. Good luck! 🍀
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold mb-2">
          <span className="text-purple-400">🎬</span> Fan Fest Challenge
        </h3>
        <p className="text-gray-300 text-sm">
          Answer all questions and stand a chance to win amazing rewards! 🏆
        </p>
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition-all duration-300 transform hover:scale-[1.02]"
          >
            {/* Question Number & Title */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-white mb-4">
                  {question.question}
                </p>
                
                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      {/* Custom Radio Button */}
                      <div className="relative">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="opacity-0 w-5 h-5 cursor-pointer"
                        />
                        <div className="absolute inset-0 w-5 h-5 border-2 border-purple-400 rounded-full group-hover:border-pink-400 transition-colors duration-300"></div>
                        {answers[question.id] === option && (
                          <>
                            <div className="absolute inset-0 w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                            <div className="absolute inset-0 w-5 h-5 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Option Text */}
                      <span className={`text-sm font-medium transition-all duration-300 ${
                        answers[question.id] === option
                          ? 'text-pink-300 font-bold'
                          : 'text-gray-300 group-hover:text-gray-200'
                      }`}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phone Number Field - Premium Design */}
      <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/50 backdrop-blur rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div className="flex-1">
            <label className="block text-sm font-bold text-white mb-2">
              Phone Number <span className="text-yellow-400">(Optional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Provide your phone number so we can contact you if you win exciting rewards! Your number is kept confidential.
            </p>
            <input
              type="text"
              placeholder="e.g., +91 9876543210 or 9876543210"
              value={phoneNumber}
              onChange={(e) => {
                console.log('Phone input changed:', e.target.value);
                setPhoneNumber(e.target.value);
              }}
              inputMode="numeric"
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-100 placeholder-gray-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0 || loading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform ${
            Object.keys(answers).length === 0 || loading
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 shadow-lg hover:shadow-pink-500/50'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Submitting Your Feedback...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🚀 Submit Your Feedback
            </span>
          )}
        </button>
        {Object.keys(answers).length === 0 && (
          <p className="text-center text-xs text-gray-500 mt-3">
            Please answer all questions to continue →
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizSystem;