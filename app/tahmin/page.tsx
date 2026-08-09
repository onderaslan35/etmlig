'use client';

import dynamic from 'next/dynamic';

const TahminContent = dynamic(() => import('./TahminContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      Yükleniyor...
    </div>
  ),
});

export default function Page() {
  return <TahminContent />;
}