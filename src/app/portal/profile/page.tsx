import { createClient } from '@/lib/supabase/server';
import { updatePassword } from '@/actions/auth';
import { User, Mail, Phone, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function InitiativeProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from('initiative_memberships')
    .select('initiative:initiatives(name, contact_email, contact_phone)')
    .eq('profile_id', user.id)
    .maybeSingle();

  const initiativeData = (membership?.initiative as any) || {};

  async function handleUpdateProfile(formData: FormData) {
    'use server';
    const client = await createClient();
    const { data: { user: currentUser } } = await client.auth.getUser();
    if (!currentUser) return;

    const full_name = (formData.get('full_name') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();

    await client
      .from('profiles')
      .update({ full_name, phone })
      .eq('id', currentUser.id);

    revalidatePath('/portal/profile');
  }

  async function handlePasswordChange(formData: FormData) {
    'use server';
    await updatePassword(formData);
    revalidatePath('/portal/profile');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ملف الحساب وإعدادات المبادرة</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          إدارة تفاصيل الملف الشخصي وتحديث كلمة المرور لحساب المبادرة
        </p>
      </div>

      {/* Initiative Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#06266F] to-[#023793] text-white shadow-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs text-blue-200 font-semibold">المبادرة المعتمدة</span>
          <h2 className="text-xl font-bold">{initiativeData.name || 'المبادرة الطلابية'}</h2>
          <p className="text-xs text-blue-100">{profile?.email}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
          <Sparkles className="w-8 h-8 text-blue-300" />
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          البيانات الأساسية لممثل المبادرة
        </h3>

        <form action={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">اسم ممثل المبادرة</label>
            <input
              type="text"
              name="full_name"
              defaultValue={profile?.full_name || ''}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">البريد الإلكتروني (للتنبيهات)</label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm dir-ltr text-right cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">رقم التواصل</label>
              <input
                type="tel"
                name="phone"
                defaultValue={profile?.phone || ''}
                placeholder="05xxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm dir-ltr text-right"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            حفظ البيانات الشخصية
          </button>
        </form>
      </div>

      {/* Update Password Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          تغيير كلمة المرور
        </h3>

        <form action={handlePasswordChange} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">كلمة المرور الجديدة</label>
              <input
                type="password"
                name="password"
                required
                placeholder="8 خانات على الأقل"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm dir-ltr text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="تأكيد كلمة المرور"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm dir-ltr text-right"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            تحديث كلمة المرور
          </button>
        </form>
      </div>

    </div>
  );
}
