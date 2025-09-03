import { analytics } from '../config/firebase';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Analytics Service for Nexus Educational Platform
class AnalyticsService {
  // Initialize analytics for a user
  static initializeForUser(userId, userProperties = {}) {
    if (analytics) {
      setUserId(analytics, userId);
      setUserProperties(analytics, {
        user_type: 'student',
        platform: 'web',
        ...userProperties
      });
    }
  }

  // Track page views
  static trackPageView(pageName, pageTitle) {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_name: pageName,
        page_title: pageTitle,
        timestamp: new Date().toISOString()
      });
    }
    
    // Also store in Firestore for detailed analytics
    this.storeEvent('page_view', {
      page_name: pageName,
      page_title: pageTitle
    });
  }

  // Track course interactions
  static trackCourseView(courseId, courseName) {
    if (analytics) {
      logEvent(analytics, 'view_course', {
        course_id: courseId,
        course_name: courseName,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('course_view', {
      course_id: courseId,
      course_name: courseName
    });
  }

  static trackCourseEnrollment(courseId, courseName, userId) {
    if (analytics) {
      logEvent(analytics, 'enroll_course', {
        course_id: courseId,
        course_name: courseName,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('course_enrollment', {
      course_id: courseId,
      course_name: courseName,
      user_id: userId
    });
  }

  static trackLessonStart(courseId, lessonId, lessonName, userId) {
    if (analytics) {
      logEvent(analytics, 'lesson_start', {
        course_id: courseId,
        lesson_id: lessonId,
        lesson_name: lessonName,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('lesson_start', {
      course_id: courseId,
      lesson_id: lessonId,
      lesson_name: lessonName,
      user_id: userId
    });
  }

  static trackLessonComplete(courseId, lessonId, lessonName, userId, timeSpent) {
    if (analytics) {
      logEvent(analytics, 'lesson_complete', {
        course_id: courseId,
        lesson_id: lessonId,
        lesson_name: lessonName,
        user_id: userId,
        time_spent: timeSpent,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('lesson_complete', {
      course_id: courseId,
      lesson_id: lessonId,
      lesson_name: lessonName,
      user_id: userId,
      time_spent: timeSpent
    });
  }

  // Track quiz and assessment interactions
  static trackQuizStart(quizId, quizName, courseId, userId) {
    if (analytics) {
      logEvent(analytics, 'quiz_start', {
        quiz_id: quizId,
        quiz_name: quizName,
        course_id: courseId,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('quiz_start', {
      quiz_id: quizId,
      quiz_name: quizName,
      course_id: courseId,
      user_id: userId
    });
  }

  static trackQuizComplete(quizId, quizName, courseId, userId, score, totalQuestions, timeSpent) {
    if (analytics) {
      logEvent(analytics, 'quiz_complete', {
        quiz_id: quizId,
        quiz_name: quizName,
        course_id: courseId,
        user_id: userId,
        score: score,
        total_questions: totalQuestions,
        success_rate: (score / totalQuestions) * 100,
        time_spent: timeSpent,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('quiz_complete', {
      quiz_id: quizId,
      quiz_name: quizName,
      course_id: courseId,
      user_id: userId,
      score: score,
      total_questions: totalQuestions,
      success_rate: (score / totalQuestions) * 100,
      time_spent: timeSpent
    });
  }

  // Track user authentication events
  static trackUserSignup(userId, method = 'email') {
    if (analytics) {
      logEvent(analytics, 'sign_up', {
        method: method,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('user_signup', {
      user_id: userId,
      method: method
    });
  }

  static trackUserLogin(userId, method = 'email') {
    if (analytics) {
      logEvent(analytics, 'login', {
        method: method,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('user_login', {
      user_id: userId,
      method: method
    });
  }

  // Track live session interactions
  static trackLiveSessionJoin(sessionId, sessionName, userId) {
    if (analytics) {
      logEvent(analytics, 'live_session_join', {
        session_id: sessionId,
        session_name: sessionName,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('live_session_join', {
      session_id: sessionId,
      session_name: sessionName,
      user_id: userId
    });
  }

  static trackLiveSessionLeave(sessionId, sessionName, userId, timeSpent) {
    if (analytics) {
      logEvent(analytics, 'live_session_leave', {
        session_id: sessionId,
        session_name: sessionName,
        user_id: userId,
        time_spent: timeSpent,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('live_session_leave', {
      session_id: sessionId,
      session_name: sessionName,
      user_id: userId,
      time_spent: timeSpent
    });
  }

  // Track search and discovery
  static trackSearch(searchTerm, resultsCount, userId) {
    if (analytics) {
      logEvent(analytics, 'search', {
        search_term: searchTerm,
        results_count: resultsCount,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
      user_id: userId
    });
  }

  // Track errors and issues
  static trackError(errorType, errorMessage, context = {}) {
    if (analytics) {
      logEvent(analytics, 'error_occurred', {
        error_type: errorType,
        error_message: errorMessage,
        context: JSON.stringify(context),
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      context: context
    });
  }

  // Store detailed events in Firestore for custom analytics
  static async storeEvent(eventType, eventData) {
    try {
      await addDoc(collection(db, 'analytics_events'), {
        event_type: eventType,
        event_data: eventData,
        timestamp: serverTimestamp(),
        created_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      });
    } catch (error) {
      console.error('Error storing analytics event:', error);
    }
  }

  // Track custom conversion events
  static trackConversion(conversionType, value = 0, currency = 'EGP') {
    if (analytics) {
      logEvent(analytics, 'conversion', {
        conversion_type: conversionType,
        value: value,
        currency: currency,
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('conversion', {
      conversion_type: conversionType,
      value: value,
      currency: currency
    });
  }

  // Track engagement metrics
  static trackEngagement(engagementType, duration, content = {}) {
    if (analytics) {
      logEvent(analytics, 'engagement', {
        engagement_type: engagementType,
        duration: duration,
        content: JSON.stringify(content),
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('engagement', {
      engagement_type: engagementType,
      duration: duration,
      content: content
    });
  }

  // Performance tracking
  static trackPerformance(metricName, value, context = {}) {
    if (analytics) {
      logEvent(analytics, 'performance_metric', {
        metric_name: metricName,
        value: value,
        context: JSON.stringify(context),
        timestamp: new Date().toISOString()
      });
    }
    
    this.storeEvent('performance', {
      metric_name: metricName,
      value: value,
      context: context
    });
  }
}

export default AnalyticsService;