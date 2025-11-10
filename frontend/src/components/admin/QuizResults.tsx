import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../../services/api';
import { RefreshCw, Download, Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [clearing, setClearing] = useState(false);

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

  const clearAllAnswers = async () => {
    if (!window.confirm(`🗑️ Are you sure? This will permanently delete ALL answers for "${contentTitle}" (${data?.totalResponses} responses). This cannot be undone!`)) {
      return;
    }

    setClearing(true);
    try {
      const response = await API.post(`/quiz-system/admin/clear/${contentId}`, {});
      if (response.data.success) {
        alert('✅ All answers cleared successfully! Memory freed.');
        setData(null);
        loadResults(); // Reload to show empty state
      } else {
        alert('❌ Failed to clear answers: ' + response.data.message);
      }
    } catch (err) {
      console.error('Failed to clear answers:', err);
      alert('❌ Error clearing answers');
    }
    setClearing(false);
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

  const downloadPDF = async () => {
    if (!data) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 15;

    // Title and Header
    pdf.setFillColor(31, 41, 55); // Dark gray
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('Quiz Results Report', pageWidth / 2, 12, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(contentTitle, pageWidth / 2, 20, { align: 'center' });

    yPosition = 30;

    // Report Info
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, yPosition);
    yPosition += 8;

    // Summary Section
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text('Summary', 20, yPosition + 6);
    yPosition += 12;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(`Total Responses: ${data.totalResponses}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Average Score: ${data.averageScore}`, 20, yPosition);
    yPosition += 12;

    // Detailed Responses Section
    pdf.setFillColor(34, 197, 94); // Green
    pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text('Participant Details', 20, yPosition + 6);
    yPosition += 12;

    // Table Headers
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(55, 65, 81); // Dark gray
    const col1 = 15, col2 = 50, col3 = 100, col4 = 140, col5 = 180;
    pdf.rect(col1, yPosition, col2 - col1, 7, 'F');
    pdf.rect(col2, yPosition, col3 - col2, 7, 'F');
    pdf.rect(col3, yPosition, col4 - col3, 7, 'F');
    pdf.rect(col4, yPosition, col5 - col4, 7, 'F');
    pdf.rect(col5, yPosition, pageWidth - 15 - col5, 7, 'F');

    pdf.setFontSize(9);
    pdf.text('Name', col1 + 2, yPosition + 5);
    pdf.text('Phone', col2 + 2, yPosition + 5);
    pdf.text('Date/Time', col3 + 2, yPosition + 5);
    pdf.text('Answer', col4 + 2, yPosition + 5);
    pdf.text('Score', col5 + 2, yPosition + 5);
    yPosition += 8;

    // Table Rows
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    data.responses.slice(0, 20).forEach((response, idx) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 15;
      }

      const resp = response as any;
      const userName = resp.userName || 'Anonymous';
      const phone = resp.phoneNumber || 'N/A';
      const dateTime = new Date(response.submittedAt).toLocaleString();
      const answer = response.answers.map(a => a.answer).join(', ');

      // Alternate row colors
      if (idx % 2 === 0) {
        pdf.setFillColor(240, 246, 252); // Light blue
        pdf.rect(col1, yPosition - 3, pageWidth - 30, 6, 'F');
      }

      pdf.text(userName.substring(0, 15), col1 + 2, yPosition);
      pdf.text(phone.substring(0, 12), col2 + 2, yPosition);
      pdf.text(dateTime.substring(0, 16), col3 + 2, yPosition);
      pdf.text(answer.substring(0, 15), col4 + 2, yPosition);
      pdf.text(response.score.toString(), col5 + 2, yPosition);
      yPosition += 6;
    });

    if (data.responses.length > 20) {
      yPosition += 2;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`... and ${data.responses.length - 20} more responses`, 15, yPosition);
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page 1 of ${pdf.internal.pages.length}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

    // Download
    pdf.save(`quiz-report-${contentId}-${new Date().getTime()}.pdf`);
  };

  const downloadCSV = () => {
    if (!data) return;

    const timestamp = new Date().toLocaleString();
    const reportTitle = `Quiz Results Report - ${contentTitle}`;
    const reportDate = `Generated on: ${timestamp}`;
    
    // Create header with report info
    let csv = `${reportTitle}\n${reportDate}\n\n`;
    
    // Summary statistics
    csv += `Total Responses,${data.totalResponses}\n`;
    csv += `Average Score,${data.averageScore}\n\n`;
    
    // Answer frequency summary
    csv += `Question,Answer,Responses\n`;
    Object.entries(data.answerFrequency).forEach(([key, count]) => {
      const [question, answer] = key.split('||');
      csv += `"${question}","${answer}",${count}\n`;
    });
    
    // Individual Responses with User Info
    csv += `\n\nDetailed Responses\n`;
    csv += `User Name,Phone Number,Date/Time,Answers,Score\n`;
    data.responses.forEach((response) => {
      const userName = (response as any).userName || 'Anonymous';
      const phoneNumber = (response as any).phoneNumber || 'Not provided';
      const dateTime = new Date(response.submittedAt).toLocaleString();
      const answersText = response.answers.map(a => a.answer).join(' | ');
      csv += `"${userName}","${phoneNumber}","${dateTime}","${answersText}",${response.score}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${contentId}-${new Date().getTime()}.csv`;
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

        <button
          onClick={downloadPDF}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          title="Download professional PDF report"
        >
          <FileText size={18} />
          <span>Download PDF Report</span>
        </button>

        <button
          onClick={clearAllAnswers}
          disabled={clearing || data.totalResponses === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            clearing || data.totalResponses === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title="Permanently delete all answers for this content"
        >
          <Trash2 size={18} />
          <span>{clearing ? 'Clearing...' : 'Clear All Answers'}</span>
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
          {data.responses.slice(0, 10).map((response, idx) => {
            const resp = response as any;
            return (
              <div key={response._id || idx} className="border border-gray-100 rounded p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">👤 {resp.userName || 'Anonymous'}</div>
                    {resp.phoneNumber && (
                      <div className="text-xs text-blue-600 font-medium">📱 {resp.phoneNumber}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold">Score: {response.score}</div>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  📅 {new Date(response.submittedAt).toLocaleDateString()} 🕐 {new Date(response.submittedAt).toLocaleTimeString()}
                </div>
                <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                  <strong>Answers:</strong> {response.answers.map(a => `${a.answer}`).join(', ')}
                </div>
              </div>
            );
          })}
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
