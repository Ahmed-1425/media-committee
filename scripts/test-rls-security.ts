function isValidGoogleDriveUrl(url: string): boolean {
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

function sanitizeCsvField(field: any): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

const ARABIC_STATUS_LABELS: Record<string, string> = {
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

function testSuite() {
  console.log('====================================================');
  console.log('اختبارات الأمان والتحقق: المنصة التنظيمية للجنة الإعلامية');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[✓ PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[✗ FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Test Google Drive URL Validation
  assert(
    isValidGoogleDriveUrl('https://drive.google.com/drive/folders/1abcXYZ_test'),
    'التحقق من صحة رابط Google Drive مجلد'
  );
  assert(
    isValidGoogleDriveUrl('https://docs.google.com/document/d/1abcXYZ/edit'),
    'التحقق من صحة رابط Docs'
  );
  assert(
    !isValidGoogleDriveUrl('https://malicious-website.com/drive'),
    'رفض الروابط الخبيثة غير المنتمية لدومين قوقل'
  );

  // 2. Test CSV Formula Sanitization (OWASP)
  assert(
    sanitizeCsvField('=SUM(1,2)') === "'=SUM(1,2)",
    'حماية صيغ CSV المبتدئة بـ = (Formula Injection)'
  );
  assert(
    sanitizeCsvField('+CMD("calc")') === "'+CMD(\"calc\")",
    'حماية صيغ CSV المبتدئة بـ +'
  );
  assert(
    sanitizeCsvField('طلب عادي') === 'طلب عادي',
    'عدم تعديل النصوص العربية العادية'
  );

  // 3. Test Arabic Status Labels Dictionary
  const statusKeys = [
    'draft',
    'submitted',
    'under_review',
    'changes_requested',
    'approved',
    'rejected',
    'scheduled',
    'published',
    'archived',
    'cancelled',
  ];
  const allLabelsPresent = statusKeys.every((k) => !!ARABIC_STATUS_LABELS[k]);
  assert(allLabelsPresent, 'التحقق من اكتمال قاموس ترجمات الحالات باللغة العربية');

  console.log('\n----------------------------------------------------');
  console.log(`نتيجة الفحص الإجمالية: ${passed} نجاح / ${failed} فشل`);
  console.log('----------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testSuite();
