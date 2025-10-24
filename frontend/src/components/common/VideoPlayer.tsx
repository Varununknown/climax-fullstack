import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Maximize, Minimize, VolumeX, RotateCcw, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';
import API from '../../services/api';

// =====================================================
// 🎬 CLIMAX PREMIUM VIDEO PLAYER
// LOGIC: Lock climax→end until payment. Check payment before play.
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
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false); // NEW: Prevent re-checks after payment

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastValidTime = useRef<number>(0);

  // ===== UI STATES =====
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
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
        console.log(`📍 Climax point: ${res.data.climaxTimestamp}s`);
      } catch (err) {
        console.error('❌ Error fetching content:', err);
        navigate('/');
      }
    };
    fetchContent();
  }, [id, navigate]);

  // ===== PRE-PAYMENT CHECK (Before video plays) - CHECK PAYMENT STATUS =====
  useEffect(() => {
    const checkPaymentBeforePlay = async () => {
      if (!content || !user) {
        setHasPaid(false);
        setIsLoadingPayment(false);
        return;
      }

      try {
        console.log('💳 PRE-PAYMENT CHECK for:', content.title);
        console.log('   userId:', user.id);
        console.log('   contentId:', content._id);
        const res = await API.get(
          `/payments/check?userId=${user.id}&contentId=${content._id}`
        );
        const isPaid = res.data.paid;
        console.log(isPaid ? '✅✅✅ USER ALREADY PAID - FULL ACCESS' : '🔒🔒🔒 NOT PAID - CLIMAX LOCKED');
        
        setHasPaid(isPaid);
        
        // IF NOT PAID, IMMEDIATELY SHOW MODAL + PAUSE VIDEO
        if (!isPaid) {
          console.log('📱 Content not paid - showing payment modal immediately');
          setShowPaymentModal(true);
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
        
        setPaymentVerified(true);
      } catch (err) {
        console.error('❌ Payment check failed:', err);
        setHasPaid(false);
        setPaymentVerified(true);
      } finally {
        setIsLoadingPayment(false);
      }
    };

    // Check payment when content loads
    if (content && user && isLoadingPayment) {
      checkPaymentBeforePlay();
    }
  }, [content, user]);

  // ===== PREVENT SEEKING/PLAYING PAST CLIMAX (Locked Zone) =====
  useEffect(() => {
    if (!content || hasPaid === null) return;
    const video = videoRef.current;
    if (!video) return;

    const climax = content.climaxTimestamp;

    // ✅ SEEKING PROTECTION: Can't drag past climax
    const handleSeeking = () => {
      if (hasPaid) return; // No restrictions if paid
      
      const seekTime = video.currentTime;
      
      if (seekTime >= climax) {
        console.log(`🚫 Seek blocked - attempting to enter locked zone at ${seekTime}s`);
        // FORCE rewind to safe zone
        video.currentTime = lastValidTime.current;
        // FORCE pause
        video.pause();
        setIsPlaying(false);
        // Show modal
        setShowPaymentModal(true);
        return;
      }
    };

    // ✅ PLAYING PROTECTION: Can't play past climax
    const handleTimeUpdate = () => {
      // FIRST CHECK: If not paid, always pause at/before climax
      if (!hasPaid && video.currentTime >= climax) {
        console.log(`🔒 HARD LOCK: Attempting to play locked zone at ${video.currentTime}s`);
        video.pause();
        setIsPlaying(false);
        video.currentTime = lastValidTime.current;
        setShowPaymentModal(true);
        return;
      }

      if (hasPaid) {
        // Full access - just track time
        setCurrentTime(video.currentTime);
        lastValidTime.current = video.currentTime;
        return;
      }

      const time = video.currentTime;
      setCurrentTime(time);

      // Track safe zone (before climax)
      if (time < climax) {
        lastValidTime.current = time;
      }
    };

    // ✅ METADATA: Get duration
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      console.log(`⏱️  Duration: ${video.duration}s, Climax: ${climax}s`);
    };

    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [content, hasPaid]);

  // ===== PAYMENT SUCCESS: Immediately unlock + re-verify from DB =====
  const handlePaymentSuccess = async () => {
    if (!content || !user) return;

    try {
      console.log('✅ Payment completed - verifying from database...');
      const res = await API.get(
        `/payments/check?userId=${user.id}&contentId=${content._id}`
      );
      
      if (res.data.paid) {
        console.log('✅ Payment verified - full access unlocked!');
        setHasPaid(true); // Dynamically unlock
        setShowPaymentModal(false); // Close modal
        
        // Resume video from where it paused
        setTimeout(() => {
          videoRef.current?.play();
          setIsPlaying(true);
        }, 100);
      }
    } catch (err) {
      console.error('❌ Error verifying payment:', err);
    }
  };

  // ===== PAUSE VIDEO WHEN MODAL OPENS =====
  useEffect(() => {
    if (showPaymentModal && videoRef.current) {
      console.log('🔒 Payment modal opened - pausing video');
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [showPaymentModal]);

  // ===== PLAYER CONTROLS =====
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video || !content) return;
    
    // If not paid and trying to play, show payment modal
    if (!hasPaid && !isPlaying) {
      console.log('🔒 Attempted to play locked content - showing payment modal');
      setShowPaymentModal(true);
      return;
    }
    
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
    
    // ✅ PREVENT SEEKING INTO LOCKED ZONE
    if (!hasPaid && newTime >= content.climaxTimestamp) {
      console.log('🚫 Can\'t seek into locked zone - payment required');
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
  if (!content || isLoadingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-black">
        <div className="animate-spin">🎬 Loading...</div>
      </div>
    );
  }

  // ===== CLIMAX BADGE: Show if NOT paid =====
  const isClimaxLocked = !hasPaid && content.premiumPrice > 0;
  const climaxPercentage = (content.climaxTimestamp / duration) * 100;

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

      {/* PLAY BUTTON OVERLAY (Center) */}
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

      {/* CLIMAX PREVIEW BADGE - Shows if NOT paid */}
      {isClimaxLocked && (
        <div className="absolute top-24 right-8 bg-red-600/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 animate-pulse">
          <Lock className="w-4 h-4" />
          <span className="font-bold">🔒 CLIMAX PREMIUM</span>
        </div>
      )}

      {/* LOCKED ZONE INDICATOR on progress bar */}
      {isClimaxLocked && duration > 0 && (
        <div 
          className="absolute bottom-32 left-4 right-4 h-1 bg-red-500/30 rounded"
          style={{
            width: `calc(100% - 2rem)`,
            left: '1rem',
            marginLeft: `${climaxPercentage}%`
          }}
        >
          <div className="text-xs text-red-400 -mt-5">🔒 Locked</div>
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
        }}
      >
        {/* PROGRESS BAR with LOCKED ZONE INDICATOR */}
        <div className="w-full px-4 pt-8 pb-2">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded cursor-pointer appearance-none"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 ${duration ? (currentTime / duration) * 100 : 0}%, #4b5563 ${climaxPercentage}%, #991b1b ${climaxPercentage}%, #991b1b 100%)`
              }}
            />
            {/* Locked Zone Label */}
            {isClimaxLocked && (
              <div 
                className="absolute text-xs text-red-400 -mt-5 font-bold"
                style={{ left: `${Math.max(climaxPercentage, 10)}%` }}
              >
                🔒 Locked
              </div>
            )}
          </div>
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

          {/* CENTER - UNLOCK BUTTON or STATUS */}
          {isClimaxLocked && content.premiumPrice > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors animate-pulse"
            >
              <Lock className="w-4 h-4" />
              <span>💳 Unlock (₹{content.premiumPrice})</span>
            </button>
          )}

          {hasPaid && (
            <div className="text-green-400 font-bold text-sm flex items-center space-x-1">
              <span>✅ Full Access Unlocked</span>
            </div>
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
          onClose={() => {
            console.log('🔒 Payment modal closed - keeping video paused');
            // Keep modal closed but video stays paused (user cannot continue without payment)
            setShowPaymentModal(false);
            // Force video to stay paused
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }}
        />
      )}
    </div>
  );
};
