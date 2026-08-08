'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function TffPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [tffStandings, setTffStandings] = useState<any[]>([]);

  const row1Weeks = Array.from({ length: 24 }, (_, i) => i + 1);
  const row2Weeks = Array.from({ length: 24 }, (_, i) => i + 25);

  // Henüz oynanmış/tamamlanmış TFF maçı olmadığı için tablo sıralamasını boş tutuyoruz
  useEffect(() => {
    // TFF verileri geldikten sonra buradaki dizi güncellenecektir
    setTffStandings([]);
  }, [activeTab]);

  return (
    <div className="max-w-4xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      {/* 1. LOGO */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl mb-2">
        <Image src="/tff-logo.png" alt="TFF Logosu" fill className="object-contain" priority />
      </div>

      {/* 2. ANA BAŞLIK */}
      <h1 className="text-xl md:text-2xl font-extrabold text-center mb-4 text-amber-400 tracking-wider uppercase">
        TÜRKİYE FUTBOL FEDERASYONU (TFF)
      </h1>

      {/* 3. SEKMELER VE HAFTA SEÇİMLERİ */}
      <div className="w-full flex flex-col items-center mb-6">
        {/* PUAN DURUMU BUTONU */}
        <button
          onClick={() => setActiveTab('total')}
          className={`px-8 py-2 rounded-xl font-bold text-sm md:text-base transition-all duration-200 border w-full max-w-xl text-center shadow-md mb-3 uppercase ${
            activeTab === 'total'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-105'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          PUAN DURUMU
        </button>

        {/* ARA BAŞLIK: HAFTALAR */}
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
          HAFTALAR
        </span>

        {/* HAFTA BUTONLARI IZGARASI */}
        <div className="w-full bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-lg space-y-2">
          {/* 1. SATIR: 1 - 24 */}
          <div className="grid grid-cols-12 md:grid-cols-24 gap-1 w-full">
            {row1Weeks.map((weekNum) => {
              const weekKey = `week${weekNum}`;
              const isActive = activeTab === weekKey;
              return (
                <button
                  key={weekNum}
                  onClick={() => setActiveTab(weekKey)}
                  className={`py-1 text-xs font-bold rounded-md border transition-all text-center ${
                    isActive
                      ? 'bg-red-500 text-white border-red-400 scale-110 shadow-sm z-10'
                      : 'bg-slate-950/80 text-red-400 border-slate-800 hover:bg-slate-800 hover:text-red-300'
                  }`}
                  title={`${weekNum}. Hafta TFF Puan Durumu`}
                >
                  {weekNum}
                </button>
              );
            })}
          </div>

          {/* 2. SATIR: 25 - 48 */}
          <div className="grid grid-cols-12 md:grid-cols-24 gap-1 w-full">
            {row2Weeks.map((weekNum) => {
              const weekKey = `week${weekNum}`;
              const isActive = activeTab === weekKey;
              return (
                <button
                  key={weekNum}
                  onClick={() => setActiveTab(weekKey)}
                  className={`py-1 text-xs font-bold rounded-md border transition-all text-center ${
                    isActive
                      ? 'bg-red-500 text-white border-red-400 scale-110 shadow-sm z-10'
                      : 'bg-slate-950/80 text-red-400 border-slate-800 hover:bg-slate-800 hover:text-red-300'
                  }`}
                  title={`${weekNum}. Hafta TFF Puan Durumu`}
                >
                  {weekNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PUAN TABLOSU / BİLGİLENDİRME */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tffStandings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">SIRA</th>
                  <th className="px-6 py-4">YARIŞMACI</th>
                  <th className="px-6 py-4 text-right">
                    {activeTab === 'total' ? 'TOPLAM TFF PUANI' : 'HAFTALIK TFF PUANI'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tffStandings.map((row, idx) => (
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
          <div className="py-12 text-center text-slate-500 font-medium">
            ⏳ {activeTab === 'total' ? 'Henüz TFF puanı hesaplanmadı.' : `${activeTab.replace('week', '')}. Haftanın TFF verileri bulunamadı.`}
          </div>
        )}
      </div>
    </div>
  );
}