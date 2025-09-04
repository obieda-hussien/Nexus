# حل مشكلة عدم ظهور تبويب Rules في Cloud Firestore 🔧

## 🎯 المشكلة
إذا كنت لا ترى تبويب "Rules" في Cloud Firestore، فهذا يعني أن قاعدة بيانات Firestore لم يتم إنشاؤها بعد.

## 📋 الحل خطوة بخطوة

### الخطوة 1: إنشاء قاعدة بيانات Cloud Firestore

1. **انتقل إلى Firebase Console**
   - [https://console.firebase.google.com](https://console.firebase.google.com)
   - اختر مشروع `nexus-012`

2. **البحث عن Firestore Database**
   - من القائمة الجانبية، ابحث عن **"Firestore Database"**
   - اضغط عليها

3. **إنشاء قاعدة البيانات**
   - إذا رأيت زر **"Create database"**، اضغط عليه
   - إذا كانت موجودة بالفعل، ستظهر البيانات مباشرة

4. **اختيار وضع الأمان**
   - اختر **"Start in test mode"** (مؤقت - سنغيره لاحقاً)
   - هذا يسمح بالقراءة والكتابة لمدة 30 يوماً

5. **اختيار الموقع**
   - اختر الموقع الأقرب لك (مثل `europe-west3`)
   - اضغط **"Done"**

### الخطوة 2: الوصول لتبويب Rules

بعد إنشاء قاعدة البيانات:
1. ستظهر صفحة Firestore Database
2. ستجد التبويبات في الأعلى: **Data | Rules | Indexes | Usage**
3. اضغط على تبويب **"Rules"**

### الخطوة 3: تطبيق قواعد الأمان النهائية

الصق هذه القواعد في محرر Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قواعد المستخدمين
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // قواعد الكورسات
    match /courses/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // قواعد الدروس
    match /lessons/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // قواعد تقدم المستخدمين
    match /user_progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // قواعد التحليلات
    match /analytics_events/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // قواعد سجلات الأمان
    match /security_logs/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // مجموعة الاختبارات
    match /test/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### الخطوة 4: نشر القواعد
1. اضغط **"Publish"** أعلى محرر القواعد
2. أكد النشر بالضغط على **"Publish"** مرة أخرى

## ✅ التحقق من نجاح الإعداد

### استخدام أداة التشخيص المدمجة
1. افتح الموقع وسجل الدخول
2. اضغط على أيقونة الإعدادات (⚙️) في لوحة التحكم
3. ستظهر أداة التشخيص الشاملة
4. تحقق من أن جميع الاختبارات تظهر ✅

### إذا ظهرت مشاكل
استخدم زر **"🔍 تشخيص المشكلة"** في الواجهة للحصول على:
- تشخيص تلقائي لمشاكل Firebase
- روابط مباشرة لـ Firebase Console
- حلول مخصصة لكل مشكلة

## 🚨 ملاحظات مهمة

### الفرق بين قواعد البيانات
- **Realtime Database**: يستخدم `databaseURL` في الإعداد
- **Cloud Firestore**: يستخدم `projectId` في الإعداد

**نحن نستخدم Cloud Firestore فقط** في هذا المشروع.

### التحقق من الإعداد الصحيح
تأكد من أن الكود يستخدم:
```javascript
import { getFirestore } from 'firebase/firestore';
const db = getFirestore(app);
```

وليس:
```javascript
import { getDatabase } from 'firebase/database';
const db = getDatabase(app);
```

## 🎉 بعد نجاح الإعداد

ستتمكن من:
- ✅ إنشاء حسابات جديدة وحفظ البيانات
- ✅ تسجيل الدخول بدون مشاكل تحميل
- ✅ عرض لوحة التحكم بجميع البيانات
- ✅ استخدام جميع مزايا المنصة التعليمية

الآن الموقع جاهز للاستخدام مع الخطة المجانية من Firebase!