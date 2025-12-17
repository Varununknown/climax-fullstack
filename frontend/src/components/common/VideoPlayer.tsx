import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Maximize, Minimize, VolumeX, Lock, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';
import API from '../../services/api';

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ===== SIMPLIFIED STATES (matching your working example) =====
  const [content, setContent] = useState<Content | null>(null);
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [paymentChecked, setPaymentChecked] = useState(false); // Prevent multiple checks
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // UI states
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('Auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  
  const qualities = ['Auto', '1080p', '720p', '480p', '360p'];
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastValidTime = useRef<number>(0);

  // ===== FETCH CONTENT =====
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      try {
        const res = await API.get(`/contents/${id}`);
        if (!res.data) throw new Error('Content not found');
        setContent(res.data);
        console.log('✅ Content loaded:', res.data.title, '| Climax:', res.data.climaxTimestamp + 's');
      } catch (err) {
        console.error('❌ Error fetching content:', err);
        navigate('/');
      }
    };

    fetchContent();
  }, [id, navigate]);

  // ===== CHECK PAYMENT STATUS (ONLY ONCE; don't override once true) =====
  useEffect(() => {
    const checkPayment = async () => {
      if (!content || !user || paymentChecked || hasPaid === true) return;

      console.log('🔍 Checking payment for:', {
        userId: user.id,
        contentId: content._id,
        contentTitle: content.title
      });

      setPaymentChecked(true); // Mark as checked to prevent re-runs

      try {
        const userId = user.id || (user as any)._id;
        if (!userId) {
          console.log('⚠️ User ID not found, skipping payment check');
          return;
        }

        const res = await API.get(`/payments/check?userId=${userId}&contentId=${content._id}`);
        const data = res.data;
        
        console.log('📡 Payment API Response:', data);
        console.log('📊 Payment Status Details:', {
          paid: data.paid,
          paymentExists: !!data.payment,
          responseKeys: Object.keys(data)
        });

        // Only set to true; avoid flipping to false once premium is granted in-session
        if (data.paid) {
          setHasPaid(true);
          setShowPaymentModal(false);
          console.log('✅ PAYMENT FOUND - Content permanently unlocked');
        } else if (!hasPaid) {
          // Only set false if we haven't already set true in this session
          setHasPaid(false);
        }
        console.log('💳 Final Payment Status:', data.paid ? '✅ PAID' : '❌ NOT PAID');
      } catch (err: any) {
        console.error('❌ Error checking payment:', err);
        console.error('❌ Full error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
  if (!hasPaid) setHasPaid(false);
      }
    };

    checkPayment();
  }, [content, user, paymentChecked, hasPaid]);

  // ===== VIDEO PROTECTION (matching your working logic) =====
  useEffect(() => {
    if (!content || hasPaid === null) return;
    const video = videoRef.current;
    if (!video) return;

    const climax = content.climaxTimestamp;

    const onTimeUpdate = () => {
      const time = video.currentTime;

      if (!hasPaid && time >= climax) {
        video.pause();
        video.currentTime = lastValidTime.current;
        setIsPlaying(false);
        setShowPaymentModal(true);
        return;
      }

      if (time < climax) {
        lastValidTime.current = time;
      }

      setCurrentTime(time);
    };

    const onSeeked = () => {
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

  // ===== PAYMENT SUCCESS (set premium immediately; verify in background, never revoke this session) =====
  const handlePaymentSuccess = async () => {
    if (!content || !user) return;

    console.log('🎉 Payment success handler triggered');

    try {
      // Immediately grant premium for this session
      setHasPaid(true);
      setShowPaymentModal(false);
      setPaymentChecked(true);
      videoRef.current?.play();
      setIsPlaying(true);
      console.log('🏷️ Badge set to CLIMAX PREMIUM (session). Will verify in background.');

      // Background verification; do NOT revoke UI this session
      setTimeout(async () => {
        try {
          const userId = user.id || (user as any)._id;
          if (!userId) return;
          const res = await API.get(`/payments/check?userId=${userId}&contentId=${content._id}`);
          console.log('🔍 Background verification result:', res.data);
        } catch (bgErr) {
          console.warn('⚠️ Background verification failed (ignored):', bgErr);
        }
      }, 1200);
    } catch (err) {
      console.error('❌ Error verifying payment after success:', err);
    }
  };

  // ===== PAUSE VIDEO WHEN MODAL OPENS =====
  useEffect(() => {
    if (showPaymentModal && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [showPaymentModal]);

  // ===== CONTROLS =====
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
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
    
    if (!hasPaid && newTime >= content.climaxTimestamp) {
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
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    
    if (isPlaying) {
      const timeout = window.setTimeout(() => setShowControls(false), 3000);
      setControlsTimeout(timeout);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-black">
        Loading video...
      </div>
    );
  }

  if (hasPaid === null && !paymentChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-black">
        Checking payment status...
      </div>
    );
  }

  const isLocked = !hasPaid && content.premiumPrice > 0;
  
  console.log('🏷️ Badge State Debug:', {
    hasPaid,
    premiumPrice: content.premiumPrice,
    isLocked,
    contentTitle: content.title
  });

  return (
    <div 
      ref={containerRef}
      className="relative bg-black min-h-screen flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        onClick={togglePlayPause}
        crossOrigin="anonymous"
      />

      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="text-white text-center">
            <h2 className="text-lg font-semibold">{content.title}</h2>
            <p className="text-sm text-gray-300">{content.category} • {content.type}</p>
          </div>
          
          {/* Payment Badge */}
          <div className="flex items-center space-x-2">
            {isLocked && (
              <span className="bg-red-600 text-white px-2 py-1 rounded-full text-sm flex items-center">
                <Lock size={12} className="mr-1" />
                Preview
              </span>
            )}
            {hasPaid && (
              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-sm flex items-center">
                ✅ Climax Premium
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between mb-2">
          {/* Time */}
          <div className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {/* Quality Menu */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="text-white text-sm px-3 py-1 bg-black/50 rounded hover:bg-black/70 transition-colors"
            >
              {quality}
            </button>
            {showQualityMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded overflow-hidden">
                {qualities.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="relative h-1 bg-white/20 rounded-full cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percentage = ((e.clientX - rect.left) / rect.width) * 100;
            seekTo(percentage);
          }}>
            <div 
              className="absolute left-0 top-0 h-full bg-red-600 rounded-full"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            {/* Climax indicator */}
            {content.climaxTimestamp && duration && (
              <div 
                className="absolute top-0 w-1 h-full bg-yellow-400"
                style={{ left: `${(content.climaxTimestamp / duration) * 100}%` }}
              />
            )}
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={togglePlayPause} className="text-white hover:text-gray-300 transition-colors">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <div className="flex items-center space-x-2">
              <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (videoRef.current) {
                    videoRef.current.volume = newVolume;
                  }
                  setIsMuted(newVolume === 0);
                }}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
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