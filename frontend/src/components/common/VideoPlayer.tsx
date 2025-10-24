import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Maximize, Minimize, VolumeX, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';
import API from '../../services/api';

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ===== STATES =====
  const [content, setContent] = useState<Content | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLocked, setPaymentLocked] = useState(false); // ✅ Lock modal once payment verified
  
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

  // ===== FETCH CONTENT =====
  useEffect(() => {
    if (!id) return;
    API.get(`/contents/${id}`)
      .then(res => {
        setContent(res.data);
        console.log('✅ Content loaded:', res.data.title, '| Climax:', res.data.climaxTimestamp + 's');
      })
      .catch(() => navigate('/'));
  }, [id, navigate]);

  // ===== CHECK PAYMENT STATUS =====
  useEffect(() => {
    if (!content || !user) {
      setIsPaid(false);
      setCheckingPayment(false);
      return;
    }

    console.log('💳 Checking payment status in database...');
    
    // Check payment status in backend
    API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`)
      .then(res => {
        const paid = res.data.paid;
        console.log('📡 Payment check response:', paid ? '✅ PAID' : '❌ NOT PAID');
        
        if (paid) {
          // Payment verified - unlock content
          console.log('✅ PAYMENT VERIFIED - Content unlocked');
          setIsPaid(true);
          setPaymentLocked(true);
          setShowPaymentModal(false);
        } else {
          // No payment found - keep locked
          console.log('🔒 NO PAYMENT FOUND - Content locked');
          setIsPaid(false);
          setPaymentLocked(false);
        }
      })
      .catch(err => {
        console.error('❌ Payment check error:', err);
        // On error, assume not paid
        setIsPaid(false);
        setPaymentLocked(false);
      })
      .finally(() => setCheckingPayment(false));
  }, [content, user]);

  // ===== REAL-TIME PAYMENT POLLING =====
  // Re-check payment every 2 seconds to catch updates from successful payment
  // STOP POLLING once paymentLocked = true (payment is permanent)
  useEffect(() => {
    if (!content || !user || paymentLocked) {
      // ✅ CRITICAL: Don't poll if payment is already locked!
      return;
    }

    console.log('💳 Starting payment polling (will stop once locked)...');
    
    const pollInterval = setInterval(async () => {
      try {
        const res = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
        const paid = res.data.paid;
        
        if (paid && !isPaid) {
          console.log('🎉 PAYMENT DETECTED! Locking modal permanently');
          setIsPaid(true);
          setPaymentLocked(true); // ✅ Lock modal forever - STOPS POLLING
          setShowPaymentModal(false);
        }
      } catch (err) {
        // Silent fail on poll errors
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(pollInterval);
  }, [content, user, paymentLocked]);

  // ===== VIDEO PROTECTION (RUNS ONLY ONCE) =====
  useEffect(() => {
    if (!content) return;
    const video = videoRef.current;
    if (!video) return;

    const climax = content.climaxTimestamp;

    const onTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // If paid, allow everything (modal locked forever)
      if (isPaid || paymentLocked) return;

      // NOT PAID: Block at climax
      if (time >= climax) {
        console.log('🔒 BLOCKED at climax');
        video.pause();
        video.currentTime = climax - 0.5; // Go back slightly
        setIsPlaying(false);
        setShowPaymentModal(true);
      }
    };

    const onSeeking = () => {
      if (isPaid || paymentLocked) return;
      
      if (video.currentTime >= climax) {
        console.log('🚫 Seek blocked');
        video.currentTime = climax - 0.5;
        setShowPaymentModal(true);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [content, isPaid, paymentLocked]); // Re-attach when payment status changes

  // ===== PAUSE VIDEO WHEN MODAL OPENS =====
  useEffect(() => {
    if (showPaymentModal && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [showPaymentModal]);

  // ===== PAYMENT SUCCESS =====
  const handlePaymentSuccess = async () => {
    if (!content || !user) {
      console.log('❌ Missing content or user in handlePaymentSuccess');
      return;
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('💳💳💳 PAYMENT SUCCESS HANDLER TRIGGERED');
    console.log('Content:', content.title);
    console.log('User:', user.id);
    
    // ✅ CRITICAL: Immediately update states after successful payment
    console.log('⚡ Setting payment status after successful payment');
    setShowPaymentModal(false);
    setIsPaid(true);
    setPaymentLocked(true);
    
    // ✅ Resume video immediately
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => console.log('▶️ Video playback resumed'))
          .catch(err => console.error('❌ Error resuming playback:', err));
      }
    }, 300);
    
    // ✅ Verify in background (but don't update state)
    try {
      console.log('🔍 Verifying payment in database...');
      const res = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
      console.log('📡 Verification response:', res.data);

      if (res.data.paid) {
        console.log('✅ PAYMENT CONFIRMED! Locked permanently.');
      } else {
        console.log('⚠️ Database verification failed - but payment is locked anyway');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      console.log('⚠️ Verification error - but payment is locked anyway');
    }
    
    console.log('═══════════════════════════════════════════════════════');
  };

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
    
    if (!isPaid && newTime >= content.climaxTimestamp) {
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

  // ===== LOADING =====
  if (!content || checkingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-black">
        🎬 Loading...
      </div>
    );
  }

  // ✅ CRITICAL: If payment is locked, content is NEVER locked (full access)
  const isLocked = paymentLocked ? false : (!isPaid && content.premiumPrice > 0);
  const climaxPercentage = (content.climaxTimestamp / duration) * 100;

  return (
    <div 
      ref={containerRef}
      className="relative bg-black min-h-screen flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
      />

      {/* HEADER */}
      <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => navigate(-1)} className="text-white flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="text-white text-center flex-1">
          <h2 className="text-lg font-bold">{content.title}</h2>
          <p className="text-sm text-gray-300">{content.category} • {content.type}</p>
        </div>
        <div className="w-20" />
      </div>

      {/* PLAY BUTTON */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={togglePlayPause} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6">
            <Play className="w-12 h-12 fill-current" />
          </button>
        </div>
      )}

      {/* BADGE */}
      {isLocked && (
        <div className="absolute top-24 right-8 bg-red-600/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 animate-pulse">
          <Lock className="w-4 h-4" />
          <span className="font-bold">🔒 CLIMAX PREMIUM</span>
        </div>
      )}

      {/* CONTROLS */}
      <div className={`absolute bottom-0 left-0 right-0 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
        
        {/* PROGRESS BAR */}
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
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 ${climaxPercentage}%, #991b1b ${climaxPercentage}%, #991b1b 100%)`
              }}
            />
            {isLocked && (
              <div className="absolute text-xs text-red-400 -mt-5 font-bold" style={{ left: `${Math.max(climaxPercentage, 10)}%` }}>
                🔒 Locked
              </div>
            )}
          </div>
          <div className="flex justify-between text-white text-xs mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <button onClick={togglePlayPause} className="hover:bg-white/20 p-2 rounded">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-1">
              <button onClick={toggleMute} className="hover:bg-white/20 p-2 rounded">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={(e) => adjustVolume(Number(e.target.value) / 100 - volume)}
                className="w-20 h-1 bg-gray-600 rounded cursor-pointer"
              />
            </div>
            <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          {/* CENTER */}
          {isLocked && !paymentLocked && (
            <button onClick={() => setShowPaymentModal(true)} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded animate-pulse">
              <Lock className="w-4 h-4" />
              <span>💳 Unlock (₹{content.premiumPrice})</span>
            </button>
          )}
          {(isPaid || paymentLocked) && (
            <div className="text-green-400 font-bold text-sm">✅ Full Access Unlocked</div>
          )}

          {/* RIGHT */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="hover:bg-white/20 px-3 py-2 rounded text-sm">
                {quality}
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 bg-gray-900 rounded mb-2 py-2 w-32">
                  {qualities.map(q => (
                    <button key={q} onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                      className={`w-full text-left px-4 py-2 hover:bg-white/20 ${quality === q ? 'bg-red-600' : ''}`}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleFullscreen} className="hover:bg-white/20 p-2 rounded">
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
