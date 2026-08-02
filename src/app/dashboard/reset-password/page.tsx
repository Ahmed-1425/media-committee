'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updatePassword } from '@/actions/auth';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { PartnershipLogo, TechnicalCommitteeLogo } from '@/components/common/BrandLogos';

export default function AdminResetPasswordPage() {
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
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#06266F] via-[#023793] to-[#0A1224] text-white p-4">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <PartnershipLogo size={44} />
        <TechnicalCommitteeLogo size={40} />
      </div>

      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">تحديث كلمة مرور الإدارة</h2>
          <p className="text-xs text-blue-200">
            أدخل كلمة المرور الجديدة المعززة لحساب المشرف
          </p>
        </div>

        {status?.error && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{status.error}</span>
          </div>
        )}

        {status?.success && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs flex flex-col items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-center">{status.success}</span>
            <Link
              href="/dashboard/login"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md"
            >
              الانتقال لتسجيل الدخول للوحة التحكم
            </Link>
          </div>
        )}

        {!status?.success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-blue-100">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="8 خانات على الأقل"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-blue-300/50 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all dir-ltr text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-blue-100">
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="تأكيد كلمة المرور"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-blue-300/50 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all dir-ltr text-right"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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

      <div className="text-center text-xs text-blue-200/60 py-4">
        برنامج الشراكة الطلابية | اللجنة التقنية v1.0.0
      </div>
    </div>
  );
}
