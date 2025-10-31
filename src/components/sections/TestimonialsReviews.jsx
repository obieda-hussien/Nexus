import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Award, ThumbsUp } from 'lucide-react';

const TestimonialsReviews = () => {
  const testimonials = [
    {
      id: 1,
      name: "Ahmed Mohamed Ali",
      role: "Engineering student - Cairo University",
      avatar: "👨‍🎓",
      rating: 5,
      review: "Amazing platform that helped me understand physics in an easy and simplified way. Clear explanations and practical examples."
    },
    {
      id: 2,
      name: "Fatma Ahmed Hassan",
      role: "Mathematics student - Al-Azhar University",
      avatar: "👩‍🎓",
      rating: 5,
      review: "The best educational platform I've tried. Rich content and excellent interaction with instructors."
    },
    {
      id: 3,
      name: "Mohamed Ashraf Salem",
      role: "Physics Teacher - Ministry of Education",
      avatar: "👨‍🏫",
      rating: 5,
      review: "I use the platform for teaching my students. Great tools and modern teaching methods."
    },
    {
      id: 4,
      name: "Sara Mahmoud Abdullah",
      role: "High School student",
      avatar: "👩‍💼",
      rating: 5,
      review: "The platform helped me prepare for high school exams and I got excellent grades in physics and mathematics."
    },
    {
      id: 5,
      name: "Omar Hossam El-Din",
      role: "Graduate student - Ain Shams University",
      avatar: "👨‍🔬",
      rating: 5,
      review: "The advanced content in theoretical physics is excellent. It helped me a lot with my master's thesis."
    },
    {
      id: 6,
      name: "Nora Salah Fouad",
      role: "Computer Engineer",
      avatar: "👩‍💻",
      rating: 4,
      review: "Excellent platform for learning applied mathematics. I recommend it to all engineers."
    }
  ];

  const achievements = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Best Educational Platform",
      subtitle: "Egypt Education Awards 2024"
    },
    {
      icon: <ThumbsUp className="w-8 h-8" />,
      title: "98% Student Satisfaction",
      subtitle: "Based on 10,000+ reviews"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "5-Star Rating",
      subtitle: "Top-rated in Egypt"
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            <span className="block">What Our Students Say</span>
            {/* Removed Arabic subtitle */}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real feedback from thousands of successful students across Egypt
          </p>
          {/* Removed Arabic paragraph */}
        </motion.div>

        {/* Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="glass-card p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20">
                <div className="text-purple-400 mb-4 flex justify-center">
                  {achievement.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {achievement.title}
                </h3>
                {/* Removed Arabic title */}
                <p className="text-gray-400 text-sm">
                  {achievement.subtitle}
                </p>
                {/* Removed Arabic subtitle */}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card h-full p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                {/* Quote Icon */}
                <div className="text-purple-400 mb-4">
                  <Quote className="w-6 h-6" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                    {testimonial.review}
                  </p>
                  {/* Removed English review (now primary) */}
                </div>

                {/* User Info */}
                <div className="flex items-center">
                  <div className="text-2xl mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {testimonial.role}
                    </p>
                    {/* Removed English role (now primary) */}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="glass-card p-8 rounded-2xl backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join 10,000+ Successful Students
            </h3>
            <p className="text-lg text-purple-300 mb-6">
              Join over 10,000 successful students
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Start Your Success Story
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsReviews;