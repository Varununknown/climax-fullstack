import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../../services/api';
import { RefreshCw, Download } from 'lucide-react';

interface QuizResponse {
  _id: string;
  userId: string;
  answers: { question: string; answer: string }[];
  score: number;
  submittedAt: string;
}

interface QuizResultsData {
  contentId: string;
  totalResponses: number;
  responses: QuizResponse[];
  answerFrequency: { [key: string]: number };
  averageScore: number;
}

interface QuizResultsProps {
  contentId: string;
  contentTitle: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const QuizResultsComponent: React.FC<QuizResultsProps> = ({ contentId, contentTitle }) => {
  const [data, setData] = useState<QuizResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadResults = async () => {
    setLoading(true);
    
    try {
      const response = await API.get(`/quiz-system/admin/responses/${contentId}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load quiz results:', err);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadResults();
  }, [contentId]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadResults();
    }, 5000);

    return () => clearInterval(interval);
  }, [contentId, autoRefresh]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.totalResponses === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Quiz Results</h3>
        <p className="text-blue-700">No responses yet for "{contentTitle}"</p>
      </div>
    );
  }

  // Prepare answer frequency data for charts
  const answerData = Object.entries(data.answerFrequency).map(([key, count]) => {
    const [question, answer] = key.split('||');
    return {
      label: answer,
      count: count as number,
      question
    };
  });

  // Group by question for visualization
  const questionGroups = new Map<string, any[]>();
  answerData.forEach(item => {
    if (!questionGroups.has(item.question)) {
      questionGroups.set(item.question, []);
    }
    questionGroups.get(item.question)?.push(item);
  });

  const downloadCSV = () => {
    let csv = `Question,Answer,Count\n`;
    Object.entries(data.answerFrequency).forEach(([key, count]) => {
      const [question, answer] = key.split('||');
      csv += `"${question}","${answer}",${count}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${contentId}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Quiz Results: {contentTitle}</h3>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600">Total Responses</div>
            <div className="text-2xl font-bold text-blue-600">{data.totalResponses}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="text-sm text-gray-600">Average Score</div>
            <div className="text-2xl font-bold text-green-600">{data.averageScore}</div>
          </div>
          <button
            onClick={loadResults}
            disabled={loading}
            className="bg-white rounded-lg p-4 border border-purple-100 hover:bg-purple-50 transition-colors cursor-pointer"
            title="Manually refresh data"
          >
            <div className="text-sm text-gray-600 mb-2">Refresh</div>
            <RefreshCw size={20} className={`text-purple-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`bg-white rounded-lg p-4 border-2 transition-colors cursor-pointer ${
              autoRefresh ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
            title={autoRefresh ? 'Auto-refresh: ON (every 5s)' : 'Auto-refresh: OFF'}
          >
            <div className="text-xs text-gray-600 mb-2">Auto</div>
            <div className="text-xs font-bold">{autoRefresh ? '🟢 ON' : '⚪ OFF'}</div>
          </button>
        </div>

        <button
          onClick={downloadCSV}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={18} />
          <span>Download CSV</span>
        </button>
      </div>

      {/* Answer Distribution Charts */}
      <div className="space-y-6">
        {Array.from(questionGroups.entries()).map(([question, answers]) => (
          <div key={question} className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-4">📋 {question}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={answers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>

              {/* Pie Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={answers}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, count }) => `${label}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {answers.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Answer Details Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2">Answer</th>
                    <th className="text-left px-4 py-2">Responses</th>
                    <th className="text-left px-4 py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((answer, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{answer.label}</td>
                      <td className="px-4 py-2">{answer.count}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(answer.count / data.totalResponses) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span>{((answer.count / data.totalResponses) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Responses */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">👥 Individual Responses ({data.responses.length})</h4>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.responses.slice(0, 10).map((response, idx) => (
            <div key={response._id || idx} className="border border-gray-100 rounded p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-gray-700">User: {response.userId.substring(0, 8)}...</div>
                <div className="text-xs text-gray-500">Score: {response.score}</div>
              </div>
              <div className="text-xs text-gray-600">
                {new Date(response.submittedAt).toLocaleDateString()} {new Date(response.submittedAt).toLocaleTimeString()}
              </div>
              <div className="mt-2 text-sm text-gray-700">
                Answers: {response.answers.map(a => `${a.answer}`).join(', ')}
              </div>
            </div>
          ))}
        </div>

        {data.responses.length > 10 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            ... and {data.responses.length - 10} more responses
          </div>
        )}
      </div>
    </div>
  );
};
export default QuizResultsComponent;
