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

    // === PREMIUM HEADER ===
    // Gradient background (simulated with rectangles)
    pdf.setFillColor(88, 28, 135); // Deep purple
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setFillColor(139, 92, 246); // Purple gradient
    pdf.rect(0, 25, pageWidth, 10, 'F');

    // Logo/Title area
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.text('FAN FEST', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text('Participant Analytics Report', pageWidth / 2, 22, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.text(`📺 ${contentTitle}`, pageWidth / 2, 28, { align: 'center' });

    yPosition = 42;

    // === REPORT INFO CARD ===
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(12, yPosition - 2, pageWidth - 24, 12);
    
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);
    const now = new Date();
    pdf.text(`📅 Generated: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 15, yPosition + 2);
    pdf.text(`🕐 Time: ${now.toLocaleTimeString()}`, 15, yPosition + 6);
    pdf.text(`👥 Total Participants: ${data.totalResponses}`, pageWidth / 2 + 10, yPosition + 2);
    pdf.text(`⭐ Average Score: ${data.averageScore}`, pageWidth / 2 + 10, yPosition + 6);
    
    yPosition += 18;

    // === STATISTICS SECTION ===
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(88, 28, 135);
    pdf.text('Performance Metrics', 15, yPosition);
    yPosition += 8;

    // Stats boxes
    const statsBoxWidth = (pageWidth - 36) / 3;
    const statsBoxHeight = 14;
    const statBoxes = [
      { label: 'Total Responses', value: data.totalResponses.toString(), color: [59, 130, 246] },
      { label: 'Avg. Score', value: data.averageScore.toString(), color: [34, 197, 94] },
      { label: 'Engagement', value: '100%', color: [249, 115, 22] }
    ];

    statBoxes.forEach((stat, idx) => {
      const xPos = 15 + (idx * (statsBoxWidth + 6));
      pdf.setFillColor(...stat.color);
      pdf.roundedRect(xPos, yPosition, statsBoxWidth, statsBoxHeight, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(stat.value, xPos + statsBoxWidth / 2, yPosition + 6, { align: 'center' });
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(stat.label, xPos + statsBoxWidth / 2, yPosition + 11, { align: 'center' });
    });

    yPosition += 22;

    // === PARTICIPANTS SECTION ===
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(88, 28, 135);
    pdf.text('Participant Details', 15, yPosition);
    yPosition += 8;

    // Premium Table Header
    pdf.setFillColor(88, 28, 135);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(10);
    
    const col1 = 15, col2 = 50, col3 = 95, col4 = 140, col5 = 180;
    const colWidths = [col2 - col1, col3 - col2, col4 - col3, col5 - col4, pageWidth - 15 - col5];
    
    pdf.rect(col1, yPosition, col2 - col1, 8, 'F');
    pdf.rect(col2, yPosition, col3 - col2, 8, 'F');
    pdf.rect(col3, yPosition, col4 - col3, 8, 'F');
    pdf.rect(col4, yPosition, col5 - col4, 8, 'F');
    pdf.rect(col5, yPosition, pageWidth - 15 - col5, 8, 'F');

    pdf.text('👤 Name', col1 + 1, yPosition + 5);
    pdf.text('📱 Phone', col2 + 1, yPosition + 5);
    pdf.text('📅 Date/Time', col3 + 1, yPosition + 5);
    pdf.text('✏️ Answer', col4 + 1, yPosition + 5);
    pdf.text('⭐ Score', col5 + 1, yPosition + 5);
    yPosition += 8;

    // Table Rows with premium styling
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);

    data.responses.slice(0, 18).forEach((response, idx) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 15;
      }

      const resp = response as any;
      const userName = resp.userName || 'Anonymous';
      const phone = resp.phoneNumber || 'N/A';
      const dateTime = new Date(response.submittedAt).toLocaleString();
      const answer = response.answers.map(a => a.answer).join(', ');

      // Alternating row colors with rounded feel
      if (idx % 2 === 0) {
        pdf.setFillColor(240, 246, 252); // Light purple
      } else {
        pdf.setFillColor(255, 255, 255);
      }
      pdf.rect(col1, yPosition - 3, pageWidth - 30, 7, 'F');

      // Border for each row
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.rect(col1, yPosition - 3, pageWidth - 30, 7);

      pdf.setTextColor(0, 0, 0);
      pdf.text(userName.substring(0, 17), col1 + 1, yPosition + 1);
      pdf.text(phone.substring(0, 14), col2 + 1, yPosition + 1);
      pdf.text(dateTime.substring(0, 16), col3 + 1, yPosition + 1);
      pdf.text(answer.substring(0, 18), col4 + 1, yPosition + 1);
      
      // Score with color indicator
      pdf.setFont('Helvetica', 'bold');
      pdf.setTextColor(34, 197, 94);
      pdf.text(response.score.toString(), col5 + 1, yPosition + 1);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      yPosition += 7;
    });

    if (data.responses.length > 18) {
      yPosition += 2;
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`... and ${data.responses.length - 18} more participants`, 15, yPosition);
    }

    // === PREMIUM FOOTER ===
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);
    
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('FAN FEST - Powered by CLIMAX', 15, pageHeight - 7);
    pdf.text(`Report ID: ${contentId.substring(0, 8).toUpperCase()}`, pageWidth - 40, pageHeight - 7);
    pdf.text(`Page ${pdf.internal.pages.length}`, pageWidth / 2, pageHeight - 7, { align: 'center' });

    // Download
    pdf.save(`FanFest-Report-${contentTitle}-${new Date().getTime()}.pdf`);
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
