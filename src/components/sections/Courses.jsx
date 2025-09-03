import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Star, BookOpen, Zap, Target } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Courses = () => {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const dir = document.documentElement.getAttribute('dir');
    setIsRTL(dir === 'rtl');
  }, []);

  const courses = [
    {
      id: 1,
      title: isRTL ? 'الفيزياء الأساسية' : 'Basic Physics',
      description: isRTL 
        ? 'تعلم أساسيات الفيزياء من القوانين البسيطة إلى المفاهيم المتقدمة'
        : 'Learn physics fundamentals from simple laws to advanced concepts',
      level: isRTL ? 'مبتدئ' : 'Beginner',
      duration: isRTL ? '8 أسابيع' : '8 weeks',
      students: 1250,
      rating: 4.8,
      price: isRTL ? '199 ريال' : '$199',
      image: '🔬',
      color: 'from-blue-500 to-purple-600',
      icon: BookOpen
    },
    {
      id: 2,
      title: isRTL ? 'الفيزياء المتقدمة' : 'Advanced Physics',
      description: isRTL 
        ? 'استكشف المفاهيم المتقدمة في الفيزياء النظرية والتطبيقية'
        : 'Explore advanced concepts in theoretical and applied physics',
      level: isRTL ? 'متقدم' : 'Advanced',
      duration: isRTL ? '12 أسبوع' : '12 weeks',
      students: 875,
      rating: 4.9,
      price: isRTL ? '299 ريال' : '$299',
      image: '⚛️',
      color: 'from-purple-500 to-pink-600',
      icon: Zap
    },
    {
      id: 3,
      title: isRTL ? 'الرياضيات التطبيقية' : 'Applied Mathematics',
      description: isRTL 
        ? 'طبق الرياضيات في حل المسائل الفيزيائية والهندسية'
        : 'Apply mathematics to solve physics and engineering problems',
      level: isRTL ? 'متوسط' : 'Intermediate',
      duration: isRTL ? '10 أسابيع' : '10 weeks',
      students: 950,
      rating: 4.7,
      price: isRTL ? '249 ريال' : '$249',
      image: '📊',
      color: 'from-green-500 to-blue-600',
      icon: Target
    }
  ];

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
              {isRTL ? 'دوراتنا التعليمية' : 'Our Courses'}
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {isRTL 
              ? 'اختر من مجموعة متنوعة من الدورات المصممة لتناسب جميع المستويات التعليمية'
              : 'Choose from a variety of courses designed to suit all educational levels'
            }
          </p>
        </motion.div>

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
                <Card className="h-full overflow-hidden border border-glass-border">
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
                          ({course.students} {isRTL ? 'طالب' : 'students'})
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.level === 'Beginner' || course.level === 'مبتدئ' 
                          ? 'bg-green-500/20 text-green-400'
                          : course.level === 'Intermediate' || course.level === 'متوسط'
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
                        aria-label={`${isRTL ? 'سجل في دورة' : 'Enroll in'} ${course.title}`}
                      >
                        <span>{isRTL ? 'التسجيل' : 'Enroll'}</span>
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
          <Button variant="gradient" size="lg">
            {isRTL ? 'عرض جميع الدورات' : 'View All Courses'}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Courses;