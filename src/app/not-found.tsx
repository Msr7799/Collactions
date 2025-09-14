import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-[#00d4ff]">404</h1>
        <h2 className="text-2xl font-semibold">
          Page Not Found | الصفحة غير موجودة
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <p className="text-gray-400 max-w-md mx-auto">
          الصفحة التي تبحث عنها قد تكون محذوفة أو تم تغيير اسمها أو غير متاحة مؤقتاً.
        </p>
        <Link 
          href="/"
          className="inline-block bg-[#00d4ff] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#00a8cc] transition-colors duration-200"
        >
          Go Home | العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
