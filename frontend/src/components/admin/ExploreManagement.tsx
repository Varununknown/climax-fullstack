import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Upload } from 'lucide-react';
import API from '../../services/api';

interface ExploreItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  position: number;
  isActive: boolean;
  link?: string;
}

export const ExploreManagement: React.FC = () => {
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    position: 1,
    link: ''
  });

  useEffect(() => {
    loadExploreItems();
  }, []);

  const loadExploreItems = async () => {
    try {
      setLoading(true);
      const response = await API.get('/banners/category/explore');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading explore items:', error);
      setMessage({ type: 'error', text: 'Failed to load explore items' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      formDataObj.append('upload_preset', 'your_upload_preset'); // Replace with actual preset

      // If you have a backend upload endpoint
      const response = await API.post('/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.url) {
        setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Image upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      position: 1,
      link: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      setMessage({ type: 'error', text: 'Title and image are required' });
      return;
    }

    try {
      const itemData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        category: 'explore',
        position: formData.position,
        isActive: true,
        link: formData.link
      };

      if (editingId) {
        await API.put(`/banners/${editingId}`, itemData);
        setMessage({ type: 'success', text: 'Explore item updated successfully!' });
      } else {
        await API.post('/banners', itemData);
        setMessage({ type: 'success', text: 'Explore item created successfully!' });
      }

      await loadExploreItems();
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      setMessage({ type: 'error', text: 'Failed to save explore item' });
    }
  };

  const handleEdit = (item: ExploreItem) => {
    setFormData({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      position: item.position,
      link: item.link || ''
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this explore item?')) return;

    try {
      await API.delete(`/banners/${id}`);
      setMessage({ type: 'success', text: 'Explore item deleted successfully!' });
      await loadExploreItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ type: 'error', text: 'Failed to delete explore item' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔍 Manage Explore Section</h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} /> Add Explore Item
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSave} className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit Explore Item' : 'Add New Explore Item'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Action Movies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && <span className="text-blue-600">Uploading...</span>}
                </div>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img src={formData.imageUrl} alt="Preview" className="h-40 rounded-lg object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Update Item' : 'Create Item'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Items List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore Items ({items.length})</h3>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading explore items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No explore items yet. Create one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
                    {item.description && (
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    )}
                    <div className="mt-3 flex justify-between items-center">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">Position: {item.position}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
