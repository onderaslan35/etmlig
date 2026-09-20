'use client';

import React, { useState, useEffect, useRef } from 'react';
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

// 🔴 TFF İÇİN SABİT KASALAR 🔴
const tffIlk4Hafta: Record<string, number> = { "262707": 10, "262816": 9, "262733": 7, "262754": 6, "262728": 6, "262706": 6, "262771": 5, "262734": 5, "262705": 4, "262714": 4, "262763": 4, "262756": 4, "262774": 4, "262740": 4, "262702": 3, "262782": 3, "262813": 3, "262723": 2, "262749": 2, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1, "262736": 6, "262755": 6 };
const tffHafta5Kasa: Record<string, number> = { "262782": 16, "262749": 14, "262758": 14, "262732": 14, "262726": 12, "262744": 9, "262730": 9, "262736": 7, "262717": 7, "262790": 5, "262735": 4, "262721": 4, "262725": 3, "351925": 3, "262716": 2, "262747": 2, "262715": 2, "262719": 2, "262771": 2, "262707": 2, "262714": 2, "262731": 2, "262738": 2, "262741": 2, "262763": 1, "262772": 1, "262703": 1, "262756": 1, "262706": 1, "262750": 1, "262753": 1, "262702": 1, "262754": 1, "262708": 1, "262718": 1, "262770": 1, "262816": 1, "262774": 1, "262723": 1, "262813": 1 };

export default function LiveMatchCard() {
  const [activeWeek, setActiveWeek] = useState(6);
  const [isWeekLoaded, setIsWeekLoaded] = useState(false);

  // 🔴 15 SANİYELİK OTOMATİK MOTOR TETİKLEYİCİ STATE 🔴
  const [autoEngine, setAutoEngine] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  const prevScoresRef = useRef<Record<string, string>>({});
  
  const [goalFlashes, setGoalFlashes] = useState<Record<number, boolean>>({});

  const [todaysMatchesList, setTodaysMatchesList] = useState<any[]>([]);
  const [liveMatchesData, setLiveMatchesData] = useState<Record<number, any>>({});
  const [predictionsData, setPredictionsData] = useState<Record<string, string>>({});
  
  const [globalLiveRanks, setGlobalLiveRanks] = useState<{ TFF: any[], DFO: any[], MASTER: any[], SKOR: any[] }>({ TFF: [], DFO: [], MASTER: [], SKOR: [] });

  const [now, setNow] = useState<number>(new Date().getTime());
  
  const [weeklyLiveStats, setWeeklyLiveStats] = useState<{ pLeaders: string[], maxPts: number, sLeaders: string[], maxScores: number }>({ pLeaders: [], maxPts: 0, sLeaders: [], maxScores: 0 });

  const [isLiveAccordionOpen, setIsLiveAccordionOpen] = useState<boolean>(true); 
  const [isFinishedAccordionOpen, setIsFinishedAccordionOpen] = useState<boolean>(false);
  
  const [openEventsMap, setOpenEventsMap] = useState<{ [key: number]: boolean }>({});
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

  // 🔴 TABLETİ SUNUCUYA ÇEVİREN 15 SANİYELİK ZIRH 🔴
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoEngine) {
      // Açıldığı an ilk kurşunu sıkar
      fetch('/api/canli-skor').catch(e => console.log("Motor hatası:", e));
      
      // Sonra tam 15 saniyede bir düzenli ateş eder
      interval = setInterval(() => {
        fetch('/api/canli-skor').catch(e => console.log("Motor hatası:", e));
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [autoEngine]);

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

  useEffect(() => {
    if (!isWeekLoaded) return;
    
    const fetchMatchesAndPredictions = async () => {
      const fetchTable = async (t: string) => { const { data } = await supabase.from(t).select('*'); return data || []; };

      const [dfoData, masterData, skorDfoData, skorTffData, manualPointsData] = await Promise.all([
          fetchTable('dfo_weekly_points'),
          fetchTable('master_weekly_points'),
          fetchTable('dfo_weekly_scores'),
          fetchTable('tff_weekly_scores'),
          fetchTable('points')
      ]);

      const st: Record<string, { TFF: number, DFO: number, MASTER: number, SKOR: number }> = {};
      Object.keys(mergedAccounts).forEach(uid => { st[uid] = { TFF: 0, DFO: 0, MASTER: 0, SKOR: 0 }; });

      const getDict = (data: any[]) => {
          const dict: Record<string, any> = {};
          data.forEach(r => dict[String(r.username || r.user_id || r.id).trim()] = {w1:r.w1||0, w2:r.w2||0, w3:r.w3||0, w4:r.w4||0});
          return dict;
      };

      const masterDict = getDict(masterData);
      const dfoDict = getDict(dfoData);
      const skorDfoDict = getDict(skorDfoData);
      const skorTffDict = getDict(skorTffData);

      Object.keys(mergedAccounts).forEach(uid => {
          if (!st[uid]) return;
          
          const md = masterDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          st[uid].MASTER += (Number(md.w1) + Number(md.w2) + Number(md.w3) + Number(md.w4));
          
          const dd = dfoDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          st[uid].DFO += (Number(dd.w1) + Number(dd.w2) + Number(dd.w3) + Number(dd.w4));
          
          const sd = skorDfoDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          const stff = skorTffDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          st[uid].SKOR += (Number(sd.w1) + Number(sd.w2) + Number(sd.w3) + Number(sd.w4)) + 
                          (Number(stff.w1) + Number(stff.w2) + Number(stff.w3) + Number(stff.w4));
          
          st[uid].TFF += (tffIlk4Hafta[uid] || 0) + (tffHafta5Kasa[uid] || 0);
      });

      const { data: dbBulletinMatches } = await supabase.from('matches_bulletin').select('*').gte('week_num', 5).order('match_index', { ascending: true });
      const catDict: Record<string, string> = {};
      (dbBulletinMatches || []).forEach(m => {
          catDict[`${m.week_num}-${m.match_index}`] = m.category;
      });

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

      const { data: dbLiveMatches } = await supabase.from('live_matches').select('*');
      const liveMap: Record<number, any> = {};
      (dbLiveMatches || []).forEach(row => liveMap[row.id] = row); 
      setLiveMatchesData(liveMap);

      Object.values(liveMap).forEach(dbMatch => {
          const weekNum = Math.floor(dbMatch.id / 100);
          const matchIndex = dbMatch.id % 100;

          if (weekNum >= 5 && weekNum <= 38 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
              const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
              const winnerIds = Object.keys(mergedAccounts).filter(id => pDict[`${id}-${weekNum}-${matchIndex}`] === targetScore);
              
              let pts = 1;
              if(winnerIds.length === 1) pts = 12; else if(winnerIds.length === 2) pts = 6;
              else if(winnerIds.length === 3) pts = 5; else if(winnerIds.length === 4) pts = 4;
              else if(winnerIds.length === 5) pts = 3; else if(winnerIds.length === 6) pts = 2;
              else if(winnerIds.length >= 7) pts = 1; else pts = 0;

              const category = catDict[`${weekNum}-${matchIndex}`] || "";
              const isTff = isTffMatchCheck(category);

              const isLiveOrFinished = ['FINISHED', 'FT', 'AET', 'PEN', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbMatch.status);
              if (isLiveOrFinished) {
                  winnerIds.forEach(wId => {
                      if (st[wId]) {
                          if (isTff && weekNum >= 6) st[wId].TFF += pts; 
                          if (!isTff) st[wId].DFO += pts;
                          st[wId].MASTER += pts;
                          st[wId].SKOR += 1;
                      }
                  });
              }
          }
      });

      manualPointsData.forEach(row => {
          const ev = String(row.ev_sahibi || '').toUpperCase();
          if (ev === 'HAFTANIN' || ev === 'SKOR') {
              const uid = String(row.username || row.user_id || row.id || '').trim();
              const cat = String(row.kategori || row.league_type || 'MASTER').toUpperCase().trim();
              const pts = Number(row.puan ?? row.points ?? row.totalPoints) || 0;
              if (pts !== 0 && st[uid]) { if (cat === 'MASTER') st[uid].MASTER += pts; }
          }
      });
      
      let dynamicBonusPoints: Record<string, number> = {};
      for (let w = 5; w <= activeWeek; w++) {
          const match24 = liveMap[getUniqueMatchId(w, 24)];
          const isLiveOrFinished2 = match24 && ['FINISHED', 'FT', 'AET', 'PEN', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(match24.status);
          
          if (isLiveOrFinished2) {
              let wkMaster: any = {}, wkSkor: any = {};
              (dbBulletinMatches || []).filter(m => m.week_num === w).forEach(m => {
                  const dbM = liveMap[getUniqueMatchId(w, m.match_index)];
                  if (dbM && !['NOT_STARTED', 'NS', 'TBD'].includes(dbM.status) && dbM.home_score !== '-') {
                      const targetScore = `${dbM.home_score}-${dbM.away_score}`.replace(/\s+/g, '');
                      const winnerIds = Object.keys(mergedAccounts).filter(id => pDict[`${id}-${w}-${m.match_index}`] === targetScore);
                      let pts = 1; if(winnerIds.length===1)pts=12; else if(winnerIds.length===2)pts=6; else if(winnerIds.length===3)pts=5; else if(winnerIds.length===4)pts=4; else if(winnerIds.length===5)pts=3; else if(winnerIds.length===6)pts=2; else if(winnerIds.length>=7)pts=1; else pts=0;
                      winnerIds.forEach(id => { wkMaster[id] = (wkMaster[id]||0) + pts; wkSkor[id] = (wkSkor[id]||0) + 1; });
                  }
              });

              const applyBonus = (wkScores: any) => {
                  let maxP = -1; let leaders: string[] = [];
                  Object.keys(wkScores).forEach(id => {
                      if (wkScores[id] > maxP) { maxP = wkScores[id]; leaders = [id]; }
                      else if (wkScores[id] === maxP) leaders.push(id);
                  });
                  if (leaders.length === 1 && maxP > 0) { dynamicBonusPoints[leaders[0]] = (dynamicBonusPoints[leaders[0]] || 0) + 3; }
              };
              applyBonus(wkMaster); applyBonus(wkSkor);
          }
      }

      Object.keys(dynamicBonusPoints).forEach(id => {
          if (st[id]) st[id].MASTER += dynamicBonusPoints[id];
      });

      let arrTFF: any[] = [], arrDFO: any[] = [], arrMASTER: any[] = [], arrSKOR: any[] = [];
      Object.keys(st).forEach(id => {
          const name = mergedAccounts[id]?.name || '';
          arrTFF.push({ id, name, pts: st[id].TFF });
          arrDFO.push({ id, name, pts: st[id].DFO });
          arrMASTER.push({ id, name, pts: st[id].MASTER });
          arrSKOR.push({ id, name, pts: st[id].SKOR });
      });

      const sortFunc = (a: any, b: any) => b.pts - a.pts || a.name.localeCompare(b.name, 'tr');
      
      arrTFF.sort(sortFunc).forEach((x, i) => x.rank = i + 1);
      arrDFO.sort(sortFunc).forEach((x, i) => x.rank = i + 1);
      arrMASTER.sort(sortFunc).forEach((x, i) => x.rank = i + 1);
      arrSKOR.sort(sortFunc).forEach((x, i) => x.rank = i + 1);

      setGlobalLiveRanks({ TFF: arrTFF, DFO: arrDFO, MASTER: arrMASTER, SKOR: arrSKOR });

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
          const isLiveOrFinished3 = ['FINISHED', 'FT', 'AET', 'PEN', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbMatch.status);
          if (isLiveOrFinished3) {
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
              const winnerIds = Object.keys(mergedAccounts).filter(id => pDict[`${id}-${activeWeek}-${m.id}`] === targetScore);
              
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
           const isLiveOrFinished4 = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(status);
           const mDate = parseDateLocal(m.date);
           const isToday = mDate.getTime() === todayMidnight.getTime();
           if (isLiveOrFinished4) return true;
           return isToday;
      });
      setTodaysMatchesList(todaysMatches);
      
      const match24Id = getUniqueMatchId(activeWeek, 24);
      const dbMatch24 = liveMap[match24Id];
      if (dbMatch24 && ['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch24.status)) {
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

  const toggleEvents = (matchId: number) => setOpenEventsMap((prev) => ({ ...prev, [matchId]: prev[matchId] === false ? true : false })); 
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
     return !['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch.status);
  });

  const finishedMatches = todaysMatchesList.filter(match => {
     const uniqueId = getUniqueMatchId(activeWeek, match.id);
     const dbMatch = liveMatchesData[uniqueId] || {};
     return ['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch.status);
  });

  const renderMatchCard = (match: any, isFinishedGroup: boolean = false) => {
      const homeTeamUpper = match.homeTeam?.toUpperCase() || match.home_team?.toUpperCase();
      const awayTeamUpper = match.awayTeam?.toUpperCase() || match.away_team?.toUpperCase();

      const isEventsOpen = openEventsMap[match.id] !== false;
      const isWinnersOpen = openWinnersMap[match.id] !== false;
      const isPossibleOpen = openPossibleMap[match.id] || false;
      const isEliminatedOpen = openEliminatedMap[match.id] || false;
      const isExpanded = expandedMatches[match.id] !== undefined ? expandedMatches[match.id] : isFinishedGroup;

      const uniqueId = getUniqueMatchId(activeWeek, match.id);
      const dbMatch = liveMatchesData[uniqueId] || {};
      const isGoalFlashing = goalFlashes[uniqueId]; 
      
      let safeEvents: any[] = [];
      if (Array.isArray(dbMatch.events)) {
         safeEvents = dbMatch.events;
      } else if (typeof dbMatch.events === 'string') {
         try {
            const parsed = JSON.parse(dbMatch.events);
            safeEvents = Array.isArray(parsed) ? parsed : [];
         } catch (e) {
            safeEvents = [];
         }
      }

      let matchStatus = dbMatch.status || 'NOT_STARTED';
      let homeScore = dbMatch.home_score || '-';
      let awayScore = dbMatch.away_score || '-';

      const matchTimeMs = getMatchTimeMs(match.date, match.time);
      const twoHoursMs = 2 * 60 * 60 * 1000;
      
      if (!['FINISHED', 'FT', 'AET', 'PEN', 'HT', '1H', '2H', 'ET', 'P'].includes(matchStatus)) {
        if (matchStatus === 'NOT_STARTED' || matchStatus === 'NS' || matchStatus === 'TBD') {
            if (now >= matchTimeMs && now < matchTimeMs + twoHoursMs) { matchStatus = 'LIVE'; } 
            else if (now >= matchTimeMs + twoHoursMs) { matchStatus = 'WAITING_APPROVAL'; }
        }
      }

      const isFinishedStatus = ['FINISHED', 'FT', 'AET', 'PEN'].includes(matchStatus);
      const isLiveStatus = ['LIVE', '1H', '2H', 'ET', 'P'].includes(matchStatus);
      const isHT = matchStatus === 'HT';

      if (isLiveStatus || matchStatus === 'WAITING_APPROVAL') {
         if (homeScore === '-') homeScore = '0';
         if (awayScore === '-') awayScore = '0';
      }

      const rawElapsed = dbMatch.elapsed;
      let safeElapsed = typeof rawElapsed === 'object' && rawElapsed !== null ? rawElapsed.elapsed : rawElapsed;
      
      const systemTimeEvent = safeEvents.find((e: any) => e.type === 'SystemTime');
      const safeExtra = systemTimeEvent ? systemTimeEvent.detail : null;

      let displayMinute = '';
      if (safeElapsed !== null && safeElapsed !== undefined && safeElapsed !== '') {
         if (safeExtra) {
            displayMinute = `${safeElapsed}+${safeExtra}'`;
         } else {
            displayMinute = `${safeElapsed}'`;
         }
      }

      const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ');
      const isTffMatch = isTffMatchCheck(match.category);
      const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);

      let exactWinners: {id: string, name: string, score: string}[] = [];
      let possibleWinners: {name: string, score: string}[] = [];
      let eliminatedPlayers: {name: string, score: string}[] = [];

      if ((isLiveStatus || isFinishedStatus || isHT || matchStatus === 'WAITING_APPROVAL') && homeScore !== '-' && awayScore !== '-') {
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
          else if (pH >= currentH && pA >= currentA && !isFinishedStatus && matchStatus !== 'WAITING_APPROVAL') { possibleWinners.push({ name, score: predStr }); } 
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

      let countdownText = "";
      if (now < matchTimeMs && (matchStatus === 'NOT_STARTED' || matchStatus === 'NS' || matchStatus === 'TBD')) {
        const distance = matchTimeMs - now;
        if (distance > 0) {
          const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((distance % (1000 * 60)) / 1000);
          countdownText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
      }

      const homeEvents = safeEvents.filter((e: any) => e.type !== 'SystemTime' && (e.isHome === true || e?.team?.name === match.homeTeam));
      const awayEvents = safeEvents.filter((e: any) => e.type !== 'SystemTime' && (e.isHome === false || (e.isHome === undefined && e?.team?.name === match.awayTeam)));

      return (
        <div 
          key={match.id} 
          className={`w-full max-w-2xl mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
            isGoalFlashing 
              ? 'police-siren' 
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
              className="cursor-pointer px-2 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-black/50 relative z-20 group transition-all duration-300"
            >
              <div className="flex-1 flex items-center justify-end overflow-hidden pr-1.5 sm:pr-3">
                <span className="text-[9px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors text-right">
                  {homeTeamUpper}
                </span>
              </div>
              
              <div className="flex items-center justify-center shrink-0">
                <img src={theme.homeLogo} alt={homeTeamUpper} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md group-hover:scale-110 transition-transform z-10" />
                
                <div className="flex flex-col items-center justify-center mx-1 sm:mx-1.5 min-w-[40px] sm:min-w-[50px]">
                  <div className="mb-0.5 flex items-center justify-center">
                    {isHT ? (
                      <span className="text-[10px] sm:text-[11px] font-black text-amber-400 tracking-wider drop-shadow-md">İLK YARI</span>
                    ) : isLiveStatus ? (
                      <span className="text-[10px] sm:text-[11px] font-black text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)] animate-pulse tracking-wider">
                        {displayMinute}
                      </span>
                    ) : matchStatus === 'WAITING_APPROVAL' ? (
                      <span className="text-[8px] sm:text-[9px] font-black text-amber-500 tracking-wider">ONAY</span>
                    ) : isFinishedStatus ? (
                      <span className="text-[8px] sm:text-[9px] font-black text-slate-400 tracking-wider">MS</span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 tracking-wider">{match.time}</span>
                    )}
                  </div>
                  
                  <div className={`flex items-center justify-center px-1.5 py-0.5 sm:py-1 rounded border shadow-inner backdrop-blur-md transition-all w-full ${
                    isGoalFlashing ? 'bg-blue-900/80 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.9)] scale-110' :
                    (isLiveStatus || isHT) ? 'bg-green-950/60 border-green-500/40' : 'bg-[#080d1a]/80 border-slate-700/60'
                  }`}>
                    <span className={`font-black text-[12px] sm:text-[14px] tracking-widest leading-none ${isGoalFlashing ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]' : 'text-white'}`}>
                      {(!isLiveStatus && !isFinishedStatus && !isHT && matchStatus !== 'WAITING_APPROVAL') ? 'v' : `${homeScore}-${awayScore}`}
                    </span>
                  </div>
                </div>
                
                <img src={theme.awayLogo} alt={awayTeamUpper} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md group-hover:scale-110 transition-transform z-10" />
              </div>
              
              <div className="flex-1 flex items-center justify-start overflow-hidden pl-1.5 sm:pl-3">
                <span className="text-[9px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors text-left">
                  {awayTeamUpper}
                </span>
              </div>
              
              <div className="absolute right-1 sm:right-2 opacity-30 text-[8px] text-white group-hover:opacity-100 transition-opacity">▼</div>
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

                    {(!isLiveStatus && !isFinishedStatus && !isHT && matchStatus !== 'WAITING_APPROVAL') && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-400 text-[10px] sm:text-xs font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                      </div>
                    )}
                    
                    {isHT && (
                      <div className="flex flex-col items-center justify-center mb-1.5 z-40 relative">
                        <span className="text-amber-400 font-black text-2xl sm:text-3xl leading-none drop-shadow-md">İLK YARI</span>
                      </div>
                    )}

                    {isLiveStatus && (
                      <div className="flex flex-col items-center justify-center mb-1.5 z-40 relative animate-pulse">
                        <span className="text-green-400 font-black text-3xl sm:text-4xl leading-none drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]">
                          {displayMinute}
                        </span>
                        <span className="text-green-500 text-[9px] sm:text-[10px] font-black tracking-widest mt-1 bg-green-950/80 px-3 py-0.5 rounded-full border border-green-600 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                          🔴 CANLI
                        </span>
                      </div>
                    )}

                    {matchStatus === 'WAITING_APPROVAL' && (
                      <div className="bg-amber-950/80 border border-amber-700 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-500 text-[9px] sm:text-[10px] font-black tracking-widest">ONAY BEKLİYOR</span>
                      </div>
                    )}
                    {isFinishedStatus && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest">MS (BİTTİ)</span>
                      </div>
                    )}

                    <div className={`w-full bg-[#080d1a]/80 border ${isGoalFlashing ? 'border-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.9)]' : theme.scoreBorder} py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 sm:gap-3 ${!isGoalFlashing && 'shadow-[0_0_15px_rgba(0,0,0,0.5)]'} backdrop-blur-md transition-all duration-300`}>
                      <span className={`text-xl sm:text-3xl font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 ${isGoalFlashing ? 'text-white scale-125 drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'text-white'}`}>{homeScore}</span>
                      <span className={`text-base sm:text-xl font-bold ${isChampionsLeague ? 'text-white/50' : 'text-blue-400/50'}`}>:</span>
                      <span className={`text-xl sm:text-3xl font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 ${isGoalFlashing ? 'text-white scale-125 drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'text-white'}`}>{awayScore}</span>
                    </div>

                    {(!isLiveStatus && !isFinishedStatus && !isHT && matchStatus !== 'WAITING_APPROVAL') && countdownText && (
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

                {safeEvents.length > 0 && (
                  <div className="w-full mb-3 flex flex-col gap-2 px-1.5 sm:px-6 relative z-30 animate-fadeIn">
                    <button 
                      onClick={() => toggleEvents(match.id)}
                      className="w-full flex justify-between items-center px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 transition-colors border border-slate-700/50 rounded-lg backdrop-blur-md shadow-sm"
                    >
                      <span className="text-slate-300 font-bold text-[9px] sm:text-[10px] tracking-widest flex items-center gap-2">
                        <span>📊</span> MAÇ İSTATİSTİKLERİ VE OLAYLARI
                      </span>
                      <span className="text-slate-400 text-[10px]">{isEventsOpen ? '▲' : '▼'}</span>
                    </button>

                    {isEventsOpen && (
                      <div className="flex justify-between w-full text-xs sm:text-sm text-slate-300 bg-slate-900/40 rounded-lg p-1.5 sm:p-3 border border-slate-800/80 shadow-inner">
                        
                        <div className="flex-1 flex flex-col gap-1 items-start pr-1 sm:pr-3 border-r border-slate-700/50 overflow-hidden">
                          {homeEvents.map((e: any, i: number) => {
                            let icon = ''; let text = '';
                            if (e.type === 'Goal') {
                                icon = e.detail === 'Penalty' ? '🎯' : (e.detail === 'Own Goal' ? '🤦‍♂️' : '⚽');
                                text = String(e.player?.name || 'Oyuncu');
                            } else if (e.type === 'Card') {
                                icon = e.detail === 'Yellow Card' ? '🟨' : '🟥';
                                text = String(e.player?.name || 'Oyuncu');
                            } else if (e.type === 'subst') {
                                icon = '🔄';
                                text = `${String(e.assist?.name || 'Giren')} / ${String(e.player?.name || 'Çıkan')}`;
                            } else return null;

                            return (
                              <span key={`h-e-${i}`} className="flex items-center gap-1 bg-slate-800/40 px-1 sm:px-2 py-0.5 rounded shadow-sm w-full">
                                <span className="text-[9px] sm:text-xs drop-shadow-md shrink-0">{icon}</span> 
                                <span className="font-medium text-slate-200 flex-1 text-left text-[8.5px] sm:text-[10px] leading-[1.1] break-words whitespace-normal">{text}</span> 
                                <span className="text-emerald-400 font-bold text-[8px] sm:text-[9px] shrink-0">({String(e.time?.elapsed || 0)}')</span>
                              </span>
                            );
                          })}
                        </div>

                        <div className="flex-1 flex flex-col gap-1 items-end pl-1 sm:pl-3 overflow-hidden">
                          {awayEvents.map((e: any, i: number) => {
                            let icon = ''; let text = '';
                            if (e.type === 'Goal') {
                                icon = e.detail === 'Penalty' ? '🎯' : (e.detail === 'Own Goal' ? '🤦‍♂️' : '⚽');
                                text = String(e.player?.name || 'Oyuncu');
                            } else if (e.type === 'Card') {
                                icon = e.detail === 'Yellow Card' ? '🟨' : '🟥';
                                text = String(e.player?.name || 'Oyuncu');
                            } else if (e.type === 'subst') {
                                icon = '🔄';
                                text = `${String(e.assist?.name || 'Giren')} / ${String(e.player?.name || 'Çıkan')}`;
                            } else return null;

                            return (
                              <span key={`a-e-${i}`} className="flex items-center gap-1 bg-slate-800/40 px-1 sm:px-2 py-0.5 rounded shadow-sm w-full justify-end">
                                <span className="text-emerald-400 font-bold text-[8px] sm:text-[9px] shrink-0">({String(e.time?.elapsed || 0)}')</span> 
                                <span className="font-medium text-slate-200 flex-1 text-right text-[8.5px] sm:text-[10px] leading-[1.1] break-words whitespace-normal">{text}</span> 
                                <span className="text-[9px] sm:text-xs drop-shadow-md shrink-0">{icon}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`${theme.bottomBar} border-t px-3 py-2.5 w-full backdrop-blur-md z-10 relative mt-auto`}>
                  <div className="flex justify-between items-center w-full">
                    <div className="text-left flex-1">
                      {(!isLiveStatus && !isFinishedStatus && !isHT && matchStatus !== 'WAITING_APPROVAL') ? (
                        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                      ) : exactWinners.length === 0 ? (
                         !isFinishedStatus && possibleWinners.length > 0 ? (
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
                      {(exactWinners.length > 0 || possibleWinners.length > 0 || eliminatedPlayers.length > 0) && (isLiveStatus || isFinishedStatus || isHT || matchStatus === 'WAITING_APPROVAL') && (
                        <button onClick={() => toggleWinners(match.id)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[9px] sm:text-[10px] outline-none whitespace-nowrap drop-shadow-sm">
                          {isWinnersOpen ? "Radarı Gizle ▲" : "Tüm Tahmin Radarı →"}
                        </button>
                      )}
                    </div>
                  </div>
                
                  {isWinnersOpen && (isLiveStatus || isFinishedStatus || isHT || matchStatus === 'WAITING_APPROVAL') && (
                    <div className="w-full mt-2 flex flex-col gap-2 animate-fadeIn pb-1">
                      
                      {exactWinners.length > 0 && (
                        <div className="w-full bg-slate-950/80 rounded-xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden mt-1 mb-2">
                          <div className="bg-emerald-950/80 p-2 border-b border-emerald-500/50 flex justify-center items-center relative overflow-hidden">
                              <span className="bg-emerald-500 text-slate-950 font-black px-4 py-1 rounded-full text-[10px] sm:text-xs z-10 shadow-sm border border-emerald-300 tracking-widest text-center">
                                +{displayPoints} PUAN YAZILIYOR
                              </span>
                          </div>
                          
                          <div className="block p-2 max-h-[350px] overflow-y-auto custom-scrollbar bg-slate-900/50">
                            {exactWinners.map((winner, idx) => {
                              const uniquePlayerKey = `${match.id}-${winner.id}`;
                              const isRankOpen = openPlayerRanks[uniquePlayerKey] || false;

                              const tffData = globalLiveRanks.TFF.find(x => x.id === winner.id);
                              const tffPts = tffData?.pts || 0;
                              const tffRank = tffData?.rank || '-';

                              const dfoData = globalLiveRanks.DFO.find(x => x.id === winner.id);
                              const dfoPts = dfoData?.pts || 0;
                              const dfoRank = dfoData?.rank || '-';

                              const masterData = globalLiveRanks.MASTER.find(x => x.id === winner.id);
                              const masterPts = masterData?.pts || 0;
                              const masterRank = masterData?.rank || '-';

                              const skorData = globalLiveRanks.SKOR.find(x => x.id === winner.id);
                              const skorPts = skorData?.pts || 0;
                              const skorRank = skorData?.rank || '-';

                              return (
                                <div key={idx} className="mb-2 bg-slate-950 border border-slate-700/80 rounded-lg shadow-xl relative overflow-hidden transition-all duration-300">
                                   <button 
                                      onClick={() => togglePlayerRank(uniquePlayerKey)}
                                      className={`w-full flex items-center justify-center py-3 px-4 relative z-10 transition-colors ${isRankOpen ? 'bg-slate-900/80' : 'bg-slate-950 hover:bg-slate-900/50'}`}
                                   >
                                       <span className="text-slate-100 font-black text-[12px] sm:text-sm uppercase tracking-widest flex items-center gap-2 text-center">
                                           {winner.name} 
                                           <span className="text-slate-500 text-[10px]">{isRankOpen ? '▲' : '▼'}</span>
                                       </span>
                                   </button>
                                   
                                   {isRankOpen && (
                                     <div className="flex flex-wrap justify-center gap-1.5 w-full pb-3 pt-1 px-2 z-10 animate-fadeIn bg-slate-900/40 border-t border-slate-800/50">
                                         <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-amber-900/30 text-amber-400 border-amber-700/50 tracking-wider whitespace-nowrap">
                                            MASTER SIRA {masterRank} / {masterPts} PUAN
                                         </span>
                                         {isTffMatch ? (
                                             <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-rose-900/30 text-rose-400 border-rose-700/50 tracking-wider whitespace-nowrap">
                                                TFF SIRA {tffRank} / {tffPts} PUAN
                                             </span>
                                         ) : (
                                             <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-blue-900/30 text-blue-400 border-blue-700/50 tracking-wider whitespace-nowrap">
                                                DFO SIRA {dfoRank} / {dfoPts} PUAN
                                             </span>
                                         )}
                                         <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-emerald-900/30 text-emerald-400 border-emerald-700/50 tracking-wider whitespace-nowrap">
                                            SKOR SIRA {skorRank} / {skorPts} İSABET
                                         </span>
                                     </div>
                                   )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {!isFinishedStatus && matchStatus !== 'WAITING_APPROVAL' && possibleWinners.length > 0 && (
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
                                  <span className="text-cyan-400 font-black tracking-widest ml-0.5">[{winner.score}]</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

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
                                  <span className="text-red-500 font-black tracking-widest ml-0.5">[{winner.score}]</span>
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
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes siren {
          0% { box-shadow: 0 0 15px #2563eb, inset 0 0 15px #2563eb; border-color: #3b82f6; background-color: rgba(37, 99, 235, 0.2); }
          25% { box-shadow: 0 0 80px #1d4ed8, inset 0 0 60px #1d4ed8; border-color: #2563eb; background-color: rgba(29, 78, 216, 0.6); }
          50% { box-shadow: 0 0 15px #e11d48, inset 0 0 15px #e11d48; border-color: #f43f5e; background-color: rgba(225, 29, 72, 0.2); }
          75% { box-shadow: 0 0 80px #be123c, inset 0 0 60px #be123c; border-color: #e11d48; background-color: rgba(190, 18, 60, 0.6); }
          100% { box-shadow: 0 0 15px #2563eb, inset 0 0 15px #2563eb; border-color: #3b82f6; background-color: rgba(37, 99, 235, 0.2); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .police-siren {
          animation: siren 0.4s ease-in-out infinite;
          z-index: 50;
          transform: scale(1.02);
          transition: all 0.2s;
        }
      `}} />

      <div className="w-full flex justify-end gap-2 px-2 sm:px-0">
          {/* 🔴 MOTOR TETİKLEME BUTONU (15 SN OTO) 🔴 */}
          <button
              onClick={() => setAutoEngine(!autoEngine)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest transition-all shadow-md border ${
                  autoEngine
                  ? 'bg-blue-950/80 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse'
                  : 'bg-slate-900/80 text-slate-500 border-slate-700/80 hover:bg-slate-800'
              }`}
          >
              {autoEngine ? '🚀 MOTOR: 15 SN OTO' : '⚙️ MOTOR: MANUEL'}
          </button>

          <button
              onClick={toggleSound}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest transition-all shadow-md border ${
                  soundEnabled
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900/80 text-slate-500 border-slate-700/80 hover:bg-slate-800'
              }`}
          >
              {soundEnabled ? '🔊 GOL SESİ: AÇIK' : '🔇 GOL SESİNİ AÇ'}
          </button>
      </div>

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
                          : 'HENÜZ PUAN ALAN YOK'}
                  </span>
                  <span className="text-emerald-500 font-bold text-[10px] sm:text-xs mt-1.5 bg-emerald-950/50 px-2.5 py-0.5 rounded shadow-sm border border-emerald-800/50">
                      {weeklyLiveStats.pLeaders.length > 0 ? `${weeklyLiveStats.maxPts} PUAN TOPLADI` : '---'}
                  </span>
              </div>

              <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center transition-all hover:scale-105">
                  <span className="text-amber-400 text-[9px] sm:text-[10px] font-bold tracking-widest mb-1">⚽ HAFTANIN SKOR KRALI</span>
                  <span className="text-white font-black text-xs sm:text-sm uppercase text-center leading-snug">
                      {weeklyLiveStats.sLeaders.length > 0 
                          ? weeklyLiveStats.sLeaders.map(uid => mergedAccounts[uid]?.name.replace(/🏆/g, '').trim()).join(' & ') 
                          : 'HENÜZ PUAN ALAN YOK'}
                  </span>
                  <span className="text-amber-500 font-bold text-[10px] sm:text-xs mt-1.5 bg-amber-950/50 px-2.5 py-0.5 rounded shadow-sm border border-amber-800/50">
                      {weeklyLiveStats.sLeaders.length > 0 ? `${weeklyLiveStats.maxScores} MAÇ BİLDİ` : '---'}
                  </span>
              </div>
          </div>
      </div>

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