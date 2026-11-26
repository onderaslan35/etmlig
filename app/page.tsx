'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/yeni-arsiv');
  }, [router]);

  return <div className="min-h-screen bg-[#050b14]" />;
}