# المنصة التنظيمية للجنة الإعلامية - برنامج الشراكة الطلابية (اللجنة التقنية)

منصة إنتاجية متكاملة ومخصصة لإدارة ومراجعة وجدولة طلبات النشر الإعلامي الخاصة بالمبادرات الطلابية، مصممة وطورة بواسطة **اللجنة التقنية ببرنامج الشراكة الطلابية**.

---

## 🚀 دليل الإعداد والتشغيل الفني

### 1. المتطلبات الأساسية
- Node.js `v22+` و npm `v10+`
- مشروع Supabase جديد مع تفعيل Supabase Auth (Email / Password).

### 2. إعداد متغيرات البيئة (Environment Variables)
قم بإنشاء ملف `.env.local` واستبدال القيم التوضيحية بقيم مشروع Supabase الخاص بك:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_TIMEZONE=Asia/Riyadh
```

### 3. تطبيق تهجير قاعدة البيانات (Supabase Database Migrations)
قم بتشغيل ملف السكربت `supabase/migrations/20260731000000_initial_schema.sql` في محرّر SQL بمشروع Supabase.

يتضمن السكربت:
- إنشاء الأنواع والجداول (Profiles, Initiatives, Requests, Versions, Status History, Comments, Notifications, SLA Policies, Audit Logs).
- إنشاء الدوال الأمنية `current_app_role()` و `current_initiative_id()`.
- تفعيل سياسات أمان صفوف قاعدة البيانات (Row Level Security - RLS) لكل جدول.

### 4. إنشاء حساب المشرف الممتاز الأول (First Super Admin Creation)
1. انتقل لوحة تحكم Supabase Auth وأنقئ مستخدماً جديداً بالبريد الإلكتروني وكلمة المرور الخاصة بك.
2. اذهب إلى جدول `profiles` وقم بتعديل حقل `role` لهذا المستخدم ليصبح `'super_admin'`.
3. يمكنك الآن تسجيل الدخول مباشرة من المسار `/dashboard/login`.

### 5. التهيئة الأولية للمنصة من لوحة التحكم (`/dashboard`)
1. **المنصات وأنواع المحتوى (`/dashboard/settings`)**: أضف المنصات (مثل منصة X، انستغرام، تيك توك) وأنواع المحتوى (تصميم، فيديو، ريلز).
2. **اتفاقية مستوى الخدمة SLA (`/dashboard/settings`)**: أضف مدد المراجعة المستهدفة (بالدقائق) للأولويات.
3. **إدارة المبادرات (`/dashboard/initiatives`)**: قم بإنشاء المبادرات الطلابية المعتمدة.
4. **إدارة الحسابات (`/dashboard/users`)**: قم بإنشاء حسابات ممثلي المبادرات وتعيين المبادرة التابعين لها.

---

## 🧪 الفحص والتحقق البرمجي

لتشغيل السكربت الآلي لفحص قواعد الأمان والتحقق من المدخلات:
```bash
npm run test:rls
```

لبناء المشروع والتأكد من خلوه من الأخطاء:
```bash
npm run build
```

---

حقوق النشر © برنامج الشراكة الطلابية | اللجنة التقنية `v1.0.0`
