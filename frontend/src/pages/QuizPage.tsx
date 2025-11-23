import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import API from '../services/api';
import QuizSystem from '../components/common/QuizSystem';

/*
  New Quiz Page - Dedicated page for the new quiz system
  Displays quiz for a specific content
  Replaces the old ParticipatePage with the new QuizSystem component
*/

export const QuizPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      navigate('/');
      return;
    }

    // Redirect to home if no contentId
    if (!contentId) {
      navigate('/');
      return;
    }

    // Fetch content details
    const fetchContent = async () => {
      try {
        const response = await API.get(`/contents/${contentId}`);
        setContent(response.data);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center bg-white/5 border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto border-4 border-white/30 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading Fan Fest
          </h2>
          <p className="text-slate-300">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md px-6 bg-white/5 border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-400/30">
              <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Content Not Found</h2>
          <p className="text-slate-300 mb-8">The requested Fan Fest content could not be located.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 border border-white/20"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Subtle Dark Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-slate-900/20 to-transparent"></div>

      {/* Simple Glass Header */}
      <div className="sticky top-0 z-50 bg-slate-900/30 border-b border-white/10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-150"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold hidden sm:block">Back</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                🎬 Fan Fest 🎬
              </h1>
              <p className="text-xs sm:text-sm text-blue-300 font-semibold tracking-widest uppercase">
                Climax Entertainment
              </p>
            </div>
            
            <div className="w-16 sm:w-20" />
          </div>
        </div>
      </div>

      {/* Main Content - Flex grow to push footer down */}
      <div className="relative flex-1">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero Section - Clean and Subtle */}
          <div className="mb-8 sm:mb-12">
            <div className="relative">
              <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 sm:p-8 lg:p-10">
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 text-center">
                  {content.title}
                </h2>
                
                {/* Subtitle - Fan Fest Tagline */}
                <p className="text-center text-sm sm:text-base text-blue-300 font-semibold mb-4 tracking-wide">
                  Test Your Knowledge • Win Exciting Prizes • Powered by Climax
                </p>
                
                {/* Description */}
                {content.description && (
                  <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed text-center mb-8">
                    {content.description}
                  </p>
                )}

                {/* Image - Simple Display */}
                {content.thumbnail && (
                  <div className="mb-8 sm:mb-10 flex justify-center">
                    <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-slate-700/50">
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sponsorship Section - Entertainment Style Like Theater Ads */}
          {content.fanFestSponsor && content.fanFestSponsor.name && (
            <div className="mb-8 sm:mb-12">
              <div className="relative rounded-xl overflow-hidden group">
                {/* Subtle gradient background - like theater curtain */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 group-hover:from-slate-800/60 group-hover:via-slate-700/40 group-hover:to-slate-800/60 transition-all duration-300"></div>
                
                {/* Elegant border */}
                <div className="absolute inset-0 border border-amber-500/20 group-hover:border-amber-500/40 transition-colors duration-300 rounded-xl"></div>
                
                {/* Content - Clean Layout */}
                <div className="relative p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-12">
                    {/* Sponsor Logo - Theater Style Frame */}
                    {content.fanFestSponsor.logo && (
                      <div className="flex-shrink-0">
                        <div className="relative">
                          {/* Elegant frame border */}
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-lg"></div>
                          <div className="relative bg-gradient-to-br from-white/8 to-white/3 border border-amber-400/20 rounded-lg p-4 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <img
                              src={content.fanFestSponsor.logo}
                              alt={content.fanFestSponsor.name}
                              className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sponsor Information - Clean and Elegant */}
                    <div className="flex-1 text-center md:text-left">
                      {/* Subtle badge */}
                      <div className="inline-block mb-3 px-3 py-1.5 bg-amber-500/10 border border-amber-400/30 rounded-full">
                        <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest">
                          ✦ Featured Partner ✦
                        </p>
                      </div>
                      
                      {/* Sponsor name - Large but not aggressive */}
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors duration-300">
                        {content.fanFestSponsor.name}
                      </h3>
                      
                      {/* Main message - Attractive tagline */}
                      {content.fanFestSponsor.tagline && (
                        <p className="text-lg sm:text-xl text-amber-100 font-semibold mb-3 italic">
                          "{content.fanFestSponsor.tagline}"
                        </p>
                      )}
                      
                      {/* Description - Additional context */}
                      {content.fanFestSponsor.description && (
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                          {content.fanFestSponsor.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Container - Direct Below Image */}
          <div className="relative">
            <QuizSystem 
              contentId={contentId!} 
              contentTitle={content.title}
            />
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <div className="relative mt-12 border-t border-slate-700/50 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  CLIMAX
                </h3>
                <p className="text-sm text-blue-300 font-semibold tracking-widest">
                  Entertainment
                </p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Premium streaming content with exciting fan engagement opportunities.
              </p>
            </div>

            {/* Fan Fest Info */}
            <div>
              <h4 className="font-semibold text-white mb-4">Fan Fest</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Fan Fest</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rules</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-slate-700/50 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-400">
                © 2025 Climax Entertainment. All rights reserved. | Official Platform
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-blue-300 hover:bg-blue-500/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-blue-300 hover:bg-blue-500/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-blue-300 hover:bg-blue-500/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path fill="#000" d="M12 7c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 5.5c-1.379 0-2.5-1.121-2.5-2.5S10.621 7.5 12 7.5s2.5 1.121 2.5 2.5-1.121 2.5-2.5 2.5zM17.5 8c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
