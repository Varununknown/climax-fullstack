import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export const GoogleLoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect if running in Median app
  const isMedianApp = () => {
    return /median|mobileweb/i.test(navigator.userAgent) || 
           (window as any).__MEDIAN__ !== undefined ||
           (window as any).__CORDOVA__ !== undefined;
  };

  // Use implicit flow for Median, auth-code for browsers
  const usingImplicitFlow = isMedianApp();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response: any) => {
      setIsLoading(true);
      setError('');

      try {
        // Handle both auth-code flow (browser) and implicit flow (Median)
        const payload = usingImplicitFlow 
          ? { access_token: response.access_token }  // implicit flow
          : { code: response.code };  // auth-code flow

        // Send the authorization code/token to backend
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/google/signin`,
          payload
        );

        if (res.data && res.data.token && res.data.user) {
          // Store token and user in localStorage (SAME FORMAT as email login)
          localStorage.setItem('streamflix_user', JSON.stringify(res.data.user));
          localStorage.setItem('streamflix_token', res.data.token);
          // Also set backup keys for compatibility
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));

          // Force a page reload to trigger auth context update
          window.location.href = '/';
        } else {
          setError('Login failed. Please try again.');
        }
      } catch (err: unknown) {
        console.error('Google login error:', err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.error || 'Failed to login with Google. Please try again.'
          );
        } else {
          setError('Failed to login with Google. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Failed to authenticate with Google');
      setIsLoading(false);
    },
    // ✅ Use 'implicit' for Median app (webview), 'auth-code' for browsers
    flow: usingImplicitFlow ? 'implicit' : 'auth-code',
    scope: 'openid email profile',
  });

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-4 rounded-xl backdrop-blur-sm shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      
      {/* ℹ️ Info text for Median app users */}
      <p className="text-xs text-gray-400 text-center mt-3">
        💡 <span className="text-gray-300">For Google login, please use from browser</span>
      </p>
    </div>
  );
};
