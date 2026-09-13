import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get today's Gregorian date in Riyadh timezone (Asia/Riyadh, UTC+3) as YYYY-MM-DD
 */
export function getRiyadhTodayDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Parse any date string entered for Riyadh time (UTC+3) into a standard ISO-8601 UTC string.
 * Prevents the +3 hours server shift bug.
 */
export function parseRiyadhDateToIso(dateStr: string | null | undefined): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // If already explicit with Z or offset like +03:00
  if (trimmed.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // If date-time string without timezone (e.g. YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const withOffset = trimmed.length === 16 ? `${trimmed}:00+03:00` : `${trimmed}+03:00`;
    const d = new Date(withOffset);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // If date only (YYYY-MM-DD), treat as start of day in Riyadh
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const withOffset = `${trimmed}T00:00:00+03:00`;
    const d = new Date(withOffset);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Format date in 100% Gregorian Calendar (الميلادي) in Arabic with weekday and 12-hour AM/PM
 */
export function formatArabicDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Riyadh',
    }).format(date);
  } catch {
    return String(dateString);
  }
}

/**
 * Format short date in 100% Gregorian Calendar (الميلادي) in Arabic
 */
export function formatArabicShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Riyadh',
    }).format(date);
  } catch {
    return String(dateString);
  }
}

export function formatArabicRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'منذ لحظات';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 172800) return 'أمس';
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} أيام`;

    return formatArabicShortDate(dateString);
  } catch {
    return dateString;
  }
}

/**
 * Validates syntax of Google Drive sharing links
 */
export function isValidGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'drive.google.com' ||
      parsed.hostname === 'docs.google.com' ||
      parsed.hostname.endsWith('.google.com')
    );
  } catch {
    return false;
  }
}

/**
 * Prevents CSV formula injection vulnerability (OWASP recommendation)
 */
export function sanitizeCsvField(field: any): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}
