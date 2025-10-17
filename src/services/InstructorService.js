// Instructor Application Service for Nexus LMS
// Handles instructor application process and management

import { ref, set, get, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';

class InstructorService {
  
  // Submit instructor application
  static async submitApplication(applicationData, userId) {
    try {
      const applicationRef = push(ref(db, 'instructorApplications'));
      const applicationId = applicationRef.key;
      
      const application = {
        id: applicationId,
        userId,
        userEmail: applicationData.userEmail,
        userName: applicationData.userName,
        status: 'pending',
        applicationDate: new Date().toISOString(),
        reviewDate: null,
        reviewedBy: null,
        reviewNotes: '',
        specialization: applicationData.specialization,
        experience: applicationData.experience,
        education: applicationData.education,
        portfolio: applicationData.portfolio || '',
        socialLinks: applicationData.socialLinks || {},
        vodafoneCashNumber: applicationData.vodafoneCashNumber,
        nationalId: applicationData.nationalId,
        cv: applicationData.cv || '',
        certificates: applicationData.certificates || [],
        motivation: applicationData.motivation
      };
      
      await set(applicationRef, application);
      
      // Update user record with instructor application data
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        'instructorData/status': 'pending',
        'instructorData/applicationDate': new Date().toISOString(),
        'instructorData/specialization': applicationData.specialization,
        'instructorData/experience': applicationData.experience,
        'instructorData/education': applicationData.education,
        'instructorData/portfolio': applicationData.portfolio || '',
        'instructorData/socialLinks': applicationData.socialLinks || {},
        'instructorData/vodafoneCashNumber': applicationData.vodafoneCashNumber,
        'instructorData/nationalId': applicationData.nationalId,
        'instructorData/cv': applicationData.cv || '',
        'instructorData/certificates': applicationData.certificates || []
      });
      
      console.log('✅ Instructor application submitted successfully:', applicationId);
      return { success: true, applicationId, application };
    } catch (error) {
      console.error('❌ Error submitting instructor application:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get all pending applications (for admin)
  static async getPendingApplications() {
    try {
      const applicationsRef = ref(db, 'instructorApplications');
      const pendingQuery = query(applicationsRef, orderByChild('status'), equalTo('pending'));
      const snapshot = await get(pendingQuery);
      
      if (!snapshot.exists()) {
        return { success: true, applications: [] };
      }
      
      const applications = Object.values(snapshot.val());
      return { success: true, applications };
    } catch (error) {
      console.error('❌ Error fetching pending applications:', error);
      return { success: false, error: error.message, applications: [] };
    }
  }
  
  // Get application by user ID
  static async getApplicationByUserId(userId) {
    try {
      const applicationsRef = ref(db, 'instructorApplications');
      const userQuery = query(applicationsRef, orderByChild('userId'), equalTo(userId));
      const snapshot = await get(userQuery);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'No application found' };
      }
      
      const applications = Object.values(snapshot.val());
      // Return the most recent application
      const application = applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))[0];
      
      return { success: true, application };
    } catch (error) {
      console.error('❌ Error fetching user application:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Approve instructor application
  static async approveApplication(applicationId, adminUserId, reviewNotes = '') {
    try {
      const applicationRef = ref(db, `instructorApplications/${applicationId}`);
      const applicationSnapshot = await get(applicationRef);
      
      if (!applicationSnapshot.exists()) {
        return { success: false, error: 'Application not found' };
      }
      
      const application = applicationSnapshot.val();
      
      // Update application status
      await update(applicationRef, {
        status: 'approved',
        reviewDate: new Date().toISOString(),
        reviewedBy: adminUserId,
        reviewNotes: reviewNotes
      });
      
      // Update user role and instructor data
      const userRef = ref(db, `users/${application.userId}`);
      await update(userRef, {
        role: 'instructor',
        'instructorData/status': 'approved',
        'instructorData/approvalDate': new Date().toISOString(),
        'instructorData/totalEarnings': 0,
        'instructorData/studentsCount': 0,
        'instructorData/rating': 0,
        'instructorData/reviewsCount': 0
      });
      
      // Send notification to user
      await this.sendNotification(application.userId, {
        type: 'application_approved',
        title: 'Your request has been accepted!',
        message: 'Congratulations! تم قبولك كInstructor في Nexus Platform. يمكنك الآن إنشاء كورساتك الأولى.',
        data: { applicationId }
      });
      
      console.log('✅ Instructor application approved:', applicationId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error approving application:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Reject instructor application
  static async rejectApplication(applicationId, adminUserId, reviewNotes = '') {
    try {
      const applicationRef = ref(db, `instructorApplications/${applicationId}`);
      const applicationSnapshot = await get(applicationRef);
      
      if (!applicationSnapshot.exists()) {
        return { success: false, error: 'Application not found' };
      }
      
      const application = applicationSnapshot.val();
      
      // Update application status
      await update(applicationRef, {
        status: 'rejected',
        reviewDate: new Date().toISOString(),
        reviewedBy: adminUserId,
        reviewNotes: reviewNotes
      });
      
      // Update user instructor data
      const userRef = ref(db, `users/${application.userId}`);
      await update(userRef, {
        'instructorData/status': 'rejected'
      });
      
      // Send notification to user
      await this.sendNotification(application.userId, {
        type: 'application_rejected',
        title: 'طلبك rejected',
        message: reviewNotes || 'عذراً، لم يتم قبول طلبك لتصبح Instructor في هذا الوقت. يمكنك التOld مرة أخرى لاحقاً.',
        data: { applicationId }
      });
      
      console.log('✅ Instructor application rejected:', applicationId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error rejecting application:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get instructor statistics
  static async getInstructorStats(instructorId) {
    try {
      // Get instructor's courses
      const coursesRef = ref(db, 'courses');
      const coursesQuery = query(coursesRef, orderByChild('instructorId'), equalTo(instructorId));
      const coursesSnapshot = await get(coursesQuery);
      
      let totalstudents = 0;
      let totalEarnings = 0;
      let totalCourses = 0;
      let totalRating = 0;
      let totalReviews = 0;
      
      if (coursesSnapshot.exists()) {
        const courses = Object.values(coursesSnapshot.val());
        totalCourses = courses.length;
        
        for (const course of courses) {
          totalstudents += course.studentsCount || 0;
          totalEarnings += course.totalRevenue || 0;
          totalRating += course.rating || 0;
          totalReviews += course.reviewsCount || 0;
        }
      }
      
      const averageRating = totalCourses > 0 ? (totalRating / totalCourses) : 0;
      
      return {
        success: true,
        stats: {
          totalCourses,
          totalstudents,
          totalEarnings,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews
        }
      };
    } catch (error) {
      console.error('❌ Error fetching instructor stats:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Send notification to user
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
      console.log('✅ Notification sent:', notificationId);
      return { success: true, notificationId };
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get all applications with filters
  static async getApplications(filters = {}) {
    try {
      const applicationsRef = ref(db, 'instructorApplications');
      const snapshot = await get(applicationsRef);
      
      if (!snapshot.exists()) {
        return { success: true, applications: [] };
      }
      
      let applications = Object.values(snapshot.val());
      
      // Apply filters
      if (filters.status) {
        applications = applications.filter(app => app.status === filters.status);
      }
      
      if (filters.specialization) {
        applications = applications.filter(app => 
          app.specialization.toLowerCase().includes(filters.specialization.toLowerCase())
        );
      }
      
      // Sort by application date (newest first)
      applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
      
      return { success: true, applications };
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      return { success: false, error: error.message, applications: [] };
    }
  }
  
  // Check if user can apply (hasn't applied recently or was rejected)
  static async canUserApply(userId) {
    try {
      const applicationResult = await this.getApplicationByUserId(userId);
      
      if (!applicationResult.success) {
        // No previous application found, user can apply
        return { success: true, canApply: true };
      }
      
      const application = applicationResult.application;
      
      // If pending, cannot apply again
      if (application.status === 'pending') {
        return { 
          success: true, 
          canApply: false, 
          reason: 'لديك طلب قيد الReview حالياً' 
        };
      }
      
      // If approved, cannot apply again
      if (application.status === 'approved') {
        return { 
          success: true, 
          canApply: false, 
          reason: 'أنت Instructor معتمد بالفعل' 
        };
      }
      
      // If rejected, check if enough time has passed (30 days)
      if (application.status === 'rejected') {
        const rejectionDate = new Date(application.reviewDate);
        const now = new Date();
        const daysSinceRejection = (now - rejectionDate) / (1000 * 60 * 60 * 24);
        
        if (daysSinceRejection < 30) {
          return { 
            success: true, 
            canApply: false, 
            reason: `يمكنك التOld مرة أخرى بعد ${Math.ceil(30 - daysSinceRejection)} day` 
          };
        }
      }
      
      return { success: true, canApply: true };
    } catch (error) {
      console.error('❌ Error checking application eligibility:', error);
      return { success: false, error: error.message };
    }
  }
}

export default InstructorService;