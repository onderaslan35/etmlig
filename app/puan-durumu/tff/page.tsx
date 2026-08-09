'use client';

import React, { useState, useEffect } from 'react';

// GÜNCEL TFF LİGİ PUAN DURUMU VERİSİ
const tffStandingsData = [
  { rank: 1, name: "EYÜP KARACAOĞLU", id: "262756", points: 44, exactScores: 9 },
  { rank: 2, name: "DOĞAÇ ALKAN", id: "262755", points: 39, exactScores: 9 },
  { rank: 3, name: "SEDAT SEDAT", id: "262816", points: 38, exactScores: 9 },
  { rank: 4, name: "MEHMET ALİ KARA", id: "262736", points: 36, exactScores: 6 },
  { rank: 5, name: "MUHSİN ASİLKAN", id: "262733", points: 26, exactScores: 5 },
  { rank: 6, name: "HUDAVER TOPARDIC", id: "262726", points: 25, exactScores: 8 },
  { rank: 7, name: "ÖNDER ASLAN", id: "262728", points: 25, exactScores: 8 },
  { rank: 8, name: "SEDAT DİŞLİ", id: "262786", points: 25, exactScores: 6 },
  { rank: 9, name: "SALİH KARACAOĞLU", id: "262709", points: 23, exactScores: 5 },
  { rank: 10, name: "UĞUR VARDAR", id: "262719", points: 23, exactScores: 4 },
  { rank: 11, name: "OSMAN ALİ AYDIN 🏆", id: "262754", points: 22, exactScores: 9 },
  { rank: 12, name: "ULAŞ ADIGÜZEL", id: "262771", points: 20, exactScores: 5 },
  { rank: 13, name: "CUMALİ SÖKER", id: "262790", points: 19, exactScores: 6 },
  { rank: 14, name: "R. İLHAN KARACA 🏆🏆", id: "262732", points: 18, exactScores: 6 },
  { rank: 15, name: "MURAT ALİ", id: "262717", points: 18, exactScores: 5 },
  { rank: 16, name: "MUSTAFA GÜMÜŞÇÜ", id: "262721", points: 17, exactScores: 6 },
  { rank: 17, name: "RIDVAN DOGER", id: "262711", points: 15, exactScores: 4 },
  { rank: 18, name: "FATİH AYAN", id: "262731", points: 14, exactScores: 5 },
  { rank: 19, name: "CEMAL SİVRİKAYA 🏆", id: "262772", points: 14, exactScores: 3 },
  { rank: 20, name: "MUSTAFA ELMAS", id: "262763", points: 13, exactScores: 5 },
  { rank: 21, name: "KEMAL ERSOY", id: "262813", points: 12, exactScores: 5 },
  { rank: 22, name: "HAKAN AYAN", id: "262707", points: 12, exactScores: 4 },
  { rank: 23, name: "GAZİ AYAN 🏆🏆", id: "262706", points: 12, exactScores: 3 },
  { rank: 24, name: "SAVAŞ ÇAĞLAYAN", id: "262747", points: 11, exactScores: 5 },
  { rank: 25, name: "ŞENOL CAN ÇAKICI", id: "262774", points: 11, exactScores: 3 },
  { rank: 26, name: "İSMAİL EKER 🏆", id: "262714", points: 10, exactScores: 6 },
  { rank: 27, name: "MURAT KARA", id: "262702", points: 10, exactScores: 5 },
  { rank: 28, name: "AHMET BİRCAN 🏆", id: "262705", points: 10, exactScores: 4 },
  { rank: 29, name: "ABDULLAH DİK", id: "262740", points: 10, exactScores: 3 },
  { rank: 30, name: "MEVLÜT EVLER", id: "262738", points: 10, exactScores: 2 },
  { rank: 31, name: "BİROL DEMİREL", id: "262716", points: 9, exactScores: 4 },
  { rank: 32, name: "YUSUF KIZILTUĞ", id: "262753", points: 9, exactScores: 3 },
  { rank: 33, name: "MAHMUT CBR", id: "262750", points: 9, exactScores: 2 },
  { rank: 34, name: "LEVENT YILDIRIM", id: "262734", points: 9, exactScores: 2 },
  { rank: 35, name: "İLYAS KAZDAL", id: "262725", points: 7, exactScores: 3 },
  { rank: 36, name: "ALİOS GÖZTEPE", id: "351925", points: 7, exactScores: 3 },
  { rank: 37, name: "ÖNDER IŞIK", id: "262730", points: 7, exactScores: 3 },
  { rank: 38, name: "ŞAHİN GEZGİNCİ", id: "262737", points: 7, exactScores: 2 },
  { rank: 39, name: "YUSUF ERBAY", id: "262782", points: 5, exactScores: 4 },
  { rank: 40, name: "AYHAN LUŞOĞLU", id: "262723", points: 4, exactScores: 3 },
  { rank: 41, name: "B.VEYSELOĞLU EROL", id: "262749", points: 4, exactScores: 2 },
  { rank: 42, name: "BEKİR KARADAĞ", id: "262718", points: 3, exactScores: 3 },
  { rank: 43, name: "UĞUR GÜRBÜZ", id: "262739", points: 3, exactScores: 3 },
  { rank: 44, name: "ŞEMSETTİN DÜGER", id: "262715", points: 3, exactScores: 2 },
  { rank: 45, name: "CEMALETTİN BELLİ", id: "262703", points: 2, exactScores: 1 },
  { rank: 46, name: "BAYRAM YILMAZ", id: "262708", points: 1, exactScores: 1 },
  { rank: 47, name: "İLYAS UYGUN", id: "262744", points: 1, exactScores: 1 },
  { rank: 48, name: "MELİH PINAR", id: "262758", points: 1, exactScores: 1 },
  { rank: 49, name: "MUSTAFA TUCİ", id: "262787", points: 1, exactScores: 1 },
  { rank: 50, name: "OZKAYA MAZAKALI BAYRAM", id: "262770", points: 1, exactScores: 1 },
  { rank: 51, name: "MURAT AYDEMİR", id: "262712", points: 0, exactScores: 0 },
  { rank: 52, name: "YAPAY ZEKA", id: "262704", points: 0, exactScores: 0 }
];

export default function TffPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);

  // AKAN DİJİTAL SAAT VE OTOMATİK TARİH
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      const timeStr = now.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeStr);

      const dateStr = now.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        weekday: 'long'
      }).toUpperCase();
      setCurrentDateFormatted(dateStr);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  // BUGÜNÜN MÜSABAKALARI (10 AĞUSTOS PAZARTESİ)
  const todaysMatches = [
    { id: 24, home: "PENDİKSPOR", away: "BATMAN PETROL SPOR", time: "21:30", league: "TFF 1. LİG" },
  ];

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  const getActiveTabTitle = () => {
    if (activeTab === 'total') return 'TFF TOPLAM PUAN DURUMU';
    const weekNum = activeTab.replace('week', '');
    return `TFF ${weekNum}. HAFTA PUAN DURUMU`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center font-sans">
      {/* 1. SAYFANIN EN ÜSTÜNDEKİ ANA BAŞLIK */}
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-400 tracking-wider uppercase">
          ELİT TAHMİN TFF LİGİ
        </h1>
      </div>

      {/* 2. BUGÜNÜN MÜSABAKALARI - SAAT & DİNAMİK TARİHLİ ŞERİT */}
      <div className="w-full mb-6 bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <h2 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider">
              BUGÜNÜN MÜSABAKALARI ({todaysMatches.length} MAÇ)
            </h2>
          </div>

          {/* SAĞ ÜST: TARİH VE AKAN DİJİTAL SAAT KUTUSU */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full shadow-inner">
              📅 {currentDateFormatted || 'YÜKLENİYOR...'}
            </span>
            
            {currentTime && (
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-emerald-400 bg-slate-950 border border-emerald-500/40 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {currentTime}
              </span>
            )}
          </div>
        </div>

        {/* ORTALANMIŞ MÜSABAKA BANTI */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 justify-center scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-950">
          {todaysMatches.map((m) => (
            <div
              key={m.id}
              className="min-w-[240px] sm:min-w-[280px] max-w-sm flex-shrink-0 bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 transition-all duration-200 rounded-xl p-3.5 flex flex-col justify-between shadow-md"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-2">
                <span className="text-amber-400/90 truncate font-extrabold">{m.league}</span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-black">
                  ⏰ {m.time}
                </span>
              </div>

              <div className="flex items-center justify-between my-2">
                <span className="font-extrabold text-xs sm:text-sm text-slate-100 uppercase truncate w-2/5 text-left">
                  {m.home}
                </span>
                <span className="text-[9px] font-black text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  VS
                </span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-100 uppercase truncate w-2/5 text-right">
                  {m.away}
                </span>
              </div>

              <div className="mt-2 text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800/80 pt-1.5">
                MAÇ #{m.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BUTONLAR VE AÇILIR MENÜ ALANI */}
      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button
          onClick={() => selectTab('total')}
          className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${
            activeTab === 'total'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          TFF TOPLAM PUAN DURUMU
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

      {/* 4. MASTER İLE BİREBİR AYNI DETAYLI PUAN TABLOSU */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">SIRA</th>
                <th className="py-3.5 px-4">YARIŞMACI</th>
                <th className="py-3.5 px-4 text-center hidden sm:table-cell">ID</th>
                <th className="py-3.5 px-4 text-center">TAM SKOR</th>
                <th className="py-3.5 px-4 text-right text-amber-400">PUAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm font-semibold">
              {tffStandingsData.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-800/50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 text-center text-slate-400 font-bold">
                    {user.rank}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-100">
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 text-xs hidden sm:table-cell">
                    {user.id}
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-extrabold">
                    {user.exactScores}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-amber-400 text-base">
                    {user.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}