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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Content not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold">FAN FEST: {content.title}</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Content Info */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
          <p className="text-gray-400 mb-4">{content.description}</p>
          {content.thumbnail && (
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full max-w-md h-auto rounded-lg mb-6 mx-auto shadow-lg"
            />
          )}
        </div>

        {/* Quiz System */}
        <QuizSystem 
          contentId={contentId!} 
          contentTitle={content.title}
        />
      </div>
    </div>
  );
};

export default QuizPage;
