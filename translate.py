#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Common translation mappings
TRANSLATIONS = {
    # Most common - order matters
    'اكتشف مجموعة متنوعة من الكورسات التعليمية في مختلف المجالات': 'Discover a wide variety of educational courses in different fields',
    'جرب البحث بكلمات أخرى أو قم بتعديل الفلاتر': 'Try searching with different keywords or adjust the filters',
    'اكتشف كورسات جديدة في مختلف المجالات': 'Discover new courses in various fields',
    'شاهد إنجازاتك وشهاداتك': 'View your achievements and certificates',
    'تتبع تقدمك وأدائك': 'Track your progress and performance',
    'استمر في رحلتك التعليمية': 'Continue your learning journey',
    'ابدأ رحلتك التعليمية الآن': 'Start your learning journey now',
    'لم تسجل في أي كورس بعد': 'No courses enrolled yet',
    'خطأ في تحميل بيانات لوحة التحكم': 'Error loading dashboard data',
    'نظرة عامة على التقدم': 'Progress Overview',
    'جميع الكورسات': 'All Courses',
    'عدد الكورسات': 'Number of courses',
    'لا توجد كورسات': 'No Courses Found',
    'عنوان الكورس': 'Course Title',
    'استكشف الكورسات': 'Explore Courses',
    'إجمالي الكورسات': 'Total Courses',
    'الكورسات المكتملة': 'Completed Courses',
    'تصفح المزيد': 'Browse More',
    'عرض التفاصيل': 'View Details',
    'مسح الفلاتر': 'Clear Filters',
    'جاري التحميل': 'Loading',
    'يتم التحميل': 'Loading',
    'ابحث عن كورس': 'Search for a course',
    'خطأ في تحميل الكورسات': 'Error loading courses',
    'خطأ في تحميل البيانات': 'Error loading data',
    'خطأ في تحميل الشهادة': 'Error downloading certificate',
    'الشهادة غير متوفرة': 'Certificate not available',
    'جاري تحميل الشهادة': 'Downloading certificate',
    'تحميل الشهادة': 'Download Certificate',
    'السعر: من الأقل للأعلى': 'Price: Low to High',
    'السعر: من الأعلى للأقل': 'Price: High to Low',
    'الأكثر شعبية': 'Most Popular',
    'الأعلى تقييماً': 'Highest Rated',
    'ساعات التعلم': 'Learning Hours',
    'متوسط التقدم': 'Average Progress',
    'مراجعة الكورس': 'Review Course',
    'متابعة التعلم': 'Continue Learning',
    'لم يبدأ بعد': 'Not Started',
    'قيد التقدم': 'In Progress',
    'درس مكتمل': 'lesson completed',
    'نظرة عامة': 'Overview',
    'لوحة التحكم': 'Dashboard',
    'الكورسات': 'Courses',
    'الكورس': 'the course',
    'كورساتي': 'My Courses',
    'كورسات': 'courses',
    'كورس': 'course',
    'المدرب': 'Instructor',
    'غير محدد': 'Not specified',
    'الطلاب': 'Students',
    'الإنجازات': 'Achievements',
    'الإحصائيات': 'Statistics',
    'الشهادات': 'Certificates',
    'الشهادة': 'Certificate',
    'التقدم': 'Progress',
    'التصنيف': 'Category',
    'المستوى': 'Level',
    'السعر': 'Price',
    'الترتيب': 'Sort By',
    'فلترة': 'Filter',
    'مجاني': 'Free',
    'مدفوع': 'Paid',
    'مكتمل': 'Completed',
    'معلق': 'Pending',
    'الكل': 'All',
    'فيزياء': 'Physics',
    'كيمياء': 'Chemistry',
    'رياضيات': 'Mathematics',
    'برمجة': 'Programming',
    'أحياء': 'Biology',
    'مبتدئ': 'Beginner',
    'متوسط': 'Intermediate',
    'متقدم': 'Advanced',
    'الأحدث': 'Newest',
    'مرحباً': 'Welcome',
    'مرحبا': 'Welcome',
    'ابحث': 'Search',
    'بحث': 'Search',
    'عرض': 'View',
    'حفظ': 'Save',
    'إلغاء': 'Cancel',
    'تعديل': 'Edit',
    'حذف': 'Delete',
    'خطأ': 'Error',
    'ساعة': 'hour',
    'ساعات': 'hours',
    'دقيقة': 'minute',
    'دقائق': 'minutes',
    'درس': 'lesson',
    'دروس': 'lessons',
    'جنيه': 'EGP',
    'طالب': 'student',
    'طلاب': 'students',
    'مدرب': 'instructor',
    'المدربين': 'Instructors',
    'و': 'and',
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
            print(f"✓ Translated: {file_path}")
            return True
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False
    
    return False

def main():
    """Main function to process all files"""
    src_dir = Path('src')
    processed_count = 0
    total_checked = 0
    
    # Find all JS and JSX files
    for file_path in list(src_dir.rglob('*.jsx')) + list(src_dir.rglob('*.js')):
        total_checked += 1
        if process_file(file_path):
            processed_count += 1
    
    print(f"\n{'='*60}")
    print(f"Translation complete!")
    print(f"Checked: {total_checked} files")
    print(f"Translated: {processed_count} files")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
