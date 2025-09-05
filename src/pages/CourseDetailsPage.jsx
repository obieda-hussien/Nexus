import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import ReviewSubmission from '../components/common/ReviewSubmission';
import ReviewsDisplay from '../components/common/ReviewsDisplay';
import { useAuth } from '../contexts/AuthContext';
import CourseService from '../services/CourseService';
import PaymentService from '../services/PaymentService';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle,
  FileText,
  Download,
  CreditCard,
  User,
  Award,
  Target,
  ArrowLeft
} from 'lucide-react';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    vodafoneNumber: '',
    transactionId: ''
  });

  useEffect(() => {
    loadCourse();
    if (currentUser) {
      checkEnrollment();
    }
  }, [id, currentUser]);

  const loadCourse = async () => {
    try {
      const result = await CourseService.getCourse(id);
      if (result.success) {
        setCourse(result.course);
      } else {
        // Fallback to placeholder data for demo
        setCourse(getPlaceholderCourse());
      }
    } catch (error) {
      console.error('Error loading course:', error);
      setCourse(getPlaceholderCourse());
    }
    setLoading(false);
  };

  const checkEnrollment = async () => {
    if (!currentUser) return;
    
    try {
      const result = await CourseService.getStudentEnrollments(currentUser.uid);
      if (result.success) {
        const enrollment = result.enrollments.find(e => e.courseId === id);
        setIsEnrolled(!!enrollment);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (!course) return;

    if (course.isFree) {
      // Free enrollment
      try {
        const result = await CourseService.enrollStudent(currentUser.uid, course.id);
        if (result.success) {
          setIsEnrolled(true);
          toast.success('تم التسجيل في الكورس بنجاح!');
        } else {
          toast.error('حدث خطأ أثناء التسجيل');
        }
      } catch (error) {
        console.error('Error enrolling:', error);
        toast.error('حدث خطأ أثناء التسجيل');
      }
    } else {
      // Paid enrollment - show payment modal
      setShowPaymentModal(true);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!paymentData.vodafoneNumber || !paymentData.transactionId) {
      toast.error('يرجى ملء جميع البيانات المطلوبة');
      return;
    }

    try {
      // Create payment record
      const paymentResult = await PaymentService.createPayment({
        userId: currentUser.uid,
        courseId: course.id,
        amount: course.price,
        vodafoneNumber: paymentData.vodafoneNumber,
        transactionId: paymentData.transactionId
      });

      if (paymentResult.success) {
        // Create enrollment with pending payment
        const enrollmentResult = await CourseService.enrollStudent(
          currentUser.uid,
          course.id,
          {
            method: 'vodafone_cash',
            transactionId: paymentData.transactionId,
            amount: course.price
          }
        );

        if (enrollmentResult.success) {
          setShowPaymentModal(false);
          setIsEnrolled(true);
          toast.success('تم إرسال طلب الدفع! سيتم تأكيد الدفعة خلال 24 ساعة');
        } else {
          toast.error('حدث خطأ أثناء التسجيل');
        }
      } else {
        toast.error('حدث خطأ أثناء معالجة الدفع');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('حدث خطأ أثناء معالجة الدفع');
    }
  };

  const getPlaceholderCourse = () => ({
    id: id,
    title: 'أساسيات البرمجة بـ Python',
    description: 'كورس شامل لتعلم البرمجة بلغة Python من الصفر إلى الاحتراف. يغطي الكورس جميع الأساسيات والمفاهيم المتقدمة مع تطبيقات عملية ومشاريع حقيقية.',
    shortDescription: 'تعلم البرمجة بـ Python من الصفر مع أمثلة عملية',
    price: 299,
    originalPrice: 399,
    isFree: false,
    instructorName: 'أحمد محمد',
    instructorAvatar: '',
    category: 'programming',
    level: 'beginner',
    duration: 1200, // 20 hours
    lessonsCount: 45,
    studentsCount: 1250,
    rating: 4.8,
    reviewsCount: 89,
    tags: ['Python', 'البرمجة', 'المبتدئين'],
    requirements: [
      'لا يتطلب خبرة سابقة في البرمجة',
      'حاسوب شخصي مع اتصال بالإنترنت',
      'رغبة في التعلم والممارسة'
    ],
    whatYouWillLearn: [
      'أساسيات لغة Python',
      'البرمجة الكائنية',
      'التعامل مع الملفات وقواعد البيانات',
      'بناء تطبيقات ويب بسيطة',
      'حل المشاكل البرمجية',
      'أفضل الممارسات في البرمجة'
    ],
    curriculum: {
      section1: {
        title: 'مقدمة في البرمجة',
        order: 1,
        lessons: {
          lesson1: {
            title: 'ما هي البرمجة؟',
            duration: 15,
            type: 'video',
            isPreview: true
          },
          lesson2: {
            title: 'تثبيت Python',
            duration: 20,
            type: 'video',
            isPreview: true
          }
        }
      },
      section2: {
        title: 'الأساسيات',
        order: 2,
        lessons: {
          lesson3: {
            title: 'المتغيرات والأنواع',
            duration: 25,
            type: 'video',
            isPreview: false
          },
          lesson4: {
            title: 'العمليات الحسابية',
            duration: 30,
            type: 'video',
            isPreview: false
          }
        }
      }
    }
  });

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="pt-20 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="bg-gray-700 h-8 w-3/4 rounded mb-4"></div>
              <div className="bg-gray-700 h-64 rounded-lg mb-6"></div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-gray-700 h-40 rounded mb-4"></div>
                  <div className="bg-gray-700 h-32 rounded"></div>
                </div>
                <div className="bg-gray-700 h-80 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navigation />
        <main className="pt-20 min-h-screen">
          <div className="container mx-auto px-4 py-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">الكورس غير موجود</h1>
            <p className="text-gray-400 mb-6">لم يتم العثور على الكورس المطلوب</p>
            <Link to="/Nexus/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
              العودة إلى الكورسات
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/Nexus/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link to="/Nexus/courses" className="hover:text-white">الكورسات</Link>
            <span>/</span>
            <span className="text-white">{course.title}</span>
          </nav>

          {/* Course Hero */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 mb-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h1>
                <p className="text-gray-300 text-lg mb-6">{course.shortDescription}</p>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold">{course.rating}</span>
                    <span className="text-gray-400">({course.reviewsCount} تقييم)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{course.studentsCount?.toLocaleString()} طالب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{Math.floor(course.duration / 60)} ساعة</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{course.instructorName}</p>
                    <p className="text-gray-400 text-sm">مدرب معتمد</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 h-32 rounded-lg flex items-center justify-center mb-4">
                    <Play className="w-12 h-12 text-blue-400" />
                  </div>
                  
                  <div className="price-section mb-6">
                    {!course.isFree ? (
                      <div className="text-center">
                        <span className="text-3xl font-bold text-white">{course.price} جنيه</span>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <div>
                            <span className="text-gray-500 line-through text-lg">{course.originalPrice} جنيه</span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm ml-2">
                              خصم {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-green-400">مجاني</span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold mb-4">أنت مسجل في هذا الكورس</p>
                      <Link
                        to={`/learn/${course.id}`}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors block text-center"
                      >
                        متابعة التعلم
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold"
                    >
                      {course.isFree ? 'التسجيل المجاني' : 'شراء الكورس'}
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">وصول مدى الحياة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">شهادة إتمام</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">دعم فني مباشر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">مشاهدة على الجوال</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <section className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">وصف الكورس</h2>
                <p className="text-gray-300 leading-relaxed">{course.description}</p>
              </section>

              {/* What you'll learn */}
              <section className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-400" />
                  ماذا ستتعلم؟
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn?.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Requirements */}
              <section className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">المتطلبات</h2>
                <ul className="space-y-2">
                  {course.requirements?.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Curriculum */}
              <section className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">محتوى الكورس</h2>
                <div className="space-y-4">
                  {Object.values(course.curriculum || {}).map((section, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg">
                      <div className="p-4 bg-gray-700/30">
                        <h3 className="font-semibold text-white">{section.title}</h3>
                        <p className="text-sm text-gray-400">
                          {Object.keys(section.lessons || {}).length} دروس
                        </p>
                      </div>
                      <div className="divide-y divide-gray-700">
                        {Object.values(section.lessons || {}).map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Play className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300">{lesson.title}</span>
                              {lesson.isPreview && (
                                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">معاينة</span>
                              )}
                            </div>
                            <span className="text-gray-400 text-sm">{lesson.duration} دقيقة</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Stats */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">معلومات الكورس</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">المستوى</span>
                    <span className="text-white">{
                      course.level === 'beginner' ? 'مبتدئ' :
                      course.level === 'intermediate' ? 'متوسط' : 'متقدم'
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">عدد الدروس</span>
                    <span className="text-white">{course.lessonsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">المدة</span>
                    <span className="text-white">{Math.floor(course.duration / 60)} ساعة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">اللغة</span>
                    <span className="text-white">العربية</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">المواضيع</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">المدرس</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{course.instructorName}</p>
                    <p className="text-gray-400 text-sm">مدرب معتمد</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">مدرس متخصص في {course.category === 'programming' ? 'البرمجة' : course.category} مع سنوات من الخبرة في التدريس.</p>
              </div>

              {/* Student Review Submission (only for enrolled students) */}
              {isEnrolled && (
                <ReviewSubmission 
                  courseId={id}
                  courseTitle={course.title}
                />
              )}

              {/* Course Reviews Display */}
              <ReviewsDisplay courseId={id} />
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                إتمام الدفع
              </h2>

              <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 mb-6">
                <h3 className="text-blue-400 font-semibold mb-2">تعليمات الدفع:</h3>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. حول {course.price} جنيه إلى رقم فودافون كاش: <strong>01234567890</strong></li>
                  <li>2. اكتب رقم فودافون كاش الخاص بك أدناه</li>
                  <li>3. اكتب رقم العملية (Transaction ID)</li>
                </ol>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">رقم فودافون كاش الخاص بك</label>
                  <input
                    type="tel"
                    value={paymentData.vodafoneNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, vodafoneNumber: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="01xxxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">رقم العملية (Transaction ID)</label>
                  <input
                    type="text"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="MP240123456789"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    تأكيد الدفع
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default CourseDetailsPage;