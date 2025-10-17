import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Trophy, Eye, Download, Calendar, Filter } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const QuizAnalytics = ({ courseId, lessonId, quizTitle }) => {
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    uniqueStudents: 0,
    averageScore: 0,
    passingRate: 0,
    averageTime: 0,
    submissions: [],
    questionStats: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!courseId || !lessonId) return;

    const submissionsRef = ref(db, `quiz_submissions/${courseId}/${lessonId}`);
    const analyticsRef = ref(db, `quiz_analytics/${courseId}/${lessonId}`);

    const loadAnalytics = () => {
      // Listen to real-time submissions
      onValue(submissionsRef, (snapshot) => {
        const submissions = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            submissions.push({ id: child.key, ...child.val() });
          });
        }

        // Listen to analytics data
        onValue(analyticsRef, (analyticsSnapshot) => {
          const analyticsData = analyticsSnapshot.val() || {};
          
          // Calculate real-time analytics
          const calculatedAnalytics = calculateAnalytics(submissions, analyticsData);
          setAnalytics(calculatedAnalytics);
          setLoading(false);
        });
      });
    };

    loadAnalytics();

    // Cleanup listeners
    return () => {
      off(submissionsRef);
      off(analyticsRef);
    };
  }, [courseId, lessonId]);

  const calculateAnalytics = (submissions, analyticsData) => {
    if (submissions.length === 0) {
      return {
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        passingRate: 0,
        averageTime: 0,
        submissions: [],
        questionStats: []
      };
    }

    // Filter by timeframe
    const filteredSubmissions = filterByTimeframe(submissions, selectedTimeframe);
    
    const uniqueStudents = new Set(filteredSubmissions.map(s => s.studentId)).size;
    const totalAttempts = filteredSubmissions.length;
    const totalScore = filteredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;
    
    const passingSubmissions = filteredSubmissions.filter(s => s.score >= 70).length;
    const passingRate = totalAttempts > 0 ? Math.round((passingSubmissions / totalAttempts) * 100) : 0;
    
    const totalTime = filteredSubmissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
    const averageTime = totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0;

    // Question-level analytics
    const questionStats = calculateQuestionStats(filteredSubmissions);

    return {
      totalAttempts,
      uniqueStudents,
      averageScore,
      passingRate,
      averageTime,
      submissions: filteredSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
      questionStats
    };
  };

  const filterByTimeframe = (submissions, timeframe) => {
    if (timeframe === 'all') return submissions;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeframe) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      default:
        return submissions;
    }
    
    return submissions.filter(s => new Date(s.submittedAt) >= cutoff);
  };

  const calculateQuestionStats = (submissions) => {
    const questionMap = new Map();
    
    submissions.forEach(submission => {
      if (submission.answers) {
        Object.entries(submission.answers).forEach(([questionId, answer]) => {
          if (!questionMap.has(questionId)) {
            questionMap.set(questionId, {
              questionId,
              totalAttempts: 0,
              correctAttempts: 0,
              answers: {}
            });
          }
          
          const stat = questionMap.get(questionId);
          stat.totalAttempts++;
          
          if (submission.correctAnswers && submission.correctAnswers[questionId]) {
            stat.correctAttempts++;
          }
          
          // Track answer distribution
          const answerKey = typeof answer === 'boolean' ? answer.toString() : answer;
          stat.answers[answerKey] = (stat.answers[answerKey] || 0) + 1;
        });
      }
    });
    
    return Array.from(questionMap.values()).map(stat => ({
      ...stat,
      correctRate: stat.totalAttempts > 0 ? Math.round((stat.correctAttempts / stat.totalAttempts) * 100) : 0
    }));
  };

  const exportData = () => {
    const csvContent = [
      ['Student ID', 'Score', 'Time Spent (min)', 'Submitted At', 'Passed'],
      ...analytics.submissions.map(s => [
        s.studentId,
        s.score,
        Math.round(s.timeSpent / 60),
        new Date(s.submittedAt).toLocaleString('ar-EG'),
        s.score >= 70 ? 'نعم' : 'لا'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `quiz-analytics-${lessonId}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2 space-x-reverse">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Analytics الكويز</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">{quizTitle}</p>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="all">جميع الأوقات</option>
            <option value="today">اليوم</option>
            <option value="week">الأسبوع الماضي</option>
            <option value="month">الشهر الماضي</option>
          </select>
          
          <button
            onClick={exportData}
            className="flex items-center space-x-1 space-x-reverse px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Students المشاركون"
          value={analytics.uniqueStudents}
          color="blue"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Total المحاولات"
          value={analytics.totalAttempts}
          color="green"
        />
        <MetricCard
          icon={<Trophy className="w-6 h-6" />}
          title="Intermediate الدرجات"
          value={`${analytics.averageScore}%`}
          color="yellow"
        />
        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          title="Intermediate الوقت"
          value={`${Math.round(analytics.averageTime / 60)} دقيقة`}
          color="purple"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">معدل النجاح</h4>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="flex-1 bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${analytics.passingRate}%` }}
              />
            </div>
            <span className="text-white font-semibold">{analytics.passingRate}%</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {analytics.submissions.filter(s => s.score >= 70).length} من {analytics.totalAttempts} محاولة
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">توزيع الدرجات</h4>
          <div className="space-y-2">
            {getScoreDistribution(analytics.submissions).map((range, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{range.label}</span>
                <span className="text-white font-medium">{range.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Analytics */}
      {analytics.questionStats.length > 0 && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">إحصائيات الأسئلة</h4>
          <div className="space-y-3">
            {analytics.questionStats.map((stat, index) => (
              <div key={stat.questionId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <span className="text-white font-medium">السؤال {index + 1}</span>
                  <div className="text-gray-400 text-sm">
                    {stat.totalAttempts} محاولة • {stat.correctRate}% إجابات صحيحة
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-16 bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        stat.correctRate >= 70 ? 'bg-green-500' : 
                        stat.correctRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stat.correctRate}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium">{stat.correctRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {analytics.submissions.length > 0 && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">آخر المحاولات</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {analytics.submissions.slice(0, 10).map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <span className="text-white font-medium">Student {submission.studentId}</span>
                  <div className="text-gray-400 text-sm">
                    {new Date(submission.submittedAt).toLocaleDateString('ar-EG')} • 
                    {Math.round(submission.timeSpent / 60)} دقيقة
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    submission.score >= 70 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {submission.score}%
                  </span>
                  {submission.score >= 70 && (
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.totalAttempts === 0 && (
        <div className="text-center py-8 text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">لا توجد محاولات بعد</p>
          <p className="text-sm">سيتم View الAnalytics عندما يبدأ Students في حل الكويز</p>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center space-x-2 space-x-reverse mb-2">
        {icon}
        <h4 className="text-white font-medium text-sm">{title}</h4>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
};

const getScoreDistribution = (submissions) => {
  const ranges = [
    { label: '90-100%', min: 90, max: 100 },
    { label: '80-89%', min: 80, max: 89 },
    { label: '70-79%', min: 70, max: 79 },
    { label: '60-69%', min: 60, max: 69 },
    { label: 'Less than 60%', min: 0, max: 59 }
  ];

  return ranges.map(range => ({
    label: range.label,
    count: submissions.filter(s => s.score >= range.min && s.score <= range.max).length
  }));
};

export default QuizAnalytics;