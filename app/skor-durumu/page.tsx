'use client';

import React, { useState, useEffect } from 'react';
import totalStandings from '@/app/data/standings.json';
import week1Data from '@/app/data/week1_predictions.json';
import week2Data from '@/app/data/week2_predictions.json';
import week3Data from '@/app/data/week3_predictions.json';

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  useEffect(() => {
    if (activeTab === 'total') {
      // Genel Toplam Skor Sıralaması
      const sorted = totalStandings
        .slice()
        .sort((a, b) => (b.skor || 0) - (a.skor || 0))
        .map((u, idx) => ({
          sira: idx + 1,
          name: u.name,
          skor: u.skor || 0,
        }));
      setTableRows(sorted);
    } else {
      // Haftalık Skor Sıralaması
      let currentData: any[] = [];
      if (activeTab === 'week1') currentData = week1Data || [];
      else if (activeTab === 'week2') currentData = week2Data || [];
      else if (activeTab === 'week3') currentData = week3Data || [];

      const getSkor = (u: any) => Number(u.skor !== undefined ? u.skor : 0);

      const sorted = currentData
        .slice()
        .sort((a, b) => getSkor(b) - getSkor(a))
        .map((u, idx) => ({
          sira: idx + 1,
          name: u.name,
          skor: getSkor(u),
        }));

      setTableRows(sorted);
    }
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  const getActiveTabTitle = () => {
    if (activeTab === 'total') return 'GENEL SKOR İSABET DURUMU';
    const weekNum = activeTab.replace('week', '');
    return `${weekNum}. HAFTA SKOR İSABET DURUMU`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      {/* Başlık */}
      <div className="text-3xl mb-1">🎯</div>
      <h1 className="text-xl md:text-2xl font-extrabold text-center mb-4 text-emerald-400 tracking-wider uppercase">
        ELİT TAHMİN SKOR İSABET KRALLIĞI
      </h1>

      {/* Butonlar & Açılır Menü (Akordeon Dropdown) */}
      <div className="w-full max-w-xl flex flex-col items-center mb-6 space-y-3">
        {/* Toplam Skor Butonu */}
        <button
          onClick={() => selectTab('total')}
          className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${
            activeTab === 'total'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          TOPLAM SKOR İSABET DURUMU
        </button>

        {/* Haftalık Seçim Akordeon Dropdown Butonu */}
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

          {/* Akordeon Açılır Kutu */}
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

      {/* Tablo Yapısı */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 text-center">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
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
                    {activeTab === 'total' ? 'TOPLAM İSABET' : 'HAFTALIK İSABET'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{row.name}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-400 text-base">
                      {row.skor} SKOR
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">
            ⏳ {activeTab.replace('week', '')}. Haftanın skor verileri bulunamadı veya henüz girilmedi.
          </div>
        )}
      </div>
    </div>
  );
}