'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // E-Posta veya sadece ID girilmesini destekler (262728 veya 262728@admin.com)
    const cleanId = adminId.split('@')[0].trim();

    if (cleanId === '262728' && password === '24351324') {
      localStorage.setItem('adminSession', JSON.stringify({
        id: '262728',
        name: 'ÖNDER ASLAN',
        role: 'SUPER_ADMIN',
        loginTime: new Date().toISOString()
      }));
      
      router.push('/admin');
    } else {
      setErrorMsg('Hatalı Yönetici ID/E-posta veya Şifre!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <span className="text-3xl">🛡️</span>
          <h1 className="text-xl font-black text-amber-400 mt-2 uppercase tracking-wider">
            YÖNETİCİ GİRİŞİ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Elit Tahmin Ligleri Yönetim Paneli
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-bold rounded-xl text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Yönetici ID / E-Posta
            </label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Örn: 262728"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Yönetici Şifresi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 uppercase tracking-wider text-sm"
          >
            SİSTEME GİRİŞ YAP
          </button>
        </form>
      </div>
    </div>
  );
}