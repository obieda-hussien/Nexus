import React, { useState, useEffect } from 'react';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import { BookOpen, Clock, Users, Star } from 'lucide-react';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Placeholder courses data - will be replaced with Firebase data
  useEffect(() => {
    const placeholderCourses = [
      {
        id: 1,
        title: 'أساسيات البرمجة بـ Python',
        description: 'تعلم البرمجة من الصفر باستخدام لغة Python',
        price: 299,
        originalPrice: 399,
        isFree: false,
        thumbnail: '/placeholder-course.jpg',
        instructor: 'أحمد محمد',
        category: 'programming',
        duration: 120,
        studentsCount: 1250,
        rating: 4.8,
        level: 'beginner'
      },
      {
        id: 2,
        title: 'فيزياء المرحلة الثانوية',
        description: 'شرح مفصل لمنهج الفيزياء للصف الثالث الثانوي',
        price: 0,
        isFree: true,
        thumbnail: '/placeholder-course.jpg',
        instructor: 'د. سارة أحمد',
        category: 'physics',
        duration: 200,
        studentsCount: 3200,
        rating: 4.9,
        level: 'intermediate'
      }
    ];
    
    setTimeout(() => {
      setCourses(placeholderCourses);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              استكشف الكورسات
            </h1>
            <p className="text-gray-300 text-lg">
              اختر من مجموعة واسعة من الكورسات في مختلف المجالات
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
                  <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-700 h-4 rounded mb-2"></div>
                  <div className="bg-gray-700 h-3 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="bg-gray-700 h-6 w-20 rounded"></div>
                    <div className="bg-gray-700 h-6 w-16 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 group">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 h-48 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-blue-400" />
                    </div>
                    {course.isFree && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        مجاني
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-300" />
                      </div>
                      <span className="text-gray-300 text-sm">{course.instructor}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.studentsCount.toLocaleString()} طالب</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="price-section">
                        {!course.isFree ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{course.price} جنيه</span>
                            {course.originalPrice && (
                              <span className="text-gray-500 line-through">{course.originalPrice}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-green-400">مجاني</span>
                        )}
                      </div>
                      
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CoursesPage;