'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import totalStandings from '@/app/data/standings.json';
import week1Data from '@/app/data/week1_predictions.json';
import week2Data from '@/app/data/week2_predictions.json';
import week3Data from '@/app/data/week3_predictions.json';

export default function DfoPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  useEffect(() => {
    if (activeTab === 'total') {
      // DFO toplam puan durumu: 15. maçın DFO'ya girmeyen puanları çıkarılarak hesaplanır
      const sorted = totalStandings.map((u: any) => {
        const w3User = week3Data.find((w: any) => w.id === u.id);
        const tffPuan = w3User && w3User.puan_tff !== undefined ? w3User.puan_tff : 0;
        return {
          ...u,
          puan: (u.puan || 0) - tffPuan,
        };
      }).sort((a, b) => b.puan - a.puan);

      setTableRows(sorted);
    } else {
      let currentData: any[] = [];
      if (activeTab === 'week1') currentData = week1Data || [];
      else if (activeTab === 'week2') currentData = week2Data || [];
      else if (activeTab === 'week3') {
        currentData = week3Data.map((u: any) => ({
          ...u,
          puan: u.puan_dfo !== undefined ? u.puan_dfo : u.puan,
        })) || [];
      }

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
    <div className="max-w-4xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="relative w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl mb-2">
        <Image src="/dfo-logo.png" alt="DFO Logosu" fill className="object-contain" priority />
      </div>

      <h1 className="text-xl md:text-2xl font-extrabold text-center mb-4 text-amber-400 tracking-wider uppercase">
        ELİT TAHMİN DFO LİGİ
      </h1>

      <div className="w-full max-w-xl flex flex-col items-center mb-6 space-y-3">
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
            <span>📅 {activeTab === 'total' ? 'HAFTA SEÇİNİZ' : getActiveTabTitle()}</span>
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
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 text-center">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
            {getActiveTabTitle()}
          </span>
        </div>

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
                      {row.puan} PTS
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