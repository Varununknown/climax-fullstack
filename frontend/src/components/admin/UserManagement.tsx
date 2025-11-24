import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Edit, Trash2, Crown, User, AlertTriangle } from 'lucide-react';
import API from '../../services/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  subscription: 'free' | 'premium';
  joinDate: string;
  lastActive: string;
  totalSpent: number;
  contentWatched: number;
  status: 'active' | 'suspended';
}

export const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesSubscription = filterSubscription === 'all' || user.subscription === filterSubscription;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setDeleting(id);
        const response = await API.delete(`/auth/admin/users/${id}`);
        if (response.data.success) {
          setUsers(users.filter(user => user.id !== id));
          alert(response.data.message);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleDeleteAllUsers = async () => {
    // Extra confirmation for delete all
    const finalConfirm = window.confirm(
      'Are you ABSOLUTELY SURE? This will delete ALL users from the platform. This action CANNOT be undone.'
    );
    
    if (finalConfirm) {
      const lastConfirm = window.confirm(
        'Last chance! Type DELETE to confirm or Cancel to abort.'
      );
      
      if (lastConfirm) {
        try {
          setDeleting('all');
          const response = await API.delete('/auth/admin/users-all/delete-all', {
            headers: {
              'X-Confirm-Delete': 'DELETE_ALL_USERS_CONFIRMED'
            }
          });
          if (response.data.success) {
            setUsers([]);
            setShowDeleteAllConfirm(false);
            alert(`✅ ${response.data.deletedCount} users have been deleted!`);
          }
        } catch (error) {
          console.error('Error deleting all users:', error);
          alert('Error deleting users');
        } finally {
          setDeleting(null);
        }
      }
    }
  };

  const handleSuspendUser = (id: string) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      // Suspend user logic
      console.log('Suspend user:', id);
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    premiumUsers: users.filter(u => u.subscription === 'premium').length,
    totalRevenue: users.reduce((sum, user) => sum + user.totalSpent, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage platform users and subscriptions</p>
        </div>
        <button
          onClick={() => setShowDeleteAllConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          Delete All Users
        </button>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-500 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-white">Delete All Users</h3>
            </div>
            <p className="text-gray-300 mb-4">
              This action will permanently delete ALL users from the platform. This cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllUsers}
                disabled={deleting === 'all'}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white rounded-lg font-semibold transition-colors"
              >
                {deleting === 'all' ? 'Deleting...' : 'Confirm Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-600/20">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-600/20">
              <User className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Premium Users</p>
              <p className="text-2xl font-bold text-white">{stats.premiumUsers}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-600/20">
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white">₹{stats.totalRevenue}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-600/20">
              <Crown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Subscription Filter */}
          <div>
            <select
              value={filterSubscription}
              onChange={(e) => setFilterSubscription(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Subscriptions</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Subscription</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Join Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Last Active</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Total Spent</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Content Watched</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-600 rounded-full p-2">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.subscription === 'premium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                          {user.subscription}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-medium">₹{user.totalSpent}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {user.contentWatched}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-gray-400 hover:text-yellow-400 transition-colors"
                            title="Suspend"
                          >
                            <User className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleting === user.id}
                            className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No users found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
