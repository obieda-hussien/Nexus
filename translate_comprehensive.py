#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
from pathlib import Path

# قاموس شامل للترجمات
COMPREHENSIVE_TRANSLATIONS = {
    # جمل كاملة أولاً (الأطول أولاً)
    'اكتشف مجموعة متنوعة من الكورسات التعليمية في مختلف المجالات': 'Discover a wide variety of educational courses in different fields',
    'انضم إلى آلاف الطلاب حول العالم واحصل على شهادات معتمدة': 'Join thousands of students around the world and get certified',
    'استمتع بتجربة تعلم تفاعلية مع أفضل المدربين': 'Enjoy an interactive learning experience with the best instructors',
    'ابدأ رحلتك التعليمية الآن واكتسب مهارات جديدة': 'Start your educational journey now and acquire new skills',
    'شاهد إنجازاتك وشهاداتك': 'View your achievements and certificates',
    'تتبع تقدمك وأدائك': 'Track your progress and performance',
    'استمر في رحلتك التعليمية': 'Continue your learning journey',
    'ابدأ رحلتك التعليمية الآن': 'Start your learning journey now',
    'لم تسجل في أي كورس بعد': 'No courses enrolled yet',
    'جرب البحث بكلمات أخرى أو قم بتعديل الفلاتر': 'Try searching with different keywords or adjust the filters',
    'اكتشف كورسات جديدة في مختلف المجالات': 'Discover new courses in various fields',
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
    'ابحث عن': 'Search for',
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
    'قيد المراجعة': 'Under Review',
    'درس مكتمل': 'lesson completed',
    'دروس مكتملة': 'lessons completed',
    'نظرة عامة': 'Overview',
    'لوحة التحكم': 'Dashboard',
    'الصفحة الرئيسية': 'Home',
    'الكورسات': 'Courses',
    'الكورس': 'Course',
    'كورساتي': 'My Courses',
    'كورسات': 'courses',
    'كورس': 'course',
    'المدرب': 'Instructor',
    'المدربون': 'Instructors',
    'غير محدد': 'Not specified',
    'الطلاب': 'Students',
    'الطالب': 'Student',
    'الإنجازات': 'Achievements',
    'الإحصائيات': 'Statistics',
    'التحليلات': 'Analytics',
    'الشهادات': 'Certificates',
    'الشهادة': 'Certificate',
    'التقدم': 'Progress',
    'التصنيف': 'Category',
    'التصنيفات': 'Categories',
    'المستوى': 'Level',
    'المستويات': 'Levels',
    'السعر': 'Price',
    'الأسعار': 'Prices',
    'الترتيب': 'Sort By',
    'فلترة': 'Filter',
    'الفلاتر': 'Filters',
    'مجاني': 'Free',
    'مدفوع': 'Paid',
    'مكتمل': 'Completed',
    'معلق': 'Pending',
    'مرفوض': 'Rejected',
    'مقبول': 'Accepted',
    'نشط': 'Active',
    'غير نشط': 'Inactive',
    'الكل': 'All',
    'فيزياء': 'Physics',
    'كيمياء': 'Chemistry',
    'رياضيات': 'Mathematics',
    'برمجة': 'Programming',
    'أحياء': 'Biology',
    'علوم': 'Science',
    'هندسة': 'Engineering',
    'فنون': 'Arts',
    'لغات': 'Languages',
    'اقتصاد': 'Economics',
    'مبتدئ': 'Beginner',
    'متوسط': 'Intermediate',
    'متقدم': 'Advanced',
    'الأحدث': 'Newest',
    'الأقدم': 'Oldest',
    'مرحباً': 'Welcome',
    'مرحبا': 'Welcome',
    'ابحث': 'Search',
    'بحث': 'Search',
    'البحث': 'Search',
    'عرض': 'View',
    'حفظ': 'Save',
    'إلغاء': 'Cancel',
    'تعديل': 'Edit',
    'حذف': 'Delete',
    'إضافة': 'Add',
    'إنشاء': 'Create',
    'تحديث': 'Update',
    'نشر': 'Publish',
    'مسودة': 'Draft',
    'خطأ': 'Error',
    'نجح': 'Success',
    'فشل': 'Failed',
    'تحذير': 'Warning',
    'معلومات': 'Information',
    'ساعة': 'hour',
    'ساعات': 'hours',
    'دقيقة': 'minute',
    'دقائق': 'minutes',
    'ثانية': 'second',
    'ثوانٍ': 'seconds',
    'يوم': 'day',
    'أيام': 'days',
    'أسبوع': 'week',
    'أسابيع': 'weeks',
    'شهر': 'month',
    'أشهر': 'months',
    'سنة': 'year',
    'سنوات': 'years',
    'درس': 'lesson',
    'دروس': 'lessons',
    'الدرس': 'Lesson',
    'الدروس': 'Lessons',
    'محاضرة': 'lecture',
    'محاضرات': 'lectures',
    'اختبار': 'quiz',
    'اختبارات': 'quizzes',
    'الاختبار': 'Quiz',
    'الاختبارات': 'Quizzes',
    'امتحان': 'exam',
    'امتحانات': 'exams',
    'واجب': 'assignment',
    'واجبات': 'assignments',
    'مشروع': 'project',
    'مشاريع': 'projects',
    'جنيه': 'EGP',
    'دولار': 'USD',
    'ريال': 'SAR',
    'طالب': 'student',
    'طلاب': 'students',
    'مدرب': 'instructor',
    'مدربين': 'instructors',
    'مدرس': 'teacher',
    'مدرسين': 'teachers',
    'أستاذ': 'professor',
    'و': 'and',
    'أو': 'or',
    'من': 'from',
    'إلى': 'to',
    'في': 'in',
    'على': 'on',
    'مع': 'with',
    'عن': 'about',
    'بدون': 'without',
    'خلال': 'during',
    'قبل': 'before',
    'بعد': 'after',
    'الآن': 'Now',
    'اليوم': 'Today',
    'أمس': 'Yesterday',
    'غداً': 'Tomorrow',
    'هذا الأسبوع': 'This week',
    'هذا الشهر': 'This month',
    'هذه السنة': 'This year',
    'تسجيل الدخول': 'Login',
    'تسجيل جديد': 'Register',
    'تسجيل': 'Register',
    'تسجيل الخروج': 'Logout',
    'الملف الشخصي': 'Profile',
    'الإعدادات': 'Settings',
    'الإشعارات': 'Notifications',
    'الرسائل': 'Messages',
    'المساعدة': 'Help',
    'الدعم': 'Support',
    'اتصل بنا': 'Contact Us',
    'من نحن': 'About Us',
    'حول': 'About',
    'الشروط والأحكام': 'Terms and Conditions',
    'سياسة الخصوصية': 'Privacy Policy',
    'الأسئلة الشائعة': 'FAQ',
    'المزيد': 'More',
    'أقل': 'Less',
    'عرض الكل': 'View All',
    'إخفاء': 'Hide',
    'إظهار': 'Show',
    'تحميل': 'Download',
    'رفع': 'Upload',
    'إرسال': 'Submit',
    'إرسال الطلب': 'Submit Request',
    'التالي': 'Next',
    'السابق': 'Previous',
    'البداية': 'Start',
    'النهاية': 'End',
    'نعم': 'Yes',
    'لا': 'No',
    'موافق': 'OK',
    'إغلاق': 'Close',
    'تأكيد': 'Confirm',
    'متابعة': 'Continue',
    'رجوع': 'Back',
    'الرئيسية': 'Home',
    'لغة': 'Language',
    'العربية': 'Arabic',
    'الإنجليزية': 'English',
    
    # Instructor specific
    'إنشاء كورس': 'Create Course',
    'إنشاء كورس جديد': 'Create New Course',
    'تعديل الكورس': 'Edit Course',
    'حذف الكورس': 'Delete Course',
    'الأرباح': 'Earnings',
    'إجمالي الأرباح': 'Total Earnings',
    'السحب': 'Withdrawal',
    'طلب سحب': 'Withdrawal Request',
    'طلبات السحب': 'Withdrawal Requests',
    'المراجعات': 'Reviews',
    'التقييمات': 'Ratings',
    'التقييم': 'Rating',
    'التعليقات': 'Comments',
    'الرد': 'Reply',
    'المحتوى': 'Content',
    'الوصف': 'Description',
    'الوصف القصير': 'Short Description',
    'الوصف التفصيلي': 'Detailed Description',
    'الأهداف': 'Objectives',
    'المتطلبات': 'Requirements',
    'المتطلبات الأساسية': 'Prerequisites',
    'الفئة المستهدفة': 'Target Audience',
    'المنهج': 'Curriculum',
    'الأقسام': 'Sections',
    'القسم': 'Section',
    'الفيديو': 'Video',
    'الفيديوهات': 'Videos',
    'الصورة': 'Image',
    'الصور': 'Images',
    'المرفقات': 'Attachments',
    'المرفق': 'Attachment',
    'الملف': 'File',
    'الملفات': 'Files',
    'الرابط': 'Link',
    'الروابط': 'Links',
    
    # Admin specific
    'لوحة تحكم المدير': 'Admin Dashboard',
    'المستخدمون': 'Users',
    'المستخدم': 'User',
    'الطلبات': 'Requests',
    'الطلب': 'Request',
    'الموافقة': 'Approve',
    'الرفض': 'Reject',
    'قبول': 'Accept',
    'رفض': 'Reject',
    'الحالة': 'Status',
    'التاريخ': 'Date',
    'الإجراء': 'Action',
    'الإجراءات': 'Actions',
    'التفاصيل': 'Details',
    'المعلومات': 'Information',
    'البيانات': 'Data',
    'التقارير': 'Reports',
    'التقرير': 'Report',
    'الإحصاءات': 'Statistics',
    'التحليلات': 'Analytics',
}

def translate_content(text):
    """ترجمة النص من العربي إلى الإنجليزي"""
    # ترتيب حسب الطول (الأطول أولاً) لتجنب الترجمات الجزئية
    sorted_translations = sorted(
        COMPREHENSIVE_TRANSLATIONS.items(), 
        key=lambda x: len(x[0]), 
        reverse=True
    )
    
    for arabic, english in sorted_translations:
        # استخدام الاستبدال المباشر
        text = text.replace(arabic, english)
    
    return text

def process_file(file_path):
    """معالجة ملف واحد"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # التحقق من وجود نص عربي
        if not re.search(r'[\u0600-\u06FF]', content):
            return False, "No Arabic found"
        
        # الترجمة
        original_content = content
        translated_content = translate_content(content)
        
        # الكتابة إذا تغير المحتوى
        if translated_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(translated_content)
            
            # حساب التغييرات
            changes = sum(1 for a, b in zip(original_content, translated_content) if a != b)
            return True, f"Translated ({changes} chars changed)"
        
        return False, "No changes needed"
        
    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    """الدالة الرئيسية"""
    src_dir = Path('src')
    
    print("=" * 70)
    print("بدء الترجمة الشاملة للملفات...")
    print("=" * 70)
    
    # البحث عن جميع ملفات JS و JSX
    files = list(src_dir.rglob('*.jsx')) + list(src_dir.rglob('*.js'))
    
    translated_count = 0
    skipped_count = 0
    error_count = 0
    
    for file_path in files:
        success, message = process_file(file_path)
        
        if success:
            print(f"✅ {file_path.relative_to(src_dir)}: {message}")
            translated_count += 1
        elif "Error" in message:
            print(f"❌ {file_path.relative_to(src_dir)}: {message}")
            error_count += 1
        else:
            skipped_count += 1
    
    print("\n" + "=" * 70)
    print(f"الإحصائيات النهائية:")
    print(f"  - عدد الملفات المفحوصة: {len(files)}")
    print(f"  - عدد الملفات المترجمة: {translated_count}")
    print(f"  - عدد الملفات المتخطاة: {skipped_count}")
    print(f"  - عدد الأخطاء: {error_count}")
    print("=" * 70)

if __name__ == '__main__':
    main()
