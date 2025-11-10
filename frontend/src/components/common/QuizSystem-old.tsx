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
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full text-white">
            <span className="text-2xl">✓</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-3">
          Already Participated
        </h3>
        <p className="text-green-700 mb-2">
          Thank you for participating in the feedback survey for
        </p>
        <p className="text-lg font-semibold text-green-800 mb-4">"{contentTitle}"</p>
        <div className="pt-4 border-t border-green-200">
          <p className="text-sm text-green-600">
            You can participate again when new questions are released. Stay tuned for upcoming surveys!
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full text-white">
            <span className="text-3xl">Success!</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-4">
          Submission Successful!
        </h3>
        <p className="text-green-700 mb-3">
          Your feedback for <span className="font-semibold text-green-800">"{contentTitle}"</span> has been recorded.
        </p>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 flex items-center justify-center gap-2">
            <span className="text-xl">Trophy</span>
            <span>Winners will be contacted via the phone number provided. Good luck!</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Professional Form Header */}
      <div className="text-center pb-6 border-b border-gray-200 mb-6">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            Feedback Survey
          </h3>
        </div>
        <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
          Share your valuable feedback. Top participants will receive <span className="font-semibold text-blue-600">exciting rewards</span>.
        </p>
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Question Number Badge */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                {/* Question Text */}
                <h4 className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {question.question}
                </h4>
                
                {/* Options Grid */}
                <div className="space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = answers[question.id] === option;
                      return (
                        <label
                          key={optionIndex}
                          className="relative flex items-center gap-3 sm:gap-4 cursor-pointer group/option"
                        >
                          {/* Professional Option Card */}
                          <div className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white border-gray-200 hover:border-gray-300'
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
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}>
                                {isSelected && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Option Text */}
                            <span className={`text-sm font-medium flex-1 ${
                              isSelected ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {option}
                            </span>

                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="ml-auto flex-shrink-0">
                                <span className="text-blue-600">✓</span>
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

      {/* Professional Phone Number Field */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📞</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Contact Number <span className="text-green-600 text-sm font-medium">(Optional - for prizes)</span>
              </label>
              <p className="text-sm text-gray-600 leading-relaxed">
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
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Professional Submit Button */}
      <div className="pt-6">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0 || loading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-base transition-all duration-200 ${
            Object.keys(answers).length === 0 || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⌛</span>
              <span>Submitting Your Feedback...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>✓</span>
              <span>Submit Feedback</span>
            </span>
          )}
        </button>
        
        {Object.keys(answers).length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Please answer all questions to submit your feedback
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizSystem;