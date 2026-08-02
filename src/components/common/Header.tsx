'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PartnershipLogo, MediaCommitteeLogo } from './BrandLogos';
import { LogIn, ShieldCheck, Menu, X } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export function PublicHeader({ title = 'المنصة التنظيمية للجنة الإعلامية' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#041B52]/95 via-[#06266F]/95 to-[#023793]/95 backdrop-blur-2xl border-b border-blue-400/20 shadow-2xl text-white transition-all">
      {/* Top glowing ambient line */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400/80 via-blue-400/90 to-amber-400/80"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* RTL Right: Student Partnership Program Logo (Enlarged) */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <PartnershipLogo size={64} className="hidden sm:block" />
            <PartnershipLogo size={50} className="sm:hidden" />
          </Link>
        </div>

        {/* Center: Executive Dynamic Branding Title */}
        <div className="text-center hidden lg:block space-y-0.5">
          <h1 className="text-lg xl:text-xl font-black tracking-tight text-white drop-shadow-md">
            {title}
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 border border-white/15 text-xs text-blue-200 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>برنامج الشراكة الطلابية - اللجنة التقنية</span>
          </div>
        </div>

        {/* RTL Left: Media Committee Logo & Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="hidden sm:block border-r border-white/20 pr-4">
            <MediaCommitteeLogo size={60} />
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white lg:hidden transition-colors"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#06266F]/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <MediaCommitteeLogo size={48} />
            <div className="text-right">
              <p className="font-bold text-sm text-white">{title}</p>
              <p className="text-xs text-blue-200">برنامج الشراكة الطلابية</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/15 text-sm font-bold text-white flex items-center justify-between border border-white/10"
            >
              <span>الرئيسية</span>
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-bold flex items-center justify-between border border-amber-500/30"
            >
              <span>دخول المبادرات الطلابية</span>
              <LogIn className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl bg-blue-500/20 text-blue-200 text-sm font-bold flex items-center justify-between border border-blue-400/30"
            >
              <span>لوحة تحكم الإدارة</span>
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

