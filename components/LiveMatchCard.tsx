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
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA"
};

const week4PredictionsData: Record<string, string[]> = {
  "262711": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2"], "262734": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1"],
  "262721": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1"], "262758": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0"],
  "262716": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0"], "262733": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0"],
  "262744": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1"], "262763": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0"],
  "262813": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1"], "262816": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1"],
  "262718": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1"], "262731": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1"],
  "262755": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0"], "262749": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0"],
  "262726": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1"], "262736": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0"],
  "262707": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1"], "262771": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1"],
  "262725": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2"], "262702": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1"],
  "351925": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0"], "262728": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1"], 
  "262738": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1"], "262730": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0"],
  "262719": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2"], "262772": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1"],
  "262774": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1"], "262723": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1"],
  "262706": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2"], "262740": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0"],
  "262756": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2"], "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2"],
  "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1"], "262705": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1"],
  "262753": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2"], "262750": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1"],
  "262770": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0"], "262754": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0"],
  "262747": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1"], "262714": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1"],
  "262717": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1"], "262703": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1"],
  "262732": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1"], "262709": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2"],
  "262782": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0"], "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1"]
};

const localTeamLogos: Record<string, string> = {
  "FENERBAHÇE": "/logos/fenerbahce.png", "STURM GRAZ": "/logos/sturm-graz.png",
  "PARIS SAINT-GERMAIN": "/logos/psg.png", "ASTON VILLA": "/logos/aston-villa.png",
  "BEŞİKTAŞ": "/logos/besiktas.png", "KARABAĞ FK": "/logos/karabag.png",
  "DINAMO KIEV": "/logos/dinamo-kiev.png", "HRADEC KRALOVE": "/logos/hradec.png",
  "KAIRAT ALMATY": "/logos/kairat.png", "LEVSKI SOFIA": "/logos/levski.png"
};

const week4Matches = [
  { id: 1, weekLabel: "4. HAFTA - 1. MAÇ (GERÇEK TEST)", category: "CHAMPIONS LEAGUE ELEME TUR 3", date: "11.08.2026", time: "18:00", homeTeam: "KAIRAT ALMATY", awayTeam: "LEVSKI SOFIA" }
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

    // 🔴 EKMEL HAYALET KURYESİ (CLIENT-SIDE FETCH) 🔴
    const fetchAllLiveScores = async () => {
      const newData: Record<number, any> = {};
      
      // Saat farklarına karşı garantili tarih
      const trTime = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));
      const dateStr = `${trTime.getFullYear()}${String(trTime.getMonth() + 1).padStart(2, '0')}${String(trTime.getDate()).padStart(2, '0')}`;

      for (const match of matchesForToday) {
        try {
          // Vercel'i pas geçip, senin tarayıcın üzerinden FotMob'a AllOrigins maskesiyle gidiyoruz
          const targetUrl = `https://www.fotmob.com/api/matches?date=${dateStr}`;
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
          
          const res = await fetch(proxyUrl, { cache: 'no-store' });
          if (!res.ok) continue;

          const proxyData = await res.json();
          // JSON stringini normal objeye çeviriyoruz
          if (!proxyData.contents) continue;
          const data = JSON.parse(proxyData.contents);
          
          // İlk 4 harf ile radar eşleştirmesi
          const homeKeyword = match.homeTeam.substring(0, 4).toUpperCase();
          const awayKeyword = match.awayTeam.substring(0, 4).toUpperCase();
          
          let matchFound = null;

          if (data && data.leagues) {
            for (const league of data.leagues) {
              if (!league.matches) continue;
              for (const m of league.matches) {
                const fotmobHome = (m.home?.name || '').toUpperCase();
                const fotmobAway = (m.away?.name || '').toUpperCase();
                
                if (fotmobHome.includes(homeKeyword) && fotmobAway.includes(awayKeyword)) {
                  matchFound = m;
                  break;
                }
              }
              if (matchFound) break;
            }
          }

          if (matchFound) {
            const isFinished = matchFound.status?.finished || matchFound.status?.type === 'finished';
            const isStarted = matchFound.status?.started || matchFound.status?.type === 'inprogress' || matchFound.status?.liveTime != null;
            const isCancelled = matchFound.status?.cancelled || matchFound.status?.type === 'cancelled';
            
            let status = 'NOT_STARTED';
            if (isFinished) status = 'FINISHED';
            else if (isStarted && !isCancelled) status = 'LIVE';

            let hScore = matchFound.home?.score ?? 0;
            let aScore = matchFound.away?.score ?? 0;
            
            if (matchFound.status?.scoreStr) {
               const scoreParts = matchFound.status.scoreStr.split('-');
               if (scoreParts.length === 2) {
                  hScore = parseInt(scoreParts[0].trim());
                  aScore = parseInt(scoreParts[1].trim());
               }
            }

            newData[match.id] = {
              status: status,
              homeScore: isNaN(hScore) ? 0 : hScore,
              awayScore: isNaN(aScore) ? 0 : aScore,
              matchTime: matchFound.status?.liveTime?.short || "1'"
            };
          }
        } catch (err) {
          console.log("Client-Side Fetch Hatası: ", err);
        }
      }
      
      if (Object.keys(newData).length > 0) setLiveData(newData);
    };

    if (matchesForToday.length > 0) {
      fetchAllLiveScores(); // İlk çekim
      const interval = setInterval(fetchAllLiveScores, 15000); // 15 saniyede bir senin tarayıcından sessizce çeker
      return () => clearInterval(interval);
    }
  }, []);

  // CANLI PUAN MOTORU
  useEffect(() => {
    if (todaysMatches.length === 0) return;

    const currentBoard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');
    let changed = false;

    Object.keys(currentBoard).forEach(id => {
      if(currentBoard[id].dfo !== 0 || currentBoard[id].master !== 0 || currentBoard[id].skor !== 0) {
        currentBoard[id] = { ...currentBoard[id], dfo: 0, master: 0, skor: 0 };
        changed = true;
      }
    });

    todaysMatches.forEach(match => {
      const data = liveData[match.id];
      if (data && (data.status === 'LIVE' || data.status === 'FINISHED')) {
        const targetScore = `${data.homeScore}-${data.awayScore}`;
        const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][match.id - 1] === targetScore);
        
        let points = 1;
        if(winnerIds.length === 1) points = 12;
        else if(winnerIds.length === 2) points = 6;
        else if(winnerIds.length === 3) points = 5;
        else if(winnerIds.length === 4) points = 4;
        else if(winnerIds.length === 5) points = 3;
        else if(winnerIds.length === 6) points = 2;
        else if(winnerIds.length === 0) points = 0;

        winnerIds.forEach(wId => {
          if(!currentBoard[wId]) currentBoard[wId] = {};
          currentBoard[wId].dfo = (currentBoard[wId].dfo || 0) + points;
          currentBoard[wId].master = (currentBoard[wId].master || 0) + points;
          currentBoard[wId].skor = (currentBoard[wId].skor || 0) + 1;
          changed = true;
        });
      }
    });

    if (changed) {
      localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(currentBoard));
      window.dispatchEvent(new Event('leaderboardUpdate')); 
    }
  }, [liveData, todaysMatches]);

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
        const data = liveData[match.id] || {};
        const isLive = data.status === 'LIVE';
        const isFinished = data.status === 'FINISHED';
        const homeScore = data.homeScore !== undefined ? data.homeScore : (isLive || isFinished ? "0" : "-");
        const awayScore = data.awayScore !== undefined ? data.awayScore : (isLive || isFinished ? "0" : "-");
        
        const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
        const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";
        const isWinnersOpen = openWinnersMap[match.id] !== false;
        const isTffMatch = isTffMatchCheck(match.category);

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
        else if(winnersCount === 0) displayPoints = 0;

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

        return (
          <div key={match.id} className="w-full max-w-lg bg-[#0a1120] border border-cyan-500/60 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden transition-all duration-500 flex flex-col mt-4">
            
            <div className="p-4 sm:p-6 relative flex-grow">
              <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-br-xl text-[10px] animate-pulse shadow-lg z-20">
                🧪 TEST AŞAMASI
              </div>
              <div className="absolute top-0 right-0 bg-cyan-600 text-slate-950 font-black px-3 py-1 rounded-bl-xl text-[10px] shadow-lg z-20">
                ⚡ HAYALET KURYE (CANLI) AKTİF
              </div>

              <div className="text-center mb-6 mt-4">
                <span className="text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-wider flex justify-center items-center gap-2 drop-shadow-md">
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
                  {!isLive && !isFinished ? (
                    <div className="bg-[#141e33] border border-slate-600/80 px-4 py-1 rounded-full shadow-sm">
                      <span className="text-amber-400 text-xs sm:text-sm font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                    </div>
                  ) : isLive ? (
                    <div className="bg-red-950/80 border border-red-700 px-4 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-red-500 text-xs font-black tracking-widest">CANLI {data.matchTime}'</span>
                    </div>
                  ) : (
                    <div className="bg-[#141e33] border border-slate-600/80 px-4 py-1 rounded-full shadow-sm">
                      <span className="text-slate-400 text-xs font-black tracking-widest">MS (BİTTİ)</span>
                    </div>
                  )}

                  <div className="w-full bg-[#080d1a] border border-cyan-600/50 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <span className="text-2xl sm:text-3xl font-black text-cyan-400 drop-shadow-md">{homeScore}</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-600">:</span>
                    <span className="text-2xl sm:text-3xl font-black text-cyan-400 drop-shadow-md">{awayScore}</span>
                  </div>

                  {!isLive && !isFinished && countdownText && (
                    <div className="w-full bg-[#0c2a3b] border border-[#164e63] py-1.5 rounded-lg text-center shadow-md">
                      <span className="text-[#38bdf8] text-[10px] sm:text-xs font-mono font-bold tracking-widest drop-shadow-sm">
                        {countdownText}
                      </span>
                    </div>
                  )}
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
                  {!isLive && !isFinished ? (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                  ) : winnersCount === 0 ? (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic">Şu an skoru bilen yok</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-200">
                      <strong className="text-cyan-400">{winnersCount} kişi</strong> tam isabetli
                    </span>
                  )}
                </div>
                
                <div className="flex-0 text-center px-1">
                  <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${isTffMatch ? "text-red-400 bg-red-950/90 border-red-500/80" : "text-cyan-300 bg-cyan-950/90 border-cyan-400/80"}`}>
                    {isTffMatch ? "TFF LİGİ MAÇI" : "MASTER & DFO MAÇI"}
                  </span>
                </div>

                <div className="text-right flex-1">
                  {winnersCount > 0 && (
                    <button onClick={() => toggleWinners(match.id)} className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap">
                      {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                    </button>
                  )}
                </div>
                
              </div>
              
              {isWinnersOpen && winnersCount > 0 && (
                <div className="w-full mt-3 p-3 bg-[#0a1120] rounded-lg border border-cyan-900/50 text-xs animate-fadeIn shadow-inner">
                  <div className="text-slate-400 font-semibold mb-2 border-b border-slate-800 pb-1.5 flex justify-between items-center text-[10px] sm:text-[11px]">
                    <span>CANLI SKOR BİLENLER (A-Z)</span>
                    <span className="text-cyan-400 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">Kişi Başı: {displayPoints} Puan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentWinners.map((winner: string, idx: number) => (
                      <span key={idx} className={`border px-2 py-1 rounded text-[9px] sm:text-[10px] font-medium transition-all duration-500 bg-cyan-900/80 text-white border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]`}>
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