'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updatePassword } from '@/actions/auth';
import { PublicHeader } from '@/components/common/Header';
import { PublicFooter } from '@/components/common/Footer';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updatePassword(formData);
    setStatus(res);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0A1224] text-slate-900 dark:text-white">
      <PublicHeader title="تحديث كلمة المرور" />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#111C35] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#06266F] dark:text-blue-400 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">تعيين كلمة مرور جديدة</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أدخل كلمة المرور الجديدة المعززة لحماية حسابك
            </p>
          </div>

          {status?.error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          {status?.success && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{status.success}</span>
              </div>
              <Link
                href="/login"
                className="block text-center mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs"
              >
                التوجه لتسجيل الدخول الان
              </Link>
            </div>
          )}

          {!status?.success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="8 خانات على الأقل"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#06266F] focus:border-transparent transition-all dir-ltr text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="تأكيد كلمة المرور"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#06266F] focus:border-transparent transition-all dir-ltr text-right"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>حفظ كلمة المرور الجديدة</span>
                )}
              </button>
            </form>
          )}

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
