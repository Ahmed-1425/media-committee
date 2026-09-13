'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resubmitRequest } from '@/actions/requests';
import { RefreshCw, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
interface ResubmitRequestFormProps {
  request: {
    id: string;
    title: string;
    caption: string;
    drive_link: string;
    platform_id: string;
    media_type_id: string;
    priority: string;
    current_version: number;
    requested_publish_at?: string | null;
  };
}

export function ResubmitRequestForm({ request }: ResubmitRequestFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; desc: string; type: 'success' | 'danger' } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);

    try {
      // Instant UI indicator
      setFeedback({
        title: 'تمت إعادة تقديم الطلب المعدل بنجاح! 🚀',
        desc: 'تم تسجيل الإصدار الجديد وسينتقل فوراً لمراجعة المشرف.',
        type: 'success',
      });

      const res = await resubmitRequest(formData, request.id);
      if (res && (res as any).error) {
        setFeedback({
          title: 'تعذر إعادة التقديم',
          desc: (res as any).error,
          type: 'danger',
        });
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setFeedback({
        title: 'خطأ أثناء الإرسال',
        desc: err?.message || 'تعذر التواصل مع السيرفر',
        type: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border-2 border-amber-400/60 dark:border-amber-700/60 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-base">
          <RefreshCw className="w-5 h-5 text-amber-600" />
          <span>إعادة تقديم الطلب بعد التعديل (إصدار جديد)</span>
        </div>
        {submitting && (
          <span className="flex items-center gap-2 text-xs text-amber-600 font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري التسليم...</span>
          </span>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <div>
            <p className="font-extrabold">{feedback.title}</p>
            <p className="text-[11px] opacity-90">{feedback.desc}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">تعديل عنوان الطلب</label>
          <input
            type="text"
            name="title"
            defaultValue={request.title}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold"
          />
        </div>

        <input type="hidden" name="platform_id" value={request.platform_id} />
        <input type="hidden" name="media_type_id" value={request.media_type_id} />
        <input type="hidden" name="priority" value={request.priority} />
        <input type="hidden" name="requested_publish_at" value={request.requested_publish_at || ''} />

        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">رابط قوقل درايف المعدل</label>
          <input
            type="url"
            name="drive_link"
            defaultValue={request.drive_link}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dir-ltr text-right font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">تعديل الكابشن</label>
          <textarea
            name="caption"
            rows={4}
            defaultValue={request.caption}
            required
            className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 leading-relaxed font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">توضيح التعديلات التي تمت (سبب إعادة التقديم)</label>
          <input
            type="text"
            name="resubmission_reason"
            placeholder="مثال: تم تعديل الألوان وإضافة الشعار في التصميم المرفق برابط درايف..."
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>إعادة إرسال الطلب للمراجعة (النسخة #{request.current_version + 1})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
