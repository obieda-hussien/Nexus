import { ref, push, set, get, update, remove, onValue, off } from 'firebase/database';
import { db } from '../config/firebase';

/**
 * Quiz Service for Firebase Realtime Database operations
 * Handles quiz submissions, analytics, and real-time data management
 */
export class QuizService {
  
  /**
   * Submit a quiz attempt
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID containing the quiz
   * @param {object} submissionData - Quiz submission data
   * @returns {Promise<string>} - Submission ID
   */
  static async submitQuiz(courseId, lessonId, submissionData) {
    try {
      const submissionRef = await push(
        ref(db, `quiz_submissions/${courseId}/${lessonId}`),
        {
          ...submissionData,
          submittedAt: new Date().toISOString()
        }
      );
      
      // Update user analytics
      await this.updateUserAnalytics(courseId, lessonId, submissionData.studentId, {
        submissionId: submissionRef.key,
        score: submissionData.score,
        timeSpent: submissionData.timeSpent,
        passed: submissionData.score >= 70 // Default passing score
      });
      
      return submissionRef.key;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  /**
   * Update user analytics for a quiz
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @param {string} userId - User ID
   * @param {object} attemptData - Attempt data
   */
  static async updateUserAnalytics(courseId, lessonId, userId, attemptData) {
    try {
      const analyticsRef = ref(db, `quiz_analytics/${courseId}/${lessonId}/${userId}`);
      const snapshot = await get(analyticsRef);
      
      const existingData = snapshot.val() || {};
      const attempts = existingData.attempts || [];
      
      const newAttempt = {
        ...attemptData,
        submittedAt: new Date().toISOString()
      };
      
      const updatedAttempts = [...attempts, newAttempt];
      
      const analytics = {
        attempts: updatedAttempts,
        totalAttempts: updatedAttempts.length,
        bestScore: Math.max(existingData.bestScore || 0, attemptData.score),
        averageScore: Math.round(
          updatedAttempts.reduce((sum, a) => sum + a.score, 0) / updatedAttempts.length
        ),
        passed: attemptData.passed || existingData.passed || false,
        lastAttemptAt: new Date().toISOString(),
        totalTimeSpent: (existingData.totalTimeSpent || 0) + attemptData.timeSpent
      };
      
      await set(analyticsRef, analytics);
    } catch (error) {
      console.error('Error updating user analytics:', error);
      throw error;
    }
  }

  /**
   * Get quiz analytics for an instructor
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<object>} - Analytics data
   */
  static async getQuizAnalytics(courseId, lessonId) {
    try {
      const [submissionsSnapshot, analyticsSnapshot] = await Promise.all([
        get(ref(db, `quiz_submissions/${courseId}/${lessonId}`)),
        get(ref(db, `quiz_analytics/${courseId}/${lessonId}`))
      ]);

      const submissions = [];
      if (submissionsSnapshot.exists()) {
        submissionsSnapshot.forEach(child => {
          submissions.push({ id: child.key, ...child.val() });
        });
      }

      const userAnalytics = analyticsSnapshot.val() || {};

      return this.calculateInstructorAnalytics(submissions, userAnalytics);
    } catch (error) {
      console.error('Error getting quiz analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive analytics for instructors
   * @param {Array} submissions - All submissions
   * @param {object} userAnalytics - User-specific analytics
   * @returns {object} - Calculated analytics
   */
  static calculateInstructorAnalytics(submissions, userAnalytics) {
    if (submissions.length === 0) {
      return {
        totalAttempts: 0,
        uniqueStudents: 0,
        averageScore: 0,
        passingRate: 0,
        averageTime: 0,
        submissions: [],
        questionStats: [],
        timeDistribution: {},
        scoreDistribution: {},
        completionRate: 0
      };
    }

    const uniqueStudents = new Set(submissions.map(s => s.studentId)).size;
    const totalAttempts = submissions.length;
    const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
    const averageScore = Math.round(totalScore / totalAttempts);
    
    const passingSubmissions = submissions.filter(s => s.score >= 70).length;
    const passingRate = Math.round((passingSubmissions / totalAttempts) * 100);
    
    const totalTime = submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
    const averageTime = Math.round(totalTime / totalAttempts);

    // Question-level analytics
    const questionStats = this.calculateQuestionStats(submissions);
    
    // Time distribution
    const timeDistribution = this.calculateTimeDistribution(submissions);
    
    // Score distribution
    const scoreDistribution = this.calculateScoreDistribution(submissions);

    return {
      totalAttempts,
      uniqueStudents,
      averageScore,
      passingRate,
      averageTime,
      submissions: submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
      questionStats,
      timeDistribution,
      scoreDistribution,
      completionRate: Math.round((uniqueStudents / Math.max(uniqueStudents, 1)) * 100)
    };
  }

  /**
   * Calculate question-level statistics
   * @param {Array} submissions - All submissions
   * @returns {Array} - Question statistics
   */
  static calculateQuestionStats(submissions) {
    const questionMap = new Map();
    
    submissions.forEach(submission => {
      if (submission.answers && submission.correctAnswers) {
        Object.entries(submission.answers).forEach(([questionId, answer]) => {
          if (!questionMap.has(questionId)) {
            questionMap.set(questionId, {
              questionId,
              totalAttempts: 0,
              correctAttempts: 0,
              answers: new Map()
            });
          }
          
          const stat = questionMap.get(questionId);
          stat.totalAttempts++;
          
          if (submission.correctAnswers[questionId]) {
            stat.correctAttempts++;
          }
          
          // Track answer distribution
          const answerKey = typeof answer === 'boolean' ? answer.toString() : answer;
          stat.answers.set(answerKey, (stat.answers.get(answerKey) || 0) + 1);
        });
      }
    });
    
    return Array.from(questionMap.values()).map(stat => ({
      ...stat,
      correctRate: stat.totalAttempts > 0 ? Math.round((stat.correctAttempts / stat.totalAttempts) * 100) : 0,
      answers: Object.fromEntries(stat.answers)
    }));
  }

  /**
   * Calculate time distribution for submissions
   * @param {Array} submissions - All submissions
   * @returns {object} - Time distribution
   */
  static calculateTimeDistribution(submissions) {
    const ranges = [
      { label: 'أقل من 5 دقائق', min: 0, max: 300 },
      { label: '5-10 دقائق', min: 300, max: 600 },
      { label: '10-20 دقائق', min: 600, max: 1200 },
      { label: '20-30 دقائق', min: 1200, max: 1800 },
      { label: 'أكثر من 30 دقيقة', min: 1800, max: Infinity }
    ];

    return ranges.reduce((acc, range) => {
      acc[range.label] = submissions.filter(s => 
        s.timeSpent >= range.min && s.timeSpent < range.max
      ).length;
      return acc;
    }, {});
  }

  /**
   * Calculate score distribution for submissions
   * @param {Array} submissions - All submissions
   * @returns {object} - Score distribution
   */
  static calculateScoreDistribution(submissions) {
    const ranges = [
      { label: '90-100%', min: 90, max: 100 },
      { label: '80-89%', min: 80, max: 89 },
      { label: '70-79%', min: 70, max: 79 },
      { label: '60-69%', min: 60, max: 69 },
      { label: 'أقل من 60%', min: 0, max: 59 }
    ];

    return ranges.reduce((acc, range) => {
      acc[range.label] = submissions.filter(s => 
        s.score >= range.min && s.score <= range.max
      ).length;
      return acc;
    }, {});
  }

  /**
   * Get user's quiz progress
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} - User progress data
   */
  static async getUserProgress(courseId, lessonId, userId) {
    try {
      const analyticsRef = ref(db, `quiz_analytics/${courseId}/${lessonId}/${userId}`);
      const snapshot = await get(analyticsRef);
      
      return snapshot.val() || {
        attempts: [],
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
        passed: false,
        totalTimeSpent: 0
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time quiz analytics updates
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} - Unsubscribe function
   */
  static subscribeToAnalytics(courseId, lessonId, callback) {
    const submissionsRef = ref(db, `quiz_submissions/${courseId}/${lessonId}`);
    
    const unsubscribe = onValue(submissionsRef, async (snapshot) => {
      try {
        const submissions = [];
        if (snapshot.exists()) {
          snapshot.forEach(child => {
            submissions.push({ id: child.key, ...child.val() });
          });
        }

        const analyticsSnapshot = await get(ref(db, `quiz_analytics/${courseId}/${lessonId}`));
        const userAnalytics = analyticsSnapshot.val() || {};
        
        const analytics = this.calculateInstructorAnalytics(submissions, userAnalytics);
        callback(analytics);
      } catch (error) {
        console.error('Error in analytics subscription:', error);
      }
    });

    return () => off(submissionsRef, 'value', unsubscribe);
  }

  /**
   * Export quiz analytics data
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @param {string} format - Export format ('csv' or 'json')
   * @returns {Promise<string>} - Exported data
   */
  static async exportAnalytics(courseId, lessonId, format = 'csv') {
    try {
      const analytics = await this.getQuizAnalytics(courseId, lessonId);
      
      if (format === 'csv') {
        return this.exportToCSV(analytics);
      } else if (format === 'json') {
        return JSON.stringify(analytics, null, 2);
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  /**
   * Convert analytics data to CSV format
   * @param {object} analytics - Analytics data
   * @returns {string} - CSV data
   */
  static exportToCSV(analytics) {
    const headers = [
      'Student ID',
      'Submission ID', 
      'Score (%)',
      'Time Spent (seconds)',
      'Time Spent (minutes)',
      'Submitted At',
      'Passed',
      'Questions Answered',
      'Max Score'
    ];
    
    const rows = analytics.submissions.map(submission => [
      submission.studentId || 'Unknown',
      submission.id || '',
      submission.score || 0,
      submission.timeSpent || 0,
      Math.round((submission.timeSpent || 0) / 60),
      submission.submittedAt || '',
      submission.score >= 70 ? 'Yes' : 'No',
      Object.keys(submission.answers || {}).length,
      submission.maxScore || 0
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
      
    return csvContent;
  }

  /**
   * Get quiz leaderboard
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @param {number} limit - Number of top entries to return
   * @returns {Promise<Array>} - Leaderboard data
   */
  static async getLeaderboard(courseId, lessonId, limit = 10) {
    try {
      const analyticsSnapshot = await get(ref(db, `quiz_analytics/${courseId}/${lessonId}`));
      
      if (!analyticsSnapshot.exists()) {
        return [];
      }
      
      const userAnalytics = analyticsSnapshot.val();
      
      const leaderboard = Object.entries(userAnalytics)
        .map(([userId, data]) => ({
          userId,
          bestScore: data.bestScore || 0,
          totalAttempts: data.totalAttempts || 0,
          averageScore: data.averageScore || 0,
          passed: data.passed || false,
          lastAttemptAt: data.lastAttemptAt
        }))
        .sort((a, b) => {
          // Sort by best score, then by fewer attempts, then by latest attempt
          if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
          if (a.totalAttempts !== b.totalAttempts) return a.totalAttempts - b.totalAttempts;
          return new Date(b.lastAttemptAt) - new Date(a.lastAttemptAt);
        })
        .slice(0, limit);
        
      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Delete quiz submission and related analytics
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @param {string} submissionId - Submission ID
   * @param {string} userId - User ID
   */
  static async deleteSubmission(courseId, lessonId, submissionId, userId) {
    try {
      // Remove submission
      await remove(ref(db, `quiz_submissions/${courseId}/${lessonId}/${submissionId}`));
      
      // Update user analytics by recalculating
      const userAnalyticsRef = ref(db, `quiz_analytics/${courseId}/${lessonId}/${userId}`);
      const snapshot = await get(userAnalyticsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const updatedAttempts = (data.attempts || []).filter(
          attempt => attempt.submissionId !== submissionId
        );
        
        if (updatedAttempts.length === 0) {
          // Remove user analytics entirely if no attempts left
          await remove(userAnalyticsRef);
        } else {
          // Recalculate analytics
          const newAnalytics = {
            attempts: updatedAttempts,
            totalAttempts: updatedAttempts.length,
            bestScore: Math.max(...updatedAttempts.map(a => a.score)),
            averageScore: Math.round(
              updatedAttempts.reduce((sum, a) => sum + a.score, 0) / updatedAttempts.length
            ),
            passed: updatedAttempts.some(a => a.passed),
            lastAttemptAt: updatedAttempts[updatedAttempts.length - 1]?.submittedAt,
            totalTimeSpent: updatedAttempts.reduce((sum, a) => sum + a.timeSpent, 0)
          };
          
          await set(userAnalyticsRef, newAnalytics);
        }
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }
}

export default QuizService;