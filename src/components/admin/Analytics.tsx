import React from 'react';
import { TrendingUp, Users, Play, DollarSign, Eye, Clock, Star, Download } from 'lucide-react';

export const Analytics: React.FC = () => {
  const analyticsData = {
    overview: {
      totalViews: 125480,
      totalRevenue: 89750,
      activeUsers: 2847,
      avgWatchTime: 42
    },
    topContent: [
      { title: 'The Action Hero', views: 15420, revenue: 18240, completion: 87 },
      { title: 'Love Stories', views: 12580, revenue: 8920, completion: 92 },
      { title: 'Future World', views: 11240, revenue: 15680, completion: 78 },
      { title: 'Mystery Night', views: 9870, revenue: 7830, completion: 85 },
      { title: 'Comedy Central', views: 8950, revenue: 6180, completion: 89 }
    ],
    monthlyData: [
      { month: 'Jan', views: 8500, revenue: 12400 },
      { month: 'Feb', views: 9200, revenue: 13800 },
      { month: 'Mar', views: 11200, revenue: 16200 },
      { month: 'Apr', views: 10800, revenue: 15600 },
      { month: 'May', views: 12800, revenue: 18400 },
      { month: 'Jun', views: 14200, revenue: 20800 }
    ],
    deviceStats: [
      { device: 'Mobile', percentage: 45, color: 'bg-blue-500' },
      { device: 'Desktop', percentage: 35, color: 'bg-green-500' },
      { device: 'Tablet', percentage: 15, color: 'bg-yellow-500' },
      { device: 'Smart TV', percentage: 5, color: 'bg-purple-500' }
    ],
    paymentStats: {
      totalTransactions: 1847,
      successRate: 94.2,
      avgAmount: 8.5,
      totalPayouts: 15680
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400">Comprehensive platform insights and performance metrics</p>
        </div>
        <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Views</p>
              <p className="text-3xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</p>
              <p className="text-blue-200 text-sm mt-1">+15% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/30">
              <Eye className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">₹{analyticsData.overview.totalRevenue.toLocaleString()}</p>
              <p className="text-green-200 text-sm mt-1">+23% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/30">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold">{analyticsData.overview.activeUsers.toLocaleString()}</p>
              <p className="text-purple-200 text-sm mt-1">+8% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/30">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Watch Time</p>
              <p className="text-3xl font-bold">{analyticsData.overview.avgWatchTime}min</p>
              <p className="text-orange-200 text-sm mt-1">+12% from last month</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/30">
              <Clock className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Content */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">Top Performing Content</h3>
          <div className="space-y-4">
            {analyticsData.topContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-full text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{content.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-gray-400 text-sm flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        {content.views.toLocaleString()} views
                      </span>
                      <span className="text-green-400 text-sm">
                        ₹{content.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{content.completion}%</div>
                  <div className="text-gray-400 text-sm">completion</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">Monthly Performance</h3>
          <div className="space-y-4">
            {analyticsData.monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-gray-400 text-sm font-medium">{month.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-white">{month.views.toLocaleString()} views</div>
                      <div className="text-green-400">₹{month.revenue.toLocaleString()}</div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(month.views / 15000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Usage */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">Device Usage</h3>
          <div className="space-y-4">
            {analyticsData.deviceStats.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${device.color}`}></div>
                  <span className="text-white font-medium">{device.device}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${device.color}`}
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-sm w-10 text-right">{device.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Analytics */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6">Payment Analytics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {analyticsData.paymentStats.totalTransactions.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Transactions</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {analyticsData.paymentStats.successRate}%
              </div>
              <div className="text-gray-400 text-sm">Success Rate</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                ₹{analyticsData.paymentStats.avgAmount}
              </div>
              <div className="text-gray-400 text-sm">Avg Amount</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">
                ₹{analyticsData.paymentStats.totalPayouts.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Payouts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { user: 'John Doe', action: 'Purchased premium content', content: 'The Action Hero', time: '2 mins ago', amount: '₹10' },
            { user: 'Jane Smith', action: 'Started watching', content: 'Love Stories', time: '5 mins ago', amount: null },
            { user: 'Mike Johnson', action: 'Completed payment', content: 'Future World', time: '12 mins ago', amount: '₹8' },
            { user: 'Sarah Wilson', action: 'Purchased premium content', content: 'Mystery Night', time: '18 mins ago', amount: '₹12' },
            { user: 'David Brown', action: 'Completed watching', content: 'Comedy Central', time: '25 mins ago', amount: null }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-white font-medium">{activity.user}</p>
                  <p className="text-gray-400 text-sm">
                    {activity.action} "{activity.content}"
                  </p>
                </div>
              </div>
              <div className="text-right">
                {activity.amount && (
                  <div className="text-green-400 font-medium">{activity.amount}</div>
                )}
                <div className="text-gray-500 text-xs">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
