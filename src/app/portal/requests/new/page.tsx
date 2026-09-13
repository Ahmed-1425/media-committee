'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { submitRequest, createOrUpdateDraft, getReferenceData } from '@/actions/requests';
import { PlatformItem, MediaTypeItem, RequestPriority } from '@/lib/types';
import {
  Send,
  Save,
  ArrowRight,
  Link2,
  Info,
  AlertCircle,
  Share2,
  Palette,
  FileText,
  Zap,
  Clock,
  Sparkles,
  Check,
  Calendar as CalendarIcon,
  Clock3,
} from 'lucide-react';
import Link from 'next/link';

// Default fallback options with valid UUIDs matching database seeds
const DEFAULT_PLATFORMS: PlatformItem[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'منصة X (تويتر)', code: 'x', is_active: true, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'انستغرام (Instagram)', code: 'instagram', is_active: true, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'تيك توك (TikTok)', code: 'tiktok', is_active: true, sort_order: 3, created_at: '', updated_at: '' },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'لينكد إن (LinkedIn)', code: 'linkedin', is_active: true, sort_order: 4, created_at: '', updated_at: '' },
  { id: 'a0000000-0000-0000-0000-000000000005', name: 'يوتيوب (YouTube)', code: 'youtube', is_active: true, sort_order: 5, created_at: '', updated_at: '' },
  { id: 'a0000000-0000-0000-0000-000000000006', name: 'سناب شات (Snapchat)', code: 'snapchat', is_active: true, sort_order: 6, created_at: '', updated_at: '' },
];

const DEFAULT_MEDIA_TYPES: MediaTypeItem[] = [
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'تصميم جرافيك (Design)', code: 'design', is_active: true, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'فيديو مرئي (Video)', code: 'video', is_active: true, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'ريلز / ستوري (Reels)', code: 'reels', is_active: true, sort_order: 3, created_at: '', updated_at: '' },
  { id: 'b0000000-0000-0000-0000-000000000004', name: 'تغطية ميدانية (Coverage)', code: 'coverage', is_active: true, sort_order: 4, created_at: '', updated_at: '' },
  { id: 'b0000000-0000-0000-0000-000000000005', name: 'بيان / خبر إعلامي (Press)', code: 'press', is_active: true, sort_order: 5, created_at: '', updated_at: '' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [mediaTypes, setMediaTypes] = useState<MediaTypeItem[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Modern Interactive Selections
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMediaType, setSelectedMediaType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<RequestPriority>('normal');

  // Date & Time Interactive State (100% Gregorian & Riyadh Timezone UTC+3)
  function getRiyadhDateOffset(offsetDays: number = 0): string {
    const d = new Date();
    // Convert to Riyadh time (UTC+3)
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const riyadhTime = new Date(utc + (3600000 * 3));
    riyadhTime.setDate(riyadhTime.getDate() + offsetDays);
    const y = riyadhTime.getFullYear();
    const m = String(riyadhTime.getMonth() + 1).padStart(2, '0');
    const day = String(riyadhTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const todayStr = getRiyadhDateOffset(0);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedHour, setSelectedHour] = useState<string>('08');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const res = await getReferenceData();
      const activePlats = res.platforms && res.platforms.length > 0 ? res.platforms : DEFAULT_PLATFORMS;
      const activeMedias = res.mediaTypes && res.mediaTypes.length > 0 ? res.mediaTypes : DEFAULT_MEDIA_TYPES;

      setPlatforms(activePlats);
      setMediaTypes(activeMedias);

      // Pre-select defaults
      if (activePlats.length > 0) setSelectedPlatforms([activePlats[0].id]);
      if (activeMedias.length > 0) setSelectedMediaType(activeMedias[0].id);

      setLoadingConfig(false);
    }
    loadData();
  }, []);

  function togglePlatform(id: string) {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  }

  function setDateOffset(offsetDays: number) {
    setSelectedDate(getRiyadhDateOffset(offsetDays));
  }

  function get24HourFormattedTime(): string {
    let h = parseInt(selectedHour, 10);
    if (selectedPeriod === 'PM' && h < 12) h += 12;
    if (selectedPeriod === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${selectedMinute}`;
  }

  function getFormattedGregorianDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  }

  function prepareFormData(formElement: HTMLFormElement): FormData {
    const formData = new FormData(formElement);
    formData.set('platform_id', selectedPlatforms[0] || (platforms[0]?.id || ''));
    formData.set('media_type_id', selectedMediaType || (mediaTypes[0]?.id || ''));
    formData.set('priority', selectedPriority);

    if (selectedDate) {
      const time24 = get24HourFormattedTime();
      // Explicitly attach Riyadh timezone offset (+03:00) so server preserves the exact selected hour
      formData.set('requested_publish_at', `${selectedDate}T${time24}:00+03:00`);
    }

    return formData;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = prepareFormData(e.currentTarget);
    const result = await submitRequest(formData);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else if (result.requestId) {
      router.push(`/portal/requests/${result.requestId}?submitted=true`);
    }
  }

  async function handleDraftSave(formElement: HTMLFormElement) {
    setError(null);
    setSavingDraft(true);

    const formData = prepareFormData(formElement);
    const result = await createOrUpdateDraft(formData);

    if (result.error) {
      setError(result.error);
      setSavingDraft(false);
    } else if (result.requestId) {
      router.push(`/portal/requests/${result.requestId}?saved=true`);
    }
  }

  if (loadingConfig) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#06266F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-bold">جاري تحميل خيارات المنصات والتاريخ الميلادي...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Page Title & Back Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300/30 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>طلب نشر إعلامي معتمد</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            تقديم طلب نشر إعلامي جديد
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            قم بتحديد المنصات، نوع المحتوى، وأولوية النشر مع تحديد التاريخ الميلادي ووقت النشر.
          </p>
        </div>

        <Link
          href="/portal/requests"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للطلبات</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3 shadow-md">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-extrabold mb-0.5">تعذر تسليم الطلب</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form id="newRequestForm" onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Title & Interactive Platform Selection */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <h2 className="text-base font-bold text-[#06266F] dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <span>1. عنوان الطلب والمنصات المستهدفة</span>
          </h2>

          {/* Request Title Input */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
              عنوان الطلب <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="مثال: تغطية إعلامية وشاملة لفعالية الملتقى الطلابي السنوي"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#06266F] transition-all"
            />
          </div>

          {/* Modern Multi-Platform Select Chips */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                المنصات المستهدفة للنشر (يمكن اختيار أكثر من منصة) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                محدد: {selectedPlatforms.length} منصات
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {platforms.map((plat) => {
                const isSelected = selectedPlatforms.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`p-3.5 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-between gap-2 shadow-xs cursor-pointer ${
                      isSelected
                        ? 'bg-[#06266F] text-white border-[#06266F] shadow-lg shadow-blue-900/20 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Share2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="truncate">{plat.name}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Media Type & Priority Selector Cards */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <h2 className="text-base font-bold text-[#06266F] dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <span>2. نوع المحتوى وأولوية النشر</span>
          </h2>

          {/* Media Content Type Interactive Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
              نوع المحتوى الإعلامي <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mediaTypes.map((media) => {
                const isSelected = selectedMediaType === media.id;
                return (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => setSelectedMediaType(media.id)}
                    className={`p-4 rounded-2xl border text-xs text-right transition-all space-y-2 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#06266F] to-[#023793] text-white border-[#06266F] shadow-lg shadow-blue-900/20 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{media.name}</span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-amber-400 text-slate-950 border-amber-400' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Dual Selection Cards */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
              أولوية الطلب ودرجة الاستعجال <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Normal Priority Card */}
              <button
                type="button"
                onClick={() => setSelectedPriority('normal')}
                className={`p-5 rounded-2xl border text-right transition-all space-y-2 cursor-pointer ${
                  selectedPriority === 'normal'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span className="font-black text-sm">عادي (اعتيادي)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] font-extrabold">
                    SLA قياسي
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  خاضع لمواعيد المراجعة الاعتيادية وفق الجدول الزمني المعتمد لبرنامج الشراكة الطلابية.
                </p>
              </button>

              {/* Urgent Priority Card */}
              <button
                type="button"
                onClick={() => setSelectedPriority('urgent')}
                className={`p-5 rounded-2xl border text-right transition-all space-y-2 cursor-pointer ${
                  selectedPriority === 'urgent'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-rose-600 animate-pulse" />
                    <span className="font-black text-sm">عاجل (أولوية قصوى)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 text-[10px] font-extrabold">
                    استثناء ومراجعة فورية
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  يتطلب النشر خلال مدة قصيرة أو يستدعي استثناءً خاصاً ومتابعة فورية من المشرف.
                </p>
              </button>

            </div>
          </div>

        </div>

        {/* Section 3: Drive Link & Sharing Instructions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <h2 className="text-base font-bold text-[#06266F] dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            <span>3. رابط الملفات المرفقة (Google Drive)</span>
          </h2>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-[#023793] dark:text-blue-400 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-extrabold text-sm">تعليمات مشاركة رابط Google Drive:</p>
              <p>
                يجب ضبط صلاحية المشاركة لمجلد المبادرة في Google Drive لتكون: <span className="font-bold underline">"أي شخص لديه الرابط — عارض (Anyone with the link can view)"</span> لتمكين اللجنة من معاينة التصاميم.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
              رابط قوقل درايف للمجلد <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                name="drive_link"
                required
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#06266F] transition-all dir-ltr text-right"
              />
              <Link2 className="w-5 h-5 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>
        </div>

        {/* Section 4: Separated Date (الميلادي) & Time Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <h2 className="text-base font-bold text-[#06266F] dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span>4. تفاصيل المحتوى وتحديد التاريخ والوقت</span>
          </h2>

          {/* Caption Text Area */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
              نص المنشور (الكابشن المكتوب) <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="caption"
              rows={5}
              required
              placeholder="اكتب النص المطلوب نشره كاملاً باللغة العربية مضافاً إليه الوسوم (Hashtags) والإشارات المخصصة..."
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#06266F] transition-all leading-relaxed"
            />
          </div>

          {/* Modern Gregorian Date & 12-Hour AM/PM Time Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* 1. Gregorian Date Picker Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>تاريخ النشر المقترح (ميلادي حصراً 📅)</span>
                </label>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  التقويم الميلادي
                </span>
              </div>

              {/* Quick Date Presets */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDateOffset(0)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    selectedDate === todayStr
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  اليوم
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(1)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  غداً
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(3)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  بعد 3 أيام
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(7)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  بعد أسبوع
                </button>
              </div>

              {/* Gregorian Date Input */}
              <div className="relative">
                <input
                  type="date"
                  lang="en-US"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#06266F] transition-all dir-ltr text-center cursor-pointer"
                />
              </div>

              {/* Formatted Gregorian Date Preview */}
              {selectedDate && (
                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 font-bold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>التاريخ المحدد: {getFormattedGregorianDate(selectedDate)} (ميلادي)</span>
                </div>
              )}
            </div>

            {/* 2. Time Picker Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>وقت وساعة النشر المقترحة ⏰</span>
                </label>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  الوقت
                </span>
              </div>

              {/* Quick Time Presets */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '09:00 ص', h: '09', m: '00', p: 'AM' as const },
                  { label: '01:00 م', h: '01', m: '00', p: 'PM' as const },
                  { label: '04:00 م', h: '04', m: '00', p: 'PM' as const },
                  { label: '08:00 م', h: '08', m: '00', p: 'PM' as const },
                  { label: '10:00 م', h: '10', m: '00', p: 'PM' as const },
                  { label: '11:00 م 🌟', h: '11', m: '00', p: 'PM' as const },
                  { label: '12:00 ص (منتصف الليل)', h: '12', m: '00', p: 'AM' as const },
                ].map((preset) => {
                  const isSelected = selectedHour === preset.h && selectedMinute === preset.m && selectedPeriod === preset.p;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSelectedHour(preset.h);
                        setSelectedMinute(preset.m);
                        setSelectedPeriod(preset.p);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Time Selectors (Hour, Minute, AM/PM) */}
              <div className="grid grid-cols-3 gap-2 dir-ltr">
                {/* Hour */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 text-center mb-1">الساعة</label>
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    className="w-full px-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black text-center text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-amber-500"
                  >
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Minute */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 text-center mb-1">الدقيقة</label>
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(e.target.value)}
                    className="w-full px-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black text-center text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-amber-500"
                  >
                    {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Period */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 text-center mb-1">الفترة</label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('AM')}
                      className={`flex-1 py-2 text-[11px] font-black transition-all cursor-pointer ${
                        selectedPeriod === 'AM'
                          ? 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      صباحاً
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('PM')}
                      className={`flex-1 py-2 text-[11px] font-black transition-all cursor-pointer ${
                        selectedPeriod === 'PM'
                          ? 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      مساءً
                    </button>
                  </div>
                </div>
              </div>

              {/* Formatted Time Preview */}
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200 font-bold space-y-1">
                <div className="flex items-center gap-2">
                  <Clock3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>الوقت المحدد للنشر: {selectedHour}:{selectedMinute} {selectedPeriod === 'AM' ? 'صباحاً (AM)' : 'مساءً (PM)'}</span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 pr-5.5">
                  ✓ توقيت مكة المكرمة/الرياض (UTC+3) — كافة أوقات المساء والليل متاحة ومعتمدة دون استبعاد.
                </p>
              </div>
            </div>

          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
              ملاحظات إضافية للمشرف (اختياري)
            </label>
            <input
              type="text"
              name="notes"
              placeholder="أية توجيهات خاصة بالنشر أو ترتيب التصاميم..."
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-[#06266F] transition-all"
            />
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
          
          <button
            type="button"
            disabled={savingDraft || submitting}
            onClick={() => {
              const form = document.getElementById('newRequestForm') as HTMLFormElement;
              if (form) handleDraftSave(form);
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs sm:text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {savingDraft ? (
              <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ كمسودة</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={submitting || savingDraft}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#06266F] to-[#023793] hover:from-[#023793] hover:to-[#041B52] text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-950/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-105"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-400" />
                <span>تسليم تقديم الطلب للمراجعة</span>
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
}
