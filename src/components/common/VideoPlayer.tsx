import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Content } from '../../types';

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastValidTime = useRef<number>(0);

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/contents/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setContent(data);
      } catch (err) {
        console.error('❌ Error fetching content:', err);
        navigate('/');
      }
    };

    fetchContent();
  }, [id, navigate]);

  useEffect(() => {
    const checkPayment = async () => {
      if (!content || !user) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/payments/check?userId=${user.id}&contentId=${content._id}`
        );
        const data = await res.json();
        setHasPaid(data.paid);
        if (data.paid) setShowPaymentModal(false);
      } catch (err) {
        console.error('❌ Error checking payment:', err);
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

  const handlePaymentSuccess = async () => {
    if (!content || !user) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/payments/check?userId=${user.id}&contentId=${content._id}`
      );
      const data = await res.json();
      if (data.paid) {
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

  if (!content || hasPaid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-black">
        Loading video...
      </div>
    );
  }

  return (
    <div className="relative bg-black min-h-screen flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full max-w-4xl rounded shadow-lg"
        controls
        autoPlay
        playsInline
        muted
      />

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <button type="button" onClick={() => navigate(-1)} className="text-white flex items-center space-x-2">
          <ArrowLeft /> <span>Back</span>
        </button>
        <div className="text-white text-center">
          <h2 className="text-lg font-bold">{content.title}</h2>
          <p className="text-sm">{content.category} • {content.type}</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-black/60">
        <div className="text-white text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        {!hasPaid && content.premiumPrice > 0 && (
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center bg-red-600 text-white px-3 py-2 rounded space-x-1"
          >
            <CreditCard className="w-4 h-4" />
            <span>Unlock Full Access</span>
          </button>
        )}
        <button type="button" onClick={togglePlayPause} className="text-white">
          {isPlaying ? <Pause /> : <Play />}
        </button>
      </div>

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
