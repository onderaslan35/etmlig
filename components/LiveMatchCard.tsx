'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import {
  staticPlayersList,
  getTodayDateString,
  parseDateLocal,
  getMatchTimeMs,
  getUniqueMatchId
} from '@/utils/themeEngine';
import LiveMatchCard from '@/components/LiveMatchCard';

export default function CanliYayinMerkezi() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 10000);
      return () => clearInterval(interval);
  }, []);

  const [mergedPlayers, setMergedPlayers] = useState<Record<string, string>>(staticPlayersList);
  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [adminScores, setAdminScores] = useState<Record<string, { home: string, away: string }>>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, Record<string, string>>>({}); 
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<string, any>>({}); 
  const [activeWeeks, setActiveWeeks] = useState<number[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    const fetchLiveAdminData = async () => {
      const todayDateStr = getTodayDateString();
      const todayDate = parseDateLocal(todayDateStr);
      todayDate.setHours(0,0,0,0);

      const { data: allBulten } = await supabase.from('matches_bulletin').select('*').order('week_num', { ascending: true }).order('match_index', { ascending: true });
      if (!allBulten) return;

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

      targetBulten.forEach(m => {
         const uniqueId = String(getUniqueMatchId(m.week_num, m.match_index));
         const liveInfo = liveData.find(l => String(l.id) === uniqueId);

         if (liveInfo) {
           initialScores[uniqueId] = { home: liveInfo.home_score, away: liveInfo.away_score };
           infoMap[uniqueId] = liveInfo; 
         } else {
           initialScores[uniqueId] = { home: "-", away: "-" };
         }
      });

      setAdminScores(initialScores);
      setLiveInfoStateMap(infoMap);

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
  }, [now]);

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
                 if (wCount === 1) pts = 12; else if (wCount === 2) pts = 6; else if (wCount === 3) pts = 5; else if (wCount === 4) pts = 4; else if (wCount === 5) pts = 3; else if (wCount === 6) pts = 2; else if (wCount >= 7) pts = 1;

                 winners.forEach(uid => {
                     if (stats[uid]) {
                         stats[uid].points += pts;
                         stats[uid].exactScores += 1;
                     }
                 });
             }
         });

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

  const sortedWeeks = [...activeWeeks].sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 p-2 sm:p-4 font-sans pb-24 relative selection:bg-rose-500/30">
      
      {/* 🔴 CANLI YAYIN MERKEZİ BAŞLIĞI */}
      <div className="max-w-[1600px] mx-auto pt-4 sm:pt-6 mb-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2 relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-900/50 to-transparent -z-10"></div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-rose-500 tracking-tighter flex items-center gap-3 drop-shadow-[0_0_15px_rgba(225,29,72,0.4)] uppercase">
            <span className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]"></span> 
            CANLI YAYIN MERKEZİ
          </h1>
          <p className="text-slate-400 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-bold bg-[#050b14] px-4">
            Bugün oynanan tüm maçların anlık skorları ve kazandırdığı puanlar
          </p>
          <button 
             onClick={handleSoundToggle}
             className={`mt-4 px-4 py-1.5 rounded-full font-bold text-[10px] sm:text-xs flex items-center gap-2 transition-all border shadow-lg ${
                 isSoundEnabled 
                 ? 'bg-rose-950/40 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(225,29,72,0.3)]' 
                 : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:bg-slate-800'
             }`}
          >
             {isSoundEnabled ? '🔊 GOL SESİ AÇIK' : '🔇 GOL SESİ KAPALI'}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-12">

        {/* 1. BÖLÜM: KUTUCUK KUTUCUK LIVE KARTLAR (SİREN GİBİ PARLAYANLAR) */}
        <div>
          {sortedDisplayedMatches.length === 0 ? (
               <div className="w-full py-16 text-center bg-[#091120] border border-slate-800 rounded-2xl shadow-inner">
                  <span className="text-4xl mb-4 block opacity-50">📡</span>
                  <h2 className="text-lg font-bold mb-2 tracking-widest uppercase text-slate-400">
                     ŞU AN EKRANDA OYNANAN AKTİF BİR MAÇ BULUNMUYOR
                  </h2>
               </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedDisplayedMatches.map((match) => {
              const uniqueId = String(getUniqueMatchId(match.week_num, match.match_index));
              
              const hScore = adminScores[uniqueId]?.home || "-";
              const aScore = adminScores[uniqueId]?.away || "-";

              let currentWinners: string[] = [];
              let winnersCount = 0;
              let displayPoints = 0;

              if (hScore !== "-" && aScore !== "-") {
                const targetScore = `${hScore}-${aScore}`;
                const predsSource = predictionsDB;
                currentWinners = Object.keys(predsSource)
                  .filter(uid => predsSource[uid] && predsSource[uid][uniqueId] === targetScore)
                  .map(uid => mergedPlayers[uid] || "Bilinmeyen")
                  .sort((a, b) => a.localeCompare(b, 'tr'));

                winnersCount = currentWinners.length;
                if(winnersCount === 1) displayPoints = 12; else if(winnersCount === 2) displayPoints = 6; else if(winnersCount === 3) displayPoints = 5; else if(winnersCount === 4) displayPoints = 4; else if(winnersCount === 5) displayPoints = 3; else if(winnersCount === 6) displayPoints = 2; else if(winnersCount >= 7) displayPoints = 1; else displayPoints = 0;
              }

              // 🔥 O PARLAYAN KUTUCUKLARI ÇAĞIRIYORUZ 🔥
              return (
                <LiveMatchCard
                  key={uniqueId}
                  match={match}
                  homeScore={hScore}
                  awayScore={aScore}
                  liveInfo={liveInfoStateMap[uniqueId]}
                  currentWinners={currentWinners}
                  displayPoints={displayPoints}
                  isSoundEnabled={isSoundEnabled}
                />
              );
            })}
          </div>
          )}
        </div>

        {/* 2. BÖLÜM: LİDERLİK RADARLARI (19 ÜSTTE, 18 ALTTA OLACAK ŞEKİLDE SIRALANDI) */}
        <div className="space-y-12">
          {sortedWeeks.map((week, index) => {
             const wStats = weeklyStatsList[week];
             if(!wStats) return null;
             
             // En eski hafta mı? (19 ve 18 varsa, 18 en eskidir)
             const isOldestWeek = index === sortedWeeks.length - 1 && sortedWeeks.length > 1;

             return (
              <div key={`radar-${week}`} className="bg-[#091120] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                  
                  {/* Başlık */}
                  <div className="bg-[#050b14] px-4 py-5 border-b border-slate-800 text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-indigo-900/20 to-blue-900/10"></div>
                     <h2 className="font-black text-blue-400 text-lg sm:text-xl tracking-[0.2em] uppercase flex items-center justify-center gap-3 drop-shadow-md relative z-10">
                        <span className="text-2xl">🏆</span> {week}. HAFTA CANLI LİDERLİK RADARI
                     </h2>
                  </div>

                  {/* Liderler (Top) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 bg-[#091120]">
                      <div className="bg-[#050b14]/50 border border-amber-500/20 rounded-2xl p-5 flex flex-col items-center justify-center shadow-inner relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
                          <span className="text-amber-500 text-[10px] font-black tracking-[0.2em] mb-3 flex items-center gap-2">
                             <span className="text-sm">🔥</span> PUAN LİDERİ
                          </span>
                          <span className="text-white font-black text-base sm:text-lg uppercase text-center leading-snug drop-shadow-md z-10">
                              {wStats.pLeadersArray.length > 0 ? wStats.pLeadersArray.map((uid: string) => mergedPlayers[uid]).join(' & ') : 'MÜSTAKİL LİDER YOK'}
                          </span>
                          <span className="text-amber-400 font-bold text-xs mt-3 bg-amber-950/30 px-4 py-1.5 rounded-full border border-amber-500/20 shadow-inner z-10">
                              {wStats.maxPts} PUAN TOPLADI
                          </span>
                      </div>
                      
                      <div className="bg-[#050b14]/50 border border-emerald-500/20 rounded-2xl p-5 flex flex-col items-center justify-center shadow-inner relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-br-full"></div>
                          <span className="text-emerald-500 text-[10px] font-black tracking-[0.2em] mb-3 flex items-center gap-2">
                             <span className="text-sm">⚽</span> SKOR KRALI
                          </span>
                          <span className="text-white font-black text-base sm:text-lg uppercase text-center leading-snug drop-shadow-md z-10">
                              {wStats.sLeadersArray.length > 0 ? wStats.sLeadersArray.map((uid: string) => mergedPlayers[uid]).join(' & ') : 'MÜSTAKİL KRAL YOK'}
                          </span>
                          <span className="text-emerald-400 font-bold text-xs mt-3 bg-emerald-950/30 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-inner z-10">
                              {wStats.maxScores} MAÇ BİLDİ
                          </span>
                      </div>
                  </div>

                  {/* Tam Sıralama Listesi (Aşağı Doğru) */}
                  {wStats.sortedPlayers.length > 0 && (
                  <div className="p-4 sm:p-6 border-t border-slate-800/50 bg-[#050b14]/30">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                         {wStats.sortedPlayers.map((player: any, idx: number) => (
                             <div key={player.uid} className="flex justify-between items-center bg-[#050b14] px-4 py-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors group">
                                 <div className="flex items-center gap-3">
                                     <span className="text-slate-600 font-black text-[10px] w-5 text-right">{idx + 1}.</span>
                                     <span className="text-slate-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider group-hover:text-white transition-colors">{player.name}</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{player.exactScores} Maç</span>
                                     <span className="bg-slate-900 text-amber-500 border border-amber-900/30 px-3 py-1 rounded text-[11px] font-black min-w-[40px] text-center shadow-inner">
                                         {player.points} P
                                     </span>
                                 </div>
                             </div>
                         ))}
                     </div>
                  </div>
                  )}

                  {/* 🔴 KOMUTANIN İSTEDİĞİ: 18. HAFTA EN ALTTA VE BONUS KAZANAN YARIŞMACILAR YAZISI 🔴 */}
                  {isOldestWeek && wStats.pLeadersArray.length > 0 && (
                     <div className="bg-slate-950 px-6 py-5 border-t border-slate-800 text-center">
                        <div className="inline-block relative">
                           <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                           <h3 className="relative text-amber-500 font-black text-xs sm:text-sm uppercase tracking-wider bg-amber-950/50 px-6 py-2.5 rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                              ✨ {week}. HAFTA BONUS KAZANAN YARIŞMACI(LAR): <span className="text-white ml-2 drop-shadow-md">{wStats.pLeadersArray.map((uid: string) => mergedPlayers[uid]).join(' & ')}</span> ✨
                           </h3>
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