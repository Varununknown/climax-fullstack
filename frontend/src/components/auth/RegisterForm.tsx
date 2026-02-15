import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from './GoogleLoginButton';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usePhone, setUsePhone] = useState(true); // ✅ Default to phone
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // If using phone, validate phone format (10 digits)
    if (usePhone) {
      if (!phone.trim()) {
        setError('Phone number is required');
        return;
      }
      if (!/^\d{10}$/.test(phone)) {
        setError('Phone number must be exactly 10 digits');
        return;
      }
    } else {
      // If using email, email is required
      if (!email.trim()) {
        setError('Email is required');
        return;
      }
    }

    console.log('📝 Starting registration...');
    setSuccess('Creating your account...');
    const success = await register(name, usePhone ? '' : email, password, usePhone ? phone : undefined);
    if (!success) {
      setSuccess('');
      setError('Registration failed. Please try again or use a different email/phone.');
    } else {
      console.log('✅ Registration successful!');
    }
  };
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Join Climax</h2>
        <p className="text-gray-300">Create your free account to start streaming</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gradient-to-br from-black/40 to-gray-900/30 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-lg"
      >
        {/* Google Sign Up */}
        <GoogleLoginButton />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-black/40 to-gray-900/30 text-gray-400">
              Or create with email
            </span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        {/* Email or Phone Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setUsePhone(false);
              setPhone('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              !usePhone
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => {
              setUsePhone(true);
              setEmail('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              usePhone
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email */}
        {!usePhone && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter your email"
                required={!usePhone}
              />
            </div>
          </div>
        )}

        {/* Phone */}
        {usePhone && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number (10 digits)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter your 10-digit phone number"
                required={usePhone}
              />
            </div>
          </div>
        )}

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

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm"
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>

        {/* Error */}
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        {/* Success Message */}
        {success && <div className="text-green-400 text-sm text-center font-medium">{success}</div>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-red-600/80 to-red-500/60 hover:from-red-700/90 hover:to-red-600/70 text-white font-semibold py-3 px-4 rounded-xl backdrop-blur-sm shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-red-500 hover:text-red-400 font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
