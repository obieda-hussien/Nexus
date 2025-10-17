import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const Hero = () => {

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
            <Sparkles className="w-4 h-4 text-neon-blue mr-2" aria-hidden="true" />
            <span className="text-sm text-text-secondary">
              Open Course Marketplace & Teaching Platform
            </span>
          </motion.div>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
        >
          <span className="gradient-text">
            Teach & Earn with
          </span>
          <br />
          <TypeAnimation
            sequence={[
              'Physics',
              2000,
              'Mathematics', 
              2000,
              'Chemistry',
              2000,
              'Any Subject',
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
          Create and publish courses on any subject. Perfect for high school teachers, university professors, and online tutors. Build your teaching business with built-in payment processing and student management.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button variant="gradient" size="lg" className="group">
            <span>Start Teaching Today</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg" 
            className="group"
            aria-label="Browse available courses"
          >
            <Play className="w-5 h-5 mr-2" aria-hidden="true" />
            <span>Browse Courses</span>
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
              label: 'Active students' 
            },
            { 
              number: '500+', 
              label: 'Instructors Teaching' 
            },
            { 
              number: '95%', 
              label: 'Satisfaction Rate' 
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