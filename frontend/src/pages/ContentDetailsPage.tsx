import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Share, Heart, Download, Star, Clock } from 'lucide-react';
import API from '../services/api';
import { Content } from '../types';

export const ContentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'synopsis' | 'cast' | 'videos' | 'gallery'>('synopsis');

  // Mock cast data (you can expand this later)
  const mockCast = [
    { name: 'Lead Actor', image: 'https://via.placeholder.com/100x100', role: 'Protagonist' },
    { name: 'Supporting Actor', image: 'https://via.placeholder.com/100x100', role: 'Antagonist' },
    { name: 'Lead Actress', image: 'https://via.placeholder.com/100x100', role: 'Heroine' },
  ];

  // Fetch content details
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setError('Content ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get(`/contents/${id}`);
        setContent(response.data);
      } catch (err: any) {
        console.error('Error fetching content:', err);
        setError(err.response?.status === 404 ? 'Content not found' : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleWatchNow = () => {
    // Navigate to the premium video player (preserving all business logic)
    navigate(`/watch/${id}`);
  };

  const handleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    // Add API call to update watchlist
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content?.title,
        text: content?.description,
        url: window.location.href,
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Content Details...</h2>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Content Unavailable</h2>
          <p className="text-gray-400 mb-6">{error || 'Content not found'}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Background */}
      <div className="relative">
        {/* Background Image */}
        <div 
          className="h-64 sm:h-80 md:h-96 lg:h-[500px] bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${content.thumbnail})`,
          }}
        >
          {/* Navigation */}
          <div className="absolute top-0 left-0 right-0 p-3 sm:p-6 flex justify-between items-center z-10">
            <button
              onClick={() => navigate(-1)}
              className="p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all"
            >
              <ArrowLeft size={20} className="sm:size-24" />
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all">
                <Download size={18} className="sm:size-20" />
              </button>
              <button 
                onClick={handleShare}
                className="p-2 sm:p-3 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all"
              >
                <Share size={18} className="sm:size-20" />
              </button>
            </div>
          </div>

          {/* Content Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4 leading-tight">{content.title}</h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-6 text-xs sm:text-sm md:text-base">
                <span className="px-2 sm:px-3 py-1 bg-gray-700 rounded">{new Date().getFullYear()}</span>
                <span className="px-2 sm:px-3 py-1 bg-red-600 rounded">UA 16+</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="sm:size-16" />
                  {formatDuration(content.duration || 120)}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 sm:size-16" />
                  {content.rating || 4.5}
                </span>
              </div>

              {/* Genre Tags */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-6">
                {content.genre?.map((g: string, index: number) => (
                  <span key={index} className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm">
                    {g}
                  </span>
                ))}
                <span className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm">{content.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={handleWatchNow}
            className="flex-1 sm:min-w-[200px] bg-red-600 hover:bg-red-700 px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-colors"
          >
            <Play size={18} className="sm:size-24" />
            Watch Now
          </button>
          
          <button
            onClick={handleWatchlist}
            className={`px-3 sm:px-6 py-3 sm:py-4 rounded-lg border-2 flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base ${
              isInWatchlist 
                ? 'bg-red-600 border-red-600 text-white' 
                : 'border-gray-600 hover:border-white'
            }`}
          >
            <Plus size={16} className="sm:size-20" />
            <span className="hidden sm:inline">{isInWatchlist ? 'Added' : 'Watchlist'}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="px-3 sm:px-6 py-3 sm:py-4 rounded-lg border-2 border-gray-600 hover:border-white flex items-center justify-center gap-1 sm:gap-2 transition-colors"
          >
            <Share size={16} className="sm:size-20" />
            <span className="hidden sm:inline">Share</span>
          </button>
          
          <button className="px-3 sm:px-6 py-3 sm:py-4 rounded-lg border-2 border-gray-600 hover:border-white flex items-center justify-center gap-1 sm:gap-2 transition-colors">
            <Heart size={16} className="sm:size-20" />
            <span className="hidden sm:inline">Rate</span>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-700 mb-4 sm:mb-8 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8">
            {['synopsis', 'cast', 'videos', 'gallery'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 sm:py-4 px-2 sm:px-2 border-b-2 font-medium text-xs sm:text-sm uppercase tracking-wide transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'synopsis' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Synopsis</h3>
                <p className="text-gray-300 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6">
                  {content.description}
                </p>
              </div>
              
              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Details</h4>
                  <div className="space-y-1 sm:space-y-2 text-gray-300 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{content.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{formatDuration(content.duration || 120)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 sm:size-16" />
                        {content.rating || 4.5}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Release:</span>
                      <span>{new Date().getFullYear()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {content.genre?.map((g: string, index: number) => (
                      <span key={index} className="px-2 sm:px-3 py-1 bg-gray-800 rounded-full text-xs sm:text-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Cast & Crew</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {mockCast.map((person, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 rounded-full bg-gray-800 mx-auto mb-2 sm:mb-3 overflow-hidden">
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-xs sm:text-base">{person.name}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm">{person.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                <div className="relative group cursor-pointer">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={content.thumbnail}
                      alt="Trailer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={32} className="text-white sm:size-48" />
                    </div>
                  </div>
                  <h4 className="mt-2 sm:mt-3 font-semibold text-sm sm:text-base">Official Trailer</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">2:30 mins</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Posters & Wallpapers</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {[1,2,3,4,5,6,7,8].map((item) => (
                  <div key={item} className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden group cursor-pointer">
                    <img
                      src={content.thumbnail}
                      alt={`Gallery ${item}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};