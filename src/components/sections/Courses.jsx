import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Zap, Target } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import CourseService from '../../services/CourseService';
import toast from 'react-hot-toast';

const Courses = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch courses from Firebase
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const result = await CourseService.getCourses({
          status: 'published',
          sortBy: 'popular'
        });
        
        if (result.success && result.courses.length > 0) {
          // Take only first 3 courses for homepage
          const topCourses = result.courses.slice(0, 3).map((course, index) => ({
            id: course.id,
            title: course.title || 'دورة تدريبية',
            description: course.description || 'تعلم مهارات جديدة',
            level: course.level || 'Beginner',
            duration: course.duration || '8 أسابيع',
            students: course.studentsCount || 0,
            rating: course.rating || 4.5,
            price: course.isFree ? 'مجاني' : `$${course.price || 0}`,
            image: getIconForCategory(course.category),
            color: getColorForIndex(index),
            icon: getIconComponentForCategory(course.category)
          }));
          setCourses(topCourses);
        } else {
          // Use fallback courses if no courses in Firebase
          setCourses(getFallbackCourses());
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Use fallback courses on error
        setCourses(getFallbackCourses());
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Helper function to get icon emoji for category
  const getIconForCategory = (category) => {
    const icons = {
      'physics': '🔬',
      'mathematics': '📊',
      'chemistry': '⚗️',
      'programming': '💻',
      'biology': '🧬',
      'default': '📚'
    };
    return icons[category?.toLowerCase()] || icons.default;
  };
  
  // Helper function to get icon component for category
  const getIconComponentForCategory = (category) => {
    const icons = {
      'physics': Zap,
      'mathematics': Target,
      'chemistry': BookOpen,
      'programming': BookOpen,
      'biology': BookOpen,
      'default': BookOpen
    };
    return icons[category?.toLowerCase()] || icons.default;
  };
  
  // Helper function to get color gradient for index
  const getColorForIndex = (index) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-blue-600'
    ];
    return colors[index % colors.length];
  };
  
  // Fallback courses if Firebase is empty
  const getFallbackCourses = () => [
    {
      id: 1,
      title: 'الفيزياء الأساسية',
      description: 'تعلم أساسيات الفيزياء من القوانين البسيطة إلى المفاهيم المتقدمة',
      level: 'Beginner',
      duration: '8 أسابيع',
      students: 1250,
      rating: 4.8,
      price: '$199',
      image: '🔬',
      color: 'from-blue-500 to-purple-600',
      icon: BookOpen
    },
    {
      id: 2,
      title: 'الفيزياء المتقدمة',
      description: 'استكشف المفاهيم المتقدمة في الفيزياء النظرية والتطبيقية',
      level: 'Advanced',
      duration: '12 أسبوع',
      students: 875,
      rating: 4.9,
      price: '$299',
      image: '⚛️',
      color: 'from-purple-500 to-pink-600',
      icon: Zap
    },
    {
      id: 3,
      title: 'الرياضيات التطبيقية',
      description: 'تطبيق الرياضيات لحل مشاكل الفيزياء والهندسة',
      level: 'Intermediate',
      duration: '10 أسابيع',
      students: 950,
      rating: 4.7,
      price: '$249',
      image: '📊',
      color: 'from-green-500 to-blue-600',
      icon: Target
    }
  ];

  const handleEnroll = (courseId, courseTitle) => {
    if (!currentUser) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    // Check if user is already enrolled
    const enrollments = JSON.parse(localStorage.getItem(`enrollments_${currentUser.uid}`) || '[]');
    const isEnrolled = enrollments.some(enrollment => enrollment.courseId === courseId);
    
    if (isEnrolled) {
      toast.success('أنت مسجل في هذا الكورس بالفعل!');
      return;
    }

    // Add enrollment
    const newEnrollment = {
      courseId,
      courseTitle,
      enrolledAt: new Date().toISOString(),
      progress: 0
    };
    
    enrollments.push(newEnrollment);
    localStorage.setItem(`enrollments_${currentUser.uid}`, JSON.stringify(enrollments));
    
    toast.success(`تم التسجيل في ${courseTitle} بنجاح!`);
    
    // Navigate to course details
    setTimeout(() => {
      navigate(`/courses/${courseId}`);
    }, 1000);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="courses" className="py-20 bg-gradient-to-b from-primary-bg to-secondary-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">
              دوراتنا التدريبية
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            اختر من بين مجموعة متنوعة من الدورات المصممة لتناسب جميع المستويات التعليمية
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                variants={cardVariants}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card 
                  className="h-full overflow-hidden border border-glass-border cursor-pointer hover:border-neon-blue/50 transition-colors"
                  onClick={() => handleCourseClick(course.id)}
                >
                  {/* Course Header */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-r ${course.color} opacity-20 rounded-lg`} />
                    <div className="relative z-10 flex items-center justify-between p-4">
                      <div className="text-4xl">{course.image}</div>
                      <div className="p-2 glass rounded-lg">
                        <Icon className="w-6 h-6 text-neon-blue" aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Course Meta */}
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Rating and Level */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                        <span className="text-white font-medium">{course.rating}</span>
                        <span className="text-text-secondary text-sm">
                          ({course.students} students)
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.level === 'Beginner'
                          ? 'bg-green-500/20 text-green-400'
                          : course.level === 'Intermediate'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {course.level}
                      </span>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                      <div className="text-2xl font-bold gradient-text">
                        {course.price}
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="group/btn"
                        aria-label={`Enroll in ${course.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course.id, course.title);
                        }}
                      >
                        <span>Enroll</span>
                        <motion.div
                          className="w-0 group-hover/btn:w-4 overflow-hidden transition-all duration-300"
                        >
                          <BookOpen className="w-4 h-4 ml-1" aria-hidden="true" />
                        </motion.div>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Courses Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button 
            variant="gradient" 
            size="lg"
            onClick={handleViewAllCourses}
            className="hover:scale-105 transition-transform duration-300"
          >
            عرض جميع الدورات
          </Button>
        </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default memo(Courses);