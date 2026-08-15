'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [showManifesto, setShowManifesto] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ZİHİN ÇİPİ (Local Storage) KONTROLÜ
  useEffect(() => {
    const isRead = localStorage.getItem('manifesto_read');
    if (!isRead) {
      setShowManifesto(true);
    }
    setIsLoaded(true);
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem('manifesto_read', 'true');
    setShowManifesto(false);
  };

  // Sayfa yüklenmeden (kırpışma olmasın diye) boş siyah ekran döndür
  if (!isLoaded) return <div className="min-h-screen bg-[#050b14]"></div>;

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900 flex flex-col relative overflow-hidden">
      
      {/* Arka Plan Efektleri */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-600/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* ÜST VİTRİN (HERO SECTION) */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 z-10 relative mt-10">
        
        <div className="text-center mb-8 max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-block mb-4">
             <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
               Resmi Web Platformu
             </span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-2xl">
            ELİT TAHMİN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">MASTER LİGİ</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Avrupa'nın ve Türkiye'nin devler sahnesindeki mücadeleleri kendi aramızda bir şölene dönüştürüyoruz. Strateji, öngörü ve futbol zekasının buluşma noktası.
          </p>
        </div>

        {/* 🔴 MANİFESTO KARTI (SADECE ONAYLAMAYANLARA GÖRÜNÜR) 🔴 */}
        {showManifesto && (
          <div className="w-full max-w-3xl bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 sm:p-8 mb-10 shadow-[0_0_30px_rgba(245,158,11,0.1)] backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-3 mb-3 border-b border-slate-700/50 pb-3">
               <span className="text-2xl">⚠️</span>
               <h2 className="text-white font-bold text-base sm:text-lg tracking-wide">KAMUOYU BİLGİLENDİRMESİ VE MANİFESTO</h2>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed text-justify mb-5">
              Bu web sitesi (<strong className="text-amber-400">etmlig.com.tr</strong>) <u>kesinlikle bir bahis, kumar veya şans oyunları platformu değildir.</u> Herhangi bir resmi veya gayriresmi bahis kurumuyla, Spor Toto teşkilatıyla veya finansal bir organizasyonla hiçbir bağlantısı bulunmamaktadır. 
              <br/><br/>
              Platformumuz; futbol tutkunu, birbirini sosyal hayattan tanıyan kapalı bir arkadaş grubunun, kendi aralarında futbol bilgisi ve öngörülerini sınamak, eğlenmek ve tatlı bir rekabet ortamı yaratmak amacıyla oluşturdukları <strong>tamamen ücretsiz ve sosyal bir etkinliktir.</strong> Sistemde hiçbir şekilde para yatırma, çekme veya maddi ödül vaadi bulunmamaktadır.
            </p>
            <div className="flex justify-center sm:justify-end">
              <button 
                onClick={handleAcknowledge}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105"
              >
                ✓ Okudum, Anladım (Bir Daha Gösterme)
              </button>
            </div>
          </div>
        )}

        {/* GİRİŞ KAPILARI (NAVİGASYON) */}
        <div className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 ${!showManifesto ? 'mt-8' : ''}`}>
          
          <Link href="/puan-durumu/master" className="group block bg-gradient-to-br from-slate-900 to-[#0a1120] border border-slate-700 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>
            <div className="text-4xl mb-4 drop-shadow-md">🏆</div>
            <h3 className="text-lg font-black text-white mb-2 tracking-wide group-hover:text-amber-400 transition-colors">PUAN DURUMLARI</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Master Lig, DFO ve TFF liglerindeki güncel sıralamalar, kazanılan puanlar ve dev rekabet tablosu.
            </p>
            <div className="mt-4 text-amber-500 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
              Tablolara Git <span className="text-lg leading-none">→</span>
            </div>
          </Link>

          <Link href="/mac-arsivi" className="group block bg-gradient-to-br from-slate-900 to-[#0a1120] border border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
            <div className="text-4xl mb-4 drop-shadow-md">📅</div>
            <h3 className="text-lg font-black text-white mb-2 tracking-wide group-hover:text-indigo-400 transition-colors">FİKSTÜR & ARŞİV</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Haftanın güncel maç bülteni, oynanacak karşılaşmalar, geçmiş maç sonuçları ve skor detayları.
            </p>
            <div className="mt-4 text-indigo-400 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
              Bültene Göz At <span className="text-lg leading-none">→</span>
            </div>
          </Link>

          <Link href="/tahminler" className="group block bg-gradient-to-br from-slate-900 to-[#0a1120] border border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="text-4xl mb-4 drop-shadow-md">🎯</div>
            <h3 className="text-lg font-black text-white mb-2 tracking-wide group-hover:text-emerald-400 transition-colors">TAHMİN KONTROL</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Yarışmacıların haftalık skor öngörüleri, yapılan resmi tahminler ve kimin ne dediği burada.
            </p>
            <div className="mt-4 text-emerald-400 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
              Tahminleri İncele <span className="text-lg leading-none">→</span>
            </div>
          </Link>

        </div>
      </main>

      {/* ALT BİLGİ (FOOTER) & GİZLİ ADMİN GİRİŞİ */}
      <footer className="mt-auto border-t border-slate-800/60 bg-[#02050a] py-6 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="text-slate-500 text-xs">
             &copy; 2026 Elit Tahmin Master Ligi. Tüm hakları gizlidir.
           </div>
           <Link href="/admin" className="text-slate-700 hover:text-amber-500 text-[10px] font-mono tracking-widest uppercase transition-colors flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block hover:bg-amber-500"></span> Sistem Yönetimi
           </Link>
        </div>
      </footer>

    </div>
  );
}