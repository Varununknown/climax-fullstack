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
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-950 to-black opacity-90"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Loading Content */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-1 animate-spin">
                <div className="w-full h-full rounded-full bg-black"></div>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Loading Fan Fest
          </h2>
          <p className="text-gray-400 text-lg">Preparing your premium experience... 🎬</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-950 to-black opacity-90"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Error Content */}
        <div className="relative z-10 text-center max-w-md px-6">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-pink-600 shadow-lg shadow-red-500/50">
              <span className="text-5xl">❌</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Content Not Found</h2>
          <p className="text-gray-400 mb-8">The requested Fan Fest content could not be located.</p>
          <button
            onClick={() => navigate('/')}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform duration-300">
              Return Home
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ultra Premium Animated Background - Enhanced */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Multi-layer Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-950 to-black opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-fuchsia-950/30 via-transparent to-blue-950/30"></div>
        
        {/* Enhanced Animated Orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-0 w-80 h-80 bg-fuchsia-600/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-600/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* Premium Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Multiple Radial Gradient Spotlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-1/3 w-full h-full bg-[radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.12),transparent_50%)]"></div>
        
        {/* Subtle Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-white/5 via-transparent to-transparent mix-blend-soft-light"></div>
      </div>

      {/* Ultra Premium Glassmorphic Header - Enhanced */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-black/50 border-b border-white/20 shadow-xl shadow-purple-900/30">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-fuchsia-900/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-all duration-300"
            >
              <div className="p-1.5 sm:p-2 rounded-xl bg-white/10 group-hover:bg-white/20 border border-white/10 group-hover:border-purple-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
              </div>
              <span className="font-semibold text-sm sm:text-base">Back</span>
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative group/badge">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full blur-md opacity-40 group-hover/badge:opacity-60 transition-opacity duration-300"></div>
                <div className="relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 border border-purple-400/50 backdrop-blur-sm">
                  <span className="text-[10px] sm:text-xs font-black text-purple-200 uppercase tracking-wider">Premium</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
                FAN FEST
              </h1>
            </div>
            <div className="w-16 sm:w-24" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        {/* Hero Card */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          {/* Ultra Premium Glass Card - Enhanced */}
          <div className="relative group/hero">
            {/* Multi-layer Glow Effects */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-3xl sm:rounded-4xl blur-3xl opacity-15 group-hover/hero:opacity-35 transition-all duration-700"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 rounded-2xl sm:rounded-3xl blur-xl opacity-20 group-hover/hero:opacity-30 transition-all duration-500"></div>
            
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-white/8 to-white/[0.03] backdrop-blur-3xl border border-white/15 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl group-hover/hero:shadow-3xl transition-all duration-500 group-hover/hero:scale-[1.01]">
              {/* Top Badge */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl sm:rounded-2xl blur-xl opacity-60"></div>
                  <div className="relative px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl sm:rounded-2xl">
                    <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest flex items-center gap-1 sm:gap-2">
                      <span className="hidden sm:inline">✦</span> Premium Content Challenge <span className="hidden sm:inline">✦</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-2xl">
                    {content.title}
                  </span>
                </h2>
                {content.description && (
                  <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light px-2">
                    {content.description}
                  </p>
                )}
              </div>

              {/* Thumbnail */}
              {content.thumbnail && (
                <div className="mb-6 sm:mb-8 lg:mb-10 flex justify-center">
                  <div className="relative group/img w-full max-w-lg">
                    {/* Outer Glow */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-xl sm:rounded-2xl blur-2xl opacity-40 group-hover/img:opacity-70 transition-all duration-500"></div>
                    
                    {/* Image Container */}
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/20">
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="relative w-full h-auto object-cover group-hover/img:scale-110 transition-transform duration-700"
                      />
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Feature Cards Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
                <div className="relative group/feature text-center">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl sm:rounded-2xl blur opacity-0 group-hover/feature:opacity-40 transition-all duration-300"></div>
                  <div className="relative p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-500/30 backdrop-blur-sm hover:border-purple-400/60 hover:bg-purple-900/50 transition-all duration-300 group-hover/feature:scale-105">
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2 lg:mb-3 group-hover/feature:scale-110 group-hover/feature:rotate-12 transition-all duration-300">🎬</div>
                    <p className="text-[10px] sm:text-xs text-purple-200 uppercase tracking-wider mb-0.5 sm:mb-1 font-bold">Exclusive</p>
                    <p className="text-xs sm:text-sm lg:text-base font-black text-white">Fan Fest</p>
                  </div>
                </div>
                <div className="relative group/feature text-center">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-fuchsia-600 to-fuchsia-800 rounded-xl sm:rounded-2xl blur opacity-0 group-hover/feature:opacity-40 transition-all duration-300"></div>
                  <div className="relative p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-fuchsia-900/40 to-fuchsia-900/20 border border-fuchsia-500/30 backdrop-blur-sm hover:border-fuchsia-400/60 hover:bg-fuchsia-900/50 transition-all duration-300 group-hover/feature:scale-105">
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2 lg:mb-3 group-hover/feature:scale-110 group-hover/feature:rotate-12 transition-all duration-300">⭐</div>
                    <p className="text-[10px] sm:text-xs text-fuchsia-200 uppercase tracking-wider mb-0.5 sm:mb-1 font-bold">Premium</p>
                    <p className="text-xs sm:text-sm lg:text-base font-black text-white">Content</p>
                  </div>
                </div>
                <div className="relative group/feature text-center">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl sm:rounded-2xl blur opacity-0 group-hover/feature:opacity-40 transition-all duration-300"></div>
                  <div className="relative p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-900/40 to-pink-900/20 border border-pink-500/30 backdrop-blur-sm hover:border-pink-400/60 hover:bg-pink-900/50 transition-all duration-300 group-hover/feature:scale-105">
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2 lg:mb-3 group-hover/feature:scale-110 group-hover/feature:rotate-12 transition-all duration-300">🏆</div>
                    <p className="text-[10px] sm:text-xs text-pink-200 uppercase tracking-wider mb-0.5 sm:mb-1 font-bold">Win Big</p>
                    <p className="text-xs sm:text-sm lg:text-base font-black text-white">Rewards</p>
                  </div>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-fuchsia-600/10 rounded-lg sm:rounded-xl blur-lg"></div>
                <div className="relative bg-gradient-to-br from-purple-900/20 to-fuchsia-900/20 border border-purple-500/30 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-xl sm:text-2xl lg:text-3xl flex-shrink-0">📝</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-purple-300 mb-1 sm:mb-2">How to Participate</h3>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        Answer all questions honestly to share your valuable feedback. Top participants with outstanding responses will receive exciting rewards. Enter your phone number to be eligible for prizes!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Premium Quiz Form Card - Enhanced */}
        <div className="relative group/quiz">
          {/* Multi-layer Glow Effects */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 rounded-3xl sm:rounded-4xl blur-3xl opacity-15 group-hover/quiz:opacity-25 transition-all duration-700"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl blur-xl opacity-20 group-hover/quiz:opacity-35 transition-all duration-500"></div>
          
          {/* Enhanced Form Container */}
          <div className="relative bg-gradient-to-br from-white/8 to-white/[0.03] backdrop-blur-3xl border border-white/15 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-3xl group-hover/quiz:shadow-4xl transition-all duration-500">
            <QuizSystem 
              contentId={contentId!} 
              contentTitle={content.title}
            />
          </div>
        </div>

        {/* Footer Badge */}
        <div className="mt-8 sm:mt-10 lg:mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-900/30 to-fuchsia-900/30 border border-purple-500/30 rounded-full backdrop-blur-sm">
            <span className="text-xs text-purple-300">✨</span>
            <p className="text-[10px] sm:text-xs text-gray-400">
              Powered by <span className="font-bold text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text">CLIMAX</span> Fan Fest
            </p>
            <span className="text-xs text-purple-300">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
