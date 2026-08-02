import Link from 'next/link';
import { PublicHeader } from '@/components/common/Header';
import { PublicFooter } from '@/components/common/Footer';
import { ShieldCheck, Send, Sparkles, CheckCircle2, Calendar, ArrowLeft, Layers, FileCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070D1D] text-slate-900 dark:text-white font-sans dir-rtl">
      <PublicHeader />

      <main className="flex-1">
        {/* Corporate Hero Section */}
        <section className="relative py-20 lg:py-28 bg-gradient-to-b from-[#041B52]/15 via-[#06266F]/5 to-transparent overflow-hidden">
          {/* Subtle Ambient Radial Lights */}
          <div className="absolute -top-40 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
            
            {/* Top Corporate Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#06266F]/10 via-[#023793]/15 to-[#06266F]/10 dark:from-blue-500/10 dark:to-amber-500/10 border border-[#06266F]/20 dark:border-blue-400/30 text-[#06266F] dark:text-blue-200 text-xs sm:text-sm font-extrabold shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>المنصة التنظيمية المعتمدة لبرنامج الشراكة الطلابية</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-slate-900 dark:text-white">
              منظومة إعلامية متكاملة لتمكين
              <span className="block bg-gradient-to-r from-[#06266F] via-[#023793] to-amber-600 dark:from-blue-400 dark:via-blue-200 dark:to-amber-400 bg-clip-text text-transparent mt-2">
                المبادرات الطلابية بجودة واحترافية
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              المنصة التنظيمية الموحدة لاستقبال ومراجعة واعتماد خطط النشر الإعلامي، بإشراف اللجنة الإعلامية وبصنع وتطوير اللجنة التقنية.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#041B52] via-[#06266F] to-[#023793] hover:from-[#06266F] hover:to-[#041B52] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-2xl transition-all flex items-center justify-center gap-3 group border border-blue-400/20"
              >
                <span>بوابة المبادرات الطلابية</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform text-amber-400" />
              </Link>

              <Link
                href="/dashboard/login"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#111C35] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-blue-400/20 shadow-md transition-all flex items-center justify-center gap-2.5"
              >
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>لوحة تحكم الإدارة العليا</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Corporate Lifecycle Cards */}
        <section className="py-16 bg-white dark:bg-[#0E172A] border-y border-slate-200 dark:border-blue-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                دورة حوكمة طلب النشر الإعلامي
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold max-w-xl mx-auto">
                مسار عمل منظم وشفاف يضمن أعلى درجات التنسيق والجودة بين المبادرات واللجنة الإعلامية
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Step 1 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-blue-400/15 space-y-4 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#06266F] dark:text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/20">
                  1
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-500" />
                  <span>تقديم الطلب</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  تعبئة نماذج النشر المعتمدة، وإدراج روابط Google Drive، واختيار التاريخ والمنصات المستهدفة.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-blue-400/15 space-y-4 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg border border-amber-500/20">
                  2
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-500" />
                  <span>المراجعة والحوكمة</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  فحص دقيق للمحتوى من قبل مختصي اللجنة الإعلامية للتحقق من الهوية البصرية واللغوية.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-blue-400/15 space-y-4 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg border border-indigo-500/20">
                  3
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>الجدولة والتنسيق</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  اعتماد موعد النشر بالنظام لمنع التضارب بين الفعاليات والمبادرات الطلابية المختلفة.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-[#111C35] border border-slate-200 dark:border-blue-400/15 space-y-4 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/20">
                  4
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>التنفيذ والأرشفة</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  نشر المحتوى على الحسابات الرسمية وتوثيقه في الأرشيف والسجلات الإحصائية.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

