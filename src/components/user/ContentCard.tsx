import React, { useState } from 'react';
import { Play, Star, Clock, Info, Plus } from 'lucide-react';
import { Content } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ContentCardProps {
  content: Content;
  showCategory?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  showCategory,
  size = 'medium' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const cardSizes = {
    small: 'aspect-[16/9]',
    medium: 'aspect-[3/4]',
    large: 'aspect-[16/9]'
  };

  return (
    <div
      className="group relative cursor-pointer transform transition-all duration-300 hover:scale-100 hover:z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/watch/${content._id}`)} // ✅ FIXED
    >
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className={`relative ${cardSizes[size]} overflow-hidden`}>
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {content.premiumPrice === 0 && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
              Free
            </div>
          )}
            

          {content.premiumPrice > 0 && (
            <div className="absolute top-2 left-2 bg-black/80 text-white px-1 py-1 rounded text-xs font-bold">
              Climax  ₹{content.premiumPrice}
            </div>
          )}

          {/*
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded capitalize">
            {content.type}
          </div>
                */}
          <div className={`absolute inset-0 flex flex-col justify-end p-4 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
              {content.title}
            </h3>

            <div className="flex items-center space-x-3 text-sm text-gray-300 mb-3">
              {content.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{content.rating}</span>
                </div>
              )}
              <span>2024</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(content.duration)}</span>
              </div>
              <div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">
                U/A 16+
              </div>
            </div>

            <p className="text-gray-300 text-sm line-clamp-2 mb-4">
              {content.description}
            </p>

            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/watch/${content._id}`); // ✅ FIXED
                }}
                className="flex-1 bg-white text-black text-sm font-bold py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="bg-gray-700/80 text-white p-2 rounded hover:bg-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="bg-gray-700/80 text-white p-2 rounded hover:bg-gray-600 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={`p-2 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
            {content.title}
          </h3>
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            {content.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{content.rating}</span>
              </div>
            )}
            <span>•</span>
            <span>{formatDuration(content.duration)}</span>
            {showCategory && (
              <>
                <span>•</span>
                <span>{content.category}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
