import React, { useState, useEffect } from 'react';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Video,
  MessageSquare,
  Calendar,
  FileText,
  Award,
  Clock,
  Eye,
  Plus,
  Edit3,
  BarChart3
} from 'lucide-react';

const InstructorDashboard = () => {
  const [instructorStats, setInstructorStats] = useState({
    totalCourses: 12,
    totalStudents: 3240,
    monthlyEarnings: 45000,
    averageRating: 4.8,
    totalEarnings: 285000,
    completedLessons: 156,
    pendingReviews: 8,
    liveSessionsThisWeek: 5
  });

  const [myCourses] = useState([
    { 
      id: 1, 
      title: 'الفيزياء الأساسية', 
      students: 890, 
      rating: 4.9, 
      revenue: 178000,
      progress: 95,
      status: 'published',
      lastUpdate: '2024-12-20'
    },
    { 
      id: 2, 
      title: 'الفيزياء النووية المتقدمة', 
      students: 456, 
      rating: 4.8, 
      revenue: 91200,
      progress: 100,
      status: 'published',
      lastUpdate: '2024-12-18'
    },
    { 
      id: 3, 
      title: 'نظرية النسبية', 
      students: 234, 
      rating: 4.9, 
      revenue: 46800,
      progress: 80,
      status: 'draft',
      lastUpdate: '2024-12-25'
    }
  ]);

  const [recentActivities] = useState([
    { id: 1, type: 'review', message: 'تقييم جديد 5 نجوم على كورس الفيزياء الأساسية', time: '10 دقائق', icon: Star },
    { id: 2, type: 'enrollment', message: '15 طالب جديد انضموا لكورس النسبية', time: '30 دقيقة', icon: Users },
    { id: 3, type: 'payment', message: 'تم استلام 5000 ج.م من مبيعات الكورسات', time: '1 ساعة', icon: DollarSign },
    { id: 4, type: 'question', message: 'سؤال جديد في كورس الفيزياء النووية', time: '2 ساعة', icon: MessageSquare },
    { id: 5, type: 'session', message: 'جلسة مباشرة مجدولة غداً الساعة 8 مساءً', time: '3 ساعات', icon: Video }
  ]);

  const [upcomingEvents] = useState([
    {
      id: 1,
      title: 'محاضرة مباشرة: ميكانيكا الكم',
      type: 'live_session',
      date: '2024-12-29',
      time: '20:00',
      duration: '2 ساعة',
      attendees: 156
    },
    {
      id: 2,
      title: 'ورشة عمل: حل المسائل المعقدة',
      type: 'workshop',
      date: '2024-12-30',
      time: '18:00',
      duration: '3 ساعات',
      attendees: 89
    },
    {
      id: 3,
      title: 'مراجعة الامتحان النهائي',
      type: 'review',
      date: '2025-01-02',
      time: '19:00',
      duration: '1.5 ساعة',
      attendees: 234
    }
  ]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setInstructorStats(prev => ({
        ...prev,
        totalStudents: prev.totalStudents + Math.floor(Math.random() * 2),
        monthlyEarnings: prev.monthlyEarnings + Math.floor(Math.random() * 500)
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">لوحة تحكم المدرس</h1>
            <p className="text-gray-300">مرحباً د. أحمد محمد - إدارة كورساتك ومتابعة أداء طلابك</p>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي الكورسات</p>
                  <p className="text-3xl font-bold">{instructorStats.totalCourses}</p>
                  <p className="text-blue-100 text-xs">+2 هذا الشهر</p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">إجمالي الطلاب</p>
                  <p className="text-3xl font-bold">{instructorStats.totalStudents.toLocaleString()}</p>
                  <p className="text-green-100 text-xs">+15% نمو</p>
                </div>
                <Users className="h-12 w-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">الأرباح الشهرية</p>
                  <p className="text-3xl font-bold">{(instructorStats.monthlyEarnings / 1000).toFixed(0)}K ج.م</p>
                  <p className="text-purple-100 text-xs">+12% من الماضي</p>
                </div>
                <DollarSign className="h-12 w-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">متوسط التقييم</p>
                  <p className="text-3xl font-bold">{instructorStats.averageRating}</p>
                  <p className="text-yellow-100 text-xs">من 5 نجوم</p>
                </div>
                <Star className="h-12 w-12 text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Course Management & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* My Courses */}
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">كورساتي</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                  <Plus className="h-4 w-4 ml-2" />
                  كورس جديد
                </button>
              </div>
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <div key={course.id} className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg">{course.title}</h4>
                        <div className="flex items-center space-x-4 space-x-reverse mt-2">
                          <div className="flex items-center text-gray-300 text-sm">
                            <Users className="h-4 w-4 ml-1" />
                            {course.students.toLocaleString()} طالب
                          </div>
                          <div className="flex items-center text-yellow-400 text-sm">
                            <Star className="h-4 w-4 ml-1" />
                            {course.rating}
                          </div>
                          <div className="flex items-center text-green-400 text-sm">
                            <DollarSign className="h-4 w-4 ml-1" />
                            {course.revenue.toLocaleString()} ج.م
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.status === 'published' 
                            ? 'bg-green-600 text-green-100' 
                            : 'bg-yellow-600 text-yellow-100'
                        }`}>
                          {course.status === 'published' ? 'منشور' : 'مسودة'}
                        </span>
                        <span className="text-gray-400 text-xs mt-2">
                          آخر تحديث: {course.lastUpdate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-xs">مكتمل {course.progress}%</span>
                      </div>
                      <div className="flex space-x-2 space-x-reverse mr-4">
                        <button className="text-blue-400 hover:text-blue-300">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-purple-400 hover:text-purple-300">
                          <BarChart3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">النشاطات الأخيرة</h3>
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-gray-400 text-xs">منذ {activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Events & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Upcoming Events */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">الأحداث القادمة</h3>
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{event.title}</h4>
                        <div className="flex items-center space-x-4 space-x-reverse mt-2 text-sm text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 ml-1" />
                            {event.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 ml-1" />
                            {event.time}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 ml-1" />
                            {event.attendees}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.type === 'live_session' ? 'bg-red-600 text-red-100' :
                        event.type === 'workshop' ? 'bg-blue-600 text-blue-100' :
                        'bg-green-600 text-green-100'
                      }`}>
                        {event.type === 'live_session' ? 'مباشر' :
                         event.type === 'workshop' ? 'ورشة' : 'مراجعة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Performance */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">إجراءات سريعة</h3>
                <Award className="h-6 w-6 text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
                  <Video className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">جلسة مباشرة</span>
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">درس جديد</span>
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">الرسائل</span>
                  <span className="block text-xs text-purple-200">({instructorStats.pendingReviews} جديد)</span>
                </button>
                <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm">التقارير</span>
                </button>
              </div>
              
              {/* Performance Summary */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-white mb-3">ملخص الأداء</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">إجمالي الأرباح</span>
                    <span className="text-green-400 font-medium">{(instructorStats.totalEarnings / 1000).toFixed(0)}K ج.م</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">الدروس المكتملة</span>
                    <span className="text-blue-400 font-medium">{instructorStats.completedLessons}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">الجلسات هذا الأسبوع</span>
                    <span className="text-purple-400 font-medium">{instructorStats.liveSessionsThisWeek}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default InstructorDashboard;