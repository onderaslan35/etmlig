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

const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1"], "262758": ["1-2", "3-0", "2-0"], "262763": ["1-1", "1-1", "1-1"],
  "262744": ["1-2", "3-1", "1-1"], "262813": ["1-2", "4-1", "1-0"], "351925": ["0-2", "0-0", "2-1"],
  "262732": ["2-1", "2-1", "1-0"], "262754": ["1-1", "1-0", "1-0"], "262733": ["2-1", "3-1", "0-0"],
  "262774": ["0-1", "2-0", "1-0"], "262771": ["2-2", "3-1", "2-1"], "262730": ["0-2", "3-0", "1-0"],
  "262707": ["0-4", "3-0", "2-1"], "262816": ["0-1", "3-1", "0-2"], "262719": ["2-1", "2-1", "2-0"],
  "262725": ["0-2", "2-0", "1-1"], "262711": ["0-1", "3-1", "1-0"], "262718": ["1-2", "4-1", "3-1"],
  "262721": ["0-1", "2-0", "1-0"], "262726": ["1-3", "2-2", "2-2"], "262702": ["0-2", "1-0", "1-1"],
  "262738": ["1-1", "2-1", "1-1"], "262750": ["1-1", "3-1", "2-2"], "262705": ["1-3", "3-1", "2-1"],
  "262706": ["0-2", "4-1", "1-0"], "262716": ["1-1", "3-2", "1-0"], "262736": ["1-2", "2-1", "1-2"],
  "262714": ["1-3", "2-0", "0-2"], "262749": ["2-1", "3-1", "2-0"], "262753": ["1-1", "2-1", "2-0"],
  "262740": ["1-2", "1-1", "2-1"], "262790": ["0-2", "3-1", "0-2"], "262786": ["1-2", "3-1", "3-1"],
  "262734": ["3-0", "4-1", "2-1"], "262756": ["2-2", "3-2", "2-0"], "262703": ["2-2", "1-1", "1-1"],
  "262772": ["0-2", "2-0", "1-1"], "262717": ["1-2", "0-1", "1-1"], "262728": ["0-0", "0-0", "1-0"], // ÖNDER ASLAN BURADA
  "262770": ["3-1", "3-1", "2-2"], "262755": ["1-2", "4-1", "3-2"], "262704": ["1-1", "2-1", "1-1"],
  "262747": ["1-1", "2-0", "1-0"], "262723": ["1-1", "3-1", "2-1"], "262709": ["1-1", "2-1", "2-1"],
  "262739": ["1-0", "3-1", "1-1"]
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
  { id: 1, weekLabel: "4. HAFTA - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, weekLabel: "4. HAFTA - 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SAINT-GERMAIN", awayTeam: "ASTON VILLA" },
  { id: 3, weekLabel: "4. HAFTA - 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "19:00", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" },
  { id: 4, weekLabel: "4. HAFTA - 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "20:00", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" }
];

export default function LiveMatchCard() {
  const [todaysMatches, setTodaysMatches] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<Record<number, any>>({});
  const [now, setNow] = useState<number>(new Date().getTime());
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  
  // 🔴 SİMÜLASYON DEĞİŞKENLERİ
  const simMatchId = 1;
  const simHomeScore = 0;
  const simAwayScore = 0;
  const simStatus = "FINISHED"; // MAÇ BİTTİ DİYE ZORLUYORUZ!

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

    const runSimulation = () => {
      setLiveData(prev => ({
        ...prev,
        [simMatchId]: { status: simStatus, homeScore: simHomeScore, awayScore: simAwayScore }
      }));

      const targetScore = `${simHomeScore}-${simAwayScore}`;
      const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][0] === targetScore);
      
      let points = 1;
      if(winnerIds.length === 1) points = 12;
      else if(winnerIds.length === 2) points = 6;
      else if(winnerIds.length === 3) points = 5;
      else if(winnerIds.length === 4) points = 4;
      else if(winnerIds.length === 5) points = 3;
      else if(winnerIds.length === 6) points = 2;

      const currentBoard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');
      let changed = false;

      winnerIds.forEach(wId => {
        if(!currentBoard[wId]) currentBoard[wId] = {};
        if(currentBoard[wId].dfo !== points || currentBoard[wId].master !== points || currentBoard[wId].skor !== 1) {
            currentBoard[wId].dfo = points;
            currentBoard[wId].master = points;
            currentBoard[wId].skor = 1;
            changed = true;
        }
      });

      if(changed) localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(currentBoard));
    };

    if (matchesForToday.length > 0) runSimulation();
  }, []);

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] })); // Eğer manuel tıklandıysa durumunu tersine çevir
  };

  if (todaysMatches.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
      {todaysMatches.map((match) => {
        const data = liveData[match.id] || {};
        const isLive = data.status === 'LIVE';
        const isFinished = data.status === 'FINISHED';
        const homeScore = data.homeScore !== undefined ? data.homeScore : (isLive || isFinished ? "0" : "-");
        const awayScore = data.awayScore !== undefined ? data.awayScore : (isLive || isFinished ? "0" : "-");
        
        const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
        const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";
        
        // 🔴 EKMEL DOKUNUŞU: BİLENLER KUTUSU ARTIK OTOMATİK AÇIK OLACAK!
        // Eğer kullanıcı manuel olarak kapatmadıysa (false değilse), varsayılan olarak açık (true) kalsın.
        const isWinnersOpen = openWinnersMap[match.id] !== false;

        let currentWinners: string[] = [];
        if ((isLive || isFinished)) {
          const targetScore = `${homeScore}-${awayScore}`;
          currentWinners = Object.keys(week4PredictionsData)
            .filter(id => week4PredictionsData[id][match.id - 1] === targetScore)
            .map(id => allPlayersList[id])
            .sort((a, b) => a.localeCompare(b, 'tr'));
        }
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
              <div className="absolute top-0 right-0 bg-emerald-600 text-slate-950 font-black px-3 py-1 rounded-bl-xl text-[10px] animate-pulse">
                EKMEL SİMÜLASYONU AKTİF
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
                  <div className="bg-emerald-950/80 border border-emerald-700 px-4 py-1 rounded-full shadow-sm">
                    <span className="text-emerald-400 text-xs font-black tracking-widest">MS (BİTTİ)</span>
                  </div>

                  <div className="w-full bg-[#080d1a] border border-emerald-600/50 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-md">{homeScore}</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-600">:</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-md">{awayScore}</span>
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

            <div className="bg-[#141e33] border-t border-slate-700/80 px-4 py-3 w-full">
              <div className="flex justify-between items-center w-full">
                <div className="text-left flex-1">
                  <span className="text-[10px] sm:text-xs font-medium text-slate-200">
                    <strong className="text-emerald-400">{winnersCount} kişi</strong> tam isabetli
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
              
              {/* 🔴 ARTIK VARSAYILAN OLARAK AÇIK! */}
              {isWinnersOpen && winnersCount > 0 && (
                <div className="w-full mt-3 p-3 bg-[#0a1120] rounded-lg border border-emerald-900/50 text-xs animate-fadeIn shadow-inner">
                  <div className="text-slate-400 font-semibold mb-2 border-b border-slate-800 pb-1.5 flex justify-between items-center text-[10px] sm:text-[11px]">
                    <span>BİLEN YARIŞMACILAR (A-Z)</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded">Kişi Başı: {displayPoints} Puan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentWinners.map((winner: string, idx: number) => (
                      <span key={idx} className={`border px-2 py-1 rounded text-[9px] sm:text-[10px] font-medium ${winner === "ÖNDER ASLAN" ? "bg-emerald-900 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-800 text-slate-200 border-slate-700/80"}`}>
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