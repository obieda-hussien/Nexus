import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample data setup for Nexus Educational Platform
class DataSetupService {
  // Create sample courses
  static async createSampleCourses() {
    try {
      const courses = [
        {
          title: 'Physics Basics for High School',
          description: 'Comprehensive course covering all required Physics Basics for high school',
          subject: 'physics',
          level: 'high_school',
          instructor_id: 'instructor_1',
          duration_hours: 40,
          price: 299,
          currency: 'EGP',
          thumbnail: '/images/physics-course.jpg',
          tags: ['Physics', 'High School', 'Basics'],
          modules: [
            'Mechanics',
            'Heat and Gases',
            'Electricity and Magnetism',
            'Light and Optics',
            'Modern Physics'
          ],
          requirements: ['Basic knowledge of Mathematics', 'Scientific calculator'],
          learning_outcomes: [
            'Understanding basic Physics laws',
            'Solving physics problems systematically',
            'Applying theoretical concepts practically'
          ],
          status: 'active',
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          title: 'Advanced Mathematics - Calculus and Integration',
          description: 'In-depth study of Calculus and Integration with practical applications',
          subject: 'mathematics',
          level: 'university',
          instructor_id: 'instructor_2',
          duration_hours: 60,
          price: 399,
          currency: 'EGP',
          thumbnail: '/images/math-course.jpg',
          tags: ['Mathematics', 'Calculus', 'Integration', 'University'],
          modules: [
            'Limits and Continuity',
            'Calculus',
            'Calculus Applications',
            'Integration',
            'Integration Applications',
            'Calculus Equations'
          ],
          requirements: ['Successfully completing Algebra and Geometry', 'Good knowledge of functions'],
          learning_outcomes: [
            'Mastering Calculus and Integration concepts',
            'Solving Calculus equations',
            'Applying concepts to practical problems'
          ],
          status: 'active',
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          title: 'Basic Organic Chemistry',
          description: 'Comprehensive introduction to Organic Chemistry and its reactions',
          subject: 'chemistry',
          level: 'university',
          instructor_id: 'instructor_3',
          duration_hours: 45,
          price: 349,
          currency: 'EGP',
          thumbnail: '/images/chemistry-course.jpg',
          tags: ['Chemistry', 'Organic', 'Reactions', 'University'],
          modules: [
            'Organic Compounds',
            'Isomerism',
            'Organic Reactions',
            'Alkanes and Alkenes',
            'Aromatic Compounds',
            'Functional Groups'
          ],
          requirements: ['General Chemistry Basics', 'Knowledge of Periodic Table'],
          learning_outcomes: [
            'Understanding the structure of organic compounds',
            'Predicting results of organic reactions',
            'Applying knowledge in the laboratory'
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
          title: 'Introduction to Mechanics',
          description: 'Learning the basics of motion and force',
          order: 1,
          duration_minutes: 45,
          type: 'video',
          content_url: 'https://example.com/lesson1',
          free_preview: true,
          learning_objectives: [
            'Definition of motion and rest',
            'Understanding the concept of force',
            'Apply Newton's laws'
          ],
          created_at: new Date().toISOString()
        },
        {
          course_id: courseIds[0],
          title: 'Laws of motion',
          description: 'Study of Newton's three laws',
          order: 2,
          duration_minutes: 60,
          type: 'video',
          content_url: 'https://example.com/lesson2',
          free_preview: false,
          learning_objectives: [
            'Newton's First Law',
            'Newton's Second Law',
            'Newton's Third Law'
          ],
          created_at: new Date().toISOString()
        },
        // Math Course Lessons
        {
          course_id: courseIds[1],
          title: 'The concept of limit',
          description: 'Learning the concept of limit and its properties',
          order: 1,
          duration_minutes: 50,
          type: 'video',
          content_url: 'https://example.com/math-lesson1',
          free_preview: true,
          learning_objectives: [
            'Definition of limit',
            'Calculating simple limits',
            'Infinite limits'
          ],
          created_at: new Date().toISOString()
        },
        // Chemistry Course Lessons
        {
          course_id: courseIds[2],
          title: 'Introduction to Organic Compounds',
          description: 'Definition and properties of organic compounds',
          order: 1,
          duration_minutes: 40,
          type: 'video',
          content_url: 'https://example.com/chem-lesson1',
          free_preview: true,
          learning_objectives: [
            'Definition of organic compounds',
            'Properties of carbon',
            'Types of bonds'
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
          title: 'Quiz Basics Mechanics',
          description: 'Comprehensive quiz on Mechanics Basics',
          order: 1,
          time_limit_minutes: 30,
          total_questions: 10,
          passing_score: 70,
          questions: [
            {
              question: 'What is Newton's First Law?',
              type: 'multiple_choice',
              options: [
                'A body at rest remains at rest and a body in motion remains in motion unless acted upon by an external force',
                'Force equals mass multiplied by acceleration',
                'For every action there is an equal and opposite reaction',
                'Energy cannot be created or destroyed'
              ],
              correct_answer: 0,
              explanation: 'Newton's First Law ينص على أن الجسم يحافظ على حالة السكون أو Motion المنتظمة ما لم تؤثر عليه قوة خارجية'
            },
            {
              question: 'The SI unit of force is:',
              type: 'multiple_choice',
              options: ['Kilogram', 'Meter', 'Newton', 'Joule'],
              correct_answer: 2,
              explanation: 'The Newton is the SI unit of force'
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
          title: 'Comprehensive review in Physics',
          instructor_name: 'Dr. Ahmed Mohamed',
          subject: 'physics',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration_minutes: 90,
          max_participants: 100,
          current_participants: 45,
          description: 'Comprehensive review of important Physics topics with practical examples',
          meeting_url: 'https://meet.nexus.com/physics-review',
          status: 'scheduled',
          tags: ['Review', 'Physics', 'Examples'],
          created_at: new Date().toISOString()
        },
        {
          title: 'Solving Calculus and Integration problems',
          instructor_name: 'Dr. Fatima Ali',
          subject: 'mathematics',
          scheduled_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          duration_minutes: 120,
          max_participants: 80,
          current_participants: 32,
          description: 'Interactive session for solving various Calculus and Integration problems',
          meeting_url: 'https://meet.nexus.com/calculus-problems',
          status: 'scheduled',
          tags: ['Calculus', 'Integration', 'Problems'],
          created_at: new Date().toISOString()
        },
        {
          title: 'Organic Chemistry experiments',
          instructor_name: 'Dr. Mohamed Hassan',
          subject: 'chemistry',
          scheduled_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
          duration_minutes: 105,
          max_participants: 50,
          current_participants: 28,
          description: 'View practical experiments in Organic Chemistry with detailed explanation',
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
          name: 'Dr. Ahmed Mohamed Ali',
          title: 'Professor Physics - University القاهرة',
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
          name: 'Dr. Fatima Ali محمود',
          title: 'Professorة Mathematics - University الأزهر',
          bio: 'خبيرة في Applied Mathematics مع التركيز على Calculus وIntegration والإحصاء',
          specialties: ['Mathematics', 'إحصاء', 'Analysis عددي'],
          experience_years: 12,
          education: ['دكتوراه Mathematics - University الأزهر', 'ماجستير Mathematics Applyية - University القاهرة'],
          rating: 4.9,
          total_students: 1800,
          profile_image: '/images/instructor-2.jpg',
          languages: ['Arabic', 'English'],
          created_at: new Date().toISOString()
        },
        {
          id: 'instructor_3',
          name: 'Dr. Mohamed Hassan إبراهيم',
          title: 'Professor Chemistry - University عين شمس',
          bio: 'متخصص في Chemistry الOrganic والAnalysisية مع خبرة واسعة في الأبحاث والتدريس',
          specialties: ['Organic Chemistry', 'Chemistry Analysisية', 'Chemistry حيوية'],
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