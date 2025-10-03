import React, { useState } from 'react';
import { Header } from '../common/Header';
import { DashboardStats } from './DashboardStats';
import { ContentManagement } from './ContentManagement';
import { UserManagement } from './UserManagement';
import { Analytics } from './Analytics';
import { PaymentSettings } from './PaymentSettings';
import { PendingPayments } from './PendingPayments';

export const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'content':
        return <ContentManagement />;
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
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
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
              { id: 'analytics', label: 'Analytics' }
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
