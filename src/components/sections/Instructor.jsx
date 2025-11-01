import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Users, Star, Globe, Mail, Linkedin, Twitter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InstructorService from '../../services/InstructorService';

const Instructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentInstructorIndex, setCurrentInstructorIndex] = useState(0);
  
  // Fetch instructors from Firebase
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const result = await InstructorService.getAllInstructors();
        
        if (result.success && result.instructors.length > 0) {
          setInstructors(result.instructors);
        } else {
          // Use fallback instructor if no instructors in Firebase
          setInstructors([getFallbackInstructor()]);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
        // Use fallback instructor on error
        setInstructors([getFallbackInstructor()]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstructors();
  }, []);
  
  // Get fallback instructor
  const getFallbackInstructor = () => ({
    uid: 'fallback',
    displayName: 'د. أحمد محمد',
    email: 'instructor@nexus.edu',
    profilePicture: null,
    bio: 'خبير في الفيزياء النظرية والتطبيقية مع أكثر من 15 عامًا من الخبرة في التدريس والبحث. حاصل على درجة الدكتوراه من جامعة القاهرة مع العديد من الأبحاث المنشورة في المجلات العلمية المحكمة.',
    specialization: 'الفيزياء النظرية',
    experience: '15 سنة',
    education: 'دكتوراه في الفيزياء النظرية - جامعة القاهرة',
    socialLinks: {},
    rating: 4.9,
    totalstudents: 10000,
    coursesCount: 50,
    totalReviews: 500
  });
  
  // Get current instructor
  const currentInstructor = instructors[currentInstructorIndex] || getFallbackInstructor();
  
  const achievements = [
    {
      icon: Award,
      value: currentInstructor.experience || '15+',
      label: 'سنوات خبرة',
      color: 'text-yellow-400'
    },
    {
      icon: BookOpen,
      value: `${currentInstructor.coursesCount || 50}+`,
      label: 'دورة منشورة',
      color: 'text-blue-400'
    },
    {
      icon: Users,
      value: `${Math.floor((currentInstructor.totalstudents || 10000) / 1000)}K+`,
      label: 'طالب تم تدريسهم',
      color: 'text-green-400'
    },
    {
      icon: Star,
      value: currentInstructor.rating?.toFixed(1) || '4.9',
      label: 'تقييم المدرب',
      color: 'text-purple-400'
    }
  ];

  const expertise = currentInstructor.specialization 
    ? currentInstructor.specialization.split(',').map(s => s.trim())
    : [
      'الفيزياء النظرية',
      'الفيزياء التطبيقية',
      'الرياضيات المتقدمة',
      'ميكانيكا الكم',
      'النسبية العامة',
      'الفيزياء الحاسوبية'
    ];

  const socialLinks = [
    { 
      icon: Mail, 
      href: `mailto:${currentInstructor.email || 'instructor@nexus.edu'}`, 
      label: 'البريد الإلكتروني' 
    },
    { 
      icon: Linkedin, 
      href: currentInstructor.socialLinks?.linkedin || '#', 
      label: 'LinkedIn profile' 
    },
    { 
      icon: Twitter, 
      href: currentInstructor.socialLinks?.twitter || '#', 
      label: 'Twitter profile' 
    },
    { 
      icon: Globe, 
      href: currentInstructor.socialLinks?.website || '#', 
      label: 'Personal website' 
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="instructor" className="py-20 bg-gradient-to-b from-secondary-bg to-primary-bg">
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
              تعرف على مدربينا
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            تعلم من خبراء في مجالاتهم مع سنوات من الخبرة في التدريس والبحث
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
          {/* Profile Section */}
          <motion.div variants={itemVariants} className="order-2 lg:order-1">
            <Card className="p-8 text-center lg:text-left">
              {/* Profile Image */}
              <div className="relative inline-block mb-6">
                <motion.div
                  className="w-32 h-32 mx-auto lg:mx-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple p-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  {currentInstructor.profilePicture ? (
                    <img 
                      src={currentInstructor.profilePicture} 
                      alt={currentInstructor.displayName}
                      className="w-full h-full rounded-full object-cover bg-secondary-bg"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-secondary-bg flex items-center justify-center text-6xl">
                      👨‍🏫
                    </div>
                  )}
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </motion.div>
              </div>

              {/* Profile Info */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {currentInstructor.displayName || 'مدرب'}
                </h3>
                <p className="text-neon-blue font-medium mb-2">
                  {currentInstructor.education || 'دكتوراه في الفيزياء النظرية'}
                </p>
                <p className="text-text-secondary">
                  {currentInstructor.specialization || 'خبير في الفيزياء والرياضيات'}
                </p>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <p className="text-text-secondary leading-relaxed">
                  {currentInstructor.bio || 'خبير في التدريس والبحث مع سنوات من الخبرة في مجاله.'}
                </p>
              </div>

              {/* Social Links */}
              <div className="flex justify-center lg:justify-start space-x-4 mb-6">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 glass rounded-lg flex items-center justify-center text-text-secondary hover:text-neon-blue transition-colors duration-300"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </motion.a>
                  );
                })}
              </div>

              {/* CTA */}
              <Button 
                variant="gradient" 
                className="w-full lg:w-auto"
                onClick={() => window.location.href = `mailto:${currentInstructor.email || 'instructor@nexus.edu'}`}
              >
                تواصل مع المدرب
              </Button>
            </Card>
          </motion.div>

          {/* Achievements & Expertise */}
          <motion.div variants={itemVariants} className="order-1 lg:order-2 space-y-8">
            {/* Achievements */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                الإنجازات
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={index}
                      className="glass rounded-lg p-4 text-center"
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${achievement.color}`} aria-hidden="true" />
                      <div className="text-xl font-bold text-white mb-1" aria-label={`${achievement.value} ${achievement.label}`}>
                        {achievement.value}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {achievement.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Expertise */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                مجالات الخبرة
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expertise.slice(0, 6).map((skill, index) => (
                  <motion.div
                    key={index}
                    className="glass rounded-lg p-3 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-sm text-white">{skill}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xl">
                  💡
                </div>
                <div className="flex-1">
                  <p className="text-text-secondary italic mb-2">
                    "التعليم ليس مجرد نقل معلومات، بل هو إشعال شغف التعلم وإلهام الطلاب لاكتشاف عجائب الكون"
                  </p>
                  <p className="text-neon-blue font-medium">
                    - {currentInstructor.displayName || 'مدرب'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        )}
        
        {/* Navigation buttons if multiple instructors */}
        {instructors.length > 1 && !loading && (
          <motion.div 
            className="flex justify-center gap-4 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="ghost"
              onClick={() => setCurrentInstructorIndex((prev) => (prev - 1 + instructors.length) % instructors.length)}
              disabled={instructors.length <= 1}
            >
              المدرب السابق
            </Button>
            <span className="flex items-center text-text-secondary">
              {currentInstructorIndex + 1} / {instructors.length}
            </span>
            <Button
              variant="ghost"
              onClick={() => setCurrentInstructorIndex((prev) => (prev + 1) % instructors.length)}
              disabled={instructors.length <= 1}
            >
              المدرب التالي
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default memo(Instructor);