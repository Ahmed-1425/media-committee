'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addComment } from '@/actions/requests';
import { MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { formatArabicRelativeTime } from '@/lib/utils';

interface CommentItem {
  id: string;
  body: string;
  created_at: string;
  author?: {
    full_name?: string;
    role?: string;
  } | null;
}

interface AddCommentSectionProps {
  requestId: string;
  initialComments: CommentItem[];
  currentUserFullName?: string;
  currentUserRole?: string;
}

export function AddCommentSection({
  requestId,
  initialComments,
  currentUserFullName = 'مستخدم',
  currentUserRole,
}: AddCommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    const newCommentText = body.trim();
    setBody('');
    setSubmitting(true);
    setShowFeedback(true);

    // 1. Optimistic Update (0ms delay)
    const optimisticComment: CommentItem = {
      id: 'opt-' + Date.now(),
      body: newCommentText,
      created_at: new Date().toISOString(),
      author: {
        full_name: currentUserFullName,
        role: currentUserRole,
      },
    };

    setComments((prev) => [...prev, optimisticComment]);

    try {
      await addComment(requestId, newCommentText);
      router.refresh();
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmitting(false);
      setTimeout(() => setShowFeedback(false), 5000);
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
          <MessageSquare className="w-5 h-5 text-[#06266F] dark:text-blue-400" />
          <span>المناقشات والتعليقات ({comments.length})</span>
        </div>
        {submitting && (
          <span className="flex items-center gap-1.5 text-xs text-blue-600 font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري الإرسال...</span>
          </span>
        )}
      </div>

      {showFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>تم إرسال التعليق والتغذية الراجعة بنجاح! 💬</span>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">لا توجد تعليقات حتى الآن.</p>
        ) : (
          comments.map((cmt) => (
            <div
              key={cmt.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#06266F] dark:text-blue-300">
                  {cmt.author?.full_name || 'مستخدم'}
                  {cmt.author?.role === 'super_admin' && (
                    <span className="mr-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px]">
                      مشرف
                    </span>
                  )}
                </span>
                <span className="text-slate-400 text-[11px]">{formatArabicRelativeTime(cmt.created_at)}</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {cmt.body}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          placeholder="اكتب تعليقاً أو استفساراً حوّل هذا الطلب..."
          className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#06266F] transition-all leading-relaxed"
        />
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="px-6 py-3 bg-[#06266F] hover:bg-[#023793] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>إرسال التعليق فوراً</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
