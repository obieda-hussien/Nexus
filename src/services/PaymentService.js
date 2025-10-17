// Payment Service for Nexus LMS
// Handles Vodafone Cash payments and transaction management

import { ref, set, get, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';

class PaymentService {
  
  // Create payment record
  static async createPayment(paymentData) {
    try {
      const paymentRef = push(ref(db, 'payments'));
      const paymentId = paymentRef.key;
      
      const payment = {
        id: paymentId,
        userId: paymentData.userId,
        courseId: paymentData.courseId,
        amount: paymentData.amount,
        currency: 'EGP',
        method: 'vodafone_cash',
        vodafoneNumber: paymentData.vodafoneNumber,
        transactionId: paymentData.transactionId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null,
        receipt: paymentData.receipt || null
      };
      
      await set(paymentRef, payment);
      console.log('✅ Payment record created:', paymentId);
      return { success: true, paymentId, payment };
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get payment by ID
  static async getPayment(paymentId) {
    try {
      const paymentRef = ref(db, `payments/${paymentId}`);
      const snapshot = await get(paymentRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Payment not found' };
      }
      
      return { success: true, payment: snapshot.val() };
    } catch (error) {
      console.error('❌ Error fetching payment:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get payments by user
  static async getUserPayments(userId) {
    try {
      const paymentsRef = ref(db, 'payments');
      const userQuery = query(paymentsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(userQuery);
      
      if (!snapshot.exists()) {
        return { success: true, payments: [] };
      }
      
      const payments = Object.values(snapshot.val());
      // Sort by creation date (newest first)
      payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return { success: true, payments };
    } catch (error) {
      console.error('❌ Error fetching user payments:', error);
      return { success: false, error: error.message, payments: [] };
    }
  }
  
  // Get pending payments (for admin review)
  static async getPendingPayments() {
    try {
      const paymentsRef = ref(db, 'payments');
      const pendingQuery = query(paymentsRef, orderByChild('status'), equalTo('pending'));
      const snapshot = await get(pendingQuery);
      
      if (!snapshot.exists()) {
        return { success: true, payments: [] };
      }
      
      const payments = Object.values(snapshot.val());
      
      // Fetch user and course details for each payment
      const paymentsWithDetails = await Promise.all(
        payments.map(async (payment) => {
          const [userResult, courseResult] = await Promise.all([
            this.getUserDetails(payment.userId),
            this.getCourseDetails(payment.courseId)
          ]);
          
          return {
            ...payment,
            user: userResult.success ? userResult.user : null,
            course: courseResult.success ? courseResult.course : null
          };
        })
      );
      
      // Sort by creation date (oldest first for processing)
      paymentsWithDetails.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      return { success: true, payments: paymentsWithDetails };
    } catch (error) {
      console.error('❌ Error fetching pending payments:', error);
      return { success: false, error: error.message, payments: [] };
    }
  }
  
  // Approve payment and complete enrollment
  static async approvePayment(paymentId, adminUserId) {
    try {
      const paymentRef = ref(db, `payments/${paymentId}`);
      const paymentSnapshot = await get(paymentRef);
      
      if (!paymentSnapshot.exists()) {
        return { success: false, error: 'Payment not found' };
      }
      
      const payment = paymentSnapshot.val();
      
      // Update payment status
      await update(paymentRef, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        approvedBy: adminUserId
      });
      
      // Update enrollment payment status
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentQuery = query(
        enrollmentsRef, 
        orderByChild('transactionId'), 
        equalTo(payment.transactionId)
      );
      const enrollmentSnapshot = await get(enrollmentQuery);
      
      if (enrollmentSnapshot.exists()) {
        const enrollments = Object.entries(enrollmentSnapshot.val());
        for (const [enrollmentId, enrollment] of enrollments) {
          if (enrollment.userId === payment.userId && enrollment.courseId === payment.courseId) {
            const enrollmentRef = ref(db, `enrollments/${enrollmentId}`);
            await update(enrollmentRef, {
              paymentStatus: 'paid'
            });
            break;
          }
        }
      }
      
      // Update course revenue and sales count
      const courseRef = ref(db, `courses/${payment.courseId}`);
      const courseSnapshot = await get(courseRef);
      if (courseSnapshot.exists()) {
        const course = courseSnapshot.val();
        await update(courseRef, {
          totalRevenue: (course.totalRevenue || 0) + payment.amount,
          salesCount: (course.salesCount || 0) + 1
        });
      }
      
      // Update instructor earnings
      await this.updateInstructorEarnings(payment.courseId, payment.amount);
      
      // Send notification to user
      await this.sendNotification(payment.userId, {
        type: 'payment_confirmed',
        title: 'تم Confirm دفعتك',
        message: 'تم Confirm دفعتك بنجاح. يمكنك الآن الوصول إلى الكورس.',
        data: { paymentId, courseId: payment.courseId }
      });
      
      console.log('✅ Payment approved:', paymentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error approving payment:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Reject payment
  static async rejectPayment(paymentId, adminUserId, reason = '') {
    try {
      const paymentRef = ref(db, `payments/${paymentId}`);
      const paymentSnapshot = await get(paymentRef);
      
      if (!paymentSnapshot.exists()) {
        return { success: false, error: 'Payment not found' };
      }
      
      const payment = paymentSnapshot.val();
      
      // Update payment status
      await update(paymentRef, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        rejectedBy: adminUserId,
        rejectionReason: reason
      });
      
      // Update enrollment payment status
      const enrollmentsRef = ref(db, 'enrollments');
      const enrollmentQuery = query(
        enrollmentsRef, 
        orderByChild('transactionId'), 
        equalTo(payment.transactionId)
      );
      const enrollmentSnapshot = await get(enrollmentQuery);
      
      if (enrollmentSnapshot.exists()) {
        const enrollments = Object.entries(enrollmentSnapshot.val());
        for (const [enrollmentId, enrollment] of enrollments) {
          if (enrollment.userId === payment.userId && enrollment.courseId === payment.courseId) {
            const enrollmentRef = ref(db, `enrollments/${enrollmentId}`);
            await update(enrollmentRef, {
              paymentStatus: 'failed'
            });
            break;
          }
        }
      }
      
      // Send notification to user
      await this.sendNotification(payment.userId, {
        type: 'payment_failed',
        title: 'فشل في Confirm الدفعة',
        message: reason || 'لم يتم Confirm دفعتك. يرجى التحقق من بيانات الدفع والمحاولة مرة أخرى.',
        data: { paymentId, courseId: payment.courseId }
      });
      
      console.log('✅ Payment rejected:', paymentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error rejecting payment:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Update instructor earnings
  static async updateInstructorEarnings(courseId, amount) {
    try {
      const courseRef = ref(db, `courses/${courseId}`);
      const courseSnapshot = await get(courseRef);
      
      if (!courseSnapshot.exists()) {
        return { success: false, error: 'Course not found' };
      }
      
      const course = courseSnapshot.val();
      const instructorShare = amount * 0.7; // 70% goes to instructor, 30% platform fee
      
      const userRef = ref(db, `users/${course.instructorId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const user = userSnapshot.val();
        const currentEarnings = user.instructorData?.totalEarnings || 0;
        
        await update(userRef, {
          'instructorData/totalEarnings': currentEarnings + instructorShare
        });
        
        // Send earnings notification
        await this.sendNotification(course.instructorId, {
          type: 'earnings_received',
          title: 'أرباح Newة',
          message: `تم Add ${instructorShare.toFixed(2)} جنيه إلى أرباحك من بيع الكورس.`,
          data: { courseId, amount: instructorShare }
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating instructor earnings:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get payment statistics
  static async getPaymentStats(filters = {}) {
    try {
      const paymentsRef = ref(db, 'payments');
      const snapshot = await get(paymentsRef);
      
      if (!snapshot.exists()) {
        return {
          success: true,
          stats: {
            totalPayments: 0,
            completedPayments: 0,
            pendingPayments: 0,
            failedPayments: 0,
            totalRevenue: 0,
            platformRevenue: 0
          }
        };
      }
      
      let payments = Object.values(snapshot.val());
      
      // Apply date filter if provided
      if (filters.startDate && filters.endDate) {
        payments = payments.filter(payment => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate >= new Date(filters.startDate) && paymentDate <= new Date(filters.endDate);
        });
      }
      
      const totalPayments = payments.length;
      const completedPayments = payments.filter(p => p.status === 'completed').length;
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      const failedPayments = payments.filter(p => p.status === 'failed').length;
      
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const platformRevenue = totalRevenue * 0.3; // 30% platform fee
      
      return {
        success: true,
        stats: {
          totalPayments,
          completedPayments,
          pendingPayments,
          failedPayments,
          totalRevenue,
          platformRevenue
        }
      };
    } catch (error) {
      console.error('❌ Error fetching payment stats:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Helper methods
  static async getUserDetails(userId) {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, user: snapshot.val() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static async getCourseDetails(courseId) {
    try {
      const courseRef = ref(db, `courses/${courseId}`);
      const snapshot = await get(courseRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Course not found' };
      }
      
      return { success: true, course: snapshot.val() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static async sendNotification(userId, notificationData) {
    try {
      const notificationRef = push(ref(db, 'notifications'));
      const notificationId = notificationRef.key;
      
      const notification = {
        id: notificationId,
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: notificationData.data || {}
      };
      
      await set(notificationRef, notification);
      return { success: true, notificationId };
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }
}

export default PaymentService;