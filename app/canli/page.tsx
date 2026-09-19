'use client';

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from '@/utils/supabase';
import {
  staticPlayersList,
  LIG_HAVUZU,
  getTodayDateString,
  parseDateLocal,
  getUniqueMatchId,
  isTffMatchCheck,
  getMatchTimeMs,
  getEliteTheme,
  getWeekLabel // 🔴 YENİ MASKELEME MOTORUNU ÇAĞIRDIK
} from '@/utils/themeEngine';

export default function CanliRadarPage() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
  }, []);

  const [mergedPlayers, setMergedPlayers] = useState<Record<string, string>>(staticPlayersList);
  const [selectedLiveWeek, setSelectedLiveWeek] = useState<number>(6); 
  const [liveWeekOptions, setLiveWeekOptions] = useState<number[]>([6]);
  
  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [liveScores, setLiveScores] = useState<Record<number, { home: string, away: string }>>({});
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<number, any>>({}); 
  const [predictionsDB, setPredictionsDB] = useState<Record<string, string[]>>({}); 
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data } = await supabase.from('players').select('*');
      if (data) {
         const newMergedMap = { ...staticPlayersList };
         data.forEach((p: any) => { newMergedMap[String(p.username)] = p.name; });
         setMergedPlayers(newMergedMap); 
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchAvailableWeeks = async () => {
        const { data } = await supabase.from('matches_bulletin').select('week_num, match_date');
        if (data) {
            const todayDate = new Date();
            todayDate.setHours(0,0,0,0);
            const weeksSet = new Set<number>(data.map(d => d.week_num));
            const weeks = Array.from(weeksSet).filter(w => w >= 6).sort((a,b) => a-b);
            
            let targetWeek = 6;
            const upcomingMatches = data.filter(d => parseDateLocal(d.match_date) >= todayDate).sort((a,b) => parseDateLocal(a.match_date).getTime() - parseDateLocal(b.match_date).getTime());
            
            if (upcomingMatches.length > 0) targetWeek = upcomingMatches[0].week_num;
            else if (weeks.length > 0) targetWeek = Math.max(...weeks);

            if (weeks.length > 0) setLiveWeekOptions(weeks);
            setSelectedLiveWeek(targetWeek);
        }
    };
    fetchAvailableWeeks();
  }, []);

  useEffect(() => {
    const fetchLiveRadarData = async () => {
      const { data: bultenData } = await supabase.from('matches_bulletin').select('*').eq('week_num', selectedLiveWeek).order('match_index', { ascending: true });
      let currentBulten = bultenData || [];
      setLiveMatchesDB(currentBulten);

      const idsToFetch = currentBulten.map((m: any) => getUniqueMatchId(selectedLiveWeek, m.match_index));
      let liveData: any[] = [];
      if (idsToFetch.length > 0) {
         const { data } = await supabase.from('live_matches').select('*').in('id', idsToFetch);
         if (data) liveData = data;
      }

      let allPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions').select('*').eq('week_num', selectedLiveWeek).order('user_id', { ascending: true }).range(from, from + step - 1);
        if (error) break;
        if (pDataChunk && pDataChunk.length > 0) {
           allPredictions = [...allPredictions, ...pDataChunk];
           if (pDataChunk.length < step) fetchMore = false; else from += step; 
        } else fetchMore = false; 
      }

      const initialScores: Record<number, { home: string, away: string }> = {};
      const infoMap: Record<number, any> = {}; 

      currentBulten.forEach(m => {
         const uniqueId = getUniqueMatchId(selectedLiveWeek, m.match_index);
         const liveInfo = liveData.find(l => l.id === uniqueId);
         if (liveInfo) {
           initialScores[m.match_index] = { home: liveInfo.home_score, away: liveInfo.away_score };
           infoMap[m.match_index] = liveInfo; 
         } else {
           initialScores[m.match_index] = { home: "-", away: "-" };
         }
      });

      setLiveScores(initialScores);
      setLiveInfoStateMap(infoMap);

      if (allPredictions.length > 0) {
         const pMap: Record<string, string[]> = {};
         allPredictions.forEach(row => {
            const rowUserId = String(row.user_id);
            if(!pMap[rowUserId]) pMap[rowUserId] = Array(24).fill('-');
            pMap[rowUserId][row.match_index - 1] = row.predicted_score;
         });
         setPredictionsDB(pMap);
      }
    };

    fetchLiveRadarData();
    const channel = supabase.channel('public:live_matches')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, payload => {
            fetchLiveRadarData();
        }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedLiveWeek]);

  const displayedMatches = liveMatchesDB.filter(match => {
      const logInfo = liveInfoStateMap[match.match_index];
      const status = logInfo?.status || 'NOT_STARTED';
      const isFinished = status === 'FINISHED';
      const isLive = status === 'LIVE' || status === 'WAITING_APPROVAL' || status === 'HT';
      const isToday = match.match_date === getTodayDateString();
      const matchTimeMs = getMatchTimeMs(match.match_date, match.match_time);
      const isWithinLast5Hours = (now - matchTimeMs) >= 0 && (now - matchTimeMs) <= (5 * 60 * 60 * 1000);

      if (showOnlyToday) {
          if (isFinished) return false; 
          if (isLive || isWithinLast5Hours) return true;      
          return isToday;                
      }
      return true; 
  }).sort((a, b) => {
      const logA = liveInfoStateMap[a.match_index];
      const statusA = logA?.status || 'NOT_STARTED';
      const isLiveA = statusA === 'LIVE' || statusA === 'WAITING_APPROVAL' || statusA === 'HT' || statusA === 'FINISHED';

      const logB = liveInfoStateMap[b.match_index];
      const statusB = logB?.status || 'NOT_STARTED';
      const isLiveB = statusB === 'LIVE' || statusB === 'WAITING_APPROVAL' || statusB === 'HT' || statusB === 'FINISHED';

      if (isLiveA && !isLiveB) return -1;
      if (!isLiveA && isLiveB) return 1;
      return a.match_index - b.match_index; 
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans pb-24 relative">
      <div className="max-w-7xl mx-auto pt-6 animate-fade-in">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-800 pb-4">
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-rose-500 tracking-widest flex items-center justify-center sm:justify-start gap-3 uppercase drop-shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                    <span className="text-4xl animate-pulse">🔴</span> CANLI RADAR
                </h1>
                <p className="text-slate-400 text-xs mt-2 flex items-center justify-center sm:justify-start gap-2">
                    Skorları ve kimin ne tahmin ettiğini anlık olarak buradan takip edebilirsiniz.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                    onClick={() => setShowOnlyToday(!showOnlyToday)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                        showOnlyToday ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'
                    }`}
                >
                    {showOnlyToday ? '📅 SADECE BUGÜN (BİTENLER GİZLİ)' : '📋 TÜM LİSTE'}
                </button>

                <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2 shadow-inner">
                    <span className="text-slate-400 font-bold text-xs tracking-wider">PROGRAM:</span>
                    <select 
                        value={selectedLiveWeek}
                        onChange={(e) => setSelectedLiveWeek(Number(e.target.value))}
                        className="bg-rose-600 border border-rose-500 text-white font-black text-sm px-2 py-0.5 rounded shadow-[0_0_10px_rgba(225,29,72,0.4)] outline-none cursor-pointer"
                    >
                        {/* 🔴 AÇILIR MENÜDE ARTIK YENİ İSİMLER YAZACAK */}
                        {liveWeekOptions.map(w => ( <option key={w} value={w}>{getWeekLabel(w)}</option> ))}
                    </select>
                </div>
            </div>
        </div>

        {displayedMatches.length === 0 ? (
             <div className="w-full py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl shadow-inner">
                <span className="text-5xl mb-4 block opacity-50">📡</span>
                <h2 className="text-xl font-bold mb-2 tracking-widest uppercase text-slate-400">
                   {liveMatchesDB.length > 0 ? "FİLTREYE UYGUN MAÇ BULUNMUYOR" : `${getWeekLabel(selectedLiveWeek)} BÜLTENİ BULUNAMADI`}
                </h2>
             </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {displayedMatches.map((match) => {
                const homeTeamUpper = match.home_team?.toUpperCase() || match.homeTeam?.toUpperCase() || "";
                const awayTeamUpper = match.away_team?.toUpperCase() || match.awayTeam?.toUpperCase() || "";
                const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);
                const isTffMatch = isTffMatchCheck(match.category);

                const homeScore = liveScores[match.match_index]?.home || "-";
                const awayScore = liveScores[match.match_index]?.away || "-";
                
                const matchTimeMs = getMatchTimeMs(match.match_date, match.match_time);
                const isRevealed = now >= matchTimeMs - 60000;

                let currentWinners: string[] = [];
                if (isRevealed && homeScore !== "-" && awayScore !== "-") {
                  const targetScore = `${homeScore}-${awayScore}`;
                  currentWinners = Object.keys(predictionsDB)
                    .filter(uid => predictionsDB[uid] && predictionsDB[uid][match.match_index - 1] === targetScore)
                    .map(uid => mergedPlayers[uid] || "Bilinmeyen")
                    .sort((a, b) => a.localeCompare(b, 'tr'));
                }

                return (
                  <div key={`live-${match.match_index}`} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                    <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center">
                      {theme.bgImg && ( <><div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div><div className="absolute inset-0 bg-slate-900/40 z-0"></div></> )}
                      <div className="relative z-10 flex flex-col h-full justify-between">

                        <div className="flex flex-col items-center justify-center mb-2 sm:mb-4 gap-1.5 sm:gap-2">
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md backdrop-blur-sm">
                            {/* 🔴 MAÇ KARTININ TEPESİNDE ARTIK MİLLİ PROGRAM YAZACAK */}
                            {getWeekLabel(match.week_num)} - {match.match_index}. MAÇ ({match.match_date} - {match.match_time})
                          </span>
                          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                            🏆 {match.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between px-0 sm:px-4 mt-2">
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20"><img src={theme.homeLogo} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" /></div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{homeTeamUpper}</span>
                          </div>

                          <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-24 sm:w-36 z-30">
                            <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                               <span className="text-2xl sm:text-4xl font-black text-amber-400 drop-shadow-md">{homeScore}</span>
                               <span className={`text-lg sm:text-2xl font-bold ${theme.colonText}`}>:</span>
                               <span className="text-2xl sm:text-4xl font-black text-amber-400 drop-shadow-md">{awayScore}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                             <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20"><img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" /></div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{awayTeamUpper}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`${theme.bottomBar} border-t px-4 py-4 w-full backdrop-blur-md z-10 relative min-h-[90px]`}>
                      <div className="flex items-center justify-between mb-3 w-full">
                         <div className="flex items-center gap-2">
                             <span className="text-rose-500 text-sm drop-shadow-md">📡</span> 
                             <span className="text-amber-500 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
                                 {!isRevealed ? "TAHMİNLER GİZLİ (1 DK KALA AÇILIR)" : (homeScore === "-" || awayScore === "-") ? "MÜDAHALE BEKLENİYOR..." : currentWinners.length > 0 ? `${currentWinners.length} KİŞİ BU SKORDA` : "BU SKORU BİLEN YOK"}
                             </span>
                         </div>
                         <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                            {isTffMatch ? "TFF MAÇI" : "DFO MAÇI"}
                         </span>
                      </div>

                      {isRevealed && homeScore !== "-" && awayScore !== "-" && currentWinners.length > 0 && (
                         <div className="flex items-center justify-center border-t border-slate-700/50 pt-3 animate-fade-in">
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