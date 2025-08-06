import React from 'react';
import { Users, Film, TrendingUp, DollarSign, Play, Star } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Total Content',
      value: '156',
      change: '+8%',
      icon: Film,
      color: 'text-green-400'
    },
    {
      title: 'Monthly Revenue',
      value: '₹47,250',
      change: '+23%',
      icon: DollarSign,
      color: 'text-yellow-400'
    },
    {
      title: 'Active Streams',
      value: '1,234',
      change: '+15%',
      icon: Play,
      color: 'text-red-400'
    }
  ];

  const recentActivity = [
    { user: 'John Doe', action: 'Purchased premium content', content: 'The Action Hero', time: '2 mins ago' },
    { user: 'Jane Smith', action: 'Started watching', content: 'Love Stories', time: '5 mins ago' },
    { user: 'Mike Johnson', action: 'Registered new account', content: null, time: '12 mins ago' },
    { user: 'Sarah Wilson', action: 'Purchased premium content', content: 'Future World', time: '18 mins ago' },
    { user: 'David Brown', action: 'Completed watching', content: 'The Action Hero', time: '25 mins ago' }
  ];

  const topContent = [
    { title: 'The Action Hero', views: 2847, revenue: '₹15,240', rating: 4.5 },
    { title: 'Love Stories', views: 2134, revenue: '₹8,920', rating: 4.2 },
    { title: 'Future World', views: 1892, revenue: '₹12,450', rating: 4.7 },
    { title: 'Mystery Night', views: 1654, revenue: '₹7,830', rating: 4.1 },
    { title: 'Comedy Central', views: 1432, revenue: '₹6,180', rating: 3.9 }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.color}`}>{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-800 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{activity.user}</p>
                  <p className="text-gray-400 text-sm">
                    {activity.action}
                    {activity.content && (
                      <span className="text-red-400"> "{activity.content}"</span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">Top Performing Content</h3>
          <div className="space-y-4">
            {topContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                    <h4 className="text-white font-medium">{content.title}</h4>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-gray-400 text-sm">{content.views.toLocaleString()} views</span>
                    <span className="text-green-400 text-sm">{content.revenue}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-400 text-sm">{content.rating}</span>
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Film className="w-6 h-6 text-red-400" />
            <span className="text-white font-medium">Add New Content</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-white font-medium">Manage Users</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <span className="text-white font-medium">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
