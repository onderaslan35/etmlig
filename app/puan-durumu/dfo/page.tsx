'use client';

import React, { useState, useEffect } from 'react';
import totalStandings from '@/app/data/standings.json';
import week1Data from '@/app/data/week1_predictions.json';
import week2Data from '@/app/data/week2_predictions.json';
import week3Data from '@/app/data/week3_predictions.json';

export default function DfoPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  const todaysMatches = [
    { id: 20, home: "IĞDIR FK", away: "KARAGÜMRÜK", time: "19:00", league: "TFF 1. LİG" },
    { id: 21, home: "SARIYER", away: "MUĞLASPOR", time: "19:00", league: "TFF 1. LİG" },
    { id: 22, home: "BODRUMSPOR", away: "BURSASPOR", time: "21:30", league: "TFF 1. LİG" },
    { id: 23, home: "VANSPOR FK", away: "KAYSERİSPOR", time: "21:30", league: "TFF 1. LİG" },
  ];

  useEffect(() => {
    if (activeTab === 'total') {
      const sorted = [...totalStandings].sort((a, b) => (b.puan || 0) - (a.puan || 0));
      setTableRows(sorted);
    } else {
      let currentData: any[] = [];
      if (activeTab === 'week1') currentData = week1Data || [];
      else if (activeTab === 'week2') currentData = week2Data || [];
      else if (activeTab === 'week3') currentData = week3Data || [];

      const getPuan = (u: any) => Number(u.puan !== undefined ? u.puan : u.score) || 0;

      const sorted = currentData
        .slice()
        .sort((a, b) => getPuan(b) - getPuan(a))
        .map((u, idx) => ({
          sira: idx + 1,
          name: u.name,
          puan: getPuan(u),
        }));

      setTableRows(sorted);
    }
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  const getActiveTabTitle = () => {
    if (activeTab === 'total') return 'DFO TOPLAM PUAN DURUMU';
    const weekNum = activeTab.replace('week', '');
    return `DFO ${weekNum}. HAFTA PUAN DURUMU`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-400 tracking-wider uppercase">
          ELİT TAHMİN DFO LİGİ
        </h1>
      </div>

      <div className="w-full mb-6 bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h2 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider">
              BUGÜNÜN MÜSABAKALARI ({todaysMatches.length} MAÇ)
            </h2>
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-full">
            📅 9 AĞUSTOS PAZAR
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-950">
          {todaysMatches.map((m) => (
            <div
              key={m.id}
              className="min-w-[220px] sm:min-w-[240px] flex-shrink-0 bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 transition-all duration-200 rounded-xl p-3 flex flex-col justify-between shadow-md"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1.5">
                <span className="text-amber-400/90 truncate">{m.league}</span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-black">
                  ⏰ {m.time}
                </span>
              </div>

              <div className="flex items-center justify-between my-1">
                <span className="font-extrabold text-xs text-slate-100 uppercase truncate w-2/5 text-left">
                  {m.home}
                </span>
                <span className="text-[9px] font-black text-slate-500 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                  VS
                </span>
                <span className="font-extrabold text-xs text-slate-100 uppercase truncate w-2/5 text-right">
                  {m.away}
                </span>
              </div>

              <div className="mt-1.5 text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800/80 pt-1">
                MAÇ #{m.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-xl w-full flex flex-col items-center mb-6 space-y-3">
        <button
          onClick={() => selectTab('total')}
          className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${
            activeTab === 'total'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          DFO TOPLAM PUAN DURUMU
        </button>

        <div className="w-full relative">
          <button
            onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)}
            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${
              activeTab !== 'total'
                ? 'bg-red-500 text-white border-red-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>📅 {getActiveTabTitle()}</span>
            <span className="text-xs transition-transform duration-200">
              {isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}
            </span>
          </button>

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
                          ? 'bg-red-500 text-white border-red-400 scale-105 shadow-sm'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-red-500/20 hover:text-red-300'
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

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 w-16 text-center">SIRA</th>
                  <th className="px-6 py-3.5">YARIŞMACI</th>
                  <th className="px-6 py-3.5 text-right">
                    {activeTab === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{row.name}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-amber-400 text-base">
                      {row.puan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">
            ⏳ {activeTab.replace('week', '')}. Haftanın verileri bulunamadı veya henüz hesaplanmadı.
          </div>
        )}
      </div>
    </div>
  );
}