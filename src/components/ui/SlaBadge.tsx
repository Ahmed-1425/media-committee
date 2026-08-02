import React from 'react';
import { ARABIC_SLA_STATE_LABELS } from '@/lib/types';
import { Clock } from 'lucide-react';

interface SlaBadgeProps {
  state?: string | null;
  dueAt?: string | null;
}

export function SlaBadge({ state = 'not_configured', dueAt }: SlaBadgeProps) {
  const currentState = state || 'not_configured';
  const config = ARABIC_SLA_STATE_LABELS[currentState] || ARABIC_SLA_STATE_LABELS.not_configured;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-transparent ${config.color}`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
