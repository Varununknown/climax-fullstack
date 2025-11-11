import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  language: string;
  category: string;
  type: string;
  duration: number;
  videoUrl: string;
  thumbnail: string;
  genre: string;
  climaxTimestamp: number;
  rating: number;
  premiumPrice: number;
}

interface QuickAddContentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi'
];

const QuickAddContent: React.FC<QuickAddContentProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    language: 'English',
    category: 'Drama',
    type: 'movie',
    duration: 120,
    videoUrl: '',
    thumbnail: '',
    genre: '',
    climaxTimestamp: 0,
    rating: 8.0,
    premiumPrice: 0
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.videoUrl.trim()) newErrors.videoUrl = 'Video URL is required';
    if (!formData.language) newErrors.language = 'Language is required';
    if (formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0';
    if (formData.rating < 0 || formData.rating > 10) newErrors.rating = 'Rating must be between 0 and 10';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      console.log('📤 Submitting new content:', formData);

      const response = await fetch('https://climax-fullstack.onrender.com/api/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      console.log('📦 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      setMessage({
        type: 'success',
        text: `✅ Content "${formData.title}" added successfully!`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        language: 'English',
        category: 'Drama',
        type: 'movie',
        duration: 120,
        videoUrl: '',
        thumbnail: '',
        genre: '',
        climaxTimestamp: 0,
        rating: 8.0,
        premiumPrice: 0
      });

      // Close modal after success
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('❌ Add content error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add content';
      setMessage({
        type: 'error',
        text: `❌ Error: ${errorMessage}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-orange-500" />
            Quick Add Content
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mx-6 mt-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-900/30 border border-green-700 text-green-200'
                : 'bg-red-900/30 border border-red-700 text-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter content title"
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language *
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors ${
                  errors.language ? 'border-red-500' : 'border-gray-700'
                }`}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              {errors.language && <p className="text-red-400 text-xs mt-1">{errors.language}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Drama, Action"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="movie">Movie</option>
                <option value="episode">Episode</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                placeholder="120"
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors ${
                  errors.duration ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rating (0-10)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                placeholder="8.0"
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors ${
                  errors.rating ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter content description"
              rows={3}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://example.com/video.mp4"
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors ${
                errors.videoUrl ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.videoUrl && <p className="text-red-400 text-xs mt-1">{errors.videoUrl}</p>}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genre
            </label>
            <input
              type="text"
                value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="e.g., Thriller, Romance"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Climax Timestamp */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Climax Timestamp (seconds)
              </label>
              <input
                type="number"
                value={formData.climaxTimestamp}
                onChange={(e) => setFormData({ ...formData, climaxTimestamp: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Premium Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Premium Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.premiumPrice}
                onChange={(e) => setFormData({ ...formData, premiumPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Add Content
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddContent;
