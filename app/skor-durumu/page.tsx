'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import totalStandings from '@/app/data/standings.json';
import week1Data from '@/app/data/week1_predictions.json';
import week2Data from '@/app/data/week2_predictions.json';

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [week3Data, setWeek3Data] = useState<any[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const row1Weeks = Array.from({ length: 24 }, (_, i) => i + 1);
  const row2Weeks = Array.from({ length: 24 }, (_, i) => i + 25);

  useEffect(() => {
    fetch('/api/save-score')
      .then((res) => res.json())
      .then((data) => {
        if (data.predictions) setWeek3Data(data.predictions);
        else {
          import('@/app/data/week3_predictions.json').then((m) => setWeek3Data(m.default || []));
        }
      })
      .catch(() => {
        import('@/app/data/week3_predictions.json').then((m) => setWeek3Data(m.default || []));
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'total') {
      // Toplam Skor İsabetine göre sırala
      const sorted = [...totalStandings].sort((a, b) => (b.skor || 0) - (a.skor || 0) || (b.puan || 0) - (a.puan || 0));
      setTableRows(sorted);
    } else {
      let currentData: any[] = [];
      if (activeTab === 'week1') currentData = week1Data || [];
      else if (activeTab === 'week2') currentData = week2Data || [];
      else if (activeTab === 'week3') currentData = week3Data || [];

      const getPuan = (u: any) => Number(u.puan !== undefined ? u.puan : u.score) || 0;
      const getSkor = (u: any) => Number(u.skor !== undefined ? u.skor : u.exacts) || 0;

      const sorted = currentData
        .slice()
        .sort((a, b) => getSkor(b) - getSkor(a) || getPuan(b) - getPuan(a))
        .map((u, idx) => ({
          sira: idx + 1,
          name: u.name,
          skor: getSkor(u),
          puan: getPuan(u),
        }));

      setTableRows(sorted);
    }
  }, [activeTab, week3Data]);

  return (
    <div className="max-w-4xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6 text-amber-400 tracking-wider uppercase">
        SKOR DURUMU
      </h1>

      <div className="w-full flex flex-col items-center mb-6">
        <button
          onClick={() => setActiveTab('total')}
          className={`px-8 py-2.5 rounded-xl font-bold text-sm md:text-base transition-all duration-200 border w-full max-w-md text-center shadow-md mb-4 ${
            activeTab === 'total'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-105'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          TOPLAM SKOR DURUMU
        </button>

        <div className="w-full bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-lg space-y-2">
          <div className="grid grid-cols-12 md:grid-cols-24 gap-1 w-full">
            {row1Weeks.map((weekNum) => {
              const weekKey = `week${weekNum}`;
              const isActive = activeTab === weekKey;
              return (
                <button
                  key={weekNum}
                  onClick={() => setActiveTab(weekKey)}
                  className={`py-1.5 text-xs font-semibold rounded-md border transition-all text-center ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold scale-110 shadow-sm z-10'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  title={`${weekNum}. Hafta Skor Durumu`}
                >
                  {weekNum}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-12 md:grid-cols-24 gap-1 w-full">
            {row2Weeks.map((weekNum) => {
              const weekKey = `week${weekNum}`;
              const isActive = activeTab === weekKey;
              return (
                <button
                  key={weekNum}
                  onClick={() => setActiveTab(weekKey)}
                  className={`py-1.5 text-xs font-semibold rounded-md border transition-all text-center ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold scale-110 shadow-sm z-10'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  title={`${weekNum}. Hafta Skor Durumu`}
                >
                  {weekNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">Sıra</th>
                  <th className="px-6 py-4">Yarışmacı</th>
                  <th className="px-6 py-4 text-right">TOPLAM TAM SKOR İSABETİ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{row.name}</td>
                    <td className="px-6 py-3.5 text-right font-black text-emerald-400 text-base">
                      {row.skor !== undefined ? row.skor : (row.exacts || 0)} Adet
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-medium">
            ⏳ {activeTab.replace('week', '')}. Haftanın skor verileri bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}