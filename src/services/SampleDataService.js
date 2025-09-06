import { ref, push, set } from 'firebase/database';
import { db } from '../config/firebase';

export const addSampleReviews = async () => {
  try {
    // Sample course ID - you should replace this with an actual course ID
    const courseId = 'sample-course-id';
    
    const sampleReviews = [
      {
        studentId: 'student1',
        studentName: 'أحمد محمد',
        rating: 5,
        comment: 'كورس ممتاز وشرح واضح جداً! استفدت كثيراً من المحتوى المقدم والأمثلة العملية.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        studentId: 'student2',
        studentName: 'فاطمة أحمد',
        rating: 4,
        comment: 'كورس مفيد ومفهوم، لكن كنت أتمنى المزيد من التمارين العملية.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        instructorReply: {
          message: 'شكراً لك على التقييم! سأضيف المزيد من التمارين العملية في التحديث القادم.',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          instructorId: 'instructor1',
          instructorName: 'د. محمد علي'
        }
      },
      {
        studentId: 'student3',
        studentName: 'عمر حسام',
        rating: 5,
        comment: 'من أفضل الكورسات التي أخذتها! المحتوى منظم والشرح مبسط ومفهوم.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      },
      {
        studentId: 'student4',
        studentName: 'سارة محمود',
        rating: 3,
        comment: 'الكورس جيد بشكل عام، لكن أحتاج لوقت أكثر لفهم بعض المفاهيم.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      },
      {
        studentId: 'student5',
        studentName: 'خالد أشرف',
        rating: 4,
        comment: 'شرح واضح ومنظم، أنصح به بقوة!',
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