'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TahminPortal() {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 3, minutes: 13, seconds: 29 });
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  // Geri sayım motoru
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Giriş işlemleri buraya eklenecek
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center pt-12 p-4 font-sans">
      {/* 🔴 YENİ BAŞLIK 🔴 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-amber-500 uppercase tracking-widest" style={{ textShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}>
          ELİT TAHMİN MASTER LİGİ TAHMİN PORTALI
        </h1>
        <p className="text-slate-400 mt-4 text-sm md:text-base">Lütfen yapmak istediğiniz işlemi seçin.</p>
      </div>

      {/* 🔴 3'LÜ KART SİSTEMİ 🔴 */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        
        {/* KUTU 1: RESMİ DEKLARASYON */}
        <div className="bg-[#0b1120] border border-blue-900/30 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(30,58,138,0.1)] hover:border-blue-500/50 transition-all group">
          <div className="w-20 h-20 bg-[#1e293b] rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">
            📜
          </div>
          <h2 className="text-xl font-black text-blue-400 uppercase tracking-wider mb-3">RESMİ DEKLARASYON</h2>
          <p className="text-slate-400 text-sm mb-8 flex-grow px-2">Geçmiş haftaların tahmin arşivini ve resmi oyuncu listelerini inceleyin.</p>
          <Link href="/admin/tahminler" className="w-full py-3 px-6 rounded-xl bg-blue-900/20 text-blue-400 border border-blue-800/50 font-bold uppercase tracking-widest text-sm hover:bg-blue-600 hover:text-white transition-colors">
            ARŞİVE GİRİŞ YAP
          </Link>
        </div>

        {/* KUTU 2: 5. HAFTA GİRİŞLERİ (Giriş Formu) */}
        <div className="bg-[#0b1120] border border-amber-500/30 rounded-[2rem] p-8 relative flex flex-col shadow-[0_0_30px_rgba(245,158,11,0.1)] mt-6 md:mt-0">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#020617] border border-amber-500/50 px-6 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <span className="text-amber-500 font-black text-sm tracking-widest uppercase">5. HAFTA GİRİŞLERİ</span>
          </div>
          
          <div className="text-center mt-4 mb-6">
            <p className="text-slate-300 text-xs font-bold tracking-wider mb-1">AÇILIŞ: <span className="text-slate-100">14.08.2026 - 21:00</span></p>
            <p className="text-red-400 text-xs font-bold tracking-wider">KAPANIŞ: <span className="text-red-300">17.08.2026 - 21:00</span></p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <TimeUnit value={timeLeft.days} label="GÜN" />
            <span className="text-slate-500 font-black text-2xl self-start mt-2">:</span>
            <TimeUnit value={timeLeft.hours} label="SAAT" />
            <span className="text-slate-500 font-black text-2xl self-start mt-2">:</span>
            <TimeUnit value={timeLeft.minutes} label="DAKİKA" />
            <span className="text-slate-500 font-black text-2xl self-start mt-2">:</span>
            <TimeUnit value={timeLeft.seconds} label="SANİYE" />
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-auto">
            <input 
              type="text" 
              placeholder="Yarışmacı ID" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-[#020617] border border-slate-700 text-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-center font-bold tracking-widest transition-all"
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#020617] border border-slate-700 text-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-center font-bold tracking-widest transition-all"
            />
            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-[#020617] font-black text-sm uppercase tracking-widest py-4 rounded-xl mt-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]">
              SİSTEME GİRİŞ YAP
            </button>
          </form>
        </div>

        {/* KUTU 3: TAHMİNMATİK */}
        <div className="bg-[#0b1120] border border-emerald-900/30 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-emerald-500/50 transition-all group mt-6 md:mt-0">
          <div className="w-20 h-20 bg-[#1e293b] rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">
            ⚡
          </div>
          <h2 className="text-xl font-black text-emerald-400 uppercase tracking-wider mb-3">TAHMİNMATİK</h2>
          <p className="text-slate-400 text-sm mb-8 flex-grow px-2">Yapay zeka ve istatistik destekli otomatik skor tahmin motoru ile olasılıkları analiz edin.</p>
          <Link href="/tahminmatik" className="w-full py-3 px-6 rounded-xl bg-emerald-900/20 text-emerald-400 border border-emerald-800/50 font-bold uppercase tracking-widest text-sm hover:bg-emerald-600 hover:text-white transition-colors">
            TAHMİNMATİK'İ BAŞLAT
          </Link>
        </div>

      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-14 md:w-14 md:h-16 bg-[#020617] border border-slate-700 rounded-lg flex items-center justify-center shadow-inner mb-2">
        <span className="text-xl md:text-2xl font-black text-white">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">{label}</span>
    </div>
  );
}