import React, { useState } from 'react';
import { Users, Search, Filter, Edit, Trash2, Crown, User } from 'lucide-react';

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

  // Mock user data
  const [users] = useState<UserData[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      subscription: 'premium',
      joinDate: '2024-01-15',
      lastActive: '2024-01-20',
      totalSpent: 250,
      contentWatched: 45,
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      subscription: 'free',
      joinDate: '2024-01-18',
      lastActive: '2024-01-19',
      totalSpent: 30,
      contentWatched: 12,
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      subscription: 'premium',
      joinDate: '2024-01-10',
      lastActive: '2024-01-20',
      totalSpent: 180,
      contentWatched: 38,
      status: 'active'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      subscription: 'free',
      joinDate: '2024-01-12',
      lastActive: '2024-01-17',
      totalSpent: 15,
      contentWatched: 8,
      status: 'suspended'
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david@example.com',
      subscription: 'premium',
      joinDate: '2024-01-05',
      lastActive: '2024-01-20',
      totalSpent: 320,
      contentWatched: 67,
      status: 'active'
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesSubscription = filterSubscription === 'all' || user.subscription === filterSubscription;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Delete user logic
      console.log('Delete user:', id);
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
      </div>

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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
