import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Volume2, Maximize } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';
import API from '../../services/api';

// =====================================================
// 🎬 SIMPLE YOUTUBE-STYLE VIDEO PLAYER
// =====================================================

interface PaymentState {
  isLoading: boolean;
  isPaid: boolean;
  shouldShowModal: boolean;
}

export const SimpleVideoPlayer: React.FC = () => {
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
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Track previous time for paywall detection
  const [previousTime, setPreviousTime] = useState<number>(0);

  // ===== CONTENT FETCHING =====
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setError('Content ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get(`/content/${id}`);
        setContent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
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
        // Check permanent storage first
        const permanentKey = `payment_permanent_${user.id}_${content._id}`;
        const permanentPayment = localStorage.getItem(permanentKey);
        
        if (permanentPayment === 'approved') {
          setPaymentState(prev => ({ ...prev, isPaid: true, isLoading: false }));
          return;
        }

        // Check server
        const response = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
        const isPaid = response.data.paid;
        
        setPaymentState(prev => ({ ...prev, isPaid, isLoading: false }));
        
        if (isPaid) {
          localStorage.setItem(`payment_${user.id}_${content._id}`, 'true');
          localStorage.setItem(permanentKey, 'approved');
        }
        
      } catch (err) {
        console.error('Payment check failed:', err);
        setPaymentState(prev => ({ ...prev, isLoading: false, isPaid: false }));
      }
    };

    checkPaymentStatus();
  }, [content, user]);

  // ===== VIDEO EVENT HANDLERS =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !content) return;

    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      setCurrentTime(currentTime);
      
      // Paywall check - only trigger when moving forward past climax
      if (!paymentState.isPaid && currentTime >= content.climaxTimestamp && currentTime > previousTime) {
        video.pause();
        video.currentTime = Math.max(0, content.climaxTimestamp - 1);
        setIsPlaying(false);
        setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      }
      
      setPreviousTime(currentTime);
    };

    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [content, paymentState.isPaid, previousTime]);

  // ===== CONTROL FUNCTIONS =====
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

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
    
    // Check paywall for forward seeking
    if (!paymentState.isPaid && newTime > content.climaxTimestamp && newTime > video.currentTime) {
      setPaymentState(prev => ({ ...prev, shouldShowModal: true }));
      return;
    }

    video.currentTime = newTime;
    setPreviousTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentSuccess = () => {
    setPaymentState({
      isLoading: false,
      isPaid: true,
      shouldShowModal: false
    });

    if (content && user) {
      const permanentKey = `payment_permanent_${user.id}_${content._id}`;
      localStorage.setItem(`payment_${user.id}_${content._id}`, 'true');
      localStorage.setItem(permanentKey, 'approved');
    }

    const video = videoRef.current;
    if (video) {
      video.play();
    }
  };

  // ===== LOADING & ERROR STATES =====
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl mb-2">Error</h2>
          <p>{error || 'Content not found'}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Video Container */}
      <div className="relative w-full h-screen">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={content.videoUrl}
          className="w-full h-full object-contain bg-black"
          autoPlay
          muted
          playsInline
          onClick={togglePlayPause}
        />

        {/* Simple Controls Overlay */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setTimeout(() => setShowControls(false), 3000)}
        >
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/30 rounded mb-4 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-red-600 rounded"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            {/* Left Side - Play/Pause & Time */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-gray-300"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Side - Volume & Fullscreen */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    video.volume = video.volume > 0 ? 0 : 1;
                    setVolume(video.volume);
                  }
                }}
                className="text-white hover:text-gray-300"
              >
                <Volume2 size={20} />
              </button>
              
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    if (!isFullscreen) {
                      video.requestFullscreen?.();
                    } else {
                      document.exitFullscreen?.();
                    }
                    setIsFullscreen(!isFullscreen);
                  }
                }}
                className="text-white hover:text-gray-300"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Touch Areas */}
        {window.innerWidth <= 768 && (
          <>
            {/* Left Half - Forward */}
            <div
              className="absolute top-0 left-0 w-1/2 h-full"
              onDoubleClick={() => {
                const video = videoRef.current;
                if (video && content) {
                  const newTime = Math.min(video.currentTime + 10, content.climaxTimestamp - 1);
                  if (!paymentState.isPaid && newTime > content.climaxTimestamp) return;
                  video.currentTime = newTime;
                  setPreviousTime(newTime);
                }
              }}
            />
            
            {/* Right Half - Backward */}
            <div
              className="absolute top-0 right-0 w-1/2 h-full"
              onDoubleClick={() => {
                const video = videoRef.current;
                if (video) {
                  const newTime = Math.max(video.currentTime - 10, 0);
                  video.currentTime = newTime;
                  setPreviousTime(newTime);
                }
              }}
            />
          </>
        )}
      </div>

      {/* Payment Modal */}
      {paymentState.shouldShowModal && content && user && (
        <PaymentModal
          content={content}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setPaymentState(prev => ({ ...prev, shouldShowModal: false }));
            
            const video = videoRef.current;
            if (video && !paymentState.isPaid) {
              const safePosition = Math.max(0, content.climaxTimestamp - 2);
              video.currentTime = safePosition;
              video.pause();
              setIsPlaying(false);
              setPreviousTime(safePosition);
            }
          }}
        />
      )}
    </div>
  );
};