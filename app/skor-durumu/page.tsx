'use client';

import React, { useState, useEffect } from 'react';

// DFO 1. HAFTA SKOR LİSTESİ
const dfoWeek1SkorData = [
  { id: "262736", name: "MEHMET ALİ KARA", puan: 31, skor: 4 },
  { id: "262755", name: "DOĞAÇ ALKAN", puan: 21, skor: 6 },
  { id: "262719", name: "UĞUR VARDAR", puan: 23, skor: 4 },
  { id: "262756", name: "EYÜP KARACAOĞLU", puan: 17, skor: 4 },
  { id: "262754", name: "OSMAN ALİ AYDIN 🏆", puan: 14, skor: 4 },
  { id: "262786", name: "SEDAT DİŞLİ", puan: 12, skor: 3 },
  { id: "262731", name: "FATİH AYAN", puan: 11, skor: 3 },
  { id: "262717", name: "MURAT ALİ", puan: 11, skor: 3 },
  { id: "262732", name: "R. İLHAN KARACA 🏆🏆", puan: 10, skor: 4 },
  { id: "262726", name: "HUDAVER TOPARDIC", puan: 10, skor: 3 },
  { id: "262750", name: "MAHMUT CBR", puan: 9, skor: 2 },
  { id: "262747", name: "SAVAŞ ÇAĞLAYAN", puan: 8, skor: 3 },
  { id: "262771", name: "ULAŞ ADIGÜZEL", puan: 8, skor: 2 },
  { id: "262728", name: "ÖNDER ASLAN", puan: 8, skor: 2 },
  { id: "262816", name: "SEDAT SEDAT", puan: 7, skor: 2 },
  { id: "262716", name: "BİROL DEMİREL", puan: 7, skor: 2 },
  { id: "262790", name: "CUMALİ SÖKER", puan: 7, skor: 2 },
  { id: "262733", name: "MUHSİN ASİLKAN", puan: 7, skor: 2 },
  { id: "262709", name: "SALİH KARACAOĞLU", puan: 5, skor: 1 },
  { id: "262753", name: "YUSUF KIZILTUĞ", puan: 4, skor: 2 },
  { id: "262813", name: "KEMAL ERSOY", puan: 4, skor: 2 },
  { id: "262740", name: "ABDULLAH DİK", puan: 4, skor: 1 },
  { id: "262718", name: "BEKİR KARADAĞ", puan: 3, skor: 3 },
  { id: "262707", name: "HAKAN AYAN", puan: 1, skor: 1 },
  { id: "262782", name: "YUSUF ERBAY", puan: 1, skor: 1 },
  { id: "262702", name: "MURAT KARA", puan: 1, skor: 1 },
  { id: "262714", name: "İSMAİL EKER 🏆", puan: 1, skor: 1 },
  { id: "262721", name: "MUSTAFA GÜMÜŞÇÜ", puan: 1, skor: 1 },
  { id: "262706", name: "GAZİ AYAN 🏆🏆", puan: 1, skor: 1 },
  { id: "262787", name: "MUSTAFA TUCİ", puan: 1, skor: 1 },
  { id: "262744", name: "İLYAS UYGUN", puan: 1, skor: 1 },
  { id: "262774", name: "ŞENOL CAN ÇAKICI", puan: 1, skor: 1 },
  { id: "262715", name: "ŞEMSETTİN DÜGER", puan: 1, skor: 1 },
  { id: "262723", name: "AYHAN LUŞOĞLU", puan: 1, skor: 1 },
  { id: "351925", name: "ALİOS GÖZTEPE", puan: 0, skor: 0 },
  { id: "262749", name: "B.VEYSELOĞLU EROL", puan: 0, skor: 0 },
  { id: "262705", name: "AHMET BİRCAN 🏆", puan: 0, skor: 0 },
  { id: "262708", name: "BAYRAM YILMAZ", puan: 0, skor: 0 },
  { id: "262711", name: "RIDVAN DOGER", puan: 0, skor: 0 },
  { id: "262712", name: "MURAT AYDEMİR", puan: 0, skor: 0 },
  { id: "262734", name: "LEVENT YILDIRIM", puan: 0, skor: 0 }
];

// DFO 2. HAFTA SKOR LİSTESİ
const dfoWeek2SkorData = [
  { id: "262756", name: "EYÜP KARACAOĞLU", puan: 16, skor: 3 },
  { id: "262755", name: "DOĞAÇ ALKAN", puan: 13, skor: 2 },
  { id: "262709", name: "SALİH KARACAOĞLU", puan: 13, skor: 2 },
  { id: "262790", name: "CUMALİ SÖKER", puan: 12, skor: 4 },
  { id: "262772", name: "CEMAL SİVRİKAYA 🏆", puan: 12, skor: 1 },
  { id: "262728", name: "ÖNDER ASLAN", puan: 11, skor: 4 },
  { id: "262726", name: "HUDAVER TOPARDIC", puan: 9, skor: 3 },
  { id: "262711", name: "RIDVAN DOGER", puan: 8, skor: 2 },
  { id: "262717", name: "MURAT ALİ", puan: 7, skor: 2 },
  { id: "262737", name: "ŞAHİN GEZGİNCİ", puan: 7, skor: 2 },
  { id: "262705", name: "AHMET BİRCAN 🏆", puan: 6, skor: 2 },
  { id: "262816", name: "SEDAT SEDAT", puan: 6, skor: 2 },
  { id: "262774", name: "ŞENOL CAN ÇAKICI", puan: 6, skor: 1 },
  { id: "262732", name: "R. İLHAN KARACA 🏆🏆", puan: 6, skor: 1 },
  { id: "262786", name: "SEDAT DİŞLİ", puan: 6, skor: 1 },
  { id: "262721", name: "MUSTAFA GÜMÜŞÇÜ", puan: 5, skor: 1 },
  { id: "262738", name: "MEVLÜT EVLER", puan: 5, skor: 1 },
  { id: "262714", name: "İSMAİL EKER 🏆", puan: 4, skor: 3 },
  { id: "262763", name: "MUSTAFA ELMAS", puan: 2, skor: 2 },
  { id: "262736", name: "MEHMET ALİ KARA", puan: 2, skor: 2 },
  { id: "262740", name: "ABDULLAH DİK", puan: 2, skor: 1 },
  { id: "262702", name: "MURAT KARA", puan: 2, skor: 1 },
  { id: "262703", name: "CEMALETTİN BELLİ", puan: 2, skor: 1 },
  { id: "262730", name: "ÖNDER IŞIK", puan: 2, skor: 1 },
  { id: "262715", name: "ŞEMSETTİN DÜGER", puan: 2, skor: 1 },
  { id: "262749", name: "B.VEYSELOĞLU EROL", puan: 2, skor: 1 },
  { id: "262725", name: "İLYAS KAZDAL", puan: 1, skor: 1 },
  { id: "262758", name: "MELİH PINAR", puan: 1, skor: 1 },
  { id: "262771", name: "ULAŞ ADIGÜZEL", puan: 1, skor: 1 },
  { id: "262754", name: "OSMAN ALİ AYDIN 🏆", puan: 1, skor: 1 },
  { id: "262747", name: "SAVAŞ ÇAĞLAYAN", puan: 1, skor: 1 },
  { id: "262716", name: "BİROL DEMİREL", puan: 1, skor: 1 },
  { id: "262708", name: "BAYRAM YILMAZ", puan: 1, skor: 1 },
  { id: "262731", name: "FATİH AYAN", puan: 1, skor: 1 },
  { id: "262739", name: "UĞUR GÜRBÜZ", puan: 1, skor: 1 },
  { id: "262813", name: "KEMAL ERSOY", puan: 0, skor: 0 },
  { id: "262712", name: "MURAT AYDEMİR", puan: 0, skor: 0 },
  { id: "262734", name: "LEVENT YILDIRIM", puan: 0, skor: 0 },
  { id: "351925", name: "ALİOS GÖZTEPE", puan: 0, skor: 0 },
  { id: "262744", name: "İLYAS UYGUN", puan: 0, skor: 0 },
  { id: "262718", name: "BEKİR KARADAĞ", puan: 0, skor: 0 },
  { id: "262704", name: "YAPAY ZEKA", puan: 0, skor: 0 },
  { id: "262733", name: "MUHSİN ASİLKAN", puan: 0, skor: 0 },
  { id: "262707", name: "HAKAN AYAN", puan: 0, skor: 0 },
  { id: "262750", name: "MAHMUT CBR", puan: 0, skor: 0 },
  { id: "262753", name: "YUSUF KIZILTUĞ", puan: 0, skor: 0 },
  { id: "262706", name: "GAZİ AYAN 🏆🏆", puan: 0, skor: 0 },
  { id: "262723", name: "AYHAN LUŞOĞLU", puan: 0, skor: 0 },
  { id: "262719", name: "UĞUR VARDAR", puan: 0, skor: 0 },
  { id: "262782", name: "YUSUF ERBAY", puan: 0, skor: 0 },
  { id: "262770", name: "OZKAYA MAZAKALI BAYRAM", puan: 0, skor: 0 }
];

// DFO 3. HAFTA TEMEL SKOR LİSTESİ (BAYRAM YILMAZ'IN SKORU DOĞRU OLARAK 1'E SABİTLENDİ)
const dfoWeek3BaseSkorData = [
  { id: "262816", name: "SEDAT SEDAT", puan: 25, skor: 5 },
  { id: "262733", name: "MUHSİN ASİLKAN", puan: 19, skor: 3 },
  { id: "262721", name: "MUSTAFA GÜMÜŞÇÜ", puan: 11, skor: 4 },
  { id: "262707", name: "HAKAN AYAN", puan: 11, skor: 3 },
  { id: "262763", name: "MUSTAFA ELMAS", puan: 11, skor: 3 },
  { id: "262771", name: "ULAŞ ADIGÜZEL", puan: 11, skor: 2 },
  { id: "262706", name: "GAZİ AYAN 🏆🏆", puan: 11, skor: 2 },
  { id: "262734", name: "LEVENT YILDIRIM", puan: 9, skor: 2 },
  { id: "262813", name: "KEMAL ERSOY", puan: 8, skor: 3 },
  { id: "262756", name: "EYÜP KARACAOĞLU", puan: 8, skor: 2 },
  { id: "262754", name: "OSMAN ALİ AYDIN 🏆", puan: 7, skor: 4 },
  { id: "351925", name: "ALİOS GÖZTEPE", puan: 7, skor: 3 },
  { id: "262702", name: "MURAT KARA", puan: 7, skor: 3 },
  { id: "262786", name: "SEDAT DİŞLİ", puan: 7, skor: 2 },
  { id: "262711", name: "RIDVAN DOGER", puan: 7, skor: 2 },
  { id: "262726", name: "HUDAVER TOPARDIC", puan: 6, skor: 2 },
  { id: "262725", name: "İLYAS KAZDAL", puan: 6, skor: 2 },
  { id: "262728", name: "ÖNDER ASLAN", puan: 6, skor: 2 },
  { id: "262709", name: "SALİH KARACAOĞLU", puan: 5, skor: 2 },
  { id: "262714", name: "İSMAİL EKER 🏆", puan: 5, skor: 2 },
  { id: "262730", name: "ÖNDER IŞIK", puan: 5, skor: 2 },
  { id: "262738", name: "MEVLÜT EVLER", puan: 5, skor: 1 },
  { id: "262753", name: "YUSUF KIZILTUĞ", puan: 5, skor: 1 },
  { id: "262782", name: "YUSUF ERBAY", puan: 4, skor: 3 },
  { id: "262705", name: "AHMET BİRCAN 🏆", puan: 4, skor: 2 },
  { id: "262774", name: "ŞENOL CAN ÇAKICI", puan: 4, skor: 1 },
  { id: "262740", name: "ABDULLAH DİK", puan: 4, skor: 1 },
  { id: "262723", name: "AYHAN LUŞOĞLU", puan: 3, skor: 2 },
  { id: "262772", name: "CEMAL SİVRİKAYA 🏆", puan: 2, skor: 2 },
  { id: "262739", name: "UĞUR GÜRBÜZ", puan: 2, skor: 2 },
  { id: "262731", name: "FATİH AYAN", puan: 2, skor: 1 },
  { id: "262755", name: "DOĞAÇ ALKAN", puan: 2, skor: 1 },
  { id: "262747", name: "SAVAŞ ÇAĞLAYAN", puan: 2, skor: 1 },
  { id: "262732", name: "R. İLHAN KARACA 🏆🏆", puan: 2, skor: 1 },
  { id: "262749", name: "B.VEYSELOĞLU EROL", puan: 2, skor: 1 },
  { id: "262716", name: "BİROL DEMİREL", puan: 1, skor: 1 },
  { id: "262770", name: "OZKAYA MAZAKALI BAYRAM", puan: 1, skor: 1 },
  { id: "262719", name: "UĞUR VARDAR", puan: 0, skor: 0 },
  { id: "262708", name: "BAYRAM YILMAZ", puan: 0, skor: 1 }, // <--- Bayram Yılmaz'ın doğru skoru 1 olarak ayarlandı
  { id: "262744", name: "İLYAS UYGUN", puan: 0, skor: 0 },
  { id: "262758", name: "MELİH PINAR", puan: 0, skor: 0 },
  { id: "262718", name: "BEKİR KARADAĞ", puan: 0, skor: 0 },
  { id: "262736", name: "MEHMET ALİ KARA", puan: 0, skor: 0 },
  { id: "262790", name: "CUMALİ SÖKER", puan: 0, skor: 0 },
  { id: "262750", name: "MAHMUT CBR", puan: 0, skor: 0 },
  { id: "262717", name: "MURAT ALİ", puan: 0, skor: 0 },
  { id: "262703", name: "CEMALETTİN BELLİ", puan: 0, skor: 0 }
];

export default function DfoSkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('week1');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateFormatted(now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }).toUpperCase());
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  const todaysMatches = [
    { id: 1, home: "OLIMPIYAKOS", away: "NEC NIJMEGEN", time: "20:00", league: "UEFA ŞAMPİYONLAR LİGİ" },
  ];

  useEffect(() => {
    const weeklyScoresStore = JSON.parse(localStorage.getItem('elitTahmin_WeeklyScores') || '{}');

    const getWeek3CurrentData = () => {
      return dfoWeek3BaseSkorData.map(item => {
        const liveExtraScore = (weeklyScoresStore['3'] && weeklyScoresStore['3'][item.id]) || 0;
        return {
          ...item,
          skor: item.skor + liveExtraScore
        };
      });
    };

    if (activeTab === 'total') {
      const skorMap: Record<string, { name: string; skor: number; puan: number }> = {};

      dfoWeek1SkorData.forEach(item => {
        skorMap[item.id] = { name: item.name, skor: item.skor, puan: item.puan };
      });

      dfoWeek2SkorData.forEach(item => {
        if (skorMap[item.id]) {
          skorMap[item.id].skor += item.skor;
          skorMap[item.id].puan += item.puan;
        } else {
          skorMap[item.id] = { name: item.name, skor: item.skor, puan: item.puan };
        }
      });

      const week3Current = getWeek3CurrentData();
      week3Current.forEach(item => {
        if (skorMap[item.id]) {
          skorMap[item.id].skor += item.skor;
          skorMap[item.id].puan += item.puan;
        } else {
          skorMap[item.id] = { name: item.name, skor: item.skor, puan: item.puan };
        }
      });

      const combined = Object.keys(skorMap).map(id => ({
        id,
        name: skorMap[id].name,
        skor: skorMap[id].skor,
        puan: skorMap[id].puan
      }));

      const sorted = combined.sort((a, b) => (b.skor - a.skor) || (b.puan - a.puan));
      setTableRows(sorted);

    } else if (activeTab === 'week1') {
      const sorted = [...dfoWeek1SkorData].sort((a, b) => (b.skor - a.skor) || (b.puan - a.puan));
      setTableRows(sorted);

    } else if (activeTab === 'week2') {
      const sorted = [...dfoWeek2SkorData].sort((a, b) => (b.skor - a.skor) || (b.puan - a.puan));
      setTableRows(sorted);

    } else if (activeTab === 'week3') {
      const week3Current = getWeek3CurrentData();
      const sorted = week3Current.sort((a, b) => (b.skor - a.skor) || (b.puan - a.puan));
      setTableRows(sorted);

    } else {
      setTableRows([]);
    }
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  const getActiveTabTitle = () => {
    if (activeTab === 'total') return 'DFO TOPLAM SKOR DURUMU';
    if (activeTab === 'week1') return 'DFO 1. HAFTA SKOR DURUMU';
    if (activeTab === 'week2') return 'DFO 2. HAFTA SKOR DURUMU';
    if (activeTab === 'week3') return 'DFO 3. HAFTA SKOR DURUMU';
    const weekNum = activeTab.replace('week', '');
    return `DFO ${weekNum}. HAFTA SKOR DURUMU`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-400 tracking-wider uppercase">
          ELİT TAHMİN DÜNYA FUTBOL ORGANİZASYONLARI (DFO) SKOR LİGİ
        </h1>
      </div>

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

      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button
          onClick={() => selectTab('total')}
          className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${
            activeTab === 'total'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          DFO TOPLAM SKOR DURUMU
        </button>

        <div className="w-full relative">
          <button
            onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)}
            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${
              activeTab !== 'total'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
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
                          ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-sm'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-amber-500/20 hover:text-amber-300'
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

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 w-16 text-center">SIRA</th>
                  <th className="px-6 py-3.5">YARIŞMACI</th>
                  <th className="px-6 py-3.5 text-right">SKOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{row.name}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-amber-400 text-base">
                      {row.skor}
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