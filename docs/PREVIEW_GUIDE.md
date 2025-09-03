# 🌟 دليل المعاينة والتطوير / Preview & Development Guide

هذا الدليل يوضح كيفية معاينة التغييرات في الموقع قبل النشر النهائي على GitHub Pages.

## 🚀 طرق المعاينة المتاحة

### 1. 📥 تحميل البناء من GitHub Actions
عندما تقوم بعمل push أو pull request، يتم بناء الموقع تلقائياً:

1. انتقل إلى تبويب **Actions** في المستودع
2. ابحث عن workflow run الخاص بالفرع الحالي
3. حمل artifact باسم `preview-build-[commit-hash]`
4. استخرج الملف وافتح `index.html` في المتصفح

### 2. 🖥️ التطوير المحلي (الطريقة المفضلة)
```bash
# استنساخ المستودع والانتقال للفرع المطلوب
git clone https://github.com/obieda-hussien/Nexus.git
cd Nexus
git checkout [branch-name]

# تثبيت التبعيات
npm install

# تشغيل سيرفر التطوير
npm run dev
```

ثم افتح المتصفح على: `http://localhost:5173`

**مميزات التطوير المحلي:**
- ✅ إعادة تحميل تلقائية عند التعديل
- ✅ إمكانية اختبار Firebase في بيئة التطوير
- ✅ سرعة في المعاينة والتطوير
- ✅ إمكانية debugging كاملة

### 3. ☁️ Vercel Preview (موصى به للمعاينة السريعة)

**الإعداد لمرة واحدة:**
1. انتقل إلى [vercel.com](https://vercel.com)
2. سجل دخول باستخدام GitHub
3. اختر "Import Project"
4. حدد مستودع `obieda-hussien/Nexus`
5. اتبع التعليمات للنشر

**بعد الإعداد:**
- Vercel ستنشئ رابط معاينة لكل فرع تلقائياً
- ستحصل على تحديثات فورية عند كل commit
- رابط فريد لكل pull request

### 4. 🌐 Netlify Drop (للمعاينة السريعة)

1. انتقل إلى [netlify.com](https://netlify.com)
2. حمل build artifact من GitHub Actions
3. اسحب مجلد `dist` إلى Netlify Drop
4. احصل على رابط معاينة فوري

### 5. 🏗️ GitHub Codespaces

1. في صفحة المستودع، اضغط الزر الأخضر `<> Code`
2. اختر تبويب `Codespaces`
3. اضغط `Create codespace on [branch-name]`
4. في التيرمينال شغل:
   ```bash
   npm install
   npm run dev
   ```
5. Codespaces ستعطيك رابط معاينة

## 🔧 إعدادات Firebase للمعاينة

عند المعاينة المحلية أو على خدمات أخرى، تأكد من:

```javascript
// في ملف firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjl-tbsDaqx_9vpZaCqn45eT06kKPVU6A",
  authDomain: "nexus-012.firebaseapp.com",
  projectId: "nexus-012",
  // باقي الإعدادات...
};
```

**ملاحظة مهمة:** Firebase سيعمل مع جميع طرق المعاينة بنفس الإعدادات.

## 🔄 سير العمل الموصى به

1. **للتطوير:** استخدم `npm run dev` محلياً
2. **للمعاينة السريعة:** استخدم Vercel أو Netlify
3. **للاختبار النهائي:** انتظر النشر على main branch

## 🚨 ملاحظات مهمة

- ✅ GitHub Pages تنشر فقط من `main` branch (حماية)
- ✅ جميع الطرق الأخرى تدعم معاينة الفروع
- ✅ Firebase يعمل مع جميع طرق المعاينة
- ✅ البيانات محفوظة في Firestore (لا حاجة لـ Storage)

## 🆘 في حالة مواجهة مشاكل

1. **مشكلة في البناء:** تحقق من console logs في Actions
2. **مشكلة Firebase:** تأكد من صحة الإعدادات
3. **مشكلة في المعاينة:** جرب طريقة أخرى من القائمة أعلاه

---

*آخر تحديث: ${new Date().toLocaleDateString('ar-EG')}*