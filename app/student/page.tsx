'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Redirecting to student dashboard...</p>
      </div>
    </div>
  );
}