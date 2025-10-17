import React from 'react';
import { Star, Plus } from 'lucide-react';

const InstructorHeader = ({ instructor, user, onCreateCourse }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user?.displayName?.charAt(0) || 'M'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {user?.displayName || 'Instructor'}
            </h1>
            <p className="text-purple-200">
              {instructor?.specialization || 'Instructor at Nexus'}
            </p>
            <div className="flex items-center space-x-2 space-x-reverse mt-1">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white mr-1">
                  {instructor?.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-purple-200">•</span>
              <span className="text-purple-200">
                {instructor?.studentsCount || 0} students
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={onCreateCourse}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 space-x-reverse hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorHeader;