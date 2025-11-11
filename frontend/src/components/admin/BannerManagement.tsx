import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';
import API from '../../services/api';

interface Banner {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  position: number;
  isActive: boolean;
  link?: string;
}

export const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'explore',
    position: 1,
    link: ''
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await API.get('/banners');
      setBanners(response.data || []);
    } catch (error) {
      console.error('❌ Error loading banners:', error);
      setMessage({ type: 'error', text: 'Failed to load banners' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      category: 'explore',
      position: 1,
      link: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }
    if (!formData.imageUrl.trim()) {
      setMessage({ type: 'error', text: 'Image URL is required' });
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update
        await API.put(`/banners/${editingId}`, formData);
        setMessage({ type: 'success', text: '✅ Banner updated successfully' });
      } else {
        // Create
        await API.post('/banners', formData);
        setMessage({ type: 'success', text: '✅ Banner created successfully' });
      }

      resetForm();
      setShowForm(false);
      await loadBanners();
    } catch (error) {
      console.error('❌ Error saving banner:', error);
      setMessage({ type: 'error', text: 'Failed to save banner' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      category: banner.category,
      position: banner.position,
      link: banner.link || ''
    });
    setEditingId(banner._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      setLoading(true);
      await API.delete(`/banners/${id}`);
      setMessage({ type: 'success', text: '✅ Banner deleted successfully' });
      await loadBanners();
    } catch (error) {
      console.error('❌ Error deleting banner:', error);
      setMessage({ type: 'error', text: 'Failed to delete banner' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">🖼️ Banner Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-700 text-green-200'
              : 'bg-red-900/30 border border-red-700 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">
            {editingId ? 'Edit Banner' : 'Add New Banner'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Banner title"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="explore">Explore</option>
                  <option value="ads">Ads</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image URL *</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Link (Optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners List */}
      <div className="grid grid-cols-1 gap-4">
        {loading && !banners.length ? (
          <p className="text-gray-400">Loading banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-gray-400">No banners yet. Create one to get started!</p>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex gap-4">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{banner.title}</h3>
                {banner.description && (
                  <p className="text-gray-400 text-sm mt-1">{banner.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Category: {banner.category}</span>
                  <span>Position: {banner.position}</span>
                  <span>Status: {banner.isActive ? '🟢 Active' : '🔴 Inactive'}</span>
                </div>
              </div>

              <div className="flex gap-2 self-center">
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
