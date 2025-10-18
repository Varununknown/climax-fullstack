import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Settings, SkipBack, SkipForward, Maximize, VolumeX, RotateCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';
import API from '../../services/api';

// =====================================================
// 🎬 PREMIUM HIGH-CLASS OTT PLATFORM VIDEO PLAYER
// =====================================================

interface PaymentState {
  isLoading: boolean;
  isPaid: boolean;
  shouldShowModal: boolean;
}

export const PremiumVideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ===== STATE MANAGEMENT =====
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ===== PAYMENT STATE (PRESERVED BUSINESS LOGIC) =====
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isLoading: true,
    isPaid: false,
    shouldShowModal: false
  });
  
  // ===== PREMIUM VIDEO PLAYER STATE =====
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Mobile controls
  const [lastTap, setLastTap] = useState<{ time: number; side: 'left' | 'right' } | null>(null);
  
  // ===== PAYWALL TRACKING (PRESERVED) =====
  const [previousTime, setPreviousTime] = useState<number>(0);
  
  // Auto-hide controls
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Available qualities
  const qualities = ['Auto', '1080p', '720p', '480p', '360p'];

  // ===== CONTENT FETCHING (PRESERVED EXACTLY) =====
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setError('Content ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get(`/contents/${id}`);
        setContent(response.data);
      } catch (err: any) {
        console.error('Error fetching content:', err);
        setError(err.response?.status === 404 ? 'Content not found' : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  // ===== PAYMENT STATUS CHECKING (PRESERVED EXACTLY) =====
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!content || !user) {
        setPaymentState(prev => ({ ...prev, isLoading: false, isPaid: false }));
        return;
      }

      try {
        // Multi-layer payment verification for persistence
        const cacheKey = `payment_${user.id}_${content._id}`;
        const permanentKey = `payment_permanent_${user.id}_${content._id}`;
        
        // Check permanent storage first (never cleared)
        const permanentPayment = localStorage.getItem(permanentKey);
        if (permanentPayment === 'approved') {
          setPaymentState(prev => ({ ...prev, isPaid: true, isLoading: false }));
          return;
        }
        
        // Check regular cache
        const cachedPayment = localStorage.getItem(cacheKey);
        if (cachedPayment === 'true') {
          setPaymentState(prev => ({ ...prev, isPaid: true, isLoading: false }));
          return;
        }

        // Check server for payment (final authority)
        const response = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
        const isPaid = response.data.paid;
        
        setPaymentState(prev => ({ ...prev, isPaid, isLoading: false }));
        
        // Cache the result and make permanent if paid
        if (isPaid) {
          localStorage.setItem(cacheKey, 'true');
          localStorage.setItem(permanentKey, 'approved');
        }
        
      } catch (err) {
        console.error('Payment check failed:', err);
        
        // If server fails but we have permanent payment, trust permanent status
        const permanentKey = `payment_permanent_${user.id}_${content._id}`;
        const permanentPayment = localStorage.getItem(permanentKey);
        
        if (permanentPayment === 'approved') {
          setPaymentState(prev => ({ ...prev, isPaid: true, isLoading: false }));
        } else {
          setPaymentState(prev => ({ ...prev, isLoading: false, isPaid: false }));
        }
      }
    };

    checkPaymentStatus();
  }, [content, user]);

  // ===== VIDEO EVENT HANDLERS (WITH PRESERVED PAYWALL LOGIC) =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !content) return;

    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      setCurrentTime(currentTime);
      
      // PRESERVED PAYWALL LOGIC - Check if user is moving FORWARD past the climax timestamp
      if (!paymentState.isPaid && currentTime >= content.climaxTimestamp && currentTime > previousTime) {
        console.log('🚫 Paywall triggered - user moved FORWARD past climax timestamp');
        
        // Immediately pause and prevent further playback
        video.pause();
        video.currentTime = Math.max(0, content.climaxTimestamp - 1);
        setIsPlaying(false);
        setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
        
        // Remove timeupdate listener temporarily to prevent loop
        video.removeEventListener('timeupdate', onTimeUpdate);
        
        // Re-add after a brief delay to allow state to settle
        setTimeout(() => {
          if (video && !paymentState.isPaid) {
            video.addEventListener('timeupdate', onTimeUpdate);
          }
        }, 100);
      }
      
      // Update previous time for next comparison
      setPreviousTime(currentTime);
    };

    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, [content, paymentState.isPaid, previousTime]);

  // ===== PREMIUM CONTROL FUNCTIONS =====
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    // PRESERVED PAYWALL CHECK
    if (!paymentState.isPaid && video.currentTime >= (content?.climaxTimestamp || 0) - 1) {
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.MouseEvent) => {
    const video = videoRef.current;
    if (!video || !content) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const newTime = percentage * duration;
    
    // PRESERVED PAYWALL CHECK - only trigger if seeking FORWARD past climax
    if (!paymentState.isPaid && newTime > content.climaxTimestamp && newTime > video.currentTime) {
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    // Allow seeking backward freely, even past climax
    video.currentTime = newTime;
    setPreviousTime(newTime);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !content) return;

    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    
    // PRESERVED PAYWALL CHECK for forward seeking only
    if (!paymentState.isPaid && newTime > content.climaxTimestamp && seconds > 0) {
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    video.currentTime = newTime;
    setPreviousTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const changeVolume = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.max(0, Math.min(1, newVolume));
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
      // Auto-rotate to landscape on mobile
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
    setShowQualityMenu(false);
    // Here you would implement actual quality switching logic
  };

  // Mobile touch handlers (PRESERVED)
  const handleMobileTouch = (e: React.TouchEvent, side: 'left' | 'right') => {
    if (window.innerWidth > 768) return;

    e.preventDefault();
    const now = Date.now();
    
    if (lastTap && lastTap.side === side && now - lastTap.time < 250) {
      // Double tap detected - LEFT = FORWARD, RIGHT = BACKWARD
      if (side === 'left') {
        skipTime(10); // LEFT taps = FORWARD 
      } else {
        skipTime(-10); // RIGHT taps = BACKWARD  
      }
      setLastTap(null);
    } else {
      setLastTap({ time: now, side });
    }
  };

  // Auto-hide controls
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    
    const timeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  // PRESERVED PAYMENT SUCCESS HANDLER
  const handlePaymentSuccess = () => {
    setPaymentState({
      isLoading: false,
      isPaid: true,
      shouldShowModal: false
    });

    // PRESERVED PERMANENT PAYMENT STATUS
    if (content && user) {
      const cacheKey = `payment_${user.id}_${content._id}`;
      const permanentKey = `payment_permanent_${user.id}_${content._id}`;
      
      localStorage.setItem(cacheKey, 'true');
      localStorage.setItem(permanentKey, 'approved');
    }

    // Resume playback
    const video = videoRef.current;
    if (video) {
      video.play();
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== LOADING & ERROR STATES =====
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Premium Content</h2>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Content Unavailable</h2>
          <p className="text-gray-400 mb-6">{error || 'Content not found'}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black relative overflow-hidden"
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-50 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm transition-all"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Video Container */}
      <div className="relative w-full h-screen">
        {/* Main Video Element */}
        <video
          ref={videoRef}
          src={content.videoUrl}
          className="w-full h-full object-contain bg-black"
          playsInline
          autoPlay
          muted
          preload="metadata"
          onClick={togglePlayPause}
        />

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30">
            <div className="bg-black/80 rounded-lg p-4 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-red-600 border-t-transparent mx-auto mb-2"></div>
              <p className="text-white text-sm">Loading...</p>
            </div>
          </div>
        )}

        {/* Mobile Touch Areas */}
        {window.innerWidth <= 768 && (
          <>
            {/* Left Half - Forward */}
            <div
              className="absolute top-0 left-0 w-1/2 h-full z-20"
              onTouchStart={(e) => handleMobileTouch(e, 'left')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            />
            
            {/* Right Half - Backward */}
            <div
              className="absolute top-0 right-0 w-1/2 h-full z-20"
              onTouchStart={(e) => handleMobileTouch(e, 'right')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            />
          </>
        )}

        {/* Premium YouTube-Style Controls */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
        >
          {/* Progress Bar */}
          <div className="px-6 pb-2">
            <div 
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer group hover:h-3 transition-all"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-red-600 rounded-full relative transition-all group-hover:bg-red-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between px-6 pb-6">
            {/* Left Controls */}
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-red-400 transition-colors p-2"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>

              {/* Skip Controls */}
              <button
                onClick={() => skipTime(-10)}
                className="text-white hover:text-red-400 transition-colors"
              >
                <SkipBack size={24} />
              </button>
              
              <button
                onClick={() => skipTime(10)}
                className="text-white hover:text-red-400 transition-colors"
              >
                <SkipForward size={24} />
              </button>

              {/* Volume Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                
                <div 
                  className="w-20 h-1 bg-white/30 rounded-full cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percentage = (e.clientX - rect.left) / rect.width;
                    changeVolume(percentage);
                  }}
                >
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>

              {/* Time Display */}
              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              {/* Quality Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:text-red-400 transition-colors flex items-center space-x-1"
                >
                  <Settings size={24} />
                  <span className="text-sm">{quality}</span>
                </button>

                {/* Quality Menu */}
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden">
                    {qualities.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQualityChange(q)}
                        className={`block w-full px-4 py-2 text-left text-white hover:bg-red-600/50 transition-colors ${
                          quality === q ? 'bg-red-600/30' : ''
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-400 transition-colors"
              >
                <Maximize size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRESERVED PAYMENT MODAL */}
      {paymentState.shouldShowModal && content && user && (
        <PaymentModal
          content={content}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            console.log('📴 Payment modal cancelled - FORCE PAUSING video');
            setPaymentState(prev => ({ ...prev, shouldShowModal: false }));
            
            // PRESERVED CANCEL LOGIC
            const video = videoRef.current;
            if (video && !paymentState.isPaid) {
              video.pause();
              const safePosition = Math.max(0, content.climaxTimestamp - 2);
              video.currentTime = safePosition;
              setIsPlaying(false);
              setPreviousTime(safePosition);
            }
          }}
        />
      )}
    </div>
  );
};

export { PremiumVideoPlayer as VideoPlayer };