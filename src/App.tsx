import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import { AuthPage } from "./components/auth/AuthPage";
import { UserDashboard } from "./components/user/UserDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import WatchPage from "./pages/WatchPage";

// ✅ New placeholder pages for navigation
import MoviesPage from "./components/user/MoviesPage";
import ShowsPage from "./components/user/ShowsPage";
import SearchPage from "./components/user/SearchPage";
import ProfilePage from "./components/user/ProfilePage";

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
      {/* Default Home → dashboard based on role */}
      <Route
        path="/"
        element={user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
      />

      {/* Admin-only routes */}
      <Route
        path="/admin/*"
        element={
          user.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />
        }
      />

      {/* User content routes */}
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/shows" element={<ShowsPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Watch page stays same */}
      <Route path="/watch/:id" element={<WatchPage />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <ContentProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ContentProvider>
  );
}

export default App;
