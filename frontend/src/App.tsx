import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import { AuthPage } from "./components/auth/AuthPage";
import { UserDashboard } from "./components/user/UserDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import WatchPage from "./pages/WatchPage";
import { ContentDetailsPage } from "./pages/ContentDetailsPage";

// ✅ New placeholder pages for navigation
import MoviesPage from "./components/user/MoviesPage";
import ShowsPage from "./components/user/ShowsPage";
import SearchPage from "./components/user/SearchPage";
import ProfilePage from "./components/user/ProfilePage";
import { OAuthCallback } from "./components/auth/OAuthCallback";

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* OAuth Callback route - accessible without login */}
      <Route path="/auth/success" element={<OAuthCallback />} />

      {/* Auth page - accessible without login */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected routes - require authentication */}
      {user ? (
        <>
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

          {/* Content Details Page - shows before playing */}
          <Route path="/content/:id" element={<ContentDetailsPage />} />

          {/* Watch page stays same */}
          <Route path="/watch/:id" element={<WatchPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <>
          {/* Redirect to auth page if not logged in */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </>
      )}
    </Routes>
  );
};

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ContentProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ContentProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
