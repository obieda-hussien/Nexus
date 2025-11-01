#!/bin/bash

# Function to clean Arabic text from files
clean_file() {
    local file="$1"
    
    # Use sed with perl regex for Unicode support
    perl -i -C -pe '
        s/يجب Login أandNoً لCreate course/You must log in first to create a course/g;
        s/You do not have permission Create courses\. يجب أن تكandن Instructorاً أandNoً/You do not have permission to create courses. You must be an instructor first/g;
        s/تم Create Course successfully!/Course created successfully!/g;
        s/An error occurred in Create Course/An error occurred while creating the course/g;
        s/ليس لديك الصNoحية لCreate course\. Ensure from أن دandرك "Instructor" in System/You do not have permission to create a course. Make sure your role is "Instructor" in the system/g;
        s/Error in الشبكة\. Verify from اتصالك بالإنترنت/Network error. Please check your internet connection/g;
        s/يجب إعادة Login للمFollowة/You need to log in again to continue/g;
        s/Data الأساسية/Basic Data/g;
        s/Data التفصيلية/Detailed Data/g;
        s/فNoتر الSearch/Search Filters/g;
        s/Error in Download بيانات الأدfrom/Error loading admin data/g;
        s/المستخدمون/Users/g;
        s/المستخدم/User/g;
        s/الكورسات/Courses/g;
        s/الكورس/Course/g;
        s/كورسات/courses/g;
        s/كورس/course/g;
        s/المدربون/Instructors/g;
        s/المدرب/Instructor/g;
        s/مدرب/instructor/g;
        s/الطلاب/Students/g;
        s/الطالب/Student/g;
        s/طلاب/students/g;
        s/طالب/student/g;
        s/الإجمالي/Total/g;
        s/إجمالي/Total/g;
        s/الإشعارات/Notifications/g;
        s/الإشعار/Notification/g;
        s/الإعدادات/Settings/g;
        s/التقارير/Reports/g;
        s/التقرير/Report/g;
        s/الإحصائيات/Statistics/g;
        s/نظرة عامة/Overview/g;
        s/التفاصيل/Details/g;
        s/البيانات/Data/g;
        s/المعلومات/Information/g;
        s/جاري التحميل/Loading/g;
        s/خطأ/Error/g;
        s/نجح/Success/g;
        s/فشل/Failed/g;
        s/تحذير/Warning/g;
        s/معلومات/Information/g;
        s/تأكيد/Confirm/g;
        s/إلغاء/Cancel/g;
        s/حفظ/Save/g;
        s/تعديل/Edit/g;
        s/حذف/Delete/g;
        s/إضافة/Add/g;
        s/إنشاء/Create/g;
        s/بحث/Search/g;
        s/فلترة/Filter/g;
        s/عرض/View/g;
        s/إغلاق/Close/g;
        s/متابعة/Continue/g;
        s/التالي/Next/g;
        s/السابق/Previous/g;
        s/نعم/Yes/g;
        s/لا/No/g;
        s/موافق/OK/g;
        s/مكتمل/Completed/g;
        s/معلق/Pending/g;
        s/مرفوض/Rejected/g;
        s/مقبول/Accepted/g;
        s/نشط/Active/g;
    ' "$file"
}

echo "Starting comprehensive translation..."
echo "=================================="

# Find all JSX and JS files
find src -type f \( -name "*.jsx" -o -name "*.js" \) | while read file; do
    # Check if file contains Arabic
    if grep -q "[\u0600-\u06FF]" "$file" 2>/dev/null; then
        echo "Processing: $file"
        clean_file "$file"
    fi
done

echo "=================================="
echo "Translation complete!"
