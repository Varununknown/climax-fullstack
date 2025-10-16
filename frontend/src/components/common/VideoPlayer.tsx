import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Settings, SkipBack, SkipForward, Maximize, Minimize } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';
import API from '../../services/api';

// =====================================================
// 🎬 CLEAN VIDEO PLAYER - COMPLETELY REBUILT
// =====================================================

interface PaymentState {
  isLoading: boolean;
  isPaid: boolean;
  shouldShowModal: boolean;
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
  quality: string;
  showControls: boolean;
}

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // ===== STATE MANAGEMENT =====
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isLoading: true,
    isPaid: false,
    shouldShowModal: false
  });
  
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isFullscreen: false,
    quality: 'auto',
    showControls: true
  });

  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [videoLoading, setVideoLoading] = useState(false); // Start as false for faster perceived load
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [qualityChangeNotification, setQualityChangeNotification] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ===== CONTENT FETCHING =====
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setError('Content ID not provided');
        setLoading(false);
        return;
      }

      try {
        console.log('🎬 Fetching content:', id);
        const response = await API.get(`/contents/${id}`);
        setContent(response.data);
        console.log('✅ Content loaded:', response.data.title);
        
        // Let the video element handle loading naturally
      } catch (err: any) {
        console.error('❌ Error fetching content:', err);
        setError(err.response?.data?.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  // ===== PAYMENT STATUS CHECKING =====
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!content || !user) {
        setPaymentState(prev => ({ ...prev, isLoading: false, isPaid: false }));
        return;
      }

      try {
        console.log('💳 Checking payment status...');
        
        // Check localStorage cache first for instant response
        const cacheKey = `payment_${user.id}_${content._id}`;
        const cachedPayment = localStorage.getItem(cacheKey);
        
        if (cachedPayment === 'true') {
          console.log('⚡ Using cached payment status');
          setPaymentState(prev => ({ ...prev, isPaid: true, isLoading: false }));
          
          // Verify cache with server in background
          verifyPaymentWithServer(cacheKey);
          return;
        }

        // Check server for payment
        const response = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
        const isPaid = response.data.paid;
        
        console.log(isPaid ? '✅ Payment verified on server' : '❌ No payment found');
        
        setPaymentState(prev => ({ ...prev, isPaid, isLoading: false }));
        
        // Cache the result
        if (isPaid) {
          localStorage.setItem(cacheKey, 'true');
        }
        
      } catch (err) {
        console.error('❌ Payment check failed:', err);
        setPaymentState(prev => ({ ...prev, isLoading: false, isPaid: false }));
      }
    };

    checkPaymentStatus();
  }, [content, user]);

  // ===== BACKGROUND PAYMENT VERIFICATION =====
  const verifyPaymentWithServer = async (cacheKey: string) => {
    if (!content || !user) return;
    
    try {
      const response = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
      
      if (!response.data.paid) {
        console.log('⚠️ Cached payment invalid - clearing cache');
        localStorage.removeItem(cacheKey);
        setPaymentState(prev => ({ ...prev, isPaid: false }));
      }
    } catch (err) {
      console.warn('Payment verification failed:', err);
    }
  };

  // ===== VIDEO EVENT HANDLERS =====
  const handleVideoEvents = () => {
    const video = videoRef.current;
    if (!video || !content) return;

    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      setVideoState(prev => ({ ...prev, currentTime }));
      
      // Check if user reached paywall without payment
      if (!paymentState.isPaid && currentTime >= content.climaxTimestamp) {
        console.log('🚫 Paywall triggered at climax timestamp');
        video.pause();
        video.currentTime = Math.max(0, content.climaxTimestamp - 1);
        setVideoState(prev => ({ ...prev, isPlaying: false }));
        setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      }
    };

    const onLoadedMetadata = () => {
      setVideoState(prev => ({ ...prev, duration: video.duration }));
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
      // Only show loading after a brief delay to avoid flashing
      setTimeout(() => {
        if (video.readyState < 3) { // Only if still not ready
          setVideoLoading(true);
        }
      }, 500);
    };

    const onPlay = () => {
      setVideoState(prev => ({ ...prev, isPlaying: true }));
      setVideoLoading(false);
      setShowPlayButton(false);
    };
    
    const onPause = () => setVideoState(prev => ({ ...prev, isPlaying: false }));

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
  }, [paymentState.isPaid, content]);

  // ===== PLAYER CONTROLS =====
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    console.log('🎮 Toggle play/pause - current state:', video.paused ? 'paused' : 'playing');
    console.log('🎮 Video ready state:', video.readyState);
    console.log('🎮 Video src:', video.src);
    
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

    const newTime = Math.max(0, Math.min(videoState.duration, video.currentTime + seconds));
    
    // Check paywall for forward seeking
    if (!paymentState.isPaid && newTime > content.climaxTimestamp) {
      console.log('🚫 Seek blocked - payment required');
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    video.currentTime = newTime;
  };

  const seekTo = (percentage: number) => {
    const video = videoRef.current;
    if (!video || !content) return;

    const newTime = (percentage / 100) * videoState.duration;
    
    // Check paywall
    if (!paymentState.isPaid && newTime > content.climaxTimestamp) {
      console.log('🚫 Timeline seek blocked - payment required');
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    video.currentTime = newTime;
  };

  const adjustVolume = (delta: number, isAbsolute: boolean = false) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = isAbsolute 
      ? Math.max(0, Math.min(1, delta))
      : Math.max(0, Math.min(1, video.volume + delta));
    
    video.volume = newVolume;
    setVideoState(prev => ({ ...prev, volume: newVolume }));
  };

  // ===== FULLSCREEN CONTROLS =====
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setVideoState(prev => ({ ...prev, isFullscreen: true }));
      } else {
        await document.exitFullscreen();
        setVideoState(prev => ({ ...prev, isFullscreen: false }));
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setVideoState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
    setVideoState(prev => ({ ...prev, quality }));
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
  const showControls = () => {
    setVideoState(prev => ({ ...prev, showControls: true }));
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      setVideoState(prev => ({ ...prev, showControls: false }));
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
    console.log('🎉 Payment successful - unlocking content');
    
    setPaymentState({
      isLoading: false,
      isPaid: true,
      shouldShowModal: false
    });

    // Cache payment status
    if (content && user) {
      const cacheKey = `payment_${user.id}_${content._id}`;
      localStorage.setItem(cacheKey, 'true');
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
    return videoState.duration > 0 ? (videoState.currentTime / videoState.duration) * 100 : 0;
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading content...</div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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

  // ===== MAIN RENDER =====
  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-900 text-white relative overflow-hidden"
      onMouseMove={showControls}
      onMouseEnter={showControls}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full h-screen object-contain cursor-pointer"
        onClick={togglePlayPause}
        onContextMenu={(e) => e.preventDefault()}
        preload="auto"
        playsInline
        controls={false}
        style={{
          backgroundColor: 'black',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />

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

      {/* Video Loading Spinner - Only for significant delays */}
      {videoLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <div className="text-white text-sm font-medium">Buffering...</div>
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
        videoState.showControls ? 'opacity-100' : 'opacity-0'
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
                <span className="text-sm font-medium">{videoState.quality}</span>
              </button>
              
              {showQualityMenu && (
                <div className="absolute right-0 top-12 bg-black/90 rounded-lg shadow-xl min-w-[140px] z-20 backdrop-blur-sm border border-gray-700">
                  {['auto', '1080p', '720p', '480p', '360p'].map((quality) => (
                    <button
                      key={quality}
                      onClick={() => changeQuality(quality)}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        videoState.quality === quality ? 'bg-blue-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{quality === 'auto' ? 'Auto' : quality}</span>
                        {videoState.quality === quality && (
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
      <div className={`absolute bottom-0 left-0 right-0 p-3 z-10 transition-opacity duration-300 ${
        videoState.showControls ? 'opacity-100' : 'opacity-0'
      }`} style={{
        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 138, 0.3) 40%, transparent 100%)',
        backdropFilter: 'blur(6px)'
      }}>
        {/* Progress Bar */}
        <div className="mb-5">
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
            <span className="font-medium">{formatTime(videoState.currentTime)}</span>
            <span className="text-xs text-gray-400">Click timeline to seek</span>
            <span className="font-medium">{formatTime(videoState.duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center relative">
          {/* Left Side - Volume Control (Positioned Absolutely) */}
          <div className="absolute left-0 flex items-center">
            <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md backdrop-blur-sm shadow-md" style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.4) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <button
                onClick={() => adjustVolume(videoState.volume > 0 ? 0 : 1)}
                className="text-blue-200 hover:text-white transition-colors"
                title="Toggle mute"
              >
                <Volume2 size={16} />
              </button>
              <div 
                className="w-16 h-1 bg-slate-600/40 rounded-full cursor-pointer shadow-inner"
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
              >
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${videoState.volume * 100}%`,
                    background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                    boxShadow: '0 0 6px rgba(59, 130, 246, 0.4)'
                  }}
                />
              </div>
              <span className="text-xs text-blue-100 w-6 text-center font-medium">{Math.round(videoState.volume * 100)}</span>
            </div>
          </div>

          {/* Center - Main Playback Controls (Truly Centered) */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => seekBy(-10)}
              className="flex items-center space-x-1 text-white hover:text-blue-300 transition-colors px-2.5 py-1.5 rounded-md backdrop-blur-sm shadow-md"
              title="Backward 10s (←)"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.4) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <SkipBack size={16} />
              <span className="text-xs font-medium">10s</span>
            </button>

            <button 
              onClick={togglePlayPause}
              className="rounded-full p-2.5 transition-colors backdrop-blur-sm shadow-xl border text-white hover:text-blue-200"
              title="Play/Pause (Space)"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 138, 0.5) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              {videoState.isPlaying ? <Pause size={24} className="drop-shadow-lg" /> : <Play size={24} className="drop-shadow-lg ml-0.5" />}
            </button>

            <button 
              onClick={() => seekBy(10)}
              className="flex items-center space-x-1 text-white hover:text-blue-300 transition-colors px-2.5 py-1.5 rounded-md backdrop-blur-sm shadow-md"
              title="Forward 10s (→)"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.4) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <span className="text-xs font-medium">10s</span>
              <SkipForward size={16} />
            </button>
          </div>

          {/* Right Side - Fullscreen Control (Positioned Absolutely) */}
          <div className="absolute right-0 flex items-center">
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-300 transition-colors px-2.5 py-1.5 rounded-md backdrop-blur-sm shadow-md"
              title="Toggle Fullscreen (F)"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 58, 138, 0.4) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              {videoState.isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
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
          onClose={() => setPaymentState(prev => ({ ...prev, shouldShowModal: false }))}
        />
      )}
    </div>
  );
};