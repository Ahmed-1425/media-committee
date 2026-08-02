'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PartnershipLogo, TechnicalCommitteeLogo } from '@/components/common/BrandLogos';
import { logoutAdmin } from '@/actions/auth';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Calendar,
  Building2,
  Users,
  Bell,
  BarChart3,
  History,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: number | null;
}

interface MobileHeaderProps {
  userEmail?: string;
  userName?: string;
  unreadCount?: number | null;
}

export function DashboardMobileHeader({ userEmail, userName, unreadCount }: MobileHeaderProps) {
  const [open, setOpen] = useState(false);

  const adminNavItems: NavItem[] = [
    { href: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/dashboard/requests', label: 'طلبات النشر', icon: FileSpreadsheet },
    { href: '/dashboard/calendar', label: 'التقويم العام', icon: Calendar },
    { href: '/dashboard/initiatives', label: 'إدارة المبادرات', icon: Building2 },
    { href: '/dashboard/users', label: 'إدارة الحسابات', icon: Users },
    { href: '/dashboard/analytics', label: 'التقارير والأداء', icon: BarChart3 },
    { href: '/dashboard/notifications', label: 'التنبيهات', icon: Bell, badge: unreadCount },
    { href: '/dashboard/audit-log', label: 'سجل التدقيق', icon: History },
    { href: '/dashboard/settings', label: 'الإعدادات و SLA', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-gradient-to-r from-[#041B52] via-[#06266F] to-[#023793] text-white px-4 py-3 flex items-center justify-between shadow-xl border-b border-blue-400/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm text-white">لوحة تحكم الإدارة</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PartnershipLogo size={34} />
        </div>
      </header>

      {/* Mobile Backdrop & Slide-out Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Dark Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-4/5 max-w-xs bg-gradient-to-b from-[#041B52] via-[#06266F] to-[#023793] text-white flex flex-col justify-between p-4 shadow-2xl z-10 border-l border-blue-400/20 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <PartnershipLogo size={42} />
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                <p className="font-extrabold text-xs text-amber-300">مسؤول النظام (Super Admin)</p>
                <p className="text-xs font-bold text-white truncate">{userName || 'مدير المنصة'}</p>
                <p className="text-[11px] text-blue-200 truncate">{userEmail}</p>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-extrabold hover:bg-white/15 text-blue-100 hover:text-white transition-all bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-amber-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

            </div>

            {/* Bottom Signout & Branding */}
            <div className="space-y-3 pt-4 mt-6 border-t border-white/15">
              <div className="flex items-center justify-between">
                <TechnicalCommitteeLogo size={40} />
                <span className="text-[10px] font-mono bg-white/10 border border-white/15 px-2 py-0.5 rounded text-amber-300 font-bold">
                  v1.2.0
                </span>
              </div>

              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="w-full py-3 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 border border-rose-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
