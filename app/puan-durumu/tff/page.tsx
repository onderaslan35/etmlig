'use client';

import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA", "262763": "MUSTFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN", "262714": "İSMAİL EKER", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA",
  "262723": "AYHAN LUŞOĞLU"
};

const tffWeek1Data: Record<string, number> = {};
const tffWeek2Data: Record<string, number> = {};
const tffWeek3Data: Record<string, number> = { "262707": 10, "262816": 9, "262733": 7, "262754": 6, "262728": 6, "262706": 6, "262771": 5, "262734": 5, "262705": 4, "262714": 4, "262763": 4, "262756": 4, "262774": 4, "262740": 4, "262702": 3, "262782": 3, "262813": 3, "262723": 2, "262749": 2, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1, "262736": 6, "262755": 6 };
const tffWeek4Data: Record<string, number> = {};

export default function TffPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');
  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  const loadLeaderboard = () => {
    const liveLeaderboard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');
    const signalData = JSON.parse(localStorage.getItem('elitTahmin_AdminSignal') || '{}');
    setAdminStatus(signalData.status || 'NOT_STARTED');

    if (activeTab === 'total') {
      const baseList = Object.keys(allPlayersList).map(id => {
        const basePuan = (tffWeek1Data[id] || 0) + (tffWeek2Data[id] || 0) + (tffWeek3Data[id] || 0) + (tffWeek4Data[id] || 0);
        const liveExtra = liveLeaderboard[id]?.tff || 0; 
        return { id, basePuan, name: allPlayersList[id], liveExtra, puan: basePuan + liveExtra };
      }).sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr'));

      const prevRanks: Record<string, number> = {};
      const noLiveList = [...baseList].sort((a, b) => b.basePuan - a.basePuan || a.name.localeCompare(b.name, 'tr'));
      noLiveList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

      const finalRows = baseList.map((player, index) => {
        const currentRank = index + 1;
        const prevRank = prevRanks[player.id];
        let trend = 'same';
        if (currentRank < prevRank) trend = 'up';
        else if (currentRank > prevRank) trend = 'down';
        return { ...player, currentRank, prevRank, trend };
      });

      setTableRows(finalRows);
    } else {
      let dataMap = tffWeek1Data;
      if(activeTab === 'week2') dataMap = tffWeek2Data;
      if(activeTab === 'week3') dataMap = tffWeek3Data;
      if(activeTab === 'week4') dataMap = tffWeek4Data;

      const isCurrentWeek = activeTab === 'week4';

      const list = Object.keys(allPlayersList).map(id => {
        const basePuan = dataMap[id] || 0;
        const liveExtra = isCurrentWeek ? (liveLeaderboard[id]?.tff || 0) : 0;
        return { id, name: allPlayersList[id], puan: basePuan + liveExtra, liveExtra, trend: 'none' };
      });
      setTableRows(list.sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr')));
    }
  };

  useEffect(() => {
    loadLeaderboard();
    window.addEventListener('leaderboardUpdate', loadLeaderboard);
    window.addEventListener('adminUpdate', loadLeaderboard);
    return () => {
      window.removeEventListener('leaderboardUpdate', loadLeaderboard);
      window.removeEventListener('adminUpdate', loadLeaderboard);
    };
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-amber-400 uppercase drop-shadow-md">TFF PUAN DURUMU</h1>
      </div>

      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>

      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button onClick={() => selectTab('total')} className={`px-8 py-2.5 rounded-xl font-black transition-all border w-full text-center shadow-md ${activeTab === 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
          TFF TOPLAM PUAN DURUMU
        </button>
        <div className="w-full relative">
          <button onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold border transition-all flex items-center justify-between ${activeTab !== 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
            <span>📅 {activeTab === 'total' ? 'TOPLAM PUAN DURUMU' : `TFF ${activeTab.replace('week', '')}. HAFTA PUAN DURUMU`}</span>
            <span>{isWeekMenuOpen ? '▲' : '▼'}</span>
          </button>
          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900 p-3 rounded-2xl shadow-2xl">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto">
                {totalWeeks.map((weekNum) => (
                  <button key={weekNum} onClick={() => selectTab(`week${weekNum}`)} className={`py-1.5 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === `week${weekNum}` ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
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
              <tr><th className="px-6 py-3.5 text-center w-20">SIRA</th><th className="px-6 py-3.5">YARIŞMACI</th><th className="px-6 py-3.5 text-right">PUAN</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tableRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-slate-300 font-medium text-sm">{row.currentRank || idx + 1}</span>
                      {activeTab === 'total' && row.trend === 'up' && <span className="text-emerald-400 text-sm animate-bounce">▲</span>}
                      {activeTab === 'total' && row.trend === 'down' && <span className="text-red-500 text-sm">▼</span>}
                      {activeTab === 'total' && row.trend === 'same' && <span className="text-slate-600 text-[10px]">▶</span>}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-semibold">{row.name}</span>
                      
                      {/* 🔴 EKMEL MANTIĞI */}
                      {row.liveExtra > 0 && activeTab === 'total' && adminStatus === 'LIVE' && (
                        <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse">
                          +{row.liveExtra} CANLI
                        </span>
                      )}

                      {row.liveExtra > 0 && activeTab !== 'total' && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shadow-sm ${adminStatus === 'LIVE' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50'}`}>
                          +{row.liveExtra} {adminStatus === 'LIVE' ? 'CANLI' : '(1. MAÇ)'}
                        </span>
                      )}

                    </div>
                  </td>
                  <td className={`px-6 py-3.5 text-right font-bold text-base ${row.liveExtra > 0 && activeTab !== 'total' ? "text-emerald-400" : "text-amber-400"}`}>
                    {row.puan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-500">⏳ Veriler bulunamadı.</div>
        )}
      </div>
    </div>
  );
}