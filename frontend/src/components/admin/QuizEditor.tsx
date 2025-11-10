import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Save, Edit2, ChevronDown } from 'lucide-react';

interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer?: string;
}

interface Content {
  _id: string;
  title: string;
}

const QuizEditor: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [selectedContentTitle, setSelectedContentTitle] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load all contents on mount
  useEffect(() => {
    loadContents();
  }, []);

  // Load questions when content is selected
  useEffect(() => {
    if (selectedContentId) {
      loadQuestions();
    }
  }, [selectedContentId]);

  const loadContents = async () => {
    try {
      const response = await API.get('/contents');
      if (Array.isArray(response.data)) {
        setContents(response.data);
      }
    } catch (err) {
      console.error('Failed to load contents:', err);
      setError('Failed to load content list');
    }
  };

  const handleContentSelect = (contentId: string) => {
    const content = contents.find(c => c._id === contentId);
    if (content) {
      setSelectedContentId(contentId);
      setSelectedContentTitle(content.title);
      setError('');
      setSuccess('');
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/quiz-system/${selectedContentId}`);
      if (response.data.success && response.data.quiz) {
        const formattedQuestions = response.data.quiz.map((q: any) => ({
          _id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer || ''
        }));
        setQuestions(formattedQuestions);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setQuestions([]);
    }
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', ''],
        correctAnswer: ''
      }
    ]);
    setEditingIndex(questions.length);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'question') {
      updated[index].question = value;
    } else if (field === 'correctAnswer') {
      updated[index].correctAnswer = value;
    }
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      setQuestions(updated);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuestions = async () => {
    // Validate
    if (questions.length === 0) {
      setError('Add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }
      if (q.options.filter(o => o.trim()).length < 2) {
        setError(`Question ${i + 1} needs at least 2 options`);
        return;
      }
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        questions: questions.map(q => ({
          question: q.question,
          options: q.options.filter(o => o.trim()),
          correctAnswer: q.correctAnswer || q.options[0]
        }))
      };

      await API.post(`/quiz-system/admin/${selectedContentId}`, payload);
      setSuccess(`✅ Quiz questions saved for "${selectedContentTitle}"!`);
      setEditingIndex(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save questions. Please try again.');
      console.error(err);
    }

    setSaving(false);
  };

  return (
    <div className="bg-gray-950 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">✏️ Quiz Editor</h1>
          <p className="text-gray-400">Create custom questions for each content</p>
        </div>

        {/* Content Selector */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">📺 Select Content</h2>
          
          {contents.length === 0 ? (
            <div className="text-gray-400">Loading content...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map((content) => (
                <button
                  key={content._id}
                  onClick={() => handleContentSelect(content._id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedContentId === content._id
                      ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold text-white mb-1">{content.title}</div>
                  <div className="text-sm text-gray-400">ID: {content._id.substring(0, 8)}...</div>
                  {selectedContentId === content._id && (
                    <div className="mt-2 text-blue-400 text-sm">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Questions Editor */}
        {selectedContentId ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Questions for: {selectedContentTitle}</h3>
              <p className="text-gray-400 text-sm">
                {questions.length} question{questions.length !== 1 ? 's' : ''} created
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400">
                ❌ {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-green-400">
                {success}
              </div>
            )}

            {/* Questions List */}
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-40 bg-gray-800 rounded"></div>
                <div className="h-40 bg-gray-800 rounded"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No questions yet. Create your first quiz question!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, qIdx) => (
                  <div
                    key={qIdx}
                    className={`border-2 rounded-lg p-6 transition-colors ${
                      editingIndex === qIdx
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 bg-gray-800 hover:bg-gray-800/80'
                    }`}
                  >
                    {/* Question Number and Actions */}
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-lg text-white">Question {qIdx + 1}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingIndex(editingIndex === qIdx ? null : qIdx)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => removeQuestion(qIdx)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                        disabled={editingIndex !== qIdx}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          editingIndex !== qIdx
                            ? 'bg-gray-700 text-gray-400 border-gray-600'
                            : 'bg-gray-800 text-white border-gray-600'
                        }`}
                        placeholder="Enter question text..."
                      />
                    </div>

                    {/* Options */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, oIdx) => (
                          <div key={oIdx} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                              disabled={editingIndex !== qIdx}
                              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                editingIndex !== qIdx
                                  ? 'bg-gray-700 text-gray-400 border-gray-600'
                                  : 'bg-gray-800 text-white border-gray-600'
                              }`}
                              placeholder={`Option ${oIdx + 1}`}
                            />
                            {question.options.length > 2 && editingIndex === qIdx && (
                              <button
                                onClick={() => removeOption(qIdx, oIdx)}
                                className="px-3 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {editingIndex === qIdx && (
                        <button
                          onClick={() => addOption(qIdx)}
                          className="mt-3 flex items-center space-x-2 px-3 py-2 bg-green-900/50 hover:bg-green-900 text-green-400 rounded transition-colors text-sm"
                        >
                          <Plus size={16} />
                          <span>Add Option</span>
                        </button>
                      )}
                    </div>

                    {/* Preview */}
                    {editingIndex !== qIdx && (
                      <div className="mt-4 p-3 bg-gray-700/50 rounded border border-gray-600">
                        <p className="text-sm text-gray-300 mb-2">
                          <strong>Preview:</strong> {question.question || '(No question text)'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((opt, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm"
                            >
                              {opt || `Option ${idx + 1}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-700">
              <button
                onClick={addQuestion}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus size={18} />
                <span>Add Question</span>
              </button>

              <button
                onClick={saveQuestions}
                disabled={saving || questions.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Questions'}</span>
              </button>

              <button
                onClick={loadQuestions}
                disabled={loading}
                className="ml-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">👈 Select a content to start editing questions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizEditor;