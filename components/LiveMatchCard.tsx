'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import {
  TEST_ACCOUNTS,
  localTeamLogos,
  getLocalLogoUrl,
  isTffMatchCheck,
  getEliteTheme,
  getMatchTimeMs,
  getTodayDateString,
  parseDateLocal,
  getUniqueMatchId
} from '@/utils/themeEngine';

export default function LiveMatchCard() {
  console.log("VERCEL KURTARMA SOKU - KÜRSÜ TASARIMI, ÜST ÜSTE BİNME FİX VE NET PUAN MOTORU");
  const [activeWeek, setActiveWeek] = useState(6);
  const [isWeekLoaded, setIsWeekLoaded] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  const prevScoresRef = useRef<Record<string, string>>({});
  
  const [goalFlashes, setGoalFlashes] = useState<Record<number, boolean>>({});

  const [todaysMatchesList, setTodaysMatchesList] = useState<any[]>([]);
  const [liveMatchesData, setLiveMatchesData] = useState<Record<number, any>>({});
  const [predictionsData, setPredictionsData] = useState<Record<string, string>>({});
  
  // 🔴 ANA KASA VE AKTİF HAFTA KASASI 🔴
  const [baseStandings, setBaseStandings] = useState<Record<string, { TFF: number, DFO: number, MASTER: number, SKOR: number }>>({});
  const [activeWeekBase, setActiveWeekBase] = useState<Record<string, { TFF: number, DFO: number, MASTER: number, SKOR: number }>>({});

  const [now, setNow] = useState<number>(new Date().getTime());
  
  const [weeklyLiveStats, setWeeklyLiveStats] = useState<{ pLeaders: string[], maxPts: number, sLeaders: string[], maxScores: number }>({ pLeaders: [], maxPts: 0, sLeaders: [], maxScores: 0 });

  const [isLiveAccordionOpen, setIsLiveAccordionOpen] = useState<boolean>(true); 
  const [isFinishedAccordionOpen, setIsFinishedAccordionOpen] = useState<boolean>(false);
  
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [openPossibleMap, setOpenPossibleMap] = useState<{ [key: number]: boolean }>({});
  const [openEliminatedMap, setOpenEliminatedMap] = useState<{ [key: number]: boolean }>({});
  
  const [openPlayerRanks, setOpenPlayerRanks] = useState<{ [key: string]: boolean }>({});

  const [expandedMatches, setExpandedMatches] = useState<Record<number, boolean>>({});
  const [mergedAccounts, setMergedAccounts] = useState<Record<string, { pass: string, name: string }>>(TEST_ACCOUNTS);

  const toggleSound = () => {
      const newState = !soundEnabled;
      setSoundEnabled(newState);
      soundEnabledRef.current = newState;
      if (newState) {
          const audio = new Audio('/sounds/goal.mp3');
          audio.muted = true;
          audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(e => console.log("Ses kilidi:", e));
      }
  };

  useEffect(() => {
     const fetchDbPlayers = async () => {
        const { data } = await supabase.from('players').select('*');
        if (data) {
           const newAccounts = { ...TEST_ACCOUNTS };
           data.forEach(p => {
               const pid = String(p.username || p.id).trim();
               newAccounts[pid] = { pass: p.password, name: p.name || p.full_name };
           });
           setMergedAccounts(newAccounts);
        }
     };
     fetchDbPlayers();
  }, []);

  useEffect(() => {
      const initWeek = async () => {
          const { data } = await supabase.from('matches_bulletin').select('week_num, match_date');
          if (data) {
              const nowUTC = new Date();
              const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
              const todayMidnight = new Date(todayTurkey.getUTCFullYear(), todayTurkey.getUTCMonth(), todayTurkey.getUTCDate());

              const upcomingMatches = data
                  .filter(d => parseDateLocal(d.match_date) >= todayMidnight)
                  .sort((a,b) => parseDateLocal(a.match_date).getTime() - parseDateLocal(b.match_date).getTime());
              
              if (upcomingMatches.length > 0) setActiveWeek(upcomingMatches[0].week_num);
              else {
                  const weeks = Array.from(new Set(data.map(d => d.week_num)));
                  if (weeks.length > 0) setActiveWeek(Math.max(...weeks));
              }
          }
          setIsWeekLoaded(true);
      };
      initWeek();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const normalizeName = (name: string) => {
    if (!name) return "";
    return name.toUpperCase().replace(/İ/g, 'I').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/Ö/g, 'O').replace(/Ç/g, 'C').replace(/\s+/g, '').trim();
  };

  useEffect(() => {
    if (!isWeekLoaded) return;
    
    const fetchMatchesAndPredictions = async () => {
      // 🔴 ÇİFT SAYMAYI ENGELLEYEN YENİ PUAN MOTORU 🔴
      const fetchTable = async (t: string) => { const { data } = await supabase.from(t).select('*'); return data || []; };

      const [tffData, dfoData, masterData, skorData, manualPointsData] = await Promise.all([
          fetchTable('tff_weekly_points'), fetchTable('dfo_weekly_points'),
          fetchTable('master_weekly_points'), fetchTable('skor_weekly_points'),
          fetchTable('points')
      ]);

      const st: Record<string, any> = {};
      const initSt = (key: string) => { if (key && !st[key]) st[key] = { TFF: 0, DFO: 0, MASTER: 0, SKOR: 0 }; };

      // SADECE w1, w2, w3 ve w4 SÜTUNLARINI TOPLAR (Çift saymayı engeller)
      const processWeekly = (data: any[], cat: 'TFF'|'DFO'|'MASTER'|'SKOR') => {
          data.forEach(row => {
              const uid = String(row.id || row.user_id || '').trim();
              const uname = normalizeName(String(row.name || row.user_name || ''));
              let sum = (Number(row.w1) || 0) + (Number(row.w2) || 0) + (Number(row.w3) || 0) + (Number(row.w4) || 0);
              
              if (uid) { initSt(uid); st[uid][cat] += sum; }
              if (uname) { initSt(uname); st[uname][cat] += sum; }
          });
      };
      processWeekly(tffData, 'TFF'); processWeekly(dfoData, 'DFO');
      processWeekly(masterData, 'MASTER'); processWeekly(skorData, 'SKOR');

      manualPointsData.forEach(row => {
          const uid = String(row.username || row.user_id || row.id || '').trim();
          const uname = normalizeName(String(row.user_name || row.name || uid));
          const cat = String(row.kategori || row.league_type || 'MASTER').toUpperCase().trim();
          const pts = Number(row.puan ?? row.points ?? row.totalPoints) || 0;
          
          const applyManual = (key: string) => {
              if (!key) return;
              initSt(key);
              if (cat === 'TFF') st[key].TFF += pts;
              else if (cat === 'DFO') st[key].DFO += pts;
              else if (cat === 'SKOR') st[key].SKOR += pts;
              else st[key].MASTER += pts; 
              if (String(row.ev_sahibi).toUpperCase() === 'SKOR') st[key].SKOR += 1;
          };
          applyManual(uid); applyManual(uname);
      });

      const { data: dbBulletinMatches } = await supabase.from('matches_bulletin').select('*').gte('week_num', 5);
      const { data: dbLiveMatches } = await supabase.from('live_matches').select('*');

      let allPredictions: any[] = [];
      let from = 0; let step = 999; let keepFetching = true;
      while(keepFetching) {
          const { data } = await supabase.from('player_predictions').select('*').gte('week_num', 5).range(from, from + step);
          if (data && data.length > 0) { allPredictions = [...allPredictions, ...data]; if (data.length <= step) keepFetching = false; else from += step + 1; } 
          else keepFetching = false;
      }

      const pDict: Record<string, string> = {};
      allPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          if (uid === 'mankoman') return;
          pDict[`${uid}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, '');
      });
      setPredictionsData(pDict);

      const liveMap: Record<number, any> = {};
      (dbLiveMatches || []).forEach(row => liveMap[row.id] = row); 
      setLiveMatchesData(liveMap);

      let currentWkBase: Record<string, { TFF: number, DFO: number, MASTER: number, SKOR: number }> = {};
      const initCurr = (key: string) => { if (key && !currentWkBase[key]) currentWkBase[key] = { TFF: 0, DFO: 0, MASTER: 0, SKOR: 0 }; };

      (dbBulletinMatches || []).forEach(m => {
          const uniqueId = getUniqueMatchId(m.week_num, m.match_index);
          const dbMatch = liveMap[uniqueId];
          
          if (dbMatch && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
              const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
              const winnerIds = Object.keys(mergedAccounts).filter(id => pDict[`${id}-${m.week_num}-${m.match_index}`] === targetScore);
              
              let pts = 1;
              if(winnerIds.length === 1) pts = 12; else if(winnerIds.length === 2) pts = 6;
              else if(winnerIds.length === 3) pts = 5; else if(winnerIds.length === 4) pts = 4;
              else if(winnerIds.length === 5) pts = 3; else if(winnerIds.length === 6) pts = 2;
              else if(winnerIds.length >= 7) pts = 1; else pts = 0;

              const isTff = isTffMatchCheck(m.category);

              winnerIds.forEach(wId => {
                  const uname = normalizeName(mergedAccounts[wId]?.name || '');
                  if (dbMatch.status === 'FINISHED') {
                      initSt(wId); initSt(uname);
                      if (isTff) { st[wId].TFF += pts; st[uname].TFF += pts; } else { st[wId].DFO += pts; st[uname].DFO += pts; }
                      st[wId].MASTER += pts; st[uname].MASTER += pts;
                      st[wId].SKOR += 1; st[uname].SKOR += 1;
                  } else if (m.week_num === activeWeek) {
                      initCurr(wId); initCurr(uname);
                      if (isTff) { currentWkBase[wId].TFF += pts; currentWkBase[uname].TFF += pts; } else { currentWkBase[wId].DFO += pts; currentWkBase[uname].DFO += pts; }
                      currentWkBase[wId].MASTER += pts; currentWkBase[uname].MASTER += pts;
                      currentWkBase[wId].SKOR += 1; currentWkBase[uname].SKOR += 1;
                  }
              });
          }
      });
      setBaseStandings(st);
      setActiveWeekBase(currentWkBase);

      const nowUTC = new Date();
      const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
      const todayMidnight = new Date(todayTurkey.getUTCFullYear(), todayTurkey.getUTCMonth(), todayTurkey.getUTCDate());

      const currentWeekMatches = (dbBulletinMatches || []).filter(m => m.week_num === activeWeek).map((m) => ({
        id: m.match_index,
        weekLabel: `${activeWeek}. HAFTA ${m.match_index}. MAÇ`,
        category: m.category,
        date: m.match_date,
        time: m.match_time,
        homeTeam: m.home_team,
        awayTeam: m.away_team
      }));

      let goalHappened = false;
      let newGoalIds: number[] = [];
      Object.keys(liveMap).forEach(key => {
          const dbMatch = liveMap[Number(key)];
          if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL' || dbMatch.status === 'FINISHED') {
              if (dbMatch.home_score !== '-' && dbMatch.away_score !== '-') {
                  const currentScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
                  const prevScore = prevScoresRef.current[key];
                  if (prevScore && prevScore !== currentScore) { goalHappened = true; newGoalIds.push(Number(key)); }
                  prevScoresRef.current[key] = currentScore;
              }
          }
      });

      if (goalHappened) {
          if (soundEnabledRef.current) {
              const audio = new Audio('/sounds/goal.mp3');
              audio.play().catch(e => console.log("Ses çalınamadı:", e));
          }
          if (newGoalIds.length > 0) {
              setGoalFlashes(prev => { const next = { ...prev }; newGoalIds.forEach(id => { next[id] = true; }); return next; });
              setTimeout(() => { setGoalFlashes(prev => { const next = { ...prev }; newGoalIds.forEach(id => { delete next[id]; }); return next; }); }, 8000);
          }
      }

      let stats: Record<string, { points: number, exactScores: number }> = {};
      Object.keys(mergedAccounts).forEach(uid => { stats[uid] = { points: 0, exactScores: 0 }; });

      currentWeekMatches.forEach(m => {
          const uniqueId = getUniqueMatchId(activeWeek, m.id);
          const dbMatch = liveMap[uniqueId];
          if (dbMatch && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
              const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
              const winnerIds = Object.keys(pDict).filter(id => pDict[`${id}-${activeWeek}-${m.id}`] === targetScore);
              let pts = 1;
              if(winnerIds.length === 1) pts = 12; else if(winnerIds.length === 2) pts = 6;
              else if(winnerIds.length === 3) pts = 5; else if(winnerIds.length === 4) pts = 4;
              else if(winnerIds.length === 5) pts = 3; else if(winnerIds.length === 6) pts = 2;
              else if(winnerIds.length >= 7) pts = 1; else pts = 0;

              winnerIds.forEach(wId => {
                  if(!stats[wId]) stats[wId] = { points: 0, exactScores: 0 };
                  stats[wId].points += pts;
                  stats[wId].exactScores += 1;
              });
          }
      });

      let mPts = 0; let mScores = 0;
      Object.values(stats).forEach(s => {
          if (s.points > mPts) mPts = s.points;
          if (s.exactScores > mScores) mScores = s.exactScores;
      });

      let pLeadersList = Object.keys(stats).filter(uid => stats[uid].points === mPts && mPts > 0);
      let sLeadersList = Object.keys(stats).filter(uid => stats[uid].exactScores === mScores && mScores > 0);
      setWeeklyLiveStats({ pLeaders: pLeadersList, maxPts: mPts, sLeaders: sLeadersList, maxScores: mScores });

      const todaysMatches = currentWeekMatches.filter(m => {
           const uniqueId = getUniqueMatchId(activeWeek, m.id);
           const dbMatch = liveMap[uniqueId];
           const status = dbMatch ? dbMatch.status : 'NOT_STARTED';
           const mDate = parseDateLocal(m.date);
           const isToday = mDate.getTime() === todayMidnight.getTime();
           if (status === 'LIVE' || status === 'WAITING_APPROVAL' || status === 'HT') return true;
           return isToday;
      });
      setTodaysMatchesList(todaysMatches);
      
      const match24Id = getUniqueMatchId(activeWeek, 24);
      const dbMatch24 = liveMap[match24Id];
      if (dbMatch24 && dbMatch24.status === 'FINISHED') {
          const m24 = currentWeekMatches.find(m => m.id === 24);
          if (m24) {
              const matchTimeMs = getMatchTimeMs(m24.date, m24.time);
              if (new Date().getTime() > matchTimeMs + (5 * 60 * 60 * 1000)) setActiveWeek(prev => prev + 1);
          }
      }
    };

    fetchMatchesAndPredictions(); 
    const interval = setInterval(fetchMatchesAndPredictions, 5000); 
    return () => clearInterval(interval);
  }, [activeWeek, isWeekLoaded, mergedAccounts]);

  const toggleWinners = (matchId: number) => setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] })); 
  const togglePossible = (matchId: number) => setOpenPossibleMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  const toggleEliminated = (matchId: number) => setOpenEliminatedMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  const toggleMatchExpansion = (matchId: number) => setExpandedMatches(prev => ({ ...prev, [matchId]: !prev[matchId] }));
  
  const togglePlayerRank = (uniqueKey: string) => setOpenPlayerRanks((prev) => ({ ...prev, [uniqueKey]: !prev[uniqueKey] }));

  if (!isWeekLoaded) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8 flex justify-center py-10">
         <span className="text-slate-500 text-sm font-medium animate-pulse tracking-widest">📡 Radar Ayarlanıyor...</span>
      </div>
    );
  }

  const activeMatches = todaysMatchesList.filter(match => {
     const uniqueId = getUniqueMatchId(activeWeek, match.id);
     const dbMatch = liveMatchesData[uniqueId] || {};
     return dbMatch.status !== 'FINISHED';
  });

  const finishedMatches = todaysMatchesList.filter(match => {
     const uniqueId = getUniqueMatchId(activeWeek, match.id);
     const dbMatch = liveMatchesData[uniqueId] || {};
     return dbMatch.status === 'FINISHED';
  });

  const getRank = (arr: any[], uid: string) => {
    const item = arr.find(x => x.id === uid);
    if (!item) return '-';
    const myPts = item.pts;
    let rank = 1;
    for(let i=0; i<arr.length; i++) { if(arr[i].pts > myPts) rank++; }
    return rank;
  };

  const getPts = (arr: any[], uid: string) => {
    const item = arr.find(x => x.id === uid);
    return item ? item.pts : 0;
  };

  const renderMatchCard = (match: any, isFinishedGroup: boolean = false) => {
      const homeTeamUpper = match.homeTeam?.toUpperCase() || match.home_team?.toUpperCase();
      const awayTeamUpper = match.awayTeam?.toUpperCase() || match.away_team?.toUpperCase();

      const isWinnersOpen = openWinnersMap[match.id] !== false;
      const isPossibleOpen = openPossibleMap[match.id] || false;
      const isEliminatedOpen = openEliminatedMap[match.id] || false;
      const isExpanded = expandedMatches[match.id] !== undefined ? expandedMatches[match.id] : isFinishedGroup;

      const uniqueId = getUniqueMatchId(activeWeek, match.id);
      const dbMatch = liveMatchesData[uniqueId] || {};
      const isGoalFlashing = goalFlashes[uniqueId]; 
      
      let matchStatus = dbMatch.status || 'NOT_STARTED';
      let homeScore = dbMatch.home_score || '-';
      let awayScore = dbMatch.away_score || '-';

      const matchTimeMs = getMatchTimeMs(match.date, match.time);
      const twoHoursMs = 2 * 60 * 60 * 1000;
      
      if (matchStatus !== 'FINISHED') {
        if (now >= matchTimeMs && now < matchTimeMs + twoHoursMs) { matchStatus = 'LIVE'; } 
        else if (now >= matchTimeMs + twoHoursMs) { matchStatus = 'WAITING_APPROVAL'; }
      }

      if (matchStatus === 'LIVE' || matchStatus === 'WAITING_APPROVAL') {
         if (homeScore === '-') homeScore = '0';
         if (awayScore === '-') awayScore = '0';
      }

      const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ');
      const isTffMatch = isTffMatchCheck(match.category);
      const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);
      const isFinished = matchStatus === 'FINISHED'; 

      let exactWinners: {id: string, name: string, score: string}[] = [];
      let possibleWinners: {name: string, score: string}[] = [];
      let eliminatedPlayers: {name: string, score: string}[] = [];

      if ((matchStatus === 'LIVE' || matchStatus === 'FINISHED' || matchStatus === 'WAITING_APPROVAL') && homeScore !== '-' && awayScore !== '-') {
        const currentH = parseInt(homeScore);
        const currentA = parseInt(awayScore);

        Object.keys(mergedAccounts).forEach(id => {
          const predStr = predictionsData[`${id}-${activeWeek}-${match.id}`];
          if (!predStr || predStr === '-' || predStr === 'PAS') return;
          const name = mergedAccounts[id]?.name;
          if (!name) return;

          const [pHStr, pAStr] = predStr.split('-');
          const pH = parseInt(pHStr); const pA = parseInt(pAStr);

          if (pH === currentH && pA === currentA) { exactWinners.push({ id, name, score: predStr }); } 
          else if (pH >= currentH && pA >= currentA && !isFinished && matchStatus !== 'WAITING_APPROVAL') { possibleWinners.push({ name, score: predStr }); } 
          else { eliminatedPlayers.push({ name, score: predStr }); }
        });

        exactWinners.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        possibleWinners.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        eliminatedPlayers.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      }
      
      const winnersCount = exactWinners.length;
      let displayPoints = 1;
      if(winnersCount === 1) displayPoints = 12; else if(winnersCount === 2) displayPoints = 6;
      else if(winnersCount === 3) displayPoints = 5; else if(winnersCount === 4) displayPoints = 4;
      else if(winnersCount === 5) displayPoints = 3; else if(winnersCount === 6) displayPoints = 2;
      else if(winnersCount >= 7) displayPoints = 1; else displayPoints = 0;

      // 🔴 SİMÜLASYON MOTORU (O anki Puanları Dağıtıp Sıralamayı Hesaplar) 🔴
      let simulatedTff: any[] = [];
      let simulatedDfo: any[] = [];
      let simulatedMaster: any[] = [];
      let simulatedSkor: any[] = [];

      Object.keys(mergedAccounts).forEach(uid => {
         const isWinner = exactWinners.some(w => w.id === uid);
         const uName = normalizeName(mergedAccounts[uid]?.name || '');
         
         const base = baseStandings[uid] || baseStandings[uName] || { TFF: 0, DFO: 0, MASTER: 0, SKOR: 0 };
         const currWk = activeWeekBase[uid] || activeWeekBase[uName] || { TFF: 0, DFO: 0, MASTER: 0, SKOR: 0 };
         
         const ptsToAdd = (isWinner && matchStatus !== 'FINISHED') ? displayPoints : 0;
         const skorToAdd = (isWinner && matchStatus !== 'FINISHED') ? 1 : 0;

         simulatedTff.push({ id: uid, pts: base.TFF + currWk.TFF + (isTffMatch ? ptsToAdd : 0) });
         simulatedDfo.push({ id: uid, pts: base.DFO + currWk.DFO + (!isTffMatch ? ptsToAdd : 0) });
         simulatedMaster.push({ id: uid, pts: base.MASTER + currWk.MASTER + ptsToAdd });
         simulatedSkor.push({ id: uid, pts: base.SKOR + currWk.SKOR + skorToAdd });
      });

      simulatedTff.sort((a,b) => b.pts - a.pts); simulatedDfo.sort((a,b) => b.pts - a.pts);
      simulatedMaster.sort((a,b) => b.pts - a.pts); simulatedSkor.sort((a,b) => b.pts - a.pts);

      let countdownText = "";
      if (now < matchTimeMs && matchStatus === 'NOT_STARTED') {
        const distance = matchTimeMs - now;
        if (distance > 0) {
          const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((distance % (1000 * 60)) / 1000);
          countdownText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
      }

      return (
        <div 
          key={match.id} 
          className={`w-full max-w-2xl mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
            isGoalFlashing 
              ? 'goal-lightning' 
              : isExpanded 
                ? theme.containerBorder + ' ' + theme.containerShadow + ' ' + theme.containerBg 
                : theme.containerBorder + ' shadow-md hover:shadow-[0_0_15px_currentColor] ' + theme.badgeText + ' ' + (theme.bgImg ? '' : 'bg-slate-950')
          }`}
        >
          {theme.bgImg && (
            <>
              <div 
                className="absolute inset-0 z-0 opacity-100"
                style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              ></div>
              <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isExpanded || isGoalFlashing ? 'bg-slate-900/60' : 'bg-slate-950/70 hover:bg-slate-900/60'}`}></div>
            </>
          )}

          {!isExpanded && (
            <div
              onClick={() => toggleMatchExpansion(match.id)}
              className="cursor-pointer px-3 sm:px-5 flex items-center justify-between border-b border-black/50 relative z-20 group transition-all duration-300 py-3 sm:py-4"
            >
              <div className="flex-1 flex items-center gap-2 justify-end text-right">
                <span className="text-[10px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors">{homeTeamUpper}</span>
                <img src={theme.homeLogo} alt={homeTeamUpper} className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
              </div>
              
              <div className="px-3 sm:px-5 flex flex-col items-center justify-center">
                <div className={`flex items-center justify-center min-w-[60px] px-3 rounded-lg border shadow-inner backdrop-blur-md transition-all ${
                  isGoalFlashing ? 'bg-green-900/80 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)] scale-110' :
                  matchStatus === 'LIVE' ? 'py-1.5 bg-green-950/50 border-green-500/50 animate-pulse' : 'py-1.5 bg-[#080d1a]/80 border-slate-700/50 group-hover:border-slate-500/80'
                }`}>
                  <span className={`font-black whitespace-nowrap tracking-widest ${
                    isGoalFlashing ? 'text-sm sm:text-base text-green-300' :
                    matchStatus === 'LIVE' ? 'text-xs sm:text-sm text-green-500' : 'text-xs sm:text-sm text-slate-200 group-hover:text-white'
                  }`}>
                    {matchStatus === 'NOT_STARTED' ? match.time : `${homeScore} - ${awayScore}`}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-2 justify-start text-left">
                <img src={theme.awayLogo} alt={awayTeamUpper} className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors">{awayTeamUpper}</span>
              </div>
              
              <div className="ml-2 opacity-50 text-[10px] text-white group-hover:opacity-100 transition-opacity">▼</div>
            </div>
          )}

          {isExpanded && (
            <div className="relative flex-grow overflow-hidden animate-fadeIn z-10">
              <button 
                onClick={() => toggleMatchExpansion(match.id)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 bg-slate-950/50 text-slate-300 hover:text-white border border-slate-700/50 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
                title="Küçült"
              >
                ✕
              </button>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-full text-center pt-3 pb-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/50 px-3 py-1 rounded-full shadow-inner">
                    {match.weekLabel}
                  </span>
                </div>
                <div className="w-full text-center px-2 mt-2 relative z-30">
                  <span className={`inline-block w-[95%] sm:w-[85%] mx-auto px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-snug whitespace-nowrap ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                    {match.category}
                  </span>
                </div>

                <div className="flex items-center justify-between px-2 sm:px-6 pt-3 pb-4">
                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                      <img src={theme.homeLogo} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{homeTeamUpper}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 mx-1 sm:mx-4 w-36 sm:w-44 z-30 relative">
                    {theme.leagueLogo && (
                      <div className="w-10 h-10 sm:w-14 sm:h-14 mb-1 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform duration-500 z-40">
                        <img src={theme.leagueLogo} alt="League Logo" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {matchStatus === 'NOT_STARTED' && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-400 text-[10px] sm:text-xs font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                      </div>
                    )}
                    {matchStatus === 'LIVE' && (
                      <div className="bg-green-950/80 border border-green-700 px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse backdrop-blur-md z-40 relative">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-green-500 text-[10px] font-black tracking-widest">CANLI</span>
                      </div>
                    )}
                    {matchStatus === 'WAITING_APPROVAL' && (
                      <div className="bg-amber-950/80 border border-amber-700 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-500 text-[9px] sm:text-[10px] font-black tracking-widest">ONAY BEKLİYOR</span>
                      </div>
                    )}
                    {isFinished && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest">MS (BİTTİ)</span>
                      </div>
                    )}

                    <div className={`w-full bg-[#080d1a]/80 border ${isGoalFlashing ? 'border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.8)]' : theme.scoreBorder} py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 sm:gap-3 ${!isGoalFlashing && 'shadow-[0_0_15px_rgba(0,0,0,0.5)]'} backdrop-blur-md transition-all duration-300`}>
                      <span className={`text-xl sm:text-3xl font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 ${isGoalFlashing ? 'text-green-300 scale-125' : 'text-white'}`}>{homeScore}</span>
                      <span className={`text-base sm:text-xl font-bold ${isChampionsLeague ? 'text-white/50' : 'text-blue-400/50'}`}>:</span>
                      <span className={`text-xl sm:text-3xl font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 ${isGoalFlashing ? 'text-green-300 scale-125' : 'text-white'}`}>{awayScore}</span>
                    </div>

                    {matchStatus === 'NOT_STARTED' && countdownText && (
                      <div className="w-full bg-[#0c2a3b]/50 border border-[#164e63]/50 py-1 rounded-lg text-center shadow-md mt-1">
                        <span className="text-[#38bdf8] text-[9px] sm:text-[10px] font-mono font-bold tracking-widest drop-shadow-sm">
                          {countdownText}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                      <img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{awayTeamUpper}</span>
                  </div>
                </div>
              
                <div className={`${theme.bottomBar} border-t px-3 py-2.5 w-full backdrop-blur-md z-10 relative mt-auto`}>
                  <div className="flex justify-between items-center w-full">
                    <div className="text-left flex-1">
                      {matchStatus === 'NOT_STARTED' ? (
                        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                      ) : exactWinners.length === 0 ? (
                         !isFinished && possibleWinners.length > 0 ? (
                           <span className="text-[9px] sm:text-[10px] font-medium text-blue-300 italic">Tam isabet yok, {possibleWinners.length} kişi pusuda!</span>
                         ) : (
                           <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Skoru bilen kalmadı.</span>
                         )
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-medium text-emerald-300">
                          <strong className="text-emerald-400">{exactWinners.length} kişi</strong> tam isabetli
                        </span>
                      )}
                    </div>
                    <div className="flex-0 text-center px-1">
                      <span className={`text-[8px] font-black tracking-widest whitespace-nowrap px-2 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                        {isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI"}
                      </span>
                    </div>
                    <div className="text-right flex-1">
                      {(exactWinners.length > 0 || possibleWinners.length > 0 || eliminatedPlayers.length > 0) && matchStatus !== 'NOT_STARTED' && (
                        <button onClick={() => toggleWinners(match.id)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[9px] sm:text-[10px] outline-none whitespace-nowrap drop-shadow-sm">
                          {isWinnersOpen ? "Radarı Gizle ▲" : "Tüm Tahmin Radarı →"}
                        </button>
                      )}
                    </div>
                  </div>
                
                  {isWinnersOpen && (matchStatus === 'LIVE' || matchStatus === 'FINISHED' || matchStatus === 'WAITING_APPROVAL') && (
                    <div className="w-full mt-2 flex flex-col gap-2 animate-fadeIn pb-1">
                      
                      {/* 🔴 TAM İSABET EDENLER (KÜRSÜ TASARIMI) 🔴 */}
                      {exactWinners.length > 0 && (
                        <div className="w-full bg-slate-950/80 rounded-xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden mt-1 mb-2">
                          <div className="bg-emerald-950/80 p-2 border-b border-emerald-500/50 flex justify-center items-center relative overflow-hidden">
                             <span className="bg-emerald-500 text-slate-950 font-black px-4 py-1 rounded-full text-[10px] sm:text-xs z-10 shadow-sm border border-emerald-300 tracking-widest text-center">
                                +{displayPoints} PUAN YAZILIYOR
                             </span>
                          </div>
                          
                          <div className="flex flex-col gap-2 p-2 max-h-[350px] overflow-y-auto custom-scrollbar bg-slate-900/50">
                            {exactWinners.map((winner, idx) => {
                              const uniquePlayerKey = `${match.id}-${winner.id}`;
                              const isRankOpen = openPlayerRanks[uniquePlayerKey] || false;

                              const tffRank = getRank(simulatedTff, winner.id);
                              const dfoRank = getRank(simulatedDfo, winner.id);
                              const masterRank = getRank(simulatedMaster, winner.id);
                              const skorRank = getRank(simulatedSkor, winner.id);

                              const tffPts = getPts(simulatedTff, winner.id);
                              const dfoPts = getPts(simulatedDfo, winner.id);
                              const masterPts = getPts(simulatedMaster, winner.id);
                              const skorPts = getPts(simulatedSkor, winner.id);

                              return (
                                <div key={idx} className="flex-shrink-0 bg-slate-950 border border-slate-700/80 rounded-lg shadow-md relative overflow-hidden transition-all duration-300">
                                   
                                   {/* İSİM BUTONU (ORTALANMIŞ) */}
                                   <button 
                                      onClick={() => togglePlayerRank(uniquePlayerKey)}
                                      className={`w-full flex items-center justify-center py-3 px-4 relative z-10 transition-colors ${isRankOpen ? 'bg-slate-900/80' : 'bg-slate-950 hover:bg-slate-900/50'}`}
                                   >
                                       <span className="text-slate-100 font-black text-[12px] sm:text-sm uppercase tracking-widest flex items-center gap-2 text-center">
                                           {winner.name} 
                                           <span className="text-slate-500 text-[10px]">{isRankOpen ? '▲' : '▼'}</span>
                                       </span>
                                   </button>
                                   
                                   {/* AÇILAN KÜRSÜ (DÜZ VE NET RENKLER) */}
                                   {isRankOpen && (
                                     <div className="flex flex-col items-center gap-1.5 w-full pb-4 pt-1 px-2 z-10 animate-fadeIn bg-slate-900/40 border-t border-slate-800/50">
                                         {/* 1. SIRA - TEPEDE (MASTER) */}
                                         <div className="text-white bg-amber-600 border border-amber-500 px-5 py-2 rounded-t-xl rounded-b-sm text-[10px] sm:text-[11px] font-black tracking-widest flex items-center justify-center w-[85%] max-w-[220px] shadow-md">
                                             MASTER SIRA {masterRank} / {masterPts} PUAN
                                         </div>
                                         
                                         {/* 2. VE 3. SIRA - YAN YANA (TFF/DFO Solda, SKOR Sağda) */}
                                         <div className="flex justify-center gap-2 w-[95%] max-w-[300px]">
                                             {isTffMatch ? (
                                                 <div className="text-white bg-rose-600 border border-rose-500 px-3 py-2 rounded-l-xl rounded-r-sm text-[10px] sm:text-[11px] font-black tracking-widest flex-1 text-center flex items-center justify-center leading-snug shadow-md">
                                                     TFF <br className="sm:hidden" /> SIRA {tffRank} / {tffPts} PUAN
                                                 </div>
                                             ) : (
                                                 <div className="text-white bg-blue-600 border border-blue-500 px-3 py-2 rounded-l-xl rounded-r-sm text-[10px] sm:text-[11px] font-black tracking-widest flex-1 text-center flex items-center justify-center leading-snug shadow-md">
                                                     DFO <br className="sm:hidden" /> SIRA {dfoRank} / {dfoPts} PUAN
                                                 </div>
                                             )}
                                             <div className="text-white bg-emerald-600 border border-emerald-500 px-3 py-2 rounded-r-xl rounded-l-sm text-[10px] sm:text-[11px] font-black tracking-widest flex-1 text-center flex items-center justify-center leading-snug shadow-md">
                                                 SKOR <br className="sm:hidden" /> SIRA {skorRank} / {skorPts} İSABET
                                             </div>
                                         </div>
                                     </div>
                                   )}

                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* ŞANSI DEVAM EDENLER */}
                      {!isFinished && matchStatus !== 'WAITING_APPROVAL' && possibleWinners.length > 0 && (
                        <div className="w-full bg-blue-950/30 rounded-lg border border-blue-800/50 shadow-inner overflow-hidden">
                          <button onClick={() => togglePossible(match.id)} className="w-full flex justify-between items-center p-2.5 bg-blue-900/30 hover:bg-blue-800/40 transition-colors">
                            <span className="text-blue-400 font-bold text-[9px] sm:text-[10px]">⏳ ŞANSI DEVAM EDENLER ({possibleWinners.length} KİŞİ)</span>
                            <span className="text-blue-400 text-[10px]">{isPossibleOpen ? '▲' : '▼'}</span>
                          </button>
                          {isPossibleOpen && (
                            <div className="p-2.5 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1 border-t border-blue-900/50">
                              {possibleWinners.map((winner, idx) => (
                                <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-blue-900/30 text-slate-300 border-blue-700/50 flex gap-1 items-center">
                                  <span>{winner.name}</span>
                                  <span className="text-cyan-400 font-black tracking-widest">[{winner.score}]</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ELENENLER */}
                      {eliminatedPlayers.length > 0 && (
                        <div className="w-full bg-red-950/20 rounded-lg border border-red-900/30 shadow-inner overflow-hidden">
                          <button onClick={() => toggleEliminated(match.id)} className="w-full flex justify-between items-center p-2.5 bg-red-900/20 hover:bg-red-800/30 transition-colors">
                            <span className="text-red-400 font-bold text-[9px] sm:text-[10px]">❌ ŞANSI KALMAYANLAR ({eliminatedPlayers.length} KİŞİ)</span>
                            <span className="text-red-400 text-[10px]">{isEliminatedOpen ? '▲' : '▼'}</span>
                          </button>
                          {isEliminatedOpen && (
                            <div className="p-2.5 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1 border-t border-red-900/30">
                              {eliminatedPlayers.map((winner, idx) => (
                                <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-red-950/40 text-slate-400 border-red-900/50 flex gap-1 items-center opacity-70">
                                  <span className="line-through">{winner.name}</span>
                                  <span className="text-red-500 font-black tracking-widest">[{winner.score}]</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 flex flex-col gap-5">
      
      {/* 🔴 ŞİMŞEK VE PARLAMA ANİMASYON STİLLERİ 🔴 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes lightning {
          0% { box-shadow: 0 0 10px #4ade80, inset 0 0 10px #4ade80; border-color: #4ade80; background-color: rgba(74, 222, 128, 0.1); }
          15% { box-shadow: 0 0 60px #22c55e, inset 0 0 40px #22c55e; border-color: #22c55e; background-color: rgba(34, 197, 94, 0.4); }
          30% { box-shadow: 0 0 10px #4ade80, inset 0 0 10px #4ade80; border-color: #4ade80; background-color: rgba(74, 222, 128, 0.1); }
          45% { box-shadow: 0 0 80px #16a34a, inset 0 0 60px #16a34a; border-color: #16a34a; background-color: rgba(22, 163, 74, 0.5); }
          60% { box-shadow: 0 0 10px #4ade80, inset 0 0 10px #4ade80; border-color: #4ade80; background-color: rgba(74, 222, 128, 0.1); }
          100% { box-shadow: 0 0 10px #4ade80, inset 0 0 10px #4ade80; border-color: #4ade80; background-color: rgba(74, 222, 128, 0.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .goal-lightning {
          animation: lightning 0.5s ease-in-out infinite;
          z-index: 50;
          transform: scale(1.02);
          transition: all 0.3s;
        }
      `}} />

      <div className="w-full flex justify-end px-2 sm:px-0">
          <button
              onClick={toggleSound}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest transition-all shadow-md border ${
                  soundEnabled
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900/80 text-slate-500 border-slate-700/80 hover:bg-slate-800'
              }`}
          >
              {soundEnabled ? '🔊 CANLI GOL SESİ: AÇIK' : '🔇 GOL SESİNİ AÇ'}
          </button>
      </div>

      {weeklyLiveStats.maxPts > 0 && (
          <div className="mb-2 p-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.3)] animate-fadeIn">
              <h2 className="text-center font-black text-blue-400 text-[11px] sm:text-xs tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
                  <span className="text-lg sm:text-xl">📡</span> {activeWeek}. HAFTA CANLI LİDERLİK RADARI
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center transition-all hover:scale-105">
                      <span className="text-emerald-400 text-[9px] sm:text-[10px] font-bold tracking-widest mb-1">🔥 HAFTANIN PUAN LİDERİ</span>
                      <span className="text-white font-black text-xs sm:text-sm uppercase text-center leading-snug">
                          {weeklyLiveStats.pLeaders.length > 0 
                              ? weeklyLiveStats.pLeaders.map(uid => mergedAccounts[uid]?.name.replace(/🏆/g, '').trim()).join(' & ') 
                              : 'MÜSTAKİL LİDER YOK'}
                      </span>
                      <span className="text-emerald-500 font-bold text-[10px] sm:text-xs mt-1.5 bg-emerald-950/50 px-2.5 py-0.5 rounded shadow-sm border border-emerald-800/50">
                          {weeklyLiveStats.pLeaders.length > 0 ? `${weeklyLiveStats.maxPts} PUAN` : '---'}
                      </span>
                  </div>

                  <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center transition-all hover:scale-105">
                      <span className="text-amber-400 text-[9px] sm:text-[10px] font-bold tracking-widest mb-1">⚽ HAFTANIN SKOR KRALI</span>
                      <span className="text-white font-black text-xs sm:text-sm uppercase text-center leading-snug">
                          {weeklyLiveStats.sLeaders.length > 0 
                              ? weeklyLiveStats.sLeaders.map(uid => mergedAccounts[uid]?.name.replace(/🏆/g, '').trim()).join(' & ') 
                              : 'MÜSTAKİL KRAL YOK'}
                      </span>
                      <span className="text-amber-500 font-bold text-[10px] sm:text-xs mt-1.5 bg-amber-950/50 px-2.5 py-0.5 rounded shadow-sm border border-amber-800/50">
                          {weeklyLiveStats.sLeaders.length > 0 ? `${weeklyLiveStats.maxScores} TAM İSABET` : '---'}
                      </span>
                  </div>
              </div>
          </div>
      )}

      {todaysMatchesList.length === 0 ? (
        <div className="w-full text-center py-10 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
          <span className="text-3xl mb-2 block opacity-50">🗓️</span>
          <p className="text-slate-400 text-sm font-medium tracking-widest">BUGÜN PLANLANAN BİR MAÇ BULUNMUYOR</p>
        </div>
      ) : (
        <>
          {finishedMatches.length > 0 && (
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800/50 shadow-xl backdrop-blur-xl overflow-hidden">
              <button 
                onClick={() => setIsFinishedAccordionOpen(!isFinishedAccordionOpen)}
                className="w-full flex items-center justify-between px-4 py-2 sm:py-3 bg-slate-900/50 hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 group"
              >
                <div className="flex-1"></div> 
                <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center flex items-center gap-2">
                  📅 GÜNÜN BİTEN MAÇLARI ({finishedMatches.length})
                </h2>
                <div className="flex-1 flex justify-end">
                  <div className={`p-1 transition-transform duration-300 ${isFinishedAccordionOpen ? 'rotate-180' : ''}`}>
                    <span className="text-slate-500 text-[10px] sm:text-xs">▼</span>
                  </div>
                </div>
              </button>
              
              {isFinishedAccordionOpen && (
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-slate-900/20">
                  {finishedMatches.map(match => renderMatchCard(match, true))}
                </div>
              )}
            </div>
          )}

          {activeMatches.length > 0 && (
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden">
              <button 
                onClick={() => setIsLiveAccordionOpen(!isLiveAccordionOpen)}
                className="w-full flex items-center justify-between px-4 py-3 sm:py-4 bg-slate-900/80 hover:bg-slate-800/80 transition-colors border-b border-slate-800/80 group"
              >
                <div className="flex-1 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div> 
                <h2 className="text-xs sm:text-sm font-black text-green-500 uppercase tracking-widest drop-shadow-md text-center">
                  GÜNÜN CANLI MAÇLARI ({activeMatches.length})
                </h2>
                <div className="flex-1 flex justify-end">
                  <div className={`p-1 transition-transform duration-300 ${isLiveAccordionOpen ? 'rotate-180' : ''}`}>
                    <span className="text-slate-400 text-[10px] sm:text-xs">▼</span>
                  </div>
                </div>
              </button>
              
              {isLiveAccordionOpen && (
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-slate-900/30">
                  {activeMatches.map(match => renderMatchCard(match, false))}
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}