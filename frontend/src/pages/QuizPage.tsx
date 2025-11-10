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
    <div className="min-h-screen bg-gray-50">
      {/* Clean Professional Background */}
      <div className="fixed inset-0 bg-gray-50"></div>

      {/* Professional Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <div className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                <ArrowLeft size={20} />
              </div>
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Premium Content
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Fan Fest
              </h1>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Card */}
        <div className="mb-8">
          {/* Clean Professional Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
              {/* Professional Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium mb-4">
                  <span>📊</span>
                  <span>Feedback Collection</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {content.title}
                </h2>
                {content.description && (
                  <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    {content.description}
                  </p>
                )}
              </div>

              {/* Thumbnail */}
              {content.thumbnail && (
                <div className="mb-6 flex justify-center">
                  <div className="w-full max-w-md">
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Features */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">🎬</div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Exclusive</p>
                  <p className="text-sm font-semibold text-gray-900">Content</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Feedback</p>
                  <p className="text-sm font-semibold text-gray-900">Collection</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Rewards</p>
                  <p className="text-sm font-semibold text-gray-900">Program</p>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">💡</span>
                  <div>
                    <h3 className="text-base font-semibold text-blue-900 mb-2">How to Participate</h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Answer all questions honestly to share your valuable feedback. Top participants with outstanding responses will receive exciting rewards. Enter your phone number to be eligible for prizes!
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Professional Form Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
          <QuizSystem 
            contentId={contentId!} 
            contentTitle={content.title}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-gray-700">CLIMAX</span> Fan Fest
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
