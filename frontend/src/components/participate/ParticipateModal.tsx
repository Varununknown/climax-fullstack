import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ParticipateModalProps {
  contentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Question {
  _id: string;
  questionText: string;
  options: string[];
}

export const ParticipateModal: React.FC<ParticipateModalProps> = ({
  contentId,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [contentTitle, setContentTitle] = useState('');
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/participation/user/${contentId}/questions`
        );

        if (!res.ok) {
          throw new Error('Could not fetch questions');
        }

        const data = await res.json();
        setContentTitle(data.data.content.title);
        setQuestions(data.data.questions);

        // Initialize answers
        const initialAnswers: { [key: string]: string } = {};
        data.data.questions.forEach((q: Question) => {
          initialAnswers[q._id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [contentId]);

  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    try {
      // Validate all answers
      const unanswered = questions.filter(q => !answers[q._id]);
      if (unanswered.length > 0) {
        setError('Please answer all questions');
        return;
      }

      setIsSubmitting(true);
      setError('');

      const token = localStorage.getItem('streamflix_token');
      if (!token) {
        setError('Please login to participate');
        setIsSubmitting(false);
        return;
      }

      // Submit answers
      const res = await fetch(
        `${BACKEND_URL}/api/participation/user/${contentId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            answers: questions.map(q => ({
              questionId: q._id,
              selectedOption: answers[q._id]
            }))
          })
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit');
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting answers');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center gap-3">
            <Loader className="animate-spin" />
            <p>Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-gray-600">Your answers have been recorded successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-orange-500 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Participate & Win</h1>
            <p className="text-white text-opacity-90">{contentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question._id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">
                  {index + 1}. {question.questionText}
                </h3>

                <div className="space-y-2">
                  {question.options.map(option => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input
                        type="radio"
                        name={question._id}
                        value={option}
                        checked={answers[question._id] === option}
                        onChange={() => handleAnswerChange(question._id, option)}
                        className="w-4 h-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={18} className="animate-spin" /> Submitting...
                </span>
              ) : (
                'Submit Answers'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
