import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Star,
  PlayCircle,
  CheckCircle,
  Target,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

const UserDashboard = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    totalStudyTime: 0,
    streakDays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser && userProfile) {
      loadDashboardData();
    }
  }, [isOpen, currentUser, userProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Calculate stats from user profile
      const enrolledCourses = userProfile.enrolledCourses?.length || 0;
      const completedCourses = userProfile.completedCourses?.length || 0;
      
      // Calculate total study time from progress
      let totalStudyTime = 0;
      if (userProfile.progress) {
        Object.values(userProfile.progress).forEach(course => {
          Object.values(course).forEach(lesson => {
            totalStudyTime += lesson.timeSpent || 0;
          });
        });
      }
      
      setStats({
        enrolledCourses,
        completedCourses,
        totalStudyTime: Math.round(totalStudyTime / 60), // Convert to minutes
        streakDays: 7 // This would be calculated based on daily activity
      });

      // Mock course progress data
      const mockCourseProgress = [
        {
          id: 'physics-101',
          title: 'أساسيات الفيزياء',
          progress: 75,
          totalLessons: 20,
          completedLessons: 15,
          lastAccessed: '2024-12-29'
        },
        {
          id: 'math-201',
          title: 'الرياضيات المتقدمة',
          progress: 45,
          totalLessons: 25,
          completedLessons: 11,
          lastAccessed: '2024-12-28'
        },
        {
          id: 'chemistry-101',
          title: 'الكيمياء العامة',
          progress: 30,
          totalLessons: 18,
          completedLessons: 5,
          lastAccessed: '2024-12-27'
        }
      ];
      
      setCourseProgress(mockCourseProgress);

      // Mock recent activity
      const mockActivity = [
        {
          type: 'lesson_completed',
          title: 'أكمل درس: قوانين نيوتن',
          time: '2024-12-29T10:30:00',
          course: 'أساسيات الفيزياء'
        },
        {
          type: 'quiz_passed',
          title: 'نجح في اختبار: الحركة الدائرية',
          time: '2024-12-29T09:15:00',
          course: 'أساسيات الفيزياء'
        },
        {
          type: 'course_enrolled',
          title: 'انضم إلى: الرياضيات المتقدمة',
          time: '2024-12-28T14:20:00',
          course: 'الرياضيات المتقدمة'
        }
      ];
      
      setRecentActivity(mockActivity);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-400 to-secondary-400 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">مرحباً، {userProfile?.displayName}</h2>
                <p className="text-white text-opacity-90">لوحة التحكم الشخصية</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                تسجيل الخروج
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">جاري تحميل البيانات...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">الكورسات المسجلة</p>
                      <p className="text-2xl font-bold text-blue-700">{stats.enrolledCourses}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">الكورسات المكتملة</p>
                      <p className="text-2xl font-bold text-green-700">{stats.completedCourses}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">ساعات الدراسة</p>
                      <p className="text-2xl font-bold text-purple-700">{stats.totalStudyTime}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">أيام متتالية</p>
                      <p className="text-2xl font-bold text-orange-700">{stats.streakDays}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Course Progress */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Target className="h-5 w-5 ml-2 text-primary-400" />
                  تقدم الكورسات
                </h3>
                <div className="space-y-4">
                  {courseProgress.map((course) => (
                    <div key={course.id} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{course.title}</h4>
                          <p className="text-sm text-gray-600">
                            {course.completedLessons} من {course.totalLessons} دروس
                          </p>
                        </div>
                        <span className="text-sm font-medium text-primary-400">
                          {course.progress}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-gradient-to-r from-primary-400 to-secondary-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          آخر دخول: {new Date(course.lastAccessed).toLocaleDateString('ar-EG')}
                        </span>
                        <button className="text-primary-400 hover:text-primary-500 text-sm font-medium flex items-center">
                          <PlayCircle className="h-4 w-4 ml-1" />
                          متابعة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 ml-2 text-primary-400" />
                  النشاط الأخير
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {activity.type === 'lesson_completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {activity.type === 'quiz_passed' && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                          {activity.type === 'course_enrolled' && (
                            <Award className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.course}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.time).toLocaleString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;