import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, query, orderByChild, equalTo } from 'firebase/database';
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
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewsTab = ({ courses = [] }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (currentUser?.uid && courses.length > 0) {
      loadReviews();
    }
  }, [currentUser, courses]);

  useEffect(() => {
    calculateStats();
  }, [reviews]);

  const loadReviews = () => {
    setLoading(true);
    const allReviews = [];
    let coursesProcessed = 0;

    if (courses.length === 0) {
      setLoading(false);
      return;
    }

    courses.forEach((course) => {
      const reviewsRef = ref(db, `course_reviews/${course.id}`);
      onValue(reviewsRef, (snapshot) => {
        const courseReviews = [];
        snapshot.forEach((childSnapshot) => {
          const review = childSnapshot.val();
          courseReviews.push({
            id: childSnapshot.key,
            ...review,
            courseId: course.id,
            courseTitle: course.title
          });
        });
        
        // Remove old reviews for this course and add new ones
        const filteredReviews = allReviews.filter(r => r.courseId !== course.id);
        allReviews.push(...filteredReviews, ...courseReviews);
        
        coursesProcessed++;
        if (coursesProcessed === courses.length) {
          setReviews(allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          setLoading(false);
        }
      });
    });
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
      const replyRef = ref(db, `course_reviews/${review.courseId}/${reviewId}/instructorReply`);
      
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
      toast.error('حدث خطأ في إرسال الرد');
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
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
        {filteredReviews.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد مراجعات</h3>
            <p className="text-gray-400">
              {reviews.length === 0 
                ? 'لم يقم أي طالب بكتابة مراجعة حتى الآن' 
                : 'لا توجد مراجعات تطابق المرشحات المحددة'
              }
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
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
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;