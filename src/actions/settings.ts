'use server';

import { createClient } from '@/lib/supabase/server';
import { RequestPriority } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function addPlatformItem(name: string, code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return { error: 'غير مصرح' };

  const { error } = await supabase
    .from('platforms')
    .insert({ name, code: code.toLowerCase().trim(), is_active: true });

  if (error) return { error: 'فشل إضافة المنصة: ' + error.message };

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'settings_update',
    entity_type: 'platform',
    entity_id: code,
    new_data: { name, code },
  });

  revalidatePath('/dashboard/settings');
  return { success: 'تمت إضافة المنصة بنجاح' };
}

export async function addMediaTypeItem(name: string, code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return { error: 'غير مصرح' };

  const { error } = await supabase
    .from('media_types')
    .insert({ name, code: code.toLowerCase().trim(), is_active: true });

  if (error) return { error: 'فشل إضافة نوع المحتوى: ' + error.message };

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'settings_update',
    entity_type: 'media_type',
    entity_id: code,
    new_data: { name, code },
  });

  revalidatePath('/dashboard/settings');
  return { success: 'تمت إضافة نوع المحتوى بنجاح' };
}

export async function saveSlaPolicy(priority: RequestPriority, name: string, minutes: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return { error: 'غير مصرح' };

  const { error } = await supabase
    .from('sla_policies')
    .upsert({
      priority,
      name,
      target_review_minutes: minutes,
      is_active: true,
    }, { onConflict: 'priority' });

  if (error) return { error: 'فشل حفظ اتفاقية مستوى الخدمة: ' + error.message };

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'settings_update',
    entity_type: 'sla_policy',
    entity_id: priority,
    new_data: { priority, name, target_review_minutes: minutes },
  });

  revalidatePath('/dashboard/settings');
  return { success: 'تمت تحديث اتفاقية مستوى الخدمة بنجاح' };
}
