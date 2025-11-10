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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Fan Fest
          </h2>
          <p className="text-gray-600">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
              <span className="text-3xl">❌</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h2>
          <p className="text-gray-600 mb-8">The requested Fan Fest content could not be located.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      {/* Premium Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-lg shadow-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative p-2 sm:p-3 rounded-lg bg-slate-100/80 group-hover:bg-slate-200/80 transition-all duration-300 backdrop-blur-sm">
                  <ArrowLeft size={20} />
                </div>
              </div>
              <span className="font-semibold hidden sm:block">Back</span>
            </button>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-30"></div>
                <div className="relative px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  Premium Experience
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
                Fan Fest
              </h1>
            </div>
            <div className="w-16 sm:w-20" />
          </div>
        </div>
      </div>

      {/* Premium Main Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Premium Hero Section */}
        <div className="mb-8 sm:mb-12">
          <div className="relative group">
            {/* Premium Card Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            
            <div className="relative bg-white/80 border border-slate-200/60 rounded-2xl shadow-2xl backdrop-blur-sm p-6 sm:p-8 lg:p-12">
              {/* Premium Header */}
              <div className="text-center mb-8 sm:mb-12">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-30"></div>
                  <div className="relative inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm sm:text-base font-bold shadow-xl">
                    <span>📊</span>
                    <span>Premium Feedback Collection</span>
                  </div>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-6">
                  {content.title}
                </h2>
                
                {content.description && (
                  <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    {content.description}
                  </p>
                )}
              </div>

              {/* Premium Thumbnail */}
              {content.thumbnail && (
                <div className="mb-8 sm:mb-12 flex justify-center">
                  <div className="relative group/image">
                    <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl blur opacity-50 group-hover/image:opacity-75 transition-opacity duration-300"></div>
                    <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200/60 shadow-xl">
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-full h-auto object-cover group-hover/image:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="relative group/feature">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="relative text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-3xl sm:text-4xl mb-3">🎬</div>
                    <p className="text-xs sm:text-sm text-purple-600 uppercase tracking-wider font-bold mb-1">Exclusive</p>
                    <p className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700">Premium Content</p>
                  </div>
                </div>
                
                <div className="relative group/feature">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="relative text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-3xl sm:text-4xl mb-3">📊</div>
                    <p className="text-xs sm:text-sm text-blue-600 uppercase tracking-wider font-bold mb-1">Advanced</p>
                    <p className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">Analytics</p>
                  </div>
                </div>
                
                <div className="relative group/feature">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="relative text-center p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-3xl sm:text-4xl mb-3">🏆</div>
                    <p className="text-xs sm:text-sm text-emerald-600 uppercase tracking-wider font-bold mb-1">Exclusive</p>
                    <p className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700">Rewards</p>
                  </div>
                </div>
              </div>

              {/* Premium Instructions */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 via-orange-200 to-red-200 rounded-xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-200/60 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl text-white">💡</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700 mb-3">
                        Premium Participation Guidelines
                      </h3>
                      <p className="text-sm sm:text-base text-amber-700 leading-relaxed">
                        Provide authentic, detailed feedback to maximize your impact on our premium content ecosystem. 
                        Outstanding participants will be selected for exclusive rewards and early access to new features. 
                        Include your contact information to join our VIP community!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Quiz Container */}
        <div className="relative">
          <QuizSystem 
            contentId={contentId!} 
            contentTitle={content.title}
          />
        </div>

        {/* Premium Footer */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg blur opacity-30"></div>
            <div className="relative px-6 py-3 bg-white/80 border border-slate-200/60 rounded-lg backdrop-blur-sm">
              <p className="text-sm sm:text-base text-slate-500">
                Powered by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-600">CLIMAX</span> Premium Experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
