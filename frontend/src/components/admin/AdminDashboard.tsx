import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { DashboardStats } from './DashboardStats';
import { ContentManagement } from './ContentManagement';
import { UserManagement } from './UserManagement';
import { Analytics } from './Analytics';
import { PaymentSettings } from './PaymentSettings';
import { PendingPayments } from './PendingPayments';
import { ImageFixer } from './ImageFixer';
import QuizResults from './QuizResults';
import QuizEditor from './QuizEditor';
import QuickAddContent from './QuickAddContent';
import API from '../../services/api';

interface Content {
  _id: string;
  title: string;
}

export const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [selectedContentTitle, setSelectedContentTitle] = useState<string>('');
  const [allContents, setAllContents] = useState<Content[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Load all contents when on quiz-results page
  useEffect(() => {
    if (currentPage === 'quiz-results') {
      loadContents();
    }
  }, [currentPage]);

  const loadContents = async () => {
    try {
      const response = await API.get('/contents');
      if (Array.isArray(response.data)) {
        setAllContents(response.data);
        // Set first content as default
        if (response.data.length > 0) {
          setSelectedContentId(response.data[0]._id);
          setSelectedContentTitle(response.data[0].title);
        }
      }
    } catch (error) {
      console.error('Failed to load contents:', error);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'content':
        return (
          <div className="space-y-6">
            <ImageFixer />
            <ContentManagement />
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'payments':
        return (
          <div className="space-y-8">
            <PaymentSettings />
            <PendingPayments />
          </div>
        );
      case 'quiz-editor':
        return <QuizEditor />;
      case 'quiz-results':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎬 Fan Fest Participation Results</h2>
              
              {/* Content Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Content to View Results:
                </label>
                <select
                  value={selectedContentId}
                  onChange={(e) => {
                    const selected = allContents.find(c => c._id === e.target.value);
                    setSelectedContentId(e.target.value);
                    setSelectedContentTitle(selected?.title || '');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select a content --</option>
                  {allContents.map(content => (
                    <option key={content._id} value={content._id}>
                      {content.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Component */}
              {selectedContentId && selectedContentTitle ? (
                <QuizResults contentId={selectedContentId} contentTitle={selectedContentTitle} />
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <p className="text-blue-700">Select a content to view quiz results</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        currentPage={currentPage}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">Manage your StreamFlix platform</p>
          </div>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            ⚡ Quick Add Content
          </button>
        </div>

        {/* Quick Add Modal */}
        <QuickAddContent
          isOpen={showQuickAdd}
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => loadContents()}
        />

        {/* Admin Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-800">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'content', label: 'Content' },
              { id: 'users', label: 'Users' },
              { id: 'payments', label: 'Payments' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'quiz-editor', label: 'Fan Fest Editor' },
              { id: 'quiz-results', label: 'Fan Fest Results' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentPage === item.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        {renderContent()}
      </main>
    </div>
  );
};
