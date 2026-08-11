'use client';

import React, { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // 🔴 EKMEL ŞİFRESİ: Anahtar kelimeyi buradan istediğin gibi değiştirebilirsin!
  // Şu anki şifre: ekmel
  const ADMIN_PASSWORD = "ekmel"; 

  useEffect(() => {
    // Sayfa yüklendiğinde daha önce şifre girilmiş mi kontrol et
    const authStatus = sessionStorage.getItem('ekmel_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('ekmel_admin_auth', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  // Yüklenirken ekran titremesin diye boş ekran
  if (isAuthenticated === null) return <div className="min-h-screen bg-[#020617]"></div>;

  // ⛔ ŞİFRE GİRİLMEDİYSE ÇIKACAK OLAN SİYAH DUVAR
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md w-full text-center relative overflow-hidden">
          
          {/* Üstteki Kırmızı Alarm Işığı Efekti */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)]"></div>
          
          <div className="mb-8 mt-4">
            <span className="text-5xl drop-shadow-lg">🔐</span>
            <h1 className="text-2xl font-black text-amber-500 mt-6 uppercase tracking-widest drop-shadow-md">YETKİSİZ ERİŞİM</h1>
            <p className="text-slate-400 text-sm mt-3 font-medium">Kök Komuta Merkezine girmek için yönetici kilit kodu gereklidir.</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Şifreyi Girin" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-3.5 text-center text-white text-xl tracking-[0.3em] font-black focus:outline-none focus:border-amber-500 shadow-inner"
            />
            {error && <p className="text-red-500 text-xs font-bold animate-pulse">❌ Hatalı şifre, sistem kilitli!</p>}
            
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] mt-2">
              KİLİDİ AÇ
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ Şifre doğruysa Admin paneli sayfalarını göster
  return <div className="admin-wrapper">{children}</div>;
}