// خدمة تتبع التقدم الدراسي - منصة Nexus
// Progress Tracking Service for Nexus LMS

import { ref, set, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';

class ProgressService {
  
  // تسجيل تقدم الطالب في درس
  static async updateLessonProgress(userId, courseId, lessonId, progressData) {
    try {
      const progressRef = ref(db, `user_progress/${userId}/${courseId}/${lessonId}`);
      
      const progressUpdate = {
        completed: progressData.completed || false,
        completedAt: progressData.completed ? new Date().toISOString() : null,
        timeSpent: progressData.timeSpent || 0,
        score: progressData.score || null,
        attempts: progressData.attempts || 1,
        lastAccessedAt: new Date().toISOString()
      };
      
      await set(progressRef, progressUpdate);
      
      // تحديث تقدم الكورس الإجمالي
      await this.updateCourseProgress(userId, courseId);
      
      console.log('✅ تم تحديث تقدم الدرس بنجاح');
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في تحديث تقدم الدرس:', error);
      return { success: false, error: error.message };
    }
  }
  
  // تحديث التقدم الإجمالي للكورس
  static async updateCourseProgress(userId, courseId) {
    try {
      // الحصول على جميع الدروس في الكورس
      const lessonsRef = ref(db, 'lessons');
      const lessonsQuery = query(lessonsRef, orderByChild('courseId'), equalTo(courseId));
      const lessonsSnapshot = await get(lessonsQuery);
      
      if (!lessonsSnapshot.exists()) {
        return { success: false, error: 'لا توجد دروس في هذا الكورس' };
      }
      
      const lessons = Object.values(lessonsSnapshot.val());
      const totalLessons = lessons.length;
      
      // الحصول على تقدم الطالب
      const progressRef = ref(db, `user_progress/${userId}/${courseId}`);
      const progressSnapshot = await get(progressRef);
      
      let completedLessons = 0;
      let totalTimeSpent = 0;
      let completedLessonIds = [];
      
      if (progressSnapshot.exists()) {
        const progress = progressSnapshot.val();
        Object.entries(progress).forEach(([lessonId, lessonProgress]) => {
          if (lessonProgress.completed) {
            completedLessons++;
            completedLessonIds.push(lessonId);
          }
          totalTimeSpent += lessonProgress.timeSpent || 0;
        });
      }
      
      const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
      
      // تحديث بيانات التسجيل
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, orderByChild('userId'), equalTo(userId));
      const enrollmentsSnapshot = await get(enrollmentsQuery);
      
      if (enrollmentsSnapshot.exists()) {
        const enrollments = Object.values(enrollmentsSnapshot.val());
        const enrollment = enrollments.find(e => e.courseId === courseId);
        
        if (enrollment) {
          const enrollmentRef = ref(db, `enrollments/${enrollment.id}`);
          await update(enrollmentRef, {
            progress: progressPercentage,
            completedLessons: completedLessonIds,
            timeSpent: totalTimeSpent,
            lastAccessedAt: new Date().toISOString(),
            completionDate: progressPercentage === 100 ? new Date().toISOString() : null
          });
          
          // إصدار الشهادة إذا اكتمل الكورس
          if (progressPercentage === 100) {
            await this.issueCertificate(userId, courseId, enrollment.id);
          }
        }
      }
      
      return { success: true, progress: progressPercentage };
    } catch (error) {
      console.error('❌ خطأ في تحديث تقدم الكورس:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على تقدم الطالب في كورس
  static async getCourseProgress(userId, courseId) {
    try {
      const progressRef = ref(db, `user_progress/${userId}/${courseId}`);
      const snapshot = await get(progressRef);
      
      if (!snapshot.exists()) {
        return { success: true, progress: {} };
      }
      
      return { success: true, progress: snapshot.val() };
    } catch (error) {
      console.error('❌ خطأ في جلب التقدم:', error);
      return { success: false, error: error.message, progress: {} };
    }
  }
  
  // الحصول على تقدم الطالب في درس معين
  static async getLessonProgress(userId, courseId, lessonId) {
    try {
      const progressRef = ref(db, `user_progress/${userId}/${courseId}/${lessonId}`);
      const snapshot = await get(progressRef);
      
      if (!snapshot.exists()) {
        return { 
          success: true, 
          progress: {
            completed: false,
            timeSpent: 0,
            score: null,
            attempts: 0
          }
        };
      }
      
      return { success: true, progress: snapshot.val() };
    } catch (error) {
      console.error('❌ خطأ في جلب تقدم الدرس:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على جميع تقدم الطالب
  static async getAllUserProgress(userId) {
    try {
      const progressRef = ref(db, `user_progress/${userId}`);
      const snapshot = await get(progressRef);
      
      if (!snapshot.exists()) {
        return { success: true, courses: [] };
      }
      
      const coursesProgress = snapshot.val();
      
      // تحويل إلى مصفوفة مع معلومات الكورسات
      const progressArray = await Promise.all(
        Object.entries(coursesProgress).map(async ([courseId, lessons]) => {
          const courseRef = ref(db, `courses/${courseId}`);
          const courseSnapshot = await get(courseRef);
          
          const completedLessons = Object.values(lessons).filter(l => l.completed).length;
          const totalTimeSpent = Object.values(lessons).reduce((sum, l) => sum + (l.timeSpent || 0), 0);
          
          return {
            courseId,
            course: courseSnapshot.exists() ? courseSnapshot.val() : null,
            completedLessons,
            totalTimeSpent,
            lessons
          };
        })
      );
      
      return { success: true, courses: progressArray };
    } catch (error) {
      console.error('❌ خطأ في جلب جميع التقدم:', error);
      return { success: false, error: error.message, courses: [] };
    }
  }
  
  // إصدار شهادة إتمام
  static async issueCertificate(userId, courseId, enrollmentId) {
    try {
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const enrollmentRef = ref(db, `enrollments/${enrollmentId}`);
      await update(enrollmentRef, {
        certificate: {
          issued: true,
          issuedAt: new Date().toISOString(),
          certificateId
        }
      });
      
      console.log('✅ تم إصدار الشهادة بنجاح:', certificateId);
      return { success: true, certificateId };
    } catch (error) {
      console.error('❌ خطأ في إصدار الشهادة:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على شهادة الطالب
  static async getCertificate(userId, courseId) {
    try {
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(enrollmentsQuery);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'لا يوجد تسجيل' };
      }
      
      const enrollments = Object.values(snapshot.val());
      const enrollment = enrollments.find(e => e.courseId === courseId);
      
      if (!enrollment) {
        return { success: false, error: 'غير مسجل في الكورس' };
      }
      
      if (!enrollment.certificate || !enrollment.certificate.issued) {
        return { success: false, error: 'الشهادة غير صادرة بعد' };
      }
      
      // جلب معلومات الكورس
      const courseRef = ref(db, `courses/${courseId}`);
      const courseSnapshot = await get(courseRef);
      
      // جلب معلومات المستخدم
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      return {
        success: true,
        certificate: {
          ...enrollment.certificate,
          course: courseSnapshot.exists() ? courseSnapshot.val() : null,
          user: userSnapshot.exists() ? userSnapshot.val() : null,
          completionDate: enrollment.completionDate
        }
      };
    } catch (error) {
      console.error('❌ خطأ في جلب الشهادة:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على إحصائيات التقدم الإجمالية للطالب
  static async getUserStats(userId) {
    try {
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(enrollmentsQuery);
      
      if (!snapshot.exists()) {
        return {
          success: true,
          stats: {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalTimeSpent: 0,
            averageProgress: 0,
            certificates: 0
          }
        };
      }
      
      const enrollments = Object.values(snapshot.val());
      const completedCourses = enrollments.filter(e => e.progress >= 100).length;
      const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
      const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.timeSpent || 0), 0);
      const averageProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length;
      const certificates = enrollments.filter(e => e.certificate && e.certificate.issued).length;
      
      return {
        success: true,
        stats: {
          totalCourses: enrollments.length,
          completedCourses,
          inProgressCourses,
          totalTimeSpent,
          averageProgress: Math.round(averageProgress),
          certificates
        }
      };
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات الطالب:', error);
      return { success: false, error: error.message };
    }
  }
  
  // تتبع وقت المشاهدة
  static async trackWatchTime(userId, courseId, lessonId, seconds) {
    try {
      const progressRef = ref(db, `user_progress/${userId}/${courseId}/${lessonId}`);
      const snapshot = await get(progressRef);
      
      let currentTimeSpent = 0;
      if (snapshot.exists()) {
        currentTimeSpent = snapshot.val().timeSpent || 0;
      }
      
      await update(progressRef, {
        timeSpent: currentTimeSpent + seconds,
        lastAccessedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في تتبع الوقت:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ProgressService;
