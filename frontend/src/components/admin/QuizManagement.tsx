import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Option {
  optionText: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  options: Option[];
  questionOrder: number;
}

interface Quiz {
  _id: string;
  contentId: string;
  contentName: string;
  isPaid: boolean;
  questions: Question[];
}

interface Content {
  _id: string;
  title: string;
  category: string;
  thumbnail: string;
}

export const QuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [contentName, setContentName] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

  // Fetch all quizzes
  useEffect(() => {
    fetchQuizzes();
    fetchAllContent();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/quiz/admin/all`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.quizzes);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const fetchAllContent = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contents`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('📚 Fetched content:', data);
      if (Array.isArray(data)) {
        setAllContent(data);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    }
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedContentId(quiz.contentId);
    setContentName(quiz.contentName);
    setIsPaid(quiz.isPaid);
    setQuestions(quiz.questions);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false }
        ],
        questionOrder: questions.length
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].optionText = text;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.forEach((opt, i) => {
      opt.isCorrect = i === oIndex;
    });
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ optionText: '', isCorrect: false });
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options.splice(oIndex, 1);
      setQuestions(updated);
    }
  };

  const handleSaveQuiz = async () => {
    if (!selectedContentId || !contentName.trim()) {
      setMessage({ type: 'error', text: 'Please select a content first' });
      return;
    }

    if (questions.length === 0) {
      setMessage({ type: 'error', text: 'At least one question is required' });
      return;
    }

    for (const q of questions) {
      if (!q.questionText.trim()) {
        setMessage({ type: 'error', text: 'All questions must have text' });
        return;
      }
      for (const opt of q.options) {
        if (!opt.optionText.trim()) {
          setMessage({ type: 'error', text: 'All options must have text' });
          return;
        }
      }
      if (!q.options.some(opt => opt.isCorrect)) {
        setMessage({ type: 'error', text: 'Each question must have a correct answer' });
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/quiz/admin/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contentId: selectedContentId || 'temp-' + Date.now(),
          contentName,
          isPaid,
          questions
        })
      });

      const data = await response.json();
      console.log('💾 Quiz save response:', data);
      if (data.success) {
        setMessage({ type: 'success', text: 'Quiz saved successfully!' });
        setSelectedContentId('');
        setContentName('');
        setIsPaid(false);
        setQuestions([]);
        fetchQuizzes();
      } else {
        setMessage({ type: 'error', text: data.message || 'Error saving quiz' });
      }
    } catch (err) {
      console.error('❌ Quiz save error:', err);
      setMessage({ type: 'error', text: 'Error saving quiz: ' + (err instanceof Error ? err.message : 'Unknown') });
    } finally {
      setLoading(false);
    }
  };

  const handleClearQuiz = async (contentId: string, contentName: string) => {
    if (!window.confirm(`Clear all quiz data for "${contentName}"? This will delete questions and all participant answers.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/quiz/admin/clear/${contentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Quiz cleared! Deleted ${data.participantsDeleted} participant records.` });
        setSelectedContentId('');
        setContentName('');
        setQuestions([]);
        fetchQuizzes();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error clearing quiz' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📝 Quiz Management</h2>

      {message.text && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: Quiz List */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px', color: '#444' }}>Existing Quizzes</h3>
          {quizzes.length === 0 ? (
            <p style={{ color: '#999' }}>No quizzes yet. Create a new one!</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {quizzes.map(quiz => (
                <div
                  key={quiz._id}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    backgroundColor: selectedContentId === quiz.contentId ? '#e3f2fd' : '#f9f9f9',
                    borderLeft: `4px solid ${selectedContentId === quiz.contentId ? '#2196f3' : '#ccc'}`,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => handleSelectQuiz(quiz)}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>{quiz.contentName}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {quiz.questions.length} questions {quiz.isPaid ? '(Paid)' : '(Free)'}
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleClearQuiz(quiz.contentId, quiz.contentName);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Edit Quiz */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px', color: '#444' }}>
            {selectedContentId ? 'Edit Quiz' : 'Create New Quiz'}
          </h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontWeight: 'bold' }}>
              Select Content
            </label>
            <select
              value={selectedContentId}
              onChange={e => {
                const selected = allContent.find(c => c._id === e.target.value);
                setSelectedContentId(e.target.value);
                setContentName(selected ? selected.title : '');
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">-- Select a content --</option>
              {allContent.map(content => (
                <option key={content._id} value={content._id}>
                  {content.title} ({content.category})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#666', gap: '8px' }}>
              <input
                type="checkbox"
                checked={isPaid}
                onChange={e => setIsPaid(e.target.checked)}
              />
              This is a paid participation
            </label>
          </div>

          <button
            onClick={handleSaveQuiz}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            <Save size={16} style={{ marginRight: '8px' }} />
            {loading ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>

      {/* Questions Editor */}
      {contentName && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#444' }}>Questions</h3>

          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              style={{
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: '#f9f9f9',
                borderLeft: '4px solid #2196f3',
                borderRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>Question {qIndex + 1}</div>
                <button
                  onClick={() => handleRemoveQuestion(qIndex)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>

              <input
                type="text"
                value={question.questionText}
                onChange={e => handleQuestionTextChange(qIndex, e.target.value)}
                placeholder="Enter question text"
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />

              <div style={{ marginLeft: '10px' }}>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} style={{ marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name={`correct_${qIndex}`}
                      checked={option.isCorrect}
                      onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                      title="Mark as correct answer"
                    />
                    <input
                      type="text"
                      value={option.optionText}
                      onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      style={{
                        flex: 1,
                        padding: '6px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      onClick={() => handleRemoveOption(qIndex, oIndex)}
                      disabled={question.options.length <= 2}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: question.options.length <= 2 ? '#ccc' : '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: question.options.length <= 2 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddOption(qIndex)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Add Option
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddQuestion}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            Add Question
          </button>
        </div>
      )}
    </div>
  );
};
