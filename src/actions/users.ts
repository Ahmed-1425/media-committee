'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppRole } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// 1. Create New User Account with Email, Password & Initiative Assignment
export async function inviteOrUserCreate(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentProfile?.role !== 'super_admin') {
    return { error: 'إدارة الحسابات متاحة للمشرف الممتاز فقط' };
  }

  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = (formData.get('password') as string || '').trim();
  const full_name = (formData.get('full_name') as string || '').trim();
  const phone = (formData.get('phone') as string || '').trim();
  const role = (formData.get('role') as AppRole) || 'initiative';
  const initiative_id = formData.get('initiative_id') as string;

  if (!email) return { error: 'يرجى إدخال البريد الإلكتروني' };
  if (!password || password.length < 8) {
    return { error: 'يرجى إدخال كلمة مرور من 8 خانات على الأقل' };
  }
  if (!full_name) return { error: 'يرجى إدخال اسم المستفيد أو ممثل المبادرة' };
  if (role === 'initiative' && !initiative_id) {
    return { error: 'يرجى تحديد المبادرة التابع لها هذا الحساب' };
  }

  const adminClient = createAdminClient();

  // Create Auth User securely on server side
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (authError) {
    return { error: 'فشل إنشاء الحساب: ' + authError.message };
  }

  const newUserId = authUser.user.id;

  // Upsert profile
  await adminClient.from('profiles').upsert({
    id: newUserId,
    role,
    full_name,
    email,
    phone: phone || null,
    account_status: 'active',
  });

  // If initiative role, link membership
  if (role === 'initiative' && initiative_id) {
    await adminClient.from('initiative_memberships').upsert({
      initiative_id,
      profile_id: newUserId,
    }, { onConflict: 'profile_id' });
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'create',
    entity_type: 'user',
    entity_id: newUserId,
    new_data: { email, role, full_name, initiative_id },
  });

  revalidatePath('/dashboard/users');
  return { success: `تم إنشاء حساب (${full_name}) المربوط بمبادرته بنجاح` };
}

// 2. Edit Existing User Profile & Initiative Assignment
export async function updateUserAccount(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (currentProfile?.role !== 'super_admin') return { error: 'غير مصرح بالوصول' };

  const targetUserId = formData.get('userId') as string;
  const full_name = (formData.get('full_name') as string || '').trim();
  const phone = (formData.get('phone') as string || '').trim();
  const role = (formData.get('role') as AppRole) || 'initiative';
  const initiative_id = formData.get('initiative_id') as string;

  if (!targetUserId || !full_name) {
    return { error: 'بيانات التحديث غير مكتملة' };
  }

  const adminClient = createAdminClient();

  // Update profile
  await adminClient
    .from('profiles')
    .update({ full_name, phone: phone || null, role })
    .eq('id', targetUserId);

  // Update or delete initiative membership
  if (role === 'initiative' && initiative_id) {
    await adminClient.from('initiative_memberships').upsert({
      initiative_id,
      profile_id: targetUserId,
    }, { onConflict: 'profile_id' });
  } else {
    await adminClient.from('initiative_memberships').delete().eq('profile_id', targetUserId);
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update',
    entity_type: 'user',
    entity_id: targetUserId,
    new_data: { full_name, role, initiative_id },
  });

  revalidatePath('/dashboard/users');
  return { success: 'تم تحديث بيانات الحساب بنجاح' };
}

// 3. Reset User Password Directly by Admin
export async function resetUserPasswordDirectly(targetUserId: string, newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (currentProfile?.role !== 'super_admin') return { error: 'غير مصرح بالوصول' };

  if (!newPassword || newPassword.length < 8) {
    return { error: 'يجب أن تكون كلمة المرور 8 خانات على الأقل' };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (error) {
    return { error: 'فشل تغيير كلمة المرور: ' + error.message };
  }

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'reset_password',
    entity_type: 'user',
    entity_id: targetUserId,
  });

  revalidatePath('/dashboard/users');
  return { success: 'تم تعيين كلمة المرور الجديدة للحساب بنجاح' };
}

// 4. Toggle Account Status (Active / Disabled)
export async function toggleUserStatus(targetUserId: string, isDisable: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (currentProfile?.role !== 'super_admin') return { error: 'غير مصرح بالوصول' };

  if (targetUserId === user.id) {
    return { error: 'لا يمكنك تعطيل حسابك الخاص' };
  }

  const newStatus = isDisable ? 'disabled' : 'active';
  const { error } = await supabase
    .from('profiles')
    .update({ account_status: newStatus })
    .eq('id', targetUserId);

  if (error) return { error: 'فشل تغيير حالة الحساب: ' + error.message };

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'disable_user',
    entity_type: 'user',
    entity_id: targetUserId,
    new_data: { account_status: newStatus },
  });

  revalidatePath('/dashboard/users');
  return { success: isDisable ? 'تم تعطيل الحساب' : 'تم تنشيط الحساب' };
}

// 5. Delete User Account Permanently
export async function deleteUserAccount(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (currentProfile?.role !== 'super_admin') return { error: 'غير مصرح بالوصول' };

  if (targetUserId === user.id) {
    return { error: 'لا يمكنك حذف حسابك الإداري الحالي' };
  }

  const adminClient = createAdminClient();

  // Delete memberships first
  await adminClient.from('initiative_memberships').delete().eq('profile_id', targetUserId);
  
  // Delete profile
  await adminClient.from('profiles').delete().eq('id', targetUserId);

  // Delete Auth User
  const { error } = await adminClient.auth.admin.deleteUser(targetUserId);

  if (error) {
    return { error: 'فشل حذف الحساب من النظام: ' + error.message };
  }

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update',
    entity_type: 'user',
    entity_id: targetUserId,
    new_data: { action: 'delete_user' },
  });

  revalidatePath('/dashboard/users');
  return { success: 'تم حذف الحساب والبيانات التابعة له نهائياً' };
}
