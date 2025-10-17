# نظام إدارة السحب والأرباح - Withdrawal Management System

## المميزات الجديدة / New Features

### 🏦 إدارة طرق الدفع / Payment Methods Management
- **الحسابات البنكية**: إضافة حسابات بنكية مع IBAN ورقم الحساب
- **PayPal**: ربط حسابات PayPal للمدفوعات الدولية  
- **فودافون كاش**: دعم المحافظ الرقمية المحلية
- **إدارة متعددة**: إمكانية إضافة عدة طرق دفع وتحديد الافتراضية

### 💰 حاسبة الأرباح المتطورة / Advanced Profit Calculator
- **الرصيد المتاح**: عرض الرصيد القابل للسحب فوراً
- **الخصومات التلقائية**: 
  - عمولة المنصة: 10%
  - الضرائب: 5%
  - صافي الأرباح: 85%
- **طلبات معلقة**: تتبع المبالغ المطلوب سحبها

### 📊 تتبع شامل للعمليات / Comprehensive Transaction Tracking
- **سجل العمليات**: تاريخ كامل لجميع عمليات السحب
- **حالات متعددة**: قيد المعالجة، مكتمل، فاشل، معتمد
- **تفاصيل الدفع**: عرض طريقة الدفع المستخدمة والتواريخ

### ⚙️ إعدادات السحب المرنة / Flexible Withdrawal Settings
- **الحد الأدنى**: تحديد أقل مبلغ للسحب (افتراضي: 100 ج.م)
- **السحب التلقائي**: جدولة سحب شهري تلقائي
- **اختيار التاريخ**: تحديد يوم السحب التلقائي (1-28)

### 🚀 السحب السريع / Quick Withdrawal
- **خيارات جاهزة**: 25%، 50%، 75%، الكل
- **تحقق فوري**: التأكد من توفر الرصيد وطرق الدفع
- **معالجة سريعة**: 3-5 أيام عمل للمعالجة

## هيكل قاعدة البيانات / Database Structure

```
users/
  {userId}/
    paymentMethods/
      {methodId}/
        - type: "bank" | "paypal" | "vodafone"
        - bankName: string
        - accountNumber: string
        - accountHolderName: string
        - iban: string (optional)
        - paypalEmail: string
        - vodafoneCashNumber: string
        - isDefault: boolean
        - createdAt: timestamp
    
    withdrawalHistory/
      {withdrawalId}/
        - amount: number
        - status: "pending" | "completed" | "failed" | "approved"
        - paymentMethod: object
        - requestedAt: timestamp
        - expectedProcessing: string
    
    earnings/
      - total: number
    
    instructorData/
      withdrawalSettings/
        - minimumWithdrawal: number (default: 100)
        - autoWithdrawal: boolean (default: false)
        - withdrawalDay: number (default: 15)
```

## قواعد الأمان / Security Rules

يجب تحديث قواعد Firebase لتشمل المسارات الجديدة. راجع الملف:
`firebase-rules-withdrawal.json`

## الواجهات المحدثة / Updated Interfaces

### 📱 تبويب الإعدادات / Settings Tab
- قسم جديد "إدارة السحب والأرباح"
- إضافة وحذف طرق الدفع
- تكوين إعدادات السحب
- عرض الرصيد المتاح والطلبات المعلقة

### 💹 تبويب الأرباح / Earnings Tab  
- عرض محدث للرصيد المتاح
- أزرار سحب سريع
- ربط مباشر مع إدارة طرق الدفع
- حاسبة أرباح متطورة مع الخصومات

## التكامل مع التصميم / Design Integration

- **RTL Support**: دعم كامل للاتجاه العربي
- **Dark Theme**: متوافق مع الثيم الداكن للموقع
- **Responsive**: يعمل على جميع الأجهزة
- **Animations**: تأثيرات حركية سلسة
- **Icons**: أيقونات واضحة من Lucide React

## المتطلبات التقنية / Technical Requirements

- React 18+
- Firebase Realtime Database
- Lucide React Icons
- React Hot Toast (للإشعارات)
- Tailwind CSS

## طريقة الاستخدام / How to Use

### للمدرسين / For Instructors:
1. انتقل إلى تبويب "الإعدادات"
2. ادخل إلى قسم "إدارة السحب والأرباح"
3. أضف طريقة دفع أو أكثر
4. اضبط الحد الأدنى للسحب
5. اطلب سحب الأرباح من تبويب "الأرباح" أو "الإعدادات"

### للمطورين / For Developers:
1. تأكد من تحديث قواعد Firebase
2. استخدم المكونات الجديدة في SettingsTab و EarningsTab
3. أضف معالجة الأخطاء حسب الحاجة
4. اختبر جميع سيناريوهات السحب

## الحماية والأمان / Security & Protection

- ✅ التحقق من هوية المستخدم
- ✅ التحقق من الرصيد المتاح
- ✅ حفظ آمن لمعلومات الدفع
- ✅ تشفير البيانات الحساسة
- ✅ سجل كامل لجميع العمليات
- ✅ صلاحيات محددة في Firebase

## الدعم المستقبلي / Future Support

- 🔄 تكامل مع بوابات دفع حقيقية
- 📊 تقارير ضريبية تلقائية  
- 🔔 إشعارات SMS/Email للعمليات
- 💳 دعم المزيد من طرق الدفع
- 📈 تحليلات مالية متقدمة