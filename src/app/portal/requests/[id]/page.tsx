import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { formatArabicDate, formatArabicShortDate, formatArabicRelativeTime, isValidGoogleDriveUrl } from '@/lib/utils';
import { resubmitRequest, addComment } from '@/actions/requests';
import {
  ArrowRight,
  ExternalLink,
  Clock,
  History,
  MessageSquare,
  RefreshCw,
  Send,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Layers,
} from 'lucide-react';
import { RequestStatus } from '@/lib/types';

import { ResubmitRequestForm } from '@/components/portal/ResubmitRequestForm';
import { AddCommentSection } from '@/components/common/AddCommentSection';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string; saved?: string; resubmitted?: string; commentAdded?: string }>;
}

export default async function PortalRequestDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  // Fetch request details with strict RLS enforcement
  const { data: request } = await supabase
    .from('requests')
    .select(
      '*, initiative:initiatives(name), platform:platforms(name), media_type:media_types(name), sla:request_sla(*)'
    )
    .eq('id', id)
    .maybeSingle();

  if (!request) notFound();

  // Fetch Version history
  const { data: versions } = await supabase
    .from('request_versions')
    .select('*, platform:platforms(name), media_type:media_types(name)')
    .eq('request_id', id)
    .order('version_number', { ascending: false });

  // Fetch Status history timeline
  const { data: timeline } = await supabase
    .from('request_status_history')
    .select('*, changed_by_profile:profiles(full_name, role)')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  // Fetch Comments
  const { data: comments } = await supabase
    .from('request_comments')
    .select('*, author:profiles(full_name, role)')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  const canResubmit = request.status === 'changes_requested' || request.status === 'rejected';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Toast Alerts for newly submitted, saved, resubmitted, or comment added */}
      {sParams.submitted && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <FileCheck2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <p className="font-extrabold text-sm sm:text-base">تم تقديم طلب النشر بنجاح! 🎉</p>
            <p className="text-xs font-semibold opacity-90">تم إرسال طلبك وتسليمه للجنة الإعلامية للمراجعة.</p>
          </div>
        </div>
      )}

      {sParams.saved && (
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <FileCheck2 className="w-6 h-6 text-blue-500 shrink-0" />
          <div>
            <p className="font-extrabold text-sm sm:text-base">تم حفظ المسودة بنجاح! 💾</p>
            <p className="text-xs font-semibold opacity-90">يمكنك تعديل وتأكيد تسليم الطلب في أي وقت.</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500">#{request.reference_number}</span>
            <StatusBadge status={request.status as RequestStatus} />
            <SlaBadge state={(request.sla as any)?.state} dueAt={(request.sla as any)?.due_at} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{request.title}</h1>
        </div>

        <Link
          href="/portal/requests"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all self-start sm:self-auto"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للطلبات</span>
        </Link>
      </div>

      {/* Main Grid: Details + Resubmit + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Main Content & Comments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Rejection / Changes Requested Notice */}
          {canResubmit && request.rejection_reason && (
            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>سبب طلب التعديل / الملاحظات من المشرف:</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-amber-200/50">
                {request.rejection_reason}
              </p>
            </div>
          )}

          {/* Request Card Content */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">المنصة:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(request.platform as any)?.name || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">نوع المحتوى:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(request.media_type as any)?.name || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">الأولوية:</span>
                <span className={`font-bold ${request.priority === 'urgent' ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {request.priority === 'urgent' ? 'عاجل' : 'عادي'}
                </span>
              </div>
            </div>

            {/* Google Drive Link Box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-[#06266F] dark:text-blue-300">مجلد الملفات المرفقة (Google Drive):</span>
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

          {/* Resubmission Form (Instant 0ms Feedback Client Component) */}
          {canResubmit && <ResubmitRequestForm request={request} />}

          {/* Instant Discussion & Comments Box */}
          <AddCommentSection
            requestId={id}
            initialComments={comments || []}
            currentUserFullName={profile?.full_name || 'ممثل المبادرة'}
            currentUserRole={profile?.role || 'initiative_user'}
          />

        </div>

        {/* Right 1 Col: Timeline & Version History */}
        <div className="space-y-6">
          
          {/* Status Timeline */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-[#06266F] dark:text-blue-400" />
              <span>سجل الحالات والنشاط</span>
            </div>

            <div className="relative pr-4 border-r-2 border-slate-200 dark:border-slate-800 space-y-6">
              {timeline?.map((hist, idx) => (
                <div key={hist.id} className="relative">
                  <span className="absolute -right-[23px] top-1 w-3 h-3 rounded-full bg-[#06266F] ring-4 ring-white dark:ring-[#111C35]" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      تغيرت الحالة إلى ({hist.to_status})
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {formatArabicDate(hist.created_at)}
                    </span>
                    {hist.reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                        السبب/الملاحظة: {hist.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version Snapshots */}
          {versions && versions.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-[#06266F] dark:text-blue-400" />
                <span>سجل الإصدارات ({versions.length})</span>
              </div>

              <div className="space-y-3">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#06266F] dark:text-blue-400">إصدار #{ver.version_number}</span>
                      <span className="text-[11px] text-slate-400">{formatArabicShortDate(ver.created_at)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 truncate">{ver.title}</p>
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
