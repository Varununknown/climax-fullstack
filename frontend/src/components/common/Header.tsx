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
  Cast,
  X,
  Tv2,
  Smartphone
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
  const [isCastOpen, setIsCastOpen] = useState(false);
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
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-200 ${
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
              <button onClick={() => setIsCastOpen(true)} className="text-gray-300 hover:text-blue-400 transition-colors hover:scale-110">
                <Cast className="w-6 h-6" />
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

      {/* Cast to Android TV Modal */}
      {isCastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-blue-500/30 shadow-lg scrollbar-hide">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 via-blue-900/20 to-slate-900 border-b border-blue-500/20 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Tv2 className="w-6 h-6 text-blue-400" />
                Cast to Android TV
              </h2>
              <button onClick={() => setIsCastOpen(false)} className="text-gray-400 hover:text-white transition-colors duration-150">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Logo Image */}
              <div className="flex justify-center mb-4">
                <img 
                  src="/logo1.jpg" 
                  alt="Cast Feature" 
                  className="w-full max-w-sm rounded-lg shadow-lg border border-blue-500/30"
                />
              </div>

              {/* Coming Soon Banner */}
              <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl p-4 text-center">
                <h3 className="text-xl font-bold text-white mb-1">🎬 Coming Soon</h3>
                <p className="text-blue-300 font-semibold">Cast Your Content to Android TV</p>
              </div>

              {/* Feature Description */}
              <div className="space-y-3">
                <div className="bg-slate-800/40 rounded-lg p-3 border border-blue-500/20">
                  <div className="flex gap-3">
                    <Tv2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Android TV Support</p>
                      <p className="text-gray-300 text-xs">Cast from mobile to Android TV with one tap.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 rounded-lg p-3 border border-blue-500/20">
                  <div className="flex gap-3">
                    <Smartphone className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Multi-Device Casting</p>
                      <p className="text-gray-300 text-xs">Control playback from your phone on the big screen.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 rounded-lg p-3 border border-blue-500/20">
                  <div className="flex gap-3">
                    <Cast className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Premium Streaming</p>
                      <p className="text-gray-300 text-xs">High-quality streaming directly on your television.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Benefits */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Upcoming Features</h4>
                <ul className="space-y-1 text-gray-300 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Full HD (1080p) & 4K support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    One-click pairing with Android TV
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Remote control integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Chromecast support
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-blue-500/20">
                <button
                  onClick={() => setIsCastOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 
                             hover:from-slate-600 hover:to-slate-700 rounded-xl font-semibold transition-all
                             shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm"
                >
                  Close
                </button>

                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 
                             hover:from-blue-500 hover:to-cyan-500 rounded-xl font-semibold transition-all
                             shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smooth Scrolling Styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

