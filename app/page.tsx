import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black relative overflow-hidden">
      
      {/* ARKA PLAN EFEKTLERİ */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* MERKEZİ İÇERİK ALANI */}
      <div className="text-center w-full max-w-4xl relative z-10 flex flex-col items-center">
        
        {/* ÜST ROZET */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/30 text-amber-500 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          RESMİ WEB PLATFORMU
        </div>

        {/* ANA BAŞLIK */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          ELİT TAHMİN <br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">MASTER LİGİ</span>
        </h1>

        {/* MANİFESTO VE BİLGİLENDİRME (Daha şık, daha elit) */}
        <div className="max-w-2xl mx-auto space-y-6 text-slate-300 text-sm sm:text-base md:text-lg font-medium leading-relaxed mt-4 bg-slate-900/40 p-6 sm:p-10 rounded-2xl border border-slate-800/50 shadow-2xl backdrop-blur-sm">
          
          <p className="text-slate-200 font-semibold text-base sm:text-xl border-b border-slate-700/50 pb-4 mb-4">
            Avrupa'nın ve Türkiye'nin devler sahnesindeki mücadeleleri, kendi aramızda bir şölene dönüştürüyoruz.
          </p>

          <p>
            Burası; strateji, öngörü ve futbol zekasının buluşma noktasıdır. Sıradan tahminlerin ötesine geçen, sadece en iyilerin rekabet edebildiği bir platformdasınız.
          </p>

          <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4 mt-6 text-left">
            <h3 className="text-amber-500 text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
              <span>⚠️</span> SİSTEM BİLGİLENDİRMESİ
            </h3>
            <ul className="text-slate-400 text-xs sm:text-sm space-y-2 list-disc list-inside">
              <li>Bu platform tamamen kapalı devre ve dostlar arası eğlence amaçlıdır.</li>
              <li>Hiçbir şekilde ticari, yasadışı bahis veya kumar faaliyeti içermez.</li>
              <li>Puan durumları, skor kontrolleri ve fikstür arşivi için lütfen <strong className="text-slate-200">üst menüyü</strong> kullanınız.</li>
            </ul>
          </div>
        </div>

        {/* YÖNLENDİRME METNİ */}
        <div className="mt-12 animate-pulse">
          <p className="text-slate-500 text-xs sm:text-sm tracking-widest uppercase font-medium">
            İŞLEMLER İÇİN YUKARIDAKİ MENÜYÜ KULLANINIZ
          </p>
          <div className="mt-2 text-slate-600">▲</div>
        </div>

      </div>
    </div>
  );
}