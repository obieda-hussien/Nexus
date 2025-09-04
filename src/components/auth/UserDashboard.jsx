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
  Award,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import FirebaseDiagnostic from '../FirebaseDiagnostic';

const UserDashboard = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, logout, createUserProfile } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    totalStudyTime: 0,
    streakDays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser && userProfile) {
      console.log('Dashboard opened with user:', currentUser.uid, 'profile:', userProfile);
      loadDashboardData();
    } else if (isOpen && currentUser && !userProfile) {
      console.log('Dashboard opened but no profile data available for user:', currentUser.uid);
      setLoading(false); // Stop loading if we don't have profile data
    } else if (isOpen) {
      console.log('Dashboard opened but no user authenticated');
      setLoading(false);
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

  const handleCreateProfile = async () => {
    try {
      setLoading(true);
      await createUserProfile();
      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error creating profile:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const openDiagnostic = () => {
    setShowDiagnostic(true);
  };

  const closeDiagnostic = () => {
    setShowDiagnostic(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-glass-border"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 p-6 text-white border-b border-glass-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">مرحباً، {userProfile?.displayName || 'المستخدم'}</h2>
                <p className="text-gray-300">لوحة التحكم الشخصية</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={openDiagnostic}
                className="glass-hover p-2 rounded-lg border border-blue-400/30 hover:bg-blue-500/20 transition-all duration-200 group"
                title="أداة التشخيص"
              >
                <Settings className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
              </button>
              <button
                onClick={handleLogout}
                className="glass-hover bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-red-300 hover:text-red-200"
              >
                تسجيل الخروج
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-neon-blue text-2xl transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-secondary-bg/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-300">جاري تحميل البيانات...</span>
              {!userProfile && currentUser && (
                <div className="text-center">
                  <p className="text-yellow-400 text-sm">لا توجد بيانات ملف شخصي</p>
                  <p className="text-gray-400 text-xs">يتم إنشاء الملف الشخصي...</p>
                </div>
              )}
            </div>
          ) : !userProfile ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-red-400 text-lg font-semibold">خطأ في تحميل البيانات</div>
              <p className="text-gray-400 text-center">
                لم يتم العثور على بيانات الملف الشخصي.<br/>
                قد تحتاج لتحديث قواعد الأمان في Firebase أو إنشاء الملف الشخصي يدوياً.
              </p>
              <div className="bg-yellow-900/20 border border-yellow-400/30 p-3 rounded-lg max-w-md">
                <p className="text-yellow-400 text-sm">
                  💡 <strong>نصيحة:</strong> تحقق من قواعد الأمان في Firestore Console
                </p>
              </div>
              <div className="flex space-x-4 flex-wrap justify-center gap-2">
                <button
                  onClick={openDiagnostic}
                  className="glass-hover bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-blue-300 hover:text-blue-200"
                >
                  🔍 تشخيص المشكلة
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={loading}
                  className="glass-hover bg-green-500/20 border border-green-400/30 hover:bg-green-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-green-300 hover:text-green-200 disabled:opacity-50"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء ملف شخصي'}
                </button>
                <button
                  onClick={handleLogout}
                  className="glass-hover bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-all duration-200 text-red-300 hover:text-red-200"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="glass glass-hover p-6 rounded-xl border border-blue-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm font-medium">الكورسات المسجلة</p>
                      <p className="text-2xl font-bold text-white">{stats.enrolledCourses}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-neon-blue" />
                  </div>
                </div>

                <div className="glass glass-hover p-6 rounded-xl border border-green-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm font-medium">الكورسات المكتملة</p>
                      <p className="text-2xl font-bold text-white">{stats.completedCourses}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-neon-green" />
                  </div>
                </div>

                <div className="glass glass-hover p-6 rounded-xl border border-purple-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">ساعات الدراسة</p>
                      <p className="text-2xl font-bold text-white">{stats.totalStudyTime}</p>
                    </div>
                    <Clock className="h-8 w-8 text-neon-purple" />
                  </div>
                </div>

                <div className="glass glass-hover p-6 rounded-xl border border-orange-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-300 text-sm font-medium">أيام متتالية</p>
                      <p className="text-2xl font-bold text-white">{stats.streakDays}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Course Progress */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Target className="h-5 w-5 ml-2 text-neon-blue" />
                  تقدم الكورسات
                </h3>
                <div className="space-y-4">
                  {courseProgress.map((course) => (
                    <div key={course.id} className="glass glass-hover p-4 rounded-xl border border-glass-border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{course.title}</h4>
                          <p className="text-sm text-gray-400">
                            {course.completedLessons} من {course.totalLessons} دروس
                          </p>
                        </div>
                        <span className="text-sm font-medium text-neon-blue">
                          {course.progress}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-secondary-bg rounded-full h-2 mb-3">
                        <div 
                          className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full transition-all duration-300 neon-glow"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          آخر دخول: {new Date(course.lastAccessed).toLocaleDateString('ar-EG')}
                        </span>
                        <button className="text-neon-blue hover:text-neon-blue/80 text-sm font-medium flex items-center transition-colors duration-200 glass-hover px-3 py-1 rounded-lg">
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 ml-2 text-neon-purple" />
                  النشاط الأخير
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="glass glass-hover p-3 rounded-lg border border-glass-border">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {activity.type === 'lesson_completed' && (
                            <CheckCircle className="h-4 w-4 text-neon-green" />
                          )}
                          {activity.type === 'quiz_passed' && (
                            <Star className="h-4 w-4 text-yellow-400" />
                          )}
                          {activity.type === 'course_enrolled' && (
                            <Award className="h-4 w-4 text-neon-blue" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.course}
                          </p>
                          <p className="text-xs text-gray-500">
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
      
      {/* Firebase Diagnostic Tool */}
      {showDiagnostic && (
        <FirebaseDiagnostic onClose={closeDiagnostic} />
      )}
    </div>
  );
};

export default UserDashboard;