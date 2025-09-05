import React, { useState, useEffect } from 'react';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play,
  CheckCircle,
  Calendar,
  Target,
  Brain,
  Bookmark,
  MessageSquare,
  Star,
  Trophy,
  Download,
  Eye,
  Users,
  BarChart3
} from 'lucide-react';

const StudentDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  
  const [studentStats, setStudentStats] = useState({
    enrolledCourses: 8,
    completedCourses: 3,
    totalHours: 156,
    certificatesEarned: 3,
    currentStreak: 12,
    skillPoints: 2840,
    weeklyGoal: 10,
    weeklyProgress: 7
  });

  const [enrolledCourses] = useState([
    {
      id: 1,
      title: 'الفيزياء الأساسية',
      instructor: 'د. أحمد محمد',
      progress: 85,
      totalLessons: 24,
      completedLessons: 20,
      nextLesson: 'قوانين نيوتن للحركة',
      rating: 4.8,
      duration: '8 أسابيع',
      certificate: false,
      lastAccessed: '2024-12-28'
    },
    {
      id: 2,
      title: 'الرياضيات التطبيقية',
      instructor: 'أ.د. سارة أحمد',
      progress: 60,
      totalLessons: 30,
      completedLessons: 18,
      nextLesson: 'التفاضل الجزئي',
      rating: 4.9,
      duration: '10 أسابيع',
      certificate: false,
      lastAccessed: '2024-12-27'
    },
    {
      id: 3,
      title: 'الفيزياء المتقدمة',
      instructor: 'د. محمد حسن',
      progress: 100,
      totalLessons: 20,
      completedLessons: 20,
      nextLesson: null,
      rating: 4.7,
      duration: '12 أسبوع',
      certificate: true,
      lastAccessed: '2024-12-25'
    }
  ]);

  const [recentActivities] = useState([
    { id: 1, type: 'lesson', message: 'أكملت درس "قوانين نيوتن" في الفيزياء الأساسية', time: '30 دقيقة', icon: Play },
    { id: 2, type: 'achievement', message: 'حصلت على شارة "المتفوق الأسبوعي"', time: '1 ساعة', icon: Award },
    { id: 3, type: 'quiz', message: 'نجحت في اختبار الرياضيات بدرجة 95%', time: '2 ساعة', icon: Target },
    { id: 4, type: 'certificate', message: 'حصلت على شهادة الفيزياء المتقدمة', time: '1 يوم', icon: Trophy },
    { id: 5, type: 'discussion', message: 'شاركت في نقاش حول نظرية النسبية', time: '2 يوم', icon: MessageSquare }
  ]);

  const [upcomingEvents] = useState([
    {
      id: 1,
      title: 'محاضرة مباشرة: ميكانيكا الكم',
      course: 'الفيزياء المتقدمة',
      date: '2024-12-29',
      time: '20:00',
      duration: '2 ساعة',
      type: 'live'
    },
    {
      id: 2,
      title: 'اختبار نصف الترم',
      course: 'الرياضيات التطبيقية',
      date: '2024-12-30',
      time: '18:00',
      duration: '1.5 ساعة',
      type: 'exam'
    },
    {
      id: 3,
      title: 'ورشة حل المسائل',
      course: 'الفيزياء الأساسية',
      date: '2025-01-02',
      time: '19:00',
      duration: '1 ساعة',
      type: 'workshop'
    }
  ]);

  const [achievements] = useState([
    { name: 'المتعلم النشط', description: 'أكمل 10 دروس متتالية', earned: true },
    { name: 'الطالب المثالي', description: 'حافظ على معدل 95% أو أكثر', earned: true },
    { name: 'المناقش المتميز', description: 'شارك في 50 نقاش', earned: false },
    { name: 'خبير الفيزياء', description: 'أكمل 5 كورسات فيزياء', earned: false }
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStudentStats(prev => ({
        ...prev,
        skillPoints: prev.skillPoints + Math.floor(Math.random() * 10),
        totalHours: prev.totalHours + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              مرحباً، {currentUser?.displayName || 'الطالب'}
            </h1>
            <p className="text-gray-300">استمر في رحلتك التعليمية واحقق أهدافك الأكاديمية</p>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">الكورسات المسجلة</p>
                  <p className="text-3xl font-bold">{studentStats.enrolledCourses}</p>
                  <p className="text-blue-100 text-xs">+2 هذا الشهر</p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">الكورسات المكتملة</p>
                  <p className="text-3xl font-bold">{studentStats.completedCourses}</p>
                  <p className="text-green-100 text-xs">معدل إكمال 87%</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">ساعات التعلم</p>
                  <p className="text-3xl font-bold">{studentStats.totalHours}</p>
                  <p className="text-purple-100 text-xs">+12 ساعة هذا الأسبوع</p>
                </div>
                <Clock className="h-12 w-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">الشهادات المكتسبة</p>
                  <p className="text-3xl font-bold">{studentStats.certificatesEarned}</p>
                  <p className="text-yellow-100 text-xs">شهادة معتمدة</p>
                </div>
                <Award className="h-12 w-12 text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Progress & Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Weekly Goal */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">الهدف الأسبوعي</h3>
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">{studentStats.weeklyProgress} / {studentStats.weeklyGoal} ساعة</span>
                  <span className="text-blue-400 font-medium">{Math.round((studentStats.weeklyProgress / studentStats.weeklyGoal) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" 
                    style={{ width: `${Math.min((studentStats.weeklyProgress / studentStats.weeklyGoal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">استمر! أنت على الطريق الصحيح لتحقيق هدفك</p>
            </div>

            {/* Learning Streak */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">سلسلة التعلم</h3>
                <TrendingUp className="h-6 w-6 text-orange-400" />
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-400 mb-2">{studentStats.currentStreak}</p>
                <p className="text-gray-300 text-sm">يوم متتالي</p>
                <p className="text-gray-400 text-xs mt-2">رقمك القياسي: 18 يوم</p>
              </div>
            </div>

            {/* Skill Points */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">نقاط المهارة</h3>
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400 mb-2">{studentStats.skillPoints.toLocaleString()}</p>
                <p className="text-gray-300 text-sm">نقطة</p>
                <p className="text-gray-400 text-xs mt-2">المستوى: متقدم</p>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">كورساتي الحالية</h3>
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{course.title}</h4>
                      <p className="text-gray-400 text-sm">{course.instructor}</p>
                    </div>
                    {course.certificate && (
                      <Trophy className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm">التقدم</span>
                      <span className="text-blue-400 text-sm font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-400 text-xs">
                        {course.completedLessons} / {course.totalLessons} درس
                      </span>
                      <div className="flex items-center text-yellow-400 text-xs">
                        <Star className="h-3 w-3 ml-1" />
                        {course.rating}
                      </div>
                    </div>
                  </div>

                  {course.nextLesson && (
                    <div className="mb-3">
                      <p className="text-gray-300 text-sm mb-1">الدرس التالي:</p>
                      <p className="text-white text-sm font-medium">{course.nextLesson}</p>
                    </div>
                  )}

                  <div className="flex space-x-2 space-x-reverse">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center">
                      <Play className="h-4 w-4 ml-1" />
                      {course.progress === 100 ? 'مراجعة' : 'متابعة'}
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activities & Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Activities */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">النشاطات الأخيرة</h3>
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
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

            {/* Upcoming Events */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">الأحداث القادمة</h3>
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{event.title}</h4>
                        <p className="text-gray-400 text-xs">{event.course}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.type === 'live' ? 'bg-red-600 text-red-100' :
                        event.type === 'exam' ? 'bg-orange-600 text-orange-100' :
                        'bg-blue-600 text-blue-100'
                      }`}>
                        {event.type === 'live' ? 'مباشر' :
                         event.type === 'exam' ? 'امتحان' : 'ورشة'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 ml-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 ml-1" />
                        {event.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">الإنجازات والشارات</h3>
              <Award className="h-6 w-6 text-blue-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 ${
                    achievement.earned 
                      ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-yellow-600/50' 
                      : 'bg-gray-700/30 border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      <Trophy className={`h-6 w-6 ${
                        achievement.earned ? 'text-yellow-100' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <h4 className={`text-center font-medium mb-2 ${
                    achievement.earned ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className="text-gray-400 text-xs text-center">{achievement.description}</p>
                  {achievement.earned && (
                    <div className="flex items-center justify-center mt-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default StudentDashboard;