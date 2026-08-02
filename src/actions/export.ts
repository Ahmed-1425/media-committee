'use server';

import { createClient } from '@/lib/supabase/server';
import { sanitizeCsvField, formatArabicDate } from '@/lib/utils';
import { ARABIC_STATUS_LABELS, ARABIC_PRIORITY_LABELS } from '@/lib/types';

export async function exportRequestsCsv() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return { error: 'التصدير متاح للمشرف الممتاز فقط' };

  const { data: requests, error } = await supabase
    .from('requests')
    .select('*, initiative:initiatives(name), platform:platforms(name), media_type:media_types(name)')
    .order('created_at', { ascending: false });

  if (error || !requests) return { error: 'فشل جلب البيانات للتصدير' };

  const headers = ['رقم الطلب', 'عنوان الطلب', 'المبادرة', 'المنصة', 'نوع المحتوى', 'الأولوية', 'الحالة', 'تاريخ تقديم الطلب', 'رابط قوقل درايف'];
  const rows = requests.map((req) => [
    sanitizeCsvField(req.reference_number),
    sanitizeCsvField(req.title),
    sanitizeCsvField(req.initiative?.name || '-'),
    sanitizeCsvField(req.platform?.name || '-'),
    sanitizeCsvField(req.media_type?.name || '-'),
    sanitizeCsvField(ARABIC_PRIORITY_LABELS[req.priority as keyof typeof ARABIC_PRIORITY_LABELS] || req.priority),
    sanitizeCsvField(ARABIC_STATUS_LABELS[req.status as keyof typeof ARABIC_STATUS_LABELS] || req.status),
    sanitizeCsvField(formatArabicDate(req.submitted_at || req.created_at)),
    sanitizeCsvField(req.drive_link),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  // Audit log export action
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update',
    entity_type: 'export',
    entity_id: 'requests_csv',
    new_data: { count: requests.length },
  });

  return { success: true, csvContent, filename: `requests_export_${Date.now()}.csv` };
}

export async function exportAuditLogCsv() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return { error: 'التصدير متاح للمشرف الممتاز فقط' };

  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*, actor:profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error || !logs) return { error: 'فشل جلب سجل التدقيق للتصدير' };

  const headers = ['التاريخ والوقت', 'المستخدِم', 'البريد الإلكتروني', 'الإجراء', 'نوع الكيان', 'معرف الكيان'];
  const rows = logs.map((log) => [
    sanitizeCsvField(formatArabicDate(log.created_at)),
    sanitizeCsvField(log.actor?.full_name || 'النظام'),
    sanitizeCsvField(log.actor?.email || '-'),
    sanitizeCsvField(log.action),
    sanitizeCsvField(log.entity_type),
    sanitizeCsvField(log.entity_id),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return { success: true, csvContent, filename: `audit_log_${Date.now()}.csv` };
}
