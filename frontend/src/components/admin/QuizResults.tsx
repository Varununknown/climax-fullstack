import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface Participant {
  _id: string;
  userEmail: string;
  userName: string;
  answers: Array<{
    questionText: string;
    selectedOption: string;
    isCorrect: boolean;
  }>;
  score: number;
  totalQuestions: number;
  participatedAt: string;
}

interface QuizData {
  contentId: string;
  contentName: string;
}

export const QuizResults: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [results, setResults] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

  // Fetch all quizzes on mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/quiz/admin/all`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.quizzes.map((q: any) => ({
          contentId: q.contentId,
          contentName: q.contentName
        })));
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const handleSelectQuiz = async (contentId: string) => {
    setSelectedContentId(contentId);
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/quiz/admin/results/${contentId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.results);
        setMessage({ type: 'success', text: `Found ${data.results.length} participants` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error fetching results' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!selectedContentId) {
      setMessage({ type: 'error', text: 'Select a quiz first' });
      return;
    }

    const quiz = quizzes.find(q => q.contentId === selectedContentId);
    if (!window.confirm(`Clear ALL data for "${quiz?.contentName}"? This will delete all questions and ${results.length} participant answers.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/quiz/admin/clear/${selectedContentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Cleared! Deleted ${data.participantsDeleted} participant records and questions.` 
        });
        setSelectedContentId('');
        setResults([]);
        fetchQuizzes();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error clearing data' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📊 Quiz Results & Analytics</h2>

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

      <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px' }}>
        {/* Quiz Selector */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '15px', color: '#444' }}>Quizzes</h3>
          {quizzes.length === 0 ? (
            <p style={{ color: '#999', fontSize: '14px' }}>No quizzes available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quizzes.map(quiz => (
                <button
                  key={quiz.contentId}
                  onClick={() => handleSelectQuiz(quiz.contentId)}
                  style={{
                    padding: '10px',
                    backgroundColor: selectedContentId === quiz.contentId ? '#2196f3' : '#f0f0f0',
                    color: selectedContentId === quiz.contentId ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: selectedContentId === quiz.contentId ? 'bold' : 'normal'
                  }}
                >
                  {quiz.contentName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results View */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          {selectedContentId ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: '#444' }}>Results ({results.length})</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleSelectQuiz(selectedContentId)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={results.length === 0}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: results.length === 0 ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: results.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Trash2 size={16} /> Clear All
                  </button>
                </div>
              </div>

              {results.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  No participants yet
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                          Email
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                          Name
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                          Answers
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                          Score
                        </th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, idx) => (
                        <tr
                          key={idx}
                          style={{
                            backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white',
                            borderBottom: '1px solid #eee'
                          }}
                        >
                          <td style={{ padding: '12px', fontSize: '14px' }}>{result.userEmail}</td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>
                            {result.userName || '—'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>
                            <details>
                              <summary style={{ cursor: 'pointer', color: '#2196f3' }}>
                                View ({result.answers.length})
                              </summary>
                              <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                {result.answers.map((ans, i) => (
                                  <div key={i} style={{ marginBottom: '8px', fontSize: '12px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>Q{i + 1}: {ans.questionText}</div>
                                    <div style={{ color: '#666', marginLeft: '10px' }}>
                                      Answer: <strong>{ans.selectedOption}</strong>
                                      <span style={{
                                        marginLeft: '8px',
                                        color: ans.isCorrect ? '#4CAF50' : '#ff4444',
                                        fontWeight: 'bold'
                                      }}>
                                        {ans.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                            <span style={{
                              color: result.score === result.totalQuestions ? '#4CAF50' : 
                                    result.score > result.totalQuestions / 2 ? '#ff9800' : '#ff4444'
                            }}>
                              {result.score}/{result.totalQuestions}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#999' }}>
                            {new Date(result.participatedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
              Select a quiz to view results
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
