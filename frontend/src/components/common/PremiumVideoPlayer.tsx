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
  
  // ===== ADAPTIVE STREAMING SYSTEM (Amazon Prime Video Level) =====
  const [networkSpeed, setNetworkSpeed] = useState<number>(0);
  const [adaptiveQuality, setAdaptiveQuality] = useState<string>('720p');
  const [adaptiveUrls, setAdaptiveUrls] = useState<{[key: string]: string}>({});
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [qualityLevels] = useState([
    { label: 'Auto', value: 'auto', bitrate: 0 },
    { label: '1080p', value: '1080p', bitrate: 5000 },
    { label: '720p', value: '720p', bitrate: 2500 },
    { label: '480p', value: '480p', bitrate: 1000 },
    { label: '360p', value: '360p', bitrate: 500 }
  ]);
  
  // Mobile controls
  const [lastTap, setLastTap] = useState<{ time: number; side: 'left' | 'right' } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // ===== PAYWALL TRACKING (PRESERVED) =====
  const [previousTime, setPreviousTime] = useState<number>(0);
  
  // Auto-hide controls
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  
  // Fast loading optimization
  const [isVideoReady, setIsVideoReady] = useState(false);

  // ===== NETWORK & QUALITY DETECTION =====
  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Network speed detection for auto quality
    const detectNetworkSpeed = async () => {
      try {
        // Use multiple test approaches for better accuracy
        const connectionSpeed = (navigator as any).connection?.effectiveType;
        let autoQuality = '720p'; // default
        
        if (connectionSpeed) {
          // Use browser's connection API if available
          switch (connectionSpeed) {
            case 'slow-2g':
            case '2g':
              autoQuality = '360p';
              break;
            case '3g':
              autoQuality = '480p';
              break;
            case '4g':
              autoQuality = '1080p';
              break;
            default:
              autoQuality = '720p';
          }
          console.log(`🌐 Network type: ${connectionSpeed}, Auto quality: ${autoQuality}`);
        } else {
          // Fallback: Test download speed
          const startTime = Date.now();
          await fetch('https://www.w3schools.com/html/mov_bbb.mp4', { 
            method: 'HEAD',
            cache: 'no-cache'
          });
          const duration = Date.now() - startTime;
          
          // Determine quality based on response time
          if (duration < 100) {
            autoQuality = '1080p'; // Very fast
          } else if (duration < 300) {
            autoQuality = '720p';  // Fast
          } else if (duration < 800) {
            autoQuality = '480p';  // Medium
          } else {
            autoQuality = '360p';  // Slow
          }
          
          console.log(`📊 Network test: ${duration}ms, Auto quality: ${autoQuality}`);
        }
        
        // Auto-select quality based on network speed
        if (quality === 'Auto') {
          setAdaptiveQuality(autoQuality);
          console.log(`🎯 Auto quality set to: ${autoQuality}`);
        }
        
        setNetworkSpeed(connectionSpeed === 'slow-2g' ? 1000 : 200);
      } catch (error) {
        console.log('Network detection failed, defaulting to 720p');
        setAdaptiveQuality('720p');
      }
    };
    
    detectNetworkSpeed();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [quality]);

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
        setError(null);
        const response = await API.get(`/contents/${id}`);
        const contentData = response.data;
        setContent(contentData);
        
        // Set up adaptive streaming URLs if available
        if (contentData.adaptiveUrls) {
          setAdaptiveUrls(contentData.adaptiveUrls);
          console.log('🎯 Adaptive streaming URLs available:', Object.keys(contentData.adaptiveUrls));
        }
        
        // Use CDN-optimized URL for immediate loading - Fixed fallback logic
        const videoUrl = contentData.adaptiveUrls?.auto || contentData.videoUrl;
        setCurrentVideoUrl(videoUrl);
        
        // Debug logging to see what URL we're using
        console.log('🎬 Video URL set to:', videoUrl);
        console.log('🎬 Content data:', contentData.title, 'has adaptiveUrls:', !!contentData.adaptiveUrls);
        
        // Amazon Prime Video style: Preload multiple qualities (only if available)
        if (contentData.adaptiveUrls) {
          Object.values(contentData.adaptiveUrls as Record<string, string>).forEach((url, index) => {
            setTimeout(() => {
              const preloadVideo = document.createElement('video');
              preloadVideo.preload = 'metadata';
              preloadVideo.src = url;
              preloadVideo.load();
            }, index * 100); // Stagger preloading
          });
          console.log('🚀 CDN-optimized video preloading started');
        } else {
          console.log('📺 Using direct video URL (no adaptive streaming)');
        }
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

  // ===== VIDEO EVENT HANDLERS (WITH PRESERVED PAYWALL LOGIC + FAST LOADING) =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !content) return;

    // ===== FAST LOADING OPTIMIZATIONS =====
    const onLoadStart = () => {
      console.log('🚀 Video loading started');
      // Don't show buffering immediately for faster perceived loading
    };

    const onLoadedData = () => {
      console.log('✅ Video data loaded');
      setIsVideoReady(true);
      setIsBuffering(false);
      
      // Immediately try to play for instant start
      setTimeout(() => {
        if (video.readyState >= 2) {
          video.play().catch(() => {
            console.log('Auto-play prevented by browser');
          });
        }
      }, 100);
    };

    const onCanPlayThrough = () => {
      console.log('🎯 Video can play through without buffering');
      setIsBuffering(false);
      
      // Ensure instant playback start
      if (!isPlaying && video.paused) {
        video.play().catch(() => {
          console.log('Auto-play prevented');
        });
      }
    };

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

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      console.log('📊 Video metadata loaded, duration:', video.duration);
    };
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    const onWaiting = () => {
      // Only show buffering after a short delay to avoid flickering
      setTimeout(() => {
        if (video.readyState < 3) {
          console.log('⏳ Video buffering...');
          setIsBuffering(true);
        }
      }, 500);
    };
    
    const onCanPlay = () => {
      console.log('▶️ Video ready to play');
      setIsBuffering(false);
      
      // Try immediate playback
      if (video.paused && !isPlaying) {
        video.play().catch(() => {
          console.log('Auto-play prevented');
        });
      }
    };
    
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    // Add all event listeners including fast loading ones
    video.addEventListener('loadstart', onLoadStart);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('loadstart', onLoadStart);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplaythrough', onCanPlayThrough);
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
    if (!video) {
      console.log('🚫 No video element available');
      return;
    }

    console.log('🎬 Toggle play/pause called, current state:', isPlaying);
    console.log('🎬 Video URL:', video.src);
    console.log('🎬 Video ready state:', video.readyState);

    // PRESERVED PAYWALL CHECK
    if (!paymentState.isPaid && video.currentTime >= (content?.climaxTimestamp || 0) - 1) {
      console.log('🚫 Paywall triggered');
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    if (isPlaying) {
      console.log('⏸️ Pausing video');
      video.pause();
    } else {
      console.log('▶️ Playing video');
      video.play().catch(err => {
        console.error('🚫 Play failed:', err);
      });
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
      if (screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock('landscape').catch(() => {
          console.log('Screen orientation lock not supported');
        });
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
    
    const video = videoRef.current;
    if (!video) return;
    
    // Store current time for seamless quality switching
    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;
    
    // Amazon Prime Video style: Instant quality switching with CDN URLs
    let targetUrl = '';
    
    if (newQuality === 'Auto') {
      targetUrl = adaptiveUrls.auto || adaptiveUrls[adaptiveQuality] || currentVideoUrl;
    } else {
      const qualityKey = newQuality.toLowerCase();
      targetUrl = adaptiveUrls[qualityKey] || currentVideoUrl;
      setAdaptiveQuality(newQuality);
    }
    
    if (targetUrl && targetUrl !== video.src) {
      console.log(`🎯 Quality switching to: ${newQuality} (${targetUrl})`);
      
      // Seamless quality switch
      video.src = targetUrl;
      setCurrentVideoUrl(targetUrl);
      
      // Resume at exact same time
      video.addEventListener('loadeddata', function resumePlayback() {
        video.currentTime = currentTime;
        if (wasPlaying) {
          video.play();
        }
        video.removeEventListener('loadeddata', resumePlayback);
      });
      
      video.load();
    }
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

  // ===== LOADING & ERROR STATES - OPTIMIZED =====
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold mb-2">Loading Premium Content</h2>
          <p className="text-gray-400 text-sm">Preparing your video...</p>
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
        {/* Main Video Element - CDN Optimized for Amazon Prime Video Speed */}
        <video
          ref={videoRef}
          src={currentVideoUrl || content.videoUrl}
          className="w-full h-full object-contain bg-black"
          playsInline
          muted={true}
          preload="auto"
          crossOrigin="anonymous"
          onClick={togglePlayPause}
          onError={(e) => {
            console.error('🚫 Video loading error:', e);
            console.error('🚫 Failed URL:', currentVideoUrl || content.videoUrl);
          }}
          onLoadStart={() => console.log('🎬 Video load started')}
          onCanPlay={() => console.log('✅ Video can play')}
          style={{
            // Hardware acceleration for smooth playback
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: 1000
          }}
        />

        {/* Buffering Indicator - Less Intrusive */}
        {isBuffering && (
          <div className="absolute top-4 right-4 z-30">
            <div className="bg-black/60 rounded-full p-3 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
            </div>
          </div>
        )}

        {/* Mobile Touch Areas - Enhanced for Portrait Mode */}
        {isMobile && (
          <>
            {/* Left Half - Forward (better touch zone) */}
            <div
              className="absolute top-0 left-0 w-1/2 h-full z-20 flex items-center justify-center"
              onTouchStart={(e) => handleMobileTouch(e, 'left')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {/* Visual feedback for double tap */}
              <div className="opacity-0 pointer-events-none">
                <SkipForward size={32} className="text-white" />
              </div>
            </div>
            
            {/* Right Half - Backward (better touch zone) */}
            <div
              className="absolute top-0 right-0 w-1/2 h-full z-20 flex items-center justify-center"
              onTouchStart={(e) => handleMobileTouch(e, 'right')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {/* Visual feedback for double tap */}
              <div className="opacity-0 pointer-events-none">
                <SkipBack size={32} className="text-white" />
              </div>
            </div>
          </>
        )}

        {/* Premium YouTube-Style Controls - Mobile Optimized */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
        >
          {/* Progress Bar - Mobile Friendly */}
          <div className={`px-4 pb-2 ${isMobile ? 'px-6 pb-4' : 'px-6 pb-2'}`}>
            <div 
              className={`w-full bg-white/20 rounded-full cursor-pointer group transition-all ${
                isMobile ? 'h-3 hover:h-4' : 'h-2 hover:h-3'
              }`}
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-red-600 rounded-full relative transition-all group-hover:bg-red-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ${
                  isMobile ? 'w-5 h-5' : 'w-4 h-4'
                }`} />
              </div>
            </div>
          </div>

          {/* Main Controls - Responsive Layout */}
          <div className={`flex items-center justify-between pb-6 ${
            isMobile ? 'px-4 pb-8' : 'px-6 pb-6'
          }`}>
            {/* Left Controls - Mobile Optimized */}
            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
              {/* Play/Pause - Larger on mobile */}
              <button
                onClick={togglePlayPause}
                className={`text-white hover:text-red-400 transition-colors ${
                  isMobile ? 'p-3' : 'p-2'
                }`}
              >
                {isPlaying ? <Pause size={isMobile ? 36 : 32} /> : <Play size={isMobile ? 36 : 32} />}
              </button>

              {/* Skip Controls - Responsive sizing */}
              {!isMobile && (
                <>
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
                </>
              )}

              {/* Volume Controls - Hide on mobile portrait */}
              {!isMobile && (
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
              )}

              {/* Time Display - Smaller on mobile */}
              <span className={`text-white font-medium ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls - Mobile Optimized */}
            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
              {/* Quality Selector - Mobile friendly */}
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className={`text-white hover:text-red-400 transition-colors flex items-center ${
                    isMobile ? 'space-x-1 p-2' : 'space-x-1'
                  }`}
                >
                  <Settings size={isMobile ? 20 : 24} />
                  {!isMobile && <span className="text-sm">{quality}</span>}
                </button>

                {/* Quality Menu */}
                {showQualityMenu && (
                  <div className={`absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden ${
                    isMobile ? 'w-32 text-sm' : 'w-auto'
                  }`}>
                    {qualityLevels.map((q) => (
                      <button
                        key={q.value}
                        onClick={() => handleQualityChange(q.label)}
                        className={`block w-full px-4 py-2 text-left text-white hover:bg-red-600/50 transition-colors ${
                          quality === q.label ? 'bg-red-600/30' : ''
                        } ${isMobile ? 'py-3 text-sm' : ''}`}
                      >
                        {q.label}
                        {quality === 'Auto' && q.label === adaptiveQuality && (
                          <span className="ml-1 text-xs text-red-400">●</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen - Enhanced mobile button */}
              <button
                onClick={toggleFullscreen}
                className={`text-white hover:text-red-400 transition-colors ${
                  isMobile ? 'p-2' : ''
                }`}
              >
                <Maximize size={isMobile ? 20 : 24} />
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