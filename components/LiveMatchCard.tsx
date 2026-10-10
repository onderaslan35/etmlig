'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/utils/supabase';
import {
  staticPlayersList,
  getTodayDateString,
  parseDateLocal,
  getUniqueMatchId,
  isTffMatchCheck,
  getMatchTimeMs,
  getEliteTheme
} from '@/utils/themeEngine';

export default function CanliYayinMerkezi() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 60000); // Dakikada bir yenile (performans için)
      return () => clearInterval(interval);
  }, []);

  const [mergedPlayers, setMergedPlayers] = useState<Record<string, string>>(staticPlayersList);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const previousScoresRef = useRef<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [adminScores, setAdminScores] = useState<Record<string, { home: string, away: string }>>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<Record<string, boolean>>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, Record<string, string>>>({}); 
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<string, any>>({}); 
  const [activeWeeks, setActiveWeeks] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       audioRef.current = new Audio('/sounds/goal.mp3');
       audioRef.current.load(); 
    }
    const fetchAllSystemPlayers = async () => {
      const { data } = await supabase.from('players').select('*').order('name');
      if (data) {
         const newMergedMap = { ...staticPlayersList };
         data.forEach((p: any) => { newMergedMap[String(p.username)] = p.name; });
         setMergedPlayers(newMergedMap); 
      }
    };
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

  useEffect(() => {
    const fetchLiveAdminData = async () => {
      const todayDateStr = getTodayDateString();
      const todayDate = parseDateLocal(todayDateStr);
      todayDate.setHours(0,0,0,0);

      const { data: allBulten } = await supabase.from('matches_bulletin').select('*').order('week_num', { ascending: true }).order('match_index', { ascending: true });
      if (!allBulten) return;

      // Sadece bugün oynanan veya son 5 saatte bitmiş maçları bul
      const relevantMatches = allBulten.filter(m => {
          const matchTimeMs = getMatchTimeMs(m.match_date, m.match_time);
          const isWithinLast5Hours = (Date.now() - matchTimeMs) >= 0 && (Date.now() - matchTimeMs) <= (5 * 60 * 60 * 1000);
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
      const infoMap: Record<string, any> = {}; 
      let goalHappened = false;

      targetBulten.forEach(m => {
         const uniqueId = String(getUniqueMatchId(m.week_num, m.match_index));
         const liveInfo = liveData.find(l => String(l.id) === uniqueId);

         if (liveInfo) {
           initialScores[uniqueId] = { home: liveInfo.home_score, away: liveInfo.away_score };
           infoMap[uniqueId] = liveInfo; 

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

  const toggleWinners = (id: string) => setOpenWinnersMap((prev) => ({ ...prev, [id]: !prev[id] }));

  // SADECE BUGÜNÜN MAÇLARI VEYA CANLI/YAKINDAKİ MAÇLAR
  const displayedMatches = liveMatchesDB.filter(match => {
      const uniqueId = String(getUniqueMatchId(match.week_num, match.match_index));
      const logInfo = liveInfoStateMap[uniqueId];
      const status = logInfo?.status || 'NOT_STARTED';

      const isLive = status === 'LIVE' || status === 'WAITING_APPROVAL' || status === 'HT';
      const isToday = match.match_date === getTodayDateString();

      const matchTimeMs = getMatchTimeMs(match.match_date, match.match_time);
      const isWithinLast5Hours = (Date.now() - matchTimeMs) >= 0 && (Date.now() - matchTimeMs) <= (5 * 60 * 60 * 1000);

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

         // Herkesi puana göre sırala (Aşağı doğru liste için)
         const sortedPlayers = Object.keys(stats)
            .map(uid => ({ uid, name: mergedPlayers[uid], ...stats[uid] }))
            .filter(p => p.points > 0 || p.exactScores > 0)
            .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return b.exactScores - a.exactScores;
            });

         let pLeadersArray: string[] = [];
         let sLeadersArray: string[] = [];

         if (sortedPlayers.length > 0) {
             const maxPts = sortedPlayers[0].points;
             const maxScores = Math.max(...sortedPlayers.map(p => p.exactScores));
             
             pLeadersArray = sortedPlayers.filter(p => p.points === maxPts).map(p => p.uid);
             sLeadersArray = sortedPlayers.filter(p => p.exactScores === maxScores).map(p => p.uid);
             
             statsPerWeek[targetWeek] = { maxPts, maxScores, pLeadersArray, sLeadersArray, sortedPlayers };
         } else {
             statsPerWeek[targetWeek] = { maxPts: 0, maxScores: 0, pLeadersArray: [], sLeadersArray: [], sortedPlayers: [] };
         }
     });

     return statsPerWeek;
  }, [adminScores, predictionsDB, liveMatchesDB, mergedPlayers, activeWeeks]);

  // HAFTALARI BÜYÜKTEN KÜÇÜĞE SIRALA (Örn: 19 önce, 18 sonra)
  const sortedWeeks = [...activeWeeks].sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans pb-24 relative">
      <div className="max-w-7xl mx-auto pt-6">

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-rose-500 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span> CANLI YAYIN MERKEZİ
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

        {/* 1. BÖLÜM: CANLI LİVE KARTLAR (KOMPAKT) */}
        <div className="mb-10">
          {sortedDisplayedMatches.length === 0 ? (
               <div className="w-full py-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl shadow-inner">
                  <span className="text-4xl mb-4 block opacity-50">📡</span>
                  <h2 className="text-lg font-bold mb-2 tracking-widest uppercase text-slate-400">
                     ŞU AN EKRANDA OYNANAN AKTİF BİR MAÇ BULUNMUYOR
                  </h2>
               </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDisplayedMatches.map((match) => {
              const uniqueId = String(getUniqueMatchId(match.week_num, match.match_index));
              const isWinnersOpen = !!openWinnersMap[uniqueId];
              const logInfo = liveInfoStateMap[uniqueId];
              const status = logInfo?.status || 'NOT_STARTED';
              const isLive = status === 'LIVE' || status === 'WAITING_APPROVAL' || status === 'HT';

              const homeTeamUpper = match.home_team?.toUpperCase() || match.homeTeam?.toUpperCase() || "";
              const awayTeamUpper = match.away_team?.toUpperCase() || match.awayTeam?.toUpperCase() || "";

              const homeScore = adminScores[uniqueId]?.home || "-";
              const awayScore = adminScores[uniqueId]?.away || "-";

              let currentWinners: string[] = [];
              let winnersCount = 0;
              let displayPoints = 0;

              if (homeScore !== "-" && awayScore !== "-") {
                const targetScore = `${homeScore}-${awayScore}`;
                const predsSource = predictionsDB;
                currentWinners = Object.keys(predsSource)
                  .filter(uid => predsSource[uid] && predsSource[uid][uniqueId] === targetScore)
                  .map(uid => mergedPlayers[uid] || "Bilinmeyen")
                  .sort((a, b) => a.localeCompare(b, 'tr'));

                winnersCount = currentWinners.length;
                if(winnersCount === 1) displayPoints = 12; else if(winnersCount === 2) displayPoints = 6; else if(winnersCount === 3) displayPoints = 5; else if(winnersCount === 4) displayPoints = 4; else if(winnersCount === 5) displayPoints = 3; else if(winnersCount === 6) displayPoints = 2; else if(winnersCount >= 7) displayPoints = 1; else displayPoints = 0;
              }

              return (
                <div key={uniqueId} className={`w-full bg-slate-900 border ${isLive ? 'border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.2)]' : 'border-slate-800'} rounded-xl overflow-hidden transition-all flex flex-col`}>
                  {/* Kart Başlığı */}
                  <div className={`px-3 py-2 flex justify-between items-center text-[10px] font-bold ${isLive ? 'bg-rose-950/40 text-rose-300' : 'bg-slate-950 text-slate-400'}`}>
                    <div className="flex items-center gap-1.5">
                       {isLive && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>}
                       <span>{match.week_num}. HAFTA | {match.match_index}. MAÇ</span>
                    </div>
                    <span className="text-indigo-400">{match.match_time}</span>
                  </div>

                  {/* Skor Alanı */}
                  <div className="p-4 flex items-center justify-between">
                     <div className="flex flex-col items-center flex-1">
                        <span className="text-white font-black text-xs text-center uppercase mb-1">{homeTeamUpper}</span>
                     </div>

                     <div className="flex items-center gap-2 px-4">
                        <span className={`text-2xl font-black ${isLive ? 'text-rose-400' : 'text-slate-200'}`}>{homeScore}</span>
                        <span className="text-slate-600 font-bold">-</span>
                        <span className={`text-2xl font-black ${isLive ? 'text-rose-400' : 'text-slate-200'}`}>{awayScore}</span>
                     </div>

                     <div className="flex flex-col items-center flex-1">
                        <span className="text-white font-black text-xs text-center uppercase mb-1">{awayTeamUpper}</span>
                     </div>
                  </div>

                  {/* Alt Bilgi & Bilenler */}
                  <div className="bg-slate-950/80 px-3 py-2.5 border-t border-slate-800 flex flex-col">
                     <div className="flex justify-between items-center w-full">
                         <span className="text-[10px] font-bold text-amber-500">
                             {winnersCount > 0 ? `🎯 ${winnersCount} KİŞİ BİLDİ (+${displayPoints} P)` : "BU SKORU BİLEN YOK"}
                         </span>
                         {winnersCount > 0 && (
                            <button onClick={() => toggleWinners(uniqueId)} className="text-cyan-500 hover:text-cyan-400 text-[10px] font-bold outline-none transition-colors">
                               {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                            </button>
                         )}
                     </div>
                     
                     {isWinnersOpen && winnersCount > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800/50 flex flex-wrap gap-1">
                           {currentWinners.map((p, i) => (
                               <span key={i} className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-300 uppercase">
                                  {p}
                               </span>
                           ))}
                        </div>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* 2. BÖLÜM: LİDERLİK RADARLARI (YUKARIDAN AŞAĞIYA SIRALI) */}
        <div className="space-y-10">
          {sortedWeeks.map((week, index) => {
             const wStats = weeklyStatsList[week];
             if(!wStats) return null;
             
             // En eski hafta mı? (19 ve 18 varsa, 18 en eskidir)
             const isOldestWeek = index === sortedWeeks.length - 1 && sortedWeeks.length > 1;

             return (
              <div key={`radar-${week}`} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Başlık */}
                  <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 text-center">
                     <h2 className="font-black text-indigo-400 text-base sm:text-lg tracking-widest uppercase flex items-center justify-center gap-2">
                        <span className="text-2xl">🏆</span> {week}. HAFTA CANLI LİDERLİK RADARI
                     </h2>
                     {isOldestWeek && wStats.pLeadersArray.length > 0 && (
                        <h3 className="mt-2 text-amber-500 font-bold text-xs sm:text-sm uppercase tracking-wider bg-amber-950/30 inline-block px-4 py-1.5 rounded-full border border-amber-500/20 shadow-inner">
                           ✨ {week}. HAFTA BONUS KAZANAN YARIŞMACI(LAR): <span className="text-white ml-1">{wStats.pLeadersArray.map((uid: string) => mergedPlayers[uid]).join(' & ')}</span> ✨
                        </h3>
                     )}
                  </div>

                  {/* Liderler (Top) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 bg-slate-900/50">
                      <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 flex flex-col items-center justify-center shadow-inner">
                          <span className="text-emerald-500 text-[10px] font-black tracking-widest mb-2">🔥 HAFTANIN PUAN LİDERİ</span>
                          <span className="text-white font-black text-sm sm:text-base uppercase text-center leading-snug">
                              {wStats.pLeadersArray.length > 0 ? wStats.pLeadersArray.map((uid: string) => mergedPlayers[uid]).join(' & ') : 'MÜSTAKİL LİDER YOK'}
                          </span>
                          <span className="text-emerald-400 font-bold text-xs mt-2 bg-emerald-950/50 px-3 py-1 rounded border border-emerald-500/20">
                              {wStats.maxPts} PUAN
                          </span>
                      </div>
                      <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 flex flex-col items-center justify-center shadow-inner">
                          <span className="text-amber-500 text-[10px] font-black tracking-widest mb-2">⚽ SKOR KRALI</span>
                          <span className="text-white font-black text-sm sm:text-base uppercase text-center leading-snug">
                              {wStats.sLeadersArray.length > 0 ? wStats.sLeadersArray.map((uid: string) => mergedPlayers[uid]).join(' & ') : 'MÜSTAKİL KRAL YOK'}
                          </span>
                          <span className="text-amber-400 font-bold text-xs mt-2 bg-amber-950/50 px-3 py-1 rounded border border-amber-500/20">
                              {wStats.maxScores} MAÇ BİLDİ
                          </span>
                      </div>
                  </div>

                  {/* Tam Sıralama Listesi (Aşağı Doğru) */}
                  {wStats.sortedPlayers.length > 0 && (
                  <div className="p-4 sm:p-6 border-t border-slate-800">
                     <h4 className="text-slate-400 text-xs font-black mb-4 tracking-widest uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span> {week}. Hafta Tüm Sıralama (Kim Ne Bildi?)
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                         {wStats.sortedPlayers.map((player: any, idx: number) => (
                             <div key={player.uid} className="flex justify-between items-center bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors">
                                 <div className="flex items-center gap-3">
                                     <span className="text-slate-500 font-black text-xs w-4">{idx + 1}.</span>
                                     <span className="text-slate-200 font-bold text-xs uppercase">{player.name}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <span className="text-amber-500/80 text-[10px] font-bold">{player.exactScores} Maç</span>
                                     <span className="bg-indigo-950/50 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-black min-w-[36px] text-center">
                                         {player.points} P
                                     </span>
                                 </div>
                             </div>
                         ))}
                     </div>
                  </div>
                  )}
              </div>
             )
          })}
        </div>

      </div>
    </div>
  );
}