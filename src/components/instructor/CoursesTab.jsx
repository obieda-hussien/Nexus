import React, { useState } from 'react';
import { Edit3, Eye, Trash2, Users, Star, DollarSign, MoreVertical } from 'lucide-react';

const CoursesTab = ({ courses, onEditCourse, onDeleteCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredCourses = courses
    ?.filter(course => {
      const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'students':
          return b.studentsCount - a.studentsCount;
        case 'rating':
          return b.rating - a.rating;
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        default:
          return 0;
      }
    }) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-500 text-green-100';
      case 'pending':
        return 'bg-yellow-500 text-yellow-100';
      case 'draft':
        return 'bg-gray-500 text-gray-100';
      default:
        return 'bg-gray-500 text-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published':
        return 'منشور';
      case 'pending':
        return 'في المراجعة';
      case 'draft':
        return 'مسودة';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">إدارة الكورسات</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="البحث عن كورس..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">جميع الحالات</option>
            <option value="published">منشور</option>
            <option value="pending">في المراجعة</option>
            <option value="draft">مسودة</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="recent">الأحدث</option>
            <option value="students">عدد الطلاب</option>
            <option value="rating">التقييم</option>
            <option value="revenue">الإيرادات</option>
          </select>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{courses?.length || 0}</p>
            <p className="text-purple-200">إجمالي الكورسات</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {courses?.filter(c => c.status === 'published').length || 0}
            </p>
            <p className="text-purple-200">كورسات منشورة</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {courses?.reduce((total, course) => total + (course.studentsCount || 0), 0) || 0}
            </p>
            <p className="text-purple-200">إجمالي الطلاب</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {courses?.reduce((total, course) => total + (course.totalRevenue || 0), 0).toLocaleString() || 0} ج.م
            </p>
            <p className="text-purple-200">إجمالي الإيرادات</p>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => onEditCourse(course)}
              onDelete={() => onDeleteCourse(course.id)}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          ))
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
            <div className="text-purple-300 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-white text-xl mb-2">لا توجد كورسات</p>
            <p className="text-purple-200">ابدأ بإنشاء أول كورس لك</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course, onEdit, onDelete, getStatusColor, getStatusText }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 space-x-reverse mb-2">
            <h3 className="text-xl font-semibold text-white">{course.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
              {getStatusText(course.status)}
            </span>
          </div>
          <p className="text-purple-200 text-sm line-clamp-2">{course.shortDescription || course.description}</p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-purple-200 hover:text-white p-2"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full text-right px-4 py-2 text-white hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
              >
                <Edit3 className="w-4 h-4" />
                <span>تعديل</span>
              </button>
              <button
                onClick={() => {
                  // View course logic here
                  setShowMenu(false);
                }}
                className="w-full text-right px-4 py-2 text-white hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة</span>
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full text-right px-4 py-2 text-red-400 hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
          <Users className="w-4 h-4" />
          <span className="text-sm">{course.studentsCount || 0} طالب</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm">{course.rating?.toFixed(1) || '0.0'}</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse text-green-400">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm">{course.totalRevenue?.toLocaleString() || 0} ج.م</span>
        </div>
        <div className="text-gray-400 text-sm">
          آخر تحديث: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('ar-EG') : 'غير محدد'}
        </div>
      </div>

      {/* Progress Bar (if applicable) */}
      {course.progress !== undefined && (
        <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default CoursesTab;