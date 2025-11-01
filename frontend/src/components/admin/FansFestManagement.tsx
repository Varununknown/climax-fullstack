import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Option {
  text: string;
}

interface Question {
  _id?: string;
  questionText: string;
  options: Option[];
  correctAnswer: number | null;
}

interface Content {
  _id: string;
  title: string;
}

export const FansFestManagement: React.FC = () => {
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [contentTitle, setContentTitle] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

  // Fetch all content
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contents`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllContent(data);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    }
  };

  const handleSelectContent = (contentId: string) => {
    const selected = allContent.find(c => c._id === contentId);
    setSelectedContentId(contentId);
    setContentTitle(selected?.title || '');
    fetchQuestions(contentId);
  };

  const fetchQuestions = async (contentId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/participation/admin/questions/${contentId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: [{ text: '' }, { text: '' }],
        correctAnswer: null
      }
    ]);
  };

  const handleRemoveQuestion = async (index: number) => {
    const question = questions[index];
    if (question._id) {
      try {
        await fetch(`${BACKEND_URL}/api/participation/admin/questions/${question._id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = oIndex;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: '' });
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options.splice(oIndex, 1);
      setQuestions(updated);
    }
  };

  const handleSaveQuestions = async () => {
    if (!selectedContentId || !contentTitle.trim()) {
      setMessage({ type: 'error', text: 'Please select a content first' });
      return;
    }

    if (questions.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one question' });
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.questionText.trim()) {
        setMessage({ type: 'error', text: 'All questions must have text' });
        return;
      }
      for (const opt of q.options) {
        if (!opt.text.trim()) {
          setMessage({ type: 'error', text: 'All options must have text' });
          return;
        }
      }
      if (q.correctAnswer === null) {
        setMessage({ type: 'error', text: 'Each question must have a correct answer marked' });
        return;
      }
    }

    setLoading(true);
    try {
      // Save each question
      for (const question of questions) {
        if (!question._id) {
          const response = await fetch(`${BACKEND_URL}/api/participation/admin/questions/${selectedContentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              questionText: question.questionText,
              options: question.options.map(o => o.text),
              correctAnswer: question.correctAnswer,
              isRequired: true
            })
          });

          const data = await response.json();
          if (!data.success) {
            setMessage({ type: 'error', text: `Failed to save question: ${data.message}` });
            return;
          }
        }
      }

      setMessage({ type: 'success', text: '✅ All questions saved successfully!' });
      setTimeout(() => {
        setQuestions([]);
        setSelectedContentId('');
        setContentTitle('');
      }, 1500);
    } catch (err) {
      console.error('Error saving questions:', err);
      setMessage({ type: 'error', text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>🎉 Fans Fest Questions</h2>

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
        {/* Left: Content List */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px', color: '#444' }}>Select Content</h3>
          <select
            value={selectedContentId}
            onChange={(e) => handleSelectContent(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '15px'
            }}
          >
            <option value="">-- Choose a content --</option>
            {allContent.map(content => (
              <option key={content._id} value={content._id}>
                {content.title}
              </option>
            ))}
          </select>

          {selectedContentId && (
            <div
              style={{
                padding: '10px',
                backgroundColor: '#e3f2fd',
                borderLeft: '4px solid #2196f3',
                borderRadius: '4px'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#333' }}>{contentTitle}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {questions.length} questions added
              </div>
            </div>
          )}
        </div>

        {/* Right: Add Questions */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px', color: '#444' }}>
            {selectedContentId ? 'Add Questions' : 'Select Content First'}
          </h3>
          <button
            onClick={handleAddQuestion}
            disabled={!selectedContentId}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: selectedContentId ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedContentId ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      </div>

      {/* Questions Editor */}
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
        {questions.length === 0 ? (
          <p style={{ color: '#999' }}>No questions yet. Add one to get started!</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {questions.map((question, qIndex) => (
              <div key={qIndex} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', color: '#333' }}>
                    Question {qIndex + 1}
                  </label>
                  <button
                    onClick={() => handleRemoveQuestion(qIndex)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                <input
                  type="text"
                  value={question.questionText}
                  onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                  placeholder="Enter question text"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    boxSizing: 'border-box'
                  }}
                />

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>
                    Options (mark correct answer):
                  </label>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="radio"
                          name={`correct-q${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          title="Mark as correct answer"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: question.correctAnswer === oIndex ? '2px solid #4CAF50' : '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: question.correctAnswer === oIndex ? '#f0f8ff' : 'white'
                          }}
                        />
                        <button
                          onClick={() => handleRemoveOption(qIndex, oIndex)}
                          disabled={question.options.length <= 2}
                          style={{
                            padding: '6px 10px',
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
                  </div>
                  <button
                    onClick={() => handleAddOption(qIndex)}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <button
            onClick={handleSaveQuestions}
            disabled={loading}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save All Questions'}
          </button>
        )}
      </div>
    </div>
  );
};
