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

  useEffect(() => {
    // 🔴 EKMEL DOKUNUŞU: Canlı Simülasyon Verisini Okuma
    const liveLeaderboard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');

    if (activeTab === 'total') {
      const list = Object.keys(allPlayersList).map(id => {
        const liveIcons = liveLeaderboard[id]?.icons || "";
        const name = allPlayersList[id] + liveIcons;
        
        const w1 = dfoWeek1Data[id] || 0;
        const w2 = dfoWeek2Data[id] || 0;
        const w3 = dfoWeek3Data[id] || 0;
        
        // SİMÜLASYONDAN GELEN PUAN (+12)
        const liveExtra = liveLeaderboard[id]?.dfo || 0; 
        
        return { id, name, puan: w1 + w2 + w3 + liveExtra };
      });
      setTableRows(list.sort((a, b) => b.puan - a.puan));
    } else if (activeTab === 'week1') {
      const list = Object.keys(allPlayersList).map(id => ({ id, name: allPlayersList[id], puan: dfoWeek1Data[id] || 0 }));
      setTableRows(list.sort((a, b) => b.puan - a.puan));
    } else if (activeTab === 'week2') {
      const list = Object.keys(allPlayersList).map(id => ({ id, name: allPlayersList[id], puan: dfoWeek2Data[id] || 0 }));
      setTableRows(list.sort((a, b) => b.puan - a.puan));
    } else if (activeTab === 'week3') {
      const list = Object.keys(allPlayersList).map(id => ({ id, name: allPlayersList[id], puan: dfoWeek3Data[id] || 0 }));
      setTableRows(list.sort((a, b) => b.puan - a.puan));
    } else {
      setTableRows([]);
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
        <h1 className="text-xl md:text-2xl font-extrabold text-amber-400 uppercase drop-shadow-md tracking-wider">
          ELİT TAHMİN DFO LİGİ
        </h1>
      </div>

      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>

      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button onClick={() => selectTab('total')} className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${activeTab === 'total' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-[1.02]' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
          DFO TOPLAM PUAN DURUMU
        </button>
        <div className="w-full relative">
          <button onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${activeTab !== 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
            <span>📅 {getActiveTabTitle()}</span>
            <span className="text-xs transition-transform duration-200">{isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}</span>
          </button>
          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {totalWeeks.map((weekNum) => {
                  const weekKey = `week${weekNum}`;
                  return (
                    <button key={weekNum} onClick={() => selectTab(weekKey)} className={`py-1.5 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === weekKey ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-sm' : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-amber-500/20 hover:text-amber-300'}`}>
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
                <tr><th className="px-6 py-3.5 text-center w-16">SIRA</th><th className="px-6 py-3.5">YARIŞMACI</th><th className="px-6 py-3.5 text-right">{activeTab === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-3.5 text-slate-200 font-semibold">{row.name}</td>
                    {/* 🔴 SİMÜLASYON TETİKLENDİĞİNDE ÖNDER ASLAN BURADA +12 PUANLA ŞOV YAPACAK */}
                    <td className={`px-6 py-3.5 text-right font-bold text-base ${row.id === "262728" ? "text-emerald-400 animate-pulse" : "text-amber-400"}`}>
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