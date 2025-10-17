import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample data setup for Nexus Educational Platform
class DataSetupService {
  // Create sample courses
  static async createSampleCourses() {
    try {
      const courses = [
        {
          title: 'Physics Basics للثانوية العامة',
          description: 'كورس شامل يغطي جميع Physics Basics المطلوبة للثانوية العامة',
          subject: 'physics',
          level: 'high_school',
          instructor_id: 'instructor_1',
          duration_hours: 40,
          price: 299,
          currency: 'EGP',
          thumbnail: '/images/physics-course.jpg',
          tags: ['Physics', 'ثانوية عامة', 'أساسيات'],
          modules: [
            'الميكانيكا',
            'الحرارة والغازات',
            'الكهرباء والمغناطيسية',
            'الضوء والبصريات',
            'Physics الحديثة'
          ],
          requirements: ['معرفة أساسية بMathematics', 'آلة حاسبة علمية'],
          learning_outcomes: [
            'فهم القوانين الأساسية للPhysics',
            'حل المسائل الفيزيائية بطريقة منهجية',
            'تطبيق المفاهيم النظرية عملياً'
          ],
          status: 'active',
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          title: 'Mathematics الAdvancedة - الCalculus والIntegration',
          description: 'دراسة معمقة للCalculus والIntegration مع التطبيقات العملية',
          subject: 'mathematics',
          level: 'university',
          instructor_id: 'instructor_2',
          duration_hours: 60,
          price: 399,
          currency: 'EGP',
          thumbnail: '/images/math-course.jpg',
          tags: ['Mathematics', 'Calculus', 'Integration', 'University'],
          modules: [
            'النهايات والاتصال',
            'الCalculus',
            'تطبيقات الCalculus',
            'الIntegration',
            'تطبيقات الIntegration',
            'المعادلات الCalculusية'
          ],
          requirements: ['إتمام الجبر والهندسة بنجاح', 'معرفة جيدة بالدوال'],
          learning_outcomes: [
            'إتقان مفاهيم الCalculus والIntegration',
            'حل المعادلات الCalculusية',
            'تطبيق المفاهيم في المسائل العملية'
          ],
          status: 'active',
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          title: 'Chemistry العضوية الأساسية',
          description: 'مقدمة شاملة للChemistry العضوية وتفاعلاتها',
          subject: 'chemistry',
          level: 'university',
          instructor_id: 'instructor_3',
          duration_hours: 45,
          price: 349,
          currency: 'EGP',
          thumbnail: '/images/chemistry-course.jpg',
          tags: ['Chemistry', 'عضوية', 'تفاعلات', 'University'],
          modules: [
            'المركبات العضوية',
            'التصاوغ',
            'التفاعلات العضوية',
            'الألكانات والألكينات',
            'المركبات الأروماتية',
            'المجموعات الوظيفية'
          ],
          requirements: ['أساسيات Chemistry العامة', 'معرفة بالجدول الدوري'],
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
          title: 'Quiz أساسيات الميكانيكا',
          description: 'Quiz شامل على أساسيات الميكانيكا',
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
          title: 'مراجعة شاملة في Physics',
          instructor_name: 'د. أحمد محمد',
          subject: 'physics',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration_minutes: 90,
          max_participants: 100,
          current_participants: 45,
          description: 'مراجعة شاملة لأهم موضوعات Physics مع حل أمثلة تطبيقية',
          meeting_url: 'https://meet.nexus.com/physics-review',
          status: 'scheduled',
          tags: ['مراجعة', 'Physics', 'أمثلة'],
          created_at: new Date().toISOString()
        },
        {
          title: 'حل مسائل الCalculus والIntegration',
          instructor_name: 'د. فاطمة علي',
          subject: 'mathematics',
          scheduled_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          duration_minutes: 120,
          max_participants: 80,
          current_participants: 32,
          description: 'جلسة تفاعلية لحل مسائل متنوعة في الCalculus والIntegration',
          meeting_url: 'https://meet.nexus.com/calculus-problems',
          status: 'scheduled',
          tags: ['Calculus', 'Integration', 'مسائل'],
          created_at: new Date().toISOString()
        },
        {
          title: 'تجارب Chemistry العضوية',
          instructor_name: 'د. محمد حسن',
          subject: 'chemistry',
          scheduled_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
          duration_minutes: 105,
          max_participants: 50,
          current_participants: 28,
          description: 'View تجارب عملية في Chemistry العضوية مع الشرح التفصيلي',
          meeting_url: 'https://meet.nexus.com/organic-chemistry-lab',
          status: 'scheduled',
          tags: ['تجارب', 'Organic Chemistry', 'عملي'],
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
          title: 'أستاذ Physics - University القاهرة',
          bio: 'دكتوراه في Physics النظرية مع خبرة 15 عام في التدريس الجامعي والثانوي',
          specialties: ['Physics', 'Mathematics', 'Physics نووية'],
          experience_years: 15,
          education: ['دكتوراه Physics - University القاهرة', 'ماجستير Physics - University عين شمس'],
          rating: 4.8,
          total_students: 2500,
          profile_image: '/images/instructor-1.jpg',
          languages: ['Arabic', 'English'],
          created_at: new Date().toISOString()
        },
        {
          id: 'instructor_2',
          name: 'د. فاطمة علي محمود',
          title: 'أستاذة Mathematics - University الأزهر',
          bio: 'خبيرة في Applied Mathematics مع التركيز على الCalculus والIntegration والإحصاء',
          specialties: ['Mathematics', 'إحصاء', 'تحليل عددي'],
          experience_years: 12,
          education: ['دكتوراه Mathematics - University الأزهر', 'ماجستير Mathematics تطبيقية - University القاهرة'],
          rating: 4.9,
          total_students: 1800,
          profile_image: '/images/instructor-2.jpg',
          languages: ['Arabic', 'English'],
          created_at: new Date().toISOString()
        },
        {
          id: 'instructor_3',
          name: 'د. محمد حسن إبراهيم',
          title: 'أستاذ Chemistry - University عين شمس',
          bio: 'متخصص في Chemistry العضوية والتحليلية مع خبرة واسعة في الأبحاث والتدريس',
          specialties: ['Organic Chemistry', 'Chemistry تحليلية', 'Chemistry حيوية'],
          experience_years: 18,
          education: ['دكتوراه Organic Chemistry - University عين شمس', 'ماجستير Chemistry - University القاهرة'],
          rating: 4.7,
          total_students: 2100,
          profile_image: '/images/instructor-3.jpg',
          languages: ['Arabic', 'English', 'الفرنسية'],
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