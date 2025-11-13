import React, { useState } from 'react';
import {
  Search,
  User,
  Settings,
  LogOut,
  Home,
  Film,
  Tv,
  Radio,
  Cast
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SettingsModal } from '../common/SettingsModal';

interface HeaderProps {
  onSearch?: (query: string) => void;
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, currentPage }) => {
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

  // 🌐 Direct href navigation items
  const navigationItems =
    user?.role === 'admin'
      ? [
          { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
          { id: 'content', label: 'Content', icon: Film, href: '/content' },
          { id: 'users', label: 'Users', icon: User, href: '/users' },
          { id: 'analytics', label: 'Analytics', icon: Settings, href: '/analytics' }
        ]
      : [
          { id: 'home', label: 'Home', icon: Home, href: '/' },
          { id: 'movies', label: 'Movies', icon: Film, href: '/movies' },
          { id: 'series', label: 'TV Shows', icon: Tv, href: '/series' },
          { id: 'shows', label: 'Shows', icon: Radio, href: '/shows' }
        ];

  return (
    <>
      <header className="bg-transparent backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/logo6.jpg"
                alt="Climax Logo"
                className="h-8 w-auto object-contain rounded-lg-400 shadow-md"
              /> 
              <h1
                className="text-2xl text-white font-semibold tracking-wide drop-shadow-md"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Climax
              </h1>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                      currentPage === item.id
                        ? 'text-blue-400 border-b-2 border-blue-400 pb-4 shadow-blue-400/50'
                        : 'text-gray-300 hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(0,0,255,0.5)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </a>
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
                    className="bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 backdrop-blur-lg"
                  />
                </div>
              </form>

              {/* Cast Icon */}
              <a href="https://climaxott.vercel.app" className="text-gray-300 hover:text-blue-400 transition-colors">
                <Cast className="w-6 h-6" />
              </a>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isProfileOpen}
                  aria-label="Open profile menu"
                >
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
                  <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <p className="text-white font-medium">{user?.name}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded mt-2">
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
                        className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
