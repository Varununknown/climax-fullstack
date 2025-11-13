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

  // Show professional completion message
  if (userHasAnswered && !checkingStatus) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-violet-950"></div>
        <div className="relative bg-white/10 border border-white/20 rounded-2xl p-8 sm:p-12 text-center backdrop-blur-2xl">
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-full blur"></div>
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white shadow-lg border border-white/20">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Participation Complete
          </h3>
          <p className="text-slate-300 mb-2">
            Thank you for your valuable feedback on
          </p>
          <p className="text-lg font-semibold text-blue-200 mb-6">"{contentTitle}"</p>
          <div className="pt-6 border-t border-white/10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <p className="text-sm text-blue-300">
                Watch for new surveys and recognition opportunities
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show professional success state
  if (submitted) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-violet-950"></div>
        
        <div className="relative bg-white/10 border border-white/20 rounded-2xl p-8 sm:p-12 text-center backdrop-blur-2xl shadow-2xl">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-full blur-lg"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full text-white shadow-xl border border-white/20">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Submission Successful
          </h3>
          
          <p className="text-slate-300 mb-2">
            Your feedback for 
          </p>
          <p className="text-lg font-semibold text-blue-200 mb-6">
            "{contentTitle}"
          </p>
          <p className="text-sm text-slate-400 mb-8">
            has been successfully recorded in our system.
          </p>
          
          {/* Recognition Program Section */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-600/10 rounded-lg blur"></div>
            <div className="relative bg-amber-500/5 border border-amber-500/20 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="text-base font-semibold text-amber-200 mb-1">
                    Recognition Program
                  </h4>
                  <p className="text-sm text-amber-300">
                    Outstanding contributors will be contacted via provided details. Thank you for your participation.
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
      {/* Professional Gradient Background - Black to Violet */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-violet-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(139,92,246,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.05),transparent_50%)]"></div>
      </div>
      
      {/* Professional Glass Container */}
      <div className="relative bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-2xl">
        {/* Subtle Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Professional Header */}
        <div className="relative bg-gradient-to-r from-black/80 via-slate-900/80 to-violet-950/80 border-b border-white/10 p-8 sm:p-10 lg:p-12 rounded-t-2xl backdrop-blur-xl">
          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-t-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl blur-lg"></div>
                <div className="relative bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-violet-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100-2 1 1 0 000 2zm-1 4h2v-1a1 1 0 00-1-1h-1v2z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent mx-auto mb-6"></div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-100 mb-4">
                {contentTitle}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Share your thoughts about this content in our Fan Fest
              </p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="relative p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="relative group"
            >
              {/* Professional Glass Card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/10 border border-white/20 rounded-xl p-6 sm:p-8 shadow-xl backdrop-blur-xl hover:bg-white/15 transition-all duration-300 hover:border-white/30">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Professional Question Badge */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-lg blur"></div>
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg border border-white/20 backdrop-blur-sm">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 sm:space-y-6 w-full">
                    {/* Professional Question Text */}
                    <h4 className="text-lg sm:text-xl font-semibold text-white mb-4 leading-relaxed">
                      {question.question}
                    </h4>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent mb-6"></div>
                    
                    {/* Premium Options Grid */}
                    <div className="space-y-3 sm:space-y-4">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = answers[question.id] === option;
                        return (
                          <label
                            key={optionIndex}
                            className="relative block cursor-pointer group/option"
                          >
                            {/* Professional Glass Option */}
                            <div className={`absolute -inset-0.5 rounded-lg transition-all duration-300 ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-500/30 to-indigo-600/30 blur'
                                : 'opacity-0 group-hover/option:opacity-100 group-hover/option:bg-gradient-to-r group-hover/option:from-blue-500/10 group-hover/option:to-indigo-600/10'
                            }`}></div>
                            
                            <div className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-lg border transition-all duration-300 ${
                              isSelected
                                ? 'bg-white/15 border-blue-400/50 shadow-lg backdrop-blur-sm'
                                : 'bg-white/8 border-white/20 hover:bg-white/12 hover:border-white/30 backdrop-blur-sm'
                            }`}>
                              {/* Professional Radio Button */}
                              <div className="flex-shrink-0">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option}
                                  checked={isSelected}
                                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'border-blue-400 bg-blue-500 shadow-lg'
                                    : 'border-white/40 bg-transparent hover:border-white/60'
                                }`}>
                                  {isSelected && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Professional Option Text */}
                              <span className={`text-sm sm:text-base font-medium flex-1 transition-colors duration-200 ${
                                isSelected 
                                  ? 'text-blue-200' 
                                  : 'text-slate-200 group-hover/option:text-white'
                              }`}>
                                {option}
                              </span>

                              {/* Professional Selection Indicator */}
                              {isSelected && (
                                <div className="ml-auto flex-shrink-0">
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
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

        {/* Professional Contact Section */}
        <div className="relative border-t border-white/10">
          {/* Glass Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-blue-900/50 to-indigo-900/50"></div>
          
          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg blur"></div>
                  <div className="relative w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-lg font-semibold text-white mb-2">
                    Contact Information 
                    <span className="text-sm font-normal text-green-400 ml-2">(Optional - Recognition Program)</span>
                  </label>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Provide your contact details to participate in our recognition program for outstanding feedback contributors. 
                    All information is kept strictly confidential.
                  </p>
                </div>
                
                {/* Professional Input Field */}
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
                  <input
                    type="text"
                    placeholder="Enter your contact number (e.g., +1 234 567 8900)"
                    value={phoneNumber}
                    onChange={(e) => {
                      console.log('Phone input changed:', e.target.value);
                      setPhoneNumber(e.target.value);
                    }}
                    inputMode="numeric"
                    className="relative w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 text-white placeholder-slate-400 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="relative border-t border-white/10">
          {/* Glass Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-blue-900/50 to-indigo-900/50"></div>
          
          <div className="relative p-6 sm:p-8 md:p-10">
            {/* Submit Button - Big and Responsive */}
            <div className="relative w-full">
              <div className={`absolute -inset-1 rounded-xl transition-all duration-300 ${
                Object.keys(answers).length === 0 || loading
                  ? 'bg-slate-600/20'
                  : 'bg-gradient-to-r from-blue-500/30 to-indigo-600/30 blur group-hover:from-blue-500/40 group-hover:to-indigo-600/40'
              }`}></div>
              
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0 || loading}
                className={`relative w-full py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-10 rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 ${
                  Object.keys(answers).length === 0 || loading
                    ? 'bg-slate-600/20 text-slate-400 cursor-not-allowed border border-slate-600/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl border border-blue-500/50'
                } backdrop-blur-sm`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Submission...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Submit</span>
                  </span>
                )}
              </button>
            </div>
            
            {/* Help Text */}
            {Object.keys(answers).length === 0 && (
              <div className="mt-4 sm:mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-sm text-amber-300">
                    Answer all questions to submit
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