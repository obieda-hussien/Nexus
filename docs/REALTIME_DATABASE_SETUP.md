# إعداد Firebase Realtime Database لـ Nexus Platform

## 🎯 نظرة عامة

تم تحويل منصة Nexus بالكامل لاستخدام Firebase Realtime Database بدلاً من Cloud Firestore، مما يجعلها متوافقة مع الخطة المجانية بدون الحاجة لترقية الفاتورة.

## 📋 الخطوات المطلوبة

### 1. التأكد من إعداد Realtime Database

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك `nexus-012`
3. من القائمة الجانبية، اختر **Realtime Database**
4. إذا لم تكن موجودة، اضغط **Create Database**
5. اختر موقع قاعدة البيانات (أقرب موقع جغرافياً)
6. ابدأ في **Test Mode** مؤقتاً

### 2. تطبيق قوانين الأمان

انسخ والصق القوانين التالية في تبويب **Rules** في Realtime Database:

```json
{
  "rules": {
    // Users data - only authenticated users can read/write their own data
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    
    // Courses data - read for all authenticated users
    "courses": {
      ".read": "auth != null",
      "$courseId": {
        ".write": "auth != null && (
          root.child('users').child(auth.uid).child('role').val() == 'instructor' ||
          root.child('users').child(auth.uid).child('role').val() == 'admin'
        )"
      }
    },
    
    // Lessons data - read for enrolled students and instructors
    "lessons": {
      ".read": "auth != null",
      "$lessonId": {
        ".write": "auth != null && (
          root.child('users').child(auth.uid).child('role').val() == 'instructor' ||
          root.child('users').child(auth.uid).child('role').val() == 'admin'
        )"
      }
    },
    
    // User progress - users can only read/write their own progress
    "user_progress": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    
    // Analytics events - authenticated users can write, admins can read
    "analytics_events": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() == 'admin'",
      ".write": "auth != null"
    },
    
    // Security logs - only admins can read/write
    "security_logs": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() == 'admin'",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() == 'admin'"
    },
    
    // Test data for diagnostics
    "test": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 3. نشر القوانين

1. اضغط **Publish** لتطبيق القوانين
2. ستظهر رسالة تأكيد بأن القوانين تم نشرها بنجاح

## 🔧 هيكل البيانات

### بيانات المستخدمين (`/users/{uid}`)
```json
{
  "users": {
    "user123": {
      "uid": "user123",
      "displayName": "أحمد محمد",
      "email": "ahmed@example.com",
      "role": "student",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "enrolledCourses": ["course1", "course2"],
      "progress": {
        "course1": {
          "lesson1": {
            "completed": true,
            "completedAt": "2025-01-01T12:00:00.000Z"
          }
        }
      }
    }
  }
}
```

### بيانات الكورسات (`/courses/{courseId}`)
```json
{
  "courses": {
    "course1": {
      "title": "مقدمة في البرمجة",
      "description": "كورس شامل لتعلم أساسيات البرمجة",
      "instructor_id": "instructor123",
      "level": "beginner",
      "subject": "programming",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

## 🚀 مزايا Realtime Database

### ✅ مزايا الخطة المجانية
- **1 GB تخزين** - كافي للتطبيقات التعليمية
- **10 GB نقل بيانات شهرياً** - مناسب للاستخدام المتوسط
- **100 اتصال متزامن** - كافي للفصول الدراسية
- **لا توجد رسوم إضافية** - تعمل بالكامل على الخطة المجانية

### ⚡ مزايا تقنية
- **التزامن الفوري** - تحديثات البيانات في الوقت الفعلي
- **دعم الاتصال بدون إنترنت** - يحفظ البيانات محلياً
- **سرعة عالية** - أداء أفضل للتطبيقات التفاعلية

## 🔍 اختبار الإعداد

استخدم أداة التشخيص المدمجة في التطبيق:

1. افتح التطبيق واذهب للوحة التحكم
2. اضغط على أيقونة الإعدادات ⚙️
3. ستظهر نتائج الاختبارات:
   - ✅ **Firebase Initialization** - تهيئة Firebase
   - ✅ **Authentication Status** - حالة تسجيل الدخول
   - ✅ **Database Connection** - اتصال قاعدة البيانات
   - ✅ **Database Rules** - اختبار صلاحيات الكتابة
   - ✅ **User Profile** - بيانات المستخدم

## 🆘 حل المشاكل الشائعة

### مشكلة: "Permission denied"
**الحل**: تأكد من تطبيق قوانين الأمان الصحيحة

### مشكلة: "Database connection failed"
**الحل**: تأكد من وجود databaseURL في إعدادات Firebase

### مشكلة: "User profile not found"
**الحل**: استخدم زر "إنشاء ملف شخصي" في لوحة التحكم

## 📞 الدعم

إذا واجهت أي مشاكل:
1. استخدم أداة التشخيص المدمجة
2. تحقق من Console logs في المتصفح
3. راجع [Firebase Documentation](https://firebase.google.com/docs/database)

---

تم تحويل التطبيق بنجاح للعمل مع Realtime Database! 🎉