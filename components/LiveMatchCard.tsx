'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { TEST_ACCOUNTS, getEliteTheme, getMatchTimeMs, parseDateLocal, getUniqueMatchId, isTffMatchCheck, getTodayDateString } from '@/utils/themeEngine';

const engToTr: Record<string, string> = {
  "SERBIA": "SIRBİSTAN", "GERMANY": "ALMANYA", "NETHERLANDS": "HOLLANDA", "HOLLAND": "HOLLANDA",
  "TURKEY": "TÜRKİYE", "TURKIYE": "TÜRKİYE", "FRANCE": "FRANSA", "ITALY": "İTALYA",
  "SPAIN": "İSPANYA", "ENGLAND": "İNGİLTERE", "BELGIUM": "BELÇİKA",
  "PORTUGAL": "PORTEKİZ", "GREECE": "YUNANİSTAN", "NORWAY": "NORVEÇ",
  "DENMARK": "DANİMARKA", "WALES": "GALLER", "IRELAND": "İRLANDA", "REPUBLIC OF IRELAND": "İRLANDA",
  "SWITZERLAND": "İSVİÇRE", "SWEDEN": "İSVEÇ", "CROATIA": "HIRVATİSTAN",
  "CZECH REPUBLIC": "ÇEKYA", "CZECHIA": "ÇEKYA", "POLAND": "POLONYA", "SCOTLAND": "İSKOÇYA",
  "HUNGARY": "MACARİSTAN", "AUSTRIA": "AVUSTURYA", "ROMANIA": "ROMANYA", "ALBANIA": "ARNAVUTLUK",
  "GEORGIA": "GÜRCİSTAN", "ICELAND": "İZLANDA", "SLOVAKIA": "SLOVAKYA", "SLOVENIA": "SLOVENYA",
  "MONTENEGRO": "KARADAĞ", "NORTH MACEDONIA": "KUZEY MAKEDONYA", "MACEDONIA": "KUZEY MAKEDONYA",
  "BOSNIA": "BOSNA-HERSEK", "BOSNIA AND HERZEGOVINA": "BOSNA-HERSEK", "CYPRUS": "KIBRIS",
  "LITHUANIA": "LİTVANYA", "LATVIA": "LETONYA", "ESTONIA": "ESTONYA", "FINLAND": "FİNLANDİYA",
  "BULGARIA": "BULGARİSTAN", "UKRAINE": "UKRAYNA", "RUSSIA": "RUSYA", "ARMENIA": "ERMENİSTAN",
  "FAROE ISLANDS": "FAROE ADALARI", "KAZAKHSTAN": "KAZAKİSTAN", "MOLDOVA": "MOLDOVA",
  "LUXEMBOURG": "LÜKSEMBURG", "LIECHTENSTEIN": "LİHTENŞTAYN", "SAN MARINO": "SAN MARİNO",
  "MALTA": "MALTA", "ANDORRA": "ANDORRA", "KOSOVO": "KOSOVA", "BELARUS": "BELARUS"
};

const sanitizeStr = (s: string) => {
    if (!s) return "";
    let res = s.toUpperCase().trim();
    res = engToTr[res] || res; 
    return res.replace(/İ/g, 'I').replace(/Ş/g, 'S').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ö/g, 'O').replace(/Ç/g, 'C').replace(/[^A-Z0-9]/g, '');
};

export default function LiveMatchCard() {
  const [activeWeeks, setActiveWeeks] = useState<number[]>([]);
  const [isWeekLoaded, setIsWeekLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  const prevScoresRef = useRef<Record<string, string>>({});
  const [goalFlashes, setGoalFlashes] = useState<Record<string, boolean>>({});
  const [todaysMatchesList, setTodaysMatchesList] = useState<any[]>([]);
  const [liveMatchesData, setLiveMatchesData] = useState<Record<string, any>>({});
  const [predictionsData, setPredictionsData] = useState<Record<string, string>>({});
  const [globalLiveRanks, setGlobalLiveRanks] = useState<{ TFF: any[], DFO: any[], MASTER: any[], SKOR: any[] }>({ TFF: [], DFO: [], MASTER: [], SKOR: [] });
  const [now, setNow] = useState<number>(new Date().getTime());
  
  const [weeklySortedStats, setWeeklySortedStats] = useState<Record<number, { id: string, points: number, exactScores: number }[]>>({});
  const [is24thMatchFinishedMap, setIs24thMatchFinishedMap] = useState<Record<number, boolean>>({});

  const [isLiveAccordionOpen, setIsLiveAccordionOpen] = useState<boolean>(true); 
  const [isFinishedAccordionOpen, setIsFinishedAccordionOpen] = useState<boolean>(false);
  
  const [openEventsMap, setOpenEventsMap] = useState<{ [key: string]: boolean }>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: string]: boolean }>({});
  const [openPossibleMap, setOpenPossibleMap] = useState<{ [key: string]: boolean }>({});
  const [openEliminatedMap, setOpenEliminatedMap] = useState<{ [key: string]: boolean }>({});
  const [openPlayerRanks, setOpenPlayerRanks] = useState<{ [key: string]: boolean }>({});
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});
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
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMatchesAndPredictions = async () => {
      const todayDateStr = getTodayDateString();
      const todayDate = parseDateLocal(todayDateStr);
      todayDate.setHours(0,0,0,0);

      const [leaderboardRes, allBulletinRes, dbLiveMatchesRes] = await Promise.all([
          supabase.from('live_leaderboard').select('*'),
          supabase.from('matches_bulletin').select('*').order('week_num', { ascending: true }).order('match_index', { ascending: true }),
          supabase.from('live_matches').select('*')
      ]);

      const allBulten = allBulletinRes.data || [];
      
      const relevantMatches = allBulten.filter(m => {
          const matchTimeMs = getMatchTimeMs(m.match_date, m.match_time);
          const isWithinLast5Hours = (now - matchTimeMs) >= 0 && (now - matchTimeMs) <= (5 * 60 * 60 * 1000);
          return m.match_date === todayDateStr || isWithinLast5Hours;
      });

      const relevantWeeksSet = new Set<number>(relevantMatches.map(m => m.week_num));
      const relevantWeeksArray = Array.from(relevantWeeksSet);
      
      if (relevantWeeksArray.length === 0) {
          const upcomingMatches = allBulten.filter(d => parseDateLocal(d.match_date) >= todayDate).sort((a,b) => parseDateLocal(a.match_date).getTime() - parseDateLocal(b.match_date).getTime());
          if (upcomingMatches.length > 0) relevantWeeksArray.push(upcomingMatches[0].week_num);
          else if (allBulten.length > 0) relevantWeeksArray.push(Math.max(...allBulten.map(m => m.week_num)));
      }
      
      setActiveWeeks(relevantWeeksArray.sort((a,b) => b - a)); 
      setIsWeekLoaded(true);

      const targetBulten = allBulten.filter(m => relevantWeeksArray.includes(m.week_num));
      
      let allPredictions: any[] = [];
      for (const week of relevantWeeksArray) {
          let from = 0; const step = 1000; let keepFetching = true;
          while(keepFetching) {
              const { data } = await supabase.from('player_predictions').select('*').eq('week_num', week).range(from, from + step - 1);
              if (data && data.length > 0) { allPredictions = [...allPredictions, ...data]; if (data.length < step) keepFetching = false; else from += step; } 
              else keepFetching = false;
          }
      }

      const leaderboardData = leaderboardRes.data || [];
      const dbLiveMatches = dbLiveMatchesRes.data || [];

      let arrTFF: any[] = [], arrDFO: any[] = [], arrMASTER: any[] = [], arrSKOR: any[] = [];
      leaderboardData.forEach(row => {
          arrTFF.push({ id: row.id, name: row.name, pts: row.tff_pts, rank: row.tff_rank });
          arrDFO.push({ id: row.id, name: row.name, pts: row.dfo_pts, rank: row.dfo_rank });
          arrMASTER.push({ id: row.id, name: row.name, pts: row.master_pts, rank: row.master_rank });
          arrSKOR.push({ id: row.id, name: row.name, pts: row.skor_pts, rank: row.skor_rank });
      });
      const sortFunc = (a: any, b: any) => b.pts - a.pts || a.name.localeCompare(b.name, 'tr');
      arrTFF.sort(sortFunc); arrDFO.sort(sortFunc); arrMASTER.sort(sortFunc); arrSKOR.sort(sortFunc);
      setGlobalLiveRanks({ TFF: arrTFF, DFO: arrDFO, MASTER: arrMASTER, SKOR: arrSKOR });

      const pDict: Record<string, string> = {};
      allPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          if (uid === 'mankoman') return;
          pDict[`${uid}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, '');
      });
      setPredictionsData(pDict);

      const liveMap: Record<string, any> = {};
      dbLiveMatches.forEach(row => liveMap[String(row.id)] = row); 
      setLiveMatchesData(liveMap);

      const currentWeekMatches = targetBulten.map((m) => ({
        id: m.match_index,
        week_num: m.week_num,
        weekLabel: `${m.week_num}. HAFTA ${m.match_index}. MAÇ`,
        category: m.category,
        date: m.match_date,
        time: m.match_time,
        homeTeam: m.home_team,
        awayTeam: m.away_team
      }));

      const new24FinishedMap: Record<number, boolean> = {};
      relevantWeeksArray.forEach(w => {
         const m24Id = getUniqueMatchId(w, 24);
         const dbMatch24 = liveMap[String(m24Id)];
         new24FinishedMap[w] = (dbMatch24 && ['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch24.status));
      });
      setIs24thMatchFinishedMap(new24FinishedMap);

      let goalHappened = false;
      let newGoalIds: string[] = [];
      Object.keys(liveMap).forEach(key => {
          const dbMatch = liveMap[key];
          const isLiveOrFinished3 = ['FINISHED', 'FT', 'AET', 'PEN', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbMatch.status);
          if (isLiveOrFinished3 && dbMatch.home_score !== '-' && dbMatch.away_score !== '-') {
              const currentScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
              const prevScore = prevScoresRef.current[key];
              if (prevScore && prevScore !== currentScore) { goalHappened = true; newGoalIds.push(String(key)); }
              prevScoresRef.current[key] = currentScore;
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

      let allWeeklyStats: Record<number, any> = {};
      relevantWeeksArray.forEach(week => {
          let stats: Record<string, { points: number, exactScores: number }> = {};
          Object.keys(mergedAccounts).forEach(uid => { stats[uid] = { points: 0, exactScores: 0 }; });

          currentWeekMatches.filter(m => m.week_num === week).forEach(m => {
              const uniqueId = String(getUniqueMatchId(week, m.id));
              const dbMatch = liveMap[uniqueId];
              if (dbMatch && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
                  const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
                  const winnerIds = Object.keys(mergedAccounts).filter(id => pDict[`${id}-${week}-${m.id}`] === targetScore);
                  
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

          allWeeklyStats[week] = Object.keys(stats)
              .map(uid => ({ id: uid, points: stats[uid].points, exactScores: stats[uid].exactScores }))
              .filter(s => s.points > 0 || s.exactScores > 0)
              .sort((a, b) => b.points - a.points || b.exactScores - a.exactScores || mergedAccounts[a.id]?.name.localeCompare(mergedAccounts[b.id]?.name, 'tr'));
      });
      setWeeklySortedStats(allWeeklyStats);

      const todaysMatches = currentWeekMatches.filter(m => {
           const uniqueId = String(getUniqueMatchId(m.week_num, m.id));
           const dbMatch = liveMap[uniqueId];
           const status = dbMatch ? dbMatch.status : 'NOT_STARTED';
           const isLiveOrFinished4 = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(status);
           
           const isToday = m.date === todayDateStr; 
           
           if (isLiveOrFinished4) return true;
           return isToday;
      });

      todaysMatches.sort((a, b) => {
         const timeA = getMatchTimeMs(a.date, a.time);
         const timeB = getMatchTimeMs(b.date, b.time);
         return timeA - timeB;
      });

      setTodaysMatchesList(todaysMatches);
    };

    fetchMatchesAndPredictions(); 
    const interval = setInterval(fetchMatchesAndPredictions, 5000); 
    return () => clearInterval(interval);
  }, [mergedAccounts, now]);

  const toggleEvents = (uniqueId: string) => setOpenEventsMap((prev) => ({ ...prev, [uniqueId]: prev[uniqueId] === false ? true : false })); 
  const toggleWinners = (uniqueId: string) => setOpenWinnersMap((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] })); 
  const togglePossible = (uniqueId: string) => setOpenPossibleMap((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  const toggleEliminated = (uniqueId: string) => setOpenEliminatedMap((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  const toggleMatchExpansion = (uniqueId: string) => setExpandedMatches(prev => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  const togglePlayerRank = (uniqueKey: string) => setOpenPlayerRanks((prev) => ({ ...prev, [uniqueKey]: !prev[uniqueKey] }));

  if (!isWeekLoaded) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8 flex justify-center py-10">
         <span className="text-slate-500 text-sm font-medium animate-pulse tracking-widest">📡 Radar Ayarlanıyor...</span>
      </div>
    );
  }

  const activeMatches = todaysMatchesList.filter(match => {
     const uniqueId = String(getUniqueMatchId(match.week_num, match.id));
     const dbMatch = liveMatchesData[uniqueId] || {};
     return !['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch.status);
  });

  const finishedMatches = todaysMatchesList.filter(match => {
     const uniqueId = String(getUniqueMatchId(match.week_num, match.id));
     const dbMatch = liveMatchesData[uniqueId] || {};
     return ['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch.status);
  });

  const renderMatchCard = (match: any, isFinishedGroup: boolean = false) => {
      const homeTeamUpper = match.homeTeam?.toUpperCase() || match.home_team?.toUpperCase();
      const awayTeamUpper = match.awayTeam?.toUpperCase() || match.away_team?.toUpperCase();

      const uniqueId = String(getUniqueMatchId(match.week_num, match.id));
      const isEventsOpen = openEventsMap[uniqueId] !== false;
      const isWinnersOpen = openWinnersMap[uniqueId] !== false;
      const isPossibleOpen = openPossibleMap[uniqueId] || false;
      const isEliminatedOpen = openEliminatedMap[uniqueId] || false;
      const isExpanded = expandedMatches[uniqueId] !== undefined ? expandedMatches[uniqueId] : isFinishedGroup;

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

      // 🔥 KOMUTANIN EMRİ: API ONAY BEKLİYOR (WAITING_APPROVAL) BİLE DESE UI BUNU CANLI KABUL EDECEK 🔥
      if (matchStatus === 'WAITING_APPROVAL') {
          matchStatus = 'LIVE';
      }

      const matchTimeMs = getMatchTimeMs(match.date, match.time);
      // 🔥 KOMUTANIN EMRİ: Maçlar kendi kendine "Onaya" düşmesin diye bekleme süresini 8 saate çıkardık.
      const liveDurationMs = 8 * 60 * 60 * 1000; 
      
      if (!['FINISHED', 'FT', 'AET', 'PEN', 'HT', '1H', '2H', 'ET', 'P'].includes(matchStatus)) {
        if (matchStatus === 'NOT_STARTED' || matchStatus === 'NS' || matchStatus === 'TBD') {
            if (now >= matchTimeMs && now < matchTimeMs + liveDurationMs) { matchStatus = 'LIVE'; } 
            else if (now >= matchTimeMs + liveDurationMs) { matchStatus = 'WAITING_APPROVAL'; }
        }
      }

      const isFinishedStatus = ['FINISHED', 'FT', 'AET', 'PEN'].includes(matchStatus);
      const isLiveStatus = ['LIVE', '1H', '2H', 'ET', 'P'].includes(matchStatus);
      const isHT = matchStatus === 'HT';

      if (isLiveStatus) {
         if (homeScore === '-') homeScore = '0';
         if (awayScore === '-') awayScore = '0';
      }

      const rawElapsed = dbMatch.elapsed;
      let safeElapsed = typeof rawElapsed === 'object' && rawElapsed !== null ? rawElapsed.elapsed : rawElapsed;
      
      const systemTimeEvent = safeEvents.find((e: any) => e.type === 'SystemTime');
      const safeExtra = systemTimeEvent ? systemTimeEvent.detail : null;

      let displayMinute = '';
      if (safeElapsed !== null && safeElapsed !== undefined && safeElapsed !== '') {
         // 🔥 API'DEN GELEN DAKİKA NEYSE BİREBİR YANSIYACAK (91, 92, 90+2 vs.) EZECEK KİLİT YOK! 🔥
         if (safeExtra) { 
             displayMinute = `${safeElapsed}+${safeExtra}'`; 
         } else { 
             displayMinute = `${safeElapsed}'`; 
         }
      } else if (isLiveStatus) {
         // Sadece TFF maçları (API verisi olmayanlar) için kendi sayacımız
         const diffMins = Math.floor((now - matchTimeMs) / 60000);
         if (diffMins >= 120) displayMinute = `90+'`; // TFF maçlarında otomatik onaya düşmesin diye 90+ da kalır
         else if (diffMins >= 60) displayMinute = `${diffMins - 15}'`; 
         else if (diffMins >= 45) displayMinute = `HT`;
         else if (diffMins > 0) displayMinute = `${diffMins}'`;
         else displayMinute = `1'`;
      }

      const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ');
      const isTffMatch = isTffMatchCheck(match.category);
      const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);

      const hName = sanitizeStr(homeTeamUpper);
      const aName = sanitizeStr(awayTeamUpper);

      let homeTeamId: number | null = null;
      let awayTeamId: number | null = null;

      safeEvents.forEach((e: any) => {
          if (e.team && e.team.id) {
              const eName = sanitizeStr(e.team.name);
              if (eName === hName || hName.includes(eName) || eName.includes(hName)) {
                  homeTeamId = e.team.id;
              } else if (eName === aName || aName.includes(eName) || eName.includes(aName)) {
                  awayTeamId = e.team.id;
              }
          }
      });

      if (homeTeamId && !awayTeamId) {
          const otherEvent = safeEvents.find((e: any) => e.team?.id && e.team.id !== homeTeamId);
          if (otherEvent) awayTeamId = otherEvent.team.id;
      } else if (awayTeamId && !homeTeamId) {
          const otherEvent = safeEvents.find((e: any) => e.team?.id && e.team.id !== awayTeamId);
          if (otherEvent) homeTeamId = otherEvent.team.id;
      }

      const homeEvents = safeEvents.filter((e: any) => e.type !== 'SystemTime' && (e.isHome === true || (homeTeamId && e.team?.id === homeTeamId) || (!homeTeamId && sanitizeStr(e.team?.name) === hName)));
      const awayEvents = safeEvents.filter((e: any) => e.type !== 'SystemTime' && (e.isHome === false || (awayTeamId && e.team?.id === awayTeamId) || (!awayTeamId && sanitizeStr(e.team?.name) === aName)));

      let exactWinners: {id: string, name: string, score: string}[] = [];
      let possibleWinners: {name: string, score: string}[] = [];
      let eliminatedPlayers: {name: string, score: string}[] = [];

      if ((isLiveStatus || isFinishedStatus || isHT) && homeScore !== '-' && awayScore !== '-') {
        const currentH = parseInt(homeScore);
        const currentA = parseInt(awayScore);

        Object.keys(mergedAccounts).forEach(id => {
          const predStr = predictionsData[`${id}-${match.week_num}-${match.id}`];
          if (!predStr || predStr === '-' || predStr === 'PAS') return;
          const name = mergedAccounts[id]?.name;
          if (!name) return;

          const [pHStr, pAStr] = predStr.split('-');
          const pH = parseInt(pHStr); const pA = parseInt(pAStr);

          if (pH === currentH && pA === currentA) { exactWinners.push({ id, name, score: predStr }); } 
          else if (pH >= currentH && pA >= currentA && !isFinishedStatus) { possibleWinners.push({ name, score: predStr }); } 
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

      return (
        <div key={uniqueId} className={`w-full max-w-2xl mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
            isGoalFlashing ? 'police-siren' : isExpanded ? theme.containerBorder + ' ' + theme.containerShadow + ' ' + theme.containerBg : theme.containerBorder + ' shadow-md hover:shadow-[0_0_15px_currentColor] ' + theme.badgeText + ' ' + (theme.bgImg ? '' : 'bg-slate-950')
        }`}>
          {theme.bgImg && (
            <>
              <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
              <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isExpanded || isGoalFlashing ? 'bg-slate-900/60' : 'bg-slate-950/70 hover:bg-slate-900/60'}`}></div>
            </>
          )}

          {!isExpanded && (
            <div onClick={() => toggleMatchExpansion(uniqueId)} className="cursor-pointer px-2 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-black/50 relative z-20 group transition-all duration-300">
              <div className="flex-1 flex items-center justify-end overflow-hidden pr-1.5 sm:pr-3">
                <span className="text-[9px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors text-right">{homeTeamUpper}</span>
              </div>
              <div className="flex items-center justify-center shrink-0">
                <img src={theme.homeLogo} alt={homeTeamUpper} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md group-hover:scale-110 transition-transform z-10" />
                <div className="flex flex-col items-center justify-center mx-1 sm:mx-1.5 min-w-[40px] sm:min-w-[50px]">
                  <div className="mb-0.5 flex items-center justify-center">
                    {isHT ? (<span className="text-[10px] sm:text-[11px] font-black text-amber-400 tracking-wider drop-shadow-md">İLK YARI</span>) : isLiveStatus ? (<span className="text-[10px] sm:text-[11px] font-black text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)] animate-pulse tracking-wider">{displayMinute}</span>) : isFinishedStatus ? (<span className="text-[8px] sm:text-[9px] font-black text-slate-400 tracking-wider">MS</span>) : (<span className="text-[9px] sm:text-[10px] font-bold text-amber-400 tracking-wider">{match.time}</span>)}
                  </div>
                  <div className={`flex items-center justify-center px-1.5 py-0.5 sm:py-1 rounded border shadow-inner backdrop-blur-md transition-all w-full ${isGoalFlashing ? 'bg-blue-900/80 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.9)] scale-110' : (isLiveStatus || isHT) ? 'bg-green-950/60 border-green-500/40' : 'bg-[#080d1a]/80 border-slate-700/60'}`}>
                    <span className={`font-black text-[12px] sm:text-[14px] tracking-widest leading-none ${isGoalFlashing ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]' : 'text-white'}`}>{(!isLiveStatus && !isFinishedStatus && !isHT) ? 'v' : `${homeScore}-${awayScore}`}</span>
                  </div>
                </div>
                <img src={theme.awayLogo} alt={awayTeamUpper} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md group-hover:scale-110 transition-transform z-10" />
              </div>
              <div className="flex-1 flex items-center justify-start overflow-hidden pl-1.5 sm:pl-3">
                <span className="text-[9px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors text-left">{awayTeamUpper}</span>
              </div>
              <div className="absolute right-1 sm:right-2 opacity-30 text-[8px] text-white group-hover:opacity-100 transition-opacity">▼</div>
            </div>
          )}

          {isExpanded && (
            <div className="relative flex-grow overflow-hidden animate-fadeIn z-10">
              <button onClick={() => toggleMatchExpansion(uniqueId)} className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 bg-slate-950/50 text-slate-300 hover:text-white border border-slate-700/50 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg backdrop-blur-md transition-colors" title="Küçült">✕</button>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-full text-center pt-3 pb-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/50 px-3 py-1 rounded-full shadow-inner">{match.weekLabel}</span>
                </div>
                <div className="w-full text-center px-2 mt-2 relative z-30">
                  <span className={`inline-block w-[95%] sm:w-[85%] mx-auto px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-snug whitespace-nowrap ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>{match.category}</span>
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
                    {(!isLiveStatus && !isFinishedStatus && !isHT) && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-400 text-[10px] sm:text-xs font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                      </div>
                    )}
                    {isHT && (<div className="flex flex-col items-center justify-center mb-1.5 z-40 relative"><span className="text-amber-400 font-black text-2xl sm:text-3xl leading-none drop-shadow-md">İLK YARI</span></div>)}
                    {isLiveStatus && (
                      <div className="flex flex-col items-center justify-center mb-1.5 z-40 relative animate-pulse">
                        <span className="text-green-400 font-black text-3xl sm:text-4xl leading-none drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]">{displayMinute}</span>
                        <span className="text-green-500 text-[9px] sm:text-[10px] font-black tracking-widest mt-1 bg-green-950/80 px-3 py-0.5 rounded-full border border-green-600 shadow-[0_0_10px_rgba(34,197,94,0.3)]">🔴 CANLI</span>
                      </div>
                    )}
                    {isFinishedStatus && (<div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md"><span className="text-slate-400 text-[10px] font-black tracking-widest">MS (BİTTİ)</span></div>)}
                    <div className={`w-full bg-[#080d1a]/80 border ${isGoalFlashing ? 'border-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.9)]' : theme.scoreBorder} py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 sm:gap-3 ${!isGoalFlashing && 'shadow-[0_0_15px_rgba(0,0,0,0.5)]'} backdrop-blur-md transition-all duration-300`}>
                      <span className={`text-xl sm:text-3xl font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 ${isGoalFlashing ? 'text-white scale-125 drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'text-white'}`}>{homeScore}</span>
                      <span className={`text-base sm:text-xl font-bold ${isChampionsLeague ? 'text-white/50' : 'text-blue-400/50'}`}>:</span>
                      <span className={`text-xl sm:text-3xl font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all duration-300 ${isGoalFlashing ? 'text-white scale-125 drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'text-white'}`}>{awayScore}</span>
                    </div>
                    {(!isLiveStatus && !isFinishedStatus && !isHT) && countdownText && (
                      <div className="w-full bg-[#0c2a3b]/50 border border-[#164e63]/50 py-1 rounded-lg text-center shadow-md mt-1"><span className="text-[#38bdf8] text-[9px] sm:text-[10px] font-mono font-bold tracking-widest drop-shadow-sm">{countdownText}</span></div>
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
                    <button onClick={() => toggleEvents(uniqueId)} className="w-full flex justify-between items-center px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 transition-colors border border-slate-700/50 rounded-lg backdrop-blur-md shadow-sm">
                      <span className="text-slate-300 font-bold text-[9px] sm:text-[10px] tracking-widest flex items-center gap-2"><span>📊</span> MAÇ İSTATİSTİKLERİ VE OLAYLARI</span>
                      <span className="text-slate-400 text-[10px]">{isEventsOpen ? '▲' : '▼'}</span>
                    </button>
                    {isEventsOpen && (
                      <div className="flex justify-between w-full text-xs sm:text-sm text-slate-300 bg-slate-900/40 rounded-lg p-1.5 sm:p-3 border border-slate-800/80 shadow-inner">
                        <div className="flex-1 flex flex-col gap-1 items-start pr-1 sm:pr-3 border-r border-slate-700/50 overflow-hidden">
                          {homeEvents.map((e: any, i: number) => {
                            let icon = ''; let text = '';
                            if (e.type === 'Goal') { icon = e.detail === 'Penalty' ? '🎯' : (e.detail === 'Own Goal' ? '🤦‍♂️' : '⚽'); text = String(e.player?.name || 'Oyuncu'); } 
                            else if (e.type === 'Card') { icon = e.detail === 'Yellow Card' ? '🟨' : '🟥'; text = String(e.player?.name || 'Oyuncu'); } 
                            else if (e.type === 'subst') { icon = '🔄'; text = `${String(e.assist?.name || 'Giren')} / ${String(e.player?.name || 'Çıkan')}`; } else return null;
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
                            if (e.type === 'Goal') { icon = e.detail === 'Penalty' ? '🎯' : (e.detail === 'Own Goal' ? '🤦‍♂️' : '⚽'); text = String(e.player?.name || 'Oyuncu'); } 
                            else if (e.type === 'Card') { icon = e.detail === 'Yellow Card' ? '🟨' : '🟥'; text = String(e.player?.name || 'Oyuncu'); } 
                            else if (e.type === 'subst') { icon = '🔄'; text = `${String(e.assist?.name || 'Giren')} / ${String(e.player?.name || 'Çıkan')}`; } else return null;
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
                      {(!isLiveStatus && !isFinishedStatus && !isHT) ? (
                        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                      ) : exactWinners.length === 0 ? (
                         !isFinishedStatus && possibleWinners.length > 0 ? (<span className="text-[9px] sm:text-[10px] font-medium text-blue-300 italic">Tam isabet yok, {possibleWinners.length} kişi pusuda!</span>) : (<span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Skoru bilen kalmadı.</span>)
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-medium text-emerald-300"><strong className="text-emerald-400">{exactWinners.length} kişi</strong> tam isabetli</span>
                      )}
                    </div>
                    <div className="flex-0 text-center px-1">
                      <span className={`text-[8px] font-black tracking-widest whitespace-nowrap px-2 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>{isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI"}</span>
                    </div>
                    <div className="text-right flex-1">
                      {(exactWinners.length > 0 || possibleWinners.length > 0 || eliminatedPlayers.length > 0) && (isLiveStatus || isFinishedStatus || isHT) && (
                        <button onClick={() => toggleWinners(uniqueId)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[9px] sm:text-[10px] outline-none whitespace-nowrap drop-shadow-sm">{isWinnersOpen ? "Radarı Gizle ▲" : "Tüm Tahmin Radarı →"}</button>
                      )}
                    </div>
                  </div>
                
                  {isWinnersOpen && (isLiveStatus || isFinishedStatus || isHT) && (
                    <div className="w-full mt-2 flex flex-col gap-2 animate-fadeIn pb-1">
                      {exactWinners.length > 0 && (
                        <div className="w-full bg-slate-950/80 rounded-xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden mt-1 mb-2">
                          <div className="bg-emerald-950/80 p-2 border-b border-emerald-500/50 flex justify-center items-center relative overflow-hidden">
                              <span className="bg-emerald-500 text-slate-950 font-black px-4 py-1 rounded-full text-[10px] sm:text-xs z-10 shadow-sm border border-emerald-300 tracking-widest text-center">+{displayPoints} PUAN YAZILIYOR</span>
                          </div>
                          <div className="block p-2 max-h-[350px] overflow-y-auto custom-scrollbar bg-slate-900/50">
                            {exactWinners.map((winner, idx) => {
                              const uniquePlayerKey = `${uniqueId}-${winner.id}`;
                              const isRankOpen = openPlayerRanks[uniquePlayerKey] || false;
                              const tffData = globalLiveRanks.TFF.find(x => x.id === winner.id);
                              const dfoData = globalLiveRanks.DFO.find(x => x.id === winner.id);
                              const masterData = globalLiveRanks.MASTER.find(x => x.id === winner.id);
                              const skorData = globalLiveRanks.SKOR.find(x => x.id === winner.id);
                              return (
                                <div key={idx} className="mb-2 bg-slate-950 border border-slate-700/80 rounded-lg shadow-xl relative overflow-hidden transition-all duration-300">
                                   <button onClick={() => togglePlayerRank(uniquePlayerKey)} className={`w-full flex items-center justify-center py-3 px-4 relative z-10 transition-colors ${isRankOpen ? 'bg-slate-900/80' : 'bg-slate-950 hover:bg-slate-900/50'}`}>
                                       <span className="text-slate-100 font-black text-[12px] sm:text-sm uppercase tracking-widest flex items-center gap-2 text-center">{winner.name} <span className="text-slate-500 text-[10px]">{isRankOpen ? '▲' : '▼'}</span></span>
                                   </button>
                                   {isRankOpen && (
                                     <div className="flex flex-wrap justify-center gap-1.5 w-full pb-3 pt-1 px-2 z-10 animate-fadeIn bg-slate-900/40 border-t border-slate-800/50">
                                         <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-amber-900/30 text-amber-400 border-amber-700/50 tracking-wider whitespace-nowrap">MASTER SIRA {masterData?.rank||'-'} / {masterData?.pts||0} PUAN</span>
                                         {isTffMatch ? (<span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-rose-900/30 text-rose-400 border-rose-700/50 tracking-wider whitespace-nowrap">TFF SIRA {tffData?.rank||'-'} / {tffData?.pts||0} PUAN</span>) : (<span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-blue-900/30 text-blue-400 border-blue-700/50 tracking-wider whitespace-nowrap">DFO SIRA {dfoData?.rank||'-'} / {dfoData?.pts||0} PUAN</span>)}
                                         <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-emerald-900/30 text-emerald-400 border-emerald-700/50 tracking-wider whitespace-nowrap">SKOR SIRA {skorData?.rank||'-'} / {skorData?.pts||0} İSABET</span>
                                     </div>
                                   )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {!isFinishedStatus && possibleWinners.length > 0 && (
                        <div className="w-full bg-blue-950/30 rounded-lg border border-blue-800/50 shadow-inner overflow-hidden">
                          <button onClick={() => togglePossible(uniqueId)} className="w-full flex justify-between items-center p-2.5 bg-blue-900/30 hover:bg-blue-800/40 transition-colors">
                            <span className="text-blue-400 font-bold text-[9px] sm:text-[10px]">⏳ ŞANSI DEVAM EDENLER ({possibleWinners.length} KİŞİ)</span>
                            <span className="text-blue-400 text-[10px]">{isPossibleOpen ? '▲' : '▼'}</span>
                          </button>
                          {isPossibleOpen && (
                            <div className="p-2.5 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1 border-t border-blue-900/50">
                              {possibleWinners.map((winner, idx) => (
                                <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-blue-900/30 text-slate-300 border-blue-700/50 flex gap-1 items-center">
                                  <span>{winner.name}</span><span className="text-cyan-400 font-black tracking-widest ml-0.5">[{winner.score}]</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {eliminatedPlayers.length > 0 && (
                        <div className="w-full bg-red-950/20 rounded-lg border border-red-900/30 shadow-inner overflow-hidden">
                          <button onClick={() => toggleEliminated(uniqueId)} className="w-full flex justify-between items-center p-2.5 bg-red-900/20 hover:bg-red-800/30 transition-colors">
                            <span className="text-red-400 font-bold text-[9px] sm:text-[10px]">❌ ŞANSI KALMAYANLAR ({eliminatedPlayers.length} KİŞİ)</span>
                            <span className="text-red-400 text-[10px]">{isEliminatedOpen ? '▲' : '▼'}</span>
                          </button>
                          {isEliminatedOpen && (
                            <div className="p-2.5 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1 border-t border-red-900/30">
                              {eliminatedPlayers.map((winner, idx) => (
                                <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-red-950/40 text-slate-400 border-red-900/50 flex gap-1 items-center opacity-70">
                                  <span className="line-through">{winner.name}</span><span className="text-red-500 font-black tracking-widest ml-0.5">[{winner.score}]</span>
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

  const sortedWeeks = [...activeWeeks].sort((a, b) => b - a);

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 flex flex-col gap-5">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes siren { 0% { box-shadow: 0 0 15px #2563eb, inset 0 0 15px #2563eb; border-color: #3b82f6; background-color: rgba(37, 99, 235, 0.2); } 25% { box-shadow: 0 0 80px #1d4ed8, inset 0 0 60px #1d4ed8; border-color: #2563eb; background-color: rgba(29, 78, 216, 0.6); } 50% { box-shadow: 0 0 15px #e11d48, inset 0 0 15px #e11d48; border-color: #f43f5e; background-color: rgba(225, 29, 72, 0.2); } 75% { box-shadow: 0 0 80px #be123c, inset 0 0 60px #be123c; border-color: #e11d48; background-color: rgba(190, 18, 60, 0.6); } 100% { box-shadow: 0 0 15px #2563eb, inset 0 0 15px #2563eb; border-color: #3b82f6; background-color: rgba(37, 99, 235, 0.2); } }
        .police-siren { animation: siren 0.4s ease-in-out infinite; z-index: 50; transform: scale(1.02); transition: all 0.2s; }
      `}} />

      <div className="w-full flex justify-end px-2 sm:px-0">
          <button onClick={toggleSound} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest transition-all shadow-md border ${soundEnabled ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900/80 text-slate-500 border-slate-700/80 hover:bg-slate-800'}`}>
              {soundEnabled ? '🔊 CANLI GOL SESİ: AÇIK' : '🔇 GOL SESİNİ AÇ'}
          </button>
      </div>

      {/* 🔥 MAÇLAR VİTRİNİ (ÜSTTE) 🔥 */}
      {todaysMatchesList.length === 0 ? (
        <div className="w-full text-center py-10 bg-slate-900/30 border border-slate-800/50 rounded-2xl mt-2">
          <span className="text-3xl mb-2 block opacity-50">🗓️</span>
          <p className="text-slate-400 text-sm font-medium tracking-widest">BUGÜN PLANLANAN BİR MAÇ BULUNMUYOR</p>
        </div>
      ) : (
        <>
          {finishedMatches.length > 0 && (
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800/50 shadow-xl backdrop-blur-xl overflow-hidden mt-2">
              <button onClick={() => setIsFinishedAccordionOpen(!isFinishedAccordionOpen)} className="w-full flex items-center justify-between px-4 py-2 sm:py-3 bg-slate-900/50 hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 group">
                <div className="flex-1"></div> 
                <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center flex items-center gap-2">📅 GÜNÜN BİTEN MAÇLARI ({finishedMatches.length})</h2>
                <div className="flex-1 flex justify-end"><div className={`p-1 transition-transform duration-300 ${isFinishedAccordionOpen ? 'rotate-180' : ''}`}><span className="text-slate-500 text-[10px] sm:text-xs">▼</span></div></div>
              </button>
              {isFinishedAccordionOpen && (
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-slate-900/20">
                  {finishedMatches.map(match => renderMatchCard(match, true))}
                </div>
              )}
            </div>
          )}

          {activeMatches.length > 0 && (
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden mt-2">
              <button onClick={() => setIsLiveAccordionOpen(!isLiveAccordionOpen)} className="w-full flex items-center justify-between px-4 py-3 sm:py-4 bg-slate-900/80 hover:bg-slate-800/80 transition-colors border-b border-slate-800/80 group">
                <div className="flex-1 flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span></div> 
                <h2 className="text-xs sm:text-sm font-black text-green-500 uppercase tracking-widest drop-shadow-md text-center">GÜNÜN CANLI MAÇLARI ({activeMatches.length})</h2>
                <div className="flex-1 flex justify-end"><div className={`p-1 transition-transform duration-300 ${isLiveAccordionOpen ? 'rotate-180' : ''}`}><span className="text-slate-400 text-[10px] sm:text-xs">▼</span></div></div>
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

      {/* 🔥 ÇOKLU LİDERLİK RADARLARI (19 ÜSTTE, 18 ALTTA) 🔥 */}
      {sortedWeeks.map((week, index) => {
          const wStats = weeklySortedStats[week] || [];
          const maxPts = wStats.length > 0 ? wStats[0].points : 0;
          const maxScores = wStats.length > 0 ? Math.max(...wStats.map((s:any) => s.exactScores)) : 0;
          const ptsLeaders = wStats.filter((s:any) => s.points === maxPts && maxPts > 0);
          const scoreLeaders = wStats.filter((s:any) => s.exactScores === maxScores && maxScores > 0);
          const is24Finished = is24thMatchFinishedMap[week];
          const isOldestWeek = index === sortedWeeks.length - 1 && sortedWeeks.length > 1;

          const getLeaderBadge = (uid: string, type: 'points' | 'scores') => {
              if (!is24Finished) return null; 
              if (type === 'points') {
                  if (ptsLeaders.length === 1 && ptsLeaders[0].id === uid) {
                      return <span className="ml-2 text-[9px] sm:text-[10px] font-black text-amber-500 bg-amber-950/60 border border-amber-600/50 px-2 py-0.5 rounded-full shadow-[0_0_10px_currentColor] animate-pulse">🏆 +3 PUAN KAZANDI</span>;
                  }
              } else if (type === 'scores') {
                  if (scoreLeaders.length === 1 && scoreLeaders[0].id === uid) {
                      return <span className="ml-2 text-[9px] sm:text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-600/50 px-2 py-0.5 rounded-full shadow-[0_0_10px_currentColor] animate-pulse">🎯 +3 PUAN KAZANDI</span>;
                  }
              }
              return null;
          };

          return (
            <div key={`radar-${week}`} className="mb-2 p-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.3)] animate-fadeIn w-full mx-auto mt-4">
                <h2 className="text-center font-black text-blue-400 text-[11px] sm:text-xs tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
                    <span className="text-lg sm:text-xl">📡</span> {week}. HAFTA CANLI LİDERLİK RADARI
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl overflow-hidden shadow-inner flex flex-col">
                        <div className="bg-emerald-950/60 p-2 border-b border-emerald-500/30 flex justify-center flex-col items-center">
                            <span className="text-emerald-400 text-[10px] sm:text-[11px] font-bold tracking-widest">🔥 HAFTANIN PUANLARI</span>
                            {is24Finished && ptsLeaders.length > 1 && (
                                <span className="text-rose-500 bg-rose-950/80 px-2 py-0.5 rounded text-[9px] font-black mt-1 border border-rose-500/50">⚠️ MÜSTAKİL LİDER YOK (+3 DEVRE DIŞI)</span>
                            )}
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {wStats.length > 0 ? (
                                <table className="w-full text-left text-xs">
                                    <tbody className="divide-y divide-slate-800/50">
                                        {wStats.map((s:any, idx:number) => (
                                            <tr key={s.id} className="hover:bg-slate-900/50">
                                                <td className="py-2 pl-2 w-8 text-slate-500 font-medium">{idx + 1}-</td>
                                                <td className="py-2 font-bold text-slate-200">
                                                    {mergedAccounts[s.id]?.name.replace(/🏆/g, '').trim()}
                                                    {getLeaderBadge(s.id, 'points')}
                                                </td>
                                                <td className="py-2 pr-2 text-right font-black text-emerald-400">{s.points} P</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-4 text-slate-500 text-xs">HENÜZ PUAN ALAN YOK</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl overflow-hidden shadow-inner flex flex-col">
                        <div className="bg-amber-950/60 p-2 border-b border-amber-500/30 flex justify-center flex-col items-center">
                            <span className="text-amber-400 text-[10px] sm:text-[11px] font-bold tracking-widest">⚽ HAFTANIN SKOR (TAM İSABET) SAYISI</span>
                            {is24Finished && scoreLeaders.length > 1 && (
                                <span className="text-rose-500 bg-rose-950/80 px-2 py-0.5 rounded text-[9px] font-black mt-1 border border-rose-500/50">⚠️ MÜSTAKİL LİDER YOK (+3 DEVRE DIŞI)</span>
                            )}
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {wStats.length > 0 && maxScores > 0 ? (
                                <table className="w-full text-left text-xs">
                                    <tbody className="divide-y divide-slate-800/50">
                                        {wStats.filter((s:any) => s.exactScores > 0).sort((a:any,b:any) => b.exactScores - a.exactScores).map((s:any, idx:number) => (
                                            <tr key={s.id} className="hover:bg-slate-900/50">
                                                <td className="py-2 pl-2 w-8 text-slate-500 font-medium">{idx + 1}-</td>
                                                <td className="py-2 font-bold text-slate-200">
                                                    {mergedAccounts[s.id]?.name.replace(/🏆/g, '').trim()}
                                                    {getLeaderBadge(s.id, 'scores')}
                                                </td>
                                                <td className="py-2 pr-2 text-right font-black text-amber-500">{s.exactScores} Maç</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-4 text-slate-500 text-xs">HENÜZ SKOR BİLEN YOK</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 🔴 KOMUTANIN İSTEDİĞİ: 18. HAFTA EN ALTTA VE BONUS KAZANAN YARIŞMACILAR YAZISI 🔴 */}
                {isOldestWeek && ptsLeaders.length > 0 && (
                    <div className="mt-4 bg-amber-950/50 p-3 rounded-xl border border-amber-500/30 text-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <span className="text-amber-500 font-black text-[11px] tracking-widest">
                            ✨ {week}. HAFTA BONUS KAZANAN YARIŞMACI(LAR): <span className="text-white ml-2">{ptsLeaders.map((p:any) => mergedAccounts[p.id]?.name).join(' & ')}</span> ✨
                        </span>
                    </div>
                )}
            </div>
          );
      })}
    </div>
  );
}