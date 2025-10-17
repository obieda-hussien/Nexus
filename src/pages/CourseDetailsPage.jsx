import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import ReviewSubmission from '../components/common/ReviewSubmission';
import ReviewsDisplay from '../components/common/ReviewsDisplay';
import PayPalPaymentButton from '../components/ui/PayPalPaymentButton';
import { useAuth } from '../contexts/AuthContext';
import CourseService from '../services/CourseService';
import PaymentService from '../services/PaymentService';
import EmailJSNotificationService from '../services/EmailJSNotificationService';
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
  const [showPayPalPayment, setShowPayPalPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vodafone');
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
      const result = await CourseService.getstudentEnrollments(currentUser.uid);
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
      toast.error('Please Login first');
      return;
    }

    if (!course) return;

    if (course.isfree) {
      // free enrollment
      try {
        const result = await CourseService.enrollstudent(currentUser.uid, course.id);
        if (result.success) {
          setIsEnrolled(true);
          toast.success('تم التسجيل في الكورس successfully!');
        } else {
          toast.error('An error occurred during registration');
        }
      } catch (error) {
        console.error('Error enrolling:', error);
        toast.error('An error occurred during registration');
      }
    } else {
      // Paid enrollment - show payment modal
      setShowPaymentModal(true);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'paypal') {
      setShowPayPalPayment(true);
      return;
    }
    
    if (!paymentData.vodafoneNumber || !paymentData.transactionId) {
      toast.error('Please ملء جميع البيانات المطلوبة');
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
        const enrollmentResult = await CourseService.enrollstudent(
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
          toast.success('تم Submit طلب الدفع! سيتم Confirm paymentة خلال 24 hour');
        } else {
          toast.error('An error occurred during registration');
        }
      } else {
        toast.error('An error occurred while processing payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('An error occurred while processing payment');
    }
  };

  const handlePayPalSuccess = async (result) => {
    try {
      setShowPaymentModal(false);
      setShowPayPalPayment(false);
      setIsEnrolled(true);
      
      // Send notification to instructor
      if (course.instructorId) {
        try {
          const instructorData = { 
            email: course.instructorEmail || 'instructor@example.com',
            displayName: course.instructorName || 'Instructor'
          };
          
          await EmailJSNotificationService.sendCoursePaymentNotification(
            instructorData,
            course,
            currentUser,
            {
              transactionId: result.transactionId,
              amount: course.price,
              paymentMethod: 'paypal'
            }
          );
        } catch (emailError) {
          console.log('Email notification failed, but payment successful');
        }
      }
      
      toast.success('🎉 Payment successful! Welcome to the course');
    } catch (error) {
      console.error('Error handling PayPal success:', error);
      toast.error('تم الدفع لكن An error occurred في التسجيل. Please التواصل مع Support الفني.');
    }
  };

  const handlePayPalError = (error) => {
    console.error('PayPal payment error:', error);
    toast.error('Failure في الدفع عبر PayPal. Please المحاولة مرة أخرى.');
  };

  const getPlaceholderCourse = () => ({
    id: id,
    title: 'Python Programming Basics',
    description: 'كورس شامل لتعلم Programming بلغة Python من الصفر إلى الاحتراف. يغطي الكورس جميع الBasics والمفاهيم الAdvancedة مع Applyات عملية ومشاريع حقيقية.',
    shortDescription: 'تعلم Programming بـ Python من الصفر مع Examples عملية',
    price: 299,
    originalPrice: 399,
    isfree: false,
    instructorName: 'Ahmed Mohamed',
    instructorAvatar: '',
    category: 'programming',
    level: 'beginner',
    duration: 1200, // 20 hours
    lessonsCount: 45,
    studentsCount: 1250,
    rating: 4.8,
    reviewsCount: 89,
    tags: ['Python', 'Programming', 'الBeginnerين'],
    requirements: [
      'لا يتطلب خبرة سابقة في Programming',
      'حاسوب شخصي مع اتصال بالإنترنت',
      'رغبة في التعلم والمMarchة'
    ],
    whatYouWillLearn: [
      'Basics لغة Python',
      'Programming الكائنية',
      'التعامل مع الملفات وقواعد البيانات',
      'بناء Applyات ويب بسيطة',
      'حل المشاكل البرمجية',
      'أفضل المMarchات في Programming'
    ],
    curriculum: {
      section1: {
        title: 'مقدمة في Programming',
        order: 1,
        lessons: {
          lesson1: {
            title: 'ما هي Programming؟',
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
        title: 'الBasics',
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
              العودة إلى Courses
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
            <Link to="/Nexus/courses" className="hover:text-white">Courses</Link>
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
                    <span className="text-gray-300">{course.studentsCount?.toLocaleString()} student</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{Math.floor(course.duration / 60)} hour</span>
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
                    {!course.isfree ? (
                      <div className="text-center">
                        <span className="text-3xl font-bold text-white">{course.price} EGP</span>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <div>
                            <span className="text-gray-500 line-through text-lg">{course.originalPrice} EGP</span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm ml-2">
                              Discount {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-green-400">free</span>
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
                        مFollowة التعلم
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold"
                    >
                      {course.isfree ? 'التسجيل الfree' : 'شراء الكورس'}
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
                    <span className="text-gray-300">Technical support مباشر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">مWatchة على الجوال</span>
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
                <h2 className="text-2xl font-bold text-white mb-4">Course Description</h2>
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
                <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
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
                <h2 className="text-2xl font-bold text-white mb-4">Course Content</h2>
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
                            <span className="text-gray-400 text-sm">{lesson.duration} minute</span>
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
                <h3 className="text-lg font-semibold text-white mb-4">مScienceات الكورس</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level</span>
                    <span className="text-white">{
                      course.level === 'beginner' ? 'Beginner' :
                      course.level === 'intermediate' ? 'Intermediate' : 'Advanced'
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Number of lessons</span>
                    <span className="text-white">{course.lessonsCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">{Math.floor(course.duration / 60)} hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Language</span>
                    <span className="text-white">Arabic</span>
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
                <h3 className="text-lg font-semibold text-white mb-4">Instructor</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{course.instructorName}</p>
                    <p className="text-gray-400 text-sm">مدرب معتمد</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">Instructor متخصص في {course.category === 'programming' ? 'Programming' : course.category} مع years من الخبرة في التدريس.</p>
              </div>

              {/* student Review Submission (only for enrolled students) */}
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
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                إتمام الدفع - {course.price} EGP
              </h2>

              {!showPayPalPayment ? (
                <>
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">اختر طريقة الدفع:</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">PayPal</p>
                            <p className="text-gray-400 text-sm">دفع instant آمن - بطاقات ائتمان دولية</p>
                          </div>
                        </div>
                        <span className="text-green-400 text-xs bg-green-900/20 px-2 py-1 rounded">Recommended</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="vodafone"
                          checked={paymentMethod === 'vodafone'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">VC</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">Vodafone Cash</p>
                            <p className="text-gray-400 text-sm">تحويل عبر Vodafone Cash (يتطلب Review يدوية)</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'paypal' ? (
                    <div className="space-y-4">
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                        <h3 className="text-blue-400 font-semibold mb-2">دفع آمن عبر PayPal:</h3>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• دفع instant وآمن</li>
                          <li>• حماية المشتري</li>
                          <li>• يقبل بطاقات ائتمان دولية</li>
                          <li>• وصول instant للكورس بعد الدفع</li>
                        </ul>
                      </div>

                      <button
                        onClick={() => setShowPayPalPayment(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                      >
                        الدفع عبر PayPal
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-6">
                        <h3 className="text-red-400 font-semibold mb-2">تعليمات Vodafone Cash:</h3>
                        <ol className="text-sm text-gray-300 space-y-1">
                          <li>1. حول {course.price} EGP إلى رقم Vodafone Cash: <strong>01234567890</strong></li>
                          <li>2. اكتب رقم Vodafone Cash الخاص بك أدناه</li>
                          <li>3. اكتب رقم العملية (Transaction ID)</li>
                          <li>4. سيتم Confirm payment خلال 24 hour</li>
                        </ol>
                      </div>

                      <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                          <label className="block text-white font-medium mb-2">رقم Vodafone Cash الخاص بك</label>
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
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors"
                          >
                            Confirm payment
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPaymentModal(false)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* PayPal Payment Section */}
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowPayPalPayment(false)}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      العودة لخيارات الدفع
                    </button>

                    <PayPalPaymentButton
                      courseData={course}
                      userData={currentUser}
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                      className="w-full"
                    />

                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setShowPayPalPayment(false);
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default CourseDetailsPage;