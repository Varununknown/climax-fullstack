import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import API from '../../services/api';

export const ServerStatusAlert: React.FC = () => {
  const [isServerDown, setIsServerDown] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await API.get('/contents');
        setIsServerDown(false);
        setHasError(false);
      } catch (error: any) {
        // Check if it's a server connection error (not API error)
        if (!error.response) {
          setIsServerDown(true);
          setHasError(true);
          setCountdown(30);
        }
      }
    };

    // Check status on mount
    checkServerStatus();

    // Set up interval to check every 5 seconds
    const statusInterval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(statusInterval);
  }, []);

  // Countdown timer when server is down
  useEffect(() => {
    if (!isServerDown || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isServerDown, countdown]);

  // Auto refresh when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && isServerDown) {
      window.location.reload();
    }
  }, [countdown, isServerDown]);

  if (!isServerDown) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b-2 border-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-white flex-shrink-0 animate-pulse" />
            <div>
              <h3 className="text-white font-bold text-lg">⏸️ Server is Halted</h3>
              <p className="text-red-100 text-sm">
                Please wait for {countdown} seconds while the server restarts...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full border-2 border-white">
              <span className="text-white font-bold text-lg">{countdown}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-red-900 font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Now
            </button>
          </div>
        </div>
        <div className="mt-3 bg-black/20 rounded p-2 border border-red-500/30">
          <p className="text-red-100 text-xs">
            💡 <strong>Tip:</strong> The server is temporarily unavailable. It will automatically refresh in {countdown} seconds. 
            You can manually refresh the page or click "Refresh Now" to try again immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
