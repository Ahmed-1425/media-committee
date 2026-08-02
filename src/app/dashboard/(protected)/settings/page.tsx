import { createClient } from '@/lib/supabase/server';
import { addPlatformItem, addMediaTypeItem, saveSlaPolicy } from '@/actions/settings';
import { Settings, PlusCircle, Clock, ShieldCheck, Layers, Share2 } from 'lucide-react';
import { RequestPriority } from '@/lib/types';

import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ savedSla?: string; addedPlatform?: string; addedMedia?: string }>;
}

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const sParams = await searchParams;
  const supabase = await createClient();

  const [{ data: platforms }, { data: mediaTypes }, { data: slaPolicies }] = await Promise.all([
    supabase.from('platforms').select('*').order('sort_order'),
    supabase.from('media_types').select('*').order('sort_order'),
    supabase.from('sla_policies').select('*').order('created_at'),
  ]);

  async function handleAddPlatform(formData: FormData) {
    'use server';
    const name = (formData.get('name') as string || '').trim();
    const code = (formData.get('code') as string || '').trim();
    if (name && code) {
      await addPlatformItem(name, code);
      redirect('/dashboard/settings?addedPlatform=true');
    }
  }

  async function handleAddMediaType(formData: FormData) {
    'use server';
    const name = (formData.get('name') as string || '').trim();
    const code = (formData.get('code') as string || '').trim();
    if (name && code) {
      await addMediaTypeItem(name, code);
      redirect('/dashboard/settings?addedMedia=true');
    }
  }

  async function handleSaveSla(formData: FormData) {
    'use server';
    const priority = formData.get('priority') as RequestPriority;
    const name = (formData.get('name') as string || '').trim();
    const minutes = parseInt(formData.get('minutes') as string || '60', 10);
    if (priority && name && minutes) {
      await saveSlaPolicy(priority, name, minutes);
      redirect('/dashboard/settings?savedSla=true');
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Confirmation Banners */}
      {sParams.savedSla && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <p className="font-extrabold text-sm sm:text-base">تم حفظ وتطبيق سياسة SLA بنجاح! ⏱️</p>
            <p className="text-xs font-semibold opacity-90">سيتم حساب مهلة المراجعة تلقائياً لجميع الطلبات الجديدة والنشطة.</p>
          </div>
        </div>
      )}

      {sParams.addedPlatform && (
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
          <div>
            <p className="font-extrabold text-sm sm:text-base">تمت إضافة المنصة الجديدة بنجاح! 🌐</p>
            <p className="text-xs font-semibold opacity-90">يمكن للمبادرات الطلابية الآن اختيار هذه المنصة عند تقديم طلب جديد.</p>
          </div>
        </div>
      )}

      {sParams.addedMedia && (
        <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 text-xs font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
          <div>
            <p className="font-extrabold text-sm sm:text-base">تمت إضافة نوع المحتوى بنجاح! 🎨</p>
            <p className="text-xs font-semibold opacity-90">تم تحديث قائمة أنواع المحتوى الإعلامي المتاحة بالنظام.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إعدادات المنصة وحوكمة SLA</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          تهيئة خيارات المنصات، أنواع المحتوى المعتمدة، وإعداد اتفاقيات مستوى الخدمة للمراجعة
        </p>
      </div>

      {/* SLA Policy Config Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-2 font-bold text-base text-[#06266F] dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Clock className="w-5 h-5 text-[#06266F] dark:text-blue-400" />
          <span>توصيف اتفاقية مستوى الخدمة (SLA Target Policies)</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          حدد الزمن المستهدف بالدقائق لإكمال مراجعة الطلبات حسب الأولوية. يتم حساب المهلة أوتوماتيكياً فور تقديم الطلب.
        </p>

        <form action={handleSaveSla} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">مستوى الأولوية *</label>
            <select name="priority" required className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
              <option value="normal">عادي (Normal)</option>
              <option value="urgent">عاجل (Urgent)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">اسم السياسة *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="مثال: سياسة مراجعة الطلبات العادية"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">المهلة المستهدفة (بالدقائق) *</label>
            <input
              type="number"
              name="minutes"
              required
              defaultValue={120}
              min={15}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl shadow-sm transition-all"
            >
              حفظ سياسة SLA
            </button>
          </div>
        </form>

        {/* Existing SLA Policies Table */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">السياسات المفعلة حالياً:</h3>
          {!slaPolicies || slaPolicies.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl">
              لم يتم إعداد اتفاقية مستوى الخدمة بعد. استخدم النموذج أعلاه لضبط السياسات.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slaPolicies.map((pol) => (
                <div key={pol.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{pol.name}</span>
                    <span className="text-slate-500">الأولوية: {pol.priority === 'urgent' ? 'عاجل' : 'عادي'}</span>
                  </div>
                  <span className="font-mono font-bold text-[#06266F] dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-3 py-1 rounded-lg">
                    {pol.target_review_minutes} دقيقة
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reference Data: Platforms */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-2 font-bold text-base text-[#06266F] dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Share2 className="w-5 h-5" />
          <span>خيارات المنصات المتاحة والنشر (X, Instagram, TikTok, LinkedIn, إلخ)</span>
        </div>

        <form action={handleAddPlatform} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">اسم المنصة باللغة العربية *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="مثال: منصة إكس (تويتر سابقاً)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">رمز المنصة (Code) *</label>
            <input
              type="text"
              name="code"
              required
              placeholder="x / instagram / tiktok / linkedin"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              إضافة منصة جديدة
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {!platforms || platforms.length === 0 ? (
            <p className="text-xs text-slate-400">لا توجد منصات مسجلة بعد.</p>
          ) : (
            platforms.map((p) => (
              <span key={p.id} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                {p.name} ({p.code})
              </span>
            ))
          )}
        </div>
      </div>

      {/* Reference Data: Media Types */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-2 font-bold text-base text-[#06266F] dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Layers className="w-5 h-5" />
          <span>أنواع المحتوى الإعلامي (صورة، فيديو، كارتوني، ستوري، ريلز، إلخ)</span>
        </div>

        <form action={handleAddMediaType} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">اسم نوع المحتوى باللغة العربية *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="مثال: تصاميم متحركة / ريلز"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">الرمز البرمجي (Code) *</label>
            <input
              type="text"
              name="code"
              required
              placeholder="image / video / carousel / story / reel"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              إضافة نوع محتوى
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {!mediaTypes || mediaTypes.length === 0 ? (
            <p className="text-xs text-slate-400">لا توجد أنواع محتوى مسجلة بعد.</p>
          ) : (
            mediaTypes.map((m) => (
              <span key={m.id} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                {m.name} ({m.code})
              </span>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
