import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { formatArabicDate, formatArabicRelativeTime } from '@/lib/utils';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowLeft,
  Flame,
  PlusCircle,
  Users,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { RequestStatus } from '@/lib/types';

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();

  // Fetch real counts across all platform records ordered by updated_at descending
  const [{ data: requests }, { count: activeInitiativesCount }] = await Promise.all([
    supabase
      .from('requests')
      .select('*, initiative:initiatives(name), platform:platforms(name), sla:request_sla(*)')
      .order('updated_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('initiatives')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ]);

  const allReqs = requests || [];

  const submittedCount = allReqs.filter((r) => r.status === 'submitted').length;
  const underReviewCount = allReqs.filter((r) => r.status === 'under_review').length;
  const changesRequestedCount = allReqs.filter((r) => r.status === 'changes_requested').length;
  const approvedCount = allReqs.filter((r) => r.status === 'approved').length;
  const scheduledCount = allReqs.filter((r) => r.status === 'scheduled').length;
  const publishedCount = allReqs.filter((r) => r.status === 'published').length;
  const overdueSlaCount = allReqs.filter((r) => (r.sla as any)?.state === 'breached').length;

  const urgentRequests = allReqs.filter((r) => r.priority === 'urgent' && r.status !== 'published' && r.status !== 'archived');
  const atRiskRequests = allReqs.filter((r) => (r.sla as any)?.state === 'at_risk' || (r.sla as any)?.state === 'breached');
  const recentSubmissions = allReqs.slice(0, 8);

  return (
    <div className="space-y-8 pb-8">
      
      {/* Corporate Executive Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#041B52] via-[#06266F] to-[#023793] text-white shadow-2xl border border-blue-400/30">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-blue-400 to-amber-400 opacity-90" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-300 font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>منظومة حوكمة الإعلام والاتصال</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              أهلاً بك، {adminProfile?.full_name || 'المشرف الممتاز'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-2xl leading-relaxed">
              مركز التحكم والقيادة التنفيذية لمتابعة كافة طلبات المبادرات الطلابية، مؤشرات الأداء الفعلي، وسرعة الاستجابة وفق اتفاقية SLA.
            </p>
          </div>

          {/* Quick Corporate Shortcuts Header */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard/requests"
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>جدول العمليات الكامل</span>
            </Link>

            <Link
              href="/dashboard/users"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>إدارة الحسابات</span>
            </Link>

            <Link
              href="/dashboard/initiatives"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>المبادرات</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Corporate KPI Metrics Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#06266F] dark:text-blue-400" />
            <span>مؤشرات أداء وحالات الطلبات الحالية</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">إجمالي الطلبات: {allReqs.length}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-blue-100 dark:border-slate-800 shadow-2xs space-y-1 hover:border-blue-500 transition-all group">
            <span className="text-[11px] font-bold text-slate-500 block truncate">مُقدَّم جديد</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">{submittedCount}</p>
            <div className="w-full bg-blue-100 dark:bg-blue-950 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, (submittedCount / (allReqs.length || 1)) * 100)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-amber-100 dark:border-slate-800 shadow-2xs space-y-1 hover:border-amber-500 transition-all group">
            <span className="text-[11px] font-bold text-slate-500 block truncate">قيد المراجعة</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">{underReviewCount}</p>
            <div className="w-full bg-amber-100 dark:bg-amber-950 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (underReviewCount / (allReqs.length || 1)) * 100)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-orange-100 dark:border-slate-800 shadow-2xs space-y-1 hover:border-orange-500 transition-all group">
            <span className="text-[11px] font-bold text-slate-500 block truncate">مطلوب تعديل</span>
            <p className="text-2xl font-black text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform">{changesRequestedCount}</p>
            <div className="w-full bg-orange-100 dark:bg-orange-950 h-1 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(100, (changesRequestedCount / (allReqs.length || 1)) * 100)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-emerald-100 dark:border-slate-800 shadow-2xs space-y-1 hover:border-emerald-500 transition-all group">
            <span className="text-[11px] font-bold text-slate-500 block truncate">مقبول ومعتمد</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">{approvedCount}</p>
            <div className="w-full bg-emerald-100 dark:bg-emerald-950 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (approvedCount / (allReqs.length || 1)) * 100)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-indigo-100 dark:border-slate-800 shadow-2xs space-y-1 hover:border-indigo-500 transition-all group">
            <span className="text-[11px] font-bold text-slate-500 block truncate">مجدول بالنشر</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">{scheduledCount}</p>
            <div className="w-full bg-indigo-100 dark:bg-indigo-950 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (scheduledCount / (allReqs.length || 1)) * 100)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-teal-100 dark:border-slate-800 shadow-2xs space-y-1 hover:border-teal-500 transition-all group">
            <span className="text-[11px] font-bold text-slate-500 block truncate">تم النشر الفعلي</span>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">{publishedCount}</p>
            <div className="w-full bg-teal-100 dark:bg-teal-950 h-1 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, (publishedCount / (allReqs.length || 1)) * 100)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-rose-100 dark:border-slate-800 shadow-2xs space-y-1 hover:border-rose-500 transition-all group">
            <span className="text-[11px] font-bold text-slate-500 block truncate">تجاوز SLA</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">{overdueSlaCount}</p>
            <div className="w-full bg-rose-100 dark:bg-rose-950 h-1 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (overdueSlaCount / (allReqs.length || 1)) * 100)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-blue-100 dark:border-slate-800 shadow-2xs space-y-1 hover:border-[#06266F] transition-all group">
            <span className="text-[11px] font-bold text-slate-500 block truncate">مبادرات معتمدة</span>
            <p className="text-2xl font-black text-[#06266F] dark:text-blue-400 group-hover:scale-105 transition-transform">{activeInitiativesCount || 0}</p>
            <div className="w-full bg-blue-100 dark:bg-blue-950 h-1 rounded-full overflow-hidden">
              <div className="bg-[#06266F] h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

        </div>
      </div>

      {/* Actionable Operational Queues with 100% Mobile Card Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        
        {/* 1. Urgent Requests Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>الطلبات العاجلة الأولوية</span>
            </h2>
            <span className="text-xs font-black text-rose-700 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-2.5 py-0.5 rounded-full">
              {urgentRequests.length} طلبات
            </span>
          </div>

          {urgentRequests.length === 0 ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">لا توجد طلبات عاجلة حالياً.</p>
              <p className="text-[11px] text-slate-400">جميع الطلبات العاجلة تمت معالجتها ونشرها.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#111C35] border-2 border-rose-400/80 dark:border-rose-800/80 hover:border-rose-500 shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-black text-rose-600 dark:text-rose-400">#{req.reference_number}</span>
                    <StatusBadge status={req.status as RequestStatus} />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                      {req.title}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                      المبادرة: {(req.initiative as any)?.name || 'مبادرة طلابية'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <SlaBadge state={(req.sla as any)?.state} />
                    <Link
                      href={`/dashboard/requests/${req.id}`}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <span>اتخاذ إجراء فوراً</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. SLA At Risk Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>مخاطر SLA والمهلة</span>
            </h2>
            <span className="text-xs font-black text-amber-700 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
              {atRiskRequests.length}
            </span>
          </div>

          {atRiskRequests.length === 0 ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">جميع الطلبات ضمن مهلة SLA المعتمدة.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#111C35] border border-amber-300 dark:border-amber-800/60 hover:border-amber-500 shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-500">#{req.reference_number}</span>
                    <SlaBadge state={(req.sla as any)?.state} />
                  </div>

                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {req.title}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-500 font-bold">{(req.initiative as any)?.name}</span>
                    <Link
                      href={`/dashboard/requests/${req.id}`}
                      className="px-3 py-1.5 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <span>معالجة</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Latest Submissions Queue (Full Mobile Card Support) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>أحدث الطلبات الواردة والنواحي</span>
            </h2>
            <Link href="/dashboard/requests" className="text-xs text-[#06266F] dark:text-blue-400 font-extrabold hover:underline">
              عرض الجدول الكامل ↗
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <ArabicEmptyState
              icon="inbox"
              title="لا توجد طلبات حتى الآن"
              description="لم تقدم المبادرات أي طلبات نشر إعلامي بعد."
            />
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-500">#{req.reference_number}</span>
                    <StatusBadge status={req.status as RequestStatus} />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {req.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {(req.initiative as any)?.name} • {(req.platform as any)?.name || 'المنصة'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatArabicRelativeTime(req.updated_at || req.created_at)}
                    </span>
                    <Link
                      href={`/dashboard/requests/${req.id}`}
                      className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-[#06266F] text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                    >
                      <span>مراجعة</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

