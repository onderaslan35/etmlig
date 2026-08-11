'use client';

import React, { useState, useEffect } from 'react';

// 🔴 YEREL LOGO BANKASI
const localTeamLogos: Record<string, string> = {
  "FENERBAHÇE": "/logos/fenerbahce.png",
  "STURM GRAZ": "/logos/sturm-graz.png",
  "PARIS SAINT-GERMAIN": "/logos/psg.png",
  "ASTON VILLA": "/logos/aston-villa.png",
  "BEŞİKTAŞ": "/logos/besiktas.png",
  "HRADEC KRALOVE": "/logos/hradec.png",
  "KARABAĞ FK": "/logos/karabag.png",
  "DINAMO KIEV": "/logos/dinamo-kiev.png",
  "GALATASARAY": "/logos/galatasaray.png",
  "ÇORUM FK": "/logos/corum-fk.png",
  "TRABZONSPOR": "/logos/trabzonspor.png",
  "KASIMPAŞA": "/logos/kasimpasa.png",
  "KONYASPOR": "/logos/konyaspor.png",
  "ÇAYKUR RİZE": "/logos/caykur-rize.png",
  "BAŞAKŞEHİR": "/logos/basaksehir.png"
};

// 🔴 4. HAFTA MAÇLARI VE CANLI TAHMİN EŞLEŞTİRME SİSTEMİ
const week4Matches = [
  { 
    id: 1, 
    weekLabel: "4. HAFTA - 1. MAÇ", 
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", 
    date: "11.08.2026", 
    time: "21:30", 
    homeTeam: "STURM GRAZ", 
    awayTeam: "FENERBAHÇE",
    // EKMEL DOKUNUŞU: Canlı Skor Eşleştirme Sistemi İçin Örnek Tahmin Havuzu
    // Maç skoru değiştikçe sistem bu havuzu tarayıp doğru bilenleri anında ekrana basacak!
    predictions: [
      { user: "MEHMET ALİ KARA", home: 0, away: 2 },
      { user: "DOĞAÇ ALKAN", home: 1, away: 2 },
      { user: "SEDAT SEDAT", home: 0, away: 1 },
      { user: "EYÜP KARACAOĞLU", home: 1, away: 1 },
      { user: "HUDAVER TOPARDIC", home: 0, away: 3 },
      { user: "OSMAN ALİ AYDIN 🏆", home: 1, away: 3 },
      { user: "SALİH KARACAOĞLU", home: 0, away: 0 },
      { user: "MURAT ALİ", home: 2, away: 2 },
      { user: "UĞUR VARDAR", home: 2, away: 1 }
    ]
  },
  { id: 2, weekLabel: "4. HAFTA - 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SAINT-GERMAIN", awayTeam: "ASTON VILLA", predictions: [] },
  { id: 3, weekLabel: "4. HAFTA - 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "19:00", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV", predictions: [] },
  { id: 4, weekLabel: "4. HAFTA - 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "20:00", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE", predictions: [] }
];

export default function LiveMatchCard() {
  const [todaysMatches, setTodaysMatches] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<Record<number, any>>({});
  const [now, setNow] = useState<number>(new Date().getTime());
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}.${month}.${year}`;

    const matchesForToday = week4Matches.filter(m => m.date === formattedToday);
    setTodaysMatches(matchesForToday);

    const fetchAllLiveScores = async () => {
      const newData: Record<number, any> = {};
      for (const match of matchesForToday) {
        try {
          const res = await fetch(`/api/canli-skor?home=${match.homeTeam}&away=${match.awayTeam}`);
          if (res.ok) {
            const data = await res.json();
            newData[match.id] = data;
          }
        } catch (err) {
          console.error("API Hatası:", err);
        }
      }
      if (Object.keys(newData).length > 0) setLiveData(newData);
    };

    if (matchesForToday.length > 0) {
      fetchAllLiveScores();
      const interval = setInterval(fetchAllLiveScores, 60000);
      return () => clearInterval(interval);
    }
  }, []);

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const isTffMatchCheck = (category: string) => {
    const uppercaseCat = category.toUpperCase();
    return uppercaseCat.includes("TÜRKİYE SÜPER LİG") || uppercaseCat.includes("TÜRKİYE 1.LİG") || uppercaseCat.includes("TFF");
  };

  const getMatchThemeStyle = (category: string) => {
    const uppercaseCat = category.toUpperCase();
    if (uppercaseCat.includes("ŞAMPİYONLAR LİGİ")) {
      return {
        bgImage: "url('/cl-bg.png')",
        cardBgClass: "bg-slate-900/90 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
        badgeClass: "text-cyan-300 bg-cyan-950/90 border-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.4)]",
        tagClass: "text-cyan-300 bg-cyan-950/90 border-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.35)]"
      };
    } else if (uppercaseCat.includes("AVRUPA LİGİ")) {
      return {
        bgImage: "url('/el-bg.png')",
        cardBgClass: "bg-slate-900/90 border-orange-500/60 shadow-[0_0_20px_rgba(251,146,60,0.2)]",
        badgeClass: "text-orange-400 bg-orange-950/90 border-orange-500/80 shadow-[0_0_12px_rgba(251,146,60,0.4)]",
        tagClass: "text-orange-400 bg-orange-950/90 border-orange-500/80 shadow-[0_0_10px_rgba(251,146,60,0.35)]"
      };
    } else if (uppercaseCat.includes("KONFERANS LİGİ")) {
      return {
        bgImage: "url('/uecl-bg.png')",
        cardBgClass: "bg-slate-900/90 border-emerald-500/60 shadow-[0_0_20px_rgba(52,211,153,0.2)]",
        badgeClass: "text-emerald-400 bg-emerald-950/90 border-emerald-500/80 shadow-[0_0_12px_rgba(52,211,153,0.4)]",
        tagClass: "text-emerald-400 bg-emerald-950/90 border-emerald-500/80 shadow-[0_0_10px_rgba(52,211,153,0.35)]"
      };
    }
    return {
      bgImage: null,
      cardBgClass: "bg-slate-900/80 border-slate-800",
      badgeClass: "text-amber-400 bg-amber-950/80 border-amber-500/60 shadow-[0_0_12px_rgba(251,191,36,0.35)]",
      tagClass: "text-amber-400 bg-amber-950/90 border-amber-500/60 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
    };
  };

  if (todaysMatches.length === 0) return null;

  let cardWidthClass = "w-full max-w-lg";
  if (todaysMatches.length >= 2 && todaysMatches.length <= 4) {
    cardWidthClass = "w-full md:w-[calc(50%-0.5rem)] max-w-md";
  } else if (todaysMatches.length >= 5) {
    cardWidthClass = "w-full md:w-[calc(33.333%-0.7rem)] max-w-sm";
  }

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
      {todaysMatches.map((match) => {
        const data = liveData[match.id] || {};
        const isLive = data.status === 'LIVE';
        const isFinished = data.status === 'FINISHED';
        const homeScore = data.homeScore ?? "-";
        const awayScore = data.awayScore ?? "-";
        
        const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
        const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";

        const { bgImage, cardBgClass, badgeClass, tagClass } = getMatchThemeStyle(match.category);
        const isTffMatch = isTffMatchCheck(match.category);
        const isWinnersOpen = !!openWinnersMap[match.id];

        // GERİ SAYIM HESAPLAMASI
        let countdownText = "";
        if (!isLive && !isFinished) {
          const matchDateParts = match.date.split('.');
          const matchTimeParts = match.time.split(':');
          const matchTargetDate = new Date(parseInt(matchDateParts[2]), parseInt(matchDateParts[1]) - 1, parseInt(matchDateParts[0]), parseInt(matchTimeParts[0]), parseInt(matchTimeParts[1]), 0).getTime();
          const distance = matchTargetDate - now;
          if (distance > 0) {
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            countdownText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          }
        }

        // 🔴 CANLI TAHMİN EŞLEŞTİRİCİ
        let currentWinners: string[] = [];
        if ((isLive || isFinished) && match.predictions) {
          currentWinners = match.predictions
            .filter((p: any) => p.home === data.homeScore && p.away === data.awayScore)
            .map((p: any) => p.user);
        }
        const winnersCount = currentWinners.length;

        return (
          <div
            key={match.id}
            style={bgImage ? { backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.45)), ${bgImage}`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            className={`${cardWidthClass} rounded-xl p-4 shadow-sm flex flex-col justify-between text-center transition-all duration-300 relative overflow-hidden ${cardBgClass} flex-grow-0 flex-shrink-0`}
          >
            <div>
              {/* HAFTA ETİKETİ */}
              <div className="flex justify-center mb-2">
                <span className="text-[10px] font-extrabold text-white bg-black border border-white/80 px-3 py-0.5 rounded-full uppercase tracking-widest shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                  {match.weekLabel}
                </span>
              </div>

              {/* LİG KATEGORİSİ */}
              <div className="flex justify-center mb-1">
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border text-center ${badgeClass}`}>
                  {match.category}
                </span>
              </div>

              {/* SAAT VE CANLI DURUMU */}
              <div className="text-[10px] sm:text-xs font-bold text-slate-200 my-2 drop-shadow flex items-center justify-center gap-2">
                {isLive ? (
                  <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/80 px-3 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="text-red-500 tracking-wider">CANLI {data.matchTime}'</span>
                  </div>
                ) : isFinished ? (
                  <span className="bg-slate-800 border border-slate-600 px-3 py-0.5 rounded-full">MAÇ SONUCU</span>
                ) : (
                  <span>{match.date} | {match.time}</span>
                )}
              </div>

              {/* LOGOLAR VE SKOR BÖLÜMÜ */}
              <div className="flex items-center justify-between px-1 my-4">
                
                {/* SOL TAKIM */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 border border-slate-700/50 rounded-full flex items-center justify-center mb-2 p-1.5 shadow-lg overflow-hidden relative">
                    <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-md transform scale-[1.20]" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-white text-center uppercase leading-tight drop-shadow">{match.homeTeam}</span>
                </div>

                {/* SKOR VE GERİ SAYIM */}
                <div className="shrink-0 px-2 sm:px-4 flex flex-col items-center">
                  <div className="bg-amber-500 text-slate-950 font-extrabold text-lg sm:text-2xl px-4 py-1.5 rounded-md shadow-[0_0_15px_rgba(245,158,11,0.4)] whitespace-nowrap mb-1.5">
                    {isLive || isFinished ? `${homeScore} - ${awayScore}` : '- : -'}
                  </div>
                  {!isLive && !isFinished && countdownText && (
                    <div className="bg-slate-950/90 border border-cyan-800/60 px-2 py-0.5 rounded text-[10px] sm:text-xs text-cyan-300 font-mono tracking-widest shadow-inner">
                      {countdownText}
                    </div>
                  )}
                </div>

                {/* SAĞ TAKIM */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 border border-slate-700/50 rounded-full flex items-center justify-center mb-2 p-1.5 shadow-lg overflow-hidden relative">
                    <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-md transform scale-[1.20]" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-white text-center uppercase leading-tight drop-shadow">{match.awayTeam}</span>
                </div>

              </div>
            </div>

            {/* 🔴 CANLI BİLENLER ALANI (Dinamic Footer) */}
            <div className="mt-2 pt-2.5 border-t border-slate-700/80 flex flex-col justify-between items-stretch">
              <div className="flex justify-between items-center w-full">
                <div className="text-left flex-1">
                  {!isLive && !isFinished ? (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-300 italic drop-shadow">Henüz oynanmadı</span>
                  ) : winnersCount === 0 ? (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-300 italic drop-shadow">Şu an bilen yok</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-200 drop-shadow">
                      <strong className="text-amber-400">Şu an {winnersCount} kişi</strong> isabetli
                    </span>
                  )}
                </div>
                <div className="flex-0 text-center px-1">
                  <span className={`text-[9px] font-black tracking-tight whitespace-nowrap px-2 py-0.5 rounded border block ${tagClass}`}>
                    {isTffMatch ? "TFF MAÇI" : "DFO MAÇI"}
                  </span>
                </div>
                <div className="text-right flex-1">
                  {winnersCount > 0 && (
                    <button onClick={() => toggleWinners(match.id)} className="text-amber-400 hover:text-amber-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap drop-shadow">
                      {isWinnersOpen ? "Gizle ▲" : "Tahminleri gör →"}
                    </button>
                  )}
                </div>
              </div>
              
              {/* AÇILAN KUTU - ŞU AN DOĞRU BİLENLERİN LİSTESİ */}
              {isWinnersOpen && winnersCount > 0 && (
                <div className="w-full mt-2.5 p-2.5 bg-slate-950/95 rounded-lg border border-slate-800 text-xs animate-fadeIn">
                  <div className="text-slate-400 font-semibold mb-1.5 border-b border-slate-800 pb-1 flex justify-between items-center text-[10px] sm:text-[11px]">
                    <span>ŞU AN BİLEN YARIŞMACILAR</span>
                    <span className="text-amber-400 animate-pulse">🔴 CANLI</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                    {currentWinners.map((winner: string, idx: number) => (
                      <span key={idx} className="bg-slate-800 text-slate-200 border border-slate-700/80 px-2 py-0.5 rounded text-[9px] sm:text-[10px]">
                        {winner}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}