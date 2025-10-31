// خدمة إدارة التقييمات والمراجعات - منصة Nexus
// Review Management Service for Nexus LMS

import { ref, set, get, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';

class ReviewService {
  
  // إضافة مراجعة جديدة
  static async addReview(reviewData) {
    try {
      const { userId, courseId, rating, comment } = reviewData;
      
      // التحقق من أن المستخدم مسجل في الكورس
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, orderByChild('userId'), equalTo(userId));
      const enrollmentsSnapshot = await get(enrollmentsQuery);
      
      if (!enrollmentsSnapshot.exists()) {
        return { success: false, error: 'يجب أن تكون مسجلاً في الكورس لإضافة مراجعة' };
      }
      
      const enrollments = Object.values(enrollmentsSnapshot.val());
      const isEnrolled = enrollments.some(e => e.courseId === courseId);
      
      if (!isEnrolled) {
        return { success: false, error: 'يجب أن تكون مسجلاً في الكورس لإضافة مراجعة' };
      }
      
      // إنشاء المراجعة
      const reviewRef = push(ref(db, 'reviews'));
      const reviewId = reviewRef.key;
      
      const newReview = {
        id: reviewId,
        userId,
        courseId,
        rating,
        comment,
        status: 'approved',
        helpfulVotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(reviewRef, newReview);
      
      // تحديث إحصائيات الكورس
      await this.updateCourseRating(courseId);
      
      console.log('✅ تم إضافة المراجعة بنجاح:', reviewId);
      return { success: true, reviewId, review: newReview };
    } catch (error) {
      console.error('❌ خطأ في إضافة المراجعة:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على مراجعات كورس معين
  static async getCourseReviews(courseId) {
    try {
      const reviewsRef = ref(db, 'reviews');
      const reviewsQuery = query(reviewsRef, orderByChild('courseId'), equalTo(courseId));
      const snapshot = await get(reviewsQuery);
      
      if (!snapshot.exists()) {
        return { success: true, reviews: [] };
      }
      
      let reviews = Object.values(snapshot.val());
      
      // فقط المراجعات المعتمدة
      reviews = reviews.filter(r => r.status === 'approved');
      
      // ترتيب حسب التاريخ (الأحدث أولاً)
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // إضافة معلومات المستخدم
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const userRef = ref(db, `users/${review.userId}`);
          const userSnapshot = await get(userRef);
          
          return {
            ...review,
            user: userSnapshot.exists() ? {
              displayName: userSnapshot.val().displayName,
              profilePicture: userSnapshot.val().profilePicture
            } : null
          };
        })
      );
      
      return { success: true, reviews: reviewsWithUsers };
    } catch (error) {
      console.error('❌ خطأ في جلب المراجعات:', error);
      return { success: false, error: error.message, reviews: [] };
    }
  }
  
  // الحصول على مراجعات مستخدم معين
  static async getUserReviews(userId) {
    try {
      const reviewsRef = ref(db, 'reviews');
      const reviewsQuery = query(reviewsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(reviewsQuery);
      
      if (!snapshot.exists()) {
        return { success: true, reviews: [] };
      }
      
      const reviews = Object.values(snapshot.val());
      
      return { success: true, reviews };
    } catch (error) {
      console.error('❌ خطأ في جلب مراجعات المستخدم:', error);
      return { success: false, error: error.message, reviews: [] };
    }
  }
  
  // تحديث مراجعة
  static async updateReview(reviewId, updateData) {
    try {
      const reviewRef = ref(db, `reviews/${reviewId}`);
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      await update(reviewRef, updates);
      
      // تحديث تقييم الكورس إذا تغير التقييم
      if (updateData.rating) {
        const reviewSnapshot = await get(reviewRef);
        if (reviewSnapshot.exists()) {
          await this.updateCourseRating(reviewSnapshot.val().courseId);
        }
      }
      
      console.log('✅ تم تحديث المراجعة بنجاح:', reviewId);
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في تحديث المراجعة:', error);
      return { success: false, error: error.message };
    }
  }
  
  // حذف مراجعة
  static async deleteReview(reviewId) {
    try {
      const reviewRef = ref(db, `reviews/${reviewId}`);
      const reviewSnapshot = await get(reviewRef);
      
      if (!reviewSnapshot.exists()) {
        return { success: false, error: 'المراجعة غير موجودة' };
      }
      
      const courseId = reviewSnapshot.val().courseId;
      
      await remove(reviewRef);
      
      // تحديث تقييم الكورس
      await this.updateCourseRating(courseId);
      
      console.log('✅ تم حذف المراجعة بنجاح:', reviewId);
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في حذف المراجعة:', error);
      return { success: false, error: error.message };
    }
  }
  
  // تحديث عدد الأصوات المفيدة
  static async voteHelpful(reviewId) {
    try {
      const reviewRef = ref(db, `reviews/${reviewId}`);
      const snapshot = await get(reviewRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'المراجعة غير موجودة' };
      }
      
      const review = snapshot.val();
      await update(reviewRef, {
        helpfulVotes: (review.helpfulVotes || 0) + 1
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في تحديث الأصوات:', error);
      return { success: false, error: error.message };
    }
  }
  
  // تحديث تقييم الكورس الإجمالي
  static async updateCourseRating(courseId) {
    try {
      const reviewsResult = await this.getCourseReviews(courseId);
      
      if (!reviewsResult.success || reviewsResult.reviews.length === 0) {
        // لا توجد مراجعات
        const courseRef = ref(db, `courses/${courseId}`);
        await update(courseRef, {
          rating: 0,
          reviewsCount: 0
        });
        return { success: true };
      }
      
      const reviews = reviewsResult.reviews;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      const courseRef = ref(db, `courses/${courseId}`);
      await update(courseRef, {
        rating: Math.round(averageRating * 10) / 10,
        reviewsCount: reviews.length
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في تحديث تقييم الكورس:', error);
      return { success: false, error: error.message };
    }
  }
  
  // التحقق من إمكانية المستخدم لإضافة مراجعة
  static async canUserReview(userId, courseId) {
    try {
      // التحقق من التسجيل
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, orderByChild('userId'), equalTo(userId));
      const enrollmentsSnapshot = await get(enrollmentsQuery);
      
      if (!enrollmentsSnapshot.exists()) {
        return { canReview: false, reason: 'غير مسجل في الكورس' };
      }
      
      const enrollments = Object.values(enrollmentsSnapshot.val());
      const enrollment = enrollments.find(e => e.courseId === courseId);
      
      if (!enrollment) {
        return { canReview: false, reason: 'غير مسجل في الكورس' };
      }
      
      // التحقق من وجود مراجعة سابقة
      const reviewsRef = ref(db, 'reviews');
      const reviewsQuery = query(reviewsRef, orderByChild('userId'), equalTo(userId));
      const reviewsSnapshot = await get(reviewsQuery);
      
      if (reviewsSnapshot.exists()) {
        const reviews = Object.values(reviewsSnapshot.val());
        const existingReview = reviews.find(r => r.courseId === courseId);
        
        if (existingReview) {
          return { canReview: false, reason: 'لديك مراجعة بالفعل', existingReviewId: existingReview.id };
        }
      }
      
      return { canReview: true };
    } catch (error) {
      console.error('❌ خطأ في التحقق من إمكانية المراجعة:', error);
      return { canReview: false, reason: error.message };
    }
  }
  
  // الحصول على إحصائيات التقييمات
  static async getReviewStats(courseId) {
    try {
      const reviewsResult = await this.getCourseReviews(courseId);
      
      if (!reviewsResult.success || reviewsResult.reviews.length === 0) {
        return {
          success: true,
          stats: {
            total: 0,
            average: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          }
        };
      }
      
      const reviews = reviewsResult.reviews;
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      
      reviews.forEach(review => {
        distribution[review.rating]++;
      });
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const average = totalRating / reviews.length;
      
      return {
        success: true,
        stats: {
          total: reviews.length,
          average: Math.round(average * 10) / 10,
          distribution
        }
      };
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات التقييمات:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ReviewService;
