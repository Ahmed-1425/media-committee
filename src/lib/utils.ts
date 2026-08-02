import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date in 100% Gregorian Calendar (الميلادي) in Arabic
 */
export function formatArabicDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Riyadh',
    }).format(date) + ' م';
  } catch {
    return dateString;
  }
}

/**
 * Format short date in 100% Gregorian Calendar (الميلادي) in Arabic
 */
export function formatArabicShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Riyadh',
    }).format(date) + ' م';
  } catch {
    return dateString;
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
