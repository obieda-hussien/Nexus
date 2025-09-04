# دليل إعداد Cloud Firestore للخطة المجانية 🔧

## المشكلة: لماذا لا تظهر بيانات المستخدم؟ 🤔

عندما تقوم بإنشاء حساب جديد في الموقع، قد تواجه المشاكل التالية:
- ✅ تسجيل الدخول يعمل بنجاح
- ❌ شاشة التحميل تستمر إلى ما لا نهاية
- ❌ لا تظهر بيانات المستخدم في لوحة التحكم
- ❌ لا توجد بيانات في Firestore Database

## السبب: قواعد الأمان في Firestore 🔒

Firebase Cloud Firestore يأتي بقواعد أمان افتراضية **تمنع جميع عمليات القراءة والكتابة**. حتى لو كان Firestore في "وضع الاختبار"، فإن هذا الوضع له مدة انتهاء صلاحية (عادة 30 يوماً).

## الحل الشامل: إعداد قواعد Firestore الصحيحة ⚙️

### الخطوة 1: الوصول إلى Firebase Console

1. انتقل إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع **nexus-012**
3. من القائمة الجانبية، اختر **Firestore Database**

### الخطوة 2: العثور على تبويب Rules

هناك طريقتان للوصول إلى قواعد Firestore:

#### الطريقة الأولى (الأكثر شيوعاً):
- في صفحة Firestore Database الرئيسية
- ابحث عن تبويبات في الأعلى: **Data** | **Rules** | **Indexes** | **Usage**
- اختر تبويب **Rules**

#### الطريقة الثانية (إذا لم تجد التبويبات):
- من القائمة الجانبية، اختر **Build** → **Firestore Database**
- ثم ابحث عن **Rules** في القائمة الفرعية

### الخطوة 3: نسخ قواعد الأمان الجديدة

استبدل المحتوى الموجود في محرر القواعد بالقواعد التالية:

```javascript
// قواعد Cloud Firestore للخطة المجانية - Nexus Educational Platform
// تحديث: ديسمبر 2024
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== قواعد المستخدمين =====
    // كل مستخدم مسجل يمكنه قراءة وكتابة بياناته الشخصية فقط
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ===== قواعد الكورسات =====
    // قراءة عامة للكورسات، كتابة للمسجلين فقط
    match /courses/{courseId} {
      allow read: if true; // قراءة عامة للجميع
      allow write: if request.auth != null; // كتابة للمسجلين فقط
    }
    
    // ===== قواعد الدروس =====
    // نفس قواعد الكورسات
    match /lessons/{lessonId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // ===== قواعد تقدم المستخدمين =====
    // كل مستخدم يمكنه قراءة وكتابة تقدمه فقط
    match /user_progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ===== قواعد التحليلات =====
    // للمسجلين فقط
    match /analytics_events/{eventId} {
      allow read, write: if request.auth != null;
    }
    
    // ===== قواعد سجلات الأمان =====
    // للمسجلين فقط
    match /security_logs/{logId} {
      allow read, write: if request.auth != null;
    }
    
    // ===== قاعدة اختبار الاتصال =====
    // مهمة للتشخيص والتحقق من عمل النظام
    match /test/{testId} {
      allow read, write: if true;
    }
  }
}
```

### الخطوة 4: نشر القواعد

1. بعد نسخ القواعد في المحرر
2. اضغط على زر **Publish** (نشر)
3. انتظر رسالة التأكيد "Rules published successfully"

## اختبار الإصلاح 🧪

### للحسابات الجديدة:

1. **سجل خروج** من أي حساب موجود
2. **أنشئ حساب جديد** بإيميل وكلمة مرور جديدة
3. **يجب أن يحدث التالي**:
   - إنشاء الحساب بنجاح
   - حفظ بيانات المستخدم في Firestore
   - ظهور لوحة التحكم مباشرة (بدون تحميل مستمر)

### للحسابات الموجودة (قبل الإصلاح):

1. **سجل دخول** بحساب موجود
2. إذا ظهرت شاشة التحميل، ابحث عن زر **"إنشاء ملف شخصي"**
3. **اضغط على الزر** لإنشاء البيانات المفقودة
4. **ستظهر لوحة التحكم** مع بيانات المستخدم

## التحقق من البيانات في Firebase Console 🔍

### فحص مجموعة Users:

1. انتقل إلى **Firestore Database** → **Data**
2. ابحث عن مجموعة تسمى **users**
3. يجب أن تجد مستندات بأسماء تطابق UID المستخدمين
4. كل مستند يجب أن يحتوي على:
   - `displayName`: اسم المستخدم
   - `email`: البريد الإلكتروني
   - `role`: الدور (student)
   - `createdAt`: تاريخ الإنشاء
   - `preferences`: التفضيلات

### التشخيص باستخدام وحدة التحكم:

1. افتح الموقع في المتصفح
2. اضغط F12 لفتح وحدة التحكم
3. ابحث عن الرسائل التالية:
   - ✅ `Firestore connection successful` = الاتصال يعمل
   - ✅ `User profile saved to Firestore successfully` = حفظ البيانات نجح
   - ❌ `Permission denied` = مشكلة في قواعد الأمان

## رسائل الخطأ الشائعة وحلولها 🚨

### 1. "Permission denied"
**السبب**: قواعد الأمان تمنع العملية  
**الحل**: تحديث قواعد Firestore كما هو موضح أعلاه

### 2. "Missing or insufficient permissions"
**السبب**: المستخدم غير مسجل أو القواعد خاطئة  
**الحل**: تأكد من تسجيل الدخول وصحة القواعد

### 3. "Document not found"
**السبب**: لم يتم إنشاء الملف الشخصي بعد  
**الحل**: استخدم زر "إنشاء ملف شخصي" في لوحة التحكم

### 4. "Firebase: Error (auth/network-request-failed)"
**السبب**: مشكلة في الاتصال بالإنترنت أو حجب Firebase  
**الحل**: تحقق من الاتصال بالإنترنت وإعدادات الجدار الناري

## قواعد أمان متقدمة (للإنتاج) 🛡️

عند نشر المشروع رسمياً، يمكنك استخدام قواعد أكثر تقييداً:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // قواعد صارمة للمستخدمين
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && request.auth.token.email_verified == true;
    }
    
    // قراءة الكورسات للمسجلين فقط مع تحقق من البريد
    match /courses/{courseId} {
      allow read: if request.auth != null 
        && request.auth.token.email_verified == true;
      allow write: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'instructor'];
    }
    
    // قواعد تفصيلية للدروس
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'instructor'];
    }
    
    // تقدم المستخدمين مع التحقق من الملكية
    match /user_progress/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && request.auth.token.email_verified == true;
    }
    
    // سجلات محدودة بناءً على الدور
    match /security_logs/{logId} {
      allow read: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null;
    }
  }
}
```

## خصائص النظام المحسنة 🚀

### معالجة الأخطاء الذكية:
- إعادة المحاولة التلقائية عند فشل الحفظ
- آليات احتياطية متعددة للحفظ
- رسائل خطأ واضحة وقابلة للفهم
- تشخيص مفصل في وحدة التحكم

### واجهة مستخدم محسنة:
- مؤشرات حالة التحميل الذكية
- أزرار الإنقاذ لإنشاء الملف الشخصي يدوياً
- رسائل توجيهية للمستخدم
- تصميم متجاوب مع الثيم المظلم

### التوافق مع الخطة المجانية:
- لا يستخدم Firebase Storage (غير متوفر في الخطة المجانية)
- تحسين استعلامات Firestore لتوفير الكوتا
- معالجة ذكية لحدود الاستخدام
- نظام تخزين محلي احتياطي

## دعم إضافي 🆘

إذا كنت لا تزال تواجه مشاكل:

1. **تحقق من إعدادات المشروع**: تأكد من أن Project ID صحيح
2. **راجع سجلات Firebase**: في Firebase Console → Usage and billing
3. **اختبر الاتصال**: استخدم وحدة التحكم في المتصفح
4. **تحقق من الكوتا**: تأكد من عدم تجاوز حدود الخطة المجانية

---

**ملاحظة مهمة**: هذا الإعداد مُصمم خصيصاً للعمل مع الخطة المجانية من Firebase ولا يتطلب ترقية الحساب أو دفع رسوم إضافية.