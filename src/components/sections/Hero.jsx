import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const Hero = () => {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const dir = document.documentElement.getAttribute('dir');
    setIsRTL(dir === 'rtl');
  }, []);

  const floatingShapes = Array.from({ length: 6 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute opacity-20"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    >
      <div 
        className={`w-8 h-8 rounded-full bg-gradient-to-r ${
          i % 3 === 0 ? 'from-neon-blue to-neon-purple' :
          i % 3 === 1 ? 'from-neon-purple to-neon-green' :
          'from-neon-green to-neon-blue'
        }`}
      />
    </motion.div>
  ));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-bg via-secondary-bg to-primary-bg">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0">
        {floatingShapes}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-transparent to-neon-purple/10" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full glass mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-neon-blue mr-2" />
            <span className="text-sm text-text-secondary">
              {isRTL ? 'منصة تعليمية حديثة' : 'Modern Educational Platform'}
            </span>
          </motion.div>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
        >
          <span className="gradient-text">
            {isRTL ? 'اكتشف عالم' : 'Discover the World of'}
          </span>
          <br />
          <TypeAnimation
            sequence={[
              isRTL ? 'الفيزياء' : 'Physics',
              2000,
              isRTL ? 'الرياضيات' : 'Mathematics', 
              2000,
              isRTL ? 'العلوم' : 'Science',
              2000,
              isRTL ? 'المعرفة' : 'Knowledge',
              2000,
            ]}
            wrapper="span"
            speed={50}
            className="text-white"
            repeat={Infinity}
          />
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed"
        >
          {isRTL 
            ? 'انضم إلى مجتمع تعليمي متطور مصمم خصيصاً للجيل الجديد. تعلم الفيزياء والرياضيات بطريقة تفاعلية وممتعة مع أحدث التقنيات التعليمية.'
            : 'Join a cutting-edge educational community designed for the new generation. Learn physics and mathematics in an interactive and engaging way with the latest educational technologies.'
          }
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button variant="gradient" size="lg" className="group">
            <span>{isRTL ? 'ابدأ رحلتك التعليمية' : 'Start Your Learning Journey'}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button variant="ghost" size="lg" className="group">
            <Play className="w-5 h-5 mr-2" />
            <span>{isRTL ? 'شاهد الفيديو التعريفي' : 'Watch Demo'}</span>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { 
              number: '10K+', 
              label: isRTL ? 'طالب نشط' : 'Active Students' 
            },
            { 
              number: '50+', 
              label: isRTL ? 'دورة تعليمية' : 'Courses Available' 
            },
            { 
              number: '95%', 
              label: isRTL ? 'معدل النجاح' : 'Success Rate' 
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="glass rounded-lg p-6 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-3xl font-bold gradient-text mb-2">
                {stat.number}
              </div>
              <div className="text-text-secondary">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-glass-border rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-neon-blue rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;