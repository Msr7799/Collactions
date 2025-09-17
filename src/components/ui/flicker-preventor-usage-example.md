// مثال للاستخدام في src/components/layout/Layout.tsx
// أو أي layout آخر

import FlickerPreventor from '@/components/ui/flicker-preventor';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <FlickerPreventor 
      threshold={150}        // حد كشف الوميض
      delay={15}            // تأخير التحديث بالميللي ثانية
      enableLogging={true}  // تفعيل السجلات
      className="min-h-screen"
    >
      {children}
    </FlickerPreventor>
  );
}

// أو لاستخدام محدد في صفحة معينة:
import FlickerPreventor from '@/components/ui/flicker-preventor';

export default function HomePage() {
  return (
    <FlickerPreventor>
      <div className="content">
        {/* محتوى الصفحة */}
      </div>
    </FlickerPreventor>
  );
}