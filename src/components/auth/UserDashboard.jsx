import React, { useState, useEffect } from 'react';
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
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { get } from 'firebase/database';
import { db } from '../../config/firebase';

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
        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 p-8 text-white border-b border-glass-border relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-neon-purple/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full border-2 border-white flex items-center justify-center">
                  <UserCheck className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">مرحباً، {userProfile?.displayName || 'المستخدم'}</h2>
                <p className="text-gray-300 flex items-center">
                  <GraduationCap className="h-4 w-4 ml-1" />
                  لوحة التحكم الشخصية
                </p>
                <p className="text-sm text-neon-blue/80 mt-1">جاهز للتعلم اليوم؟</p>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="text-white hover:text-red-400 text-3xl transition-colors duration-200 w-12 h-12 flex items-center justify-center rounded-full hover:bg-red-500/20 border border-transparent hover:border-red-400/30"
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
            <div className="flex flex-col items-center justify-center h-64 space-y-6">
              <div className="text-red-400 text-xl font-semibold">خطأ في تحميل البيانات</div>
              <div className="text-center max-w-md">
                <p className="text-gray-400 mb-4">
                  لم يتم العثور على بيانات الملف الشخصي.<br/>
                  قد تحتاج لإنشاء الملف الشخصي أو التحقق من الاتصال.
                </p>
                <div className="bg-blue-900/20 border border-blue-400/30 p-4 rounded-xl">
                  <p className="text-blue-400 text-sm">
                    💡 <strong>نصيحة:</strong> استخدم الزر أدناه لإنشاء ملف شخصي جديد
                  </p>
                </div>
              </div>
              <div className="flex space-x-4 flex-wrap justify-center gap-3">
                <button
                  onClick={handleCreateProfile}
                  disabled={loading}
                  className="glass-hover bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 hover:from-neon-blue/30 hover:to-neon-purple/30 px-6 py-3 rounded-xl transition-all duration-200 text-neon-blue hover:text-white disabled:opacity-50 font-medium"
                >
                  {loading ? 'جاري الإنشاء...' : '✨ إنشاء ملف شخصي'}
                </button>
                <button
                  onClick={handleLogout}
                  className="glass-hover bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 px-6 py-3 rounded-xl transition-all duration-200 text-red-300 hover:text-red-200 font-medium"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enhanced Stats Cards */}
              <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass glass-hover p-6 rounded-2xl border border-blue-400/20 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-neon-blue/10 rounded-full blur-xl group-hover:bg-neon-blue/20 transition-all duration-300"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-blue-300 text-sm font-medium mb-1">الكورسات المسجلة</p>
                      <p className="text-3xl font-bold text-white">{stats.enrolledCourses}</p>
                      <p className="text-xs text-blue-200/60 mt-1">كورس نشط</p>
                    </div>
                    <div className="bg-neon-blue/20 p-3 rounded-xl">
                      <BookOpen className="h-8 w-8 text-neon-blue" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass glass-hover p-6 rounded-2xl border border-green-400/20 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-neon-green/10 rounded-full blur-xl group-hover:bg-neon-green/20 transition-all duration-300"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-green-300 text-sm font-medium mb-1">الكورسات المكتملة</p>
                      <p className="text-3xl font-bold text-white">{stats.completedCourses}</p>
                      <p className="text-xs text-green-200/60 mt-1">تم إنجازها</p>
                    </div>
                    <div className="bg-neon-green/20 p-3 rounded-xl">
                      <Trophy className="h-8 w-8 text-neon-green" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass glass-hover p-6 rounded-2xl border border-purple-400/20 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-neon-purple/10 rounded-full blur-xl group-hover:bg-neon-purple/20 transition-all duration-300"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-purple-300 text-sm font-medium mb-1">ساعات الدراسة</p>
                      <p className="text-3xl font-bold text-white">{stats.totalStudyTime}</p>
                      <p className="text-xs text-purple-200/60 mt-1">دقيقة إجمالي</p>
                    </div>
                    <div className="bg-neon-purple/20 p-3 rounded-xl">
                      <Clock className="h-8 w-8 text-neon-purple" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass glass-hover p-6 rounded-2xl border border-orange-400/20 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/10 rounded-full blur-xl group-hover:bg-orange-400/20 transition-all duration-300"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-orange-300 text-sm font-medium mb-1">أيام متتالية</p>
                      <p className="text-3xl font-bold text-white">{stats.streakDays}</p>
                      <p className="text-xs text-orange-200/60 mt-1">🔥 سلسلة نشطة</p>
                    </div>
                    <div className="bg-orange-400/20 p-3 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-orange-400" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Course Progress */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <div className="bg-neon-blue/20 p-2 rounded-lg ml-3">
                      <Target className="h-6 w-6 text-neon-blue" />
                    </div>
                    تقدم الكورسات
                  </h3>
                  <div className="space-y-6">
                    {courseProgress.map((course, index) => (
                      <motion.div 
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="glass glass-hover p-6 rounded-2xl border border-glass-border relative overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 transition-all duration-300 group-hover:from-neon-blue/20 group-hover:to-neon-purple/20" 
                             style={{ width: `${course.progress}%` }}></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-white text-lg mb-1">{course.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span className="flex items-center">
                                  <CheckCircle className="h-4 w-4 ml-1 text-neon-green" />
                                  {course.completedLessons} من {course.totalLessons} دروس
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 ml-1 text-neon-blue" />
                                  آخر دخول: {new Date(course.lastAccessed).toLocaleDateString('ar-EG')}
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold text-lg px-3 py-1 rounded-lg">
                                {course.progress}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-full bg-secondary-bg/50 rounded-full h-3 mb-4 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress}%` }}
                              transition={{ delay: 0.8 + index * 0.1, duration: 1, ease: "easeOut" }}
                              className="bg-gradient-to-r from-neon-blue to-neon-purple h-3 rounded-full relative"
                            >
                              <div className="absolute right-0 top-0 h-full w-2 bg-white/30 rounded-r-full"></div>
                            </motion.div>
                          </div>
                          
                          <div className="flex justify-end">
                            <button className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 hover:from-neon-blue/30 hover:to-neon-purple/30 border border-neon-blue/30 text-neon-blue hover:text-white px-6 py-2 rounded-xl font-medium flex items-center transition-all duration-200 group">
                              <PlayCircle className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-200" />
                              متابعة التعلم
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Recent Activity */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <div className="bg-neon-purple/20 p-2 rounded-lg ml-3">
                      <Calendar className="h-6 w-6 text-neon-purple" />
                    </div>
                    النشاط الأخير
                  </h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="glass glass-hover p-4 rounded-xl border border-glass-border relative overflow-hidden group"
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-neon-blue to-neon-purple"></div>
                        
                        <div className="flex items-start space-x-4 relative z-10">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-glass-border">
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
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white mb-1 leading-relaxed">
                              {activity.title}
                            </p>
                            <p className="text-xs text-neon-blue/80 font-medium mb-1">
                              {activity.course}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.time).toLocaleString('ar-EG')}
                            </p>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-neon-green rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-center mt-6"
                    >
                      <button className="glass-hover bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-glass-border hover:from-neon-blue/20 hover:to-neon-purple/20 px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-all duration-200 font-medium">
                        عرض المزيد من النشاطات
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;