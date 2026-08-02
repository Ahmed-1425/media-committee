import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logoutInitiative } from '@/actions/auth';
import { PartnershipLogo, MediaCommitteeLogo, TechnicalCommitteeLogo } from '@/components/common/BrandLogos';
import { PublicFooter } from '@/components/common/Footer';
import {
  Home,
  FileText,
  PlusCircle,
  Calendar,
  Bell,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch profile & membership safely without throwing on 0 rows
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'super_admin') redirect('/dashboard');

  const { data: membership } = await supabase
    .from('initiative_memberships')
    .select('initiative:initiatives(name)')
    .eq('profile_id', user.id)
    .maybeSingle();

  const initiativeName = (membership?.initiative as any)?.name || 'المبادرة الطلابية';

  // Count unread notifications
  const { count: unreadNotifications } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false);

  const navItems = [
    { href: '/portal', label: 'الرئيسية', icon: Home },
    { href: '/portal/requests', label: 'طلبات النشر', icon: FileText },
    { href: '/portal/requests/new', label: 'تقديم طلب جديد', icon: PlusCircle, highlight: true },
    { href: '/portal/calendar', label: 'تقويم النشر', icon: Calendar },
    { href: '/portal/notifications', label: 'التنبيهات', icon: Bell, badge: unreadNotifications },
    { href: '/portal/profile', label: 'حسابي', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#070D1D] text-slate-900 dark:text-white pb-20 md:pb-0 font-sans dir-rtl">
      
      {/* Executive Dark Navy Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#041B52] via-[#06266F] to-[#023793] text-white border-b border-blue-400/20 shadow-2xl backdrop-blur-xl">
        {/* Glowing top line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400/80 via-blue-400/90 to-amber-400/80"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* 1. Right Side: Brand Logos & Initiative Title */}
          <div className="flex items-center gap-3.5 shrink-0">
            <Link href="/portal" className="flex items-center transition-transform hover:scale-105">
              <PartnershipLogo size={58} className="hidden sm:block" />
              <PartnershipLogo size={46} className="sm:hidden" />
            </Link>
            
            <div className="h-8 w-px bg-white/20 hidden sm:block" />
            
            <MediaCommitteeLogo size={50} className="hidden sm:flex" />

            <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-white/20">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-amber-300 border border-white/15 text-xs font-black shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{initiativeName}</span>
              </span>
            </div>
          </div>

          {/* 2. Center: Perfectly Spaced Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all relative ${
                    item.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                      : 'text-blue-100 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* 3. Left Side: Technical Logo & Signout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden xl:block">
              <TechnicalCommitteeLogo size={46} />
            </div>

            <form action={logoutInitiative}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white transition-all text-xs font-bold border border-rose-400/30 shadow-sm"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </form>
          </div>

        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Public Footer */}
      <PublicFooter />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#06266F] text-white border-t border-blue-400/20 px-2 py-2 flex items-center justify-around shadow-2xl backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-blue-200 hover:text-white transition-colors relative ${
                item.highlight ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${item.highlight ? 'text-amber-400' : ''}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
