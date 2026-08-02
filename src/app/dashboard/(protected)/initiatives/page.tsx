import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { createInitiative, toggleInitiativeStatus } from '@/actions/initiatives';
import { Building2, PlusCircle, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ created?: string; statusToggled?: string }>;
}

export default async function AdminInitiativesPage({ searchParams }: PageProps) {
  const sParams = await searchParams;
  const supabase = await createClient();

  const { data: initiatives } = await supabase
    .from('initiatives')
    .select('*, members:initiative_memberships(count), requests:requests(count)')
    .order('created_at', { ascending: false });

  async function handleCreate(formData: FormData) {
    'use server';
    await createInitiative(formData);
    redirect('/dashboard/initiatives?created=true');
  }

  async function handleToggleStatus(id: string, currentActive: boolean) {
    'use server';
    await toggleInitiativeStatus(id, !currentActive);
    redirect('/dashboard/initiatives?statusToggled=true');
  }

  return (
    <div className="space-y-6">
      
      {/* Success Confirmation Banners */}
      {sParams.created && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <p className="font-extrabold text-sm sm:text-base">تمت إضافة المبادرة الطلابية بنجاح! 🏢</p>
            <p className="text-xs font-semibold opacity-90">يمكنك الآن ربط بريد ممثلي المبادرة للبدء برفع طلبات النشر.</p>
          </div>
        </div>
      )}

      {sParams.statusToggled && (
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
          <div>
            <p className="font-extrabold text-sm sm:text-base">تم تحديث حالة المبادرة بنجاح! 🔄</p>
            <p className="text-xs font-semibold opacity-90">تم حفظ الحالة التشغيلية الجديدة بالنظام.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة المبادرات الطلابية</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة وتعديل وتنشيط المبادرات الطلابية المعتمدة ببرنامج الشراكة الطلابية
          </p>
        </div>
      </div>

      {/* Add New Initiative Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#06266F] dark:text-blue-400 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>إضافة مبادرة جديدة</span>
        </h2>

        <form action={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">اسم المبادرة *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="مثال: مبادرة صناع التغيير"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">البريد الإلكتروني المعتمد</label>
            <input
              type="email"
              name="contact_email"
              placeholder="initiative@domain.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dir-ltr text-right"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">رقم التواصل</label>
            <input
              type="tel"
              name="contact_phone"
              placeholder="05xxxxxxxx"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dir-ltr text-right"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl shadow-sm transition-all"
            >
              حفظ وتوثيق المبادرة
            </button>
          </div>
        </form>
      </div>

      {/* Initiatives List */}
      {!initiatives || initiatives.length === 0 ? (
        <ArabicEmptyState
          icon="folder"
          title="لا توجد مبادرات مسجلة"
          description="يمكنك إضافة أول مبادرة طلابية معتمدة باستخدام النموذج أعلاه."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initiatives.map((ini) => (
            <div
              key={ini.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{ini.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ini.is_active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {ini.is_active ? 'نشطة' : 'معطلة'}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>البريد: {ini.contact_email || '-'}</p>
                <p>إجمالي الطلبات: {(ini.requests as any)?.[0]?.count || 0}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <form action={handleToggleStatus.bind(null, ini.id, ini.is_active)}>
                  <button
                    type="submit"
                    className={`text-xs font-semibold hover:underline ${
                      ini.is_active ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {ini.is_active ? 'تعطيل المبادرة' : 'تنشيط المبادرة'}
                  </button>
                </form>

                <Link
                  href={`/dashboard/initiatives/${ini.id}`}
                  className="text-xs font-bold text-[#06266F] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>التفاصيل والأداء</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
