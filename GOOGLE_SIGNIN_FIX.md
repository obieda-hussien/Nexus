# إصلاح مشكلة تسجيل الدخول بجوجل

## المشكلة
تسجيل الدخول بجوجل لا يعمل بشكل صحيح على الموقع.

## الأسباب المحتملة
1. **عدم تفعيل Google Sign-In في Firebase Console**
2. **عدم إضافة Domain المستضاف إلى القائمة البيضاء**
3. **مشاكل في إعدادات OAuth 2.0**

## خطوات الإصلاح

### 1. التحقق من تفعيل Google Sign-In
1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `nexus-012`
3. اذهب إلى **Authentication** → **Sign-in method**
4. تأكد من تفعيل **Google** كطريقة تسجيل دخول
5. إذا لم تكن مفعلة، اضغط على **Google** ثم **Enable**

### 2. إضافة Domain المستضاف
1. في نفس الصفحة (**Authentication** → **Sign-in method**)
2. انتقل إلى تبويب **Authorized domains**
3. أضف النطاقات التالية:
   - `hmw41kbdfle2.space.minimax.io`
   - `localhost` (للتطوير المحلي)
4. احفظ التغييرات

### 3. التحقق من OAuth 2.0
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروع `nexus-012`
3. اذهب إلى **APIs & Services** → **Credentials**
4. ابحث عن OAuth 2.0 Client ID الخاص بـ Firebase
5. تأكد من إضافة:
   - **Authorized JavaScript origins**:
     - `https://hmw41kbdfle2.space.minimax.io`
   - **Authorized redirect URIs**:
     - `https://hmw41kbdfle2.space.minimax.io/__/auth/handler`

### 4. التحقق من Firebase Rules
تأكد من أن قواعد Firebase Realtime Database تسمح بالكتابة للمستخدمين المُصادق عليهم:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

### 5. إعادة نشر الموقع
بعد تطبيق التغييرات في Firebase Console:
1. امسح الـ cache في المتصفح
2. حاول تسجيل الدخول بجوجل مرة أخرى
3. افتح Developer Console (F12) وتحقق من أي أخطاء

## رسائل الخطأ الشائعة وحلولها

### خطأ: "auth/unauthorized-domain"
**الحل**: أضف domain الموقع إلى Authorized domains في Firebase Console

### خطأ: "auth/popup-blocked"
**الحل**: اطلب من المستخدم السماح للنوافذ المنبثقة

### خطأ: "auth/popup-closed-by-user"
**الحل**: هذا طبيعي - المستخدم أغلق النافذة المنبثقة

## ملاحظات
- الكود الخاص بـ Google Sign-In موجود في `/workspace/nexus/src/contexts/AuthContext.jsx`
- الوظيفة المستخدمة: `signInWithGoogle()`
- يتم حفظ بيانات المستخدم في Firebase Realtime Database تلقائيًا بعد التسجيل
