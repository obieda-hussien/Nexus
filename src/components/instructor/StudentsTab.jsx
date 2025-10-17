import React, { useState } from 'react';
import { Search, Filter, Users, BookOpen, MessageCircle, Award } from 'lucide-react';

const StudentsTab = ({ students, courses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredStudents = students
    ?.filter(student => {
      const matchesSearch = student.userName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = selectedCourse === 'all' || student.courseId === selectedCourse;
      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.enrolledAt) - new Date(a.enrolledAt);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'name':
          return (a.userName || '').localeCompare(b.userName || '');
        default:
          return 0;
      }
    }) || [];

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCourseName = (courseId) => {
    const course = courses?.find(c => c.id === courseId);
    return course?.title || 'Undefined Course';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Students Management</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for a student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-4 pr-12 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            />
          </div>
          
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Courses</option>
            {courses?.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="recent">Most Recent</option>
            <option value="progress">Progress</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{students?.length || 0}</p>
            <p className="text-purple-200">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {students?.filter(s => (s.progress || 0) > 0).length || 0}
            </p>
            <p className="text-purple-200">Active Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {students?.filter(s => (s.progress || 0) === 100).length || 0}
            </p>
            <p className="text-purple-200">Completed Course</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {students?.reduce((avg, s) => avg + (s.progress || 0), 0) / Math.max(students?.length || 1, 1) || 0}%
            </p>
            <p className="text-purple-200">Average Progress</p>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <StudentCard
              key={student.id || index}
              student={student}
              courseName={getCourseName(student.courseId)}
              getProgressColor={getProgressColor}
            />
          ))
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
            <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">No students</p>
            <p className="text-purple-200">No students have enrolled in your courses yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentCard = ({ student, courseName, getProgressColor }) => {
  const progress = student.progress || 0;
  const enrolledDate = student.enrolledAt 
    ? new Date(student.enrolledAt).toLocaleDateString('en-US')
    : 'Undefined';

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Student Avatar */}
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {student.userName?.charAt(0) || 'S'}
          </div>
          
          {/* Student Info */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              {student.userName || 'New Student'}
            </h3>
            <p className="text-purple-200 text-sm">{courseName}</p>
            <p className="text-gray-400 text-xs">Enrollment Date: {enrolledDate}</p>
          </div>
        </div>

        {/* Progress and Actions */}
        <div className="flex items-center space-x-6 space-x-reverse">
          {/* Progress */}
          <div className="text-center min-w-20">
            <div className={`text-2xl font-bold ${getProgressColor(progress)}`}>
              {progress}%
            </div>
            <div className="w-20 bg-gray-600 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${
                  progress >= 80 ? 'bg-green-400' : 
                  progress >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Progress</p>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2 space-x-reverse">
            <button
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              title="Send Message"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
              title="View Details"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              title="Achievements"
            >
              <Award className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Student Stats */}
      {student.timeSpent && (
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-sm text-gray-400">Time Spent</p>
            <p className="text-white font-medium">{Math.round(student.timeSpent / 60)} minutes</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Last Activity</p>
            <p className="text-white font-medium">
              {student.lastActive 
                ? new Date(student.lastActive).toLocaleDateString('en-US')
                : 'Undefined'
              }
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Completed Lessons</p>
            <p className="text-white font-medium">{student.completedLessons || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;