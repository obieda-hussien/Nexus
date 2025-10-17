import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import { BookOpen, Clock, Users, Star, Search, Filter } from 'lucide-react';
import CourseService from '../services/CourseService';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    isfree: '',
    sortBy: 'newest'
  });

  useEffect(() => {
    loadCourses();
  }, [filters]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      let result;
      if (searchTerm) {
        result = await CourseService.searchCourses(searchTerm);
      } else {
        const queryFilters = {
          ...filters,
          isfree: filters.isfree === 'true' ? true : filters.isfree === 'false' ? false : undefined,
          status: 'published' // Only show published courses
        };
        result = await CourseService.getCourses(queryFilters);
      }
      
      if (result.success) {
        setCourses(result.courses);
      } else {
        console.error('Error loading courses:', result.error);
        // Fallback to placeholder data for demo
        setCourses(getPlaceholderCourses());
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses(getPlaceholderCourses());
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadCourses();
  };

  const getPlaceholderCourses = () => [
    {
      id: '1',
      title: 'Python Programming Basics',
      description: 'تعلم Programming from الصفر باستخدام لغة Python with Examples process ومشاريع Applyية',
      shortDescription: 'كورس شامل لتعلم Programming بـ Python للBeginnerين',
      price: 299,
      originalPrice: 399,
      isfree: false,
      thumbnail: '/placeholder-course.jpg',
      instructorName: 'Ahmed Mohamed',
      instructorAvatar: '',
      category: 'programming',
      duration: 120,
      studentsCount: 1250,
      rating: 4.8,
      reviewsCount: 89,
      level: 'beginner',
      status: 'published',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Physics Stage الثانوية',
      description: 'شرح مفصل ومبسط لfromهج Physics للصف الثالث الثانوي with حل الProblems',
      shortDescription: 'fromهج Physics كامل للثانوية الyearة',
      price: 0,
      isfree: true,
      thumbnail: '/placeholder-course.jpg',
      instructorName: 'Dr. Sarah Ahmed',
      instructorAvatar: '',
      category: 'physics',
      duration: 200,
      studentsCount: 3200,
      rating: 4.9,
      reviewsCount: 156,
      level: 'intermediate',
      status: 'published',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'تصميم المواقع بـ HTML & CSS',
      description: 'تعلم تصميم المواقع الRecentة والمتجاوبة باستخدام HTML و CSS',
      shortDescription: 'Basics تصميم المواقع للBeginnerين',
      price: 199,
      originalPrice: 299,
      isfree: false,
      thumbnail: '/placeholder-course.jpg',
      instructorName: 'محمد علي',
      instructorAvatar: '',
      category: 'programming',
      duration: 80,
      studentsCount: 890,
      rating: 4.7,
      reviewsCount: 67,
      level: 'beginner',
      status: 'published',
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              استكشف Courses
            </h1>
            <p className="text-gray-300 text-lg">
              Choose from مجموعة واسعة from Courses in مختلف المجالات
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="اSearch about كورس..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pr-10 pl-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Search
              </button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">جميع المجالات</option>
                <option value="programming">Programming</option>
                <option value="physics">Physics</option>
                <option value="math">Mathematics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
              </select>

              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">جميع المستويات</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={filters.isfree}
                onChange={(e) => setFilters(prev => ({ ...prev, isfree: e.target.value }))}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">free وPaid</option>
                <option value="true">free فقط</option>
                <option value="false">Paid فقط</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to مرتفع</option>
                <option value="price_high">Price: مرتفع to Low</option>
              </select>
            </div>
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
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">لا توجد كورسات</h3>
              <p className="text-gray-500">لم يتم العثور on كورسات تطابق الwithايير المSelectة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 group">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 h-48 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-blue-400" />
                    </div>
                    {course.isfree && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        free
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.shortDescription || course.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-300" />
                      </div>
                      <span className="text-gray-300 text-sm">{course.instructorName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration} minute</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.studentsCount?.toLocaleString()} student</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="price-section">
                        {!course.isfree ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{course.price} EGP</span>
                            {course.originalPrice && course.originalPrice > course.price && (
                              <span className="text-gray-500 line-through">{course.originalPrice}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-green-400">free</span>
                        )}
                      </div>
                      
                      <Link
                        to={`/courses/${course.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        View الDetails
                      </Link>
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