// خدمة طلبات سحب الأموال - منصة Nexus
// Withdrawal Management Service for Nexus LMS

import { ref, set, get, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';

class WithdrawalService {
  
  // إنشاء طلب سحب جديد
  static async createWithdrawalRequest(instructorId, withdrawalData) {
    try {
      const { amount, paymentMethod, paymentDetails } = withdrawalData;
      
      // التحقق من رصيد المدرب
      const instructorRef = ref(db, `users/${instructorId}`);
      const instructorSnapshot = await get(instructorRef);
      
      if (!instructorSnapshot.exists()) {
        return { success: false, error: 'المدرب غير موجود' };
      }
      
      const instructor = instructorSnapshot.val();
      const availableBalance = instructor.earnings?.availableBalance || 0;
      
      if (amount > availableBalance) {
        return { success: false, error: 'الرصيد المتاح غير كافٍ' };
      }
      
      if (amount < 100) {
        return { success: false, error: 'الحد الأدنى للسحب هو 100 جنيه' };
      }
      
      // إنشاء طلب السحب
      const withdrawalRef = push(ref(db, 'withdrawalRequests'));
      const withdrawalId = withdrawalRef.key;
      
      const newWithdrawal = {
        id: withdrawalId,
        instructorId,
        amount,
        currency: 'EGP',
        paymentMethod,
        paymentDetails,
        status: 'pending',
        adminNotes: '',
        requestedAt: new Date().toISOString(),
        processedAt: null,
        completedAt: null,
        transactionReference: ''
      };
      
      await set(withdrawalRef, newWithdrawal);
      
      // تحديث رصيد المدرب
      const earningsRef = ref(db, `users/${instructorId}/earnings`);
      await update(earningsRef, {
        availableBalance: availableBalance - amount,
        pendingWithdrawals: (instructor.earnings?.pendingWithdrawals || 0) + amount
      });
      
      console.log('✅ تم إنشاء طلب السحب بنجاح:', withdrawalId);
      return { success: true, withdrawalId, withdrawal: newWithdrawal };
    } catch (error) {
      console.error('❌ خطأ في إنشاء طلب السحب:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على طلبات سحب المدرب
  static async getInstructorWithdrawals(instructorId) {
    try {
      const withdrawalsRef = ref(db, 'withdrawalRequests');
      const withdrawalsQuery = query(withdrawalsRef, orderByChild('instructorId'), equalTo(instructorId));
      const snapshot = await get(withdrawalsQuery);
      
      if (!snapshot.exists()) {
        return { success: true, withdrawals: [] };
      }
      
      let withdrawals = Object.values(snapshot.val());
      
      // ترتيب حسب التاريخ (الأحدث أولاً)
      withdrawals.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
      
      return { success: true, withdrawals };
    } catch (error) {
      console.error('❌ خطأ في جلب طلبات السحب:', error);
      return { success: false, error: error.message, withdrawals: [] };
    }
  }
  
  // الحصول على جميع طلبات السحب (للمدير)
  static async getAllWithdrawals(status = null) {
    try {
      const withdrawalsRef = ref(db, 'withdrawalRequests');
      
      let withdrawalsQuery;
      if (status) {
        withdrawalsQuery = query(withdrawalsRef, orderByChild('status'), equalTo(status));
      } else {
        withdrawalsQuery = withdrawalsRef;
      }
      
      const snapshot = await get(withdrawalsQuery);
      
      if (!snapshot.exists()) {
        return { success: true, withdrawals: [] };
      }
      
      let withdrawals = Object.values(snapshot.val());
      
      // إضافة معلومات المدرب
      const withdrawalsWithInstructors = await Promise.all(
        withdrawals.map(async (withdrawal) => {
          const instructorRef = ref(db, `users/${withdrawal.instructorId}`);
          const instructorSnapshot = await get(instructorRef);
          
          return {
            ...withdrawal,
            instructor: instructorSnapshot.exists() ? {
              displayName: instructorSnapshot.val().displayName,
              email: instructorSnapshot.val().email,
              phoneNumber: instructorSnapshot.val().phoneNumber
            } : null
          };
        })
      );
      
      // ترتيب حسب التاريخ
      withdrawalsWithInstructors.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
      
      return { success: true, withdrawals: withdrawalsWithInstructors };
    } catch (error) {
      console.error('❌ خطأ في جلب جميع طلبات السحب:', error);
      return { success: false, error: error.message, withdrawals: [] };
    }
  }
  
  // الحصول على طلب سحب معين
  static async getWithdrawal(withdrawalId) {
    try {
      const withdrawalRef = ref(db, `withdrawalRequests/${withdrawalId}`);
      const snapshot = await get(withdrawalRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'طلب السحب غير موجود' };
      }
      
      return { success: true, withdrawal: snapshot.val() };
    } catch (error) {
      console.error('❌ خطأ في جلب طلب السحب:', error);
      return { success: false, error: error.message };
    }
  }
  
  // معالجة طلب السحب (للمدير)
  static async processWithdrawal(withdrawalId, adminData) {
    try {
      const { status, adminNotes, transactionReference } = adminData;
      
      const withdrawalRef = ref(db, `withdrawalRequests/${withdrawalId}`);
      const withdrawalSnapshot = await get(withdrawalRef);
      
      if (!withdrawalSnapshot.exists()) {
        return { success: false, error: 'طلب السحب غير موجود' };
      }
      
      const withdrawal = withdrawalSnapshot.val();
      
      if (withdrawal.status !== 'pending') {
        return { success: false, error: 'هذا الطلب تمت معالجته بالفعل' };
      }
      
      const updates = {
        status,
        adminNotes: adminNotes || '',
        processedAt: new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : null,
        transactionReference: transactionReference || ''
      };
      
      await update(withdrawalRef, updates);
      
      // تحديث رصيد المدرب
      const instructorRef = ref(db, `users/${withdrawal.instructorId}`);
      const instructorSnapshot = await get(instructorRef);
      
      if (instructorSnapshot.exists()) {
        const instructor = instructorSnapshot.val();
        const earningsRef = ref(db, `users/${withdrawal.instructorId}/earnings`);
        
        if (status === 'completed') {
          // نقل من pending إلى total withdrawals
          await update(earningsRef, {
            pendingWithdrawals: (instructor.earnings?.pendingWithdrawals || 0) - withdrawal.amount,
            totalWithdrawals: (instructor.earnings?.totalWithdrawals || 0) + withdrawal.amount
          });
        } else if (status === 'rejected') {
          // إرجاع المبلغ إلى الرصيد المتاح
          await update(earningsRef, {
            availableBalance: (instructor.earnings?.availableBalance || 0) + withdrawal.amount,
            pendingWithdrawals: (instructor.earnings?.pendingWithdrawals || 0) - withdrawal.amount
          });
        }
      }
      
      console.log('✅ تمت معالجة طلب السحب بنجاح:', withdrawalId);
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في معالجة طلب السحب:', error);
      return { success: false, error: error.message };
    }
  }
  
  // إلغاء طلب السحب (من قبل المدرب)
  static async cancelWithdrawal(withdrawalId, instructorId) {
    try {
      const withdrawalRef = ref(db, `withdrawalRequests/${withdrawalId}`);
      const withdrawalSnapshot = await get(withdrawalRef);
      
      if (!withdrawalSnapshot.exists()) {
        return { success: false, error: 'طلب السحب غير موجود' };
      }
      
      const withdrawal = withdrawalSnapshot.val();
      
      if (withdrawal.instructorId !== instructorId) {
        return { success: false, error: 'غير مصرح لك بإلغاء هذا الطلب' };
      }
      
      if (withdrawal.status !== 'pending') {
        return { success: false, error: 'لا يمكن إلغاء طلب تمت معالجته' };
      }
      
      // تحديث الحالة
      await update(withdrawalRef, {
        status: 'cancelled',
        adminNotes: 'تم الإلغاء من قبل المدرب',
        completedAt: new Date().toISOString()
      });
      
      // إرجاع المبلغ إلى الرصيد المتاح
      const instructorRef = ref(db, `users/${instructorId}`);
      const instructorSnapshot = await get(instructorRef);
      
      if (instructorSnapshot.exists()) {
        const instructor = instructorSnapshot.val();
        const earningsRef = ref(db, `users/${instructorId}/earnings`);
        
        await update(earningsRef, {
          availableBalance: (instructor.earnings?.availableBalance || 0) + withdrawal.amount,
          pendingWithdrawals: (instructor.earnings?.pendingWithdrawals || 0) - withdrawal.amount
        });
      }
      
      console.log('✅ تم إلغاء طلب السحب بنجاح:', withdrawalId);
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في إلغاء طلب السحب:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على إحصائيات طلبات السحب (للمدير)
  static async getWithdrawalStats() {
    try {
      const withdrawalsRef = ref(db, 'withdrawalRequests');
      const snapshot = await get(withdrawalsRef);
      
      if (!snapshot.exists()) {
        return {
          success: true,
          stats: {
            total: 0,
            pending: 0,
            completed: 0,
            rejected: 0,
            cancelled: 0,
            totalAmount: 0,
            pendingAmount: 0,
            completedAmount: 0
          }
        };
      }
      
      const withdrawals = Object.values(snapshot.val());
      
      const stats = {
        total: withdrawals.length,
        pending: withdrawals.filter(w => w.status === 'pending').length,
        completed: withdrawals.filter(w => w.status === 'completed').length,
        rejected: withdrawals.filter(w => w.status === 'rejected').length,
        cancelled: withdrawals.filter(w => w.status === 'cancelled').length,
        totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
        pendingAmount: withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0),
        completedAmount: withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0)
      };
      
      return { success: true, stats };
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات طلبات السحب:', error);
      return { success: false, error: error.message };
    }
  }
  
  // التحقق من إمكانية المدرب لطلب سحب
  static async canInstructorWithdraw(instructorId) {
    try {
      const instructorRef = ref(db, `users/${instructorId}`);
      const instructorSnapshot = await get(instructorRef);
      
      if (!instructorSnapshot.exists()) {
        return { canWithdraw: false, reason: 'المدرب غير موجود' };
      }
      
      const instructor = instructorSnapshot.val();
      const availableBalance = instructor.earnings?.availableBalance || 0;
      
      if (availableBalance < 100) {
        return { canWithdraw: false, reason: 'الحد الأدنى للسحب هو 100 جنيه' };
      }
      
      // التحقق من وجود طلبات معلقة
      const withdrawalsRef = ref(db, 'withdrawalRequests');
      const withdrawalsQuery = query(withdrawalsRef, orderByChild('instructorId'), equalTo(instructorId));
      const snapshot = await get(withdrawalsQuery);
      
      if (snapshot.exists()) {
        const withdrawals = Object.values(snapshot.val());
        const hasPending = withdrawals.some(w => w.status === 'pending');
        
        if (hasPending) {
          return { canWithdraw: false, reason: 'لديك طلب سحب معلق بالفعل' };
        }
      }
      
      return { canWithdraw: true, availableBalance };
    } catch (error) {
      console.error('❌ خطأ في التحقق من إمكانية السحب:', error);
      return { canWithdraw: false, reason: error.message };
    }
  }
}

export default WithdrawalService;
