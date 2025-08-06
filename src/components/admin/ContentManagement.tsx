import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { AddContentModal } from './AddContentModal';
import { EditContentModal } from './EditContentModal';
import API from '../../services/api'; // 👈 Needed for fetchAllContents

export const ContentManagement: React.FC = () => {
  const { contents, setContents, deleteContent, updateContent } = useContent(); // 👈 use setContents
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContent, setEditingContent] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // ✅ New: fetchAllContents that updates context
  const fetchAllContents = async () => {
    try {
      const res = await API.get('/contents');
      setContents(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch contents:', err);
    }
  };

  useEffect(() => {
    fetchAllContents();
  }, []);

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || content.type === filterType;
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const toggleContentStatus = (id: string, isActive: boolean) => {
    updateContent(id, { isActive: !isActive });
  };

  const handleDeleteContent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      deleteContent(id);
    }
  };

  const categories = [...new Set(contents.map(c => c.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Management</h2>
          <p className="text-gray-400">Manage movies, series, and shows</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Content</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="series">Series</option>
              <option value="show">Shows</option>
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Content</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredContents.map((content) => (
                <tr key={content._id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div>
                        <h3 className="text-white font-medium">{content.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2 max-w-xs">
                          {content.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {content.genre?.slice(0, 2).map(genre => (
                            <span
                              key={genre}
                              className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-300">{content.type}</td>
                  <td className="px-6 py-4 text-gray-300">{content.category}</td>
                  <td className="px-6 py-4 text-red-400 font-medium">₹{content.premiumPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      content.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {content.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleContentStatus(content._id, content.isActive)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title={content.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {content.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => setEditingContent(content)}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content._id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredContents.length === 0 && (
          <div className="text-center py-12 text-gray-400">No content found matching your criteria.</div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddContentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAllContents(); // refresh list
          }}
        />
      )}

      {/* Edit Modal */}
      {editingContent && (
        <EditContentModal
          content={editingContent}
          onClose={() => setEditingContent(null)}
          onSuccess={() => {
            setEditingContent(null);
            fetchAllContents(); // refresh list
          }}
        />
      )}
    </div>
  );
};
