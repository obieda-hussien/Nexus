import React, { useState, useEffect } from 'react';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Activity,
  UserCheck,
  AlertCircle,
  Settings,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 12540,
    totalCourses: 48,
    monthlyRevenue: 125000,
    completionRate: 89,
    activeInstructors: 24,
    pendingApprovals: 8,
    totalRevenue: 2850000,
    averageRating: 4.8
  });

  const [recentActivities] = useState([
    { id: 1, type: 'user', message: 'Ahmed Mohamed joined the platform', time: '5 minutes', icon: Users },
    { id: 2, type: 'course', message: 'Created new course: Advanced Physics', time: '15 minute', icon: BookOpen },
    { id: 3, type: 'payment', message: 'Received payment of 500 EGP', time: '30 minutes', icon: DollarSign },
    { id: 4, type: 'instructor', message: 'New teaching request from Dr. Sarah Ahmed', time: '1 hour', icon: UserCheck },
    { id: 5, type: 'alert', message: 'System update required', time: '2 hours', icon: AlertCircle }
  ]);

  const [topCourses] = useState([
    { name: 'Basic Physics', students: 2340, revenue: 468000, rating: 4.9 },
    { name: 'Applied Mathematics', students: 1890, revenue: 471750, rating: 4.8 },
    { name: 'Advanced Physics', students: 1650, revenue: 493500, rating: 4.9 },
    { name: 'Calculus and Integration', students: 1420, revenue: 355000, rating: 4.7 }
  ]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        monthlyRevenue: prev.monthlyRevenue + Math.floor(Math.random() * 1000)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Welcome to Main Dashboard - Comprehensive management of the educational platform</p>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-blue-100 text-xs">+12% from last month</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                  <p className="text-green-100 text-xs">+3 new courses</p>
                </div>
                <BookOpen className="h-12 w-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Monthly Revenue</p>
                  <p className="text-3xl font-bold">{(stats.monthlyRevenue / 1000).toFixed(0)}K EGP</p>
                  <p className="text-purple-100 text-xs">+8% growth</p>
                </div>
                <DollarSign className="h-12 w-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold">{stats.completionRate}%</p>
                  <p className="text-orange-100 text-xs">Excellent performance</p>
                </div>
                <TrendingUp className="h-12 w-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Activities */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Recent Activities</h3>
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-gray-400 text-xs">{activity.time} ago</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                <Settings className="h-6 w-6 text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
                  <UserCheck className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Approve Instructors</span>
                  <span className="block text-xs text-blue-200">({stats.pendingApprovals} pending)</span>
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
                  <BookOpen className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Course Management</span>
                  <span className="block text-xs text-green-200">({stats.totalCourses} courses)</span>
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Financial Reports</span>
                  <span className="block text-xs text-purple-200">{(stats.totalRevenue / 1000000).toFixed(1)}M EGP</span>
                </button>
                <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors">
                  <Award className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">Manage Certificates</span>
                  <span className="block text-xs text-orange-200">Automated system</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Performing Courses */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Top Performing Courses</h3>
              <PieChart className="h-6 w-6 text-blue-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Course Name</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Students Count</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((course, index) => (
                    <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3 px-4 text-white font-medium">{course.name}</td>
                      <td className="py-3 px-4 text-gray-300">{course.students.toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-400 font-medium">{course.revenue.toLocaleString()} EGP</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-yellow-400 ml-1" />
                          <span className="text-yellow-400 font-medium">{course.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">System Status</h4>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-gray-400 text-sm">All systems running normally</p>
              <p className="text-green-400 text-xs mt-1">Uptime: 99.9%</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Active Instructors</h4>
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-blue-400">{stats.activeInstructors}</p>
              <p className="text-gray-400 text-xs">out of 32 instructors</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Intermediate Rating</h4>
                <Award className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">{stats.averageRating}</p>
              <p className="text-gray-400 text-xs">out of 5 stars</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;