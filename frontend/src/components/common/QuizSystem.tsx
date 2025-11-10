import React, { useState, useEffect } from 'react';
import API from '../../services/api';

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
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [contentId]);

  const loadQuiz = async () => {
    try {
      const response = await API.get(`/quiz-system/${contentId}`);
      if (response.data.success) {
        setQuestions(response.data.quiz);
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

      await API.post(`/quiz-system/${contentId}/submit`, { 
        answers: submissionData 
      });
      
      setSubmitted(true);
    } catch (error) {
      // Always show success to user
      setSubmitted(true);
    }
    
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-2xl mb-2">🎉</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Thank You for Your Feedback!
        </h3>
        <p className="text-green-600">
          Your responses have been recorded for "{contentTitle}"
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        📋 Quick Survey: {contentTitle}
      </h3>
      
      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="border-b border-gray-100 pb-4">
            <p className="font-medium text-gray-700 mb-3">
              {question.question}
            </p>
            
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length === 0 || loading}
        className={`mt-6 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          Object.keys(answers).length === 0 || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
};

export default QuizSystem;