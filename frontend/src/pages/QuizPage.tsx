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
        <div className="text-center bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-8">
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
        <div className="text-center max-w-md px-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-8">
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
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 border border-white/20 backdrop-blur-sm"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Professional Gradient Background - Black to Violet */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-slate-950 to-violet-950"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-slate-900/30 to-transparent"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.08),transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.05),transparent_50%)]"></div>

      {/* Professional Glass Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 text-slate-300 hover:text-white transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative p-2 sm:p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20">
                  <ArrowLeft size={20} />
                </div>
              </div>
              <span className="font-semibold hidden sm:block">Back</span>
            </button>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-40"></div>
                <div className="relative px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  Premium Experience
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                Fan Fest
              </h1>
            </div>
            <div className="w-16 sm:w-20" />
          </div>
        </div>
      </div>

      {/* Premium Main Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section - Clean and Simple */}
        <div className="mb-8 sm:mb-12">
          <div className="relative group">
            {/* Card Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            
            <div className="relative bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8 lg:p-12">
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-center">
                {content.title}
              </h2>
              
              {/* Description */}
              {content.description && (
                <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed text-center mb-8">
                  {content.description}
                </p>
              )}

              {/* Image - Simple Display */}
              {content.thumbnail && (
                <div className="mb-8 sm:mb-12 flex justify-center">
                  <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-white/20 shadow-xl">
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

        {/* Quiz Container - Direct Below Image */}
        <div className="relative">
          <QuizSystem 
            contentId={contentId!} 
            contentTitle={content.title}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
