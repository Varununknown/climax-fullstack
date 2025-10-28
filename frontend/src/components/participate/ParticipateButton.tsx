import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ParticipateButtonProps {
  contentId: string;
  onParticipate: () => void;
}

export const ParticipateButton: React.FC<ParticipateButtonProps> = ({
  contentId,
  onParticipate
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        // Check if participation is active for this content
        const settingsRes = await fetch(
          `${BACKEND_URL}/api/participation/user/${contentId}/questions`
        );
        
        if (settingsRes.ok) {
          setIsAvailable(true);

          // Check if user already participated
          const token = localStorage.getItem('streamflix_token');
          if (token) {
            const statusRes = await fetch(
              `${BACKEND_URL}/api/participation/user/${contentId}/status`,
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );
            
            if (statusRes.ok) {
              const data = await statusRes.json();
              setHasParticipated(data.hasParticipated);
            }
          }
        }
      } catch (err) {
        console.log('Participation not available for this content');
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [contentId]);

  if (isLoading || !isAvailable) {
    return null;
  }

  return (
    <button
      onClick={onParticipate}
      disabled={hasParticipated}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
        hasParticipated
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg hover:scale-105'
      }`}
      title={hasParticipated ? 'You have already participated' : 'Participate and win rewards!'}
    >
      <Trophy size={18} />
      {hasParticipated ? 'Already Participated' : 'Participate & Win'}
    </button>
  );
};
