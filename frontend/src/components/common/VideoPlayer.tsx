import React, { useState, useRef, useEffect, SyntheticEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, CreditCard, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';
import API from '../../services/api';

export const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [content, setContent] = useState<Content | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState<boolean>(false); // Simple default
  const [videoQuality, setVideoQuality] = useState('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastValidTime = useRef<number>(0);

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      try {
        // Use CDN-optimized endpoint for super fast loading
        const res = await API.get(`/contents/${id}`);
        const contentData = res.data;
        
        // Ensure video URL is CDN-optimized
        if (contentData.videoUrl && !contentData.videoUrl.includes('cdn') && !contentData.videoUrl.includes('r2.cloudflarestorage.com')) {
          // If not already CDN URL, use the video proxy endpoint for optimization
          contentData.videoUrl = `${API.defaults.baseURL}/video/${id}`;
        }
        
        setContent(contentData);
      } catch (err) {
        console.error('❌ Error fetching content:', err);
        // Try to get content from the list API instead (CDN-optimized)
        try {
          const listRes = await API.get('/contents');
          const foundContent = listRes.data.find((c: any) => c._id === id);
          if (foundContent) {
            setContent(foundContent);
          } else {
            navigate('/');
          }
        } catch (listErr) {
          navigate('/');
        }
      }
    };

    fetchContent();
  }, [id, navigate]);

  useEffect(() => {
    const checkPayment = async () => {
      if (!content || !user) {
        // If no user or content, assume not paid to show payment modal
        setHasPaid(false);
        return;
      }

      try {
        const res = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
        console.log('💰 Payment check response:', res.data);
        setHasPaid(res.data.paid);
        if (res.data.paid) setShowPaymentModal(false);
      } catch (err) {
        console.error('❌ Error checking payment:', err);
        // On error, assume not paid to show payment modal
        setHasPaid(false);
      }
    };

    checkPayment();
  }, [content, user]);

  useEffect(() => {
    if (!content || hasPaid === null) return;
    const video = videoRef.current;
    if (!video) return;

    const climax = content.climaxTimestamp;
    console.log('🎬 Setting up payment check - Climax at:', climax, 'seconds');
    console.log('💰 Has paid:', hasPaid);

    const onTimeUpdate = () => {
      const time = video.currentTime;

      if (!hasPaid && time >= climax) {
        console.log('🚫 Payment required! Current time:', time, 'Climax:', climax);
        video.pause();
        video.currentTime = lastValidTime.current;
        setIsPlaying(false);
        setShowPaymentModal(true);
        console.log('💳 Opening payment modal...');
        return;
      }

      if (time < climax) {
        lastValidTime.current = time;
      }

      setCurrentTime(time);
    };

    const onSeeked = () => {
      if (!hasPaid && video.currentTime >= climax) {
        console.log('🚫 Seek blocked! Attempting to seek past climax');
        video.currentTime = lastValidTime.current;
        video.pause();
        setIsPlaying(false);
        setShowPaymentModal(true);
        console.log('💳 Opening payment modal from seek...');
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

  const handlePaymentSuccess = async () => {
    if (!content || !user) return;

    try {
      const res = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
      if (res.data.paid) {
        setHasPaid(true);
        setShowPaymentModal(false);
        videoRef.current?.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('❌ Error verifying payment after success:', err);
    }
  };

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-play when content loads
  useEffect(() => {
    if (content && videoRef.current) {
      const video = videoRef.current;
      video.muted = false; // Unmute by default
      video.play().catch(err => {
        console.log('Auto-play failed, user interaction required:', err);
        // If auto-play fails due to browser policy, user will need to click play
      });
      setIsPlaying(true);
    }
  }, [content]);

  if (!content) {
    return null; // No loading screen, just wait for content
  }

  return (
    <div className="relative bg-black min-h-screen flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full max-w-4xl rounded shadow-lg"
        controls
        playsInline
        autoPlay
        muted={false}
        preload="auto"
        poster={content.thumbnail}
        onLoadedData={() => {
          // Ensure video plays as soon as data is loaded
          const video = videoRef.current;
          if (video) {
            video.play().catch(() => {
              // Auto-play failed, user interaction required
            });
            setIsPlaying(true);
          }
        }}
        onError={(e) => {
          console.error('Video loading error:', e);
        }}
        style={{
          maxHeight: videoQuality === '360p' ? '360px' : 
                    videoQuality === '480p' ? '480px' : 
                    videoQuality === '720p' ? '720px' : 'auto'
        }}
      />



      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <button type="button" onClick={() => navigate(-1)} className="text-white flex items-center space-x-2">
          <ArrowLeft /> <span>Back</span>
        </button>
        <div className="text-white text-center">
          <h2 className="text-lg font-bold">{content.title}</h2>
          <p className="text-sm">{content.category} • {content.type}</p>
        </div>
        
        {/* Quality Control */}
        <div className="relative">
          <button 
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="text-white bg-black/50 px-3 py-1 rounded hover:bg-black/70"
          >
            🎥 {videoQuality === 'auto' ? 'Auto' : videoQuality}
          </button>
          
          {showQualityMenu && (
            <div className="absolute right-0 top-8 bg-black/90 rounded shadow-lg min-w-[120px]">
              {['auto', '720p', '480p', '360p'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => {
                    setVideoQuality(quality);
                    setShowQualityMenu(false);
                    // Auto-adjust video quality here if needed
                  }}
                  className={`block w-full text-left px-3 py-2 text-white hover:bg-gray-600 ${
                    videoQuality === quality ? 'bg-red-600' : ''
                  }`}
                >
                  {quality === 'auto' ? 'Auto (Recommended)' : quality}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-black/60">
        <div className="text-white text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="flex space-x-2">
          {!hasPaid && content.premiumPrice > 0 && (
            <button
              type="button"
              onClick={() => {
                console.log('💳 Manual payment modal trigger');
                setShowPaymentModal(true);
              }}
              className="flex items-center bg-red-600 text-white px-3 py-2 rounded space-x-1"
            >
              <CreditCard className="w-4 h-4" />
              <span>Unlock ₹{content.premiumPrice}</span>
            </button>
          )}
          <button type="button" onClick={togglePlayPause} className="text-white">
            {isPlaying ? <Pause /> : <Play />}
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50">
          <PaymentModal
            content={content}
            onSuccess={handlePaymentSuccess}
            onClose={() => {
              console.log('💳 Closing payment modal');
              setShowPaymentModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
