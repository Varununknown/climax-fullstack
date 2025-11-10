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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400/20 border-t-purple-400 mx-auto"></div>
          </div>
          <p className="text-lg text-purple-300">Loading Fan Fest...</p>
          <p className="text-sm text-gray-400 mt-2">Get ready for the challenge! 🎬</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">❌ Content not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/70 backdrop-blur-lg border-b border-purple-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            🎬 FAN FEST
          </h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          {/* Premium Card Container */}
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl hover:border-purple-400/60 transition-all duration-300">
            {/* Title Section */}
            <div className="text-center mb-8">
              <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/30 rounded-full">
                <span className="text-sm font-semibold text-purple-300">Premium Content Challenge</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                {content.title}
              </h2>
              {content.description && (
                <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {content.description}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            {content.thumbnail && (
              <div className="mb-8 flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="relative w-full max-w-md h-auto rounded-xl shadow-2xl object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-t border-b border-purple-500/20">
              <div className="text-center px-2">
                <div className="text-2xl mb-1">🎬</div>
                <p className="text-xs text-gray-400">Fan Fest</p>
                <p className="text-sm font-semibold text-purple-300">Challenge</p>
              </div>
              <div className="text-center px-2">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-xs text-gray-400">Premium</p>
                <p className="text-sm font-semibold text-pink-300">Content</p>
              </div>
              <div className="text-center px-2">
                <div className="text-2xl mb-1">🏆</div>
                <p className="text-xs text-gray-400">Win</p>
                <p className="text-sm font-semibold text-yellow-300">Rewards</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-300">
                <span className="text-purple-400 font-semibold">📝 Instructions:</span> Answer all questions honestly. Your responses will help us understand your preferences better. Top participants will win exciting rewards!
              </p>
            </div>
          </div>
        </div>

        {/* Quiz System Card */}
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
          <QuizSystem 
            contentId={contentId!} 
            contentTitle={content.title}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            ✨ Thank you for participating in Fan Fest! Your feedback helps us create better content. ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
