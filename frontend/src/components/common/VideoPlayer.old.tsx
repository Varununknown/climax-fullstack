import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Settings, Maximize, Minimize, VolumeX, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';
import API from '../../services/api';

// =====================================================
// 🎬 PREMIUM HIGH-CLASS OTT PLATFORM VIDEO PLAYER
// =====================================================

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ===== CORE STATES =====
  const [content, setContent] = useState<Content | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastValidTime = useRef<number>(0);

  // ===== UI CONTROLS STATES =====
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  
  const qualities = ['Auto', '1080p', '720p', '480p', '360p'];

  // ===== FETCH CONTENT =====
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      try {
        console.log('🎬 Fetching content:', id);
        const res = await API.get(`/contents/${id}`);
        setContent(res.data);
        console.log('✅ Content loaded:', res.data.title);
      } catch (err) {
        console.error('❌ Error fetching content:', err);
        navigate('/');
      }
    };
    fetchContent();
  }, [id, navigate]);

  // ===== CHECK PAYMENT STATUS =====
  useEffect(() => {
    const checkPayment = async () => {
      if (!content || !user) {
        setHasPaid(false);
        return;
      }

      try {
        console.log('💳 Checking payment status...');
        const res = await API.get(
          `/payments/check?userId=${user.id}&contentId=${content._id}`
        );
        const isPaid = res.data.paid;
        console.log(isPaid ? '✅ Payment verified' : '❌ No payment');
        setHasPaid(isPaid);
        if (isPaid) setShowPaymentModal(false);
      } catch (err) {
        console.error('❌ Payment check failed:', err);
        setHasPaid(false);
      }
    };

    checkPayment();
  }, [content, user]);

  // ===== CLIMAX LOCK & SEEK PROTECTION =====
  useEffect(() => {
    if (!content || hasPaid === null) return;
    const video = videoRef.current;
    if (!video) return;

    const climax = content.climaxTimestamp;

    const onTimeUpdate = () => {
      const time = video.currentTime;

      // Pause if reached climax without payment
      if (!hasPaid && time >= climax) {
        video.pause();
        video.currentTime = lastValidTime.current;
        setIsPlaying(false);
        setShowPaymentModal(true);
        return;
      }

      // Track last valid time before climax
      if (time < climax) {
        lastValidTime.current = time;
      }

      setCurrentTime(time);
    };

    const onSeeked = () => {
      // Prevent seeking past climax without payment
      if (!hasPaid && video.currentTime >= climax) {
        video.currentTime = lastValidTime.current;
        video.pause();
        setIsPlaying(false);
        setShowPaymentModal(true);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [content, hasPaid]);

  // ===== PAYMENT SUCCESS HANDLER =====
  const handlePaymentSuccess = async () => {
    if (!content || !user) return;

    try {
      console.log('✅ Payment completed - verifying...');
      const res = await API.get(
        `/payments/check?userId=${user.id}&contentId=${content._id}`
      );
      if (res.data.paid) {
        console.log('✅ Payment verified - resuming');
        setHasPaid(true);
        setShowPaymentModal(false);
        videoRef.current?.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('❌ Error verifying payment:', err);
    }
  };

  // ===== PLAYER CONTROLS =====
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video || !content) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const seekTo = (percentage: number) => {
    const video = videoRef.current;
    if (!video || !content) return;

    const newTime = (percentage / 100) * duration;
    
    // Prevent seeking past climax without payment
    if (!hasPaid && newTime > content.climaxTimestamp && newTime > video.currentTime) {
      console.log('🚫 Seek blocked - payment required');
      setShowPaymentModal(true);
      return;
    }

    video.currentTime = newTime;
  };

  const adjustVolume = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    video.volume = newVolume;
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    
    if (isPlaying) {
      const timeout = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // ===== LOADING STATE =====
  if (!content || hasPaid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-black">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative bg-black min-h-screen flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* VIDEO ELEMENT */}
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        playsInline
      />

      {/* TOP OVERLAY - HEADER */}
      <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={() => navigate(-1)} 
          className="text-white flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="text-white text-center flex-1">
          <h2 className="text-lg font-bold">{content.title}</h2>
          <p className="text-sm text-gray-300">{content.category} • {content.type}</p>
        </div>
        <div className="w-20" />
      </div>

      {/* BUFFERING INDICATOR */}
      {isBuffering && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-spin text-white">
            <RotateCcw className="w-12 h-12" />
          </div>
        </div>
      )}

      {/* PLAY BUTTON OVERLAY */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6 transition-all"
          >
            <Play className="w-12 h-12 fill-current" />
          </button>
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
        }}
      >
        {/* PROGRESS BAR */}
        <div className="w-full px-4 pt-8 pb-2">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded cursor-pointer appearance-none"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 100%)`
            }}
          />
          <div className="flex justify-between text-white text-xs mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="px-4 py-3 flex items-center justify-between text-white">
          {/* LEFT CONTROLS */}
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayPause}
              className="hover:bg-white/20 p-2 rounded transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* VOLUME CONTROL */}
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMute}
                className="hover:bg-white/20 p-2 rounded transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={(e) => adjustVolume(Number(e.target.value) / 100 - volume)}
                className="w-20 h-1 bg-gray-600 rounded cursor-pointer appearance-none"
              />
            </div>

            <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          {/* CENTER - UNLOCK BUTTON */}
          {!hasPaid && content.premiumPrice > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              <span>💳 Unlock (₹{content.premiumPrice})</span>
            </button>
          )}

          {/* RIGHT CONTROLS */}
          <div className="flex items-center space-x-2">
            {/* QUALITY MENU */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="hover:bg-white/20 px-3 py-2 rounded transition-colors text-sm"
              >
                {quality}
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 bg-gray-900 rounded mb-2 py-2 w-32">
                  {qualities.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                        setShowQualityMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-white/20 ${quality === q ? 'bg-red-600' : ''}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="hover:bg-white/20 p-2 rounded transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <PaymentModal
          content={content}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};
