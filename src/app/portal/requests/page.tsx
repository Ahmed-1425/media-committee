import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatArabicDate, formatArabicShortDate } from '@/lib/utils';
import { PlusCircle, Search, Filter, ExternalLink, ChevronLeft } from 'lucide-react';
import { RequestStatus } from '@/lib/types';

interface PageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    priority?: string;
    page?: string;
  }>;
}

export default async function InitiativeRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query || '';
  const statusFilter = params.status || '';
  const priorityFilter = params.priority || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 10;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from('initiative_memberships')
    .select('initiative_id')
    .eq('profile_id', user.id)
    .maybeSingle();

  const initiativeId = membership?.initiative_id;

  if (!initiativeId) {
    return (
      <ArabicEmptyState
        icon="shield"
        title="لا توجد مبادرة مرتبطة"
        description="يرجى التواصل مع مسؤول النظام لربط هذا الحساب بمبادرة معتمدة."
      />
    );
  }

  // Build query for requests
  let dbQuery = supabase
    .from('requests')
    .select('*, platform:platforms(name), media_type:media_types(name)', { count: 'exact' })
    .eq('initiative_id', initiativeId)
    .order('created_at', { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  if (statusFilter) {
    dbQuery = dbQuery.eq('status', statusFilter);
  }

  if (priorityFilter) {
    dbQuery = dbQuery.eq('priority', priorityFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: requests, count } = await dbQuery.range(from, to);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header & New Request Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">قائمة طلبات النشر</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة ومتابعة كافة الطلبات المرسلة من قبل مبادرتكم
          </p>
        </div>

        <Link
          href="/portal/requests/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#06266F] hover:bg-[#023793] text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تقديم طلب جديد</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <form method="GET" className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="البحث بعنوان الطلب..."
            className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#06266F] focus:border-transparent transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>

        <div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-[#06266F] focus:border-transparent transition-all"
          >
            <option value="">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="submitted">مُقدَّم</option>
            <option value="under_review">قيد المراجعة</option>
            <option value="changes_requested">مطلوب تعديلات</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
            <option value="scheduled">مجدول للنشر</option>
            <option value="published">تم النشر</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية</span>
          </button>
          {(query || statusFilter || priorityFilter) && (
            <Link
              href="/portal/requests"
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-200"
            >
              إلغاء
            </Link>
          )}
        </div>
      </form>

      {/* Requests Table / Cards */}
      {!requests || requests.length === 0 ? (
        <ArabicEmptyState
          icon="inbox"
          title="لم يتم العثور على طلبات"
          description={
            query || statusFilter
              ? 'لا تظهر أي نتائج مطابقة لمعايير البحث والتصفية المحددة.'
              : 'لم تقم مبادرتكم بتقديم أي طلبات نشر إعلامي بعد.'
          }
          actionHref="/portal/requests/new"
          actionLabel="تقديم طلب جديد"
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block overflow-hidden rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">عنوان الطلب</th>
                  <th className="p-4">المنصة ونوع المحتوى</th>
                  <th className="p-4">الأولوية</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">تاريخ التقديم</th>
                  <th className="p-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                      #{req.reference_number}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {req.title}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {(req.platform as any)?.name || '-'} ({(req.media_type as any)?.name || '-'})
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {req.priority === 'urgent' ? 'عاجل' : 'عادي'}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={req.status as RequestStatus} />
                    </td>
                    <td className="p-4 text-slate-500">
                      {formatArabicShortDate(req.submitted_at || req.created_at)}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/portal/requests/${req.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#023793] dark:text-blue-400 hover:underline"
                      >
                        <span>التفاصيل</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards Transformation */}
          <div className="md:hidden space-y-3">
            {requests.map((req) => (
              <Link
                key={req.id}
                href={`/portal/requests/${req.id}`}
                className="block p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">#{req.reference_number}</span>
                  <StatusBadge status={req.status as RequestStatus} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{req.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{(req.platform as any)?.name}</span>
                  <span>{formatArabicShortDate(req.submitted_at || req.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <Link
                    key={p}
                    href={`/portal/requests?page=${p}&query=${query}&status=${statusFilter}`}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      p === page
                        ? 'bg-[#06266F] text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
