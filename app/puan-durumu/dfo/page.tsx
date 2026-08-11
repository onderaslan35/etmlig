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
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL"
};

const dfoWeek1Data: Record<string, number> = {
  "262736": 31, "262719": 23, "262755": 21, "262756": 17, "262754": 14, "262786": 12,
  "262731": 11, "262717": 11, "262732": 10, "262726": 10, "262750": 9, "262747": 8,
  "262771": 8, "262728": 8, "262816": 7, "262716": 7, "262790": 7, "262733": 7,
  "262709": 5, "262753": 4, "262813": 4, "262740": 4, "262718": 3, "262707": 1,
  "262782": 1, "262702": 1, "262714": 1, "262721": 1, "262706": 1, "262787": 1,
  "262744": 1, "262774": 1, "262715": 1, "262723": 1
};

const dfoWeek2Data: Record<string, number> = {
  "262756": 16, "262755": 13, "262709": 13, "262790": 12, "262772": 12, "262728": 11,
  "262726": 9, "262711": 8, "262717": 7, "262737": 7, "262705": 6, "262816": 6,
  "262774": 6, "262732": 6, "262786": 6, "262721": 5, "262738": 5, "262714": 4,
  "262763": 2, "262736": 2, "262740": 2, "262702": 2, "262703": 2, "262730": 2,
  "262715": 2, "262749": 2, "262725": 1, "262758": 1, "262771": 1, "262754": 1,
  "262747": 1, "262716": 1, "262708": 1, "262731": 1, "262739": 1
};

const dfoWeek3Data: Record<string, number> = {
  "262816": 16, "262733": 12, "262721": 10, "262763": 7, "262786": 7, "262711": 7,
  "351925": 6, "262726": 6, "262725": 6, "262771": 6, "262813": 5, "262709": 5,
  "262706": 5, "262738": 5, "262753": 5, "262734": 4, "262756": 4, "262702": 4,
  "262730": 4, "262731": 2, "262755": 2, "262747": 2, "262732": 2, "262707": 1,
  "262754": 1, "262714": 1, "262782": 1, "262723": 1, "262772": 1, "262739": 1, "262716": 1
};

export default function DfoPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  const loadLeaderboard = () => {
    const liveLeaderboard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');

    if (activeTab === 'total') {
      const baseList = Object.keys(allPlayersList).map(id => {
        const basePuan = (dfoWeek1Data[id] || 0) + (dfoWeek2Data[id] || 0) + (dfoWeek3Data[id] || 0);
        return { id, basePuan, name: allPlayersList[id] };
      }).sort((a, b) => b.basePuan - a.basePuan || a.name.localeCompare(b.name));
      
      const prevRanks: Record<string, number> = {};
      baseList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

      const liveList = Object.keys(allPlayersList).map(id => {
        const name = allPlayersList[id];
        const basePuan = (dfoWeek1Data[id] || 0) + (dfoWeek2Data[id] || 0) + (dfoWeek3Data[id] || 0);
        const liveExtra = liveLeaderboard[id]?.dfo || 0; 
        return { id, name, basePuan, liveExtra, puan: basePuan + liveExtra };
      }).sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name));

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
      // Diğer sekmeler...
      const dataMap = activeTab === 'week1' ? dfoWeek1Data : activeTab === 'week2' ? dfoWeek2Data : dfoWeek3Data;
      const list = Object.keys(allPlayersList).map(id => ({ id, name: allPlayersList[id], puan: dataMap[id] || 0, trend: 'none' }));
      setTableRows(list.sort((a, b) => b.puan - a.puan));
    }
  };

  useEffect(() => {
    loadLeaderboard();
    // 🔴 EKMEL CANLI DİNLEME: Maç kartı puanı her güncellediğinde bu tablo anında titreyecek!
    window.addEventListener('leaderboardUpdate', loadLeaderboard);
    return () => window.removeEventListener('leaderboardUpdate', loadLeaderboard);
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-amber-400 uppercase drop-shadow-md tracking-wider">
          ELİT TAHMİN DFO LİGİ
        </h1>
      </div>

      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 text-center w-20">SIRA</th>
                  <th className="px-6 py-3.5">YARIŞMACI</th>
                  <th className="px-6 py-3.5 text-right">{activeTab === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-slate-300 font-medium text-sm">{row.currentRank || idx + 1}</span>
                        {row.trend === 'up' && <span className="text-emerald-400 text-sm animate-bounce" title={`Önceki Sıra: ${row.prevRank}`}>▲</span>}
                        {row.trend === 'down' && <span className="text-red-500 text-sm" title={`Önceki Sıra: ${row.prevRank}`}>▼</span>}
                        {row.trend === 'same' && <span className="text-slate-600 text-[10px]">▶</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-semibold">{row.name}</span>
                        {row.liveExtra > 0 && activeTab === 'total' && (
                          <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse">
                            +{row.liveExtra} CANLI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-3.5 text-right font-bold text-base ${row.liveExtra > 0 && activeTab === 'total' ? "text-emerald-400" : "text-amber-400"}`}>
                      {row.puan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">⏳ Veriler bulunamadı.</div>
        )}
      </div>
    </div>
  );
}