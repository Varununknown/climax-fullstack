import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface Content {
  _id: string;
  title: string;
  thumbnail: string;
  festPaymentEnabled?: boolean;
  festParticipationFee?: number;
  premiumPrice?: number;
  sponsorName?: string;
  sponsorLogoUrl?: string;
  prizeAmount?: number;
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
  
  // Fest payment states
  const [content, setContent] = useState<Content | null>(null);
  const [festPaymentEnabled, setFestPaymentEnabled] = useState(false);
  const [festParticipationFee, setFestParticipationFee] = useState(0);
  const [userHasPaidForFest, setUserHasPaidForFest] = useState(false);
  const [showFestPaymentModal, setShowFestPaymentModal] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [festTransactionId, setFestTransactionId] = useState<string>('');  // NEW: Store fest transaction ID
  
  // Sponsor states
  const [sponsorName, setSponsorName] = useState<string>('');
  const [sponsorLogoUrl, setSponsorLogoUrl] = useState<string>('');
  const [prizeAmount, setPrizeAmount] = useState<number>(0);

  useEffect(() => {
    loadContent();
    loadQuiz();
    checkIfUserAnswered();
  }, [contentId, user]);

  const loadContent = async () => {
    try {
      const response = await API.get(`/contents/${contentId}`);
      if (response.data) {
        setContent(response.data);
        const isFestPaymentEnabled = response.data.festPaymentEnabled || false;
        const feeAmount = response.data.festParticipationFee || 0;
        
        console.log('📥 Content loaded:', {
          contentId,
          festPaymentEnabled: isFestPaymentEnabled,
          festParticipationFee: feeAmount,
          userId: user?.id
        });
        
        setFestPaymentEnabled(isFestPaymentEnabled);
        setFestParticipationFee(feeAmount);
        
        // ✅ Set sponsor info
        setSponsorName(response.data.sponsorName || '');
        setSponsorLogoUrl(response.data.sponsorLogoUrl || '');
        setPrizeAmount(response.data.prizeAmount || 0);
        
        // ✅ Check if user has paid for this fest (AFTER setting the state)
        if (isFestPaymentEnabled && user?.id) {
          checkFestPayment(isFestPaymentEnabled);
        }
      }
    } catch (error) {
      console.log('Could not load content');
    } finally {
      setContentLoading(false);
    }
  };

  const checkFestPayment = async (isFestPaymentEnabled: boolean) => {
    if (!user?.id || !isFestPaymentEnabled) return;
    try {
      console.log('🔍 Checking fest payment for:', { contentId, userId: user.id });
      const response = await API.get(`/quiz-system/fest-payment/check/${contentId}/${user.id}`);
      if (response.data.success) {
        const hasPaid = response.data.hasPaid || false;
        console.log('💳 Payment check result:', { hasPaid, isFestPaymentEnabled });
        setUserHasPaidForFest(hasPaid);
        // ✅ DO NOT auto-open modal - user will click payment button
      }
    } catch (error) {
      console.log('Could not check fest payment status:', error);
    }
  };

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
        phoneNumber: phoneNumber,
        festTransactionId: festTransactionId || undefined  // NEW: Pass transaction ID if user paid for fest
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
        <div className="relative bg-white/5 border border-white/20 rounded-2xl p-8 sm:p-12 text-center shadow-xl">
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
        
        <div className="relative bg-white/5 border border-white/20 rounded-2xl p-8 sm:p-12 text-center shadow-xl">
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
            <div className="relative bg-amber-500/5 border border-amber-500/20 rounded-lg p-6">
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
      <div className="relative bg-white/5 border border-white/20 rounded-2xl shadow-xl">
        {/* Compact Title - Only if no sponsor */}
        {!sponsorName && (
          <div className="relative bg-slate-900/40 border-b border-slate-700/50 p-4 sm:p-5">
            <h3 className="text-center text-base sm:text-lg font-semibold text-slate-100">{contentTitle}</h3>
          </div>
        )}

        {/* Sponsor Section - Direct at top */}
        {sponsorName && (
          <div className="relative mx-2 sm:mx-6 lg:mx-10 mt-6 sm:mt-8 mb-8 sm:mb-10">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-purple-900/30 to-slate-900/40 rounded-2xl blur-xl opacity-50"></div>
            
            {/* Main Container */}
            <div className="relative bg-gradient-to-br from-slate-800/80 via-purple-900/50 to-slate-800/80 border border-purple-500/40 rounded-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10">
                {/* Left: Sponsor Logo and Info */}
                <div className="flex items-center gap-6 sm:gap-8 flex-1">
                  {sponsorLogoUrl && (
                    <div className="flex-shrink-0 bg-gradient-to-br from-white/10 to-white/5 p-5 sm:p-6 rounded-xl border border-purple-400/30 backdrop-blur-sm">
                      <img 
                        src={sponsorLogoUrl} 
                        alt={sponsorName}
                        className="h-24 sm:h-32 w-auto object-contain drop-shadow-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-purple-300 uppercase tracking-widest mb-2">Presented by</p>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-lg">{sponsorName}</h3>
                  </div>
                </div>
                
                {/* Right: Prize Box - Wide */}
                {prizeAmount > 0 && (
                  <div className="w-full sm:w-72 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-xl px-6 py-3 sm:px-8 sm:py-4 shadow-xl border border-yellow-300/50 transform hover:scale-102 transition-transform duration-300">
                    <div className="text-center">
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-0.5">🏆 Win Prize</p>
                      <p className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg mb-0.5">₹{prizeAmount.toLocaleString()}</p>
                      <p className="text-xs font-semibold text-amber-900">Your Reward</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Payment Banner - Show if fest is paid but user hasn't paid */}
        {festPaymentEnabled && !userHasPaidForFest && (
          <div className="relative mx-2 sm:mx-6 lg:mx-10 mb-6 sm:mb-8 bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Title and Description */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-amber-100 mb-2 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🎉</span>
                  Paid Fan Fest Participation
                </h3>
                <p className="text-xs sm:text-sm text-amber-200">
                  This is an exclusive paid fan fest. To participate and answer questions, please complete the payment below.
                </p>
              </div>
              
              {/* Fee and Button on same line */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-base sm:text-lg font-bold text-amber-300">
                  Participation Fee: <span className="text-lg sm:text-2xl text-amber-100">₹{festParticipationFee}</span>
                </div>
                <button
                  onClick={() => setShowFestPaymentModal(true)}
                  className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm sm:text-base font-bold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl whitespace-nowrap"
                >
                  💳 Pay Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions Section */}
        <div className="relative p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="relative"
            >
              <div className="relative bg-slate-800/40 border border-slate-700/60 rounded-lg p-6 sm:p-7 backdrop-blur-sm hover:border-slate-700/80 transition-all duration-200">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Question Number Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-md flex items-center justify-center font-bold text-lg shadow-md">
                      {index + 1}
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
                        const isDisabled = festPaymentEnabled && !userHasPaidForFest;
                        return (
                          <label
                            key={optionIndex}
                            className={`relative block ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} group/option`}
                          >
                            <div className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-lg border-2 transition-all duration-150 ${
                              isDisabled
                                ? 'bg-slate-700/30 border-slate-700/30'
                                : isSelected
                                ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500 shadow-md'
                                : 'bg-slate-800/20 border-slate-700/50 group-hover/option:bg-gradient-to-r group-hover/option:from-blue-500/15 group-hover/option:to-indigo-500/15 group-hover/option:border-blue-400/60'
                            }`}>
                              {/* Professional Radio Button */}
                              <div className="flex-shrink-0">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option}
                                  checked={isSelected}
                                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                  disabled={isDisabled}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                                  isDisabled
                                    ? 'border-slate-600/50 bg-slate-700/20'
                                    : isSelected
                                    ? 'border-blue-400 bg-blue-500 shadow-lg'
                                    : 'border-white/40 bg-transparent hover:border-white/60'
                                }`}>
                                  {isSelected && !isDisabled && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Professional Option Text */}
                              <span className={`text-sm sm:text-base font-medium flex-1 transition-colors duration-200 ${
                                isDisabled
                                  ? 'text-slate-500'
                                  : isSelected 
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
          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg blur"></div>
                  <div className="relative w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
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
                  <input
                    type="text"
                    placeholder="Enter your contact number (e.g., +1 234 567 8900)"
                    value={phoneNumber}
                    onChange={(e) => {
                      console.log('Phone input changed:', e.target.value);
                      setPhoneNumber(e.target.value);
                    }}
                    inputMode="numeric"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 text-white placeholder-slate-400 transition-all duration-150"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="relative border-t border-slate-700/50">
          <div className="relative p-6 sm:p-8 md:p-10">
            {/* Submit Button */}
            <div className="relative w-full">
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0 || loading}
                className={`relative w-full py-3 sm:py-4 md:py-5 px-6 sm:px-8 rounded-lg font-bold text-base sm:text-lg transition-all duration-150 ${
                  Object.keys(answers).length === 0 || loading
                    ? 'bg-slate-700/40 text-slate-400 cursor-not-allowed border border-slate-700/50'
                    : 'bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white hover:from-purple-500 hover:via-blue-500 hover:to-pink-500 shadow-lg hover:shadow-xl border border-purple-400/50'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
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

      {/* Fest Payment Modal */}
      {(() => {
        if (showFestPaymentModal && content) {
          console.log('🎬 Rendering fest payment modal for:', content?.title, 'Fee:', festParticipationFee);
        }
        return showFestPaymentModal && content ? (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">🎉 Paid Fan Fest</h3>
                <button
                  onClick={() => setShowFestPaymentModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-300 mb-6">
                This is a paid fan fest. Complete the payment of <span className="font-bold text-blue-400">₹{festParticipationFee}</span> to answer questions.
              </p>
              
              <PaymentModal
                content={{
                  ...(content as any),
                  title: content.title + " - Fan Fest Participation",
                  premiumPrice: festParticipationFee
                }}
                paymentType="fest-participation"
                onSuccess={(transactionId?: string) => {
                  // NEW: Store transaction ID from successful fest payment
                  if (transactionId) {
                    setFestTransactionId(transactionId);
                    console.log('✅ Fest payment successful, transaction ID:', transactionId);
                  }
                  setUserHasPaidForFest(true);
                  setShowFestPaymentModal(false);
                }}
                onClose={() => setShowFestPaymentModal(false)}
              />
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
};

export default QuizSystem;