#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Common translation mappings
TRANSLATIONS = {
    # General UI
    'مرحباً': 'Welcome',
    'مرحبا': 'Welcome',
    'الرئيسية': 'Home',
    'الصفحة الرئيسية': 'Home Page',
    'الكورسات': 'Courses',
    'جميع الكورسات': 'All Courses',
    'كورساتي': 'My Courses',
    'كورسات': 'courses',
    'كورس': 'course',
    'الكورس': 'the course',
    'عنوان الكورس': 'Course Title',
    
    # Actions
    'ابحث عن كورس': 'Search for a course',
    'ابحث': 'Search',
    'بحث': 'Search',
    'فلترة': 'Filter',
    'مسح الفلاتر': 'Clear Filters',
    'عرض التفاصيل': 'View Details',
    'عرض': 'View',
    'تعديل': 'Edit',
    'حذف': 'Delete',
    'حفظ': 'Save',
    'إلغاء': 'Cancel',
    'إضافة': 'Add',
    'إنشاء': 'Create',
    'تحديث': 'Update',
    'تأكيد': 'Confirm',
    'إغلاق': 'Close',
    
    # Filters and Categories
    'التصنيف': 'Category',
    'المستوى': 'Level',
    'السعر': 'Price',
    'الترتيب': 'Sort By',
    'الكل': 'All',
    'فيزياء': 'Physics',
    'كيمياء': 'Chemistry',
    'رياضيات': 'Mathematics',
    'برمجة': 'Programming',
    'أحياء': 'Biology',
    'مبتدئ': 'Beginner',
    'متوسط': 'Intermediate',
    'متقدم': 'Advanced',
    'مجاني': 'Free',
    'مدفوع': 'Paid',
    'الأحدث': 'Newest',
    'الأكثر شعبية': 'Most Popular',
    'الأعلى تقييماً': 'Highest Rated',
    'السعر: من الأقل للأعلى': 'Price: Low to High',
    'السعر: من الأعلى للأقل': 'Price: High to Low',
    
    # Status messages
    'جاري التحميل': 'Loading',
    'يتم التحميل': 'Loading',
    'لا توجد كورسات': 'No Courses Found',
    'لم تسجل في أي كورس بعد': 'No courses enrolled yet',
    'جرب البحث بكلمات أخرى أو قم بتعديل الفلاتر': 'Try searching with different keywords or adjust the filters',
    'عدد الكورسات': 'Number of courses',
    
    # Course details
    'المدرب': 'Instructor',
    'المدربين': 'Instructors',
    'مدرب': 'instructor',
    'غير محدد': 'Not specified',
    'الطلاب': 'Students',
    'طلاب': 'students',
    'طالب': 'student',
    'درس': 'lesson',
    'دروس': 'lessons',
    'درس مكتمل': 'lesson completed',
    'ساعة': 'hour',
    'ساعات': 'hours',
    'دقيقة': 'minute',
    'دقائق': 'minutes',
    'و': 'and',
    'جنيه': 'EGP',
    
    # Dashboard
    'لوحة التحكم': 'Dashboard',
    'نظرة عامة': 'Overview',
    'نظرة عامة على التقدم': 'Progress Overview',
    'التقدم': 'Progress',
    'إجمالي الكورسات': 'Total Courses',
    'الكورسات المكتملة': 'Completed Courses',
    'ساعات التعلم': 'Learning Hours',
    'الشهادات': 'Certificates',
    'الشهادة': 'Certificate',
    'تحميل الشهادة': 'Download Certificate',
    'جاري تحميل الشهادة': 'Downloading certificate',
    'الشهادة غير متوفرة': 'Certificate not available',
    'استمر في رحلتك التعليمية': 'Continue your learning journey',
    'ابدأ رحلتك التعليمية الآن': 'Start your learning journey now',
    'متوسط التقدم': 'Average Progress',
    'تصفح المزيد': 'Browse More',
    'استكشف الكورسات': 'Explore Courses',
    'اكتشف كورسات جديدة في مختلف المجالات': 'Discover new courses in various fields',
    
    # Status
    'مكتمل': 'Completed',
    'قيد التقدم': 'In Progress',
    'لم يبدأ بعد': 'Not Started',
    'مراجعة الكورس': 'Review Course',
    'متابعة التعلم': 'Continue Learning',
    'نشط': 'Active',
    'غير نشط': 'Inactive',
    'معلق': 'Pending',
    'ملغى': 'Cancelled',
    
    # Learning items
    'الإنجازات': 'Achievements',
    'الإحصائيات': 'Statistics',
    'الأداء': 'Performance',
    'التقارير': 'Reports',
    'البيانات': 'Data',
    'تتبع تقدمك وأدائك': 'Track your progress and performance',
    'شاهد إنجازاتك وشهاداتك': 'View your achievements and certificates',
    
    # Errors
    'خطأ': 'Error',
    'خطأ في تحميل الكورسات': 'Error loading courses',
    'خطأ في تحميل البيانات': 'Error loading data',
    'خطأ في تحميل بيانات لوحة التحكم': 'Error loading dashboard data',
    'خطأ في تحميل الشهادة': 'Error downloading certificate',
    'خطأ في تحميل بيانات السحب': 'Error loading withdrawal data',
    'خطأ في إنشاء طلب السحب': 'Error creating withdrawal request',
    'حدث خطأ أثناء إنشاء طلب السحب': 'An error occurred while creating the withdrawal request',
    
    # Instructor
    'إنشاء الكورس': 'Create Course',
    'تعديل الكورس': 'Edit Course',
    'الأرباح': 'Earnings',
    'السحب': 'Withdrawal',
    'الإشعارات': 'Notifications',
    'الإعدادات': 'Settings',
    'الملف الشخصي': 'Profile',
    'رصيد السحب': 'Withdrawal Balance',
    'طلب سحب': 'Withdrawal Request',
    'تم إنشاء طلب السحب بنجاح': 'Withdrawal request created successfully',
    'إعادة تحميل بيانات السحب': 'Reload withdrawal data',
    'جلب طلبات السحب الخاصة بالمدرب': 'Fetch instructor withdrawal requests',
    'حساب رصيد السحب': 'Calculate withdrawal balance',
    'بعد خصم': 'After deducting',
    'رسوم منصة': 'platform fee',
    'ضرائب': 'taxes',
    'إعادة حساب رصيد السحب عند تغيير الكورسات': 'Recalculate withdrawal balance when courses change',
    
    # Reviews and ratings
    'التقييم': 'Rating',
    'التقييمات': 'Ratings',
    'المراجعات': 'Reviews',
    'مراجعة': 'review',
    'التعليقات': 'Comments',
    'تعليق': 'comment',
}

def translate_text(text):
    """Translate Arabic text to English"""
    # Sort by length (longest first) to replace longer phrases first
    sorted_translations = sorted(TRANSLATIONS.items(), key=lambda x: len(x[0]), reverse=True)
    
    for arabic, english in sorted_translations:
        text = text.replace(arabic, english)
    
    return text

def process_file(file_path):
    """Process a single file and translate Arabic text"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file contains Arabic text
        if not re.search(r'[\u0600-\u06FF]', content):
            return False
        
        # Translate the content
        translated_content = translate_text(content)
        
        # Write back if changes were made
        if translated_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(translated_content)
            return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False
    
    return False

def main():
    """Main function to process all files"""
    src_dir = Path('src')
    processed_count = 0
    
    # Find all JS and JSX files
    for file_path in src_dir.rglob('*.jsx'):
        if process_file(file_path):
            print(f"Translated: {file_path}")
            processed_count += 1
    
    for file_path in src_dir.rglob('*.js'):
        if process_file(file_path):
            print(f"Translated: {file_path}")
            processed_count += 1
    
    print(f"\nTranslation complete! Processed {processed_count} files.")

if __name__ == '__main__':
    main()
