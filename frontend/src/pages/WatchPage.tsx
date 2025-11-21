import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '../components/common/PremiumVideoPlayer';
import { IntroVideoModal } from '../components/common/IntroVideoModal';

const WatchPage: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // ✅ Show intro video when entering watch page
    setShowIntro(true);
  }, []);

  const INTRO_VIDEO_URL = 'https://pub-95bb0d4ac3014d6082cbcd99b03f24c5.r2.dev/video3.mp4';

  return (
    <>
      {/* ✅ Intro Video Modal - plays before content (loads main video in background) */}
      <IntroVideoModal 
        isOpen={showIntro}
        onClose={() => setShowIntro(false)}
        videoUrl={INTRO_VIDEO_URL}
      />
      
      {/* Main Video Player - loads in background while intro plays */}
      <VideoPlayer />
    </>
  );
};

export default WatchPage;
