import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logoutAdmin } from '@/actions/auth';
import { PartnershipLogo, TechnicalCommitteeLogo } from '@/components/common/BrandLogos';
import { PublicFooter } from '@/components/common/Footer';
import { DashboardMobileHeader } from '@/components/admin/DashboardMobileHeader';
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
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/dashboard/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, email')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'super_admin') redirect('/portal');

  // Count unread admin notifications
  const { count: unreadAdminNotifs } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false);

  const adminNavItems = [
    { href: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/dashboard/requests', label: 'طلبات النشر', icon: FileSpreadsheet },
    { href: '/dashboard/calendar', label: 'التقويم العام', icon: Calendar },
    { href: '/dashboard/initiatives', label: 'إدارة المبادرات', icon: Building2 },
    { href: '/dashboard/users', label: 'إدارة الحسابات', icon: Users },
    { href: '/dashboard/analytics', label: 'التقارير والأداء', icon: BarChart3 },
    { href: '/dashboard/notifications', label: 'التنبيهات', icon: Bell, badge: unreadAdminNotifs },
    { href: '/dashboard/audit-log', label: 'سجل التدقيق', icon: History },
    { href: '/dashboard/settings', label: 'الإعدادات و SLA', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 dark:bg-[#0A1224] text-slate-900 dark:text-white dir-rtl">
      
      {/* Sidebar (RTL Right side for Desktop) */}
      <aside className="w-72 bg-gradient-to-b from-[#041B52] via-[#06266F] to-[#023793] text-white shrink-0 hidden md:flex flex-col justify-between p-5 shadow-2xl border-l border-blue-400/20 z-30">
        <div className="space-y-6">
          
          {/* Top Admin Branding */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 shadow-inner space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <PartnershipLogo size={46} />
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="pt-2 border-t border-white/15 text-xs">
              <p className="font-black text-white text-sm">لوحة تحكم الإدارة العليا</p>
              <p className="text-xs text-amber-300 font-extrabold truncate mt-0.5">{profile?.full_name || 'مسؤول النظام'}</p>
              <p className="text-[10px] text-blue-200 truncate">{profile?.email}</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black transition-all group border border-transparent hover:border-white/20 hover:bg-white/15 text-blue-100 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-sm">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Footer Technical branding & Signout */}
        <div className="space-y-4 pt-4 border-t border-white/15 text-xs text-blue-200">
          <div className="flex items-center justify-between">
            <TechnicalCommitteeLogo size={42} />
            <span className="text-[10px] font-mono bg-white/10 border border-white/15 px-2.5 py-1 rounded-xl text-amber-300 font-bold">
              v1.5.0 Premium
            </span>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full py-3 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-rose-400/30 shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج الأمني</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Navigation Drawer Header */}
        <DashboardMobileHeader
          userName={profile?.full_name || undefined}
          userEmail={profile?.email || undefined}
          unreadCount={unreadAdminNotifs}
        />

        {/* Desktop Executive Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white dark:bg-[#111C35] border-b border-slate-200 dark:border-slate-800 shadow-xs z-20">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
              النظام التنفيذي للجنة الإعلامية — برنامج الشراكة الطلابية
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <Link
              href="/dashboard/notifications"
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {unreadAdminNotifs && unreadAdminNotifs > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                  {unreadAdminNotifs}
                </span>
              ) : null}
            </Link>

            <Link
              href="/portal"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#06266F] dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-extrabold hover:bg-blue-100 transition-all"
            >
              معاينة بوابة المبادرات ↗
            </Link>
          </div>
        </header>

        {/* Dynamic Admin Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            {children}
          </div>

          <div className="pt-12">
            <PublicFooter />
          </div>
        </main>

      </div>

    </div>
  );
}

