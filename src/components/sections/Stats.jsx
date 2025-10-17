import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useInView as useIntersectionObserver } from 'react-intersection-observer';

const Stats = () => {
  const [counters, setCounters] = useState({
    students: 0,
    courses: 0,
    success: 0,
    awards: 0
  });

  const { ref, inView } = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      const targetValues = {
        students: 10000,
        courses: 50,
        success: 95,
        awards: 25
      };

      const duration = 2000; // 2 seconds
      const steps = 60; // 60 steps for smooth animation
      const stepDuration = duration / steps;

      const intervals = Object.keys(targetValues).map(key => {
        const targetValue = targetValues[key];
        const increment = targetValue / steps;
        let currentValue = 0;

        return setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(intervals.find(interval => interval === this));
          }
          setCounters(prev => ({
            ...prev,
            [key]: Math.floor(currentValue)
          }));
        }, stepDuration);
      });

      return () => {
        intervals.forEach(interval => clearInterval(interval));
      };
    }
  }, [inView]);

  const stats = [
    {
      id: 'students',
      value: counters.students,
      suffix: '+',
      label: 'Registered Students',
      icon: '👥',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'courses',
      value: counters.courses,
      suffix: '+',
      label: 'Available Courses',
      icon: '📚',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'success',
      value: counters.success,
      suffix: '%',
      label: 'Success Rate',
      icon: '🎯',
      color: 'from-green-500 to-blue-600'
    },
    {
      id: 'awards',
      value: counters.awards,
      suffix: '+',
      label: 'Awards Won',
      icon: '🏆',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">
              Our Achievements in Numbers
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            We are proud of our achievements in our educational journey
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="group"
            >
              <div className="glass rounded-xl p-8 text-center h-full border border-glass-border group-hover:border-neon-blue/50 transition-all duration-300">
                {/* Icon */}
                <div className="mb-4">
                  <motion.div
                    className="text-4xl mb-2"
                    animate={{ 
                      rotate: inView ? 360 : 0,
                      scale: inView ? [1, 1.2, 1] : 1
                    }}
                    transition={{ 
                      duration: 1, 
                      delay: index * 0.1,
                      ease: "easeInOut"
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                </div>

                {/* Number */}
                <div className="mb-4">
                  <motion.div
                    className="text-4xl md:text-5xl font-bold mb-2"
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : { scale: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value.toLocaleString()}{stat.suffix}
                    </span>
                  </motion.div>
                </div>

                {/* Label */}
                <div className="text-text-secondary group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1 bg-glass-bg rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={inView ? { width: '100%' } : { width: 0 }}
                    transition={{ 
                      duration: 1.5, 
                      delay: index * 0.2,
                      ease: "easeOut"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="glass rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-text-secondary leading-relaxed">
              Since our launch, we have helped thousands of students achieve their educational and professional goals through high-quality training programs and continuous follow-up.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;