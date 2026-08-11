'use client';

import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA 🏆🏆",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA 🏆", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN 🏆🏆", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN 🏆", "262714": "İSMAİL EKER 🏆", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY"
};

const skorWeek1Data: Record<string, number> = { "262755": 6, "262736": 4, "262719": 4, "262756": 4, "262754": 4, "262732": 4, "262786": 3, "262731": 3, "262717": 3, "262726": 3, "262747": 3, "262718": 3, "262750": 2, "262771": 2, "262816": 2, "262728": 2, "262714": 2, "262709": 2, "262790": 1, "262733": 1, "262721": 1 };
const skorWeek2Data: Record<string, number> = { "262790": 4, "262728": 4, "262756": 3, "262726": 3, "262714": 3, "262755": 2, "262709": 2, "262711": 2, "262717": 2, "262737": 2, "262705": 2, "262816": 2, "262763": 2, "262736": 2, "262786": 2, "262754": 1, "262732": 1, "262721": 1, "262733": 1 };
const skorWeek3Data: Record<string, number> = { "262816": 5, "262721": 4, "262754": 4, "262733": 3, "262707": 3, "262763": 3, "262813": 3, "351925": 3, "262702": 3, "262782": 3, "262771": 2, "262706": 2, "262734": 2, "262756": 2, "262755": 2, "262726": 2, "262728": 2, "262736": 1, "262786": 1, "262790": 1, "262732": 1, "262714": 1, "262709": 1 };

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  const loadLeaderboard = () => {
    const liveLeaderboard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');

    if (activeTab === 'total') {
      const baseList = Object.keys(allPlayersList).map(id => {
        const baseSkor = (skorWeek1Data[id] || 0) + (skorWeek2Data[id] || 0) + (skorWeek3Data[id] || 0);
        return { id, baseSkor, name: allPlayersList[id] };
      }).sort((a, b) => b.baseSkor - a.baseSkor || a.name.localeCompare(b.name));

      const prevRanks: Record<string, number> = {};
      baseList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

      const liveList = Object.keys(allPlayersList).map(id => {
        const liveIcons = liveLeaderboard[id]?.icons || "";
        const name = allPlayersList[id] + liveIcons;
        const baseSkor = (skorWeek1Data[id] || 0) + (skorWeek2Data[id] || 0) + (skorWeek3Data[id] || 0);
        const liveExtra = liveLeaderboard[id]?.skor || 0; 
        return { id, name, baseSkor, liveExtra, skor: baseSkor + liveExtra };
      }).sort((a, b) => b.skor - a.skor || a.name.localeCompare(b.name));

      const finalRows = liveList.map((player, index) => {
        const currentRank = index + 1;
        const prevRank = prevRanks[player.id];
        let trend = 'same';
        if (currentRank < prevRank) trend = 'up';
        else if (currentRank > prevRank) trend = 'down';
        return { ...player, currentRank, prevRank, trend };
      });

      setTableRows(finalRows);
    } else {
      const dataMap = activeTab === 'week1' ? skorWeek1Data : activeTab === 'week2' ? skorWeek2Data : skorWeek3Data;
      const list = Object.keys(allPlayersList).map(id => ({ id, name: allPlayersList[id], skor: dataMap[id] || 0, trend: 'none' }));
      setTableRows(list.sort((a, b) => b.skor - a.skor));
    }
  };

  useEffect(() => {
    loadLeaderboard();
    window.addEventListener('leaderboardUpdate', loadLeaderboard);
    return () => window.removeEventListener('leaderboardUpdate', loadLeaderboard);
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center min-h-screen">
      
      {/* 🔴 EKMEL - BİLGİLENDİRME AFİŞİ */}
      <div className="w-full bg-amber-500/20 border border-amber-500/50 rounded-xl p-3 mb-4 flex items-center gap-3">
        <span className="text-amber-500 text-xl animate-pulse">🚨</span>
        <p className="text-amber-200 text-[11px] sm:text-xs font-semibold leading-tight">
          <strong className="text-amber-400">BİLGİLENDİRME:</strong> Şu anki maç test aşamasıdır. Gerçek lig maçı saat 21:30'da Sturm Graz - Fenerbahçe ile başlayacak. En geç saat 21:00'de her şey aktif olacaktır.
        </p>
      </div>

      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-amber-400 uppercase drop-shadow-md tracking-wider">ELİT TAHMİN SKOR LİGİ</h1>
      </div>

      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>

      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button onClick={() => selectTab('total')} className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${activeTab === 'total' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-[1.02]' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
          TOPLAM SKOR DURUMU
        </button>
        <div className="w-full relative">
          <button onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${activeTab !== 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
            <span>📅 {activeTab.replace('week', '')}. HAFTA SKOR DURUMU</span>
            <span className="text-xs transition-transform duration-200">{isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}</span>
          </button>
          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {totalWeeks.map((weekNum) => (
                  <button key={weekNum} onClick={() => selectTab(`week${weekNum}`)} className={`py-1.5 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === `week${weekNum}` ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-sm' : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-amber-500/20 hover:text-amber-300'}`}>
                    {weekNum}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr><th className="px-6 py-3.5 text-center w-20">SIRA</th><th className="px-6 py-3.5">YARIŞMACI</th><th className="px-6 py-3.5 text-right w-28">SKOR</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tableRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-slate-300 font-medium text-sm">{r.currentRank || i + 1}</span>
                      {r.trend === 'up' && <span className="text-emerald-400 text-sm animate-bounce" title={`Önceki Sıra: ${r.prevRank}`}>▲</span>}
                      {r.trend === 'down' && <span className="text-red-500 text-sm" title={`Önceki Sıra: ${r.prevRank}`}>▼</span>}
                      {r.trend === 'same' && <span className="text-slate-600 text-[10px]">▶</span>}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-semibold">{r.name}</span>
                      {r.liveExtra > 0 && activeTab === 'total' && (
                        <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse">
                          +{r.liveExtra} CANLI
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-3.5 text-right font-bold text-base ${r.liveExtra > 0 && activeTab === 'total' ? "text-emerald-400" : "text-amber-400"}`}>
                    {r.skor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Veriler bulunamadı.</div>
        )}
      </div>
    </div>
  );
}