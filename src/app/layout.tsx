import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'المنصة التنظيمية للجنة الإعلامية - برنامج الشراكة الطلابية',
  description: 'المنصة الرسمية المعتمدة لاستقبال وتنسيق ومراجعة طلبات النشر الإعلامي للمبادرات الطلابية بصنع اللجنة التقنية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="min-h-screen">
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#023793] selection:text-white">
        {children}
      </body>
    </html>
  );
}

