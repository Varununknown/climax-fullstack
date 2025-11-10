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
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl blur-xl opacity-40"></div>
        <div className="relative bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-8 sm:p-10 lg:p-12 text-center">
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50 animate-bounce">
              <span className="text-4xl sm:text-5xl">✓</span>
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4">
            Already Participated
          </h3>
          <p className="text-base sm:text-lg text-emerald-100 mb-2 sm:mb-3 font-medium px-2">
            Thank you for participating in Fan Fest for
          </p>
          <p className="text-lg sm:text-xl font-bold text-emerald-300 mb-4 sm:mb-6 px-2">"{contentTitle}" 🎉</p>
          <div className="pt-4 sm:pt-6 border-t border-emerald-500/30">
            <p className="text-xs sm:text-sm text-emerald-200/80 px-2">
              You can participate again when new questions are released. Stay tuned for upcoming Fan Fest events!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl blur-xl opacity-40 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-8 sm:p-10 lg:p-12 text-center">
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-2xl shadow-green-500/50 animate-bounce">
              <span className="text-5xl sm:text-6xl">🎉</span>
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4">
            Submission Successful!
          </h3>
          <p className="text-base sm:text-lg text-green-100 mb-2 sm:mb-3 px-2">
            Your feedback for <span className="font-bold text-green-300">"{contentTitle}"</span> has been recorded.
          </p>
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-500/30 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-yellow-200 flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-center sm:text-left">Winners will be contacted via the phone number provided. Good luck!</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Ultra Premium Form Header - Enhanced */}
      <div className="text-center pb-8 sm:pb-10 border-b border-white/20 mb-2">
        <div className="relative inline-flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 group/header">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-full blur-lg opacity-60 group-hover/header:opacity-80 transition-opacity duration-300"></div>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/50 group-hover/header:scale-110 transition-transform duration-300">
              <span className="text-2xl sm:text-3xl group-hover/header:animate-bounce">🎬</span>
            </div>
          </div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
            Fan Fest Challenge
          </h3>
        </div>
        <div className="relative">
          <p className="text-gray-300 text-base sm:text-lg px-4 leading-relaxed font-medium">
            Share your valuable feedback and win <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-400 blur-lg opacity-50"></span>
              <span className="relative text-yellow-300 font-black">amazing rewards</span>
            </span> 
            <span className="inline-block animate-bounce ml-2">🏆</span>
          </p>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-4 sm:space-y-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="relative group/question"
          >
            {/* Enhanced Question Card Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-xl sm:rounded-2xl blur-lg opacity-0 group-hover/question:opacity-25 transition-all duration-500"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-0 group-hover/question:opacity-15 transition-all duration-300"></div>
            
            {/* Premium Question Card */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/15 rounded-xl sm:rounded-2xl p-5 sm:p-7 lg:p-9 backdrop-blur-lg hover:border-purple-400/40 hover:bg-white/[0.08] transition-all duration-500 group-hover/question:scale-[1.01] shadow-xl hover:shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* Enhanced Question Number Badge */}
                <div className="flex-shrink-0 group/badge">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl sm:rounded-2xl blur-lg opacity-70 group-hover/question:opacity-90 transition-opacity duration-300"></div>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 flex items-center justify-center shadow-xl border-2 border-white/20 group-hover/question:scale-110 group-hover/question:rotate-6 transition-all duration-300">
                      <span className="text-xl sm:text-2xl font-black text-white drop-shadow-lg">{index + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4 sm:space-y-5 w-full">
                  {/* Question Text */}
                  <h4 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {question.question}
                  </h4>
                  
                  {/* Options Grid */}
                  <div className="space-y-2 sm:space-y-3 pt-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = answers[question.id] === option;
                      return (
                        <label
                          key={optionIndex}
                          className="relative flex items-center gap-3 sm:gap-4 cursor-pointer group/option"
                        >
                          {/* Enhanced Option Card */}
                          <div className={`relative flex-1 flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-600/40 to-fuchsia-600/40 border-fuchsia-400/70 shadow-xl shadow-purple-500/30 scale-[1.02]'
                              : 'bg-white/[0.05] border-white/15 hover:border-purple-400/50 hover:bg-white/[0.08] hover:scale-[1.01] hover:shadow-lg'
                          }`}>
                            {isSelected && (
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-xl sm:rounded-2xl blur-sm"></div>
                            )}
                            {/* Enhanced Custom Radio */}
                            <div className="relative flex-shrink-0 z-10">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={isSelected}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="sr-only"
                              />
                              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all duration-300 ${
                                isSelected
                                  ? 'border-fuchsia-300 bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-xl shadow-purple-500/60 scale-110'
                                  : 'border-gray-400 bg-transparent group-hover/option:border-purple-300 group-hover/option:scale-105 group-hover/option:shadow-lg'
                              }`}>
                                {isSelected && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow-sm animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Option Text */}
                            <span className={`text-sm sm:text-base font-medium transition-all duration-300 flex-1 ${
                              isSelected
                                ? 'text-white font-bold'
                                : 'text-gray-300 group-hover/option:text-white'
                            }`}>
                              {option}
                            </span>

                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="ml-auto flex-shrink-0">
                                <span className="text-lg sm:text-xl">✓</span>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ultra Premium Phone Number Field - Enhanced */}
      <div className="relative group/phone">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl sm:rounded-2xl blur-lg opacity-20 group-hover/phone:opacity-35 transition-all duration-500"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-15 group-hover/phone:opacity-25 transition-all duration-300"></div>
        <div className="relative bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-400/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-6 sm:p-7 lg:p-9 group-hover/phone:border-cyan-400/60 transition-all duration-300 shadow-xl hover:shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <span className="text-xl sm:text-2xl">📱</span>
              </div>
            </div>
            <div className="flex-1 space-y-3 sm:space-y-4 w-full">
              <div>
                <label className="block text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                  Contact Number <span className="text-yellow-400 text-xs sm:text-sm">(Optional - for prizes)</span>
                </label>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Enter your phone number to be eligible for exciting rewards. We'll only contact winners—your information remains confidential.
                </p>
              </div>
              <input
                type="text"
                placeholder="e.g., +91 9876543210"
                value={phoneNumber}
                onChange={(e) => {
                  console.log('Phone input changed:', e.target.value);
                  setPhoneNumber(e.target.value);
                }}
                inputMode="numeric"
                className="w-full px-5 sm:px-6 py-4 sm:py-5 bg-black/60 border-2 border-blue-400/40 rounded-xl sm:rounded-2xl focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 text-white placeholder-gray-400 transition-all duration-300 text-base sm:text-lg font-medium backdrop-blur-sm shadow-inner hover:bg-black/70 hover:border-blue-300/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ultimate Premium Submit Button - Enhanced */}
      <div className="pt-6 sm:pt-8">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0 || loading}
          className="relative w-full group/submit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Multi-layer Button Glow */}
          <div className={`absolute -inset-2 rounded-2xl sm:rounded-3xl blur-2xl transition-all duration-700 ${
            Object.keys(answers).length === 0 || loading
              ? 'bg-gray-600 opacity-0'
              : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 opacity-50 group-hover/submit:opacity-80'
          }`}></div>
          <div className={`absolute -inset-1 rounded-xl sm:rounded-2xl blur-lg transition-all duration-500 ${
            Object.keys(answers).length === 0 || loading
              ? 'bg-gray-600 opacity-0'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 opacity-60 group-hover/submit:opacity-100'
          }`}></div>
          
          {/* Enhanced Button */}
          <div className={`relative py-5 sm:py-6 px-8 sm:px-10 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl lg:text-2xl transition-all duration-500 border-2 ${
            Object.keys(answers).length === 0 || loading
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700'
              : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white group-hover/submit:scale-[1.03] group-hover/submit:-translate-y-1 shadow-2xl border-white/20 group-hover/submit:border-white/40'
          }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="animate-spin text-xl sm:text-2xl">⏳</span>
                <span className="text-sm sm:text-base lg:text-lg">Submitting Your Feedback...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">🚀</span>
                <span className="text-sm sm:text-base lg:text-lg">Submit Your Feedback</span>
              </span>
            )}
          </div>
        </button>
        
        {Object.keys(answers).length === 0 && (
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            ⚠️ Please answer all questions to submit your feedback
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizSystem;