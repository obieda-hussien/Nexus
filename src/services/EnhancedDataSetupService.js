// خدمة إعداد البيانات التجريبية الشاملة - منصة Nexus
// Enhanced Data Setup Service for Nexus LMS

import { ref, set, get } from 'firebase/database';
import { db } from '../config/firebase';

class EnhancedDataSetupService {
  
  // إضافة جميع البيانات التجريبية دفعة واحدة
  static async setupAllSampleData() {
    try {
      console.log('🚀 بدء إضافة البيانات التجريبية...');
      
      // فحص إذا كانت البيانات موجودة بالفعل
      const coursesRef = ref(db, 'courses');
      const coursesSnapshot = await get(coursesRef);
      
      if (coursesSnapshot.exists()) {
        console.log('⚠️ البيانات موجودة بالفعل. هل تريد المتابعة؟');
        // يمكن إضافة تأكيد هنا
      }
      
      // إضافة المستخدمين
      await this.setupUsers();
      
      // إضافة الكورسات
      await this.setupCourses();
      
      // إضافة الدروس
      await this.setupLessons();
      
      // إضافة التسجيلات
      await this.setupEnrollments();
      
      // إضافة التقييمات
      await this.setupReviews();
      
      // إضافة التقدم
      await this.setupProgress();
      
      // إضافة طلبات السحب
      await this.setupWithdrawals();
      
      console.log('✅ تم إضافة جميع البيانات التجريبية بنجاح!');
      return { success: true, message: 'تم إعداد البيانات بنجاح' };
    } catch (error) {
      console.error('❌ خطأ في إعداد البيانات:', error);
      return { success: false, error: error.message };
    }
  }
  
  // إضافة المستخدمين التجريبيين
  static async setupUsers() {
    try {
      const users = {
        // طلاب
        'student001': {
          uid: 'student001',
          displayName: 'أحمد محمد علي',
          email: 'ahmed.test@nexus.edu',
          role: 'student',
          createdAt: '2025-10-01T10:00:00Z',
          lastLogin: '2025-10-30T15:30:00Z',
          profilePicture: null,
          bio: 'طالب في الثانوية العامة شغوف بالفيزياء والرياضيات',
          phoneNumber: '+201234567890',
          dateOfBirth: '2006-05-15',
          preferences: {
            language: 'ar',
            notifications: true,
            darkMode: true,
            theme: 'dark'
          }
        },
        'student002': {
          uid: 'student002',
          displayName: 'فاطمة علي حسن',
          email: 'fatima.test@nexus.edu',
          role: 'student',
          createdAt: '2025-10-05T14:00:00Z',
          lastLogin: '2025-10-30T16:00:00Z',
          profilePicture: null,
          bio: 'مهتمة بالكيمياء والعلوم الحيوية',
          phoneNumber: '+201234567891',
          dateOfBirth: '2006-08-20',
          preferences: {
            language: 'ar',
            notifications: true,
            darkMode: false,
            theme: 'light'
          }
        },
        
        // مدربين
        'instructor001': {
          uid: 'instructor001',
          displayName: 'د. محمد أحمد حسن',
          email: 'mohamed.hassan@nexus.edu',
          role: 'instructor',
          createdAt: '2025-09-15T09:00:00Z',
          lastLogin: '2025-10-30T12:45:00Z',
          profilePicture: null,
          bio: 'أستاذ الفيزياء النظرية في جامعة القاهرة مع خبرة 15 سنة في التدريس والبحث العلمي',
          phoneNumber: '+201112223334',
          dateOfBirth: '1980-03-20',
          preferences: {
            language: 'ar',
            notifications: true,
            darkMode: false,
            theme: 'light'
          },
          instructorProfile: {
            bio: 'متخصص في الفيزياء النظرية والتطبيقية مع تركيز على ميكانيكا الكم والنسبية',
            specialization: 'physics',
            experience: '15 years',
            coursesCreated: 4,
            totalStudents: 287,
            rating: 4.8,
            joinedAsInstructorAt: '2025-09-15T09:00:00Z',
            qualifications: [
              'دكتوراه في الفيزياء النظرية - جامعة القاهرة',
              'ماجستير في الفيزياء التطبيقية - جامعة عين شمس',
              'بكالوريوس الفيزياء - جامعة القاهرة'
            ],
            achievements: [
              'جائزة أفضل مدرس فيزياء 2023',
              'نشر أكثر من 25 بحثاً علمياً',
              'تدريس أكثر من 1000 طالب'
            ]
          },
          earnings: {
            totalEarned: 15750,
            pendingWithdrawals: 2500,
            availableBalance: 3250,
            totalWithdrawals: 10000,
            lifetimeEarnings: 15750
          }
        },
        'instructor002': {
          uid: 'instructor002',
          displayName: 'م. سارة محمود',
          email: 'sara.mahmoud@nexus.edu',
          role: 'instructor',
          createdAt: '2025-09-20T10:00:00Z',
          lastLogin: '2025-10-30T11:00:00Z',
          profilePicture: null,
          bio: 'مهندسة برمجيات ومدربة معتمدة في تطوير الويب',
          phoneNumber: '+201112223335',
          dateOfBirth: '1992-07-12',
          preferences: {
            language: 'ar',
            notifications: true,
            darkMode: true,
            theme: 'dark'
          },
          instructorProfile: {
            bio: 'متخصصة في تطوير تطبيقات الويب الحديثة باستخدام React وNode.js',
            specialization: 'programming',
            experience: '7 years',
            coursesCreated: 3,
            totalStudents: 156,
            rating: 4.9,
            joinedAsInstructorAt: '2025-09-20T10:00:00Z',
            qualifications: [
              'بكالوريوس هندسة الحاسوب - جامعة القاهرة',
              'شهادة AWS Solutions Architect',
              'شهادة React Developer Professional'
            ],
            achievements: [
              'أفضل مدربة برمجة للعام 2024',
              'تطوير أكثر من 50 تطبيق ويب',
              'مساهمة في مشاريع مفتوحة المصدر'
            ]
          },
          earnings: {
            totalEarned: 8900,
            pendingWithdrawals: 0,
            availableBalance: 1900,
            totalWithdrawals: 7000,
            lifetimeEarnings: 8900
          }
        },
        
        // مدير
        'admin001': {
          uid: 'admin001',
          displayName: 'إدارة النظام',
          email: 'admin@nexus.edu',
          role: 'admin',
          createdAt: '2025-09-01T08:00:00Z',
          lastLogin: '2025-10-30T18:00:00Z',
          profilePicture: null,
          preferences: {
            language: 'ar',
            notifications: true,
            darkMode: true,
            theme: 'dark'
          }
        }
      };
      
      await set(ref(db, 'users'), users);
      console.log('✅ تم إضافة المستخدمين');
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في إضافة المستخدمين:', error);
      throw error;
    }
  }
  
  // إضافة الكورسات التجريبية
  static async setupCourses() {
    try {
      const courses = {
        'course001': {
          id: 'course001',
          title: 'أساسيات الفيزياء للثانوية العامة',
          shortDescription: 'دورة شاملة لفهم قوانين الفيزياء الأساسية',
          description: 'دورة متكاملة تغطي جميع موضوعات الفيزياء للصف الثالث الثانوي مع تطبيقات عملية وحلول للمسائل المعقدة. شرح مبسط وواضح مع أمثلة من الحياة اليومية.',
          category: 'physics',
          level: 'beginner',
          instructorId: 'instructor001',
          instructorName: 'د. محمد أحمد حسن',
          price: 200,
          currency: 'EGP',
          isFree: false,
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
          duration: 1800,
          lessonsCount: 25,
          status: 'published',
          isActive: true,
          createdAt: '2025-09-20T10:00:00Z',
          updatedAt: '2025-10-15T14:30:00Z',
          publishedAt: '2025-09-25T16:00:00Z',
          studentsCount: 87,
          rating: 4.7,
          reviewsCount: 23,
          salesCount: 87,
          totalRevenue: 17400,
          tags: ['فيزياء', 'ثانوية عامة', 'امتحانات'],
          requirements: ['معرفة أساسية بالرياضيات', 'إكمال الصف الثاني الثانوي'],
          objectives: [
            'فهم قوانين نيوتن للحركة',
            'تطبيق قوانين الحفظ',
            'حل المسائل الفيزيائية المعقدة'
          ],
          whoShouldAttend: [
            'طلاب الصف الثالث الثانوي',
            'الطلاب المستعدون للامتحانات',
            'المهتمون بدراسة الفيزياء'
          ],
          courseLanguage: 'ar',
          certificate: true
        },
        'course002': {
          id: 'course002',
          title: 'ميكانيكا الكم للمبتدئين',
          shortDescription: 'مقدمة مبسطة لعالم ميكانيكا الكم',
          description: 'استكشف عالم الذرة والجسيمات من خلال مفاهيم ميكانيكا الكم المبسطة والممتعة. رحلة علمية شيقة في عالم الفيزياء الحديثة.',
          category: 'physics',
          level: 'advanced',
          instructorId: 'instructor001',
          instructorName: 'د. محمد أحمد حسن',
          price: 350,
          currency: 'EGP',
          isFree: false,
          thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800',
          duration: 2400,
          lessonsCount: 30,
          status: 'published',
          isActive: true,
          createdAt: '2025-10-01T11:00:00Z',
          updatedAt: '2025-10-20T09:15:00Z',
          publishedAt: '2025-10-05T14:00:00Z',
          studentsCount: 34,
          rating: 4.9,
          reviewsCount: 12,
          salesCount: 34,
          totalRevenue: 11900,
          tags: ['فيزياء متقدمة', 'ميكانيكا الكم', 'جامعة'],
          requirements: [
            'إتمام دورات الفيزياء الأساسية',
            'معرفة أساسية بالتفاضل والتكامل'
          ],
          objectives: [
            'فهم مبادئ ميكانيكا الكم',
            'تطبيق معادلة شرودنجر',
            'فهم مبدأ عدم اليقين'
          ],
          whoShouldAttend: [
            'طلاب الفيزياء الجامعية',
            'الباحثين في الفيزياء',
            'المهتمون بالعلوم الحديثة'
          ],
          courseLanguage: 'ar',
          certificate: true
        },
        'course003': {
          id: 'course003',
          title: 'مقدمة في الكيمياء العامة',
          shortDescription: 'تعلم أساسيات الكيمياء في وقت قصير',
          description: 'دورة مجانية ومختصرة تغطي أساسيات الكيمياء العامة مع شرح مبسط وتجارب عملية.',
          category: 'chemistry',
          level: 'beginner',
          instructorId: 'instructor002',
          instructorName: 'د. سارة محمود',
          price: 0,
          currency: 'EGP',
          isFree: true,
          thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800',
          duration: 900,
          lessonsCount: 15,
          status: 'published',
          isActive: true,
          createdAt: '2025-10-10T13:00:00Z',
          updatedAt: '2025-10-25T16:20:00Z',
          publishedAt: '2025-10-12T10:00:00Z',
          studentsCount: 245,
          rating: 4.5,
          reviewsCount: 67,
          salesCount: 0,
          totalRevenue: 0,
          tags: ['كيمياء', 'مجاني', 'مبتدئين'],
          requirements: [],
          objectives: [
            'فهم الجدول الدوري',
            'التعرف على الروابط الكيميائية',
            'أساسيات التفاعلات الكيميائية'
          ],
          whoShouldAttend: [
            'المبتدئين في الكيمياء',
            'طلاب المرحلة الإعدادية'
          ],
          courseLanguage: 'ar',
          certificate: true
        },
        'course004': {
          id: 'course004',
          title: 'تطوير تطبيقات الويب بـ React',
          shortDescription: 'تعلم بناء تطبيقات ويب حديثة',
          description: 'دورة شاملة لتعلم React من الصفر حتى الاحتراف مع مشاريع عملية حقيقية.',
          category: 'programming',
          level: 'intermediate',
          instructorId: 'instructor002',
          instructorName: 'م. سارة محمود',
          price: 450,
          currency: 'EGP',
          isFree: false,
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
          duration: 3000,
          lessonsCount: 40,
          status: 'published',
          isActive: true,
          createdAt: '2025-10-01T09:00:00Z',
          updatedAt: '2025-10-28T11:00:00Z',
          publishedAt: '2025-10-03T10:00:00Z',
          studentsCount: 122,
          rating: 4.9,
          reviewsCount: 45,
          salesCount: 122,
          totalRevenue: 54900,
          tags: ['برمجة', 'React', 'JavaScript', 'تطوير ويب'],
          requirements: [
            'معرفة أساسية بـ HTML و CSS',
            'فهم JavaScript الأساسي'
          ],
          objectives: [
            'بناء تطبيقات React من الصفر',
            'إدارة الحالة مع Redux',
            'التعامل مع APIs',
            'نشر التطبيقات'
          ],
          whoShouldAttend: [
            'مطوري الويب المبتدئين',
            'من يريد تعلم React',
            'المهتمون بتطوير الواجهات الأمامية'
          ],
          courseLanguage: 'ar',
          certificate: true
        },
        'course005': {
          id: 'course005',
          title: 'الرياضيات المتقدمة للثانوية',
          shortDescription: 'حساب التفاضل والتكامل',
          description: 'شرح مفصل لمفاهيم حساب التفاضل والتكامل مع حلول تفصيلية للمسائل.',
          category: 'mathematics',
          level: 'intermediate',
          instructorId: 'instructor001',
          instructorName: 'د. محمد أحمد حسن',
          price: 250,
          currency: 'EGP',
          isFree: false,
          thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800',
          duration: 2000,
          lessonsCount: 28,
          status: 'published',
          isActive: true,
          createdAt: '2025-09-25T10:00:00Z',
          updatedAt: '2025-10-20T15:00:00Z',
          publishedAt: '2025-09-28T12:00:00Z',
          studentsCount: 166,
          rating: 4.6,
          reviewsCount: 38,
          salesCount: 166,
          totalRevenue: 41500,
          tags: ['رياضيات', 'تفاضل', 'تكامل', 'ثانوية عامة'],
          requirements: ['معرفة بأساسيات الجبر', 'إكمال الصف الثاني الثانوي'],
          objectives: [
            'فهم مفاهيم التفاضل',
            'تطبيق قواعد التكامل',
            'حل المسائل المعقدة'
          ],
          whoShouldAttend: [
            'طلاب الثانوية العامة',
            'المستعدون للامتحانات'
          ],
          courseLanguage: 'ar',
          certificate: true
        }
      };
      
      await set(ref(db, 'courses'), courses);
      console.log('✅ تم إضافة الكورسات');
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في إضافة الكورسات:', error);
      throw error;
    }
  }
  
  // إضافة الدروس التجريبية
  static async setupLessons() {
    try {
      const lessons = {
        'lesson001': {
          id: 'lesson001',
          courseId: 'course001',
          title: 'مقدمة في علم الفيزياء',
          description: 'نظرة عامة على علم الفيزياء وتطبيقاته',
          content: '<p>في هذا الدرس نتعرف على:</p><ul><li>تعريف علم الفيزياء</li><li>فروع الفيزياء المختلفة</li><li>أهمية الفيزياء في حياتنا</li></ul>',
          videoUrl: 'https://example.com/video1.mp4',
          duration: 720,
          order: 1,
          type: 'video',
          isPreview: true,
          createdAt: '2025-09-20T10:00:00Z',
          updatedAt: '2025-10-01T14:30:00Z'
        },
        'lesson002': {
          id: 'lesson002',
          courseId: 'course001',
          title: 'قوانين نيوتن للحركة',
          description: 'دراسة تفصيلية لقوانين نيوتن الثلاثة',
          content: '<p>ندرس في هذا الدرس:</p><ul><li>قانون نيوتن الأول (قصور الحركة)</li><li>قانون نيوتن الثاني (F=ma)</li><li>قانون نيوتن الثالث (الفعل ورد الفعل)</li></ul>',
          videoUrl: 'https://example.com/video2.mp4',
          duration: 1080,
          order: 2,
          type: 'video',
          isPreview: false,
          createdAt: '2025-09-20T10:00:00Z',
          updatedAt: '2025-10-05T11:15:00Z'
        },
        'lesson003': {
          id: 'lesson003',
          courseId: 'course001',
          title: 'الشغل والطاقة',
          description: 'مفاهيم الشغل والطاقة وقوانين الحفظ',
          content: '<p>محتوى الدرس:</p><ul><li>تعريف الشغل</li><li>أنواع الطاقة</li><li>قانون حفظ الطاقة</li></ul>',
          videoUrl: 'https://example.com/video3.mp4',
          duration: 900,
          order: 3,
          type: 'video',
          isPreview: false,
          createdAt: '2025-09-20T10:00:00Z',
          updatedAt: '2025-10-08T09:00:00Z'
        },
        'lesson004': {
          id: 'lesson004',
          courseId: 'course003',
          title: 'مقدمة في الكيمياء',
          description: 'أساسيات علم الكيمياء',
          content: '<p>موضوعات الدرس:</p><ul><li>ما هي الكيمياء</li><li>المادة وخصائصها</li><li>الذرة والجزيء</li></ul>',
          videoUrl: 'https://example.com/chem1.mp4',
          duration: 600,
          order: 1,
          type: 'video',
          isPreview: true,
          createdAt: '2025-10-10T13:00:00Z',
          updatedAt: '2025-10-15T10:00:00Z'
        },
        'lesson005': {
          id: 'lesson005',
          courseId: 'course003',
          title: 'الجدول الدوري',
          description: 'فهم الجدول الدوري وترتيب العناصر',
          content: '<p>في هذا الدرس:</p><ul><li>تاريخ الجدول الدوري</li><li>المجموعات والدورات</li><li>خواص العناصر</li></ul>',
          videoUrl: 'https://example.com/chem2.mp4',
          duration: 720,
          order: 2,
          type: 'video',
          isPreview: false,
          createdAt: '2025-10-10T13:00:00Z',
          updatedAt: '2025-10-16T11:30:00Z'
        }
      };
      
      await set(ref(db, 'lessons'), lessons);
      console.log('✅ تم إضافة الدروس');
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في إضافة الدروس:', error);
      throw error;
    }
  }
  
  // إضافة التسجيلات
  static async setupEnrollments() {
    try {
      const enrollments = {
        'enrollment001': {
          id: 'enrollment001',
          userId: 'student001',
          courseId: 'course001',
          enrolledAt: '2025-10-15T16:30:00Z',
          progress: 65,
          completedLessons: ['lesson001', 'lesson002'],
          currentLesson: 'lesson003',
          lastAccessedAt: '2025-10-30T14:20:00Z',
          timeSpent: 7200,
          paymentStatus: 'paid',
          paymentMethod: 'vodafone',
          transactionId: 'txn_001_nexus',
          amount: 200,
          certificate: {
            issued: false,
            issuedAt: null,
            certificateId: null
          }
        },
        'enrollment002': {
          id: 'enrollment002',
          userId: 'student001',
          courseId: 'course003',
          enrolledAt: '2025-10-20T10:00:00Z',
          progress: 100,
          completedLessons: ['lesson004', 'lesson005'],
          currentLesson: null,
          lastAccessedAt: '2025-10-28T18:45:00Z',
          timeSpent: 3600,
          paymentStatus: 'free',
          paymentMethod: 'free',
          transactionId: null,
          amount: 0,
          certificate: {
            issued: true,
            issuedAt: '2025-10-28T18:45:00Z',
            certificateId: 'CERT-1730141100-ABC123DEF'
          }
        },
        'enrollment003': {
          id: 'enrollment003',
          userId: 'student002',
          courseId: 'course001',
          enrolledAt: '2025-10-18T09:00:00Z',
          progress: 30,
          completedLessons: ['lesson001'],
          currentLesson: 'lesson002',
          lastAccessedAt: '2025-10-29T19:00:00Z',
          timeSpent: 2400,
          paymentStatus: 'paid',
          paymentMethod: 'paypal',
          transactionId: 'txn_002_nexus',
          amount: 200,
          certificate: {
            issued: false,
            issuedAt: null,
            certificateId: null
          }
        },
        'enrollment004': {
          id: 'enrollment004',
          userId: 'student002',
          courseId: 'course003',
          enrolledAt: '2025-10-22T11:00:00Z',
          progress: 50,
          completedLessons: ['lesson004'],
          currentLesson: 'lesson005',
          lastAccessedAt: '2025-10-30T10:00:00Z',
          timeSpent: 1800,
          paymentStatus: 'free',
          paymentMethod: 'free',
          transactionId: null,
          amount: 0,
          certificate: {
            issued: false,
            issuedAt: null,
            certificateId: null
          }
        }
      };
      
      await set(ref(db, 'enrollments'), enrollments);
      console.log('✅ تم إضافة التسجيلات');
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في إضافة التسجيلات:', error);
      throw error;
    }
  }
  
  // إضافة التقييمات
  static async setupReviews() {
    try {
      const reviews = {
        'review001': {
          id: 'review001',
          userId: 'student001',
          courseId: 'course001',
          rating: 5,
          comment: 'دورة ممتازة ومفيدة جداً، الشرح واضح والأمثلة عملية. أنصح بها بشدة!',
          status: 'approved',
          createdAt: '2025-10-28T20:30:00Z',
          updatedAt: '2025-10-28T20:30:00Z',
          helpfulVotes: 8
        },
        'review002': {
          id: 'review002',
          userId: 'student001',
          courseId: 'course003',
          rating: 5,
          comment: 'دورة رائعة للمبتدئين، الشرح مبسط وسهل الفهم',
          status: 'approved',
          createdAt: '2025-10-28T19:00:00Z',
          updatedAt: '2025-10-28T19:00:00Z',
          helpfulVotes: 5
        },
        'review003': {
          id: 'review003',
          userId: 'student002',
          courseId: 'course001',
          rating: 4,
          comment: 'دورة جيدة جداً ولكن أتمنى إضافة المزيد من الأمثلة العملية',
          status: 'approved',
          createdAt: '2025-10-29T21:00:00Z',
          updatedAt: '2025-10-29T21:00:00Z',
          helpfulVotes: 3
        }
      };
      
      await set(ref(db, 'reviews'), reviews);
      console.log('✅ تم إضافة التقييمات');
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في إضافة التقييمات:', error);
      throw error;
    }
  }
  
  // إضافة التقدم
  static async setupProgress() {
    try {
      const progress = {
        'student001': {
          'course001': {
            'lesson001': {
              completed: true,
              completedAt: '2025-10-20T14:30:00Z',
              timeSpent: 720,
              score: 95,
              attempts: 1,
              lastAccessedAt: '2025-10-20T14:30:00Z'
            },
            'lesson002': {
              completed: true,
              completedAt: '2025-10-25T16:15:00Z',
              timeSpent: 1080,
              score: 88,
              attempts: 2,
              lastAccessedAt: '2025-10-25T16:15:00Z'
            },
            'lesson003': {
              completed: false,
              completedAt: null,
              timeSpent: 300,
              score: null,
              attempts: 1,
              lastAccessedAt: '2025-10-30T14:20:00Z'
            }
          },
          'course003': {
            'lesson004': {
              completed: true,
              completedAt: '2025-10-21T10:00:00Z',
              timeSpent: 600,
              score: 92,
              attempts: 1,
              lastAccessedAt: '2025-10-21T10:00:00Z'
            },
            'lesson005': {
              completed: true,
              completedAt: '2025-10-28T18:45:00Z',
              timeSpent: 720,
              score: 90,
              attempts: 1,
              lastAccessedAt: '2025-10-28T18:45:00Z'
            }
          }
        },
        'student002': {
          'course001': {
            'lesson001': {
              completed: true,
              completedAt: '2025-10-25T15:00:00Z',
              timeSpent: 750,
              score: 85,
              attempts: 1,
              lastAccessedAt: '2025-10-25T15:00:00Z'
            },
            'lesson002': {
              completed: false,
              completedAt: null,
              timeSpent: 450,
              score: null,
              attempts: 1,
              lastAccessedAt: '2025-10-29T19:00:00Z'
            }
          },
          'course003': {
            'lesson004': {
              completed: true,
              completedAt: '2025-10-26T12:00:00Z',
              timeSpent: 650,
              score: 88,
              attempts: 1,
              lastAccessedAt: '2025-10-26T12:00:00Z'
            },
            'lesson005': {
              completed: false,
              completedAt: null,
              timeSpent: 400,
              score: null,
              attempts: 1,
              lastAccessedAt: '2025-10-30T10:00:00Z'
            }
          }
        }
      };
      
      await set(ref(db, 'user_progress'), progress);
      console.log('✅ تم إضافة التقدم');
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في إضافة التقدم:', error);
      throw error;
    }
  }
  
  // إضافة طلبات السحب
  static async setupWithdrawals() {
    try {
      const withdrawals = {
        'withdrawal001': {
          id: 'withdrawal001',
          instructorId: 'instructor001',
          amount: 2500,
          currency: 'EGP',
          paymentMethod: 'bank',
          paymentDetails: {
            bankName: 'البنك الأهلي المصري',
            accountNumber: '1234567890123',
            accountHolder: 'محمد أحمد حسن'
          },
          status: 'pending',
          adminNotes: '',
          requestedAt: '2025-10-29T12:00:00Z',
          processedAt: null,
          completedAt: null,
          transactionReference: ''
        }
      };
      
      await set(ref(db, 'withdrawalRequests'), withdrawals);
      console.log('✅ تم إضافة طلبات السحب');
      return { success: true };
    } catch (error) {
      console.error('❌ خطأ في إضافة طلبات السحب:', error);
      throw error;
    }
  }
  
  // مسح جميع البيانات
  static async clearAllData() {
    try {
      console.log('🗑️ بدء مسح جميع البيانات...');
      
      const nodes = [
        'users',
        'courses',
        'lessons',
        'enrollments',
        'reviews',
        'user_progress',
        'withdrawalRequests',
        'instructorApplications',
        'notifications'
      ];
      
      for (const node of nodes) {
        await set(ref(db, node), null);
        console.log(`✅ تم مسح ${node}`);
      }
      
      console.log('✅ تم مسح جميع البيانات بنجاح');
      return { success: true, message: 'تم مسح البيانات' };
    } catch (error) {
      console.error('❌ خطأ في مسح البيانات:', error);
      return { success: false, error: error.message };
    }
  }
}

export default EnhancedDataSetupService;
