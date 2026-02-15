import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import API from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>; // identifier = email or phone
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for both possible localStorage keys
    let savedUser = localStorage.getItem('streamflix_user');
    if (!savedUser) {
      savedUser = localStorage.getItem('user');
    }
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // ✅ NORMALIZE: Ensure id field exists (handle both email and Google login formats)
        const normalizedUser: User = {
          id: parsedUser.id || parsedUser._id,
          email: parsedUser.email,
          phone: parsedUser.phone,
          name: parsedUser.name,
          role: parsedUser.role,
          subscription: parsedUser.subscription || 'free',
        };
        setUser(normalizedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        localStorage.removeItem('streamflix_user');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login with:', identifier);
      const response = await API.post('/auth/login', { identifier, password });
      console.log('✅ Login response:', response.data);

      const loggedInUser: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        phone: response.data.user.phone,
        name: response.data.user.name,
        role: response.data.user.role,
        subscription: 'free',
      };
      console.log('✅ User object created:', loggedInUser);
      setUser(loggedInUser);
      localStorage.setItem('streamflix_user', JSON.stringify(loggedInUser));
      localStorage.setItem('streamflix_token', response.data.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await API.post('/auth/register', { name, email, password, phone });
      return await login(email, password); // Auto-login with email after registration
    } catch (error) {
      console.error('Registration failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('streamflix_user');
    localStorage.removeItem('streamflix_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
