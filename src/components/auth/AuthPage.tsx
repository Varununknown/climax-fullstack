import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Play } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex rounded-2xl overflow-hidden shadow-2xl">
        {/* Left side - Image Background with overlay */}
        <div
          className="hidden lg:flex lg:w-1/2 bg-cover bg-right p-12 items-center justify-center relative"
          style={{ backgroundImage: "url('/logo4.jpg')" }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-10"></div>
          
          {/* Content on top of image 

          <div className="relative z-10 text-center text-red-100">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-black rounded-full p-4">
                <Play className="w-12 h-12 text-white-600 fill-current" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4"> </h1>
            <p className="text-xl mb-8">
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-300 rounded-full mr-3"></div>
                <span> </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-300 rounded-full mr-3"></div>
                <span>  </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-300 rounded-full mr-3"></div>
                <span></span>
              </div>
            </div>
          </div> */}
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 bg-gray-900 p-8 lg:p-12 flex items-center justify-center">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};
