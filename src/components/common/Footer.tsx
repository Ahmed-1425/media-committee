import Link from 'next/link';
import { TechnicalCommitteeLogo, PartnershipLogo } from './BrandLogos';

export function PublicFooter() {
  return (
    <footer className="w-full bg-gradient-to-br from-[#041B52] via-[#06266F] to-[#023793] border-t border-blue-400/20 text-white pt-12 pb-8 mt-auto shadow-2xl relative overflow-hidden">
      {/* Top glowing ambient line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400/80 via-blue-400/90 to-amber-400/80"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/15">
          
          {/* Column 1: Executive Branding & Logos */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-5 bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-md w-fit">
              <PartnershipLogo size={85} />
              <div className="h-14 w-px bg-white/20 hidden sm:block"></div>
              <TechnicalCommitteeLogo size={85} />
            </div>

            <div className="space-y-1 pt-1">
              <h3 className="font-black text-lg sm:text-xl text-white">المنصة التنظيمية للجنة الإعلامية</h3>
              <p className="text-xs text-amber-300 font-bold">برنامج الشراكة الطلابية - جامعة الملك سعود</p>
            </div>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-md">
              المنصة الرسمية المعتمدة لاستقبال ومراجعة وإدارة طلبات النشر الإعلامي للمبادرات الطلابية وفق أعلى معايير الجودة والحوكمة والهوية البصرية.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-widest">روابط المنصة</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-blue-100/90">
              <li>
                <Link href="/" className="hover:text-white hover:underline transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white hover:underline transition-colors">
                  بوابة المبادرات الطلابية
                </Link>
              </li>
              <li>
                <Link href="/dashboard/login" className="hover:text-white hover:underline transition-colors">
                  لوحة تحكم الإدارة
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Meta */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-widest">معلومات النظام</h4>
            <div className="text-xs space-y-2.5 text-blue-100/90 font-medium">
              <div className="flex items-center justify-between">
                <span>إصدار النظام:</span>
                <span className="font-mono bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-lg text-amber-300 font-bold">v1.2.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>الحالة التشغيلية:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  نشط ومستقر
                </span>
              </div>
              <p className="pt-2 text-[11px] text-blue-200/70 leading-normal">
                جميع الحقوق محفوظة © {new Date().getFullYear()} برنامج الشراكة الطلابية | اللجنة التقنية.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-blue-200/80">
          <p>© {new Date().getFullYear()} برنامج الشراكة الطلابية | المنصة التنظيمية المعتمدة</p>
          <p className="text-center sm:text-left text-amber-300/90">تطوير وتصميم اللجنة التقنية ببرنامج الشراكة الطلابية</p>
        </div>
      </div>
    </footer>
  );
}
