import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatArabicDate } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { RequestStatus } from '@/lib/types';

export default async function AdminGlobalCalendarPage() {
  const supabase = await createClient();

  const { data: globalScheduledRequests } = await supabase
    .from('requests')
    .select('*, initiative:initiatives(name), platform:platforms(name)')
    .not('requested_publish_at', 'is', null)
    .order('requested_publish_at', { ascending: true });

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">التقويم الإعلامي الشامل للنشر</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          عرض المواعيد المجدولة والمطلوبة للنشر عبر كافة المبادرات الطلابية لتفادي التضارب
        </p>
      </div>

      {!globalScheduledRequests || globalScheduledRequests.length === 0 ? (
        <ArabicEmptyState
          icon="calendar"
          title="لا توجد مواعيد نشر مجدولة في التقويم"
          description="لم يتم تسجيل أي مواعيد نشر مقترحة في الطلبات المقدمة من المبادرات بعد."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalScheduledRequests.map((req) => (
            <Link
              key={req.id}
              href={`/dashboard/requests/${req.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 hover:border-[#023793] dark:hover:border-blue-500 shadow-2xs transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#06266F] dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatArabicDate(req.requested_publish_at)}</span>
                </div>
                <StatusBadge status={req.status as RequestStatus} />
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#023793] dark:group-hover:text-blue-400 transition-colors">
                {req.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>المبادرة: {(req.initiative as any)?.name}</span>
                <span className="flex items-center gap-1 text-[#023793] dark:text-blue-400 font-medium">
                  معاينة <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
