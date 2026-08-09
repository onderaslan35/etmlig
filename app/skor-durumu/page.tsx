'use client';

import React, { useState, useEffect } from 'react';

// SADECE SKOR VERİLERİ İŞLENDİ (ID SÜTUNU KALDIRILDI)
const skorStandingsData = [
  { id: "262756", name: "EYÜP KARACAOĞLU", exactScores: 9 },
  { id: "262755", name: "DOĞAÇ ALKAN", exactScores: 9 },
  { id: "262816", name: "SEDAT SEDAT", exactScores: 9 },
  { id: "262754", name: "OSMAN ALİ AYDIN 🏆", exactScores: 9 },
  { id: "262726", name: "HUDAVER TOPARDIC", exactScores: 8 },
  { id: "262728", name: "ÖNDER ASLAN", exactScores: 8 },
  { id: "262736", name: "MEHMET ALİ KARA", exactScores: 6 },
  { id: "262786", name: "SEDAT DİŞLİ", exactScores: 6 },
  { id: "262790", name: "CUMALİ SÖKER", exactScores: 6 },
  { id: "262732", name: "R. İLHAN KARACA 🏆🏆", exactScores: 6 },
  { id: "262721", name: "MUSTAFA GÜMÜŞÇÜ", exactScores: 6 },
  { id: "262714", name: "İSMAİL EKER 🏆", exactScores: 6 },
  { id: "262733", name: "MUHSİN ASİLKAN", exactScores: 5 },
  { id: "262709", name: "SALİH KARACAOĞLU", exactScores: 5 },
  { id: "262771", name: "ULAŞ ADIGÜZEL", exactScores: 5 },
  { id: "262717", name: "MURAT ALİ", exactScores: 5 },
  { id: "262731", name: "FATİH AYAN", exactScores: 5 },
  { id: "262763", name: "MUSTAFA ELMAS", exactScores: 5 },
  { id: "262813", name: "KEMAL ERSOY", exactScores: 5 },
  { id: "262747", name: "SAVAŞ ÇAĞLAYAN", exactScores: 5 },
  { id: "262702", name: "MURAT KARA", exactScores: 5 },
  { id: "262719", name: "UĞUR VARDAR", exactScores: 4 },
  { id: "262711", name: "RIDVAN DOGER", exactScores: 4 },
  { id: "262707", name: "HAKAN AYAN", exactScores: 4 },
  { id: "262705", name: "AHMET BİRCAN 🏆", exactScores: 4 },
  { id: "262716", name: "BİROL DEMİREL", exactScores: 4 },
  { id: "262782", name: "YUSUF ERBAY", exactScores: 4 },
  { id: "262772", name: "CEMAL SİVRİKAYA 🏆", exactScores: 3 },
  { id: "262706", name: "GAZİ AYAN 🏆🏆", exactScores: 3 },
  { id: "262774", name: "ŞENOL CAN ÇAKICI", exactScores: 3 },
  { id: "262740", name: "ABDULLAH DİK", exactScores: 3 },
  { id: "262753", name: "YUSUF KIZILTUĞ", exactScores: 3 },
  { id: "262725", name: "İLYAS KAZDAL", exactScores: 3 },
  { id: "351925", name: "ALİOS GÖZTEPE", exactScores: 3 },
  { id: "262730", name: "ÖNDER IŞIK", exactScores: 3 },
  { id: "262723", name: "AYHAN LUŞOĞLU", exactScores: 3 },
  { id: "262718", name: "BEKİR KARADAĞ", exactScores: 3 },
  { id: "262739", name: "UĞUR GÜRBÜZ", exactScores: 3 },
  { id: "262738", name: "MEVLÜT EVLER", exactScores: 2 },
  { id: "262750", name: "MAHMUT CBR", exactScores: 2 },
  { id: "262734", name: "LEVENT YILDIRIM", exactScores: 2 },
  { id: "262737", name: "ŞAHİN GEZGİNCİ", exactScores: 2 },
  { id: "262749", name: "B.VEYSELOĞLU EROL", exactScores: 2 },
  { id: "262715", name: "ŞEMSETTİN DÜGER", exactScores: 2 },
  { id: "262703", name: "CEMALETTİN BELLİ", exactScores: 1 },
  { id: "262708", name: "BAYRAM YILMAZ", exactScores: 1 },
  { id: "262744", name: "İLYAS UYGUN", exactScores: 1 },
  { id: "262758", name: "MELİH PINAR", exactScores: 1 },
  { id: "262787", name: "MUSTAFA TUCİ", exactScores: 1 },
  { id: "262770", name: "OZKAYA MAZAKALI BAYRAM", exactScores: 1 },
  { id: "262712", name: "MURAT AYDEMİR", exactScores: 0 },
  { id: "262704", name: "YAPAY ZEKA", exactScores: 0 }
];

export default function SkorDurumuPage() {
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

  // TABLO SIRALAMASI: TAM SKOR'A GÖRE YÜKSEKTEN DÜŞÜĞE
  const sortedStandings = [...skorStandingsData].sort((a, b) => b.exactScores - a.exactScores);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  const getActiveTabTitle = () => {
    if (activeTab === 'total') return 'SKOR TOPLAM DURUMU';
    const weekNum = activeTab.replace('week', '');
    return `SKOR ${weekNum}. HAFTA DURUMU`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center font-sans">
      {/* 1. SAYFANIN EN ÜSTÜNDEKİ ANA BAŞLIK */}
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-400 tracking-wider uppercase">
          ELİT TAHMİN SKOR LİGİ
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
          SKOR TOPLAM DURUMU
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

      {/* 4. SADECE SIRA, YARIŞMACI VE TAM SKOR SÜTUNLARINDAN OLUŞAN TABLO */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">SIRA</th>
                <th className="py-3.5 px-4">YARIŞMACI</th>
                <th className="py-3.5 px-4 text-right text-emerald-400">TAM SKOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm font-semibold">
              {sortedStandings.map((user, idx) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-800/50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 text-center text-slate-400 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-100">
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-400 text-base">
                    {user.exactScores}
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