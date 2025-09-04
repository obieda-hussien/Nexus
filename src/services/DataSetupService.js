import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample data setup for Nexus Educational Platform
class DataSetupService {
  // Create sample courses
  static async createSampleCourses() {
    try {
      const courses = [
        {
          title: 'أساسيات الفيزياء للثانوية العامة',
          description: 'كورس شامل يغطي جميع أساسيات الفيزياء المطلوبة للثانوية العامة',
          subject: 'physics',
          level: 'high_school',
          instructor_id: 'instructor_1',
          duration_hours: 40,
          price: 299,
          currency: 'EGP',
          thumbnail: '/images/physics-course.jpg',
          tags: ['فيزياء', 'ثانوية عامة', 'أساسيات'],
          modules: [
            'الميكانيكا',
            'الحرارة والغازات',
            'الكهرباء والمغناطيسية',
            'الضوء والبصريات',
            'الفيزياء الحديثة'
          ],
          requirements: ['معرفة أساسية بالرياضيات', 'آلة حاسبة علمية'],
          learning_outcomes: [
            'فهم القوانين الأساسية للفيزياء',
            'حل المسائل الفيزيائية بطريقة منهجية',
            'تطبيق المفاهيم النظرية عملياً'
          ],
          status: 'active',
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          title: 'الرياضيات المتقدمة - التفاضل والتكامل',
          description: 'دراسة معمقة للتفاضل والتكامل مع التطبيقات العملية',
          subject: 'mathematics',
          level: 'university',
          instructor_id: 'instructor_2',
          duration_hours: 60,
          price: 399,
          currency: 'EGP',
          thumbnail: '/images/math-course.jpg',
          tags: ['رياضيات', 'تفاضل', 'تكامل', 'جامعة'],
          modules: [
            'النهايات والاتصال',
            'التفاضل',
            'تطبيقات التفاضل',
            'التكامل',
            'تطبيقات التكامل',
            'المعادلات التفاضلية'
          ],
          requirements: ['إتمام الجبر والهندسة بنجاح', 'معرفة جيدة بالدوال'],
          learning_outcomes: [
            'إتقان مفاهيم التفاضل والتكامل',
            'حل المعادلات التفاضلية',
            'تطبيق المفاهيم في المسائل العملية'
          ],
          status: 'active',
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          title: 'الكيمياء العضوية الأساسية',
          description: 'مقدمة شاملة للكيمياء العضوية وتفاعلاتها',
          subject: 'chemistry',
          level: 'university',
          instructor_id: 'instructor_3',
          duration_hours: 45,
          price: 349,
          currency: 'EGP',
          thumbnail: '/images/chemistry-course.jpg',
          tags: ['كيمياء', 'عضوية', 'تفاعلات', 'جامعة'],
          modules: [
            'المركبات العضوية',
            'التصاوغ',
            'التفاعلات العضوية',
            'الألكانات والألكينات',
            'المركبات الأروماتية',
            'المجموعات الوظيفية'
          ],
          requirements: ['أساسيات الكيمياء العامة', 'معرفة بالجدول الدوري'],
          learning_outcomes: [
            'فهم بنية المركبات العضوية',
            'توقع نتائج التفاعلات العضوية',
            'تطبيق المعرفة في المختبر'
          ],
          status: 'active',
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const courseIds = [];
      for (const course of courses) {
        const docRef = await addDoc(collection(db, 'courses'), course);
        courseIds.push(docRef.id);
        console.log('Created course:', docRef.id);
      }
      
      return courseIds;
    } catch (error) {
      console.error('Error creating sample courses:', error);
      return [];
    }
  }

  // Create sample lessons for courses
  static async createSampleLessons(courseIds) {
    try {
      const lessons = [
        // Physics Course Lessons
        {
          course_id: courseIds[0],
          title: 'مقدمة في الميكانيكا',
          description: 'التعرف على أساسيات الحركة والقوة',
          order: 1,
          duration_minutes: 45,
          type: 'video',
          content_url: 'https://example.com/lesson1',
          free_preview: true,
          learning_objectives: [
            'تعريف الحركة والسكون',
            'فهم مفهوم القوة',
            'تطبيق قوانين نيوتن'
          ],
          created_at: new Date().toISOString()
        },
        {
          course_id: courseIds[0],
          title: 'قوانين الحركة',
          description: 'دراسة قوانين نيوتن الثلاثة',
          order: 2,
          duration_minutes: 60,
          type: 'video',
          content_url: 'https://example.com/lesson2',
          free_preview: false,
          learning_objectives: [
            'القانون الأول لنيوتن',
            'القانون الثاني لنيوتن',
            'القانون الثالث لنيوتن'
          ],
          created_at: new Date().toISOString()
        },
        // Math Course Lessons
        {
          course_id: courseIds[1],
          title: 'مفهوم النهاية',
          description: 'التعرف على مفهوم النهاية وخصائصها',
          order: 1,
          duration_minutes: 50,
          type: 'video',
          content_url: 'https://example.com/math-lesson1',
          free_preview: true,
          learning_objectives: [
            'تعريف النهاية',
            'حساب النهايات البسيطة',
            'النهايات اللانهائية'
          ],
          created_at: new Date().toISOString()
        },
        // Chemistry Course Lessons
        {
          course_id: courseIds[2],
          title: 'مقدمة في المركبات العضوية',
          description: 'تعريف المركبات العضوية وخصائصها',
          order: 1,
          duration_minutes: 40,
          type: 'video',
          content_url: 'https://example.com/chem-lesson1',
          free_preview: true,
          learning_objectives: [
            'تعريف المركبات العضوية',
            'خصائص الكربون',
            'أنواع الروابط'
          ],
          created_at: new Date().toISOString()
        }
      ];

      for (const lesson of lessons) {
        await addDoc(collection(db, 'lessons'), lesson);
      }
      
      console.log('Sample lessons created successfully');
    } catch (error) {
      console.error('Error creating sample lessons:', error);
    }
  }

  // Create sample quizzes
  static async createSampleQuizzes(courseIds) {
    try {
      const quizzes = [
        {
          course_id: courseIds[0],
          title: 'اختبار أساسيات الميكانيكا',
          description: 'اختبار شامل على أساسيات الميكانيكا',
          order: 1,
          time_limit_minutes: 30,
          total_questions: 10,
          passing_score: 70,
          questions: [
            {
              question: 'ما هو القانون الأول لنيوتن؟',
              type: 'multiple_choice',
              options: [
                'الجسم الساكن يبقى ساكناً والمتحرك يبقى متحركاً ما لم تؤثر عليه قوة خارجية',
                'القوة تساوي الكتلة مضروبة في التسارع',
                'لكل فعل رد فعل مساوٍ له في المقدار ومضاد له في الاتجاه',
                'الطاقة لا تفنى ولا تستحدث'
              ],
              correct_answer: 0,
              explanation: 'القانون الأول لنيوتن ينص على أن الجسم يحافظ على حالة السكون أو الحركة المنتظمة ما لم تؤثر عليه قوة خارجية'
            },
            {
              question: 'وحدة قياس القوة في النظام الدولي هي:',
              type: 'multiple_choice',
              options: ['كيلوجرام', 'متر', 'نيوتن', 'جول'],
              correct_answer: 2,
              explanation: 'النيوتن هو وحدة قياس القوة في النظام الدولي'
            }
          ],
          created_at: new Date().toISOString()
        }
      ];

      for (const quiz of quizzes) {
        await addDoc(collection(db, 'quizzes'), quiz);
      }
      
      console.log('Sample quizzes created successfully');
    } catch (error) {
      console.error('Error creating sample quizzes:', error);
    }
  }

  // Create sample live sessions
  static async createSampleLiveSessions() {
    try {
      const sessions = [
        {
          title: 'مراجعة شاملة في الفيزياء',
          instructor_name: 'د. أحمد محمد',
          subject: 'physics',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration_minutes: 90,
          max_participants: 100,
          current_participants: 45,
          description: 'مراجعة شاملة لأهم موضوعات الفيزياء مع حل أمثلة تطبيقية',
          meeting_url: 'https://meet.nexus.com/physics-review',
          status: 'scheduled',
          tags: ['مراجعة', 'فيزياء', 'أمثلة'],
          created_at: new Date().toISOString()
        },
        {
          title: 'حل مسائل التفاضل والتكامل',
          instructor_name: 'د. فاطمة علي',
          subject: 'mathematics',
          scheduled_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          duration_minutes: 120,
          max_participants: 80,
          current_participants: 32,
          description: 'جلسة تفاعلية لحل مسائل متنوعة في التفاضل والتكامل',
          meeting_url: 'https://meet.nexus.com/calculus-problems',
          status: 'scheduled',
          tags: ['تفاضل', 'تكامل', 'مسائل'],
          created_at: new Date().toISOString()
        },
        {
          title: 'تجارب الكيمياء العضوية',
          instructor_name: 'د. محمد حسن',
          subject: 'chemistry',
          scheduled_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
          duration_minutes: 105,
          max_participants: 50,
          current_participants: 28,
          description: 'عرض تجارب عملية في الكيمياء العضوية مع الشرح التفصيلي',
          meeting_url: 'https://meet.nexus.com/organic-chemistry-lab',
          status: 'scheduled',
          tags: ['تجارب', 'كيمياء عضوية', 'عملي'],
          created_at: new Date().toISOString()
        }
      ];

      for (const session of sessions) {
        await addDoc(collection(db, 'live_sessions'), session);
      }
      
      console.log('Sample live sessions created successfully');
    } catch (error) {
      console.error('Error creating sample live sessions:', error);
    }
  }

  // Create sample instructors
  static async createSampleInstructors() {
    try {
      const instructors = [
        {
          id: 'instructor_1',
          name: 'د. أحمد محمد علي',
          title: 'أستاذ الفيزياء - جامعة القاهرة',
          bio: 'دكتوراه في الفيزياء النظرية مع خبرة 15 عام في التدريس الجامعي والثانوي',
          specialties: ['فيزياء', 'رياضيات', 'فيزياء نووية'],
          experience_years: 15,
          education: ['دكتوراه فيزياء - جامعة القاهرة', 'ماجستير فيزياء - جامعة عين شمس'],
          rating: 4.8,
          total_students: 2500,
          profile_image: '/images/instructor-1.jpg',
          languages: ['العربية', 'الإنجليزية'],
          created_at: new Date().toISOString()
        },
        {
          id: 'instructor_2',
          name: 'د. فاطمة علي محمود',
          title: 'أستاذة الرياضيات - جامعة الأزهر',
          bio: 'خبيرة في الرياضيات التطبيقية مع التركيز على التفاضل والتكامل والإحصاء',
          specialties: ['رياضيات', 'إحصاء', 'تحليل عددي'],
          experience_years: 12,
          education: ['دكتوراه رياضيات - جامعة الأزهر', 'ماجستير رياضيات تطبيقية - جامعة القاهرة'],
          rating: 4.9,
          total_students: 1800,
          profile_image: '/images/instructor-2.jpg',
          languages: ['العربية', 'الإنجليزية'],
          created_at: new Date().toISOString()
        },
        {
          id: 'instructor_3',
          name: 'د. محمد حسن إبراهيم',
          title: 'أستاذ الكيمياء - جامعة عين شمس',
          bio: 'متخصص في الكيمياء العضوية والتحليلية مع خبرة واسعة في الأبحاث والتدريس',
          specialties: ['كيمياء عضوية', 'كيمياء تحليلية', 'كيمياء حيوية'],
          experience_years: 18,
          education: ['دكتوراه كيمياء عضوية - جامعة عين شمس', 'ماجستير كيمياء - جامعة القاهرة'],
          rating: 4.7,
          total_students: 2100,
          profile_image: '/images/instructor-3.jpg',
          languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
          created_at: new Date().toISOString()
        }
      ];

      for (const instructor of instructors) {
        await setDoc(doc(db, 'instructors', instructor.id), instructor);
      }
      
      console.log('Sample instructors created successfully');
    } catch (error) {
      console.error('Error creating sample instructors:', error);
    }
  }

  // Setup all sample data
  static async setupAllSampleData() {
    try {
      console.log('Starting sample data setup...');
      
      // Create instructors first
      await this.createSampleInstructors();
      
      // Create courses
      const courseIds = await this.createSampleCourses();
      
      if (courseIds.length > 0) {
        // Create lessons for courses
        await this.createSampleLessons(courseIds);
        
        // Create quizzes for courses
        await this.createSampleQuizzes(courseIds);
      }
      
      // Create live sessions
      await this.createSampleLiveSessions();
      
      console.log('Sample data setup completed successfully!');
      return true;
    } catch (error) {
      console.error('Error setting up sample data:', error);
      return false;
    }
  }
}

export default DataSetupService;