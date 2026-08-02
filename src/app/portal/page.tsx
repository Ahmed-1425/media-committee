import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatArabicRelativeTime, formatArabicShortDate } from '@/lib/utils';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ShieldAlert,
  Sparkles,
  Building2,
  HelpCircle,
  RefreshCw,
  Send,
} from 'lucide-react';
import { RequestStatus } from '@/lib/types';

export default async function InitiativeHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get Profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  // Get Initiative Membership
  const { data: membership } = await supabase
    .from('initiative_memberships')
    .select('initiative_id, initiative:initiatives(name, description, contact_email)')
    .eq('profile_id', user.id)
    .maybeSingle();

  const initiativeId = membership?.initiative_id;
  const initiativeName = (membership?.initiative as any)?.name || null;

  // If account is not linked to any initiative yet
  if (!initiativeId) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        
        {/* Unlinked Executive Banner Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#06266F] via-[#023793] to-[#041B52] text-white p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>حساب معلّق الانتظار</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                أهلاً بك {profile?.full_name || 'ممثل المبادرة'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl">
                تم تسجيل حسابك بنجاح في المنصة التنظيمية للجنة الإعلامية، ولكي تتمكن من تقديم ومتابعة طلبات النشر الإعلامي، يتوجب ربط بريدك بالمبادرة الطلابية التابع لها.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Building2 className="w-8 h-8 text-blue-300" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs text-blue-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>البريد المسجل حالياً:</span>
              <span className="font-mono bg-white/15 px-2.5 py-0.5 rounded text-amber-200">{profile?.email}</span>
            </div>
          </div>
        </div>

        {/* Action Steps Card */}
        <div className="bg-white dark:bg-[#111C35] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#06266F] dark:text-blue-400" />
            <span>كيف يتم تفعيل حساب المبادرة؟</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#06266F] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">تواصل مع المشرف</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                تواصل مع مسؤول النظام أو رئيس اللجنة الإعلامية ببرنامج الشراكة الطلابية.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#06266F] text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">تزويد الإدارة بالبريد</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                زوّد الإدارة ببريدك المسجل لتقوم بربطه بالمبادرة المعتمدة (طويق، وفود، متنفس، تقانة...).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#06266F] text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">بدء استخدام المنصة</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                بمجرد اعتماد الربط من لوحة تحكم الإدارة، ستتمكن فوراً من تقديم وتتبع كافة الطلبات.
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إذا كنت قد تواصلت مع الإدارة وتم الربط، يرجى الضغط على زر التحديث.
            </p>

            <Link
              href="/portal"
              className="w-full sm:w-auto px-6 py-3 bg-[#06266F] hover:bg-[#023793] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تحديث حالة الحساب</span>
            </Link>
          </div>
        </div>

      </div>
    );
  }

  // Fetch real requests strictly for this initiative
  const { data: requests } = await supabase
    .from('requests')
    .select('id, title, status, priority, created_at, requested_publish_at, platform:platforms(name)')
    .eq('initiative_id', initiativeId)
    .order('created_at', { ascending: false });

  const allRequests = requests || [];
  const draftsCount = allRequests.filter((r) => r.status === 'draft').length;
  const inReviewCount = allRequests.filter((r) => r.status === 'submitted' || r.status === 'under_review').length;
  const actionRequiredCount = allRequests.filter((r) => r.status === 'changes_requested' || r.status === 'rejected').length;
  const approvedScheduledCount = allRequests.filter((r) => r.status === 'approved' || r.status === 'scheduled' || r.status === 'published').length;

  const latestRequests = allRequests.slice(0, 5);
  const upcomingPublications = allRequests.filter((r) => r.requested_publish_at && new Date(r.requested_publish_at) >= new Date()).slice(0, 3);

  return (
    <div className="space-y-8">
      
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#06266F] via-[#023793] to-[#041B52] text-white p-6 sm:p-8 shadow-2xl border border-blue-400/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-3 text-center md:text-right">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black border border-white/15 backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>بوابة المبادرات الطلابية المعتمدة</span>
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {initiativeName}
            </h1>
            
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              مرحباً بكم! يمكنكم الآن إرسال طلبات النشر الإعلامي، تتبع مسار المراجعة والاعتماد، والاطلاع على الجدول الزمني للنشر بكل يسر وشفافية.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/portal/requests/new"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              <span>تقديم طلب نشر جديد</span>
            </Link>
          </div>

        </div>

        {/* Ambient Overlay Design */}
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-[#06266F] transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">المسودات</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {draftsCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold">قيد المراجعة</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#06266F] dark:text-blue-300">
            {inReviewCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold">تتطلب إجراءً</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {actionRequiredCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold">مقبول ومجدول / منشور</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {approvedScheduledCount}
          </p>
        </div>

      </div>

      {/* Activity Grid & Empty States */}
      {allRequests.length === 0 ? (
        <ArabicEmptyState
          icon="inbox"
          title="لا توجد طلبات نشر حتى الآن"
          description="لم تقم مبادرتكم بتقديم أي طلبات نشر إعلامي بعد. يمكنك البدء الآن بتقديم أول طلب نشر وسيتم مراجعته واكتكمال كافة الإجراءات برمجياً."
          actionHref="/portal/requests/new"
          actionLabel="تقديم طلب جديد الآن"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Latest Real Requests List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">أحدث طلبات النشر</h2>
              <Link href="/portal/requests" className="text-xs font-bold text-[#023793] dark:text-blue-400 flex items-center gap-1 hover:underline">
                <span>عرض جميع الطلبات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {latestRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/portal/requests/${req.id}`}
                  className="block p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 hover:border-[#023793] dark:hover:border-blue-500 shadow-2xs transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#023793] dark:group-hover:text-blue-400 transition-colors">
                        {req.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>المنصة: {(req.platform as any)?.name || 'غير محددة'}</span>
                        <span>•</span>
                        <span>{formatArabicRelativeTime(req.created_at)}</span>
                      </div>
                    </div>
                    <StatusBadge status={req.status as RequestStatus} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Real Publication Dates */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">مواعيد النشر القادمة</h2>
            {upcomingPublications.length === 0 ? (
              <div className="p-6 bg-white dark:bg-[#111C35] rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">لا توجد مواعيد نشر مجدولة حالياً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPublications.map((pub) => (
                  <div key={pub.id} className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#06266F] dark:text-blue-400">
                      <span>{formatArabicShortDate(pub.requested_publish_at)}</span>
                      <StatusBadge status={pub.status as RequestStatus} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{pub.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
