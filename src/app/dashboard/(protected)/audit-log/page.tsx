import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { formatArabicDate } from '@/lib/utils';
import { exportAuditLogCsv } from '@/actions/export';
import { History, Download, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminAuditLogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const pageSize = 20;

  const supabase = await createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: logs, count } = await supabase
    .from('audit_logs')
    .select('*, actor:profiles(full_name, email, role)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">سجل التدقيق الأمني للعمليات (Audit Log)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل غير قابل للتعديل يوثق كافة الإجراءات والتحويلات الأمنية والتراخيص داخل المنصة
          </p>
        </div>
      </div>

      {!logs || logs.length === 0 ? (
        <ArabicEmptyState
          icon="shield"
          title="سجل التدقيق فارغ"
          description="لم يتم تسجل أي أحداث أمنية بعد في السجل."
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-4">التاريخ والوقت</th>
                  <th className="p-4">المستخدِم (المنفذ)</th>
                  <th className="p-4">نوع الإجراء</th>
                  <th className="p-4">نوع الكيان</th>
                  <th className="p-4">معرف الكيان</th>
                  <th className="p-4">تفاصيل التغيير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 text-slate-500 font-mono">
                      {formatArabicDate(log.created_at)}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {(log.actor as any)?.full_name || 'النظام (System)'}
                    </td>
                    <td className="p-4 font-semibold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {log.entity_type}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                      {log.entity_id}
                    </td>
                    <td className="p-4 text-[11px] text-slate-500 max-w-xs truncate">
                      {log.new_data ? JSON.stringify(log.new_data) : '-'}
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
                    href={`/dashboard/audit-log?page=${p}`}
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
