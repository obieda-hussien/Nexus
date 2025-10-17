import React from 'react';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Star,
  TrendingUp,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  Award
} from 'lucide-react';

const OverviewTab = ({ instructorData, courses, students, earnings }) => {
  const stats = {
    totalCourses: courses?.length || 0,
    totalStudents: students?.length || 0,
    totalEarnings: earnings || 0,
    averageRating: instructorData?.rating || 0,
    publishedCourses: courses?.filter(c => c.status === 'published').length || 0,
    pendingCourses: courses?.filter(c => c.status === 'pending').length || 0,
    draftCourses: courses?.filter(c => c.status === 'draft').length || 0,
  };

  const recentStudents = students?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="w-6 h-6" />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Enrolled Students"
          value={stats.totalStudents}
          icon={<Users className="w-6 h-6" />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Total Earnings"
          value={`${stats.totalEarnings} EGP`}
          icon={<DollarSign className="w-6 h-6" />}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Student Rating"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="w-6 h-6" />}
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* Course Status Overview */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Course Status</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <CourseStatusCard
            title="Published Courses"
            count={stats.publishedCourses}
            color="bg-green-500"
          />
          <CourseStatusCard
            title="Pending Review"
            count={stats.pendingCourses}
            color="bg-yellow-500"
          />
          <CourseStatusCard
            title="Drafts"
            count={stats.draftCourses}
            color="bg-gray-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <RecentEnrollments students={recentStudents} />
        <QuickActions />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-purple-200 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`bg-gradient-to-r ${color} p-3 rounded-xl text-white`}>
        {icon}
      </div>
    </div>
  </div>
);

const CourseStatusCard = ({ title, count, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
    <div className={`w-8 h-8 ${color} rounded-full mx-auto mb-3`}></div>
    <h3 className="text-white font-semibold">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{count}</p>
  </div>
);

const RecentEnrollments = ({ students }) => (
  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
    <h3 className="text-xl font-semibold text-white mb-4">Recent Enrollments</h3>
    <div className="space-y-3">
      {students.length > 0 ? (
        students.map((student, index) => (
          <div key={index} className="flex items-center space-x-3 space-x-reverse p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
              {student.userName?.charAt(0) || 'S'}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{student.userName || 'New Student'}</p>
              <p className="text-purple-200 text-sm">{student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('en-US') : 'Today'}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-purple-200 text-center py-4">No recent enrollments</p>
      )}
    </div>
  </div>
);

const QuickActions = () => (
  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
    <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-4">
      <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
        <Video className="h-6 w-6 mx-auto mb-2" />
        <span className="text-sm">Live Session</span>
      </button>
      <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
        <FileText className="h-6 w-6 mx-auto mb-2" />
        <span className="text-sm">New Lesson</span>
      </button>
      <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
        <MessageSquare className="h-6 w-6 mx-auto mb-2" />
        <span className="text-sm">Messages</span>
      </button>
      <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors">
        <Award className="h-6 w-6 mx-auto mb-2" />
        <span className="text-sm">Reports</span>
      </button>
    </div>
  </div>
);

export default OverviewTab;