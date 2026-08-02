import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { BarChart3, TrendingUp, PieChart, CheckCircle2, Clock } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [{ data: requests }, { data: platforms }] = await Promise.all([
    supabase
      .from('requests')
      .select('id, status, priority, created_at, platform:platforms(name)'),
    supabase.from('platforms').select('id, name'),
  ]);

  const reqList = requests || [];
  const hasEnoughData = reqList.length >= 3;

  const statusBreakdown: Record<string, number> = {};
  reqList.forEach((r) => {
    statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
  });

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">التقارير الإحصائية وتحليلات الأداء</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          مؤشرات حقيقية مستخرجة مباشرة من قاعدة بيانات النظام دون أرقام افتراضية
        </p>
      </div>

      {!hasEnoughData ? (
        <ArabicEmptyState
          icon="shield"
          title="لا توجد بيانات كافية لعرض المؤشرات التفصيلية"
          description="يتطلب عرض الرسوم البيانية والتحليلات المتقدمة تسجيل 3 طلبات نشر على الأقل في النظام."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Status Breakdown Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <PieChart className="w-4 h-4 text-[#06266F] dark:text-blue-400" />
              <span>توزيع الطلبات حسب الحالة التشغيلية</span>
            </h2>

            <div className="space-y-3 text-xs">
              {Object.entries(statusBreakdown).map(([status, count]) => {
                const percentage = Math.round((count / reqList.length) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span>الحالة: ({status})</span>
                      <span>{count} طلب ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-[#06266F] dark:bg-blue-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Meta Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>معدلات إنجاز الطلبات</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300">إجمالي الطلبات المستلمة:</span>
                <span className="font-black text-lg text-emerald-700 dark:text-emerald-400">{reqList.length}</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <span className="font-semibold text-blue-900 dark:text-blue-300">نسبة الإنجاز المباشر:</span>
                <span className="font-black text-lg text-blue-700 dark:text-blue-400">
                  {Math.round(((statusBreakdown.published || 0) / reqList.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
