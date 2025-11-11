import React, { useState, useEffect } from 'react';
import { X, Pencil } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

interface EditContentModalProps {
  content: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditContentModal: React.FC<EditContentModalProps> = ({ content, onClose, onSuccess }) => {
  const { categories, updateContent } = useContent();

  const [formData, setFormData] = useState({
    ...content,
    climaxTimestamp: content.climaxTimestamp?.toString() || '',
    duration: content.duration || 0,
    language: content.language || '', // Ensure language field is initialized
  });

  const [newGenre, setNewGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form data when content changes
  useEffect(() => {
    setFormData({
      ...content,
      climaxTimestamp: content.climaxTimestamp?.toString() || '',
      duration: content.duration || 0,
      language: content.language || '',
    });
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.language) {
      setError('Language selection is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }

    try {
      setLoading(true);

      // Extract ID safely - ensure it's a clean string (not object-like)
      let contentId = content._id || content.id;
      
      // Debug: Show content object structure
      console.log('📦 Content object keys:', Object.keys(content));
      console.log('📦 Content object:', content);
      console.log('Raw _id value:', content._id, 'Type:', typeof content._id);
      console.log('Raw id value:', content.id, 'Type:', typeof content.id);
      
      // Ensure we have a string ID and remove any unwanted properties/indices
      if (typeof contentId === 'object') {
        console.warn('⚠️ Content ID is an object, attempting to extract string value');
        contentId = String(contentId).split(':')[0]; // Take only the main ID part
      }
      
      contentId = String(contentId).trim();
      
      // Double-check - remove any :number patterns
      if (contentId.includes(':')) {
        console.warn('⚠️ Found colon in ID, cleaning it up');
        contentId = contentId.split(':')[0];
      }
      
      if (!contentId || contentId === '') {
        console.error('❌ No valid content ID found!', { content, contentId });
        setError('❌ Cannot update: Content ID is missing or invalid');
        return;
      }
      
      console.log('🔍 Extracted ID for update:', contentId);
      console.log('🔍 ID length:', contentId.length);
      console.log('🔍 ID matches MongoDB format:', /^[0-9a-f]{24}$/i.test(contentId));

      const payload = {
        ...formData,
        duration: Number(formData.duration),
        climaxTimestamp: Number(formData.climaxTimestamp),
      };
      
      console.log('Payload being sent:', payload);

      // Use context updateContent instead of direct API call
      try {
        await updateContent(contentId, payload);
        setSuccess('✅ Content updated successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } catch (error: any) {
        console.error('❌ Update failed in EditContentModal:', error);
        
        // Extract error details safely
        const status = error?.response?.status;
        const statusText = error?.response?.statusText;
        const errorMsg = error?.message || 'Unknown error';
        const backendError = error?.response?.data?.error;
        
        console.error('Detailed error info:', { 
          status, 
          statusText, 
          errorMsg, 
          backendError,
          hasResponse: !!error?.response
        });
        
        // Build user-friendly error message
        if (status === 404) {
          setError(`❌ Content not found on server (ID: ${contentId})\n\nThis may mean:\n1. The content was deleted\n2. The backend database is different\n3. Connection issue\n\nTry refreshing the page.`);
        } else if (status === 401 || status === 403) {
          setError(`❌ Access Denied\n\nYou don't have permission to update this content.`);
        } else if (status === 400) {
          setError(`⚠️ Validation Error\n\n${backendError || errorMsg}`);
        } else if (status >= 500) {
          setError(`⚠️ Server Error (${status})\n\nThe server encountered an error. Please try again later.`);
        } else if (errorMsg.includes('Network') || errorMsg.includes('timeout')) {
          setError(`⚠️ Network Error\n\nCannot reach the server.`);
        } else {
          setError(`⚠️ Update Failed\n\n${backendError || errorMsg}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Update content failed (outer catch):', error);
      
      const status = error?.response?.status;
      const statusText = error?.response?.statusText;
      const errorMsg = error?.message || 'Unknown error';
      const backendError = error?.response?.data?.error;
      
      console.error('Outer catch - Error details:', {
        message: errorMsg,
        status: status,
        statusText: statusText,
        data: backendError,
        hasResponse: !!error?.response
      });
      
      // Build user-friendly error message
      if (status === 404) {
        const contentId = content._id || content.id;
        setError(`❌ Content not found on server!\n\nThis content (ID: ${contentId}) exists locally but not on the production database.\n\nPossible solutions:\n1. Start local backend server\n2. Add this content to production database\n3. Use content that exists on production`);
      } else if (status === 401 || status === 403) {
        setError(`❌ Access Denied\n\nYou don't have permission to update this content. Please check your authentication and try again.`);
      } else if (status >= 400 && status < 500) {
        setError(`⚠️ Client Error (${status})\n\n${backendError || errorMsg}\n\nCheck console for details.`);
      } else if (status >= 500) {
        setError(`⚠️ Server Error (${status})\n\nThe server encountered an error. Please try again later.`);
      } else if (errorMsg.includes('Network') || errorMsg.includes('timeout')) {
        setError(`⚠️ Network Error\n\nCannot reach the server. Please check:\n1. Internet connection\n2. Backend server is running\n3. Backend URL is correct`);
      } else {
        setError(`⚠️ Update Failed\n\n${backendError || errorMsg}\n\nCheck console for more details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = () => {
    const trimmed = newGenre.trim();
    if (trimmed && !formData.genre.includes(trimmed)) {
      setFormData((prev: any) => ({
        ...prev,
        genre: [...prev.genre, trimmed]
      }));
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      genre: prev.genre.filter((g: string) => g !== genreToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Pencil className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Edit Content</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded whitespace-pre-wrap text-sm">
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Title + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, type: e.target.value as any }))}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
                required
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="show">Show</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-white mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              rows={3}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-white mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm text-white mb-1">Language *</label>
            <select
              value={formData.language || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, language: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              required
            >
              <option value="">Select Language</option>
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

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm text-white mb-1">Thumbnail URL *</label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, thumbnail: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              required
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm text-white mb-1">Video URL (Optional)</label>
            <input
              type="url"
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, videoUrl: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              placeholder="Leave empty for upcoming content"
            />
          </div>

          {/* Duration / Climax / Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white mb-1">Duration (min)</label>
              <input
                type="number"
                value={formData.duration ? formData.duration / 60 : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData((prev: any) => ({ ...prev, duration: isNaN(val) ? 0 : val * 60 }));
                }}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Climax (min)</label>
              <input
                type="number"
                value={formData.climaxTimestamp ? parseInt(formData.climaxTimestamp) / 60 : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData((prev: any) => ({ ...prev, climaxTimestamp: isNaN(val) ? '' : (val * 60).toString() }));
                }}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Premium Price (₹)</label>
              <input
                type="number"
                value={formData.premiumPrice}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, premiumPrice: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm text-white mb-1">Rating (0–5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, rating: parseFloat(e.target.value) }))}
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
            />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm text-white mb-1">Genres</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGenre())}
                className="flex-1 bg-gray-800 text-white rounded px-3 py-2"
              />
              <button type="button" onClick={handleAddGenre} className="bg-blue-600 px-4 py-2 rounded text-white">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.genre?.map((g: string) => (
                <span key={g} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  {g}
                  <button onClick={() => handleRemoveGenre(g)} className="ml-2 text-red-400 hover:text-red-200">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
