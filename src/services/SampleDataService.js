import { ref, push, set } from 'firebase/database';
import { db } from '../config/firebase';

export const addSampleReviews = async () => {
  try {
    // Sample course ID - you should replace this with an actual course ID
    const courseId = 'sample-course-id';
    
    const sampleReviews = [
      {
        studentId: 'student1',
        studentName: 'Ahmed Mohamed',
        rating: 5,
        comment: 'كورس ممتاز وشرح واضح جداً! استفدت كثيراً from Content المقدم والExamples الprocess.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        studentId: 'student2',
        studentName: 'فاطمة أحمد',
        rating: 4,
        comment: 'كورس مinد ومفهوم، لكن كنت أتfromى More from التمارين الprocess.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        instructorReply: {
          message: 'Thank you لك on Rating! سأضيف More from التمارين الprocess in الUpdate القادم.',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          instructorId: 'instructor1',
          instructorName: 'Dr. محمد علي'
        }
      },
      {
        studentId: 'student3',
        studentName: 'عمر حسام',
        rating: 5,
        comment: 'from أفضل Courses التي أخذتها! Content fromظم والشرح مبسط ومفهوم.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      },
      {
        studentId: 'student4',
        studentName: 'سارة محمود',
        rating: 3,
        comment: 'الكورس جيد correctly year، لكن أحتاج لوقت أكثر لفهم some المفاهيم.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      },
      {
        studentId: 'student5',
        studentName: 'خالد أشرف',
        rating: 4,
        comment: 'شرح واضح وfromظم، أنصح به بقوة!',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks ago
      }
    ];

    const reviewsRef = ref(db, `course_reviews/${courseId}`);
    
    for (const review of sampleReviews) {
      await push(reviewsRef, review);
    }

    console.log('Sample reviews added successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error adding sample reviews:', error);
    return { success: false, error };
  }
};

export default { addSampleReviews };