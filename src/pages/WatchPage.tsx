import React from 'react';
import { useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { VideoPlayer } from '../components/common/VideoPlayer';

const WatchPage: React.FC = () => {
  const { id } = useParams();
  const { getContentById } = useContent();
  const content = getContentById(id || '');

  if (!content) {
    return (
      <div className="text-center py-20 text-white">
        <h2>❌ Content not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
      <p className="mb-2">{content.description}</p>
      <VideoPlayer />
    </div>
  );
};

export default WatchPage;
