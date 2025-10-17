import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Trophy, Target, Clock, CheckCircle } from 'lucide-react';

const CompetitiveAdvantages = () => {
  const advantages = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "AI-Powered Learning",
      description: "Personalized learning paths adapted to your pace and style"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Interactive Community",
      description: "Connect with students and instructors in real-time"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Comprehensive Content",
      description: "From basic concepts to advanced research topics"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Certified Achievements",
      description: "Internationally recognized certificates"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Availability",
      description: "Learn anytime, anywhere, at your own pace"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Content reviewed by academic experts"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose Nexus?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover what makes us the leading educational platform
          </p>
        </motion.div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card h-full p-8 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="text-blue-400 mb-6 group-hover:text-blue-300 transition-colors duration-300">
                  {advantage.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {advantage.title}
                </h3>
                <p className="text-gray-300">
                  {advantage.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="glass-card p-8 rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Learning Journey?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                View Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompetitiveAdvantages;