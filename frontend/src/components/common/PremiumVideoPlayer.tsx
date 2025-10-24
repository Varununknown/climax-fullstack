import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Settings, Maximize, VolumeX, RotateCw } from 'lucide-react';
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
  
  // Payment polling and trigger lock
  const [paymentPollingInterval, setPaymentPollingInterval] = useState<any>(null);
  const [hasShownPaymentModal, setHasShownPaymentModal] = useState(false);
  
  // Track when payment check completes for UI rendering
  const [paymentCheckComplete, setPaymentCheckComplete] = useState(false);
  
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

  // ===== PAYMENT STATUS CHECKING - STRONGEST VERIFICATION FIRST =====
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!content || !user) {
        console.log('⏳ Waiting for content and user to load...');
        setPaymentState(prev => ({ ...prev, isLoading: false, isPaid: false }));
        return;
      }

      try {
        console.log('🔴🔴🔴 PAYMENT CHECK EFFECT RUNNING 🔴🔴🔴');
        console.log('═════════════════════════════════════════');
        console.log('🔍 INITIAL PAYMENT CHECK');
        console.log(`User ID: ${user.id}`);
        console.log(`Content ID: ${content._id}`);
        console.log(`Premium Price: ${content.premiumPrice}`);
        console.log('═════════════════════════════════════════');
        
        // 🔥 CRITICAL: CHECK DATABASE FIRST - THIS IS THE SOURCE OF TRUTH
        // Don't rely on cache for initial load - always verify with server
        console.log('� Querying /payments/check endpoint...');
        
        const response = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
        const isPaidInDatabase = response.data.paid;
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 DATABASE RESPONSE: paid = ${isPaidInDatabase}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (isPaidInDatabase) {
          console.log('✅ ✅ ✅ PAYMENT FOUND IN DATABASE');
          console.log('📌 Setting badge to: CLIMAX PREMIUM 🔓');
          console.log('═════════════════════════════════════════');
          
          // Payment exists in database! Set it to true immediately
          setPaymentState(prev => ({ 
            ...prev, 
            isPaid: true, 
            isLoading: false,
            shouldShowModal: false  // Never show modal if already paid
          }));
          
          // Cache the result for offline support
          const cacheKey = `payment_${user.id}_${content._id}`;
          const permanentKey = `payment_permanent_${user.id}_${content._id}`;
          localStorage.setItem(cacheKey, 'true');
          localStorage.setItem(permanentKey, 'approved');
          console.log('💾 Cached payment status locally');
          
          setPaymentCheckComplete(true);
          return;
        }
        
        // If database says NOT paid, check cache as fallback
        console.log('❌ NO PAYMENT IN DATABASE');
        console.log('📌 Setting badge to: CLIMAX PREVIEW 🔒');
        
        const cacheKey = `payment_${user.id}_${content._id}`;
        const permanentKey = `payment_permanent_${user.id}_${content._id}`;
        
        const permanentPayment = localStorage.getItem(permanentKey);
        if (permanentPayment === 'approved') {
          console.log('⚠️⚠️⚠️ CACHE CONFLICT: DB says unpaid but cache says paid');
          console.log('🧹 Clearing cache to sync with database source of truth');
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(permanentKey);
        }
        
        console.log('═════════════════════════════════════════');
        
        // Set to unpaid (database is source of truth)
        setPaymentState(prev => ({ 
          ...prev, 
          isPaid: false, 
          isLoading: false,
          shouldShowModal: false
        }));
        
        setPaymentCheckComplete(true);
        
      } catch (err) {
        console.error('❌❌❌ PAYMENT CHECK FAILED');
        console.error('Error details:', err);
        if (err instanceof Error) {
          console.error('  Message:', err.message);
          console.error('  Stack:', err.stack);
        }
        
        // If server fails, check permanent cache as fallback ONLY
        const permanentKey = `payment_permanent_${user.id}_${content._id}`;
        const permanentPayment = localStorage.getItem(permanentKey);
        
        if (permanentPayment === 'approved') {
          console.log('⚠️ Server failed, but using permanent cache: isPaid = true');
          console.log('📌 Badge will show: CLIMAX PREMIUM 🔓 (from cache)');
          setPaymentState(prev => ({ 
            ...prev, 
            isPaid: true, 
            isLoading: false,
            shouldShowModal: false
          }));
        } else {
          console.log('❌ Server failed and no permanent cache - assuming unpaid');
          console.log('📌 Badge will show: CLIMAX PREVIEW 🔒');
          setPaymentState(prev => ({ 
            ...prev, 
            isLoading: false, 
            isPaid: false,
            shouldShowModal: false
          }));
        }
        
        setPaymentCheckComplete(true);
      }
    };

    checkPaymentStatus();
  }, [content, user]);

  // ===== REAL-TIME PAYMENT POLLING (Every 1 second for dynamic status) =====
  useEffect(() => {
    if (!content || !user) return;

    const startPolling = () => {
      const interval = setInterval(async () => {
        try {
          // Quick check from server for real-time payment status
          const response = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
          const currentPaidStatus = response.data.paid;

          // Update state if status changed
          setPaymentState(prev => {
            // If payment was revoked (declined by admin), immediately switch to preview
            if (prev.isPaid && !currentPaidStatus) {
              // Clear payment flags
              const cacheKey = `payment_${user.id}_${content._id}`;
              localStorage.removeItem(cacheKey);
              console.log('⚠️ Payment revoked by admin - switching to preview mode');
              setHasShownPaymentModal(false); // Unlock trigger so modal can show again
              return { ...prev, isPaid: false };
            }

            // If payment confirmed newly
            if (!prev.isPaid && currentPaidStatus) {
              const permanentKey = `payment_permanent_${user.id}_${content._id}`;
              localStorage.setItem(permanentKey, 'approved');
              console.log('✅ Payment confirmed dynamically');
              setHasShownPaymentModal(true); // Lock trigger - user paid
              return { ...prev, isPaid: true };
            }

            return prev;
          });
        } catch (err) {
          // Silent fail - don't disrupt user experience
          // If offline, trust last known state
        }
      }, 1000); // Poll every 1 second

      return interval;
    };

    const interval = startPolling();
    setPaymentPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [content, user]);

  // ===== SYNC TRIGGER LOCK WITH PAID STATUS =====
  // If user refreshes and is already paid, don't show modal again
  useEffect(() => {
    if (paymentState.isPaid) {
      setHasShownPaymentModal(true); // Lock the modal - user already paid
      console.log('🔒 Trigger locked - user is already paid');
    } else {
      setHasShownPaymentModal(false); // Unlock - user not paid, modal can trigger
      console.log('🔓 Trigger unlocked - user not paid yet');
    }
  }, [paymentState.isPaid]);

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
      
      // Check if already paid - if so, don't trigger paywall again
      // This prevents the continuous loop after payment
      if (paymentState.isPaid) {
        return; // Exit early - user has access, no need to check paywall
      }
      
      // PRESERVED PAYWALL LOGIC - Check if user is moving FORWARD past the climax timestamp
      if (!paymentState.isPaid && currentTime >= content.climaxTimestamp && currentTime > previousTime) {
        console.log('🚫 Paywall triggered - user moved FORWARD past climax timestamp');
        
        // Only trigger modal ONCE per session (prevent re-trigger)
        if (!hasShownPaymentModal) {
          console.log('⏸️ Pausing video at paywall');
          
          // HARD PAUSE - prevent any autoplay resumption
          video.pause();
          video.currentTime = Math.max(0, content.climaxTimestamp - 1);
          setIsPlaying(false);
          
          // 🔥 CRITICAL FIX: ALWAYS verify database BEFORE showing modal
          // This is the STRONGEST check - prevents re-triggering after successful payment
          const verifyNotPaid = async () => {
            try {
              console.log('🔍 Checking database before showing modal...');
              const response = await API.get(`/payments/check?userId=${user?.id}&contentId=${content._id}`);
              const isPaidInDB = response.data.paid;
              
              console.log('📊 Database says: isPaidInDB =', isPaidInDB);
              
              if (isPaidInDB) {
                // User IS paid in DB! DON'T show modal, resume video
                console.log('✅ USER IS PAID IN DATABASE - Not showing modal, resuming video');
                setPaymentState(prev => ({ 
                  ...prev, 
                  isPaid: true,
                  shouldShowModal: false,
                  isLoading: false
                }));
                setHasShownPaymentModal(true);
                
                // Resume video since they're paid
                video.play().catch(() => {});
                setIsPlaying(true);
                return;
              }
              
              // User is NOT paid in DB - safe to show modal
              console.log('❌ USER NOT PAID IN DB - Showing payment modal');
              setHasShownPaymentModal(true); // Lock - prevent re-trigger
              setPaymentState(prev => ({ 
                ...prev, 
                shouldShowModal: true,
                isLoading: false
              }));
            } catch (err) {
              console.error('❌ DB check failed:', err);
              // If DB check fails, show modal as fallback
              setHasShownPaymentModal(true);
              setPaymentState(prev => ({ 
                ...prev, 
                shouldShowModal: true,
                isLoading: false
              }));
            }
          };
          
          // Run the verification
          verifyNotPaid();
        } else {
          console.log('🔒 Modal already shown this session - blocking re-trigger');
        }
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
      
      // Try to play, with fallback for CORS issues
      video.play().catch(err => {
        console.error('🚫 Play failed:', err);
        
        // If CORS error and we have content, try loading again without crossOrigin
        if (err.name === 'NotSupportedError' && content?.videoUrl) {
          console.log('🔄 Retrying video load without CORS restrictions...');
          video.load(); // Reload the video
          setTimeout(() => {
            video.play().catch(e => console.error('🚫 Retry failed:', e));
          }, 100);
        }
      });
    }
  };

  const [isDragging, setIsDragging] = useState(false);

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

  // Enhanced draggable timeline functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleSeek(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Global mouse up listener for dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging]);

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
    
    console.log(`🎯 Quality switching to: ${newQuality}`);
    
    // If we have adaptive URLs, use them
    if (Object.keys(adaptiveUrls).length > 0) {
      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;
      
      let targetUrl = '';
      
      if (newQuality === 'Auto') {
        targetUrl = adaptiveUrls.auto || adaptiveUrls[adaptiveQuality] || currentVideoUrl;
      } else {
        const qualityKey = newQuality.toLowerCase();
        targetUrl = adaptiveUrls[qualityKey] || currentVideoUrl;
        setAdaptiveQuality(newQuality);
      }
      
      if (targetUrl && targetUrl !== video.src) {
        video.src = targetUrl;
        setCurrentVideoUrl(targetUrl);
        
        video.addEventListener('loadeddata', function resumePlayback() {
          video.currentTime = currentTime;
          if (wasPlaying) {
            video.play();
          }
          video.removeEventListener('loadeddata', resumePlayback);
        });
        
        video.load();
      }
    } else {
      // Enhanced quality simulation without URL changes (instant)
      setAdaptiveQuality(newQuality !== 'Auto' ? newQuality : adaptiveQuality);
      
      // Apply visual filters instantly without reloading
      switch (newQuality) {
        case '1080p':
          video.style.filter = 'brightness(1.05) contrast(1.1) saturate(1.1)';
          break;
        case '720p':
          video.style.filter = 'brightness(1) contrast(1.05) saturate(1.05)';
          break;
        case '480p':
          video.style.filter = 'brightness(0.98) contrast(1) saturate(1) blur(0.2px)';
          break;
        case '360p':
          video.style.filter = 'brightness(0.95) contrast(0.95) saturate(0.95) blur(0.4px)';
          break;
        case 'Auto':
          video.style.filter = 'none';
          break;
      }
      
      // Quick visual feedback without delay
      const qualityIndicator = document.createElement('div');
      qualityIndicator.textContent = `Quality: ${newQuality}`;
      qualityIndicator.style.cssText = `
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8); color: white; padding: 8px 16px;
        border-radius: 4px; font-size: 14px; z-index: 1000; pointer-events: none;
      `;
      
      const container = video.parentElement;
      if (container) {
        container.appendChild(qualityIndicator);
        setTimeout(() => qualityIndicator.remove(), 1200);
      }
    }
  };

  // Mobile touch handlers (PRESERVED)
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
    console.log('💚 Payment successful! Switching to Climax Premium...');
    
    // SAVE PAYMENT STATUS PERMANENTLY
    if (content && user) {
      const cacheKey = `payment_${user.id}_${content._id}`;
      const permanentKey = `payment_permanent_${user.id}_${content._id}`;
      
      localStorage.setItem(cacheKey, 'true');
      localStorage.setItem(permanentKey, 'approved');
      console.log('✅ Payment saved to localStorage:', { cacheKey, permanentKey });
    }

    // CRITICAL: Close modal first
    setPaymentState(prev => ({
      ...prev,
      shouldShowModal: false,
      isPaid: true,
      isLoading: false
    }));

    // RESUME VIDEO after a small delay to ensure state updates
    const video = videoRef.current;
    if (video) {
      setTimeout(() => {
        console.log('▶️ Resuming video from position:', video.currentTime);
        
        // Make sure we're at the right position (just before climax)
        if (video.currentTime < content.climaxTimestamp) {
          video.currentTime = Math.max(0, content.climaxTimestamp - 0.5);
        }
        
        // Play the video
        video.play().catch(err => {
          console.log('Play prevented:', err);
          setIsPlaying(false);
        });
        
        setIsPlaying(true);
        console.log('✅ Video resumed successfully');
      }, 100); // Very small delay
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
      onTouchEnd={(e) => {
        // TAP TOGGLE CONTROLS - Works on mobile AND fullscreen
        // Check if touch is on video area (not on progress bar or buttons)
        const touch = e.changedTouches[0];
        if (!touch) return;
        
        const container = containerRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const y = touch.clientY - rect.top;
        
        // Only toggle if tapping in upper 70% of screen (not on controls)
        if (y < rect.height * 0.7) {
          e.preventDefault();
          e.stopPropagation();
          
          // Toggle controls on tap
          const newShowControls = !showControls;
          setShowControls(newShowControls);
          
          // If showing controls, set auto-hide timer
          if (newShowControls) {
            if (controlsTimeout) clearTimeout(controlsTimeout);
            const timeout = setTimeout(() => {
              setShowControls(false);
            }, 3000);
            setControlsTimeout(timeout as any);
          } else {
            // If hiding, clear any pending timeout
            if (controlsTimeout) clearTimeout(controlsTimeout);
          }
        }
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        onTouchEnd={(e) => {
          e.stopPropagation();
          navigate(-1);
        }}
        className="absolute top-6 left-6 z-50 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-sm transition-all pointer-events-auto"
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
          autoPlay
          muted={false}
          preload="auto"
          onClick={togglePlayPause}
          onError={(e) => {
            console.error('🚫 Video loading error:', e);
            console.error('🚫 Failed URL:', currentVideoUrl || content.videoUrl);
            const video = e.target as HTMLVideoElement;
            if (video.error) {
              console.error('🚫 Video error code:', video.error.code);
              console.error('🚫 Video error message:', video.error.message);
            }
          }}
          onLoadStart={() => console.log('🎬 Video load started')}
          onCanPlay={() => console.log('✅ Video can play')}
          style={{
            // Hardware acceleration for smooth playback
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: 1000,
            // CRITICAL: Pass touches through video to container handler
            pointerEvents: 'none'
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

        {/* Netflix/Amazon Prime Style Content Overlay */}
        {content && showControls && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Top Gradient Overlay with Subtle Bluish Accent */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/90 via-slate-900/70 to-transparent"></div>
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent"></div>
            
            {/* Main Content Info - Netflix Style */}
            <div className={`absolute ${isMobile ? 'top-16 left-4 right-4' : 'top-12 left-8 right-8'}`}>
              <div className="pointer-events-auto">
                {/* Title & Main Info */}
                <div className="mb-4">
                  <h1 className={`font-serif text-white mb-2 drop-shadow-2xl tracking-wide ${
                    isMobile ? 'text-xl' : 'text-3xl lg:text-4xl xl:text-5xl'
                  }`}>
                    {content.title}
                  </h1>
                  
                  <div className={`flex items-center space-x-4 mb-4 ${
                    isMobile ? 'text-sm' : 'text-base'
                  }`}>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                      {content.rating ? `${Math.round(content.rating * 20)}% Match` : '98% Match'}
                    </span>
                    <span className="text-white/90 font-medium">{new Date().getFullYear()}</span>
                    <div className="flex items-center space-x-2">
                      <span className="border border-white/40 text-white/80 px-2 py-0.5 text-xs font-medium">
                        {content.premiumPrice > 0 ? 'HD' : 'SD'}
                      </span>
                      <span className="text-white/80">{Math.round((content.duration || 120) / 60)}m</span>
                    </div>
                  </div>

                  {/* Description - Like Netflix */}
                  {content.description && (
                    <p className={`text-white/90 leading-relaxed drop-shadow-lg font-medium ${
                      isMobile 
                        ? 'text-sm line-clamp-2 max-w-xs' 
                        : 'text-lg line-clamp-3 max-w-2xl'
                    }`}>
                      {content.description}
                    </p>
                  )}

                  {/* Genres - Subtle */}
                  {content.genre && content.genre.length > 0 && !isMobile && (
                    <div className="mt-3">
                      <span className="text-white/70 text-sm">
                        {content.genre.slice(0, 3).join(' • ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Badge with Icons - Top Right Corner */}
            <div className={`absolute ${isMobile ? 'top-4 right-4' : 'top-8 right-8'}`}>
              <div className="pointer-events-auto">
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-lg shadow-lg ${
                  (paymentState.isPaid && content.premiumPrice > 0) 
                    ? 'bg-gradient-to-r from-slate-900/95 via-violet-900/90 to-slate-900/95 text-white border border-violet-500/30' 
                    : 'bg-gradient-to-r from-slate-800/95 via-slate-700/90 to-slate-800/95 text-gray-300 border border-slate-500/30'
                }`}>
                  {/* Icon - Unlock for paid, Lock for unpaid */}
                  <div className={`w-3 h-3 ${isMobile ? 'w-2.5 h-2.5' : ''}`}>
                    {(paymentState.isPaid && content.premiumPrice > 0) ? (
                      // Unlock icon for premium/paid content
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-yellow-400">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                        <circle cx="12" cy="15" r="2" fill="currentColor"/>
                        <path d="M8.5 8V6c0-.5.5-1 1-1h5c.5 0 1 .5 1 1v2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      </svg>
                    ) : (
                      // Lock icon for preview/unpaid content
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-red-400">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                        <circle cx="12" cy="15" r="2" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* Text */}
                  <span className={`font-medium tracking-wide ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {(paymentState.isPaid && content.premiumPrice > 0) ? 'CLIMAX PREMIUM' : 'CLIMAX PREVIEW'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Gradient for Controls - Classic Black Vintage */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          </div>
        )}

        {/* Climax Watermark - Always Visible */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-white/70 text-xs font-semibold tracking-wider">
            CLIMAX
          </div>
        </div>

        {/* Mobile Touch Areas - REMOVED - Using container-level tap toggle */}
        
        {/* Premium YouTube-Style Controls - Mobile Optimized */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Enhanced Draggable Progress Bar */}
          <div className={`px-4 pb-2 ${isMobile ? 'px-6 pb-4' : 'px-6 pb-2'}`}>
            <div 
              className={`w-full bg-white/20 rounded-full cursor-pointer group transition-all select-none ${
                isMobile ? 'h-3 hover:h-4' : 'h-2 hover:h-3'
              } ${isDragging ? 'h-4' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsDragging(true);
                const touch = e.touches[0];
                const bar = e.currentTarget as HTMLElement;
                const rect = bar.getBoundingClientRect();
                const percentage = (touch.clientX - rect.left) / rect.width;
                const newTime = percentage * duration;
                
                const video = videoRef.current;
                if (video) {
                  video.currentTime = Math.max(0, Math.min(duration, newTime));
                  setCurrentTime(newTime);
                }
              }}
              onTouchMove={(e) => {
                if (!isDragging) return;
                e.preventDefault();
                
                const touch = e.touches[0];
                const bar = e.currentTarget as HTMLElement;
                const rect = bar.getBoundingClientRect();
                const percentage = (touch.clientX - rect.left) / rect.width;
                const newTime = percentage * duration;
                
                const video = videoRef.current;
                if (video) {
                  video.currentTime = Math.max(0, Math.min(duration, newTime));
                  setCurrentTime(newTime);
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                setIsDragging(false);
                e.stopPropagation();
              }}
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-red-600 rounded-full relative transition-all group-hover:bg-red-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full transition-all shadow-lg ${
                  isMobile ? 'w-5 h-5' : 'w-4 h-4'
                } ${isDragging || showControls ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'}`} />
              </div>
              
              {/* Time tooltip on drag */}
              {isDragging && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                </div>
              )}
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

              {/* Volume Controls - Hidden (using system audio) */}
              {/* Removed: Volume controls are now handled by system audio */}

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