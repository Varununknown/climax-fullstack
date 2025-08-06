import React from 'react';
import { Play, Info, Star, Plus } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const { contents } = useContent();
  const navigate = useNavigate();

  // Get featured content (first content item for demo)
  const featuredContent = contents[0];

  if (!featuredContent) {
    return null;
  }

  return (
    <div className="relative h-[70vh] lg:h-[80vh]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={featuredContent.thumbnail}
          alt={featuredContent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-end h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
          <div className="max-w-2xl">
            {/* Prime Badge */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
                prime
              </div>
              <span className="text-white text-sm">Included with Prime</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {featuredContent.title}
            </h1>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{featuredContent.rating}</span>
              </div>
              <span className="text-gray-300">2024</span>
              <span className="text-gray-300">
                {Math.floor(featuredContent.duration / 60)} min
              </span>
              <span className="text-gray-300 capitalize">
                {featuredContent.type}
              </span>
              <div className="bg-gray-700 text-white px-2 py-1 rounded text-xs">
                U/A 16+
              </div>
            </div>

            <div className="flex space-x-2 mb-4">
              {featuredContent.genre.slice(0, 3).map((genre, index) => (
                <React.Fragment key={genre}>
                  {index > 0 && <span className="text-gray-500">•</span>}
                  <span className="text-gray-300 text-sm">{genre}</span>
                </React.Fragment>
              ))}
            </div>

            <p className="text-lg text-gray-300 mb-6 leading-relaxed line-clamp-3">
              {featuredContent.description}
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate(`/watch/${featuredContent._id}`)}
                className="flex items-center justify-center space-x-3 bg-white text-black font-semibold px-8 py-3 rounded hover:bg-gray-200 transition-colors"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play</span>
              </button>

              <button className="flex items-center justify-center space-x-3 bg-gray-600/80 text-white font-semibold px-8 py-3 rounded hover:bg-gray-600 transition-colors backdrop-blur-sm">
                <Plus className="w-5 h-5" />
                <span>Watchlist</span>
              </button>
            </div>

            {featuredContent.premiumPrice > 0 && (
              <div className="mt-4 flex items-center space-x-2">
                <div className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold">
                  RENT
                </div>
                <span className="text-white text-sm">
                  ₹{featuredContent.premiumPrice} to watch full movie
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
