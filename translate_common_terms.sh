#!/bin/bash

# Common Arabic terms to English mappings
declare -A translations=(
    # Navigation and UI
    ["الصفحة الرئيسية"]="Home"
    ["الكورسات"]="Courses"
    ["كورسات"]="courses"
    ["كورساتي"]="My Courses"
    ["كورس"]="course"
    ["الكورس"]="the course"
    ["من الكورسات"]="courses"
    ["لوحة التحكم"]="Dashboard"
    ["تسجيل الدخول"]="Login"
    ["تسجيل الخروج"]="Logout"
    ["الإعدادات"]="Settings"
    ["الملف الشخصي"]="Profile"
    ["الإشعارات"]="Notifications"
    ["البحث"]="Search"
    ["فلترة"]="Filter"
    ["ترتيب"]="Sort"
    ["حفظ"]="Save"
    ["إلغاء"]="Cancel"
    ["تعديل"]="Edit"
    ["حذف"]="Delete"
    ["إضافة"]="Add"
    ["جديد"]="New"
    ["عرض"]="View"
    ["إغلاق"]="Close"
    ["تأكيد"]="Confirm"
    ["نعم"]="Yes"
    ["لا"]="No"
    ["تم"]="Done"
    ["قيد الإنجاز"]="In Progress"
    ["مكتمل"]="Completed"
    ["ملغى"]="Cancelled"
    ["معلق"]="Pending"
    ["نشط"]="Active"
    ["غير نشط"]="Inactive"
    ["متاح"]="Available"
    ["غير متاح"]="Unavailable"
    
    # Course terms
    ["المدرب"]="Instructor"
    ["المدربين"]="Instructors"
    ["مدرب"]="instructor"
    ["الطلاب"]="Students"
    ["طلاب"]="students"
    ["طالب"]="student"
    ["الدروس"]="Lessons"
    ["دروس"]="lessons"
    ["درس"]="lesson"
    ["الاختبارات"]="Quizzes"
    ["اختبار"]="quiz"
    ["الواجبات"]="Assignments"
    ["واجب"]="assignment"
    ["الشهادات"]="Certificates"
    ["شهادة"]="certificate"
    ["التقييم"]="Rating"
    ["تقييم"]="rating"
    ["المراجعات"]="Reviews"
    ["مراجعة"]="review"
    ["التعليقات"]="Comments"
    ["تعليق"]="comment"
    
    # Status and Actions
    ["جاري التحميل"]="Loading"
    ["تحميل"]="Load"
    ["يتم التحميل"]="Loading"
    ["تم بنجاح"]="Successfully"
    ["فشل"]="Failed"
    ["خطأ"]="Error"
    ["نجح"]="Success"
    ["تحذير"]="Warning"
    ["معلومات"]="Information"
    
    # Time and dates
    ["اليوم"]="Today"
    ["أمس"]="Yesterday"
    ["الأسبوع"]="Week"
    ["الشهر"]="Month"
    ["السنة"]="Year"
    ["ساعة"]="hour"
    ["ساعات"]="hours"
    ["دقيقة"]="minute"
    ["دقائق"]="minutes"
    ["ثانية"]="second"
    ["ثوانٍ"]="seconds"
    
    # Learning terms
    ["التعلم"]="Learning"
    ["التقدم"]="Progress"
    ["الإنجازات"]="Achievements"
    ["الأداء"]="Performance"
    ["الإحصائيات"]="Statistics"
    ["التقارير"]="Reports"
    ["البيانات"]="Data"
    
    # Prices and payments
    ["مجاني"]="Free"
    ["مدفوع"]="Paid"
    ["السعر"]="Price"
    ["الأسعار"]="Prices"
    ["الدفع"]="Payment"
    ["المبلغ"]="Amount"
    ["الإجمالي"]="Total"
    ["الرصيد"]="Balance"
    ["الأرباح"]="Earnings"
    ["السحب"]="Withdrawal"
    ["جنيه"]="EGP"
)

echo "Starting translation..."

# Iterate through all JSX and JS files
find src -type f \( -name "*.jsx" -o -name "*.js" \) | while read file; do
    echo "Processing: $file"
    
    for arabic in "${!translations[@]}"; do
        english="${translations[$arabic]}"
        
        # Use perl for Unicode-aware search and replace
        perl -i -C -pe "s/\Q$arabic\E/$english/g" "$file"
    done
done

echo "Translation completed!"
