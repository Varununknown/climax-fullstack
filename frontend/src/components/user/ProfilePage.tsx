import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, LogOut, Share2, Star, Clock, Award, Eye, Zap, Shield, FileText } from 'lucide-react';
import { SettingsModal } from '../common/SettingsModal';
import { TermsModal } from '../common/TermsModal';

const ProfilePage: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return <p className="text-white text-center mt-10">Loading user info...</p>;

  const shareUrl = 'https://downloadclimax.vercel.app';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Climax OTT Platform',
        text: 'Check out Climax – the OTT platform with pay-on-climax movies!',
        url: shareUrl,
      });
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="text-white flex justify-center mt-6 sm:mt-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Profile Card */}
        <div className="rounded-2xl shadow-2xl border border-purple-500/20 p-6 sm:p-8 space-y-6
                        bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-950
                        hover:border-purple-500/40 transition-all duration-300">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full
                            bg-gradient-to-br from-purple-600 via-blue-500 to-pink-500
                            flex items-center justify-center shadow-xl border-4 border-slate-900
                            transform transition-all duration-300 hover:scale-105">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-purple-300 text-lg mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-4 py-1.5 bg-purple-600/30 border border-purple-500/50 rounded-full text-sm font-semibold text-purple-200">
                  {user.role}
                </span>
                <span className="px-4 py-1.5 bg-blue-600/30 border border-blue-500/50 rounded-full text-sm font-semibold text-blue-200">
                  Premium Member
                </span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-purple-500/20">
            <div className="bg-slate-800/40 rounded-xl p-4 text-center hover:bg-slate-800/60 transition-all">
              <Eye className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold">24</p>
              <p className="text-xs text-gray-400">Watched</p>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 text-center hover:bg-slate-800/60 transition-all">
              <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold">4.8</p>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 text-center hover:bg-slate-800/60 transition-all">
              <Award className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold">12</p>
              <p className="text-xs text-gray-400">Badges</p>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 text-center hover:bg-slate-800/60 transition-all">
              <Zap className="w-5 h-5 text-orange-400 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold">87%</p>
              <p className="text-xs text-gray-400">Active</p>
            </div>
          </div>

          {/* Subscription & Details Section */}
          <div className="space-y-3 pt-2 border-t border-purple-500/20">
            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-all">
              <div>
                <p className="font-semibold text-white">Subscription Plan</p>
                <p className="text-sm text-gray-400">Pay-on-Climax Premium</p>
              </div>
              <span className="px-3 py-1 bg-green-600/30 border border-green-500/50 rounded-full text-xs font-bold text-green-300">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-all">
              <div>
                <p className="font-semibold text-white">Account Status</p>
                <p className="text-sm text-gray-400">Verified & Premium</p>
              </div>
              <Shield className="w-5 h-5 text-green-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-all">
              <div>
                <p className="font-semibold text-white">Member Since</p>
                <p className="text-sm text-gray-400">Nov 13, 2025</p>
              </div>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          {/* About Section */}
          <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl">
            <p className="text-sm text-gray-200 leading-relaxed">
              🎬 Experience the unique <span className="font-bold text-purple-300">Climax Entertainment</span> platform. Watch premium content with our innovative pay-when-excited model. Enjoy unlimited streaming, exclusive events, and interactive fan experiences.
            </p>
          </div>

          {/* Preferences Section */}
          <div className="space-y-3 pt-2 border-t border-purple-500/20">
            <h3 className="font-semibold text-white text-lg">Preferences</h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-all">
              <div>
                <p className="font-semibold text-white">Push Notifications</p>
                <p className="text-xs text-gray-400">Get updates on new releases</p>
              </div>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-12 h-7 rounded-full transition-all ${
                  notificationsEnabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : ''
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-all">
              <div>
                <p className="font-semibold text-white">Private Profile</p>
                <p className="text-xs text-gray-400">Hide your activity</p>
              </div>
              <button 
                onClick={() => setPrivateMode(!privateMode)}
                className={`relative w-12 h-7 rounded-full transition-all ${
                  privateMode ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  privateMode ? 'translate-x-5' : ''
                }`}></div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-purple-500/20">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 
                         hover:from-blue-500 hover:to-blue-600 rounded-xl font-semibold transition-all
                         shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setIsTermsOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 
                         hover:from-purple-500 hover:to-purple-600 rounded-xl font-semibold transition-all
                         shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <FileText className="w-5 h-5" />
              <span>Terms</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 
                         hover:from-green-500 hover:to-green-600 rounded-xl font-semibold transition-all
                         shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 
                         hover:from-red-500 hover:to-red-600 rounded-xl font-semibold transition-all
                         shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Last active: Today at 2:45 PM • Profile updated: Nov 13, 2025</p>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}
      
      {/* Terms Modal */}
      {isTermsOpen && (
        <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
