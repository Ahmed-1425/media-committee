import React from 'react';
import { Inbox, CalendarX, BellOff, ShieldAlert, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'inbox' | 'calendar' | 'bell' | 'shield' | 'folder';
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ArabicEmptyState({
  title,
  description,
  icon = 'inbox',
  actionHref,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'calendar':
        return <CalendarX className="w-12 h-12 text-slate-400 dark:text-slate-500" />;
      case 'bell':
        return <BellOff className="w-12 h-12 text-slate-400 dark:text-slate-500" />;
      case 'shield':
        return <ShieldAlert className="w-12 h-12 text-slate-400 dark:text-slate-500" />;
      case 'folder':
        return <FolderOpen className="w-12 h-12 text-slate-400 dark:text-slate-500" />;
      default:
        return <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-[#111C35] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm my-4">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800/80 mb-4 stroke-1">
        {getIcon()}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="px-5 py-2.5 bg-[#06266F] hover:bg-[#023793] text-white text-sm font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
        >
          {actionLabel}
        </Link>
      )}

      {!actionHref && onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#06266F] hover:bg-[#023793] text-white text-sm font-medium rounded-xl shadow-sm transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
