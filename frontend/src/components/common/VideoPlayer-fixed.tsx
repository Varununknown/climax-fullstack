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
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [videoQuality, setVideoQuality] = useState('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastValidTime = useRef<number>(0);

  // SIMPLIFIED PAYMENT CHECK - NO COMPLEX LOGIC
  useEffect(() => {
    const checkPayment = async () => {
      if (!content || !user) {
        setHasPaid(false);
        return;
      }

      // Check localStorage first for instant unlock
      const paymentKey = `payment_${user.id}_${content._id}`;
      const cachedPayment = localStorage.getItem(paymentKey);
      
      if (cachedPayment === 'true') {
        console.log('✅ CACHED PAYMENT FOUND - CONTENT UNLOCKED PERMANENTLY!');
        setHasPaid(true);
        return;
      }

      try {
        // Check server for payment
        const res = await API.get(`/payments/check?userId=${user.id}&contentId=${content._id}`);
        if (res.data.paid) {
          console.log('✅ SERVER PAYMENT FOUND - CONTENT UNLOCKED PERMANENTLY!');
          setHasPaid(true);
          localStorage.setItem(paymentKey, 'true'); // Cache for future
        } else {
          console.log('❌ NO PAYMENT FOUND - Will require payment at climax');
          setHasPaid(false);
        }
      } catch (err) {
        console.error('❌ Payment check error:', err);
        setHasPaid(false);
      }
    };

    checkPayment();
  }, [content, user]);

  // FETCH CONTENT
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      try {
        const res = await API.get(`/contents/${id}`);
        setContent(res.data);
      } catch (err) {
        console.error('❌ Error fetching content:', err);
        navigate('/');
      }
    };

    fetchContent();
  }, [id, navigate]);

  // SIMPLE VIDEO CONTROL - NO COMPLEX CHECKS
  useEffect(() => {
    if (!content || hasPaid === null) return;
    const video = videoRef.current;
    if (!video) return;

    const climax = content.climaxTimestamp;

    const onTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // SIMPLE RULE: If paid, allow everything. If not paid and past climax, require payment
      if (hasPaid === false && time >= climax) {
        console.log('🚫 Payment required at climax!');
        video.pause();
        video.currentTime = lastValidTime.current;
        setIsPlaying(false);
        setShowPaymentModal(true);
        return;
      }

      if (time < climax) {
        lastValidTime.current = time;
      }
    };

    const onSeeked = () => {
      if (hasPaid === false && video.currentTime >= climax) {
        console.log('🚫 Seek blocked past climax!');
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

  const handlePaymentSuccess = () => {
    console.log('✅ Payment successful!');
    setHasPaid(true);
    setShowPaymentModal(false);
    
    // Cache payment permanently
    if (content && user) {
      const paymentKey = `payment_${user.id}_${content._id}`;
      localStorage.setItem(paymentKey, 'true');
    }
    
    // Resume video
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
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

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full h-screen object-contain"
        onClick={togglePlayPause}
        style={{
          maxHeight: videoQuality === '360p' ? '360px' : 
                    videoQuality === '480p' ? '480px' : 
                    videoQuality === '720p' ? '720px' : 'auto'
        }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <button 
          onClick={() => navigate(-1)} 
          className="text-white flex items-center space-x-2 hover:text-gray-300"
        >
          <ArrowLeft /> <span>Back</span>
        </button>
        
        <div className="text-white text-center">
          <h2 className="text-lg font-bold">{content.title}</h2>
          <p className="text-sm">{content.category} • {content.type}</p>
          {hasPaid === true && (
            <p className="text-xs text-green-400 mt-1">✅ Premium Content Unlocked</p>
          )}
          {hasPaid === false && (
            <p className="text-xs text-orange-400 mt-1">💳 Payment Required After Preview</p>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="text-white bg-black/50 px-3 py-1 rounded hover:bg-black/70"
          >
            🎥 {videoQuality === 'auto' ? 'Auto' : videoQuality}
          </button>
          
          {showQualityMenu && (
            <div className="absolute right-0 top-8 bg-black/90 rounded shadow-lg min-w-[120px] z-10">
              {['auto', '720p', '480p', '360p'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => {
                    setVideoQuality(quality);
                    setShowQualityMenu(false);
                  }}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-700 ${
                    videoQuality === quality ? 'bg-gray-600' : ''
                  }`}
                >
                  {quality === 'auto' ? 'Auto' : quality}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center space-x-4">
          <button 
            onClick={togglePlayPause}
            className="text-white hover:text-gray-300"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <div className="flex-1">
            <div className="bg-gray-600 h-1 rounded">
              <div 
                className="bg-red-600 h-1 rounded transition-all duration-200"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal - ONLY shows if hasPaid is false AND showPaymentModal is true */}
      {hasPaid === false && showPaymentModal && (
        <PaymentModal
          content={content}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};