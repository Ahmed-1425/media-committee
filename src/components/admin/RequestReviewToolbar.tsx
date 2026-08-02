'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { changeRequestStatus } from '@/actions/requests';
import { RequestStatus } from '@/lib/types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Archive,
  RotateCcw,
  PlayCircle,
  Loader2,
} from 'lucide-react';

interface RequestReviewToolbarProps {
  requestId: string;
  currentStatus: RequestStatus;
}

export function RequestReviewToolbar({ requestId, currentStatus: initialStatus }: RequestReviewToolbarProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatus>(initialStatus);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ title: string; desc: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

  const [rejectReason, setRejectReason] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);

  async function handleAction(toStatus: RequestStatus, reason?: string) {
    setLoadingAction(toStatus);
    setFeedback(null);

    // 1. Optimistic instant state update (0ms delay)
    setStatus(toStatus);

    let title = 'تم تحديث حالة الطلب بنجاح!';
    let desc = `تغيرت حالة الطلب إلى (${toStatus})`;
    let type: 'success' | 'danger' | 'warning' | 'info' = 'success';

    if (toStatus === 'approved') {
      title = 'تم قبول واكتمال مراجعة الطلب بنجاح! 🎉';
      desc = 'تم إشعار ممثلي المبادرة بقبول الطلب واعتماده للنشر.';
    } else if (toStatus === 'rejected') {
      title = 'تم رفض الطلب بنجاح! ❌';
      desc = 'تم توثيق سبب الرفض في سجل العمليات وإشعار المبادرة.';
      type = 'danger';
    } else if (toStatus === 'changes_requested') {
      title = 'تم إرسال طلب التعديلات إلى المبادرة بنجاح! ⚠️';
      desc = 'تم تبليغ ممثل المبادرة بالملاحظات والتعديلات المطلوبة.';
      type = 'warning';
    } else if (toStatus === 'under_review') {
      title = 'تم بدء مراجعة الطلب بنجاح! ⏳';
      desc = 'تغيرت حالة الطلب إلى (قيد المراجعة).';
      type = 'info';
    } else if (toStatus === 'scheduled') {
      title = 'تمت جدولة الطلب بنجاح! 📅';
      desc = 'تم اعتماد موعد النشر بالتقويم الإعلامي.';
    } else if (toStatus === 'published') {
      title = 'تم توثيق النشر الفعلي بنجاح! 🚀';
      desc = 'اكتملت جميع مراحل حوكمة الطلب بنجاح.';
    } else if (toStatus === 'archived') {
      title = 'تمت أرشفة الطلب بنجاح! 📦';
      desc = 'تم نقل الطلب لسجل الأرشيف.';
    } else if (toStatus === 'submitted') {
      title = 'تمت استعادة الطلب بنجاح! 🔄';
      desc = 'أعيد الطلب لقائمة الطلبات النشطة.';
    }

    setFeedback({ title, desc, type });

    try {
      const res = await changeRequestStatus(requestId, toStatus, reason);
      if (res && res.error) {
        setFeedback({ title: 'تعذر تنفيذ الإجراء', desc: res.error, type: 'danger' });
        setStatus(initialStatus);
      } else {
        setShowRejectForm(false);
        setShowChangeForm(false);
        router.refresh();
      }
    } catch (err: any) {
      setFeedback({ title: 'خطأ في الاتصال', desc: err?.message || 'تعذر التواصل مع السيرفر', type: 'danger' });
      setStatus(initialStatus);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Instant Feedback Alert Banner (0ms delay) */}
      {feedback && (
        <div
          className={`p-5 rounded-2xl border shadow-lg flex items-center justify-between gap-4 font-bold text-xs sm:text-sm animate-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
              : feedback.type === 'danger'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200'
              : feedback.type === 'warning'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200'
              : 'bg-blue-500/15 border-blue-500/40 text-blue-900 dark:text-blue-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'danger' ? (
              <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            )}
            <div>
              <p className="font-extrabold text-sm sm:text-base">{feedback.title}</p>
              <p className="text-xs font-semibold opacity-90">{feedback.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Control Action Toolbar Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#041B52] via-[#06266F] to-[#023793] text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-blue-200">إجراءات المراجعة واعتماد الحالة:</h2>
          {loadingAction && (
            <span className="flex items-center gap-2 text-xs text-amber-300 font-bold animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري الحفظ والتطبيق...</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Start Review */}
          {status === 'submitted' && (
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={() => handleAction('under_review')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              <span>بدء مراجعة الطلب الآن</span>
            </button>
          )}

          {/* Approve */}
          {(status === 'submitted' || status === 'under_review') && (
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={() => handleAction('approved')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>قبول واعتمد الطلب</span>
            </button>
          )}

          {/* Schedule */}
          {status === 'approved' && (
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={() => handleAction('scheduled')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              <span>اعتماد جدولة النشر</span>
            </button>
          )}

          {/* Mark Published */}
          {status === 'scheduled' && (
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={() => handleAction('published')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>توثيق النشر الفعلي</span>
            </button>
          )}

          {/* Toggle Request Changes Form */}
          {(status === 'submitted' || status === 'under_review') && (
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={() => {
                setShowChangeForm(!showChangeForm);
                setShowRejectForm(false);
              }}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>طلب تعديلات من المبادرة</span>
            </button>
          )}

          {/* Toggle Reject Form */}
          {(status === 'submitted' || status === 'under_review') && (
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={() => {
                setShowRejectForm(!showRejectForm);
                setShowChangeForm(false);
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>رفض الطلب</span>
            </button>
          )}

          {/* Archive */}
          {status !== 'archived' && (
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={() => handleAction('archived')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              <span>أرشفة</span>
            </button>
          )}

          {/* Restore */}
          {status === 'archived' && (
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={() => handleAction('submitted')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة من الأرشيف</span>
            </button>
          )}
        </div>

        {/* Expandable Request Changes Form */}
        {showChangeForm && (
          <div className="p-4 rounded-2xl bg-white/10 border border-amber-400/40 space-y-3 pt-4 animate-in fade-in-50">
            <div className="flex items-center gap-2 font-bold text-orange-300 text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>تحديد الملاحظات والتعديلات المطلوبة (إجباري):</span>
            </div>
            <textarea
              rows={3}
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="اكتب التعديلات المطلوبة بوضوح باللغة العربية..."
              className="w-full p-3 rounded-xl bg-slate-900/80 border border-white/20 text-white text-xs placeholder-blue-200/50 focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowChangeForm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!changeReason.trim() || !!loadingAction}
                onClick={() => handleAction('changes_requested', changeReason)}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                تأكيد وإرسال طلب التعديل للمبادرة
              </button>
            </div>
          </div>
        )}

        {/* Expandable Reject Form */}
        {showRejectForm && (
          <div className="p-4 rounded-2xl bg-white/10 border border-rose-400/40 space-y-3 pt-4 animate-in fade-in-50">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
              <XCircle className="w-4 h-4" />
              <span>سبب رفض الطلب (إجباري):</span>
            </div>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض بالتفصيل..."
              className="w-full p-3 rounded-xl bg-slate-900/80 border border-white/20 text-white text-xs placeholder-blue-200/50 focus:ring-2 focus:ring-rose-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || !!loadingAction}
                onClick={() => handleAction('rejected', rejectReason)}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                تأكيد رفض الطلب نهائياً
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
