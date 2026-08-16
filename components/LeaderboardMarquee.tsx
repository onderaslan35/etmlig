'use client';
import React from 'react';

export default function LeaderboardMarquee() {
  return (
    <>
      {/* 🔴 HİÇBİR AYAR DOSYASINA İHTİYAÇ BIRAKMAYAN İÇ CSS MOTORU 🔴 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes kayan-yazi {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .bant-animasyonu {
          display: flex;
          white-space: nowrap;
          animation: kayan-yazi 25s linear infinite;
        }
        /* Fareyle üzerine gelince yazı dursun ki okuyabilsinler */
        .bant-animasyonu:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="w-full bg-slate-950 border-y border-slate-800 py-2 sm:py-2.5 overflow-hidden shadow-lg shadow-black/50 relative flex items-center">
        
        {/* SABİT ŞEREF KÜRSÜSÜ ETİKETİ */}
        <div className="absolute left-0 z-20 bg-slate-950 h-full flex items-center px-3 sm:px-4 border-r border-amber-900/50 shadow-[5px_0_15px_rgba(0,0,0,0.8)]">
          <span className="text-amber-500 text-[10px] sm:text-xs font-black tracking-widest flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-sm sm:text-base animate-pulse">👑</span> ŞEREF KÜRSÜSÜ
          </span>
        </div>

        {/* KAYAN BANT (Sonsuz Döngü) */}
        <div className="bant-animasyonu pl-[140px] sm:pl-[170px]">
          
          {/* LİDERLER GRUBU (1. KOPYA) */}
          <div className="flex items-center">
            <span className="inline-flex items-center mx-6 gap-2">
              <span className="text-amber-500 font-black text-[10px] sm:text-xs tracking-widest">MASTER LİDERİ:</span>
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                MEHMET ALİ KARA <span className="text-amber-400">(53 Puan)</span>
              </span>
            </span>
            <span className="text-slate-700 text-sm">|</span>

            <span className="inline-flex items-center mx-6 gap-2">
              <span className="text-blue-400 font-black text-[10px] sm:text-xs tracking-widest">DFO LİDERİ:</span>
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]">
                EYÜP KARACAOĞLU <span className="text-blue-300">(40 Puan)</span>
              </span>
            </span>
            <span className="text-slate-700 text-sm">|</span>

            <span className="inline-flex items-center mx-6 gap-2">
              <span className="text-red-500 font-black text-[10px] sm:text-xs tracking-widest">TFF LİDERİ:</span>
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                İSMAİL EKER <span className="text-red-400">(21 Puan)</span>
              </span>
            </span>
            <span className="text-slate-700 text-sm">|</span>

            <span className="inline-flex items-center mx-6 gap-2">
              <span className="text-emerald-500 font-black text-[10px] sm:text-xs tracking-widest">SKOR KRALI:</span>
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                DOĞAÇ ALKAN <span className="text-emerald-400">(13 İsabet)</span>
              </span>
            </span>
            <span className="text-slate-700 text-sm mx-6">|</span>
          </div>

          {/* LİDERLER GRUBU (2. KOPYA - KESİNTİSİZ DÖNGÜ İÇİN AYNI KOD TEKRARI) */}
          <div className="flex items-center">
            <span className="inline-flex items-center mx-6 gap-2">
              <span className="text-amber-500 font-black text-[10px] sm:text-xs tracking-widest">MASTER LİDERİ:</span>
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                MEHMET ALİ KARA <span className="text-amber-400">(53 Puan)</span>
              </span>
            </span>
            <span className="text-slate-700 text-sm">|</span>

            <span className="inline-flex items-center mx-6 gap-2">
              <span className="text-blue-400 font-black text-[10px] sm:text-xs tracking-widest">DFO LİDERİ:</span>
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]">
                EYÜP KARACAOĞLU <span className="text-blue-300">(40 Puan)</span>
              </span>
            </span>
            <span className="text-slate-700 text-sm">|</span>

            <span className="inline-flex items-center mx-6 gap-2">
              <span className="text-red-500 font-black text-[10px] sm:text-xs tracking-widest">TFF LİDERİ:</span>
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                İSMAİL EKER <span className="text-red-400">(21 Puan)</span>
              </span>
            </span>
            <span className="text-slate-700 text-sm">|</span>

            <span className="inline-flex items-center mx-6 gap-2">
              <span className="text-emerald-500 font-black text-[10px] sm:text-xs tracking-widest">SKOR KRALI:</span>
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                DOĞAÇ ALKAN <span className="text-emerald-400">(13 İsabet)</span>
              </span>
            </span>
            <span className="text-slate-700 text-sm mx-6">|</span>
          </div>

        </div>
      </div>
    </>
  );
}