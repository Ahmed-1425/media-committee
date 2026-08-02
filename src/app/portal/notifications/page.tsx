import { createClient } from '@/lib/supabase/server';
import { ArabicEmptyState } from '@/components/common/ArabicEmptyState';
import { formatArabicRelativeTime } from '@/lib/utils';
import { Bell, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function InitiativeNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });

  async function markAllAsRead() {
    'use server';
    const client = await createClient();
    const { data: { user: currentUser } } = await client.auth.getUser();
    if (currentUser) {
      await client
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', currentUser.id);
      revalidatePath('/portal/notifications');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">التنبيهات والإشعارات</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل إشعارات تحديثات طلبات النشر الإعلامي والملاحظات
          </p>
        </div>

        {notifications && notifications.some((n) => !n.is_read) && (
          <form action={markAllAsRead}>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تحديد الكل كمقروء</span>
            </button>
          </form>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <ArabicEmptyState
          icon="bell"
          title="لا توجد إشعارات جديدة"
          description="ستظهر هنا كافة الإشعارات عند تغيير حالة طلبات النشر أو إضافة ملاحظات جديدة."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all ${
                notif.is_read
                  ? 'bg-white dark:bg-[#111C35] border-slate-200 dark:border-slate-800'
                  : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.body}
                  </p>
                  <span className="text-[11px] text-slate-400 block pt-1">
                    {formatArabicRelativeTime(notif.created_at)}
                  </span>
                </div>

                {notif.request_id && (
                  <Link
                    href={`/portal/requests/${notif.request_id}`}
                    className="shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#023793] dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>معاينة</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
