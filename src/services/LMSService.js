import { 
  ref, 
  get, 
  set, 
  update, 
  push, 
  query, 
  orderByChild,
  equalTo,
  limitToLast,
  serverTimestamp
} from 'firebase/database';
import { db } from '../config/firebase';
import AnalyticsService from './AnalyticsService';

// Learning Management System Service for Nexus Educational Platform
class LMSService {
  // Course Management
  static async getCourses(filters = {}) {
    try {
      const coursesRef = ref(db, 'courses');
      let snapshot;
      
      // Apply filters with queries
      if (filters.subject) {
        const q = query(coursesRef, orderByChild('subject'), equalTo(filters.subject));
        snapshot = await get(q);
      } else if (filters.level) {
        const q = query(coursesRef, orderByChild('level'), equalTo(filters.level));
        snapshot = await get(q);
      } else {
        // Get all courses
        snapshot = await get(coursesRef);
      }
      
      const courses = [];
      
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        Object.keys(coursesData).forEach((courseId) => {
          courses.push({
            id: courseId,
            ...coursesData[courseId]
          });
        });
        
        // Sort by created_at desc (manual sorting for Realtime Database)
        courses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      return courses;
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }

  static async getCourse(courseId) {
    try {
      const courseRef = ref(db, `courses/${courseId}`);
      const snapshot = await get(courseRef);
      
      if (snapshot.exists()) {
        return {
          id: courseId,
          ...snapshot.val()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting course:', error);
      return null;
    }
  }

  static async createCourse(courseData, instructorId) {
    try {
      const course = {
        ...courseData,
        instructor_id: instructorId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        enrolled_students: 0,
        average_rating: 0,
        total_reviews: 0,
        status: 'active'
      };
      
      const coursesRef = ref(db, 'courses');
      const newCourseRef = push(coursesRef);
      await set(newCourseRef, course);
      
      AnalyticsService.storeEvent('course_created', {
        course_id: newCourseRef.key,
        instructor_id: instructorId,
        course_name: courseData.title
      });
      
      return newCourseRef.key;
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failure in creating the course');
    }
  }

  // Lesson Management
  static async getCourseLessons(courseId) {
    try {
      const lessonsRef = ref(db, 'lessons');
      const q = query(lessonsRef, orderByChild('course_id'), equalTo(courseId));
      
      const snapshot = await get(q);
      const lessons = [];
      
      if (snapshot.exists()) {
        const lessonsData = snapshot.val();
        Object.keys(lessonsData).forEach((lessonId) => {
          if (lessonsData[lessonId].course_id === courseId) {
            lessons.push({
              id: lessonId,
              ...lessonsData[lessonId]
            });
          }
        });
        
        // Sort by order
        lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      
      return lessons;
    } catch (error) {
      console.error('Error getting lessons:', error);
      return [];
    }
  }

  static async getLesson(lessonId) {
    try {
      const lessonRef = ref(db, `lessons/${lessonId}`);
      const snapshot = await get(lessonRef);
      
      if (snapshot.exists()) {
        return {
          id: lessonId,
          ...snapshot.val()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting lesson:', error);
      return null;
    }
  }

  static async createLesson(lessonData, courseId) {
    try {
      const lesson = {
        ...lessonData,
        course_id: courseId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        average_completion_time: 0
      };
      
      const docRef = await addDoc(collection(db, 'lessons'), lesson);
      
      AnalyticsService.storeEvent('lesson_created', {
        lesson_id: docRef.id,
        course_id: courseId,
        lesson_title: lessonData.title
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw new Error('Failure in creating the lesson');
    }
  }

  // User Progress Tracking
  static async getUserProgress(userId, courseId = null) {
    try {
      let q;
      if (courseId) {
        q = query(
          collection(db, 'user_progress'),
          where('user_id', '==', userId),
          where('course_id', '==', courseId)
        );
      } else {
        q = query(
          collection(db, 'user_progress'),
          where('user_id', '==', userId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const progress = [];
      
      querySnapshot.forEach((doc) => {
        progress.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return progress;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  static async updateLessonProgress(userId, courseId, lessonId, progressData) {
    try {
      const progressRef = doc(db, 'user_progress', `${userId}_${courseId}_${lessonId}`);
      
      const progressDoc = {
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        completed: progressData.completed || false,
        completion_percentage: progressData.completion_percentage || 0,
        time_spent: progressData.time_spent || 0,
        last_accessed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await setDoc(progressRef, progressDoc, { merge: true });
      
      // Track analytics
      if (progressData.completed) {
        AnalyticsService.trackLessonComplete(
          courseId, 
          lessonId, 
          progressData.lesson_name || '', 
          userId, 
          progressData.time_spent || 0
        );
      }
      
      // Update course completion status
      await this.updateCourseProgress(userId, courseId);
      
      return true;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return false;
    }
  }

  static async updateCourseProgress(userId, courseId) {
    try {
      // Get all lessons for the course
      const lessons = await this.getCourseLessons(courseId);
      const totalLessons = lessons.length;
      
      if (totalLessons === 0) return;
      
      // Get user progress for all lessons in the course
      const userProgress = await this.getUserProgress(userId, courseId);
      const completedLessons = userProgress.filter(p => p.completed).length;
      
      const completionPercentage = (completedLessons / totalLessons) * 100;
      
      // Update or create course progress record
      const courseProgressRef = doc(db, 'course_progress', `${userId}_${courseId}`);
      
      const courseProgressDoc = {
        user_id: userId,
        course_id: courseId,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        completion_percentage: completionPercentage,
        is_completed: completionPercentage === 100,
        last_accessed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await setDoc(courseProgressRef, courseProgressDoc, { merge: true });
      
      // If course is completed, track it
      if (completionPercentage === 100) {
        AnalyticsService.storeEvent('course_completed', {
          user_id: userId,
          course_id: courseId,
          completion_time: new Date().toISOString()
        });
      }
      
      return courseProgressDoc;
    } catch (error) {
      console.error('Error updating course progress:', error);
      return null;
    }
  }

  // Quiz and Assessment Management
  static async getQuizzes(courseId) {
    try {
      const q = query(
        collection(db, 'quizzes'),
        where('course_id', '==', courseId),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const quizzes = [];
      
      querySnapshot.forEach((doc) => {
        quizzes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return quizzes;
    } catch (error) {
      console.error('Error getting quizzes:', error);
      return [];
    }
  }

  static async submitQuizResult(userId, quizId, courseId, answers, score, totalQuestions) {
    try {
      const resultRef = doc(db, 'quiz_results', `${userId}_${quizId}_${Date.now()}`);
      
      const result = {
        user_id: userId,
        quiz_id: quizId,
        course_id: courseId,
        answers: answers,
        score: score,
        total_questions: totalQuestions,
        percentage: (score / totalQuestions) * 100,
        passed: (score / totalQuestions) >= 0.7, // 70% passing grade
        submitted_at: new Date().toISOString(),
        timestamp: serverTimestamp()
      };
      
      await setDoc(resultRef, result);
      
      // Track analytics
      AnalyticsService.trackQuizComplete(
        quizId,
        '', // Quiz name would be fetched separately
        courseId,
        userId,
        score,
        totalQuestions,
        0 // Time spent would be tracked separately
      );
      
      return result;
    } catch (error) {
      console.error('Error submitting quiz result:', error);
      throw new Error('Failure in submitting quiz result');
    }
  }

  // Enrollment Management
  static async enrollUserInCourse(userId, courseId, paymentData = null) {
    try {
      const enrollmentRef = doc(db, 'enrollments', `${userId}_${courseId}`);
      
      const enrollment = {
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        status: 'active',
        payment_data: paymentData,
        progress: 0,
        last_accessed: null,
        timestamp: serverTimestamp()
      };
      
      await setDoc(enrollmentRef, enrollment);
      
      // Update course enrollment count
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        enrolled_students: increment(1)
      });
      
      // Track analytics
      AnalyticsService.trackCourseEnrollment(courseId, '', userId);
      
      return true;
    } catch (error) {
      console.error('Error enrolling user in course:', error);
      throw new Error('Failure in course registration');
    }
  }

  static async getUserEnrollments(userId) {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('user_id', '==', userId),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      const enrollments = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const enrollment = { id: docSnapshot.id, ...docSnapshot.data() };
        
        // Get course details
        const course = await this.getCourse(enrollment.course_id);
        if (course) {
          enrollment.course = course;
        }
        
        // Get progress
        const progress = await this.getUserProgress(userId, enrollment.course_id);
        enrollment.progress_details = progress;
        
        enrollments.push(enrollment);
      }
      
      return enrollments;
    } catch (error) {
      console.error('Error getting user enrollments:', error);
      return [];
    }
  }

  // Search and Recommendations
  static async searchCourses(searchTerm, filters = {}) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // In production, you'd use Algolia or similar service
      const courses = await this.getCourses(filters);
      
      const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      // Track search
      AnalyticsService.trackSearch(searchTerm, filteredCourses.length, null);
      
      return filteredCourses;
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }

  static async getRecommendedCourses(userId, limit = 5) {
    try {
      // Simple recommendation based on user's enrolled courses and subjects
      const enrollments = await this.getUserEnrollments(userId);
      const userSubjects = enrollments.map(e => e.course?.subject).filter(Boolean);
      
      const q = query(
        collection(db, 'courses'),
        orderBy('average_rating', 'desc'),
        orderBy('enrolled_students', 'desc'),
        limit(limit * 2) // Get more to filter out already enrolled
      );
      
      const querySnapshot = await getDocs(q);
      const allCourses = [];
      
      querySnapshot.forEach((doc) => {
        const course = { id: doc.id, ...doc.data() };
        const isEnrolled = enrollments.some(e => e.course_id === course.id);
        
        if (!isEnrolled) {
          // Boost score for courses in user's subjects
          course.recommendation_score = course.average_rating;
          if (userSubjects.includes(course.subject)) {
            course.recommendation_score += 1;
          }
          allCourses.push(course);
        }
      });
      
      // Sort by recommendation score and return top results
      return allCourses
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error getting recommended courses:', error);
      return [];
    }
  }

  // Course Rating and Reviews
  static async submitCourseReview(userId, courseId, rating, review) {
    try {
      const reviewRef = doc(db, 'course_reviews', `${userId}_${courseId}`);
      
      const reviewDoc = {
        user_id: userId,
        course_id: courseId,
        rating: rating,
        review: review,
        created_at: new Date().toISOString(),
        timestamp: serverTimestamp()
      };
      
      await setDoc(reviewRef, reviewDoc, { merge: true });
      
      // Update course average rating
      await this.updateCourseRating(courseId);
      
      return true;
    } catch (error) {
      console.error('Error submitting course review:', error);
      throw new Error('Failure in Submit Rating');
    }
  }

  static async updateCourseRating(courseId) {
    try {
      const q = query(
        collection(db, 'course_reviews'),
        where('course_id', '==', courseId)
      );
      
      const querySnapshot = await getDocs(q);
      let totalRating = 0;
      let totalReviews = querySnapshot.size;
      
      querySnapshot.forEach((doc) => {
        totalRating += doc.data().rating;
      });
      
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      // Update course document
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        average_rating: averageRating,
        total_reviews: totalReviews,
        updated_at: new Date().toISOString()
      });
      
      return averageRating;
    } catch (error) {
      console.error('Error updating course rating:', error);
      return 0;
    }
  }
}

export default LMSService;