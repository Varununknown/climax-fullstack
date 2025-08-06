import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { AuthPage } from './components/auth/AuthPage';
import { UserDashboard } from './components/user/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import WatchPage from './pages/WatchPage'; // ✅ Import this

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />} 
      />
      <Route 
        path="/admin/*" 
        element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
      />
      <Route path="/watch/:id" element={<WatchPage />} /> {/* ✅ FIXED */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <ContentProvider>
      <AppRoutes />
    </ContentProvider>
  );
}

export default App;
