import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Calendar, Clock, BookOpen, Award, Video, MessageCircle } from 'lucide-react';

const LiveSessions = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  const upcomingSessions = [
    {
      id: 1,
      title: "Advanced Quantum Mechanics",
      instructor: "Dr. Ahmed Mohamed",
      date: "December 28, 2024",
      time: "8:00 PM EET",
      duration: "2 hours",
      participants: 156,
      level: "Advanced",
      description: "Deep dive into quantum superposition and entanglement",
      isLive: false,
      category: "Physics"
    },
    {
      id: 2,
      title: "Calculus Problem Solving",
      instructor: "Prof. Sara Ahmed",
      date: "December 29, 2024",
      time: "6:00 PM EET",
      duration: "1.5 hours",
      participants: 234,
      level: "Intermediate",
      description: "Master complex calculus problems step by step",
      isLive: true,
      category: "Mathematics"
    },
    {
      id: 3,
      title: "Organic Chemistry Lab",
      instructor: "Dr. Mohamed Hassan",
      date: "December 30, 2024",
      time: "7:00 PM EET",
      duration: "2.5 hours",
      participants: 89,
      level: "Beginner",
      description: "Virtual lab session with interactive experiments",
      isLive: false,
      category: "Chemistry"
    }
  ];

  const liveFeatures = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "HD Video Streaming",
      description: "Crystal clear 1080p streaming"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Interactive Chat",
      description: "Real-time Q&A with instructors"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Digital Whiteboard",
      description: "Collaborative problem solving"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Live Certificates",
      description: "instant participation certificates"
    }
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Physics':
        return 'bg-blue-500/20 text-blue-300';
      case 'Mathematics':
        return 'bg-purple-500/20 text-purple-300';
      case 'Chemistry':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-red-400 font-semibold">LIVE SESSIONS</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            <span className="block">Interactive Live Classes</span>
            <span className="block text-2xl text-blue-300 mt-2">فصول مباشرة تفاعلية</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join live sessions with expert instructors and connect with students worldwide
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mt-2">
            انضم to جلسات مباشرة with Instructorين خبراء وتواصل with طلاب from جميع أنحاء العالم
          </p>
        </motion.div>

        {/* Live Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {liveFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="glass-card p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-blue-400 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Sessions */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Upcoming Live Sessions
          </h3>
          
          {upcomingSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    {session.isLive && (
                      <div className="flex items-center mr-4">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-red-400 text-sm font-semibold">LIVE NOW</span>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(session.category)}`}>
                      {session.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ml-2 ${getLevelColor(session.level)}`}>
                      {session.level}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2">
                    {session.title}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{session.date}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{session.time}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{session.participants} participants</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">{session.description}</p>
                  </div>

                  <div className="text-gray-400 text-sm">
                    <span className="font-semibold">Instructor:</span> {session.instructor}
                    <span className="mx-2">|</span>
                    <span>{session.duration} ({session.durationAr})</span>
                  </div>
                </div>

                <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col sm:flex-row lg:flex-col gap-3">
                  {session.isLive ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Join Live
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      Register
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
                    onClick={() => setSelectedSession(session.id)}
                  >
                    Details
                  </motion.button>
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
          <div className="glass-card p-8 rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Never Miss a Live Session
            </h3>
            <p className="text-lg text-blue-300 mb-6">
              لا تفوت any جلسة مباشرة
            </p>
            <p className="text-gray-300 mb-6">
              Get notified about upcoming live sessions and join the interactive learning experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Enable Notifications
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                View Schedule | View الجدول
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveSessions;