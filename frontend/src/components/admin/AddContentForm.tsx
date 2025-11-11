import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { X } from 'lucide-react';

interface AddContentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AddContentModal: React.FC<AddContentModalProps> = ({ onClose, onSuccess }) => {
  const { addContent } = useContent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [climaxTimestamp, setClimaxTimestamp] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('movie');
  const [duration, setDuration] = useState('');
  const [premiumPrice, setPremiumPrice] = useState('');
  const [genre, setGenre] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!thumbnail.trim()) {
      setError('Thumbnail URL is required');
      return;
    }
    if (!language) {
      setError('Language selection is required');
      return;
    }
    if (!category) {
      setError('Category is required');
      return;
    }
    if (!duration) {
      setError('Duration is required');
      return;
    }
    if (!premiumPrice) {
      setError('Premium price is required');
      return;
    }

    try {
      setLoading(true);
      const contentData = {
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnail.trim(),
        videoUrl: videoUrl.trim() || '',
        climaxTimestamp: climaxTimestamp ? parseInt(climaxTimestamp) : 0,
        language,
        category,
        type: type as 'movie' | 'series' | 'show',
        duration: parseInt(duration) || 0,
        premiumPrice: parseInt(premiumPrice) || 0,
        genre: genre.trim() ? genre.split(',').map(g => g.trim()).filter(g => g) : [],
        rating: 0,
        isActive: true
      };

      console.log('📝 AddContentForm: Submitting content data:', contentData);
      const result = await addContent(contentData);
      
      console.log('✅ AddContentForm: Content added, result:', result);
      setSuccess('✅ Content added successfully!');
      
      setTimeout(() => {
        console.log('📤 AddContentForm: Calling onSuccess and onClose');
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('❌ AddContentForm: Error adding content:', err);
      console.error('Error details:', {
        type: err?.constructor?.name,
        message: err?.message,
        status: err?.response?.status,
        responseData: err?.response?.data
      });
      
      const statusCode = err?.response?.status;
      const backendError = err?.response?.data?.error;
      const errorMsg = backendError || err.message || 'Failed to add content';
      
      // Build user-friendly error message
      if (statusCode === 400) {
        setError(`❌ Validation Error: ${errorMsg}`);
      } else if (statusCode === 401 || statusCode === 403) {
        setError('❌ Access Denied: You don\'t have permission to add content');
      } else if (statusCode === 500) {
        setError('❌ Server Error: Please try again later or contact support');
      } else if (err?.message?.includes('Network') || err?.message?.includes('timeout')) {
        setError('❌ Network Error: Cannot reach the server. Check your connection.');
      } else {
        setError(`❌ Error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative max-h-screen overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Content</h2>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              placeholder="Enter content title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              placeholder="Enter content description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL *</label>
            <input
              type="url"
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language *</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Language --</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
              <option value="Malayalam">Malayalam</option>
              <option value="Kannada">Kannada</option>
              <option value="Bengali">Bengali</option>
              <option value="Marathi">Marathi</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Punjabi">Punjabi</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Category --</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="movie">Movie</option>
              <option value="series">Series</option>
              <option value="show">Show</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
            <input
              type="number"
              placeholder="120"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>

          {/* Premium Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Premium Price (₹) *</label>
            <input
              type="number"
              placeholder="49"
              value={premiumPrice}
              onChange={(e) => setPremiumPrice(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>

          {/* Video URL (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
            <input
              type="url"
              placeholder="https://example.com/video.mp4 (leave empty for upcoming content)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Climax Timestamp (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Climax Timestamp (seconds, optional)</label>
            <input
              type="number"
              placeholder="120"
              value={climaxTimestamp}
              onChange={(e) => setClimaxTimestamp(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          {/* Genres (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genres (comma-separated, optional)</label>
            <input
              type="text"
              placeholder="Action, Thriller, Drama"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Adding...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContentModal;
