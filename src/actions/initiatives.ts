'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createInitiative(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  // Role check
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') {
    return { error: 'إدارة المبادرات متاحة للمشرف الممتاز فقط' };
  }

  const name = (formData.get('name') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const contact_email = (formData.get('contact_email') as string || '').trim();
  const contact_phone = (formData.get('contact_phone') as string || '').trim();

  if (!name) return { error: 'يرجى إدخال اسم المبادرة' };

  const { data: initiative, error } = await supabase
    .from('initiatives')
    .insert({
      name,
      description: description || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      is_active: true,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'اسم المبادرة مسجل مسبقاً. يرجى اختيار اسم آخر.' };
    }
    return { error: 'فشل إضافة المبادرة: ' + error.message };
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'create',
    entity_type: 'initiative',
    entity_id: initiative.id,
    new_data: { name, contact_email },
  });

  revalidatePath('/dashboard/initiatives');
  return { success: 'تمت إضافة المبادرة بنجاح', initiative };
}

export async function updateInitiative(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return { error: 'غير مصرح' };

  const name = (formData.get('name') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const contact_email = (formData.get('contact_email') as string || '').trim();
  const contact_phone = (formData.get('contact_phone') as string || '').trim();

  if (!name) return { error: 'اسم المبادرة مطلوب' };

  const { error } = await supabase
    .from('initiatives')
    .update({
      name,
      description: description || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
    })
    .eq('id', id);

  if (error) return { error: 'فشل التحديث: ' + error.message };

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update',
    entity_type: 'initiative',
    entity_id: id,
    new_data: { name, contact_email },
  });

  revalidatePath(`/dashboard/initiatives/${id}`);
  revalidatePath('/dashboard/initiatives');
  return { success: 'تم تحديث بيانات المبادرة بنجاح' };
}

export async function toggleInitiativeStatus(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') return { error: 'غير مصرح' };

  const { error } = await supabase
    .from('initiatives')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) return { error: 'فشل تغيير حالة المبادرة: ' + error.message };

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update',
    entity_type: 'initiative',
    entity_id: id,
    new_data: { is_active: isActive },
  });

  revalidatePath('/dashboard/initiatives');
  return { success: isActive ? 'تم تفعيل المبادرة' : 'تم تعطيل المبادرة' };
}
