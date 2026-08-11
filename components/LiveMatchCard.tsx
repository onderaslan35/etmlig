'use client';

import React, { useState, useEffect } from 'react';

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN", "262714": "İSMAİL EKER", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY", "262723": "AYHAN LUŞOĞLU",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA"
};

// 🔴 EKMEL - GÜNCEL 4. HAFTA TAHMİNLERİ
const week4PredictionsData: Record<string, string[]> = {
  "262711": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2"],
  "262734": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1"],
  "262721": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1"],
  "262758": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0"],
  "262716": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0"],
  "262733": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0"],
  "262744": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1"],
  "262763": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0"],
  "262813": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1"],
  "262816": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1"],
  "262718": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1"],
  "262731": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1"],
  "262755": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0"],
  "262749": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0"],
  "262726": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1"],
  "262736": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0"],
  "262707": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1"],
  "262771": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1"],
  "262725": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2"],
  "262702": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1"],
  "351925": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0"],
  "262728": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1"], 
  "262738": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1"],
  "262730": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0"],
  "262719": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2"],
  "262772": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1"],
  "262774": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1"],
  "262723": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1"],
  "262706": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2"],
  "262740": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0"],
  "262756": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2"],
  "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2"],
  "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1"],
  "262705": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1"],
  "262753": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2"],
  "262750": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1"],
  "262770": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0"],
  "262754": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0"],
  "262747": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1"],
  "262714": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1"],
  "262717": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1"],
  "262703": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1"],
  "262732": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1"],
  "262709": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2"],
  "262782": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1"],
  "262708": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1"],
  "262739": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0"]
};

const localTeamLogos: Record<string, string> = {
  "FENERBAHÇE": "/logos/fenerbahce.png",
  "STURM GRAZ": "/logos/sturm-graz.png",
  "PARIS SAINT-GERMAIN": "/logos/psg.png",
  "ASTON VILLA": "/logos/aston-villa.png",
  "BEŞİKTAŞ": "/logos/besiktas.png",
  "KARABAĞ FK": "/logos/karabag.png",
  "DINAMO KIEV": "/logos/dinamo-kiev.png",
  "HRADEC KRALOVE": "/logos/hradec.png"
};

const week4Matches = [
  { id: 1, weekLabel: "4. HAFTA - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" }
];

export default function LiveMatchCard() {
  const [todaysMatches, setTodaysMatches] = useState<any[]>([]);
  
  // 🔴 SENARYO MOTORU DURUMLARI (DK 78'DEN BAŞLAR)
  const [simMinute, setSimMinute] = useState(78);
  const [simHomeScore, setSimHomeScore] = useState(0);
  const [simAwayScore, setSimAwayScore] = useState(0);
  const [simStatus, setSimStatus] = useState('LIVE');
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}.${month}.${year}`;
    setTodaysMatches(week4Matches.filter(m => m.date === formattedToday));

    // 🔴 EKMEL - CANLI SİNEMA MOTORU 🔴
    let currentMin = 78;
    const interval = setInterval(() => {
      currentMin++;
      setSimMinute(currentMin);

      // DAKİKA 88 OLDUĞUNDA FENERBAHÇE GOL ATAR! (0-1 OLUR)
      if(currentMin === 88) {
        setSimAwayScore(1); 
      }
      // DAKİKA 92 OLDUĞUNDA MAÇ BİTER!
      if(currentMin >= 92) {
        clearInterval(interval);
        setSimStatus('FINISHED');
      }
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  // 🔴 PUANLARI DAĞIT VE EKRANI CANLI GÜNCELLE
  useEffect(() => {
    const targetScore = `${simHomeScore}-${simAwayScore}`;
    const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][0] === targetScore);
    
    let points = 1;
    if(winnerIds.length === 1) points = 12;
    else if(winnerIds.length === 2) points = 6;
    else if(winnerIds.length === 3) points = 5;
    else if(winnerIds.length === 4) points = 4;
    else if(winnerIds.length === 5) points = 3;
    else if(winnerIds.length === 6) points = 2;
    else if(winnerIds.length === 0) points = 0;

    const currentBoard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');
    Object.keys(currentBoard).forEach(id => {
      currentBoard[id] = { ...currentBoard[id], dfo: 0, master: 0, skor: 0 };
    });

    winnerIds.forEach(wId => {
      currentBoard[wId] = { ...currentBoard[wId], dfo: points, master: points, skor: 1 };
    });

    localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(currentBoard));
    window.dispatchEvent(new Event('leaderboardUpdate'));

  }, [simHomeScore, simAwayScore]);

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] })); 
  };

  const isTffMatchCheck = (category: string) => {
    const uppercaseCat = category.toUpperCase();
    return uppercaseCat.includes("TÜRKİYE SÜPER LİG") || uppercaseCat.includes("TÜRKİYE 1.LİG") || uppercaseCat.includes("TFF");
  };

  if (todaysMatches.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
      {todaysMatches.map((match) => {
        const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
        const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";
        const isWinnersOpen = openWinnersMap[match.id] !== false;
        const isTffMatch = isTffMatchCheck(match.category);

        const targetScore = `${simHomeScore}-${simAwayScore}`;
        const currentWinners = Object.keys(week4PredictionsData)
          .filter(id => week4PredictionsData[id][match.id - 1] === targetScore)
          .map(id => allPlayersList[id])
          .sort((a, b) => a.localeCompare(b, 'tr'));
        
        const winnersCount = currentWinners.length;

        let displayPoints = 1;
        if(winnersCount === 1) displayPoints = 12;
        else if(winnersCount === 2) displayPoints = 6;
        else if(winnersCount === 3) displayPoints = 5;
        else if(winnersCount === 4) displayPoints = 4;
        else if(winnersCount === 5) displayPoints = 3;
        else if(winnersCount === 6) displayPoints = 2;

        return (
          <div key={match.id} className="w-full max-w-lg bg-[#0a1120] border border-emerald-500/60 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] overflow-hidden transition-all duration-500 flex flex-col">
            
            <div className="p-4 sm:p-6 relative flex-grow">
              <div className="absolute top-0 right-0 bg-red-600 text-white font-black px-3 py-1 rounded-bl-xl text-[10px] animate-pulse shadow-lg">
                🔴 EKMEL SİNEMA MOTORU AKTİF
              </div>

              <div className="text-center mb-6 mt-3">
                <span className="text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-wider flex justify-center items-center gap-2 drop-shadow-md">
                  🏆 {match.category}
                </span>
              </div>

              <div className="flex items-center justify-between px-2 sm:px-6">
                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#141e33] border border-slate-700/60 rounded-full flex items-center justify-center p-3 shadow-lg relative overflow-hidden">
                    <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-lg transform scale-110" />
                  </div>
                  <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide drop-shadow-md">{match.homeTeam}</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-2.5 mx-2 sm:mx-4 w-28 sm:w-32 z-10">
                  <div className="bg-red-950/80 border border-red-700 px-4 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-red-500 text-xs font-black tracking-widest">{simStatus === 'LIVE' ? `CANLI ${simMinute}'` : 'MS (BİTTİ)'}</span>
                  </div>

                  <div className="w-full bg-[#080d1a] border border-emerald-600/50 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-md">{simHomeScore}</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-600">:</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-md">{simAwayScore}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#141e33] border border-slate-700/60 rounded-full flex items-center justify-center p-3 shadow-lg relative overflow-hidden">
                    <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-lg transform scale-110" />
                  </div>
                  <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide drop-shadow-md">{match.awayTeam}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141e33] border-t border-slate-700/80 px-4 py-3 w-full transition-all duration-300">
              <div className="flex justify-between items-center w-full">
                
                <div className="text-left flex-1">
                  <span className="text-[10px] sm:text-xs font-medium text-slate-200">
                    <strong className="text-emerald-400">{winnersCount} kişi</strong> tam isabetli
                  </span>
                </div>
                
                <div className="flex-0 text-center px-1">
                  <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${isTffMatch ? "text-red-400 bg-red-950/90 border-red-500/80" : "text-cyan-300 bg-cyan-950/90 border-cyan-400/80"}`}>
                    {isTffMatch ? "TFF LİGİ MAÇI" : "MASTER & DFO MAÇI"}
                  </span>
                </div>

                <div className="text-right flex-1">
                  {winnersCount > 0 && (
                    <button onClick={() => toggleWinners(match.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap">
                      {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                    </button>
                  )}
                </div>
                
              </div>
              
              {isWinnersOpen && winnersCount > 0 && (
                <div className="w-full mt-3 p-3 bg-[#0a1120] rounded-lg border border-emerald-900/50 text-xs animate-fadeIn shadow-inner">
                  <div className="text-slate-400 font-semibold mb-2 border-b border-slate-800 pb-1.5 flex justify-between items-center text-[10px] sm:text-[11px]">
                    <span>CANLI SKOR BİLENLER (A-Z)</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded">Kişi Başı: {displayPoints} Puan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentWinners.map((winner: string, idx: number) => (
                      <span key={idx} className={`border px-2 py-1 rounded text-[9px] sm:text-[10px] font-medium transition-all duration-500 ${winner === "ÖNDER ASLAN" ? "bg-emerald-900 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-800 text-slate-200 border-slate-700/80"}`}>
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