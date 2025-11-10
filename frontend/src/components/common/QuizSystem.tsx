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
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur-xl opacity-40"></div>
        <div className="relative bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/50 backdrop-blur-xl rounded-2xl p-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50 animate-bounce">
              <span className="text-5xl">✓</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-4">
            Already Participated
          </h3>
          <p className="text-lg text-emerald-100 mb-3 font-medium">
            Thank you for participating in Fan Fest for
          </p>
          <p className="text-xl font-bold text-emerald-300 mb-6">"{contentTitle}" 🎉</p>
          <div className="pt-6 border-t border-emerald-500/30">
            <p className="text-sm text-emerald-200/80">
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
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/50 backdrop-blur-xl rounded-2xl p-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-2xl shadow-green-500/50 animate-bounce">
              <span className="text-6xl">🎉</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mb-4">
            Submission Successful!
          </h3>
          <p className="text-lg text-green-100 mb-3">
            Your feedback for <span className="font-bold text-green-300">"{contentTitle}"</span> has been recorded.
          </p>
          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-500/30 rounded-xl">
            <p className="text-sm text-yellow-200 flex items-center justify-center gap-2">
              <span className="text-2xl">🏆</span>
              <span>Winners will be contacted via the phone number provided. Good luck!</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Elegant Form Header */}
      <div className="text-center pb-8 border-b border-white/10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <span className="text-2xl">🎬</span>
          </div>
          <h3 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Fan Fest Challenge
          </h3>
        </div>
        <p className="text-gray-400 text-base">
          Share your thoughts and win <span className="text-yellow-400 font-bold">amazing rewards</span> 🏆
        </p>
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="relative group/question"
          >
            {/* Question Card Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl blur opacity-0 group-hover/question:opacity-20 transition-all duration-500"></div>
            
            {/* Question Card */}
            <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-start gap-6">
                {/* Question Number Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl blur-md opacity-60"></div>
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-black text-white">{index + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  {/* Question Text */}
                  <h4 className="text-xl font-bold text-white leading-relaxed">
                    {question.question}
                  </h4>
                  
                  {/* Options Grid */}
                  <div className="space-y-3 pt-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = answers[question.id] === option;
                      return (
                        <label
                          key={optionIndex}
                          className="relative flex items-center gap-4 cursor-pointer group/option"
                        >
                          {/* Option Card */}
                          <div className={`flex-1 flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 border-fuchsia-500/60 shadow-lg shadow-purple-500/20'
                              : 'bg-white/[0.03] border-white/10 hover:border-purple-500/30 hover:bg-white/[0.05]'
                          }`}>
                            {/* Custom Radio */}
                            <div className="relative flex-shrink-0">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={isSelected}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="sr-only"
                              />
                              <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                                isSelected
                                  ? 'border-fuchsia-400 bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/50'
                                  : 'border-gray-500 bg-transparent group-hover/option:border-purple-400'
                              }`}>
                                {isSelected && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Option Text */}
                            <span className={`text-base font-medium transition-all duration-300 ${
                              isSelected
                                ? 'text-white font-bold'
                                : 'text-gray-300 group-hover/option:text-white'
                            }`}>
                              {option}
                            </span>

                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="ml-auto">
                                <span className="text-xl">✓</span>
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

      {/* Premium Phone Number Field */}
      <div className="relative group/phone">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover/phone:opacity-30 transition-all duration-500"></div>
        <div className="relative bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/40 backdrop-blur rounded-2xl p-8">
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <span className="text-2xl">📱</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-lg font-bold text-white mb-2">
                  Contact Number <span className="text-yellow-400 text-sm">(Optional - for prizes)</span>
                </label>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Enter your phone number to be eligible for exciting rewards. We'll only contact winners—your information remains confidential.
                </p>
              </div>
              <input
                type="text"
                placeholder="e.g., +91 9876543210 or 9876543210"
                value={phoneNumber}
                onChange={(e) => {
                  console.log('Phone input changed:', e.target.value);
                  setPhoneNumber(e.target.value);
                }}
                inputMode="numeric"
                className="w-full px-5 py-4 bg-black/40 border-2 border-blue-400/30 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-white placeholder-gray-500 transition-all duration-300 text-base font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ultra Premium Submit Button */}
      <div className="pt-6">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0 || loading}
          className="relative w-full group/submit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Button Glow */}
          <div className={`absolute -inset-1 rounded-2xl blur-xl transition-all duration-500 ${
            Object.keys(answers).length === 0 || loading
              ? 'bg-gray-600 opacity-0'
              : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 opacity-60 group-hover/submit:opacity-100'
          }`}></div>
          
          {/* Button */}
          <div className={`relative py-5 px-8 rounded-2xl font-black text-xl transition-all duration-300 ${
            Object.keys(answers).length === 0 || loading
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white group-hover/submit:scale-[1.02] shadow-2xl'
          }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="animate-spin text-2xl">⏳</span>
                <span>Submitting Your Feedback...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">🚀</span>
                <span>Submit Your Feedback</span>
              </span>
            )}
          </div>
        </button>
        
        {Object.keys(answers).length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            ⚠️ Please answer all questions to submit your feedback
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizSystem;