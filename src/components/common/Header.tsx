import React, { useState } from 'react';
import {
  Search,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  Home,
  Film,
  Tv,
  Radio,
  Space
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SettingsModal } from '../common/SettingsModal';

interface HeaderProps {
  onSearch?: (query: string) => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const navigationItems =
    user?.role === 'admin'
      ? [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'content', label: 'Content', icon: Film },
          { id: 'users', label: 'Users', icon: User },
          { id: 'analytics', label: 'Analytics', icon: Settings }
        ]
      : [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'movies', label: 'Movies', icon: Film },
          { id: 'series', label: 'TV Shows', icon: Tv },
          { id: 'shows', label: 'Shows', icon: Radio }
        ];

  return (
    <>
      <header className="bg-gray-950/70 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/src/components/common/logo3.jpg"
                alt="Climax Logo"
                className="h-8 w-auto object-contain rounded-lg"
              />
              <h1
                className="text-2xl text-white tracking-wide"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
              <space> </space>Climax
              </h1>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate?.(item.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      currentPage === item.id
                        ? 'text-blue-400 border-b-2 border-blue-400 pb-4'
                        : 'text-gray-300 hover:text-blue-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, shows..."
                    className="bg-gray-800/70 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </form>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-300 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                  aria-label="Open profile menu"
                >
                  {/* ✨ PREMIUM CODE-ONLY AVATAR (no image) ✨
                      - round, thin border, subtle hover scale + glow
                      - accessible, preserves click behavior */}
                  <span
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full
                               bg-gradient-to-br from-gray-800/60 to-gray-900/60
                               border border-white/10 shadow-sm
                               transform transition-all duration-200
                               hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    role="img"
                    aria-hidden="true"
                  >
                    <User className="w-5 h-5 text-white" />
                  </span>

                  <span className="hidden sm:block">{user?.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    <div className="p-3 border-b border-gray-700">
                      <p className="text-white font-medium">{user?.name}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded mt-1">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsSettingsOpen(true);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-800 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate?.(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded transition-colors ${
                        currentPage === item.id
                          ? 'text-blue-400 bg-gray-800'
                          : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile search */}
              <form onSubmit={handleSearch} className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, shows..."
                    className="w-full bg-gray-800/70 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
