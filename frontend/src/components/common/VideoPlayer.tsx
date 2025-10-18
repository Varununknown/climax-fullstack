import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Settings, SkipBack, SkipForward, Maximize, Minimize, VolumeX, RotateCcw } from 'lucide-react';
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

export const VideoPlayer: React.FC = () => {
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
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [lastTap, setLastTap] = useState<{ time: number; side: 'left' | 'right' } | null>(null);
  
  // Additional UI state
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [qualityChangeNotification, setQualityChangeNotification] = useState<string | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // ===== PAYWALL TRACKING (PRESERVED) =====
  const [previousTime, setPreviousTime] = useState<number>(0);
  
  // Auto-hide controls
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  
  // Available qualities
  const qualities = ['Auto', '1080p', '720p', '480p', '360p'];

  // ===== CONTENT FETCHING =====
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        console.error('❌ No content ID provided');
        setError('Content ID not provided - URL should be /watch/:id');
        setLoading(false);
        return;
      }

      console.log('🎬 Starting to fetch content with ID:', id);
      setLoading(true);
      setError(null);

      // Fallback test content for debugging
      if (id === 'test' || id === 'test123') {
        console.log('🎬 Using test content for debugging');
        const testContent: Content = {
          _id: 'test123',
          title: 'Test Video',
          description: 'Test video for debugging',
          videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1489599808050-e1d2b7c9fec0?w=400&h=600&fit=crop&auto=format',
          category: 'action',
          type: 'movie',
          genre: ['test'],
          duration: 120,
          climaxTimestamp: 60,
          premiumPrice: 0,
          isActive: true,
          createdAt: new Date()
        };
        setContent(testContent);
        setLoading(false);
        return;
      }

      try {
        console.log('🎬 Fetching content:', id);
        console.log('🎬 API Base URL:', API.defaults.baseURL);
        const response = await API.get(`/contents/${id}`);
        console.log('✅ Content loaded successfully:', response.data);
        setContent(response.data);
        
        // Let the video element handle loading naturally
      } catch (err: any) {
        console.error('❌ Error fetching content:', err);
        console.error('❌ Error response:', err.response);
        console.error('❌ Error message:', err.message);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load content';
        console.error('❌ Error details:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log('🎬 Content fetch completed');
      }
    };

    fetchContent();
  }, [id]);

  // ===== ROBUST PAYMENT STATUS CHECKING =====
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!content || !user) {
        setPaymentState(prev => ({ ...prev, isLoading: false, isPaid: false }));
        return;
      }

      try {
        console.log('💳 Checking payment status...');
        
        // Multi-layer payment verification for persistence
        const cacheKey = `payment_${user.id}_${content._id}`;
        const permanentKey = `payment_permanent_${user.id}_${content._id}`;
        
        // Check permanent storage first (never cleared)
        const permanentPayment = localStorage.getItem(permanentKey);
        if (permanentPayment === 'approved') {
          console.log('🔒 PERMANENT PAYMENT STATUS - Auto-approved content');
          setPaymentState(prev => ({ ...prev, isPaid: true, isLoading: false }));
          
          // Still verify with server but don't change state if it fails
          verifyPaymentWithServer(cacheKey, false);
          return;
        }
        
        // Check regular cache
        const cachedPayment = localStorage.getItem(cacheKey);
        if (cachedPayment === 'true') {
          console.log('⚡ Using cached payment status');
          setPaymentState(prev => ({ ...prev, isPaid: true, isLoading: false }));
          
          // Verify and potentially upgrade to permanent
          verifyPaymentWithServer(cacheKey, true);
          return;
        }

        // Check server for payment (final authority)
        console.log('🌐 Checking server payment status...');
        const response = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
        const isPaid = response.data.paid;
        
        console.log(isPaid ? '✅ Payment verified on server' : '❌ No payment found');
        
        setPaymentState(prev => ({ ...prev, isPaid, isLoading: false }));
        
        // Cache the result and make permanent if paid
        if (isPaid) {
          localStorage.setItem(cacheKey, 'true');
          localStorage.setItem(permanentKey, 'approved'); // 🔒 Permanent approval
          console.log('🔒 Payment status made permanent - will persist across sessions');
        }
        
      } catch (err) {
        console.error('❌ Payment check failed:', err);
        
        // If server fails but we have permanent payment, trust permanent status
        const permanentKey = `payment_permanent_${user.id}_${content._id}`;
        const permanentPayment = localStorage.getItem(permanentKey);
        
        if (permanentPayment === 'approved') {
          console.log('🔒 Server failed but permanent payment exists - maintaining paid status');
          setPaymentState(prev => ({ ...prev, isPaid: true, isLoading: false }));
        } else {
          setPaymentState(prev => ({ ...prev, isLoading: false, isPaid: false }));
        }
      }
    };

    checkPaymentStatus();
  }, [content, user]);

  // ===== BACKGROUND PAYMENT VERIFICATION =====
  const verifyPaymentWithServer = async (cacheKey: string, canUpgradeToPermanent: boolean = false) => {
    if (!content || !user) return;
    
    try {
      const response = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
      
      if (response.data.paid) {
        // Upgrade to permanent if verified and allowed
        if (canUpgradeToPermanent) {
          const permanentKey = `payment_permanent_${user.id}_${content._id}`;
          localStorage.setItem(permanentKey, 'approved');
          console.log('🔒 Payment upgraded to permanent status');
        }
      } else {
        // Only clear cache if no permanent payment exists
        const permanentKey = `payment_permanent_${user.id}_${content._id}`;
        const permanentPayment = localStorage.getItem(permanentKey);
        
        if (permanentPayment !== 'approved') {
          console.log('⚠️ Cached payment invalid - clearing cache');
          localStorage.removeItem(cacheKey);
          setPaymentState(prev => ({ ...prev, isPaid: false }));
        } else {
          console.log('🔒 Server says no payment but permanent status exists - keeping paid state');
        }
      }
    } catch (err) {
      console.warn('Payment verification failed:', err);
      // Don't change payment state on verification failure if permanent payment exists
    }
  };

  // ===== VIDEO EVENT HANDLERS =====
  const handleVideoEvents = () => {
    const video = videoRef.current;
    if (!video || !content) return;

    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      setCurrentTime(currentTime);
      
      // Check if user is moving FORWARD past the climax timestamp (not backward/seeking)
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
    };

    const onCanPlay = () => {
      setVideoLoading(false);
      console.log('✅ Video can play - attempting auto-start');
      
      // Simple auto-play attempt
      if (video.paused) {
        video.play().then(() => {
          console.log('✅ Auto-play successful');
          setShowPlayButton(false);
        }).catch(() => {
          console.log('⚠️ Auto-play blocked - showing play button');
          setShowPlayButton(true);
        });
      }
    };

    const onWaiting = () => {
      // Disable loading indicator to prevent "buffering" text
      // Only show loading if waiting for more than 2 seconds
      setTimeout(() => {
        if (video.readyState < 3 && video.networkState === 2) { // Only if really stuck
          setVideoLoading(true);
        }
      }, 2000); // Much longer delay - only for real buffering issues
    };

    const onPlay = () => {
      setIsPlaying(true);
      setVideoLoading(false);
      setShowPlayButton(false);
    };
    
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);  
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  };

  useEffect(handleVideoEvents, [content, paymentState.isPaid]);

  // ===== KEYBOARD CONTROLS =====
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      // Don't interfere with typing in input fields, textareas, or other form elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return; // Let the user type normally
      }

      // Disable keyboard shortcuts when payment modal is open to prevent interference
      if (paymentState.shouldShowModal) {
        return;
      }

      // On mobile, only allow essential keyboard shortcuts
      if (window.innerWidth <= 768) {
        // Only allow F key for fullscreen on mobile, other keys might interfere
        if (e.code === 'KeyF') {
          e.preventDefault();
          toggleFullscreen();
        }
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekBy(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekBy(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyH':
        case 'Slash':
          e.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [paymentState.isPaid, paymentState.shouldShowModal, content]);

  // ===== PLAYER CONTROLS =====
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video || !content) return;

    console.log('🎮 Toggle play/pause - current state:', video.paused ? 'paused' : 'playing');
    console.log('🎮 Video ready state:', video.readyState);
    console.log('🎮 Video src:', video.src);
    
    // If paywall modal is open, don't allow play
    if (paymentState.shouldShowModal) {
      console.log('🚫 Play blocked - payment modal is open');
      return;
    }
    
    // If trying to play beyond paywall without payment, block it
    if (!paymentState.isPaid && video.currentTime >= content.climaxTimestamp - 1) {
      console.log('🚫 Play blocked - at paywall boundary');
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }
    
    if (video.paused) {
      video.play().then(() => {
        console.log('✅ Play started successfully');
        setShowPlayButton(false);
      }).catch(err => {
        console.error('❌ Play failed:', err);
        setShowPlayButton(true);
      });
    } else {
      video.pause();
    }
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !content) return;

    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    
    // Check paywall for forward seeking only
    if (!paymentState.isPaid && newTime > content.climaxTimestamp && seconds > 0) {
      console.log('🚫 Forward skip blocked - payment required');
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    video.currentTime = newTime;
    setPreviousTime(newTime); // Update tracking
    console.log(`📹 Skip ${seconds > 0 ? 'forward' : 'backward'} to ${newTime.toFixed(1)}s`);
  };

  const seekTo = (percentage: number) => {
    const video = videoRef.current;
    if (!video || !content) return;

    const newTime = (percentage / 100) * duration;
    
    // Check paywall - only trigger if seeking FORWARD past climax
    if (!paymentState.isPaid && newTime > content.climaxTimestamp && newTime > video.currentTime) {
      console.log('🚫 Forward seek blocked - payment required');
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    // Allow seeking backward freely, even past climax
    video.currentTime = newTime;
    setPreviousTime(newTime); // Update tracking for next timeupdate
    console.log(`📹 Seek to ${newTime.toFixed(1)}s (${percentage.toFixed(1)}%)`);
  };

  const adjustVolume = (delta: number, isAbsolute: boolean = false) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = isAbsolute 
      ? Math.max(0, Math.min(1, delta))
      : Math.max(0, Math.min(1, video.volume + delta));
    
    video.volume = newVolume;
    setVolume(newVolume);
  };

  // ===== FULLSCREEN CONTROLS =====
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        // Request fullscreen
        await container.requestFullscreen();
        setIsFullscreen(true);
        
        // Auto-rotate on mobile devices
        if (window.innerWidth <= 768 && 'screen' in window && 'orientation' in window.screen) {
          try {
            await (window.screen.orientation as any).lock('landscape');
          } catch (orientationErr) {
            console.log('Orientation lock not supported or failed:', orientationErr);
          }
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        
        // Unlock orientation on mobile when exiting fullscreen
        if (window.innerWidth <= 768 && 'screen' in window && 'orientation' in window.screen) {
          try {
            (window.screen.orientation as any).unlock();
          } catch (orientationErr) {
            console.log('Orientation unlock not supported or failed:', orientationErr);
          }
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize to apply mobile styles
      // Force re-render on resize - no state update needed
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pause video when payment modal is shown
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (paymentState.shouldShowModal) {
      video.pause();
      setIsPlaying(false);
      console.log('🛑 Video paused - payment modal opened');
      
      // Additional safeguard: prevent the video from playing while modal is open
      const preventPlay = (e: Event) => {
        e.preventDefault();
        video.pause();
        console.log('🚫 Play prevented - payment modal is open');
      };
      
      video.addEventListener('play', preventPlay);
      
      return () => {
        video.removeEventListener('play', preventPlay);
      };
    }
  }, [paymentState.shouldShowModal]);

  // Close quality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showQualityMenu && !(e.target as Element).closest('.quality-menu')) {
        setShowQualityMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showQualityMenu]);

  // ===== QUALITY CONTROLS =====
  const changeQuality = (quality: string) => {
    const video = videoRef.current;
    if (!video || !content) return;

    // For demo purposes - in production you'd have different URLs
    // Just update the UI immediately for fast feedback
    setQuality(quality);
    setShowQualityMenu(false);
    
    // Show quality change notification immediately
    setQualityChangeNotification(`Quality: ${quality === 'auto' ? 'Auto' : quality}`);
    setTimeout(() => {
      setQualityChangeNotification(null);
    }, 1500);
    
    console.log(`🎥 Quality set to: ${quality}`);
    
    // Optional: In production, you would actually change video source here
    // For now, just provide immediate UI feedback for better UX
  };

  // ===== CONTROLS VISIBILITY =====
  const handleShowControls = () => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // ===== SUCCESS HANDLERS =====
  const handlePaymentSuccess = () => {
    console.log('🎉 Payment successful - unlocking content PERMANENTLY');
    
    setPaymentState({
      isLoading: false,
      isPaid: true,
      shouldShowModal: false
    });

    // 🔒 PERMANENT PAYMENT STATUS - Never reverts to paywall
    if (content && user) {
      const cacheKey = `payment_${user.id}_${content._id}`;
      const permanentKey = `payment_permanent_${user.id}_${content._id}`;
      
      localStorage.setItem(cacheKey, 'true');
      localStorage.setItem(permanentKey, 'approved'); // 🔒 Permanent approval
      
      console.log('🔒 Payment made permanent - will never revert to paywall');
    }

    // Resume playback
    const video = videoRef.current;
    if (video) {
      video.play();
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading content...</div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">Content Not Available</h2>
          <p className="mb-4">{error || 'Content not found'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleMobileTouch = (e: React.TouchEvent, side: 'left' | 'right') => {
    if (window.innerWidth > 768) return; // Only for mobile

    e.preventDefault(); // Prevent default touch behavior
    handleShowControls(); // Show controls on any touch
    const now = Date.now();
    
    if (lastTap && lastTap.side === side && now - lastTap.time < 250) {
      // Double tap detected - faster response time
      if (side === 'left') {
        seekBy(10); // LEFT taps = FORWARD 
        console.log('📱 LEFT tap - FORWARD +10s');
      } else {
        seekBy(-10); // RIGHT taps = BACKWARD  
        console.log('📱 RIGHT tap - BACKWARD -10s');
      }
      
      // Visual feedback - brief flash
      const flashElement = side === 'left' ? 'mobile-left-flash' : 'mobile-right-flash';
      const element = document.getElementById(flashElement);
      if (element) {
        element.style.opacity = '0.3';
        setTimeout(() => {
          element.style.opacity = '0';
        }, 200);
      }
      
      setLastTap(null);
    } else {
      // Single tap - just register for potential double tap
      setLastTap({ time: now, side });
    }
  };

  // ===== MAIN RENDER =====
  console.log('🎬 Render state - Loading:', loading, 'Error:', error, 'Content:', !!content);
  
  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full bg-gray-900 text-white relative overflow-hidden"
      style={{
        height: '100vh',
        minHeight: '100vh'
      }}
      onMouseMove={handleShowControls}
      onMouseEnter={handleShowControls}
    >

      {/* Video Container with Touch Areas */}
      <div className="relative w-full" style={{
        height: window.innerWidth <= 768 ? '70vh' : '100vh'
      }}>


        {/* Video Element - Only show if we have content */}
        {content?.videoUrl && (
          <video
            ref={videoRef}
            src={content.videoUrl}
            className={`w-full h-full ${isFullscreen ? 'object-cover' : 'object-contain'}`}
            style={{
              backgroundColor: 'black',
              cursor: window.innerWidth <= 768 ? 'default' : 'pointer',
              width: '100%',
              height: '100%'
            }}
            onContextMenu={(e) => e.preventDefault()}
            preload="metadata"
            playsInline
            autoPlay
            muted // Required for autoplay in most browsers
            controls={false} // Use custom controls only
            // Remove onClick completely for mobile, only desktop gets click-to-play
            {...(window.innerWidth > 768 && { onClick: togglePlayPause })}
          />
        )}

        {/* Amazon Prime Style Mobile Touch Areas (Only on Mobile) */}
        {window.innerWidth <= 768 && (
          <>
            {/* Left side - Double tap ANYWHERE for backward */}
            <div
              className="absolute top-0 left-0 w-1/2 h-full z-5"
              onTouchStart={(e) => handleMobileTouch(e, 'left')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {/* Visual feedback - only show when controls visible AND video paused */}
              {showControls && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-start pl-8 pointer-events-none">
                  <div 
                    id="mobile-left-flash"
                    className="absolute inset-0 bg-blue-400/20 rounded-r-full opacity-0 transition-opacity duration-200"
                    style={{ zIndex: -1 }}
                  />
                  <div className="text-white/60 text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
                    ⏩ +10s
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side - Double tap ANYWHERE for forward */}
            <div
              className="absolute top-0 right-0 w-1/2 h-full z-5"
              onTouchStart={(e) => handleMobileTouch(e, 'right')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {/* Visual feedback - only show when controls visible AND video paused */}
              {showControls && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none">
                  <div 
                    id="mobile-right-flash"
                    className="absolute inset-0 bg-blue-400/20 rounded-l-full opacity-0 transition-opacity duration-200"
                    style={{ zIndex: -1 }}
                  />
                  <div className="text-white/60 text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
                    ⏪ -10s  
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Big Play Button Overlay */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 z-20" onClick={togglePlayPause}>
          <div className="rounded-full p-6 backdrop-blur-sm cursor-pointer transition-all transform hover:scale-110 shadow-2xl border-2"
               style={{
                 background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(29, 78, 216, 0.6) 100%)',
                 borderColor: 'rgba(59, 130, 246, 0.6)',
                 boxShadow: '0 0 50px rgba(59, 130, 246, 0.5), inset 0 4px 20px rgba(255, 255, 255, 0.1)'
               }}>
            <Play size={48} className="text-white ml-1 drop-shadow-2xl" />
          </div>
        </div>
      )}

      {/* Smooth Video Loading - Amazon Prime Style */}
      {videoLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="flex flex-col items-center space-y-3 bg-black/60 p-6 rounded-lg backdrop-blur-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500/30 border-t-blue-500"></div>
            <div className="text-white text-base font-medium">Loading</div>
            <div className="text-white/70 text-xs">Almost ready...</div>
          </div>
        </div>
      )}

      {/* Quality Change Notification */}
      {qualityChangeNotification && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-30 backdrop-blur-sm border border-gray-600">
          <div className="flex items-center space-x-2">
            <Settings size={16} />
            <span className="font-medium">{qualityChangeNotification}</span>
          </div>
        </div>
      )}

      {/* Header Overlay */}
      <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="text-center bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
            <h1 className="text-xl font-bold text-white">{content.title}</h1>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span className="text-gray-300 capitalize">{content.type} • {content.category}</span>
              {paymentState.isPaid ? (
                <span className="text-green-400 font-medium">🔓 Premium</span>
              ) : (
                <span className="text-yellow-400 font-medium">🔒 Preview</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quality Settings */}
            <div className="relative quality-menu">
              <button 
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center space-x-1 text-white bg-black/50 px-3 py-2 rounded-lg hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="Quality Settings"
              >
                <Settings size={18} />
                <span className="text-sm font-medium">{quality}</span>
              </button>
              
              {showQualityMenu && (
                <div className="absolute right-0 top-12 bg-black/90 rounded-lg shadow-xl min-w-[140px] z-20 backdrop-blur-sm border border-gray-700">
                  {['auto', '1080p', '720p', '480p', '360p'].map((qualityOption) => (
                    <button
                      key={qualityOption}
                      onClick={() => changeQuality(qualityOption)}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        quality === qualityOption ? 'bg-blue-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{qualityOption === 'auto' ? 'Auto' : qualityOption}</span>
                        {quality === qualityOption && (
                          <span className="text-green-400 text-xs">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      <div className={`absolute left-0 right-0 z-10 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`} style={{
        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 138, 0.3) 40%, transparent 100%)',
        backdropFilter: 'blur(6px)',
        padding: window.innerWidth <= 768 ? '8px' : '12px',
        bottom: window.innerWidth <= 768 ? '20px' : '0px' // Lift controls up on mobile
      }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: window.innerWidth <= 768 ? '12px' : '20px' }}>
          <div className="relative group">
            <div 
              className="bg-gray-600/50 h-1 rounded-full cursor-pointer group-hover:h-2 transition-all duration-200"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                seekTo(percentage);
              }}
              onMouseMove={(e) => {
                if (e.buttons === 1) { // Left mouse button is held down
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                  seekTo(percentage);
                }
              }}
              onTouchMove={(e) => {
                // Handle touch drag on mobile
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const percentage = ((touch.clientX - rect.left) / rect.width) * 100;
                seekTo(percentage);
              }}
            >
              <div 
                className="bg-red-600 h-full rounded-full transition-all relative hover:bg-red-500"
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                  boxShadow: '0 0 8px rgba(220, 38, 38, 0.6)'
                }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-red-500" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm mt-2 text-white/80">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-400">Click timeline to seek</span>
            <span className="font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center relative">
          {/* Left Side - Volume Control (Positioned Absolutely) */}
          <div className="absolute left-0 flex items-center">
            <div className="flex items-center rounded-md backdrop-blur-sm shadow-md" style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.4) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: window.innerWidth <= 768 ? '4px 6px' : '6px 8px',
              gap: window.innerWidth <= 768 ? '4px' : '8px'
            }}>
              <button
                onClick={() => adjustVolume(volume > 0 ? 0 : 1)}
                className="text-blue-200 hover:text-white transition-colors"
                title="Toggle mute"
              >
                <Volume2 size={window.innerWidth <= 768 ? 14 : 16} />
              </button>
              <div 
                className="bg-slate-600/40 rounded-full cursor-pointer shadow-inner"
                style={{
                  width: window.innerWidth <= 768 ? '40px' : '64px',
                  height: '4px'
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percentage = (e.clientX - rect.left) / rect.width;
                  adjustVolume(percentage, true);
                }}
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percentage = (e.clientX - rect.left) / rect.width;
                    adjustVolume(percentage, true);
                  }
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percentage = (touch.clientX - rect.left) / rect.width;
                  adjustVolume(percentage, true);
                }}
              >
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${volume * 100}%`,
                    background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                    boxShadow: '0 0 6px rgba(59, 130, 246, 0.4)'
                  }}
                />
              </div>
              {window.innerWidth > 768 && (
                <span className="text-xs text-blue-100 w-6 text-center font-medium">{Math.round(volume * 100)}</span>
              )}
            </div>
          </div>

          {/* Center - Main Playback Controls (Truly Centered) */}
          <div className="flex items-center" style={{ gap: window.innerWidth <= 768 ? '8px' : '12px' }}>
            <button 
              onClick={() => seekBy(-10)}
              className="flex items-center text-white hover:text-blue-300 transition-colors rounded-md backdrop-blur-sm shadow-md"
              title="Backward 10s (←)"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.4) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: window.innerWidth <= 768 ? '6px 8px' : '6px 10px',
                gap: window.innerWidth <= 768 ? '2px' : '4px'
              }}
            >
              <SkipBack size={window.innerWidth <= 768 ? 14 : 16} />
              {window.innerWidth > 768 && <span className="text-xs font-medium">10s</span>}
            </button>

            <button 
              onClick={togglePlayPause}
              className="rounded-full transition-colors backdrop-blur-sm shadow-xl border text-white hover:text-blue-200"
              title="Play/Pause (Space)"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 138, 0.5) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                padding: window.innerWidth <= 768 ? '8px' : '10px'
              }}
            >
              {isPlaying ? 
                <Pause size={window.innerWidth <= 768 ? 20 : 24} className="drop-shadow-lg" /> : 
                <Play size={window.innerWidth <= 768 ? 20 : 24} className="drop-shadow-lg" style={{ marginLeft: window.innerWidth <= 768 ? '1px' : '2px' }} />
              }
            </button>

            <button 
              onClick={() => seekBy(10)}
              className="flex items-center text-white hover:text-blue-300 transition-colors rounded-md backdrop-blur-sm shadow-md"
              title="Forward 10s (→)"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.4) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: window.innerWidth <= 768 ? '6px 8px' : '6px 10px',
                gap: window.innerWidth <= 768 ? '2px' : '4px'
              }}
            >
              {window.innerWidth > 768 && <span className="text-xs font-medium">10s</span>}
              <SkipForward size={window.innerWidth <= 768 ? 14 : 16} />
            </button>
          </div>

          {/* Right Side - Fullscreen Control (Positioned Absolutely) */}
          <div className="absolute right-0 flex items-center">
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-300 transition-colors rounded-md backdrop-blur-sm shadow-md"
              title="Toggle Fullscreen (F)"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.4) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: window.innerWidth <= 768 ? '6px 8px' : '6px 10px'
              }}
            >
              {isFullscreen ? 
                <Minimize size={window.innerWidth <= 768 ? 14 : 18} /> : 
                <Maximize size={window.innerWidth <= 768 ? 14 : 18} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Help Overlay */}
      {showKeyboardHelp && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowKeyboardHelp(false)}>
          <div className="bg-gray-900 rounded-xl p-6 max-w-md mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4 text-center">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              {[
                { key: 'Space', action: 'Play / Pause' },
                { key: '← →', action: 'Seek 10s backward / forward' },
                { key: '↑ ↓', action: 'Volume up / down' },
                { key: 'F', action: 'Toggle fullscreen' },
                { key: 'H or ?', action: 'Show this help' },
              ].map(({ key, action }) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="bg-gray-700 px-2 py-1 rounded text-gray-300 font-mono text-xs">{key}</span>
                  <span className="text-white">{action}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowKeyboardHelp(false)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentState.shouldShowModal && (
        <PaymentModal
          content={content}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            console.log('� PAYMENT CANCELLED - STOPPING VIDEO');
            
            // Close modal first
            setPaymentState(prev => ({ ...prev, shouldShowModal: false }));
            
            // AGGRESSIVE VIDEO STOP
            const video = videoRef.current;
            if (video && !paymentState.isPaid) {
              // Multiple pause attempts
              video.pause();
              video.pause();
              
              // Remove all event listeners temporarily  
              video.removeEventListener('play', video.pause);
              video.addEventListener('play', video.pause);
              
              // Reset position
              const safePosition = Math.max(0, content.climaxTimestamp - 2);
              video.currentTime = safePosition;
              
              // Force state updates
              setIsPlaying(false);
              setCurrentTime(safePosition);
              
              setPreviousTime(safePosition);
              
              // Multiple checks to ensure it stays paused
              setTimeout(() => {
                if (video) {
                  video.pause();
                  video.removeEventListener('play', video.pause);
                }
              }, 100);
              
              console.log('� VIDEO AGGRESSIVELY STOPPED');
            }
          }}
        />
      )}
    </div>
  );
};