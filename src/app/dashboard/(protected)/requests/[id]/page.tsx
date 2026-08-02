import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { formatArabicDate } from '@/lib/utils';
import { RequestReviewToolbar } from '@/components/admin/RequestReviewToolbar';
import { AddCommentSection } from '@/components/common/AddCommentSection';
import {
  ArrowRight,
  ExternalLink,
  Clock,
  Layers,
} from 'lucide-react';
import { RequestStatus } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRequestReviewPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  const { data: request } = await supabase
    .from('requests')
    .select(
      '*, initiative:initiatives(name, contact_email, contact_phone), platform:platforms(name), media_type:media_types(name), sla:request_sla(*)'
    )
    .eq('id', id)
    .maybeSingle();

  if (!request) notFound();

  const { data: versions } = await supabase
    .from('request_versions')
    .select('*')
    .eq('request_id', id)
    .order('version_number', { ascending: false });

  const latestVersion = versions?.[0];
  const previousVersion = versions?.[1];

  const { data: timeline } = await supabase
    .from('request_status_history')
    .select('*, changed_by_profile:profiles(full_name, role)')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  const { data: comments } = await supabase
    .from('request_comments')
    .select('*, author:profiles(full_name, role)')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  // Find latest rejection / changes requested reason from history if needed
  const pastChangeRequest = timeline?.filter(t => t.to_status === 'changes_requested' || t.to_status === 'rejected').pop();
  const originalAdminNotes = request.rejection_reason || pastChangeRequest?.reason || 'تم طلب تعديلات على المبادرة';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500">#{request.reference_number}</span>
            <StatusBadge status={request.status as RequestStatus} />
            <SlaBadge state={(request.sla as any)?.state} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{request.title}</h1>
          <p className="text-xs text-slate-500">المبادرة: {(request.initiative as any)?.name}</p>
        </div>

        <Link
          href="/dashboard/requests"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all self-start sm:self-auto"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لجدول العمليات</span>
        </Link>
      </div>

      {/* Executive Resubmission Audit & Comparison Card */}
      {request.current_version > 1 && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#06266F] via-[#041B52] to-[#023793] text-white border-2 border-amber-400/80 shadow-xl space-y-5 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shrink-0">
                <span>إصدار معدل #{request.current_version}</span>
              </div>
              <div>
                <h2 className="text-base font-black text-white">توضيح التعديلات المنفذة من المبادرة (رد المبادرة)</h2>
                <p className="text-xs text-blue-200 mt-0.5">قام ممثل المبادرة بتنفيذ التعديلات الموضحة وإعادة التقديم للمراجعة</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold self-start sm:self-auto">
              جاهز لمراجعة المشرف لاتخاذ القرار
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. What Admin Requested */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <span>الملاحظات والتعديلات المطلوبة سابقاً من المشرف:</span>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-white/10 whitespace-pre-wrap font-medium">
                {originalAdminNotes}
              </p>
            </div>

            {/* 2. What Initiative Replied & Changed */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <span>توضيح المبادرة لما تم تعديله (رد المبادرة):</span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-white/10 font-bold whitespace-pre-wrap">
                {latestVersion?.resubmission_reason || 'تم تطبيق التعديلات المطلوبة كاملة وإعادة رفع الملفات.'}
              </p>
            </div>
          </div>
          
          {/* Quick Snapshot Comparison */}
          {previousVersion && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-bold text-blue-200 block">مقارنة سريعة بين الإصدار السابق والإصدار الحالي:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 space-y-1">
                  <span className="text-amber-300 font-bold block">الإصدار السابق (v{previousVersion.version_number}):</span>
                  <p className="text-slate-300 truncate">العنوان: {previousVersion.title}</p>
                  <p className="text-slate-300 truncate dir-ltr text-right">درايف: {previousVersion.drive_link}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 space-y-1">
                  <span className="text-emerald-300 font-bold block">الإصدار الحالي المعدل (v{request.current_version}):</span>
                  <p className="text-white font-bold truncate">العنوان: {request.title}</p>
                  <p className="text-white font-bold truncate dir-ltr text-right">درايف: {request.drive_link}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary State Machine Action Toolbar (Instant 0ms Feedback) */}
      <RequestReviewToolbar requestId={id} currentStatus={request.status as RequestStatus} />

      {/* Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Details Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">المبادرة المقدمة:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(request.initiative as any)?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">المنصة ونوع المحتوى:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(request.platform as any)?.name} ({(request.media_type as any)?.name})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">تاريخ النشر المقترح:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatArabicDate(request.requested_publish_at)}
                </span>
              </div>
            </div>

            {/* Google Drive Link Box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-[#06266F] dark:text-blue-300">رابط قوقل درايف المرفق:</span>
                <p className="text-xs text-slate-500 truncate dir-ltr text-right">{request.drive_link}</p>
              </div>
              <a
                href={request.drive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-4 py-2 rounded-xl bg-[#06266F] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#023793] transition-all shadow-sm"
              >
                <span>فتح المجلد</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Caption text */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">نص المنشور (الكابشن):</span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {request.caption}
              </div>
            </div>

            {request.notes && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">ملاحظات المبادرة:</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">{request.notes}</p>
              </div>
            )}
          </div>

          {/* Instant Client Discussion & Comment Box */}
          <AddCommentSection
            requestId={id}
            initialComments={comments || []}
            currentUserFullName={profile?.full_name || 'مشرف النظام'}
            currentUserRole={profile?.role || 'super_admin'}
          />

        </div>

        {/* Right 1 Col: Timeline & Version Snapshots */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-[#06266F] dark:text-blue-400" />
              <span>سجل الحالات والنشاط</span>
            </div>

            <div className="relative pr-4 border-r-2 border-slate-200 dark:border-slate-800 space-y-6">
              {timeline?.map((hist) => (
                <div key={hist.id} className="relative">
                  <span className="absolute -right-[23px] top-1 w-3 h-3 rounded-full bg-[#06266F] ring-4 ring-white dark:ring-[#111C35]" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      الحالة: ({hist.to_status})
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {formatArabicDate(hist.created_at)}
                    </span>
                    {hist.reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                        السبب: {hist.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {versions && versions.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-[#06266F] dark:text-blue-400" />
                <span>نسخ الطلب المرفوعة ({versions.length})</span>
              </div>

              <div className="space-y-3">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#06266F] dark:text-blue-400">إصدار #{ver.version_number}</span>
                      <span className="text-[11px] text-slate-400">{formatArabicDate(ver.created_at)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 truncate">{ver.title}</p>
                    {ver.resubmission_reason && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 pt-1">
                        سبب التعديل: {ver.resubmission_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
