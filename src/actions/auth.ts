'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginInitiative(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'بيانات الدخول غير صحيحة، يرجى التحقق وإعادة المحاولة' };
  }

  // Verify profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', data.user.id)
    .single();

  if (profile?.account_status === 'disabled') {
    await supabase.auth.signOut();
    return { error: 'هذا الحساب معطل حالياً. يرجى التواصل مع إدارة النظام.' };
  }

  if (profile?.role === 'super_admin') {
    // Super admin should use admin sign-in
    await supabase.auth.signOut();
    return { error: 'هذا الحساب ينتمي للإدارة. يرجى تسجيل الدخول من لوحة التحكم.' };
  }

  redirect('/portal');
}

export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'بيانات الدخول غير صحيحة أو ليس لديك صلاحية الوصول' };
  }

  // Verify profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', data.user.id)
    .single();

  if (profile?.account_status === 'disabled') {
    await supabase.auth.signOut();
    return { error: 'الحساب معطل. يرجى مراجعة مسؤول النظام.' };
  }

  if (profile?.role !== 'super_admin') {
    await supabase.auth.signOut();
    return { error: 'غير مصرح لهذا الحساب بالوصول للوحة التحكم.' };
  }

  redirect('/dashboard');
}

export async function requestPasswordReset(formData: FormData, redirectUrl: string) {
  const email = formData.get('email') as string;
  if (!email) {
    return { error: 'يرجى إدخال البريد الإلكتروني' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    return { error: 'تعذر إرسال رابط إعادة التعيين. يرجى التأكد من البريد الإلكتروني.' };
  }

  return { success: 'تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.' };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 8) {
    return { error: 'يجب أن تتكون كلمة المرور من 8 خانات على الأقل' };
  }

  if (password !== confirmPassword) {
    return { error: 'كلمتا المرور غير متطابقتين' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: 'فشل تحديث كلمة المرور: ' + error.message };
  }

  return { success: 'تم تحديث كلمة المرور بنجاح' };
}

export async function logout(targetRedirect = '/') {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(targetRedirect);
}

export async function logoutInitiative() {
  await logout('/');
}

export async function logoutAdmin() {
  await logout('/dashboard/login');
}
