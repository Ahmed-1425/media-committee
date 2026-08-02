import React from 'react';
import { RequestStatus, ARABIC_STATUS_LABELS, ARABIC_STATUS_COLORS } from '@/lib/types';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const label = ARABIC_STATUS_LABELS[status] || status;
  const colors = ARABIC_STATUS_COLORS[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current ml-1.5 opacity-80" />
      {label}
    </span>
  );
}
