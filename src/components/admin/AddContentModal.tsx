import React, { useState } from 'react';
import { X, Film } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import API from '../../services/api';

interface AddContentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddContentModal: React.FC<AddContentModalProps> = ({ onClose, onSuccess }) => {
  const { addContent, categories } = useContent();

  const initialFormState = {
    title: '',
    description: '',
    thumbnail: '',
    videoUrl: '',
    category: '',
    type: 'movie' as 'movie' | 'series' | 'show',
    duration: 0,
    climaxTimestamp: '',
    premiumPrice: 0,
    genre: [] as string[],
    rating: 0
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newGenre, setNewGenre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.thumbnail ||
      !formData.videoUrl ||
      !formData.category ||
      !formData.climaxTimestamp
    ) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        duration: Number(formData.duration),
        climaxTimestamp: Number(formData.climaxTimestamp),
        premiumPrice: Number(formData.premiumPrice),
        rating: Number(formData.rating),
      };

      const response = await API.post('/contents', payload);

      if (response.status === 201) {
        alert('✅ Content added successfully!');
        onSuccess();
        onClose();
        setFormData(initialFormState);
        setNewGenre('');
      }
    } catch (error) {
      console.error('❌ Add content failed:', error);
      alert('⚠️ Something went wrong. Check console for details.');
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
              <div className="bg-red-600 rounded-lg p-2">
                <Film className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Add New Content</h2>
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
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Type *</label>
              <select
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
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
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-white mb-1">Category *</label>
            <select
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              <option value="">Select a Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm text-white mb-1">Thumbnail URL *</label>
            <input
              type="url"
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              value={formData.thumbnail}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
              required
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm text-white mb-1">Video URL *</label>
            <input
              type="url"
              className="w-full bg-gray-800 text-white rounded px-3 py-2"
              value={formData.videoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              required
            />
          </div>

          {/* Duration / Climax / Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white mb-1">Duration (min) *</label>
              <input
                type="number"
                value={formData.duration ? formData.duration / 60 : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    duration: isNaN(val) ? 0 : val * 60
                  }));
                }}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Climax (min) *</label>
              <input
                type="number"
                value={formData.climaxTimestamp ? Number(formData.climaxTimestamp) / 60 : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    climaxTimestamp: isNaN(val) ? '' : (val * 60).toString()
                  }));
                }}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1">Premium Price (₹) *</label>
              <input
                type="number"
                value={formData.premiumPrice || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    premiumPrice: isNaN(val) ? 0 : val
                  }));
                }}
                className="w-full bg-gray-800 text-white rounded px-3 py-2"
                required
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
              value={formData.rating || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setFormData(prev => ({ ...prev, rating: isNaN(val) ? 0 : val }));
              }}
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
              <button type="button" onClick={handleAddGenre} className="bg-red-600 px-4 py-2 rounded text-white">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.genre.map((g) => (
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
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
            >
              {loading ? 'Adding...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
