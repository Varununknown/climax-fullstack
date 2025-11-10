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
  const [quizHash, setQuizHash] = useState<string>('');
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [phoneNumber, setPhoneNumber] = useState<string>('');
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
        setQuizHash(response.data.quizHash);
        console.log('Quiz loaded with hash:', response.data.quizHash);
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
        console.log('User answered check - hasResponded:', response.data.hasResponded);
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
        quizHash: quizHash,
        userName: user?.name || 'Anonymous',
        phoneNumber: phoneNumber
      });
      
      if (response.data.success) {
        setSubmitted(true);
        setUserHasAnswered(true);
      } else if (response.data.alreadyAnswered) {
        setUserHasAnswered(true);
        setSubmitted(true);
      }
    } catch (error) {
      setSubmitted(true);
      setUserHasAnswered(true);
    }
    
    setLoading(false);
  };

  // Show premium already answered message
  if (userHasAnswered && !checkingStatus) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"></div>
        <div className="relative bg-white/60 border border-emerald-200/60 rounded-2xl p-8 sm:p-12 text-center backdrop-blur-sm shadow-xl">
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-lg opacity-40"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full text-white shadow-xl">
                <span className="text-3xl">✓</span>
              </div>
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 mb-4">
            Premium Participation Complete
          </h3>
          <p className="text-emerald-700 mb-2 text-lg">
            Thank you for your valuable premium feedback on
          </p>
          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-600 mb-6">"{contentTitle}"</p>
          <div className="pt-6 border-t border-emerald-200/60">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-300/50 rounded-xl">
              <span className="text-2xl">🏆</span>
              <p className="text-sm sm:text-base text-emerald-700 font-medium">
                Stay tuned for new premium surveys and exclusive rewards!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show premium success state
  if (submitted) {
    return (
      <div className="relative overflow-hidden">
        {/* Premium Success Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        
        <div className="relative bg-white/70 border border-emerald-200/60 rounded-2xl p-8 sm:p-12 lg:p-16 text-center backdrop-blur-sm shadow-2xl">
          {/* Premium Success Icon */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-full text-white shadow-2xl">
                <span className="text-4xl sm:text-5xl">✓</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 mb-6">
            Premium Submission Complete!
          </h3>
          
          <p className="text-lg sm:text-xl text-slate-700 mb-4 leading-relaxed">
            Your premium feedback for 
          </p>
          <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 mb-8">
            "{contentTitle}"
          </p>
          <p className="text-base sm:text-lg text-slate-600 mb-8">
            has been successfully recorded in our premium collection system.
          </p>
          
          {/* Premium Rewards Section */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-xl blur opacity-20"></div>
            <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-200/60 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700 mb-2">
                    Exclusive Rewards Program
                  </h4>
                  <p className="text-sm sm:text-base text-amber-700 leading-relaxed">
                    Premium participants will be contacted via the provided contact details. 
                    <br className="hidden sm:block" />
                    Thank you for joining our exclusive feedback community!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Premium Container with Elegant Gradients */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 backdrop-blur-sm">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50"></div>
        
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-300/20 p-6 sm:p-8 lg:p-10">
          {/* Header Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-blue-600/5 to-purple-600/10 rounded-t-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-4 shadow-lg">
                  <span className="text-2xl text-white">📋</span>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-100 text-center mb-4">
              Premium Fan Fest
            </h2>
            
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-3">
                {contentTitle}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Experience our exclusive feedback collection system. Participate in premium content evaluation and earn exclusive rewards.
              </p>
            </div>
          </div>
        </div>

        {/* Premium Questions Section */}
        <div className="relative p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="relative group"
            >
              {/* Question Card with Premium Styling */}
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 via-blue-200 to-indigo-200 rounded-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 blur-sm"></div>
              <div className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50/30 border border-slate-200/60 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Premium Question Number Badge */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur opacity-50"></div>
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 sm:space-y-6 w-full">
                    {/* Premium Question Text */}
                    <h4 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 leading-relaxed">
                      {question.question}
                    </h4>
                    
                    {/* Premium Options Grid */}
                    <div className="space-y-3 sm:space-y-4">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = answers[question.id] === option;
                        return (
                          <label
                            key={optionIndex}
                            className="relative block cursor-pointer group/option"
                          >
                            {/* Option Card with Gradient Border */}
                            <div className={`absolute -inset-0.5 rounded-lg transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 blur-sm'
                                : 'bg-gradient-to-r from-slate-200 to-slate-300 opacity-0 group-hover/option:opacity-50 blur-sm'
                            }`}></div>
                            
                            <div className={`relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg border transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-transparent shadow-lg'
                                : 'bg-white/80 border-slate-200 hover:bg-slate-50/80 hover:border-slate-300 shadow-md hover:shadow-lg'
                            } backdrop-blur-sm`}>
                              {/* Premium Radio Button */}
                              <div className="flex-shrink-0">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option}
                                  checked={isSelected}
                                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-300 ${
                                  isSelected
                                    ? 'border-indigo-500 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
                                    : 'border-slate-300 hover:border-slate-400 bg-white'
                                }`}>
                                  {isSelected && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Premium Option Text */}
                              <span className={`text-sm sm:text-base font-medium flex-1 transition-colors duration-300 ${
                                isSelected 
                                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700' 
                                  : 'text-slate-700 group-hover/option:text-slate-900'
                              }`}>
                                {option}
                              </span>

                              {/* Premium Selection Indicator */}
                              {isSelected && (
                                <div className="ml-auto flex-shrink-0">
                                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold">✓</span>
                                  </div>
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

        {/* Premium Phone Number Section */}
        <div className="relative border-t border-slate-200/60">
          {/* Premium Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50"></div>
          
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg blur opacity-40"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-xl text-white">📞</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 mb-3">
                    Premium Contact Details 
                    <span className="text-sm font-medium text-emerald-600 ml-2">(Optional - Exclusive Rewards)</span>
                  </label>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Provide your contact information to unlock exclusive rewards and premium prizes. We maintain strict confidentiality and contact only verified winners.
                  </p>
                </div>
                
                {/* Premium Input Field */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <input
                    type="text"
                    placeholder="Enter your premium contact number (e.g., +91 9876543210)"
                    value={phoneNumber}
                    onChange={(e) => {
                      console.log('Phone input changed:', e.target.value);
                      setPhoneNumber(e.target.value);
                    }}
                    inputMode="numeric"
                    className="relative w-full px-4 sm:px-6 py-4 sm:py-5 bg-white/90 border border-slate-200 rounded-lg focus:outline-none focus:border-transparent focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-500 text-sm sm:text-base transition-all duration-300 shadow-md focus:shadow-lg backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Submit Section */}
        <div className="relative border-t border-slate-200/60">
          {/* Premium Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50"></div>
          
          <div className="relative p-6 sm:p-8 lg:p-10">
            {/* Premium Submit Button */}
            <div className="relative group">
              <div className={`absolute -inset-1 rounded-xl transition-all duration-300 ${
                Object.keys(answers).length === 0 || loading
                  ? 'bg-gradient-to-r from-slate-200 to-slate-300 opacity-50'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 opacity-70 group-hover:opacity-100 blur-sm'
              }`}></div>
              
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0 || loading}
                className={`relative w-full py-4 sm:py-5 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 ${
                  Object.keys(answers).length === 0 || loading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                } backdrop-blur-sm`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Premium Submission...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <span>Submit Premium Feedback</span>
                  </span>
                )}
              </button>
            </div>
            
            {/* Premium Help Text */}
            {Object.keys(answers).length === 0 && (
              <div className="mt-4 sm:mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-lg">
                  <span className="text-amber-500 text-sm">💡</span>
                  <p className="text-sm text-amber-700 font-medium">
                    Complete all questions to unlock premium submission
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSystem;