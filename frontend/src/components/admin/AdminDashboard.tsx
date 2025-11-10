import React, { useState } from 'react';
import { Header } from '../common/Header';
import { DashboardStats } from './DashboardStats';
import { ContentManagement } from './ContentManagement';
import { UserManagement } from './UserManagement';
import { Analytics } from './Analytics';
import { PaymentSettings } from './PaymentSettings';
import { PendingPayments } from './PendingPayments';
import { ImageFixer } from './ImageFixer';
import { FansFestManagement } from './FansFestManagement';
import QuizResults from './QuizResults';

export const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

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
      case 'quiz':
        return <FansFestManagement />;
      case 'quiz-results':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Quiz System Results</h2>
              <p className="text-gray-600">View feedback and participation data from users</p>
            </div>
            <QuizResults contentId="689dd061d104dc0916adbeac" contentTitle="All Content" />
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage your StreamFlix platform</p>
        </div>

        {/* Admin Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-800">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'content', label: 'Content' },
              { id: 'users', label: 'Users' },
              { id: 'payments', label: 'Payments' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'quiz', label: 'Quiz Management' },
              { id: 'quiz-results', label: 'Quiz Results' }
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
