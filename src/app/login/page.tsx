'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loginInitiative } from '@/actions/auth';
import { PublicHeader } from '@/components/common/Header';
import { PublicFooter } from '@/components/common/Footer';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function InitiativeLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginInitiative(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0A1224] text-slate-900 dark:text-white">
      <PublicHeader title="بوابة المبادرات الطلابية" />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#111C35] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#06266F]/10 dark:bg-blue-500/10 text-[#06266F] dark:text-blue-400 mx-auto flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">تسجيل الدخول للمبادرات</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أدخل بيانات الحساب المعتمد للمبادرة للوصول للطلبات
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                البريد الإلكتروني للمبادرة
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="initiative@domain.com"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#06266F] focus:border-transparent transition-all dir-ltr text-right"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  كلمة المرور
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#023793] dark:text-blue-400 hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#06266F] focus:border-transparent transition-all dir-ltr text-right"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
