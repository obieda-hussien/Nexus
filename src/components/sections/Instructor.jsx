import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Users, Star, Globe, Mail, Linkedin, Twitter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Instructor = () => {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const dir = document.documentElement.getAttribute('dir');
    setIsRTL(dir === 'rtl');
  }, []);

  const achievements = [
    {
      icon: Award,
      value: '15+',
      label: isRTL ? 'سنة خبرة' : 'Years Experience',
      color: 'text-yellow-400'
    },
    {
      icon: BookOpen,
      value: '50+',
      label: isRTL ? 'دورة منشورة' : 'Courses Published',
      color: 'text-blue-400'
    },
    {
      icon: Users,
      value: '10K+',
      label: isRTL ? 'طالب مدرب' : 'Students Taught',
      color: 'text-green-400'
    },
    {
      icon: Star,
      value: '4.9',
      label: isRTL ? 'تقييم المدرس' : 'Instructor Rating',
      color: 'text-purple-400'
    }
  ];

  const expertise = [
    isRTL ? 'الفيزياء النظرية' : 'Theoretical Physics',
    isRTL ? 'الفيزياء التطبيقية' : 'Applied Physics',
    isRTL ? 'الرياضيات المتقدمة' : 'Advanced Mathematics',
    isRTL ? 'ميكانيكا الكم' : 'Quantum Mechanics',
    isRTL ? 'النسبية العامة' : 'General Relativity',
    isRTL ? 'الفيزياء الحاسوبية' : 'Computational Physics'
  ];

  const socialLinks = [
    { icon: Mail, href: 'mailto:instructor@nexus.edu', label: 'Email' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Globe, href: '#', label: 'Website' }
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
              {isRTL ? 'تعرف على مدرسك' : 'Meet Your Instructor'}
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {isRTL 
              ? 'تعلم من خبير في مجال الفيزياء والرياضيات مع سنوات من التجربة في التدريس والبحث'
              : 'Learn from an expert in physics and mathematics with years of experience in teaching and research'
            }
          </p>
        </motion.div>

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
                  <div className="w-full h-full rounded-full bg-secondary-bg flex items-center justify-center text-6xl">
                    👨‍🏫
                  </div>
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
                  {isRTL ? 'د. أحمد محمد' : 'Dr. Ahmed Mohamed'}
                </h3>
                <p className="text-neon-blue font-medium mb-2">
                  {isRTL ? 'دكتوراه في الفيزياء النظرية' : 'PhD in Theoretical Physics'}
                </p>
                <p className="text-text-secondary">
                  {isRTL ? 'جامعة القاهرة - مصر' : 'Cairo University - Egypt'}
                </p>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <p className="text-text-secondary leading-relaxed">
                  {isRTL 
                    ? 'خبير في الفيزياء النظرية والتطبيقية مع أكثر من 15 عامًا من الخبرة في التدريس والبحث. حاصل على الدكتوراه من جامعة القاهرة ولديه العديد من الأبحاث المنشورة في المجلات العلمية المحكمة.'
                    : 'Expert in theoretical and applied physics with over 15 years of experience in teaching and research. PhD holder from Cairo University with numerous published research papers in peer-reviewed scientific journals.'
                  }
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
                    >
                      <Icon size={18} />
                    </motion.a>
                  );
                })}
              </div>

              {/* CTA */}
              <Button variant="gradient" className="w-full lg:w-auto">
                {isRTL ? 'تواصل مع المدرس' : 'Contact Instructor'}
              </Button>
            </Card>
          </motion.div>

          {/* Achievements & Expertise */}
          <motion.div variants={itemVariants} className="order-1 lg:order-2 space-y-8">
            {/* Achievements */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                {isRTL ? 'الإنجازات' : 'Achievements'}
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
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${achievement.color}`} />
                      <div className="text-xl font-bold text-white mb-1">
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
                {isRTL ? 'مجالات الخبرة' : 'Areas of Expertise'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expertise.map((skill, index) => (
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
                    "{isRTL 
                      ? 'التعليم ليس مجرد نقل المعلومات، بل إشعال شغف التعلم وإلهام الطلاب لاكتشاف عجائب الكون'
                      : 'Education is not just about transferring information, but igniting the passion for learning and inspiring students to discover the wonders of the universe'
                    }"
                  </p>
                  <p className="text-neon-blue font-medium">
                    {isRTL ? '- د. أحمد محمد' : '- Dr. Ahmed Mohamed'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Instructor;