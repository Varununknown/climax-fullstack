import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Token is already stored by GoogleLoginButton
      // Just redirect to home if user is authenticated
      if (user) {
        navigate('/');
      }
    } else {
      // No token found, redirect to login
      navigate('/');
    }
  }, [searchParams, navigate, user]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-white">Completing login...</p>
      </div>
    </div>
  );
};
