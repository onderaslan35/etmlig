'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');
  const [allData, setAllData] = useState<any[]>([]);

  const loadSkorData = async () => {
    const { data } = await supabase.from('live_leaderboard').select('*');
    if (data) setAllData(data);
  };

  useEffect(() => {
    loadSkorData();
    const channel = supabase.channel('skor_live_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => { loadSkorData(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Hangi sekmedeysek o sekmeye ait puan, ok yönü ve ok sayısını alıp sıralıyoruz
  const currentList = allData.map(r => {
    if (activeTab === 'DFO') {
      return { name: r.name, score: r.dfo_skor_pts || 0, trend: r.dfo_skor_trend_direction || 'same', diff: r.dfo_skor_trend_diff || 0 };
    } else if (activeTab === 'TFF') {
      return { name: r.name, score: r.tff_skor_pts || 0, trend: r.tff_skor_trend_direction || 'same', diff: r.tff_skor_trend_diff || 0 };
    }
    return { name: r.name, score: r.skor_pts || 0, trend: r.skor_trend_direction || 'same', diff: r.skor_trend_diff || 0 };
  }).sort((a,b) => b.score - a.score || a.name.localeCompare(b.name, 'tr'));

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md px-2">
          ELİT TAHMİN SKOR TAM İSABET BARAJ MERKEZİ
        </h1>
      </div>

      <div className="w-full max-w-3xl mx-auto mt-2">
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => setActiveTab('MASTER')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'MASTER' ? 'bg-amber-600 text-white border-amber-400 scale-105 shadow-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🏆 MASTER</button>
          <button onClick={() => setActiveTab('DFO')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'DFO' ? 'bg-blue-600 text-white border-blue-400 scale-105 shadow-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🌍 DFO</button>
          <button onClick={() => setActiveTab('TFF')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'TFF' ? 'bg-red-600 text-white border-red-400 scale-105 shadow-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🇹🇷 TFF</button>
        </div>

        <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6 border border-[#1e293b]">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
              <span>🎯</span>
              <span>{activeTab === 'MASTER' ? 'MASTER' : activeTab === 'DFO' ? 'DFO' : 'TFF'} TAM İSABET SAYISI</span>
            </div>
          </div>
          {allData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                  <tr>
                    <th className="pl-2 md:pl-4 pr-1 py-3 w-12 md:w-16 text-left">SIRA</th>
                    <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                    <th className="pr-2 md:pr-4 pl-1 py-3 text-center whitespace-nowrap">TAM İSABET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {currentList.map((row: any, idx: number) => {
                    const trend = row.trend || 'same';
                    const trendDiff = row.trendDiff || 0;
                    return (
                    <tr key={idx} className="hover:bg-[#0f172a]/40 transition-colors">
                      <td className="pl-2 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-middle">
                        <div className="flex items-center gap-1">
                          <span className="w-4 text-left">{idx + 1}</span>
                          <span className="text-[#475569]">-</span>
                          <div className="w-5 flex justify-center">
                            {trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5 animate-bounce">▲ <span className="text-[8px]">{trendDiff}</span></span>}
                            {trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5">▼ <span className="text-[8px]">{trendDiff}</span></span>}
                            {trend === 'same' && <span className="text-transparent text-[8px]">-</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-3 align-middle"><div className="flex flex-wrap items-center gap-2 text-white font-semibold"><span className="whitespace-nowrap">{row.name}</span></div></td>
                      <td className={`pr-2 md:pr-4 pl-1 py-3 text-center font-bold text-sm align-middle ${activeTab === 'MASTER' ? 'text-amber-500' : activeTab === 'DFO' ? 'text-blue-400' : 'text-red-500'}`}>{row.score}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          ) : ( <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Skorlar hesaplanıyor...</div> )}
        </div>
      </div>
    </div>
  );
}