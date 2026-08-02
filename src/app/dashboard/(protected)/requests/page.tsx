import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { formatArabicDate, formatArabicShortDate } from '@/lib/utils';
import { exportRequestsCsv } from '@/actions/export';
import { Search, Filter, Download, ChevronLeft, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { RequestStatus } from '@/lib/types';

interface PageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    initiative_id?: string;
    priority?: string;
    page?: string;
  }>;
}

export default async function AdminRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query || '';
  const statusFilter = params.status || '';
  const initiativeFilter = params.initiative_id || '';
  const priorityFilter = params.priority || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 15;

  const supabase = await createClient();

  // Fetch Initiatives & Platforms for filters
  const [{ data: initiatives }, { data: platforms }] = await Promise.all([
    supabase.from('initiatives').select('id, name').order('name'),
    supabase.from('platforms').select('id, name').order('sort_order'),
  ]);

  // Build Query
  let dbQuery = supabase
    .from('requests')
    .select(
      '*, initiative:initiatives(name), platform:platforms(name), media_type:media_types(name), sla:request_sla(*)',
      { count: 'exact' }
    )
    .order('updated_at', { ascending: false, nullsFirst: false });

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }
  if (statusFilter) {
    dbQuery = dbQuery.eq('status', statusFilter);
  }
  if (initiativeFilter) {
    dbQuery = dbQuery.eq('initiative_id', initiativeFilter);
  }
  if (priorityFilter) {
    dbQuery = dbQuery.eq('priority', priorityFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: requests, count } = await dbQuery.range(from, to);

  const totalPages = Math.ceil((count || 0) / pageSize);

  async function handleExportCsv() {
    'use server';
    return await exportRequestsCsv();
  }

  return (
    <div className="space-y-6">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إدارة طلبات النشر الإعلامي</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدول العمليات الشامل لمراجعة واعتماد وجدولة كافة الطلبات المرسلة من المبادرات
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <form method="GET" className="p-4 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="البحث بعنوان الطلب..."
            className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-[#06266F]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
        </div>

        <div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
          >
            <option value="">جميع الحالات</option>
            <option value="submitted">مُقدَّم جديد</option>
            <option value="under_review">قيد المراجعة</option>
            <option value="changes_requested">مطلوب تعديل</option>
            <option value="approved">مقبول</option>
            <option value="scheduled">مجدول</option>
            <option value="published">منشور</option>
            <option value="rejected">مرفوض</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>

        <div>
          <select
            name="initiative_id"
            defaultValue={initiativeFilter}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
          >
            <option value="">جميع المبادرات</option>
            {initiatives?.map((ini) => (
              <option key={ini.id} value={ini.id}>
                {ini.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>تطبيق الفلترة</span>
          </button>
          {(query || statusFilter || initiativeFilter) && (
            <Link
              href="/dashboard/requests"
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
            >
              إلغاء
            </Link>
          )}
        </div>
      </form>

      {/* Requests Container: Mobile Touch Cards (md:hidden) & Desktop Table (hidden md:block) */}
      {!requests || requests.length === 0 ? (
        <ArabicEmptyState
          icon="inbox"
          title="لا توجد طلبات مطابقة"
          description="لم يتم العثور على أي طلبات نشر تفي بمعايير البحث والتصفية المحددة."
        />
      ) : (
        <div className="space-y-6">
          
          {/* 1. Mobile Cards Layout (md:hidden) */}
          <div className="md:hidden space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[#06266F] dark:text-blue-400">
                    #{req.reference_number}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {req.priority === 'urgent' ? 'عاجل' : 'عادي'}
                    </span>
                    <StatusBadge status={req.status as RequestStatus} />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                    {req.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {(req.initiative as any)?.name || 'مبادرة'}
                    </span>
                    <span>•</span>
                    <span>{(req.platform as any)?.name || 'المنصة'}</span>
                    <span>•</span>
                    <span>{(req.media_type as any)?.name || 'محتوى'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <SlaBadge state={(req.sla as any)?.state} />
                  <span className="text-[11px] text-slate-400">
                    {formatArabicShortDate(req.submitted_at || req.created_at)}
                  </span>
                </div>

                <Link
                  href={`/dashboard/requests/${req.id}`}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#041B52] to-[#06266F] hover:from-[#06266F] hover:to-[#023793] text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>مراجعة الطلب واتخاذ إجراء</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* 2. Desktop Table Layout (hidden md:block) */}
          <div className="hidden md:block overflow-hidden rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-md">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-extrabold">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">عنوان الطلب</th>
                  <th className="p-4">المبادرة</th>
                  <th className="p-4">المنصة ونوع المحتوى</th>
                  <th className="p-4">الأولوية</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">حالة SLA</th>
                  <th className="p-4">تاريخ التقديم</th>
                  <th className="p-4">مساحة المراجعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono font-black text-[#06266F] dark:text-blue-400">
                      #{req.reference_number}
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-white max-w-xs truncate">
                      {req.title}
                    </td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      {(req.initiative as any)?.name || '-'}
                    </td>
                    <td className="p-4 text-slate-500 font-bold">
                      {(req.platform as any)?.name} ({(req.media_type as any)?.name})
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${req.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {req.priority === 'urgent' ? 'عاجل' : 'عادي'}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={req.status as RequestStatus} />
                    </td>
                    <td className="p-4">
                      <SlaBadge state={(req.sla as any)?.state} />
                    </td>
                    <td className="p-4 text-slate-500 font-bold">
                      {formatArabicShortDate(req.submitted_at || req.created_at)}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/dashboard/requests/${req.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06266F] hover:bg-[#023793] text-white font-extrabold rounded-xl transition-all shadow-2xs"
                      >
                        <span>مراجعة</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <Link
                    key={p}
                    href={`/dashboard/requests?page=${p}&query=${query}&status=${statusFilter}`}
                    className={`w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                      p === page
                        ? 'bg-[#06266F] text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
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
