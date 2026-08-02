export type AppRole = 'super_admin' | 'initiative';

export type AccountStatus = 'active' | 'disabled';

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'published'
  | 'archived'
  | 'cancelled';

export type RequestPriority = 'normal' | 'urgent';

export type NotificationType =
  | 'request_submitted'
  | 'status_changed'
  | 'comment_added'
  | 'sla_warning'
  | 'sla_breached'
  | 'system';

export type AuditAction =
  | 'create'
  | 'update'
  | 'status_transition'
  | 'comment'
  | 'disable_user'
  | 'reset_password'
  | 'archive'
  | 'restore'
  | 'settings_update';

export interface Profile {
  id: string;
  role: AppRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_path: string | null;
  theme: 'light' | 'dark' | 'system';
  account_status: AccountStatus;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Initiative {
  id: string;
  name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InitiativeMembership {
  id: string;
  initiative_id: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformItem {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaTypeItem {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaRequest {
  id: string;
  reference_number: number;
  initiative_id: string;
  title: string;
  caption: string;
  platform_id: string;
  media_type_id: string;
  priority: RequestPriority;
  drive_link: string;
  notes: string | null;
  requested_publish_at: string | null;
  status: RequestStatus;
  submitted_at: string | null;
  review_started_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  archived_at: string | null;
  submitted_by: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  current_version: number;
  created_at: string;
  updated_at: string;
  // Joined fields for UI convenience
  initiative?: Initiative;
  platform?: PlatformItem;
  media_type?: MediaTypeItem;
  submitted_by_profile?: Profile;
  reviewed_by_profile?: Profile;
  sla?: RequestSla;
}

export interface RequestVersion {
  id: string;
  request_id: string;
  version_number: number;
  title: string;
  caption: string;
  platform_id: string;
  media_type_id: string;
  priority: RequestPriority;
  drive_link: string;
  notes: string | null;
  requested_publish_at: string | null;
  status: RequestStatus;
  resubmission_reason: string | null;
  created_by: string | null;
  created_at: string;
  // Joined
  platform?: PlatformItem;
  media_type?: MediaTypeItem;
  creator?: Profile;
}

export interface RequestStatusHistory {
  id: string;
  request_id: string;
  from_status: RequestStatus | null;
  to_status: RequestStatus;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
  // Joined
  changed_by_profile?: Profile;
}

export interface RequestComment {
  id: string;
  request_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  // Joined
  author?: Profile;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  body: string;
  request_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface SlaPolicy {
  id: string;
  name: string;
  priority: RequestPriority;
  target_review_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequestSla {
  request_id: string;
  policy_id: string | null;
  due_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  state: 'on_track' | 'at_risk' | 'breached' | 'not_configured';
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  created_at: string;
  // Joined
  actor?: Profile;
}

export interface AppSetting {
  key: string;
  value: any;
  updated_at: string;
  updated_by: string | null;
}

// ARABIC DICTIONARY & BRAND CONSTANTS
export const ARABIC_STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'مسودة',
  submitted: 'مُقدَّم',
  under_review: 'قيد المراجعة',
  changes_requested: 'مطلوب تعديلات',
  approved: 'مقبول',
  rejected: 'مرفوض',
  scheduled: 'مجدول للنشر',
  published: 'تم النشر',
  archived: 'مؤرشف',
  cancelled: 'ملغي',
};

export const ARABIC_STATUS_COLORS: Record<RequestStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
  submitted: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  under_review: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  changes_requested: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  approved: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  rejected: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
  scheduled: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  published: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' },
  archived: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-700' },
  cancelled: { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400', border: 'border-zinc-300 dark:border-zinc-700' },
};

export const ARABIC_PRIORITY_LABELS: Record<RequestPriority, string> = {
  normal: 'عادي',
  urgent: 'عاجل',
};

export const ARABIC_SLA_STATE_LABELS: Record<string, { label: string; color: string }> = {
  on_track: { label: 'ضمن المهلة', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' },
  at_risk: { label: 'وشيك الانتهاء', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' },
  breached: { label: 'تجاوز المهلة', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50' },
  not_configured: { label: 'لم يتم إعداد اتفاقية مستوى الخدمة بعد', color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' },
};
