'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// TFF 3. HAFTA GÜNCEL PUAN VERİLERİ (15-19. MAÇLAR DAHİL)
const tffWeek3Data = [
  { id: 1, name: 'HAKAN AYAN', puan: 10 },
  { id: 2, name: 'GAZİ AYAN 🏆🏆', puan: 6 },
  { id: 3, name: 'ULAŞ ADIGÜZEL', puan: 5 },
  { id: 4, name: 'LEVENT YILDIRIM', puan: 5 },
  { id: 5, name: 'ÖNDER ASLAN', puan: 5 },
  { id: 6, name: 'SEDAT SEDAT', puan: 4 },
  { id: 7, name: 'MUHSİN ASİLKAN', puan: 4 },
  { id: 8, name: 'İSMAİL EKER 🏆', puan: 4 },
];

export default function TffPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('week3');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);

  const totalWeeks = Array.from({ length: 38 }, (_, i) => i + 1);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  const getActiveTabTitle = () => {
    if (activeTab === 'total') return 'TFF TOPLAM PUAN DURUMU';
    const weekNum = activeTab.replace('week', '');
    return `TFF ${weekNum}. HAFTA PUAN DURUMU`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      {/* TFF LOGOSU */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl mb-2">
        <Image
          src="/tff-logo.png"
          alt="TFF Logosu"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* ANA BAŞLIK */}
      <h1 className="text-xl md:text-2xl font-extrabold text-center mb-4 text-amber-400 tracking-wider uppercase">
        ELİT TAHMİN TFF LİGİ
      </h1>

      {/* BUTONLAR VE AÇILIR MENÜ ALANI */}
      <div className="w-full max-w-xl flex flex-col items-center mb-6 space-y-3">
        {/* TFF TOPLAM PUAN DURUMU BUTONU */}
        <button
          onClick={() => selectTab('total')}
          className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${
            activeTab === 'total'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          TFF TOPLAM PUAN DURUMU
        </button>

        {/* HAFTA SEÇİNİZ / HAFTALAR BUTONU */}
        <div className="w-full relative">
          <button
            onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)}
            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${
              activeTab !== 'total'
                ? 'bg-slate-900 text-white border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>📅 {activeTab === 'total' ? 'HAFTA SEÇİNİZ' : getActiveTabTitle()}</span>
            <span className="text-xs transition-transform duration-200">
              {isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}
            </span>
          </button>

          {/* HAFTA SEÇİM AÇILIR IZGARASI */}
          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="text-[11px] font-bold text-slate-400 mb-2 text-center uppercase tracking-wider border-b border-slate-800 pb-1">
                İncelemek İstediğiniz Haftayı Seçin
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {totalWeeks.map((weekNum) => {
                  const weekKey = `week${weekNum}`;
                  const isActive = activeTab === weekKey;
                  return (
                    <button
                      key={weekNum}
                      onClick={() => selectTab(weekKey)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all text-center ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-sm'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-amber-500/20 hover:text-amber-300'
                      }`}
                    >
                      {weekNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PUAN TABLOSU */}
      <div className="w-full bg-[#090d16] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-[#05080e] px-6 py-2.5 border-b border-slate-800/80 text-center">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
            {getActiveTabTitle()}
          </span>
        </div>

        {activeTab === 'week3' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#05080e]/90 text-slate-400 uppercase text-xs border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-3.5 w-16 text-center font-bold">SIRA</th>
                  <th className="px-6 py-3.5 font-bold">YARIŞMACI</th>
                  <th className="px-6 py-3.5 text-right font-bold">HAFTALIK PUAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {tffWeek3Data.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-100 tracking-wide">
                      {row.name}
                    </td>
                    <td className="px-6 py-3.5 text-right font-black text-amber-400 text-base">
                      {row.puan} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">
            ⏳ {activeTab === 'total' ? 'TFF Toplam Puan Tablosu' : `${activeTab.replace('week', '')}. Hafta`} verileri henüz işlenmedi.
          </div>
        )}
      </div>
    </div>
  );
}