import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Calendar, Clock, BookOpen, Award, Video, MessageCircle } from 'lucide-react';

const LiveSessions = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  const upcomingSessions = [
    {
      id: 1,
      title: "Advanced Quantum Mechanics",
      titleAr: "ميكانيكا الكم المتقدمة",
      instructor: "Dr. Ahmed Mohamed",
      instructorAr: "د. أحمد محمد",
      date: "December 28, 2024",
      dateAr: "٢٨ ديسمبر ٢٠٢٤",
      time: "8:00 PM EET",
      timeAr: "٨:٠٠ مساءً بتوقيت القاهرة",
      duration: "2 hours",
      durationAr: "ساعتان",
      participants: 156,
      level: "Advanced",
      levelAr: "متقدم",
      description: "Deep dive into quantum superposition and entanglement",
      descriptionAr: "غوص عميق في التراكب الكمي والتشابك الكمي",
      isLive: false,
      category: "Physics"
    },
    {
      id: 2,
      title: "Calculus Problem Solving",
      titleAr: "حل مسائل التفاضل والتكامل",
      instructor: "Prof. Sara Ahmed",
      instructorAr: "أ.د. سارة أحمد",
      date: "December 29, 2024",
      dateAr: "٢٩ ديسمبر ٢٠٢٤",
      time: "6:00 PM EET",
      timeAr: "٦:٠٠ مساءً بتوقيت القاهرة",
      duration: "1.5 hours",
      durationAr: "ساعة ونصف",
      participants: 234,
      level: "Intermediate",
      levelAr: "متوسط",
      description: "Master complex calculus problems step by step",
      descriptionAr: "إتقان مسائل التفاضل والتكامل المعقدة خطوة بخطوة",
      isLive: true,
      category: "Mathematics"
    },
    {
      id: 3,
      title: "Organic Chemistry Lab",
      titleAr: "مختبر الكيمياء العضوية",
      instructor: "Dr. Mohamed Hassan",
      instructorAr: "د. محمد حسن",
      date: "December 30, 2024",
      dateAr: "٣٠ ديسمبر ٢٠٢٤",
      time: "7:00 PM EET",
      timeAr: "٧:٠٠ مساءً بتوقيت القاهرة",
      duration: "2.5 hours",
      durationAr: "ساعتان ونصف",
      participants: 89,
      level: "Beginner",
      levelAr: "مبتدئ",
      description: "Virtual lab session with interactive experiments",
      descriptionAr: "جلسة مختبر افتراضي مع تجارب تفاعلية",
      isLive: false,
      category: "Chemistry"
    }
  ];

  const liveFeatures = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "HD Video Streaming",
      titleAr: "بث فيديو عالي الدقة",
      description: "Crystal clear 1080p streaming"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Interactive Chat",
      titleAr: "دردشة تفاعلية",
      description: "Real-time Q&A with instructors"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Digital Whiteboard",
      titleAr: "السبورة الرقمية",
      description: "Collaborative problem solving"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Live Certificates",
      titleAr: "شهادات فورية",
      description: "Instant participation certificates"
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
            انضم إلى جلسات مباشرة مع مدرسين خبراء وتواصل مع طلاب من جميع أنحاء العالم
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
                <p className="text-blue-300 text-sm mb-2">
                  {feature.titleAr}
                </p>
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
            Upcoming Sessions | الجلسات القادمة
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
                      {session.level} | {session.levelAr}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2">
                    {session.title}
                  </h4>
                  <p className="text-lg text-blue-300 mb-4">
                    {session.titleAr}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <div>
                        <span className="block text-sm">{session.date}</span>
                        <span className="block text-xs text-gray-400">{session.dateAr}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <div>
                        <span className="block text-sm">{session.time}</span>
                        <span className="block text-xs text-gray-400">{session.timeAr}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{session.participants} participants</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 text-sm mb-1">{session.description}</p>
                    <p className="text-gray-400 text-xs">{session.descriptionAr}</p>
                  </div>

                  <div className="text-gray-400 text-sm">
                    <span className="font-semibold">Instructor:</span> {session.instructor}
                    <span className="mx-2">|</span>
                    <span>{session.instructorAr}</span>
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
              لا تفوت أي جلسة مباشرة
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
                View Schedule | عرض الجدول
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveSessions;