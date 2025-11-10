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
    <div className="relative overflow-hidden min-h-screen">
      {/* Stunning Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.3),transparent_50%)] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(236,72,153,0.2),transparent_50%)] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Premium Container with Stunning Effects */}
      <div className="relative bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-50/95 border-2 border-white/30 rounded-3xl shadow-2xl shadow-indigo-500/25 backdrop-blur-xl">
        {/* Magical Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70 animate-shimmer rounded-3xl"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
        
        {/* Spectacular Header */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 border-b border-white/20 p-6 sm:p-8 lg:p-12 rounded-t-3xl overflow-hidden">
          {/* Animated Header Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-pink-600/20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.3),transparent_70%)] animate-pulse"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-full p-5 shadow-2xl shadow-purple-500/50 transform hover:scale-110 transition-transform duration-300 group-hover:shadow-purple-500/70">
                  <span className="text-3xl">🎪</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 mb-2 animate-pulse tracking-wider">
                ✨ ULTIMATE FAN FEST ✨
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mx-auto rounded-full mb-6 animate-pulse"></div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 mb-4 animate-shimmer">
                {contentTitle}
              </h3>
              <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed opacity-90">
                🌟 Experience the most exclusive feedback collection system! Participate in premium content evaluation and unlock extraordinary rewards! 🏆
              </p>
            </div>
          </div>
        </div>

        {/* Premium Questions Section */}
        <div className="relative p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="relative group animate-fadeInUp"
              style={{animationDelay: `${index * 0.3}s`}}
            >
              {/* Spectacular Question Card */}
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 transition-all duration-700 blur-2xl animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-2xl opacity-30 group-hover:opacity-60 transition-all duration-500 blur-lg"></div>
              <div className="relative bg-gradient-to-br from-white/98 via-blue-50/95 to-indigo-50/98 border-2 border-white/60 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl hover:shadow-purple-500/30 transition-all duration-700 transform hover:scale-[1.03] hover:-translate-y-3 backdrop-blur-2xl group-hover:bg-gradient-to-br group-hover:from-blue-50/98 group-hover:via-indigo-50/95 group-hover:to-purple-50/98">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Spectacular Question Number Badge */}
                  <div className="flex-shrink-0">
                    <div className="relative group/badge">
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-lg opacity-40 group-hover/badge:opacity-70 transition-opacity duration-500 animate-pulse"></div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-xl blur opacity-60 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-2xl shadow-purple-500/50 transform group-hover/badge:scale-110 group-hover/badge:rotate-12 transition-all duration-500 border-2 border-white/30">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-100">{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 sm:space-y-6 w-full">
                    {/* Spectacular Question Text */}
                    <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 leading-relaxed mb-2 animate-shimmer">
                      ✨ {question.question}
                    </h4>
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full mb-4 animate-pulse"></div>
                    
                    {/* Premium Options Grid */}
                    <div className="space-y-3 sm:space-y-4">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = answers[question.id] === option;
                        return (
                          <label
                            key={optionIndex}
                            className="relative block cursor-pointer group/option"
                          >
                            {/* Magnificent Option Card */}
                            <div className={`absolute -inset-1 rounded-2xl transition-all duration-500 ${
                              isSelected
                                ? 'bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 blur-lg animate-pulse'
                                : 'bg-gradient-to-r from-slate-200 to-slate-400 opacity-0 group-hover/option:opacity-60 group-hover/option:blur-md'
                            }`}></div>
                            
                            <div className={`relative flex items-center gap-4 sm:gap-6 p-5 sm:p-6 lg:p-7 rounded-2xl border-2 transition-all duration-500 transform group-hover/option:scale-[1.02] ${
                              isSelected
                                ? 'bg-gradient-to-br from-emerald-50/90 via-blue-50/90 to-purple-50/90 border-white/70 shadow-2xl shadow-blue-500/30 scale-[1.02]'
                                : 'bg-white/90 border-white/50 hover:bg-blue-50/80 hover:border-blue-200/70 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20'
                            } backdrop-blur-xl`}>
                              {/* Spectacular Radio Button */}
                              <div className="flex-shrink-0">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option}
                                  checked={isSelected}
                                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                  className="sr-only"
                                />
                                <div className="relative">
                                  <div className={`absolute -inset-1 rounded-full transition-all duration-500 ${
                                    isSelected 
                                      ? 'bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 blur-md animate-pulse' 
                                      : 'opacity-0 group-hover/option:opacity-50 group-hover/option:bg-gradient-to-r group-hover/option:from-blue-300 group-hover/option:to-purple-400 group-hover/option:blur-sm'
                                  }`}></div>
                                  <div className={`relative w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full border-3 transition-all duration-500 transform ${
                                    isSelected
                                      ? 'border-white bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700 shadow-2xl shadow-blue-500/50 scale-110'
                                      : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50 shadow-lg hover:shadow-xl hover:scale-105'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-white rounded-full shadow-md animate-pulse"></div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Spectacular Option Text */}
                              <span className={`text-base sm:text-lg lg:text-xl font-bold flex-1 transition-all duration-500 ${
                                isSelected 
                                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-blue-800 to-purple-800 animate-pulse' 
                                  : 'text-slate-800 group-hover/option:text-transparent group-hover/option:bg-clip-text group-hover/option:bg-gradient-to-r group-hover/option:from-blue-700 group-hover/option:to-purple-700'
                              }`}>
                                {isSelected ? '✨ ' : ''}
                                {option}
                                {isSelected ? ' ✨' : ''}
                              </span>

                              {/* Spectacular Selection Indicator */}
                              {isSelected && (
                                <div className="ml-auto flex-shrink-0 animate-bounce">
                                  <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full blur-lg animate-pulse"></div>
                                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 transform rotate-12">
                                      <span className="text-white text-lg font-black">✓</span>
                                    </div>
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

        {/* Spectacular Phone Number Section */}
        <div className="relative border-t-2 border-white/40">
          {/* Magical Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-500/15 to-cyan-600/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          
          <div className="relative p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
              <div className="flex-shrink-0">
                <div className="relative group/phone">
                  <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl blur-2xl opacity-40 group-hover/phone:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 transform group-hover/phone:scale-110 group-hover/phone:rotate-12 transition-all duration-500 border-2 border-white/30">
                    <span className="text-2xl animate-bounce">📞</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-6 w-full">
                <div>
                  <label className="block text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 mb-4 animate-shimmer">
                    🌟 Ultimate Contact Details 
                    <span className="text-base font-bold text-emerald-600 ml-3 animate-pulse">(🎁 Exclusive VIP Rewards)</span>
                  </label>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                    🚀 Join our exclusive VIP community! Provide your contact information to unlock premium rewards, early access, and spectacular prizes. 
                    We maintain the highest confidentiality standards and contact only verified winners! ✨
                  </p>
                </div>
                
                {/* Spectacular Input Field */}
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-700 blur-xl animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-300 via-blue-400 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-50 transition-all duration-500 blur-lg"></div>
                  <input
                    type="text"
                    placeholder="🎯 Enter your VIP contact number (e.g., +91 9876543210) 🏆"
                    value={phoneNumber}
                    onChange={(e) => {
                      console.log('Phone input changed:', e.target.value);
                      setPhoneNumber(e.target.value);
                    }}
                    inputMode="numeric"
                    className="relative w-full px-6 sm:px-8 py-5 sm:py-6 lg:py-7 bg-white/95 border-2 border-emerald-200/60 rounded-xl focus:outline-none focus:border-transparent focus:ring-4 focus:ring-emerald-500/30 text-slate-900 placeholder-slate-600 text-base sm:text-lg lg:text-xl font-medium transition-all duration-700 shadow-xl focus:shadow-2xl focus:shadow-emerald-500/30 backdrop-blur-xl transform focus:scale-[1.02] hover:shadow-lg"
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
            {/* Spectacular Submit Button */}
            <div className="relative group">
              <div className={`absolute -inset-2 rounded-2xl transition-all duration-700 ${
                Object.keys(answers).length === 0 || loading
                  ? 'bg-gradient-to-r from-slate-300 to-slate-400 opacity-30'
                  : 'bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 opacity-60 group-hover:opacity-90 blur-xl animate-pulse'
              }`}></div>
              <div className={`absolute -inset-1 rounded-2xl transition-all duration-500 ${
                Object.keys(answers).length === 0 || loading
                  ? 'opacity-0'
                  : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-20 group-hover:opacity-40 blur-lg animate-pulse'
              }`} style={{animationDelay: '0.5s'}}></div>
              
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0 || loading}
                className={`relative w-full py-5 sm:py-6 lg:py-7 px-8 sm:px-10 lg:px-12 rounded-2xl font-black text-lg sm:text-xl lg:text-2xl transition-all duration-700 transform ${
                  Object.keys(answers).length === 0 || loading
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-700 text-white hover:from-emerald-600 hover:via-blue-700 hover:to-purple-800 shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.05] active:scale-[0.95] border-2 border-white/30'
                } backdrop-blur-xl`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-6 h-6 border-3 border-transparent border-t-yellow-300 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                    </div>
                    <span className="animate-pulse">🚀 Processing Ultimate Submission...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur animate-pulse"></div>
                      <div className="relative w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40">
                        <span className="text-white font-black text-lg">✓</span>
                      </div>
                    </div>
                    <span className="animate-shimmer">🎯 Submit Ultimate Feedback 🏆</span>
                  </span>
                )}
              </button>
            </div>
            
            {/* Spectacular Help Text */}
            {Object.keys(answers).length === 0 && (
              <div className="mt-6 sm:mt-8 text-center animate-bounce">
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-2xl blur opacity-40 animate-pulse"></div>
                  <div className="relative inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-amber-300/60 rounded-2xl shadow-xl backdrop-blur-sm">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur animate-pulse"></div>
                      <span className="relative text-2xl animate-bounce">🎯</span>
                    </div>
                    <p className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-700 to-red-700">
                      ✨ Complete all questions to unlock ultimate submission! ✨
                    </p>
                  </div>
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