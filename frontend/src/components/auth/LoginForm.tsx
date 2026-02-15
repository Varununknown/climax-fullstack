import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLoginButton } from './GoogleLoginButton';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(identifier, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid email/phone or password');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-300">Sign in to your Climax Account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gradient-to-br from-black/40 to-gray-900/30 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-lg"
      >
        {/* Email/Phone Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setIsPhoneMode(false);
              setIdentifier('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              !isPhoneMode
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPhoneMode(true);
              setIdentifier('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              isPhoneMode
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email or Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isPhoneMode ? 'Phone Number' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={isPhoneMode ? 'tel' : 'email'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
              placeholder={isPhoneMode ? 'Enter your phone number' : 'Enter your email'}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-red-600/80 to-red-500/60 hover:from-red-700/90 hover:to-red-600/70 text-white font-semibold py-3 px-4 rounded-xl backdrop-blur-sm shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
        <span className="text-gray-400 text-sm">OR</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
      </div>

      {/* Google Login Button */}
      <div className="mt-6">
        <GoogleLoginButton />
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-red-500 hover:text-red-400 font-semibold"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};
