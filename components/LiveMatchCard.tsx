'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/utils/supabase';
import {
  staticPlayersList,
  getTodayDateString,
  parseDateLocal,
  generateTimeOptions,
  generateWeekDates,
  getUniqueMatchId,
  isTffMatchCheck,
  getMatchTimeMs,
  getEliteTheme,
  localTeamLogos,
  getLocalLogoUrl
} from '@/utils/themeEngine';

const timeOptionsArr = generateTimeOptions();

export default function CanliYayinMerkezi() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
  }, []);

  const [mergedPlayers, setMergedPlayers] = useState<Record<string, string>>(staticPlayersList);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const previousScoresRef = useRef<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [adminScores, setAdminScores] = useState<Record<string, { home: string, away: string }>>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<Record<string, boolean>>({});
  const [distributedMatches, setDistributedMatches] = useState<Record<string, boolean>>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, Record<string, string>>>({}); 
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<string, any>>({}); 
  const [activeWeeks, setActiveWeeks] = useState<number[]>([]);

  const fetchAllSystemPlayers = async () => {
    const { data } = await supabase.from('players').select('*').order('name');
    if (data) {
       const newMergedMap = { ...staticPlayersList };
       data.forEach((p: any) => {
          newMergedMap[String(p.username)] = p.name; 
       });
       setMergedPlayers(newMergedMap); 
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
       audioRef.current = new Audio('/sounds/goal.mp3');
       audioRef.current.load(); 
    }
    fetchAllSystemPlayers();
  }, []);

  const handleSoundToggle = () => {
     const newState = !isSoundEnabled;
     setIsSoundEnabled(newState);
     if (newState && audioRef.current) {
         audioRef.current.muted = true;
         audioRef.current.play().then(() => {
             audioRef.current!.pause();
             audioRef.current!.currentTime = 0;
             audioRef.current!.muted = false; 
         }).catch(e => console.log("Ses kilidi açılamadı:", e));
     }
  };

  // 🔥 KARARGAH ANA RADARI: AKTİF OLAN TÜM HAFTALARI BUL VE ÇEK 🔥
  useEffect(() => {
    const fetchLiveAdminData = async () => {
      const todayDateStr = getTodayDateString();
      const todayDate = parseDateLocal(todayDateStr);
      todayDate.setHours(0,0,0,0);

      const { data: allBulten } = await supabase.from('matches_bulletin').select('*').order('week_num', { ascending: true }).order('match_index', { ascending: true });
      if (!allBulten) return;

      const relevantMatches = allBulten.filter(m => {
          const matchTimeMs = getMatchTimeMs(m.match_date, m.match_time);
          const isWithinLast5Hours = (now - matchTimeMs) >= 0 && (now - matchTimeMs) <= (5 * 60 * 60 * 1000);
          return m.match_date === todayDateStr || isWithinLast5Hours;
      });

      const relevantWeeksSet = new Set<number>(relevantMatches.map(m => m.week_num));
      const relevantWeeksArray = Array.from(relevantWeeksSet);
      setActiveWeeks(relevantWeeksArray);

      if (relevantWeeksArray.length === 0) {
          const upcomingMatches = allBulten.filter(d => parseDateLocal(d.match_date) >= todayDate).sort((a,b) => parseDateLocal(a.match_date).getTime() - parseDateLocal(b.match_date).getTime());
          if (upcomingMatches.length > 0) {
              relevantWeeksArray.push(upcomingMatches[0].week_num);
              setActiveWeeks([upcomingMatches[0].week_num]);
          } else {
             const maxWeek = Math.max(...allBulten.map(m => m.week_num));
             relevantWeeksArray.push(maxWeek);
             setActiveWeeks([maxWeek]);
          }
      }

      const targetBulten = allBulten.filter(m => relevantWeeksArray.includes(m.week_num));
      setLiveMatchesDB(targetBulten);

      const idsToFetch = targetBulten.map((m: any) => getUniqueMatchId(m.week_num, m.match_index));
      let liveData: any[] = [];
      if (idsToFetch.length > 0) {
         const { data } = await supabase.from('live_matches').select('*').in('id', idsToFetch);
         if (data) liveData = data;
      }

      let allPredictions: any[] = [];
      for (const week of relevantWeeksArray) {
          let fetchMore = true;
          let from = 0;
          const step = 1000;
          while (fetchMore) {
              const { data: pDataChunk, error } = await supabase
                .from('player_predictions')
                .select('*')
                .eq('week_num', week)
                .order('user_id', { ascending: true })
                .order('match_index', { ascending: true })
                .range(from, from + step - 1);
              if (error) break;
              if (pDataChunk && pDataChunk.length > 0) {
                 allPredictions = [...allPredictions, ...pDataChunk];
                 if (pDataChunk.length < step) fetchMore = false; else from += step; 
              } else { fetchMore = false; }
          }
      }

      const initialScores: Record<string, { home: string, away: string }> = {};
      const lockedMatches: Record<string, boolean> = {};
      const infoMap: Record<string, any> = {}; 
      let goalHappened = false;

      targetBulten.forEach(m => {
         const uniqueId = String(getUniqueMatchId(m.week_num, m.match_index));
         const liveInfo = liveData.find(l => String(l.id) === uniqueId);

         if (liveInfo) {
           initialScores[uniqueId] = { home: liveInfo.home_score, away: liveInfo.away_score };
           infoMap[uniqueId] = liveInfo; 

           if (liveInfo.status === 'FINISHED') lockedMatches[uniqueId] = true;

           if (liveInfo.home_score !== '-' && liveInfo.away_score !== '-') {
             const newTotal = parseInt(liveInfo.home_score) + parseInt(liveInfo.away_score);
             const prevTotal = previousScoresRef.current[uniqueId];
             if (prevTotal !== undefined && newTotal > prevTotal) goalHappened = true;
             previousScoresRef.current[uniqueId] = newTotal;
           }
         } else {
           initialScores[uniqueId] = { home: "-", away: "-" };
         }
      });

      setAdminScores(initialScores);
      setDistributedMatches(lockedMatches);
      setLiveInfoStateMap(infoMap);

      if (goalHappened && isSoundEnabled && audioRef.current) {
         audioRef.current.currentTime = 0; 
         audioRef.current.play().catch(e => console.log("Ses çalınamadı:", e));
      }

      if (allPredictions.length > 0) {
         const pMap: Record<string, Record<string, string>> = {};
         allPredictions.forEach(row => {
            const rowUserId = String(row.user_id);
            if(!pMap[rowUserId]) pMap[rowUserId] = {};
            const matchKey = String(getUniqueMatchId(row.week_num, row.match_index));
            pMap[rowUserId][matchKey] = row.predicted_score;
         });
         setPredictionsDB(pMap);
      }
    };

    fetchLiveAdminData();
    const channel = supabase.channel('public:live_matches')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, payload => {
            fetchLiveAdminData();
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isSoundEnabled, now]);

  // TS Hatasını çözen kalkan
  const toggleWinners = (id: string) => setOpenWinnersMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const displayedMatches = liveMatchesDB.filter(match => {
      const uniqueId = String(getUniqueMatchId(match.week_num, match.match_index));
      const logInfo = liveInfoStateMap[uniqueId];
      const status = logInfo?.status || 'NOT_STARTED';

      const isLive = status === 'LIVE' || status === 'WAITING_APPROVAL' || status === 'HT';
      const isToday = match.match_date === getTodayDateString();

      const matchTimeMs = getMatchTimeMs(match.match_date, match.match_time);
      const isWithinLast5Hours = (now - matchTimeMs) >= 0 && (now - matchTimeMs) <= (5 * 60 * 60 * 1000);

      if (isLive || isWithinLast5Hours || isToday) return true;
      return false; 
  });

  const sortedDisplayedMatches = displayedMatches.sort((a, b) => {
     const timeA = getMatchTimeMs(a.match_date, a.match_time);
     const timeB = getMatchTimeMs(b.match_date, b.match_time);
     return timeA - timeB;
  });

  const weeklyStatsList = useMemo(() => {
     const statsPerWeek: Record<number, any> = {};

     activeWeeks.forEach(targetWeek => {
         const stats: Record<string, { points: number, exactScores: number }> = {};
         Object.keys(mergedPlayers).forEach(uid => { stats[uid] = { points: 0, exactScores: 0 }; });

         const weekMatches = liveMatchesDB.filter(m => m.week_num === targetWeek);
         
         weekMatches.forEach(match => {
             const uniqueId = String(getUniqueMatchId(match.week_num, match.match_index));
             const hScore = adminScores[uniqueId]?.home || "-";
             const aScore = adminScores[uniqueId]?.away || "-";

             if (hScore !== "-" && aScore !== "-") {
                 const targetScore = `${hScore}-${aScore}`;
                 const predsSource = predictionsDB;

                 const winners = Object.keys(predsSource).filter(uid => {
                     return predsSource[uid] && predsSource[uid][uniqueId] === targetScore;
                 });

                 const wCount = winners.length;
                 let pts = 0;
                 if (wCount === 1) pts = 12;
                 else if (wCount === 2) pts = 6;
                 else if (wCount === 3) pts = 5;
                 else if (wCount === 4) pts = 4;
                 else if (wCount === 5) pts = 3;
                 else if (wCount === 6) pts = 2;
                 else if (wCount >= 7) pts = 1;

                 winners.forEach(uid => {
                     if (stats[uid]) {
                         stats[uid].points += pts;
                         stats[uid].exactScores += 1;
                     }
                 });
             }
         });

         let maxPts = 0;
         let maxScores = 0;
         Object.values(stats).forEach(s => {
             if (s.points > maxPts) maxPts = s.points;
             if (s.exactScores > maxScores) maxScores = s.exactScores;
         });

         let pLeadersArray: string[] = [];
         let sLeadersArray: string[] = [];

         if (maxPts > 0) pLeadersArray = Object.keys(stats).filter(uid => stats[uid].points === maxPts);
         if (maxScores > 0) sLeadersArray = Object.keys(stats).filter(uid => stats[uid].exactScores === maxScores);

         statsPerWeek[targetWeek] = { maxPts, maxScores, pLeadersArray, sLeadersArray };
     });

     return statsPerWeek;
  }, [adminScores, predictionsDB, liveMatchesDB, mergedPlayers, activeWeeks]);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans pb-24 relative">
      <div className="max-w-7xl mx-auto pt-6">

        {activeWeeks.map(week => {
           const wStats = weeklyStatsList[week];
           if(!wStats) return null;
           return (
            <div key={`radar-${week}`} className="mb-8 p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.3)]">
                <h2 className="text-center font-black text-blue-400 text-sm tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
                    <span className="text-xl">🏆</span> {week}. HAFTA CANLI LİDERLİK RADARI
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center">
                        <span className="text-emerald-400 text-[10px] font-bold tracking-widest mb-1">🔥 PUAN LİDERİ</span>
                        <span className="text-white font-black text-sm uppercase text-center leading-snug">
                            {wStats.pLeadersArray.length > 0 
                                ? wStats.pLeadersArray.map((uid: string) => mergedPlayers[uid]).join(' & ') 
                                : 'MÜSTAKİL LİDER YOK'}
                        </span>
                        <span className="text-emerald-500 font-bold text-xs mt-1 bg-emerald-950/50 px-2 rounded">
                            {wStats.pLeadersArray.length > 0 ? `${wStats.maxPts} PUAN TOPLADI` : '---'}
                        </span>
                    </div>

                    <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center">
                        <span className="text-amber-400 text-[10px] font-bold tracking-widest mb-1">⚽ SKOR KRALI</span>
                        <span className="text-white font-black text-sm uppercase text-center leading-snug">
                            {wStats.sLeadersArray.length > 0 
                                ? wStats.sLeadersArray.map((uid: string) => mergedPlayers[uid]).join(' & ') 
                                : 'MÜSTAKİL KRAL YOK'}
                        </span>
                        <span className="text-amber-500 font-bold text-xs mt-1 bg-amber-950/50 px-2 rounded">
                            {wStats.sLeadersArray.length > 0 ? `${wStats.maxScores} MAÇ BİLDİ` : '---'}
                        </span>
                    </div>
                </div>
            </div>
           )
        })}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              🔴 CANLI YAYIN MERKEZİ
            </h1>
            <p className="text-slate-400 text-xs mt-1 flex items-center justify-center sm:justify-start gap-2">
              Bugün oynanan tüm maçların anlık skorları ve kazandırdığı puanlar.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
             <button 
                onClick={handleSoundToggle}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                    isSoundEnabled ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500' : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:bg-slate-800'
                }`}
             >
                {isSoundEnabled ? '🔊 GOL SESİ AÇIK' : '🔇 GOL SESİ KAPALI'}
             </button>
          </div>
        </div>

        {sortedDisplayedMatches.length === 0 ? (
             <div className="w-full py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl shadow-inner">
                <span className="text-5xl mb-4 block opacity-50">📡</span>
                <h2 className="text-xl font-bold mb-2 tracking-widest uppercase text-slate-400">
                   ŞU AN EKRANDA OYNANAN AKTİF BİR MAÇ BULUNMUYOR
                </h2>
             </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {sortedDisplayedMatches.map((match) => {
            const uniqueId = String(getUniqueMatchId(match.week_num, match.match_index));
            const isWinnersOpen = !!openWinnersMap[uniqueId];
            const isTffMatch = isTffMatchCheck(match.category);

            const homeTeamUpper = match.home_team?.toUpperCase() || match.homeTeam?.toUpperCase() || "";
            const awayTeamUpper = match.away_team?.toUpperCase() || match.awayTeam?.toUpperCase() || "";

            const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);

            const homeScore = adminScores[uniqueId]?.home || "-";
            const awayScore = adminScores[uniqueId]?.away || "-";

            let currentWinners: string[] = [];
            let winnersCount = 0;
            let displayPoints = 0;

            if (homeScore !== "-" && awayScore !== "-") {
              const targetScore = `${homeScore}-${awayScore}`;
              let predictionsSource = predictionsDB;

              currentWinners = Object.keys(predictionsSource)
                .filter(uid => {
                    return predictionsSource[uid] && predictionsSource[uid][uniqueId] === targetScore;
                })
                .map(uid => mergedPlayers[uid] || "Bilinmeyen")
                .sort((a, b) => a.localeCompare(b, 'tr'));

              winnersCount = currentWinners.length;

              if(winnersCount === 1) displayPoints = 12;
              else if(winnersCount === 2) displayPoints = 6;
              else if(winnersCount === 3) displayPoints = 5;
              else if(winnersCount === 4) displayPoints = 4;
              else if(winnersCount === 5) displayPoints = 3;
              else if(winnersCount === 6) displayPoints = 2;
              else if(winnersCount >= 7) displayPoints = 1;
              else displayPoints = 0;
            }

            return (
              <div key={uniqueId} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center">
                  {theme.bgImg && (
                    <>
                      <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                      <div className="absolute inset-0 bg-slate-900/40 z-0"></div>
                    </>
                  )}
                  <div className="relative z-10 flex flex-col h-full justify-between">

                    <div className="flex flex-col items-center justify-center mb-2 sm:mb-4 gap-1.5 sm:gap-2">
                      <span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md backdrop-blur-sm">
                        {match.week_num}. HAFTA | {match.match_index}. MAÇ ({match.match_date} - {match.match_time})
                      </span>
                      <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                        🏆 {match.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-0 sm:px-4">
                      <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                          <img src={theme.homeLogo} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{homeTeamUpper}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-24 sm:w-36 z-30">
                        <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                          <span className="bg-transparent text-2xl sm:text-4xl font-black text-amber-400 drop-shadow-md text-center">
                            {homeScore}
                          </span>
                          <span className={`text-xl sm:text-3xl font-bold ${theme.colonText}`}>-</span>
                          <span className="bg-transparent text-2xl sm:text-4xl font-black text-amber-400 drop-shadow-md text-center">
                            {awayScore}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                         <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                          <img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{awayTeamUpper}</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className={`${theme.bottomBar} border-t px-4 py-4 w-full backdrop-blur-md z-10 relative min-h-[90px]`}>
                  <div className="flex items-center justify-between mb-3 w-full">
                     <div className="flex items-center gap-2">
                         <span className="text-red-500 text-sm drop-shadow-md">🎯</span> 
                         <span className="text-amber-500 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
                             {winnersCount > 0 ? `${winnersCount} KİŞİ BİLDİ (Kişi Başı: ${displayPoints} Puan)` : "BU SKORU BİLEN YOK"}
                         </span>
                     </div>
                     <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                        {isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI"}
                     </span>
                     {winnersCount > 0 && (
                        <button onClick={() => toggleWinners(uniqueId)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap drop-shadow-sm">
                          {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                        </button>
                     )}
                  </div>

                  {isWinnersOpen && winnersCount > 0 && (
                     <div className="flex items-center justify-center border-t border-slate-700/50 pt-3 animate-fadeIn">
                        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                           {currentWinners.map((p, i) => (
                               <span key={i} className="bg-slate-950/80 border px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold text-white shadow-sm uppercase tracking-wider border-slate-600/50">
                                  {p}
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
        )}

      </div>
    </div>
  );
}