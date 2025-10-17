import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, query, orderByChild, equalTo, get } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Star, 
  MessageSquare, 
  Filter, 
  Search, 
  Calendar,
  User,
  BookOpen,
  Reply,
  Send,
  TrendingUp,
  BarChart3,
  FileText,
  Users,
  Eye,
  AlertTriangle,
  RefreshCw,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewsTab = ({ courses = [] }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [databaseInitialized, setDatabaseInitialized] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    if (currentUser?.uid) {
      initializeDatabase();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.uid && courses.length > 0 && databaseInitialized) {
      loadReviews();
    }
  }, [currentUser, courses, databaseInitialized]);

  useEffect(() => {
    calculateStats();
  }, [reviews]);

  // Initialize database structure if it doesn't exist
  const initializeDatabase = async () => {
    try {
      setError(null);
      
      // No need to initialize a separate course_reviews path
      // We'll use the existing courses structure: courses/{courseId}/reviews/{reviewId}
      // This leverages existing Firebase rules for courses
      console.log('استخدام هيكل الكورسات الموجود للمراجعات');
      
      setDatabaseInitialized(true);
    } catch (error) {
      console.error('خطأ في تهيئة قاعدة البيانات:', error);
      setError({
        type: 'initialization',
        message: 'فشل في تهيئة قاعدة بيانات المراجعات',
        details: error.message
      });
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allReviews = [];
      let coursesProcessed = 0;
      let hasError = false;

      if (courses.length === 0) {
        setLoading(false);
        return;
      }

      const coursePromises = courses.map((course) => {
        return new Promise((resolve, reject) => {
          // Use courses/{courseId}/reviews path instead of course_reviews/{courseId}
          const reviewsRef = ref(db, `courses/${course.id}/reviews`);
          
          const unsubscribe = onValue(
            reviewsRef, 
            (snapshot) => {
              try {
                const courseReviews = [];
                
                if (snapshot.exists()) {
                  snapshot.forEach((childSnapshot) => {
                    const review = childSnapshot.val();
                    
                    courseReviews.push({
                      id: childSnapshot.key,
                      ...review,
                      courseId: course.id,
                      courseTitle: course.title
                    });
                  });
                }
                
                // Remove old reviews for this course and add new ones
                const filteredReviews = allReviews.filter(r => r.courseId !== course.id);
                allReviews.length = 0;
                allReviews.push(...filteredReviews, ...courseReviews);
                
                coursesProcessed++;
                if (coursesProcessed === courses.length && !hasError) {
                  setReviews(allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                  setLoading(false);
                  setRetryCount(0); // Reset retry count on success
                }
                
                resolve();
              } catch (err) {
                hasError = true;
                reject(err);
              }
            },
            (error) => {
              hasError = true;
              console.error(`خطأ في جلب مراجعات الكورس ${course.title}:`, error);
              reject(error);
            }
          );
        });
      });

      await Promise.allSettled(coursePromises);
      
    } catch (error) {
      console.error('خطأ في جلب المراجعات:', error);
      setError({
        type: 'fetch',
        message: 'حدث خطأ في جلب المراجعات',
        details: error.message
      });
      setLoading(false);
    }
  };

  const retryOperation = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    
    if (error?.type === 'initialization') {
      initializeDatabase();
    } else {
      loadReviews();
    }
  };

  const calculateStats = () => {
    if (reviews.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    setStats({
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution: distribution
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesCourse = filterCourse === 'all' || review.courseId === filterCourse;
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesSearch = searchTerm === '' || 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCourse && matchesRating && matchesSearch;
  });

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('يرجى كتابة الرد أولاً');
      return;
    }

    try {
      const review = reviews.find(r => r.id === reviewId);
      // Use courses/{courseId}/reviews/{reviewId}/instructorReply path
      const replyRef = ref(db, `courses/${review.courseId}/reviews/${reviewId}/instructorReply`);
      
      await set(replyRef, {
        message: replyText,
        timestamp: new Date().toISOString(),
        instructorId: currentUser.uid,
        instructorName: currentUser.displayName || 'المدرس'
      });

      setReplyText('');
      setReplyingTo(null);
      toast.success('تم إرسال الرد بنجاح');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('حدث خطأ في إرسال الرد. يرجى المحاولة مرة أخرى.');
    }
  };

  // Error component
  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl border border-red-500/20 p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">حدث خطأ</h3>
      <p className="text-red-300 mb-4">{error.message}</p>
      {error.details && (
        <p className="text-red-400 text-sm mb-4 opacity-75">{error.details}</p>
      )}
      <div className="flex justify-center space-x-4 space-x-reverse">
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </button>
        {error.type === 'initialization' && (
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة تحميل الصفحة</span>
          </button>
        )}
      </div>
      {retryCount > 0 && (
        <p className="text-gray-400 text-sm mt-4">
          عدد المحاولات: {retryCount}
        </p>
      )}
    </div>
  );

  // Database initialization display
  const InitializationDisplay = () => (
    <div className="bg-blue-500/10 backdrop-blur-lg rounded-2xl border border-blue-500/20 p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Database className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">جاري تهيئة قاعدة البيانات</h3>
      <p className="text-blue-300 mb-4">يتم إعداد نظام المراجعات لأول مرة...</p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
    </div>
  );

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorDisplay error={error} onRetry={retryOperation} />
      </div>
    );
  }

  if (loading || !databaseInitialized) {
    return (
      <div className="space-y-6">
        {!databaseInitialized ? <InitializationDisplay /> : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-white">جاري تحميل المراجعات...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <MessageSquare className="w-6 h-6 ml-3 text-purple-400" />
            إدارة المراجعات والتقييمات
          </h2>
          <div className="flex items-center space-x-2 space-x-reverse">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300">{stats.totalReviews} مراجعة</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
            <div className="text-purple-300 text-sm">إجمالي المراجعات</div>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.averageRating}</div>
            <div className="text-green-300 text-sm">متوسط التقييم</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <div className="text-yellow-300 text-sm">التقييم العام</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{courses.length}</div>
            <div className="text-blue-300 text-sm">الكورسات النشطة</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">توزيع التقييمات</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.ratingDistribution[rating];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center space-x-1 space-x-reverse w-16">
                    <span className="text-white text-sm">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-300 text-sm w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في المراجعات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Course Filter */}
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">جميع الكورسات</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">جميع التقييمات</option>
            <option value="5">5 نجوم</option>
            <option value="4">4 نجوم</option>
            <option value="3">3 نجوم</option>
            <option value="2">نجمتان</option>
            <option value="1">نجمة واحدة</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {(() => {
          // Helper function to render empty state
          const renderEmptyState = () => {
            // Check if there are no published courses
            const publishedCourses = courses.filter(course => course.published !== false);
            
            if (publishedCourses.length === 0) {
              return (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Eye className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">لا توجد كورسات منشورة</h3>
                  <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto leading-relaxed">
                    يجب نشر الكورسات أولاً حتى يتمكن الطلاب من تقييمها وكتابة المراجعات
                  </p>
                  <div className="flex items-center justify-center space-x-6 space-x-reverse text-sm text-gray-500">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <BookOpen className="w-4 h-4" />
                      <span>انشر كورساتك</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Users className="w-4 h-4" />
                      <span>جذب الطلاب</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Star className="w-4 h-4" />
                      <span>احصل على التقييمات</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Check if there are published courses but no reviews yet
            if (reviews.length === 0) {
              return (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-12 h-12 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">لا توجد مراجعات حتى الآن</h3>
                  <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto leading-relaxed">
                    لم يقم أي طالب بكتابة مراجعة أو تقييم لكورساتك بعد. عندما يبدأ الطلاب في التفاعل مع المحتوى ستظهر مراجعاتهم هنا.
                  </p>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-lg mx-auto">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-right">
                        <h4 className="text-blue-300 font-semibold mb-1">نصيحة</h4>
                        <p className="text-blue-200 text-sm">
                          تفاعل مع طلابك وقدم محتوى عالي الجودة لتشجيعهم على ترك تقييمات إيجابية
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // If there are reviews but none match the filters
            return (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد نتائج</h3>
                <p className="text-gray-400 mb-4">
                  لا توجد مراجعات تطابق المرشحات المحددة
                </p>
                <button
                  onClick={() => {
                    setFilterCourse('all');
                    setFilterRating('all');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  إعادة تعيين المرشحات
                </button>
              </div>
            );
          };

          if (filteredReviews.length === 0) {
            return renderEmptyState();
          }

          return filteredReviews.map((review) => (
            <div key={review.id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{review.studentName || 'طالب'}</h4>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{review.courseTitle}</span>
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(review.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className={`text-sm font-semibold ${getRatingColor(review.rating)}`}>
                    {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Review Content */}
              {review.comment && (
                <div className="mb-4">
                  <p className="text-gray-200 leading-relaxed">{review.comment}</p>
                </div>
              )}

              {/* Instructor Reply */}
              {review.instructorReply && (
                <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border-r-4 border-blue-400">
                  <div className="flex items-center mb-2">
                    <Reply className="w-4 h-4 text-blue-400 ml-2" />
                    <span className="text-blue-300 font-semibold">رد المدرس</span>
                    <span className="text-gray-400 text-sm mr-auto">
                      {new Date(review.instructorReply.timestamp).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-gray-200">{review.instructorReply.message}</p>
                </div>
              )}

              {/* Reply Form */}
              {!review.instructorReply && (
                <div className="mt-4">
                  {replyingTo === review.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="اكتب ردك على هذه المراجعة..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
                      />
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleReply(review.id)}
                          className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                        >
                          <Send className="w-4 h-4" />
                          <span>إرسال الرد</span>
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                      <Reply className="w-4 h-4" />
                      <span>الرد على المراجعة</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        })()} 
      </div>
    </div>
  );
};

export default ReviewsTab;