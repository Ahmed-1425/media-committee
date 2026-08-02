import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { updateInitiative } from '@/actions/initiatives';
import { ArrowRight, Building2, FileText, CheckCircle2, Clock } from 'lucide-react';
import { RequestStatus } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminInitiativeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: initiative } = await supabase
    .from('initiatives')
    .select('*')
    .eq('id', id)
    .single();

  if (!initiative) notFound();

  const { data: requests } = await supabase
    .from('requests')
    .select('*, platform:platforms(name)')
    .eq('initiative_id', id)
    .order('created_at', { ascending: false });

  const reqList = requests || [];
  const publishedCount = reqList.filter((r) => r.status === 'published').length;
  const inReviewCount = reqList.filter((r) => r.status === 'submitted' || r.status === 'under_review').length;

  async function handleUpdate(formData: FormData) {
    'use server';
    await updateInitiative(id, formData);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-bold text-slate-400">ملف المبادرة الطلابية</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{initiative.name}</h1>
        </div>

        <Link
          href="/dashboard/initiatives"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all self-start sm:self-auto"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمبادرات</span>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 font-semibold block">إجمالي الطلبات</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{reqList.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs text-blue-600 font-semibold block">قيد المراجعة</span>
          <p className="text-2xl font-black text-blue-600">{inReviewCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs text-teal-600 font-semibold block">تم النشر</span>
          <p className="text-2xl font-black text-teal-600">{publishedCount}</p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          تحديث بيانات المبادرة
        </h2>

        <form action={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">اسم المبادرة *</label>
            <input
              type="text"
              name="name"
              defaultValue={initiative.name}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">البريد الإلكتروني المعتمد</label>
            <input
              type="email"
              name="contact_email"
              defaultValue={initiative.contact_email || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dir-ltr text-right"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">رقم التواصل</label>
            <input
              type="tel"
              name="contact_phone"
              defaultValue={initiative.contact_phone || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dir-ltr text-right"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl shadow-sm transition-all"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
