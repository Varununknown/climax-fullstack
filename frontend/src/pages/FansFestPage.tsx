import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, Sparkles } from 'lucide-react';
import API from '../services/api';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
}

interface FansFest {
  contentId: string;
  contentName: string;
  questions: Question[];
  isPaid: boolean;
}

export const FansFestPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  
  const [fest, setFest] = useState<FansFest | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFest();
  }, [contentId]);

  const fetchFest = async () => {
    try {
      const response = await API.get(`/participation/user/${contentId}/questions`);
      const data = response.data;
      
      if (data.success && data.questions && data.questions.length > 0) {
        setFest({
          contentId: contentId!,
          contentName: data.contentName || 'Fans Fest',
          questions: data.questions,
          isPaid: data.isPaid || false
        });
      } else {
        setMessage('No questions available for this content yet!');
      }
    } catch (err) {
      setMessage('Error loading Fans Fest');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const handleSubmit = async () => {
    if (!fest || Object.keys(answers).length !== fest.questions.length) {
      setMessage('Please answer all questions!');
      return;
    }

    try {
      const response = await API.post(`/participation/user/${contentId}/submit`, { answers });
      const data = response.data;
      
      if (data.success) {
        setScore(data.score);
        setSubmitted(true);
        setMessage(`Amazing! You scored ${data.score}/${fest.questions.length}! 🎉`);
      }
    } catch (err) {
      setMessage('Error submitting answers');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading Fans Fest...</div>
      </div>
    );
  }

  if (!fest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">{message || 'No questions available'}</div>
          <button onClick={() => navigate(-1)} className="bg-white text-purple-900 px-6 py-2 rounded-full font-bold hover:bg-gray-100">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
          <div className="mb-6">
            <Trophy className="w-24 h-24 mx-auto text-yellow-500 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-purple-900 mb-4">Congratulations! 🎊</h1>
          <p className="text-2xl text-gray-700 mb-2">{message}</p>
          <div className="text-6xl font-bold text-purple-600 my-8">
            {score}/{fest.questions.length}
          </div>
          <p className="text-gray-600 mb-8">Your answers have been recorded. Check back for rewards!</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            Back to Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button onClick={() => navigate(-1)} className="text-white mb-4 flex items-center gap-2 hover:underline">
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="text-yellow-300" size={32} />
            <h1 className="text-4xl font-bold text-white">Fans Fest</h1>
            <Star className="text-yellow-300" size={32} />
          </div>
          <p className="text-white/90 text-lg">{fest.contentName}</p>
          <p className="text-white/70 mt-2">Answer all questions and win exciting rewards!</p>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-4xl mx-auto space-y-6">
        {fest.questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="mb-4">
              <span className="inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-sm font-semibold mb-2">
                Question {qIndex + 1} of {fest.questions.length}
              </span>
              <h3 className="text-xl font-bold text-gray-800">{question.questionText}</h3>
            </div>

            <div className="space-y-3">
              {question.options.map((option, oIndex) => (
                <button
                  key={oIndex}
                  onClick={() => handleAnswerSelect(qIndex, oIndex)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[qIndex] === oIndex
                      ? 'border-purple-600 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[qIndex] === oIndex ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {answers[qIndex] === oIndex && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                    <span className="text-gray-800 font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
          <p className="text-gray-600 mb-4">
            Answered: {Object.keys(answers).length}/{fest.questions.length}
          </p>
          {message && (
            <p className="text-red-600 mb-4">{message}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== fest.questions.length}
            className={`px-12 py-4 rounded-full font-bold text-lg transition-all ${
              Object.keys(answers).length === fest.questions.length
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Answers 🎁
          </button>
        </div>
      </div>
    </div>
  );
};
