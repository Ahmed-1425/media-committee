'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { isValidGoogleDriveUrl } from '@/lib/utils';
import { RequestStatus, RequestPriority } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const DEFAULT_PLATFORM_ROWS = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'منصة X (تويتر)', code: 'x', is_active: true, sort_order: 1 },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'انستغرام (Instagram)', code: 'instagram', is_active: true, sort_order: 2 },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'تيك توك (TikTok)', code: 'tiktok', is_active: true, sort_order: 3 },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'لينكد إن (LinkedIn)', code: 'linkedin', is_active: true, sort_order: 4 },
  { id: 'a0000000-0000-0000-0000-000000000005', name: 'يوتيوب (YouTube)', code: 'youtube', is_active: true, sort_order: 5 },
  { id: 'a0000000-0000-0000-0000-000000000006', name: 'سناب شات (Snapchat)', code: 'snapchat', is_active: true, sort_order: 6 },
];

const DEFAULT_MEDIA_ROWS = [
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'تصميم جرافيك (Design)', code: 'design', is_active: true, sort_order: 1 },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'فيديو مرئي (Video)', code: 'video', is_active: true, sort_order: 2 },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'ريلز / ستوري (Reels)', code: 'reels', is_active: true, sort_order: 3 },
  { id: 'b0000000-0000-0000-0000-000000000004', name: 'تغطية ميدانية (Coverage)', code: 'coverage', is_active: true, sort_order: 4 },
  { id: 'b0000000-0000-0000-0000-000000000005', name: 'بيان / خبر إعلامي (Press)', code: 'press', is_active: true, sort_order: 5 },
];

async function ensureReferenceDataSeeded(supabase: any, platformId?: string | null, mediaTypeId?: string | null) {
  try {
    const admin = createAdminClient();
    if (platformId) {
      const { data: plat } = await supabase.from('platforms').select('id').eq('id', platformId).single();
      if (!plat) {
        await admin.from('platforms').upsert(DEFAULT_PLATFORM_ROWS, { onConflict: 'code' });
      }
    } else {
      const { data: plats } = await supabase.from('platforms').select('id').limit(1);
      if (!plats || plats.length === 0) {
        await admin.from('platforms').upsert(DEFAULT_PLATFORM_ROWS, { onConflict: 'code' });
      }
    }

    if (mediaTypeId) {
      const { data: media } = await supabase.from('media_types').select('id').eq('id', mediaTypeId).single();
      if (!media) {
        await admin.from('media_types').upsert(DEFAULT_MEDIA_ROWS, { onConflict: 'code' });
      }
    } else {
      const { data: medias } = await supabase.from('media_types').select('id').limit(1);
      if (!medias || medias.length === 0) {
        await admin.from('media_types').upsert(DEFAULT_MEDIA_ROWS, { onConflict: 'code' });
      }
    }
  } catch (err) {
    console.error('Auto-seed reference error:', err);
  }
}

export async function getReferenceData() {
  const supabase = await createClient();
  await ensureReferenceDataSeeded(supabase);

  const [{ data: platforms }, { data: mediaTypes }] = await Promise.all([
    supabase.from('platforms').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('media_types').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
  ]);

  return {
    platforms: platforms && platforms.length > 0 ? platforms : DEFAULT_PLATFORM_ROWS,
    mediaTypes: mediaTypes && mediaTypes.length > 0 ? mediaTypes : DEFAULT_MEDIA_ROWS,
  };
}

export async function createOrUpdateDraft(formData: FormData, requestId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'غير مصرح بالوصول' };

  // Fetch initiative membership
  const { data: membership } = await supabase
    .from('initiative_memberships')
    .select('initiative_id')
    .eq('profile_id', user.id)
    .single();

  if (!membership) {
    return { error: 'حسابك غير مرتبط بأي مبادرة معتمدة' };
  }

  const title = (formData.get('title') as string || '').trim();
  const caption = (formData.get('caption') as string || '').trim();
  let platform_id = formData.get('platform_id') as string;
  let media_type_id = formData.get('media_type_id') as string;
  const priority = (formData.get('priority') as RequestPriority) || 'normal';
  const drive_link = (formData.get('drive_link') as string || '').trim();
  const notes = (formData.get('notes') as string || '').trim();
  const requested_publish_at = formData.get('requested_publish_at') as string;

  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const validPlatformId = isUuid(platform_id) ? platform_id : null;
  const validMediaTypeId = isUuid(media_type_id) ? media_type_id : null;

  if (!validPlatformId) return { error: 'يرجى اختيار المنصة المستهدفة للنشر بشكل صحيح' };
  if (!validMediaTypeId) return { error: 'يرجى اختيار نوع المحتوى الإعلامي بشكل صحيح' };

  if (drive_link && !isValidGoogleDriveUrl(drive_link)) {
    return { error: 'رابط قوقل درايف غير صالح. يرجى إدخال رابط مشاركة صحيح من Google Drive.' };
  }

  await ensureReferenceDataSeeded(supabase, validPlatformId, validMediaTypeId);

  const requestData = {
    initiative_id: membership.initiative_id,
    title,
    caption,
    platform_id: validPlatformId,
    media_type_id: validMediaTypeId,
    priority,
    drive_link,
    notes: notes || null,
    requested_publish_at: requested_publish_at ? new Date(requested_publish_at).toISOString() : null,
    status: 'draft' as RequestStatus,
  };

  if (requestId) {
    const { error } = await supabase
      .from('requests')
      .update(requestData)
      .eq('id', requestId)
      .eq('initiative_id', membership.initiative_id);

    if (error) return { error: 'فشل حفظ المسودة: ' + error.message };
  } else {
    const { data: newReq, error } = await supabase
      .from('requests')
      .insert(requestData)
      .select('id')
      .single();

    if (error) return { error: 'فشل إنشاء المسودة: ' + error.message };
    requestId = newReq.id;
  }

  revalidatePath('/portal/requests');
  return { success: 'تم حفظ المسودة بنجاح', requestId };
}

export async function submitRequest(formData: FormData, requestId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: membership } = await supabase
    .from('initiative_memberships')
    .select('initiative_id')
    .eq('profile_id', user.id)
    .single();

  if (!membership) return { error: 'حسابك غير مرتبط بأي مبادرة' };

  const title = (formData.get('title') as string || '').trim();
  const caption = (formData.get('caption') as string || '').trim();
  let platform_id = formData.get('platform_id') as string;
  let media_type_id = formData.get('media_type_id') as string;
  const priority = (formData.get('priority') as RequestPriority) || 'normal';
  const drive_link = (formData.get('drive_link') as string || '').trim();
  const notes = (formData.get('notes') as string || '').trim();
  const requested_publish_at = formData.get('requested_publish_at') as string;
  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const validPlatformId = isUuid(platform_id) ? platform_id : null;
  const validMediaTypeId = isUuid(media_type_id) ? media_type_id : null;

  // STRICT VALIDATION
  if (!validPlatformId) return { error: 'يرجى اختيار المنصة المستهدفة للنشر بشكل صحيح' };
  if (!validMediaTypeId) return { error: 'يرجى اختيار نوع المحتوى الإعلامي بشكل صحيح' };
  if (!title || title.length < 5) return { error: 'يرجى إدخال عنوان مناسب للطلب (5 حروف على الأقل)' };
  if (!caption) return { error: 'يرجى إدخال نص الكابشن/المحتوى المطلوب للنشر' };
  if (!drive_link || !isValidGoogleDriveUrl(drive_link)) {
    return { error: 'يرجى إدخال رابط قوقل درايف صالح للملفات المرفقة (drive.google.com)' };
  }

  await ensureReferenceDataSeeded(supabase, validPlatformId, validMediaTypeId);

  const nowIso = new Date().toISOString();

  let targetId = requestId;

  if (targetId) {
    // Update existing draft to submitted
    const { error } = await supabase
      .from('requests')
      .update({
        title,
        caption,
        platform_id: validPlatformId,
        media_type_id: validMediaTypeId,
        priority,
        drive_link,
        notes: notes || null,
        requested_publish_at: requested_publish_at ? new Date(requested_publish_at).toISOString() : null,
        status: 'submitted',
        submitted_at: nowIso,
        submitted_by: user.id,
      })
      .eq('id', targetId)
      .eq('initiative_id', membership.initiative_id);

    if (error) return { error: 'فشل تقديم الطلب: ' + error.message };
  } else {
    // Insert new submitted request
    const { data: newReq, error } = await supabase
      .from('requests')
      .insert({
        initiative_id: membership.initiative_id,
        title,
        caption,
        platform_id: validPlatformId,
        media_type_id: validMediaTypeId,
        priority,
        drive_link,
        notes: notes || null,
        requested_publish_at: requested_publish_at ? new Date(requested_publish_at).toISOString() : null,
        status: 'submitted',
        submitted_at: nowIso,
        submitted_by: user.id,
        current_version: 1,
      })
      .select('id')
      .single();

    if (error) return { error: 'فشل تقديم الطلب: ' + error.message };
    targetId = newReq.id;
  }

  // Insert Version snapshot
  await supabase.from('request_versions').insert({
    request_id: targetId,
    version_number: 1,
    title,
    caption,
    platform_id,
    media_type_id,
    priority,
    drive_link,
    notes: notes || null,
    requested_publish_at: requested_publish_at ? new Date(requested_publish_at).toISOString() : null,
    status: 'submitted',
    created_by: user.id,
  });

  // Insert Status History
  await supabase.from('request_status_history').insert({
    request_id: targetId,
    from_status: 'draft',
    to_status: 'submitted',
    changed_by: user.id,
  });

  // SLA Calculation if policy exists
  const { data: slaPolicy } = await supabase
    .from('sla_policies')
    .select('*')
    .eq('priority', priority)
    .eq('is_active', true)
    .single();

  if (slaPolicy) {
    const dueAt = new Date(Date.now() + slaPolicy.target_review_minutes * 60000).toISOString();
    await supabase.from('request_sla').upsert({
      request_id: targetId,
      policy_id: slaPolicy.id,
      due_at: dueAt,
      state: 'on_track',
    });
  } else {
    await supabase.from('request_sla').upsert({
      request_id: targetId,
      state: 'not_configured',
    });
  }

  // Notify Super Admins
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'super_admin');

  if (admins && admins.length > 0) {
    const notificationsToInsert = admins.map((adm) => ({
      recipient_id: adm.id,
      type: 'request_submitted' as const,
      title: 'طلب نشر جديد',
      body: `تم إرسال طلب نشر جديد بعنوان "${title}"`,
      request_id: targetId,
    }));
    await supabase.from('notifications').insert(notificationsToInsert);
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'create',
    entity_type: 'request',
    entity_id: targetId,
    new_data: { title, priority, status: 'submitted' },
  });

  revalidatePath('/portal/requests');
  revalidatePath('/dashboard/requests');
  return { success: 'تم تقديم طلب النشر بنجاح', requestId: targetId };
}

export async function resubmitRequest(formData: FormData, requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'غير مصرح بالوصول' };

  const { data: existingReq } = await supabase
    .from('requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!existingReq) return { error: 'الطلب غير موجود' };
  if (existingReq.status !== 'changes_requested' && existingReq.status !== 'rejected') {
    return { error: 'لا يمكن إعادة تقديم الطلب في حالته الحالية' };
  }

  const title = (formData.get('title') as string || '').trim();
  const caption = (formData.get('caption') as string || '').trim();
  const platform_id = formData.get('platform_id') as string;
  const media_type_id = formData.get('media_type_id') as string;
  const priority = (formData.get('priority') as RequestPriority) || 'normal';
  const drive_link = (formData.get('drive_link') as string || '').trim();
  const notes = (formData.get('notes') as string || '').trim();
  const resubmission_reason = (formData.get('resubmission_reason') as string || '').trim();
  const requested_publish_at = formData.get('requested_publish_at') as string;

  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const validPlatformId = isUuid(platform_id) ? platform_id : null;
  const validMediaTypeId = isUuid(media_type_id) ? media_type_id : null;

  if (!title || !caption || !validPlatformId || !validMediaTypeId || !drive_link) {
    return { error: 'يرجى إكمال جميع الحقول المطلوبة واختيار منصة ونوع محتوى صالحين' };
  }

  if (!isValidGoogleDriveUrl(drive_link)) {
    return { error: 'رابط قوقل درايف غير صالح' };
  }

  await ensureReferenceDataSeeded(supabase, validPlatformId, validMediaTypeId);

  const newVersionNumber = (existingReq.current_version || 1) + 1;
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from('requests')
    .update({
      title,
      caption,
      platform_id: validPlatformId,
      media_type_id: validMediaTypeId,
      priority,
      drive_link,
      notes: notes || null,
      requested_publish_at: requested_publish_at ? new Date(requested_publish_at).toISOString() : null,
      status: 'submitted',
      current_version: newVersionNumber,
      submitted_at: nowIso,
      updated_at: nowIso,
    })
    .eq('id', requestId);

  if (error) return { error: 'فشل إعادة التقديم: ' + error.message };

  // Insert Version Snapshot
  await supabase.from('request_versions').insert({
    request_id: requestId,
    version_number: newVersionNumber,
    title,
    caption,
    platform_id: validPlatformId,
    media_type_id: validMediaTypeId,
    priority,
    drive_link,
    notes: notes || null,
    requested_publish_at: requested_publish_at ? new Date(requested_publish_at).toISOString() : null,
    status: 'submitted',
    resubmission_reason: resubmission_reason || null,
    created_by: user.id,
  });

  // History & Audit
  await supabase.from('request_status_history').insert({
    request_id: requestId,
    from_status: existingReq.status,
    to_status: 'submitted',
    reason: resubmission_reason || 'إعادة تقديم بعد التعديل',
    changed_by: user.id,
  });

  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'status_transition',
    entity_type: 'request',
    entity_id: requestId,
    old_data: { status: existingReq.status, version: existingReq.current_version },
    new_data: { status: 'submitted', version: newVersionNumber },
  });

  revalidatePath(`/portal/requests/${requestId}`);
  revalidatePath('/dashboard/requests');
  return { success: `تم تقديم النسخة رقم ${newVersionNumber} بنجاح` };
}

export async function changeRequestStatus(
  requestId: string,
  toStatus: RequestStatus,
  reason?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  // Role check
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') {
    return { error: 'تغيير حالة الطلب متاح للمشرف الممتاز فقط' };
  }

  const { data: req } = await supabase
    .from('requests')
    .select('*, initiative:initiatives(name)')
    .eq('id', requestId)
    .single();

  if (!req) return { error: 'الطلب غير موجود' };

  const nowIso = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status: toStatus,
    updated_at: nowIso,
  };

  if (toStatus === 'under_review') {
    updatePayload.review_started_at = nowIso;
    updatePayload.reviewed_by = user.id;
  } else if (toStatus === 'changes_requested') {
    if (!reason || !reason.trim()) return { error: 'يرجى تقديم سبب واضح للتعديلات المطلوبة' };
    updatePayload.rejection_reason = reason.trim();
  } else if (toStatus === 'rejected') {
    if (!reason || !reason.trim()) return { error: 'يرجى تقديم سبب الرفض' };
    updatePayload.rejection_reason = reason.trim();
    updatePayload.reviewed_at = nowIso;
  } else if (toStatus === 'approved') {
    updatePayload.approved_at = nowIso;
  } else if (toStatus === 'scheduled') {
    updatePayload.scheduled_at = nowIso;
  } else if (toStatus === 'published') {
    updatePayload.published_at = nowIso;
  } else if (toStatus === 'archived') {
    updatePayload.archived_at = nowIso;
  }

  const { error } = await supabase
    .from('requests')
    .update(updatePayload)
    .eq('id', requestId);

  if (error) return { error: 'فشل تغيير الحالة: ' + error.message };

  // Insert status history
  await supabase.from('request_status_history').insert({
    request_id: requestId,
    from_status: req.status,
    to_status: toStatus,
    reason: reason || null,
    changed_by: user.id,
  });

  // Notify Initiative user members
  const { data: members } = await supabase
    .from('initiative_memberships')
    .select('profile_id')
    .eq('initiative_id', req.initiative_id);

  if (members && members.length > 0) {
    const notifications = members.map((m) => ({
      recipient_id: m.profile_id,
      type: 'status_changed' as const,
      title: 'تحديث على حالة الطلب',
      body: `تم تغيير حالة الطلب "${req.title}" إلى (${toStatus})`,
      request_id: requestId,
    }));
    await supabase.from('notifications').insert(notifications);
  }

  // Audit Log
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'status_transition',
    entity_type: 'request',
    entity_id: requestId,
    old_data: { status: req.status },
    new_data: { status: toStatus, reason },
  });

  revalidatePath(`/dashboard/requests/${requestId}`);
  revalidatePath('/portal/requests');
  return { success: 'تم تحديث حالة الطلب بنجاح' };
}

export async function addComment(requestId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'غير مصرح بالوصول' };

  const trimmed = body.trim();
  if (!trimmed) return { error: 'لا يمكن إرسال تعليق فارغ' };

  const { data: comment, error } = await supabase
    .from('request_comments')
    .insert({
      request_id: requestId,
      author_id: user.id,
      body: trimmed,
    })
    .select('*, author:profiles(*)')
    .single();

  if (error) return { error: 'فشل إضافة التعليق: ' + error.message };

  // Audit log
  await supabase.from('audit_logs').insert({
    actor_id: user.id,
    action: 'comment',
    entity_type: 'request_comment',
    entity_id: comment.id,
    new_data: { request_id: requestId },
  });

  revalidatePath(`/portal/requests/${requestId}`);
  revalidatePath(`/dashboard/requests/${requestId}`);
  return { success: 'تمت إضافة التعليق بنجاح', comment };
}
