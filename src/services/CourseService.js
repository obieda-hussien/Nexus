// Course Management Service for Nexus LMS
// Handles all course-related operations with Firebase Realtime Database

import { ref, set, get, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';

class CourseService {
  
  // Create a new course
  static async createCourse(courseData, instructorId) {
    try {
      const courseRef = push(ref(db, 'courses'));
      const courseId = courseRef.key;
      
      const newCourse = {
        id: courseId,
        ...courseData,
        instructorId,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studentsCount: 0,
        rating: 0,
        reviewsCount: 0,
        salesCount: 0,
        totalRevenue: 0,
        isActive: false
      };
      
      await set(courseRef, newCourse);
      console.log('✅ Course created successfully:', courseId);
      return { success: true, courseId, course: newCourse };
    } catch (error) {
      console.error('❌ Error creating course:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get all courses with optional filtering
  static async getCourses(filters = {}) {
    try {
      const coursesRef = ref(db, 'courses');
      const snapshot = await get(coursesRef);
      
      if (!snapshot.exists()) {
        return { success: true, courses: [] };
      }
      
      let courses = Object.values(snapshot.val());
      
      // Apply filters
      if (filters.category) {
        courses = courses.filter(course => course.category === filters.category);
      }
      
      if (filters.level) {
        courses = courses.filter(course => course.level === filters.level);
      }
      
      if (filters.isFree !== undefined) {
        courses = courses.filter(course => course.isFree === filters.isFree);
      }
      
      if (filters.status) {
        courses = courses.filter(course => course.status === filters.status);
      }
      
      // Sort courses
      if (filters.sortBy) {
        courses.sort((a, b) => {
          switch (filters.sortBy) {
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'popular':
              return b.studentsCount - a.studentsCount;
            case 'rating':
              return b.rating - a.rating;
            case 'price_low':
              return a.price - b.price;
            case 'price_high':
              return b.price - a.price;
            default:
              return 0;
          }
        });
      }
      
      return { success: true, courses };
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      return { success: false, error: error.message, courses: [] };
    }
  }
  
  // Get course by ID
  static async getCourse(courseId) {
    try {
      const courseRef = ref(db, `courses/${courseId}`);
      const snapshot = await get(courseRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Course not found' };
      }
      
      return { success: true, course: snapshot.val() };
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get courses by instructor
  static async getCoursesByInstructor(instructorId) {
    try {
      const coursesRef = ref(db, 'courses');
      const coursesQuery = query(coursesRef, orderByChild('instructorId'), equalTo(instructorId));
      const snapshot = await get(coursesQuery);
      
      if (!snapshot.exists()) {
        return { success: true, courses: [] };
      }
      
      const courses = Object.values(snapshot.val());
      return { success: true, courses };
    } catch (error) {
      console.error('❌ Error fetching instructor courses:', error);
      return { success: false, error: error.message, courses: [] };
    }
  }
  
  // Update course
  static async updateCourse(courseId, updateData) {
    try {
      const courseRef = ref(db, `courses/${courseId}`);
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      await update(courseRef, updates);
      console.log('✅ Course updated successfully:', courseId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating course:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Delete course
  static async deleteCourse(courseId) {
    try {
      const courseRef = ref(db, `courses/${courseId}`);
      await remove(courseRef);
      console.log('✅ Course deleted successfully:', courseId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Enroll student in course
  static async enrollStudent(userId, courseId, paymentData = null) {
    try {
      const enrollmentRef = push(ref(db, 'enrollments'));
      const enrollmentId = enrollmentRef.key;
      
      const enrollment = {
        id: enrollmentId,
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedLessons: [],
        currentLesson: null,
        lastWatched: null,
        timeSpent: 0,
        paymentStatus: paymentData ? 'paid' : 'free',
        paymentMethod: paymentData?.method || 'free',
        transactionId: paymentData?.transactionId || null,
        amount: paymentData?.amount || 0,
        certificate: {
          issued: false,
          issuedAt: null,
          certificateId: null
        }
      };
      
      await set(enrollmentRef, enrollment);
      
      // Update course students count
      const courseRef = ref(db, `courses/${courseId}`);
      const courseSnapshot = await get(courseRef);
      if (courseSnapshot.exists()) {
        const course = courseSnapshot.val();
        await update(courseRef, {
          studentsCount: (course.studentsCount || 0) + 1
        });
      }
      
      console.log('✅ Student enrolled successfully:', enrollmentId);
      return { success: true, enrollmentId, enrollment };
    } catch (error) {
      console.error('❌ Error enrolling student:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get student enrollments
  static async getStudentEnrollments(userId) {
    try {
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(enrollmentsQuery);
      
      if (!snapshot.exists()) {
        return { success: true, enrollments: [] };
      }
      
      const enrollments = Object.values(snapshot.val());
      
      // Fetch course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const courseResult = await this.getCourse(enrollment.courseId);
          return {
            ...enrollment,
            course: courseResult.success ? courseResult.course : null
          };
        })
      );
      
      return { success: true, enrollments: enrollmentsWithCourses };
    } catch (error) {
      console.error('❌ Error fetching student enrollments:', error);
      return { success: false, error: error.message, enrollments: [] };
    }
  }
  
  // Update enrollment progress
  static async updateProgress(enrollmentId, progressData) {
    try {
      const enrollmentRef = ref(db, `enrollments/${enrollmentId}`);
      const updates = {
        ...progressData,
        lastWatched: new Date().toISOString()
      };
      
      await update(enrollmentRef, updates);
      console.log('✅ Progress updated successfully:', enrollmentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Search courses
  static async searchCourses(searchTerm) {
    try {
      const coursesResult = await this.getCourses();
      if (!coursesResult.success) {
        return coursesResult;
      }
      
      const searchLower = searchTerm.toLowerCase();
      const filteredCourses = coursesResult.courses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.instructorName.toLowerCase().includes(searchLower) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
      
      return { success: true, courses: filteredCourses };
    } catch (error) {
      console.error('❌ Error searching courses:', error);
      return { success: false, error: error.message, courses: [] };
    }
  }
  
  // Get course statistics for instructor
  static async getCourseStats(courseId) {
    try {
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, orderByChild('courseId'), equalTo(courseId));
      const snapshot = await get(enrollmentsQuery);
      
      if (!snapshot.exists()) {
        return {
          success: true,
          stats: {
            totalEnrollments: 0,
            completedStudents: 0,
            averageProgress: 0,
            totalRevenue: 0
          }
        };
      }
      
      const enrollments = Object.values(snapshot.val());
      const completedStudents = enrollments.filter(e => e.progress >= 100).length;
      const averageProgress = enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length;
      const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      return {
        success: true,
        stats: {
          totalEnrollments: enrollments.length,
          completedStudents,
          averageProgress: Math.round(averageProgress),
          totalRevenue
        }
      };
    } catch (error) {
      console.error('❌ Error fetching course stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default CourseService;