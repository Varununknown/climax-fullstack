import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, LogOut, Share2 } from 'lucide-react';
import { SettingsModal } from '../common/SettingsModal';

const ProfilePage: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return <p className="text-white text-center mt-10">Loading user info...</p>;

  const shareUrl = 'https://downloadclimax.vercel.app'; // <-- Change this link as needed

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
    <div className="text-white flex justify-center mt-10">
      <div
        className="max-w-md w-full rounded-xl shadow-2xl border border-gray-800 p-6 space-y-6
                   bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950
                   hover:from-gray-800 hover:via-gray-700 hover:to-gray-900 transition-all duration-500"
      >
        {/* Avatar + Basic Info */}
        <div className="flex items-center space-x-4">
          <span
            className="inline-flex items-center justify-center w-16 h-16 rounded-full
                       bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900
                       border border-white/10 shadow-lg
                       transform transition-all duration-300 hover:scale-105"
          >
            <User className="w-7 h-7 text-white" />
          </span>
          <div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-gray-300">{user.email}</p>
          </div>
        </div>

        {/* Additional Profile Info */}
        <div className="space-y-2 text-gray-300">
          <p>
            <span className="font-semibold text-white">Role: </span>
            {user.role}
          </p>
          <p>
            <span className="font-semibold text-white">Subscription: </span>
            Pay-up-on-climax
          </p>
          <p>
            <span className="font-semibold text-white">About APP: </span>
            Climax is an OTT platform that allows you to watch movies and shows with pay-per-climax model, ensuring a unique cinematic experience.
          </p>
        </div>

        {/* Action Buttons - Settings & Share side by side */}
        <div className="flex space-x-3 mt-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-gray-300
                       bg-gray-800/30 backdrop-blur-md rounded-xl hover:bg-blue-600/40
                       hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-gray-300
                       bg-gray-800/30 backdrop-blur-md rounded-xl hover:bg-green-600/40
                       hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Sign out button below */}
        <div className="mt-3">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-gray-300
                       bg-gray-800/30 backdrop-blur-md rounded-xl hover:bg-red-600/40
                       hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
