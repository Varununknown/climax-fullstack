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

    try {
      setLoading(true);

      // Debug: Check what ID we're using
      console.log('Content object:', content);
      console.log('Available ID fields:');
      console.log('- content._id:', content._id);
      console.log('- content.id:', content.id);
      console.log('- content.createdAt:', content.createdAt);
      
      // Try multiple ID field possibilities
      const contentId = content._id || content.id;
      
      if (!contentId) {
        console.error('❌ No valid content ID found!');
        alert('❌ Cannot update: Content ID is missing');
        return;
      }
      
      console.log('Using ID for update:', contentId);

      const payload = {
        ...formData,
        duration: Number(formData.duration),
        climaxTimestamp: Number(formData.climaxTimestamp),
      };
      
      console.log('Payload being sent:', payload);

      // Use context updateContent instead of direct API call
      try {
        await updateContent(contentId, payload);
        alert('✅ Content updated successfully!');
        onSuccess();
        onClose();
      } catch (error: any) {
        console.error('❌ Update failed in EditContentModal:', error);
        if (error.response?.status === 404) {
          const contentId = content._id || content.id;
          alert(`❌ Content not found on server!\n\nThis content (ID: ${contentId}) exists locally but not on the production database.\n\nPossible solutions:\n1. Start local backend server\n2. Add this content to production database\n3. Use content that exists on production`);
        } else {
          alert(`⚠️ Update failed: ${error.response?.status} ${error.response?.statusText}\nCheck console for details.`);
        }
      }
    } catch (error: any) {
      console.error('❌ Update content failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        const contentId = content._id || content.id;
        alert(`❌ Content not found on server!\n\nThis content (ID: ${contentId}) exists locally but not on the production database.\n\nPossible solutions:\n1. Start local backend server\n2. Add this content to production database\n3. Use content that exists on production`);
      } else {
        alert(`⚠️ Update failed: ${error.response?.status} ${error.response?.statusText}\nCheck console for details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = () => {
    const trimmed = newGenre.trim();
    if (trimmed && !formData.genre.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        genre: [...prev.genre, trimmed]
      }));
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.filter(g => g !== genreToRemove)
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
          {/* Title + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
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
                  setFormData(prev => ({ ...prev, duration: isNaN(val) ? 0 : val * 60 }));
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
                  setFormData(prev => ({ ...prev, climaxTimestamp: isNaN(val) ? '' : (val * 60).toString() }));
                }}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Premium Price (₹)</label>
              <input
                type="number"
                value={formData.premiumPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, premiumPrice: parseInt(e.target.value) }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
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
              {formData.genre?.map((g) => (
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
