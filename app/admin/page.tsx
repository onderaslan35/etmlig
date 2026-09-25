'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/utils/supabase';
import {
  staticPlayersList,
  LIG_HAVUZU,
  defaultCategoriesList,
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

export default function AdminRadarPortal() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'master' | 'skorcum01' | 'skorcum06' | 'skorcum34' | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'live' | 'bulletin' | 'predictions' | 'players' | 'teams'>('live');
  const [mergedPlayers, setMergedPlayers] = useState<Record<string, string>>(staticPlayersList);

  const [dbPlayersList, setDbPlayersList] = useState<any[]>([]);
  const [newPlayerId, setNewPlayerId] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPass, setNewPlayerPass] = useState('');
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  const [dynamicLigHavuzu, setDynamicLigHavuzu] = useState<Record<string, string[]>>(LIG_HAVUZU);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLeague, setNewTeamLeague] = useState('');

  const [editTeamName, setEditTeamName] = useState('');
  const [editTargetLeague, setEditTargetLeague] = useState('');

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const previousScoresRef = useRef<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [apiMatchesByDate, setApiMatchesByDate] = useState<Record<string, any[]>>({});
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       audioRef.current = new Audio('/sounds/goal.mp3');
       audioRef.current.load(); 
    }
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

  const [skorcuStatusMap, setSkorcuStatusMap] = useState<Record<string, boolean>>({
     'skorcum01': true,
     'skorcum06': true,
     'skorcum34': true
  });

  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(false);

  const [selectedLiveWeek, setSelectedLiveWeek] = useState<number>(6); 
  const [liveWeekOptions, setLiveWeekOptions] = useState<number[]>([6]);
  const [systemActiveWeek, setSystemActiveWeek] = useState<number>(6);

  useEffect(() => {
  setAdminScores({});
  setLiveMatchesDB([]);
  setLiveInfoStateMap({});
  }, [selectedLiveWeek]);

  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [adminScores, setAdminScores] = useState<Record<number, { home: string, away: string }>>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [distributedMatches, setDistributedMatches] = useState<{ [key: number]: boolean }>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, string[]>>({}); 
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<number, any>>({}); 

  const [bulletinWeek, setBulletinWeek] = useState<number>(6); 
  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>(generateWeekDates(6));
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const [selectedPredictionWeek, setSelectedPredictionWeek] = useState<number>(6);
  const [submittedPlayers, setSubmittedPlayers] = useState<string[]>([]);
  const [missingPlayers, setMissingPlayers] = useState<string[]>([]);
  const [playerPredictionsMap, setPlayerPredictionsMap] = useState<Record<string, string[]>>({});

  const [bulletinMatches, setBulletinMatches] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      match_index: i + 1,
      category: '',
      match_date: generateWeekDates(6)[0],
      match_time: '21:00',
      home_team: '',
      away_team: '',
      api_match_id: '' 
    }))
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const auth = sessionStorage.getItem('admin_auth');
       const role = sessionStorage.getItem('admin_role') as any;
       if (auth === 'true' && role) {
          setIsAuthenticated(true);
          setUserRole(role);
          if (role.startsWith('skorcum')) setShowOnlyToday(true);
       }

       const savedHavuz = localStorage.getItem('ekmel_lig_havuzu');
       if (savedHavuz) {
           setDynamicLigHavuzu(JSON.parse(savedHavuz));
       } else {
           setDynamicLigHavuzu(LIG_HAVUZU);
       }
    }
  }, []);

  const updateLigHavuzu = (newHavuz: Record<string, string[]>) => {
    setDynamicLigHavuzu(newHavuz);
    localStorage.setItem('ekmel_lig_havuzu', JSON.stringify(newHavuz));
  };

  const getDynamicCategories = () => {
    const base = Object.keys(dynamicLigHavuzu);
    return Array.from(new Set([...base, ...defaultCategoriesList])).sort((a,b) => a.localeCompare(b, 'tr'));
  };

  const getAllTeamsFlatList = () => {
     let all: string[] = [];
     Object.values(dynamicLigHavuzu).forEach(teams => {
         all = [...all, ...teams];
     });
     return Array.from(new Set(all)).sort((a,b) => a.localeCompare(b, 'tr'));
  };

  const fetchSkorcuStatus = async () => {
     try {
       const { data } = await supabase.from('skorcu_auth').select('*');
       if (data) {
          const newMap: Record<string, boolean> = {};
          data.forEach(row => { newMap[row.username] = row.is_active; });
          setSkorcuStatusMap(prev => ({...prev, ...newMap}));
       }
     } catch (e) {}
  };

  useEffect(() => {
    if (isAuthenticated && userRole === 'master') {
       fetchSkorcuStatus();
    }
  }, [isAuthenticated, userRole]);

  const fetchAllSystemPlayers = async () => {
    const { data } = await supabase.from('players').select('*').order('name');
    if (data) {
       setDbPlayersList(data);
       const newMergedMap = { ...staticPlayersList };
       data.forEach((p: any) => {
          newMergedMap[String(p.username)] = p.name; 
       });
       setMergedPlayers(newMergedMap); 
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchAllSystemPlayers();
        const fetchAvailableWeeks = async () => {
            const { data } = await supabase.from('matches_bulletin').select('week_num, match_date');
            if (data) {
                const todayDate = new Date();
                todayDate.setHours(0,0,0,0);

                const weeksSet = new Set<number>(data.map(d => d.week_num));
                const weeks = Array.from(weeksSet).filter(w => w >= 6).sort((a,b) => a-b);
                
                let targetWeek = 6;
                const upcomingMatches = data.filter(d => parseDateLocal(d.match_date) >= todayDate).sort((a,b) => parseDateLocal(a.match_date).getTime() - parseDateLocal(b.match_date).getTime());
                
                if (upcomingMatches.length > 0) {
                    targetWeek = upcomingMatches[0].week_num;
                } else if (weeks.length > 0) {
                    targetWeek = Math.max(...weeks);
                }

                setSystemActiveWeek(targetWeek);

                if (weeks.length > 0) setLiveWeekOptions(weeks);
                setSelectedLiveWeek(targetWeek);
            }
        };
        fetchAvailableWeeks();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'mankoman' && passwordInput === '24351324Yurt.') {
       setIsAuthenticated(true);
       setUserRole('master');
       sessionStorage.setItem('admin_auth', 'true');
       sessionStorage.setItem('admin_role', 'master');
       setShowOnlyToday(false);
       return;
    } 

    const validSkorcular: Record<string, string> = {
       'skorcum01': '150101',
       'skorcum06': '191006',
       'skorcum34': '192306'
    };

    if (validSkorcular[usernameInput]) {
       if (passwordInput === validSkorcular[usernameInput]) {
          try {
             const { data } = await supabase.from('skorcu_auth').select('is_active').eq('username', usernameInput).single();
             if (data && data.is_active === false) {
                 alert("❌ YETKİLERİNİZ DONDURULDU!\nSistemden uzaklaştırıldınız. Lütfen Genelkurmay ile iletişime geçin.");
                 return;
             }
          } catch(err) {}

          setIsAuthenticated(true);
          setUserRole(usernameInput as any);
          sessionStorage.setItem('admin_auth', 'true');
          sessionStorage.setItem('admin_role', usernameInput);
          setActiveTab('live');
          setShowOnlyToday(true);
          return;
       }
    }

    alert("❌ Erişim Reddedildi! Hatalı Kullanıcı Adı veya Şifre.");
    setPasswordInput('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_role');
    setIsAuthenticated(false);
    setUserRole(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  const toggleSkorcuAccess = async (skorcuName: string, currentStatus: boolean) => {
     const newStatus = !currentStatus;
     setSkorcuStatusMap(prev => ({...prev, [skorcuName]: newStatus}));
     try {
        await supabase.from('skorcu_auth').upsert({ username: skorcuName, is_active: newStatus }, { onConflict: 'username' });
     } catch (e) {}
  };

  const getPlayerIdByName = (name: string) => {
    return Object.keys(mergedPlayers).find(key => mergedPlayers[key] === name) || null;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchLiveAdminData = async () => {
      if (userRole && userRole.startsWith('skorcum')) {
         try {
           const { data } = await supabase.from('skorcu_auth').select('is_active').eq('username', userRole).single();
           if (data && data.is_active === false) {
              handleLogout();
              return;
           }
         } catch(e) {}
      }

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
          .from('player_predictions')
          .select('*')
          .eq('week_num', selectedLiveWeek)
          .order('user_id', { ascending: true })
          .order('match_index', { ascending: true })
          .range(from, from + step - 1);

        if (error) break;

        if (pDataChunk && pDataChunk.length > 0) {
           allPredictions = [...allPredictions, ...pDataChunk];
           if (pDataChunk.length < step) fetchMore = false; 
           else from += step; 
        } else {
           fetchMore = false; 
        }
      }

      const initialScores: Record<number, { home: string, away: string }> = {};
      const lockedMatches: Record<number, boolean> = {};
      const infoMap: Record<number, any> = {}; 
      let goalHappened = false;

      currentBulten.forEach(m => {
         const uniqueId = getUniqueMatchId(selectedLiveWeek, m.match_index);
         const liveInfo = liveData.find(l => l.id === uniqueId);

         if (liveInfo) {
           initialScores[m.match_index] = { home: liveInfo.home_score, away: liveInfo.away_score };
           infoMap[m.match_index] = liveInfo; 

           if (liveInfo.status === 'FINISHED') {
              lockedMatches[m.match_index] = true;
           }

           if (liveInfo.home_score !== '-' && liveInfo.away_score !== '-') {
             const newTotal = parseInt(liveInfo.home_score) + parseInt(liveInfo.away_score);
             const prevTotal = previousScoresRef.current[uniqueId];
             if (prevTotal !== undefined && newTotal > prevTotal) goalHappened = true;
             previousScoresRef.current[uniqueId] = newTotal;
           }
         } else {
           initialScores[m.match_index] = { home: "-", away: "-" };
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
         const pMap: Record<string, string[]> = {};
         allPredictions.forEach(row => {
            const rowUserId = String(row.user_id);
            if(!pMap[rowUserId]) pMap[rowUserId] = Array(24).fill('-');
            pMap[rowUserId][row.match_index - 1] = row.predicted_score;
         });
         setPredictionsDB(pMap);
      }
    };

    if (activeTab === 'live') {
        fetchLiveAdminData();
        const channel = supabase.channel('public:live_matches')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, payload => {
                fetchLiveAdminData();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }
  }, [activeTab, selectedLiveWeek, isAuthenticated, isSoundEnabled, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'master') return;
    const loadBulletinData = async () => {
      const newDates = generateWeekDates(bulletinWeek);
      setCurrentWeekDates(newDates);

      if (activeTab === 'bulletin') {
        const { data } = await supabase.from('matches_bulletin').select('*').eq('week_num', bulletinWeek).order('match_index', { ascending: true });

        if (data && data.length > 0) {
          const mapped = Array.from({ length: 24 }, (_, i) => {
            const existing = data.find(m => m.match_index === i + 1);
            return {
              match_index: i + 1, category: existing?.category || '', match_date: existing?.match_date || newDates[0],
              match_time: existing?.match_time || '21:00', home_team: existing?.home_team || '', away_team: existing?.away_team || '',
              api_match_id: existing?.api_match_id || '' 
            };
          });
          setBulletinMatches(mapped as any);
        } else {
          setBulletinMatches(Array.from({ length: 24 }, (_, i) => ({
            match_index: i + 1, category: '', match_date: newDates[0], match_time: '21:00', home_team: '', away_team: '', api_match_id: ''
          })));
        }
      }
    };
    loadBulletinData();
  }, [bulletinWeek, activeTab, isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'master') return;
    if (activeTab !== 'predictions') return;

    const fetchPredictionData = async () => {
      let allPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .eq('week_num', selectedPredictionWeek)
          .order('user_id', { ascending: true })
          .order('match_index', { ascending: true })
          .range(from, from + step - 1);

        if (!error && pDataChunk && pDataChunk.length > 0) {
           allPredictions = [...allPredictions, ...pDataChunk];
           if (pDataChunk.length < step) fetchMore = false; 
           else from += step; 
        } else {
           fetchMore = false; 
        }
      }

      const pMap: Record<string, string[]> = {};
      const allUserIds = Object.keys(mergedPlayers); 

      if (allPredictions.length > 0) {
         allPredictions.forEach(row => {
            const rowUserId = String(row.user_id);
            if (!pMap[rowUserId]) pMap[rowUserId] = Array(24).fill('-');
            pMap[rowUserId][row.match_index - 1] = row.predicted_score;
         });
      }

      const submitted: string[] = [];
      const missing: string[] = [];

      allUserIds.forEach(id => {
         if (pMap[id]) submitted.push(id);
         else missing.push(id);
      });

      submitted.sort((a, b) => (mergedPlayers[a] || '').localeCompare(mergedPlayers[b] || '', 'tr'));
      missing.sort((a, b) => (mergedPlayers[a] || '').localeCompare(mergedPlayers[b] || '', 'tr'));

      setPlayerPredictionsMap(pMap);
      setSubmittedPlayers(submitted);
      setMissingPlayers(missing);
    };

    fetchPredictionData();
  }, [activeTab, selectedPredictionWeek, isAuthenticated, userRole, mergedPlayers]);

  const handleAddNewPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerId || !newPlayerName || !newPlayerPass) return;
    setIsPlayerLoading(true);
    try {
       const cleanName = newPlayerName.trim().toLocaleUpperCase('tr-TR');
       const { error } = await supabase.from('players').insert({ username: newPlayerId.trim(), name: cleanName, password: newPlayerPass.trim() });
       if (error) throw error;
       alert(`✅ BAŞARILI! ${cleanName} karargaha katıldı!\n(Not: Listelerde hemen görünmesi için sistem otomatik yenilenecek.)`);
       setNewPlayerId(''); setNewPlayerName(''); setNewPlayerPass('');
       fetchAllSystemPlayers(); 
    } catch (err: any) { alert("❌ HATA: " + err.message); }
    setIsPlayerLoading(false);
  };

  const handleBanishPlayer = async (userId: string, userName: string) => {
    const confirmDelete = window.confirm(`DİKKAT: ${userName} (ID: ${userId}) ihraç edilecek.\n\nEğer bu kişiyi silerseniz Karargah sisteminden çıkacaktır. Emin misiniz?`);
    if (!confirmDelete) return;
    try {
       const { error } = await supabase.from('players').delete().eq('username', userId);
       if (error) throw error;
       alert(`✅ İhraç başarılı. ${userName} sistemden atıldı.`);
       fetchAllSystemPlayers(); 
    } catch (err: any) { alert("❌ Hata: " + err.message); }
  };

  const handleAddLocalTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newTeamName.trim() || !newTeamLeague.trim()) {
      alert("Lütfen takım adını ve ligini boş bırakmayın Komutanım!");
      return;
    }
    const tName = newTeamName.trim().toUpperCase();
    const tLeague = newTeamLeague.trim().toUpperCase();

    const updatedHavuz = { ...dynamicLigHavuzu };

    if (!updatedHavuz[tLeague]) {
      updatedHavuz[tLeague] = [];
    }

    let exists = false;
    Object.keys(updatedHavuz).forEach(lg => {
        if (updatedHavuz[lg].includes(tName)) exists = true;
    });

    if (exists) {
        alert(`Bu takım zaten sistemde var! İsterseniz aşağıdaki "Birlik Kaydırma" panelinden ligini değiştirebilirsiniz.`);
        return;
    }

    updatedHavuz[tLeague].push(tName);
    updatedHavuz[tLeague].sort((a,b) => a.localeCompare(b, 'tr'));

    updateLigHavuzu(updatedHavuz);
    setNewTeamName('');
    setNewTeamLeague('');
    alert(`✅ MÜKEMMEL! ${tName} takımı, ${tLeague} ligini kurarak Karargaha giriş yaptı!`);
  };

  const handleMoveTeam = (e: React.FormEvent) => {
      e.preventDefault();
      if(!editTeamName.trim() || !editTargetLeague.trim()) {
          alert("Lütfen taşınacak takımı ve hedef ligi seçin!");
          return;
      }
      const tName = editTeamName.trim().toUpperCase();
      const targetLg = editTargetLeague.trim().toUpperCase();

      const updatedHavuz = { ...dynamicLigHavuzu };

      let oldLeague = "";
      Object.keys(updatedHavuz).forEach(lg => {
          if (updatedHavuz[lg].includes(tName)) {
              oldLeague = lg;
              updatedHavuz[lg] = updatedHavuz[lg].filter(t => t !== tName);
          }
      });

      if (!oldLeague) {
          alert("Takım Karargahta bulunamadı!");
          return;
      }

      if (!updatedHavuz[targetLg]) {
          updatedHavuz[targetLg] = [];
      }

      updatedHavuz[targetLg].push(tName);
      updatedHavuz[targetLg].sort((a,b) => a.localeCompare(b, 'tr'));

      updateLigHavuzu(updatedHavuz);
      setEditTeamName('');
      setEditTargetLeague('');
      alert(`🔄 TRANSFER BAŞARILI! ${tName} takımı, ${oldLeague} liginden alındı ve ${targetLg} ligine aktarıldı!`);
  };

  const toggleWinners = (matchId: number) => setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));

  const handleScoreChange = (matchId: number, team: 'home' | 'away', score: string) => {
    setAdminScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || { home: "-", away: "-" }), [team]: score } }));
  };

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

  const weeklyStats = useMemo(() => {
     const stats: Record<string, { points: number, exactScores: number }> = {};
     Object.keys(mergedPlayers).forEach(uid => {
         stats[uid] = { points: 0, exactScores: 0 };
     });

     liveMatchesDB.forEach(match => {
         const hScore = adminScores[match.match_index]?.home || "-";
         const aScore = adminScores[match.match_index]?.away || "-";

         if (hScore !== "-" && aScore !== "-") {
             const targetScore = `${hScore}-${aScore}`;
             const predsSource = predictionsDB;

             const winners = Object.keys(predsSource).filter(uid => {
                 const targetIndex = match.match_index - 1;
                 return predsSource[uid] && predsSource[uid][targetIndex] === targetScore;
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

     if (maxPts > 0) {
         pLeadersArray = Object.keys(stats).filter(uid => stats[uid].points === maxPts);
     }
     if (maxScores > 0) {
         sLeadersArray = Object.keys(stats).filter(uid => stats[uid].exactScores === maxScores);
     }

     return { stats, maxPts, maxScores, pLeadersArray, sLeadersArray };
  }, [adminScores, predictionsDB, liveMatchesDB, mergedPlayers, selectedLiveWeek]);


  const handleAction = async (action: string, matchId: number, matchData: any, currentWinners: string[], displayPoints: number) => {
    const homeScore = adminScores[matchId]?.home || "-";
    const awayScore = adminScores[matchId]?.away || "-";
    const uniqueId = getUniqueMatchId(selectedLiveWeek, matchId);

    const nowTime = new Date();
    const timeString = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}:${String(nowTime.getSeconds()).padStart(2, '0')}`;

    if (action === 'Skoru Güncelle') {
      if (isSoundEnabled && audioRef.current) {
         audioRef.current.currentTime = 0;
         audioRef.current.play().catch(e => console.log("Ses çalınamadı:", e));
      }

      const { error: liveError } = await supabase.from('live_matches').upsert({ 
         id: uniqueId, home_score: homeScore, away_score: awayScore, status: 'LIVE',
         updated_by: userRole, updated_at: timeString 
      }, { onConflict: 'id' });
      
      if (liveError) alert("Canlı skor tablosu güncellenirken hata: " + liveError.message);
      else alert(`✅ ${matchId}. Maçın skoru "live_matches" tablosuna işlendi! Artık canlı ekranda görünecek.`);
      return;
    }

    if (action === 'Maçı Onayla (Puan Dağıt)') {
      if (homeScore === "-" || awayScore === "-") {
        alert("Lütfen önce takımların skorunu girin!");
        return;
      }

      const isTff = isTffMatchCheck(matchData.category);
      const leagueName = isTff ? 'TFF' : 'DFO';

      let confirmMsg = "";
      
      if (matchId === 24) {
            let bonusInserts: any[] = [];
            let finalPLeader = weeklyStats.pLeadersArray.length === 1 ? weeklyStats.pLeadersArray[0] : null;
            let finalSLeader = weeklyStats.sLeadersArray.length === 1 ? weeklyStats.sLeadersArray[0] : null;

            if (finalPLeader) {
                bonusInserts.push({
                    hafta: selectedLiveWeek, 
                    user_name: mergedPlayers[finalPLeader], 
                    username: finalPLeader, 
                    kategori: 'MASTER', 
                    ev_sahibi: 'HAFTANIN', 
                    deplasman: 'LİDERİ',
                    gercek_ev: 0, gercek_dep: 0, tahmin_ev: 0, tahmin_dep: 0, puan: 3
                });
            }

            if (finalSLeader) {
                bonusInserts.push({
                    hafta: selectedLiveWeek, 
                    user_name: mergedPlayers[finalSLeader], 
                    username: finalSLeader, 
                    kategori: 'MASTER', 
                    ev_sahibi: 'SKOR', 
                    deplasman: 'KRALI',
                    gercek_ev: 0, gercek_dep: 0, tahmin_ev: 0, tahmin_dep: 0, puan: 3
                });
            }

            if (bonusInserts.length > 0) {
                const { error: bInsertError } = await supabase.from('points').insert(bonusInserts);
                if (bInsertError) {
                    alert(`❌ DİKKAT! Bonuslar veritabanına yazılamadı!\nSebep: ${bInsertError.message}`);
                } else {
                    for (const insert of bonusInserts) {
                        const { data: stData } = await supabase.from('standings').select('*').eq('user_id', insert.username);
                        if (stData) {
                            const mRow = stData.find(r => r.league_type === 'MASTER');
                            if (mRow) await supabase.from('standings').update({ points: mRow.points + 3 }).eq('id', mRow.id);
                        }
                    }
                    alert(`🎁 24. MAÇ İŞLEMİ TAMAM! (Tek Tabanca liderlere kalıcı fiş kesildi ve sadece MASTER kasasına işlendi!)`);
                }
            } else {
               alert(`✅ 24. MAÇ İŞLEMİ TAMAM! (Beraberlik olduğu için kimseye bonus verilmedi)`);
            }
        } else {
           if (currentWinners.length > 0) alert(`✅ MAÇ İŞLEMİ BAŞARILI! Çift fiş kesildi ve kasaya eklendi.`);
           else alert("✅ Maç başarıyla BİTİRİLDİ. Normal skoru bilen çıkmadığı için kasa kapalı.");
        }

      if (!window.confirm(confirmMsg)) return;

      try {
        await supabase.from('live_matches').upsert({ 
           id: uniqueId, home_score: homeScore, away_score: awayScore, status: 'FINISHED',
           updated_by: userRole, updated_at: timeString 
        }, { onConflict: 'id' });

        if (currentWinners.length > 0) {
          // 🔥 KOMUTANIN ZIRHI: BU MAÇA DAHA ÖNCE PUAN VERİLDİ Mİ KONTROLÜ 🔥
          const { data: existingPointsCheck } = await supabase
            .from('points')
            .select('id')
            .eq('hafta', selectedLiveWeek)
            .eq('ev_sahibi', matchData.home_team)
            .eq('deplasman', matchData.away_team);

          if (existingPointsCheck && existingPointsCheck.length > 0) {
            alert(`⚠️ DUR KOMUTANIM!\nBu maçın (${matchData.home_team} vs ${matchData.away_team}) puanları zaten dağıtılmış!\nÇifte sayım engellendi, puanlar şişirilmedi.`);
            return;
          }

          const inserts: any[] = [];
          
          currentWinners.forEach(winnerName => {
            const userId = getPlayerIdByName(winnerName);
            const baseData = {
              hafta: selectedLiveWeek, user_name: winnerName, username: userId, ev_sahibi: matchData.home_team, deplasman: matchData.away_team,
              gercek_ev: parseInt(homeScore, 10), gercek_dep: parseInt(awayScore, 10), tahmin_ev: homeScore, tahmin_dep: awayScore, puan: displayPoints
            };
            
            inserts.push({ ...baseData, kategori: leagueName });
            inserts.push({ ...baseData, kategori: 'MASTER' });
          });

          const { error: insertError } = await supabase.from('points').insert(inserts);
          if (insertError) { alert(`❌ HATA! Fişler eklenemedi.\nMesaj: ${insertError.message}`); return; }

          for (const winnerName of currentWinners) {
            const userId = getPlayerIdByName(winnerName);
            if (!userId) continue;
            const { data: stData } = await supabase.from('standings').select('*').eq('user_id', userId);
            if (stData) {
              const lRow = stData.find(r => r.league_type === leagueName);
              if (lRow) await supabase.from('standings').update({ points: lRow.points + displayPoints }).eq('id', lRow.id);
              else await supabase.from('standings').insert({ user_id: userId, user_name: winnerName, league_type: leagueName, points: displayPoints });

              const mRow = stData.find(r => r.league_type === 'MASTER');
              if (mRow) await supabase.from('standings').update({ points: mRow.points + displayPoints }).eq('id', mRow.id);
              else await supabase.from('standings').insert({ user_id: userId, user_name: winnerName, league_type: 'MASTER', points: displayPoints });
            }
          }
        }

        setDistributedMatches(prev => ({...prev, [matchId]: true})); 

      } catch (error: any) { alert("❌ BEKLENMEYEN HATA: " + error.message); }
      return;
    }

    if (action === 'Geri Al' || action === 'Resetle') {
      const isLocked = distributedMatches[matchId];
      if (isLocked) {
        const confirmUndo = window.confirm(`DİKKAT: Bu maçın puanları daha önce dağıtılmıştı!\n\nEğer onaylarsan; bu maçtan kazanılan puanlar 'standings' (kasa) tablosundan DÜŞÜLECEK, 'points' tablosundaki fişler SİLİNECEK ve maç tekrar MÜDAHALEYE AÇILACAK.\n\nBunu yapmak istediğine emin misin?`);
        if (!confirmUndo) return;

        try {
          if (matchId === 24) {
               const { data: bonusPoints } = await supabase.from('points').select('*').eq('hafta', selectedLiveWeek).in('ev_sahibi', ['HAFTANIN', 'SKOR']);
               if (bonusPoints && bonusPoints.length > 0) {
                   for (const row of bonusPoints) {
                       const pts = row.puan; const uid = row.username;
                       const { data: stData } = await supabase.from('standings').select('*').eq('user_id', uid);
                       if (stData) {
                           const mRow = stData.find(r => r.league_type === 'MASTER');
                           if (mRow) await supabase.from('standings').update({ points: Math.max(0, mRow.points - pts) }).eq('id', mRow.id);
                       }
                   }
                   await supabase.from('points').delete().eq('hafta', selectedLiveWeek).in('ev_sahibi', ['HAFTANIN', 'SKOR']);
               }
          }

          const { data: existingPoints } = await supabase.from('points').select('*').eq('hafta', selectedLiveWeek).eq('ev_sahibi', matchData.home_team).eq('deplasman', matchData.away_team);
          if (existingPoints && existingPoints.length > 0) {
            for (const row of existingPoints) {
              const pts = row.puan; const uid = row.username; const rowCategory = row.kategori;
              const { data: stData } = await supabase.from('standings').select('*').eq('user_id', uid);
              if (stData) {
                const targetRow = stData.find(r => r.league_type === rowCategory);
                if (targetRow) {
                   await supabase.from('standings').update({ points: Math.max(0, targetRow.points - pts) }).eq('id', targetRow.id);
                }
              }
            }
            await supabase.from('points').delete().eq('hafta', selectedLiveWeek).eq('ev_sahibi', matchData.home_team).eq('deplasman', matchData.away_team);
          }
          alert("✅ GERİ ALMA BAŞARILI! Puanlar ve varsa Bonuslar kasadan düşüldü, fişler silindi.");
        } catch (error: any) { alert("❌ HATA: " + error.message); return; }
      }

      await supabase.from('live_matches').upsert({ 
         id: uniqueId, home_score: '-', away_score: '-', status: 'NOT_STARTED',
         updated_by: userRole, updated_at: timeString 
      }, { onConflict: 'id' });
      setAdminScores(prev => ({ ...prev, [matchId]: { home: "-", away: "-" } }));
      setOpenWinnersMap(prev => ({ ...prev, [matchId]: false })); 
      setDistributedMatches(prev => ({ ...prev, [matchId]: false })); 
      if(!isLocked) alert("✅ Skor başarıyla sıfırlandı.");
    }
  };

  const getAvailableTeams = (currentIndex: number, isHome: boolean) => {
    const currentMatch = bulletinMatches[currentIndex];
    const currentCat = currentMatch.category ? currentMatch.category.toUpperCase() : '';
    const opponent = isHome ? currentMatch.away_team : currentMatch.home_team;

    if (!currentCat) return [];

    let havuz = dynamicLigHavuzu[currentCat];

    if (!havuz || currentCat.includes("UEFA") || currentCat.includes("KUPA") || currentCat.includes("CUP") || currentCat.includes("Ş.L.") || currentCat.includes("A.L.") || currentCat.includes("K.L.")) {
       havuz = Object.values(dynamicLigHavuzu).flat();
    }

    const fullHavuz = Array.from(new Set([...havuz]));
    const usedTeams = new Set<string>();

    bulletinMatches.forEach((m, idx) => {
       if (idx === currentIndex) return; 

       const mCat = m.category ? m.category.toUpperCase() : '';

       if (currentCat === mCat) {
           if (m.home_team) usedTeams.add(m.home_team);
           if (m.away_team) usedTeams.add(m.away_team);
       }
    });

    return fullHavuz.filter(t => t !== opponent && !usedTeams.has(t)).sort((a,b) => a.localeCompare(b, 'tr'));
  };

  const handleBulletinChange = (index: number, field: string, value: string) => {
    const newMatches = [...bulletinMatches];
    (newMatches[index] as any)[field] = value;
    if (field === 'category') {
        newMatches[index].home_team = ''; newMatches[index].away_team = '';
    }
    setBulletinMatches(newMatches);
  };

  const copyDateTimeToAll = () => {
    const firstDate = bulletinMatches[0].match_date;
    const firstTime = bulletinMatches[0].match_time;
    if(!firstDate || !firstTime) return alert("Önce 1. maçın tarih ve saatini doldurun!");
    const updated = bulletinMatches.map(m => ({ ...m, match_date: firstDate, match_time: firstTime }));
    setBulletinMatches(updated);
  };

  // 🔥 GÜNCELLENMİŞ OTOMATİK API HAVUZ GETİRİCİ (DOĞRU ŞİFRE İLE) 🔥
  const fetchApiMatchesForDate = async (dateStr: string) => {
      setIsApiLoading(true);
      try {
          let formattedDate = dateStr;
          if (formattedDate.includes('.')) {
              const parts = formattedDate.split('.');
              formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }

          if (apiMatchesByDate[formattedDate]) {
              setIsApiLoading(false);
              return;
          }

          // 🔴 SENİN ASIL ÇALIŞAN ŞİFREN BURAYA EKLENDİ 🔴
          const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${formattedDate}`, {
              headers: {
                  'x-apisports-key': '933e5ccc09194d0db30171e2bca20ca9',
                  'x-rapidapi-host': 'v3.football.api-sports.io'
              }
          });
          const data = await res.json();
          
          if (data.errors && Object.keys(data.errors).length > 0) {
               alert("API Uyarı: " + JSON.stringify(data.errors));
               setIsApiLoading(false);
               return;
          }
          
          if (data.response && data.response.length > 0) {
              const sortedMatches = data.response.sort((a: any, b: any) => {
                  const timeA = new Date(a.fixture.date).getTime();
                  const timeB = new Date(b.fixture.date).getTime();
                  return timeA - timeB; 
              });
              
              setApiMatchesByDate(prev => ({...prev, [formattedDate]: sortedMatches}));
          } else {
              setApiMatchesByDate(prev => ({...prev, [formattedDate]: []}));
              alert(`${formattedDate} tarihinde uyduda hiç maç bulunamadı.`);
          }
      } catch (error) {
          console.error("API Bağlantı Hatası:", error);
          alert("Sinyal koptu! Lütfen sayfayı yenileyip tekrar deneyin.");
      } finally {
          setIsApiLoading(false);
      }
  };

  const saveBulletinToDB = async () => {
    const hasEmpty = bulletinMatches.some(m => !m.home_team.trim() || !m.away_team.trim() || !m.category.trim());
    if (hasEmpty) {
       if(!window.confirm("Bazı takımlar veya kategoriler seçilmemiş. Bülteni yinede MÜHÜRLEMEK istiyor musun?")) return;
    }

    setIsPublishing(true);
    try {
      const payload = bulletinMatches.map(m => ({
         week_num: bulletinWeek, match_index: m.match_index, category: m.category,
         match_date: m.match_date, match_time: m.match_time,
         home_team: m.home_team.trim().toUpperCase(), away_team: m.away_team.trim().toUpperCase(),
         api_match_id: m.api_match_id ? parseInt(String(m.api_match_id)) : null 
      }));

      const { error } = await supabase.from('matches_bulletin').upsert(payload, { onConflict: 'week_num,match_index' });
      if (error) throw error;
      
      const liveMatchesPayload = bulletinMatches.filter(m => m.api_match_id).map(m => ({
          id: getUniqueMatchId(bulletinWeek, m.match_index), 
          api_match_id: parseInt(String(m.api_match_id)) 
      }));

      if (liveMatchesPayload.length > 0) {
          await supabase.from('live_matches').upsert(liveMatchesPayload, { onConflict: 'id' });
      }

      alert(`✅ MÜKEMMEL! ${bulletinWeek}. Hafta Bülteni mühürlendi!\n\nAPI Radarı ile seçilen maçlar otomatik olarak Canlı Sisteme kilitlendi!`);
    } catch (e: any) { alert("❌ HATA: Bülten kaydedilemedi! Detay: " + e.message); }
    setIsPublishing(false);
  };

  const displayedMatches = liveMatchesDB.filter(match => {
      const logInfo = liveInfoStateMap[match.match_index];
      const status = logInfo?.status || 'NOT_STARTED';

      const isFinished = status === 'FINISHED';
      const isLive = status === 'LIVE' || status === 'WAITING_APPROVAL' || status === 'HT';
      const isToday = match.match_date === getTodayDateString();

      const matchTimeMs = getMatchTimeMs(match.match_date, match.match_time);
      const isWithinLast5Hours = (now - matchTimeMs) >= 0 && (now - matchTimeMs) <= (5 * 60 * 60 * 1000);

      if (userRole && userRole.startsWith('skorcum')) {
          if (isFinished) return false; 
          if (isLive || isWithinLast5Hours) return true; 
          
          const mDate = parseDateLocal(match.match_date);
          const today = new Date();
          today.setHours(0,0,0,0);
          
          if (mDate < today && !isWithinLast5Hours) return false; 
          return true; 
      }

      if (showOnlyToday) {
          if (isFinished) return false; 
          if (isLive || isWithinLast5Hours) return true;      
          return isToday;                
      }
      return true; 
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
          <span className="text-5xl mb-4 block drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">🛡️</span>
          <h1 className="text-2xl font-black text-white mb-2 tracking-widest uppercase drop-shadow-md">Karargah Girişi</h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
            <input 
              type="text" 
              value={usernameInput} 
              onChange={e => setUsernameInput(e.target.value)} 
              className="bg-slate-950 border border-slate-700 text-slate-300 px-4 py-3.5 rounded-xl outline-none focus:border-amber-500 text-center tracking-widest font-bold text-sm shadow-inner placeholder:text-slate-600 lowercase" 
              placeholder="KULLANICI ADI" 
            />
            <input 
              type="password" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              className="bg-slate-950 border border-slate-700 text-amber-400 px-4 py-3.5 rounded-xl outline-none focus:border-amber-500 text-center tracking-[0.3em] font-black text-lg shadow-inner placeholder:text-slate-600" 
              placeholder="••••••••" 
            />
            <button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-500 text-white font-black tracking-widest py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] mt-2"
            >
              KAPIYI AÇ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans pb-24 relative">
      <div className="max-w-7xl mx-auto pt-6">

        {/* 🔴 SEKME (TAB) MENÜSÜ 🔴 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-slate-900/50 p-3 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto custom-scrollbar flex-wrap">
           <button 
             onClick={() => setActiveTab('live')}
             className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'live' ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
           >
             🔴 CANLI YÖNETİM
           </button>

           {userRole === 'master' && (
             <>
               <button 
                 onClick={() => setActiveTab('bulletin')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'bulletin' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 🛠️ BÜLTEN
               </button>
               <button 
                 onClick={() => setActiveTab('predictions')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'predictions' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 📊 TAHMİNLER
               </button>
               <button 
                 onClick={() => setActiveTab('players')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'players' ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 👥 YARIŞMACILAR
               </button>
               <button 
                 onClick={() => setActiveTab('teams')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'teams' ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 🛡️ LOJİSTİK / TRANSFER
               </button>
             </>
           )}
        </div>

        {/* 🚀 CANLI YÖNETİM EKRANI 🚀 */}
        {activeTab === 'live' && (
          <div className="animate-fade-in">
            {userRole === 'master' && (
               <div className="mb-6 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-2">
                        <span className="text-2xl drop-shadow-md">⚔️</span>
                        <div>
                           <h2 className="text-white font-black tracking-widest uppercase text-sm">SKORCU DİSİPLİN PANELİ</h2>
                           <p className="text-slate-400 text-[10px]">Aktif Skorcuları anında sistemden atabilir veya yetki verebilirsin.</p>
                        </div>
                     </div>
                     <div className="flex gap-3 flex-wrap justify-center">
                        {['skorcum01', 'skorcum06', 'skorcum34'].map(sk => {
                           const isActive = skorcuStatusMap[sk] !== false; 
                           return (
                              <button 
                                 key={sk}
                                 onClick={() => toggleSkorcuAccess(sk, isActive)}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all shadow-md ${
                                    isActive ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900' : 'bg-rose-950/80 border-rose-500/50 text-rose-400 hover:bg-rose-900'
                                 }`}
                              >
                                 <span className="uppercase tracking-widest">{sk}</span>
                                 <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]'}`}></div>
                              </button>
                           )
                        })}
                     </div>
                  </div>
               </div>
            )}

            {userRole === 'master' && (
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.3)]">
                <h2 className="text-center font-black text-blue-400 text-sm tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
                    <span className="text-xl">🏆</span> {selectedLiveWeek}. HAFTA CANLI LİDERLİK RADARI
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center">
                        <span className="text-emerald-400 text-[10px] font-bold tracking-widest mb-1">🔥 HAFTANIN PUAN LİDERİ</span>
                        <span className="text-white font-black text-sm uppercase text-center leading-snug">
                            {weeklyStats.pLeadersArray.length > 0 
                                ? weeklyStats.pLeadersArray.map(uid => mergedPlayers[uid]).join(' & ') 
                                : 'MÜSTAKİL LİDER YOK'}
                        </span>
                        <span className="text-emerald-500 font-bold text-xs mt-1 bg-emerald-950/50 px-2 rounded">
                            {weeklyStats.pLeadersArray.length > 0 ? `${weeklyStats.maxPts} PUAN TOPLADI` : '---'}
                        </span>
                    </div>

                    <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center">
                        <span className="text-amber-400 text-[10px] font-bold tracking-widest mb-1">⚽ HAFTANIN SKOR KRALI</span>
                        <span className="text-white font-black text-sm uppercase text-center leading-snug">
                            {weeklyStats.sLeadersArray.length > 0 
                                ? weeklyStats.sLeadersArray.map(uid => mergedPlayers[uid]).join(' & ') 
                                : 'MÜSTAKİL KRAL YOK'}
                        </span>
                        <span className="text-amber-500 font-bold text-xs mt-1 bg-amber-950/50 px-2 rounded">
                            {weeklyStats.sLeadersArray.length > 0 ? `${weeklyStats.maxScores} MAÇ BİLDİ` : '---'}
                        </span>
                    </div>
                </div>
                <p className="text-center text-slate-500 text-[10px] mt-4 italic">
                    Not: Bu radar sizin girdiğiniz skorlara göre anlık güncellenir.
                </p>
            </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  🔴 KÖK KOMUTA MERKEZİ / CANLI RADAR
                </h1>
                <p className="text-slate-400 text-xs mt-1 flex items-center justify-center sm:justify-start gap-2">
                  Veritabanındaki maçların skorunu gir ve puanları dağıt.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                 <button 
                   onClick={handleLogout} 
                   className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-400 text-xs font-bold rounded-xl shadow-md border border-rose-900/50 flex items-center gap-2 transition-all"
                 >
                   🔒 KİLİTLE ÇIK
                 </button>

                 <button 
                    onClick={handleSoundToggle}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                        isSoundEnabled ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500' : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:bg-slate-800'
                    }`}
                 >
                    {isSoundEnabled ? '🔊 GOL SESİ AÇIK' : '🔇 GOL SESİ KAPALI'}
                 </button>

                 <div className="flex items-center gap-2 ml-0 sm:ml-2">
                    {userRole === 'master' && (
                       <button 
                          onClick={() => setShowOnlyToday(!showOnlyToday)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                              showOnlyToday ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'
                          }`}
                       >
                          {showOnlyToday ? '📅 SADECE BUGÜN (BİTENLER GİZLİ)' : '📋 TÜM LİSTE'}
                       </button>
                    )}

                    <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                       <span className="text-slate-400 font-bold text-xs tracking-wider">AKTİF HAFTA:</span>
                       <select 
                         value={selectedLiveWeek}
                         onChange={(e) => setSelectedLiveWeek(Number(e.target.value))}
                         className="bg-amber-500 border border-amber-600 text-slate-950 font-black text-sm px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.3)] outline-none cursor-pointer"
                       >
                          {liveWeekOptions.map(w => (
                              <option key={w} value={w}>{w}. HAFTA</option>
                          ))}
                       </select>
                    </div>
                 </div>
              </div>
            </div>

            {displayedMatches.length === 0 ? (
                 <div className="w-full py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl shadow-inner">
                    <span className="text-5xl mb-4 block opacity-50">{userRole && userRole.startsWith('skorcum') ? '🛡️' : '📡'}</span>
                    <h2 className={`text-xl font-bold mb-2 tracking-widest uppercase ${userRole && userRole.startsWith('skorcum') ? 'text-amber-500' : 'text-slate-400'}`}>
                       {userRole && userRole.startsWith('skorcum') 
                          ? `EKRANDA İŞLEM YAPILACAK (BEKLEYEN VEYA GELECEK) MAÇ YOK` 
                          : (liveMatchesDB.length > 0 ? "FİLTREYE UYGUN MAÇ BULUNMUYOR" : `${selectedLiveWeek}. HAFTA BÜLTENİ BULUNAMADI`)}
                    </h2>
                 </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {displayedMatches.map((match) => {
                const isWinnersOpen = !!openWinnersMap[match.match_index];
                const isTffMatch = isTffMatchCheck(match.category);

                const homeTeamUpper = match.home_team?.toUpperCase() || match.homeTeam?.toUpperCase() || "";
                const awayTeamUpper = match.away_team?.toUpperCase() || match.awayTeam?.toUpperCase() || "";

                const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);

                const homeScore = adminScores[match.match_index]?.home || "-";
                const awayScore = adminScores[match.match_index]?.away || "-";

                let currentWinners: string[] = [];
                let winnersCount = 0;
                let displayPoints = 0;

                if (homeScore !== "-" && awayScore !== "-") {
                  const targetScore = `${homeScore}-${awayScore}`;
                  let predictionsSource = predictionsDB;

                  currentWinners = Object.keys(predictionsSource)
                    .filter(uid => {
                        return predictionsSource[uid] && predictionsSource[uid][match.match_index - 1] === targetScore;
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

                const isLocked = distributedMatches[match.match_index];
                const logInfo = liveInfoStateMap[match.match_index];
                
                const matchTimeMs = getMatchTimeMs(match.match_date, match.match_time);
                const isTimeAllowed = now >= matchTimeMs - 60000;
                const isPastWeek = selectedLiveWeek < systemActiveWeek; 

                return (
                  <div key={match.match_index} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
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
                            {match.week_num}. Hafta - {match.match_index}. MAÇ ({match.match_date} - {match.match_time})
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
                              <select disabled={isLocked || !isTimeAllowed || isPastWeek} value={homeScore} onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md disabled:opacity-80" style={{textAlignLast: 'center'}}>
                                {timeOptionsArr.map((_, i) => <option key={`h-${i}`} value={scoreOptions[i]}>{scoreOptions[i]}</option>)}
                              </select>
                              <span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span>
                              <select disabled={isLocked || !isTimeAllowed || isPastWeek} value={awayScore} onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md disabled:opacity-80" style={{textAlignLast: 'center'}}>
                                {timeOptionsArr.map((_, i) => <option key={`a-${i}`} value={scoreOptions[i]}>{scoreOptions[i]}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                             <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                              <img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                            </div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{awayTeamUpper}</span>
                          </div>
                        </div>

                        {logInfo?.updated_by && (
                           <div className="mt-4 flex justify-center">
                              <div className="bg-slate-950/80 border border-slate-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-inner">
                                 <span className="text-[10px] sm:text-xs drop-shadow-md">📝</span>
                                 <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                                    Son İşlem: <strong className="text-amber-400 uppercase tracking-widest">{logInfo.updated_by}</strong> tarafından <span className="text-slate-300 font-bold">{logInfo.updated_at}</span>.
                                 </span>
                              </div>
                           </div>
                        )}

                        <div className="flex justify-center gap-2 mt-5 min-h-[32px] items-center">
                          {isLocked ? (
                            <div className="w-full text-center">
                              <div className="bg-emerald-950/80 text-emerald-400 text-[10px] sm:text-[11px] font-black px-6 py-2 rounded-lg border border-emerald-500/30 uppercase tracking-widest shadow-inner inline-block w-full">
                                ✅ BU MAÇIN PUANLARI DAĞITILDI
                              </div>
                              <button onClick={() => handleAction('Geri Al', match.match_index, match, currentWinners, displayPoints)} className="bg-red-900/80 hover:bg-red-700 text-red-200 text-[9px] font-bold px-3 py-1.5 rounded uppercase border border-red-500/50 transition-all shadow-[0_0_10px_rgba(220,38,38,0.3)] mt-2 w-3/4 mx-auto block">
                                İPTAL ET & PUANLARI GERİ AL
                              </button>
                            </div>
                          ) : isPastWeek ? (
                            <div className="w-full text-center">
                              <div className="bg-rose-900/80 text-rose-300 text-[9px] sm:text-[10px] font-bold px-6 py-2 rounded-lg border border-rose-700 uppercase tracking-widest shadow-inner inline-block w-full">
                                🔒 GEÇMİŞ HAFTA KİLİTLİ: SKOR DEĞİŞTİRİLEMEZ
                              </div>
                            </div>
                          ) : !isTimeAllowed ? (
                            <div className="w-full text-center">
                              <div className="bg-slate-900/80 text-amber-500 text-[9px] sm:text-[10px] font-bold px-6 py-2 rounded-lg border border-slate-700 uppercase tracking-widest shadow-inner inline-block w-full">
                                ⏳ MÜDAHALE KİLİTLİ: MAÇA 1 DK KALA AÇILIR
                              </div>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handleAction('Skoru Güncelle', match.match_index, match, currentWinners, displayPoints)} className="bg-blue-600/80 hover:bg-blue-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-blue-400 transition-all shadow-md">
                                1. ADIM: CANLIYA YANSIT
                              </button>
                              <button onClick={() => handleAction('Maçı Onayla (Puan Dağıt)', match.match_index, match, currentWinners, displayPoints)} className="bg-emerald-600/80 hover:bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-emerald-400 transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                2. ADIM: MAÇI BİTİR (DAĞIT)
                              </button>
                              <button onClick={() => handleAction('Resetle', match.match_index, match, currentWinners, displayPoints)} className="bg-red-600/80 hover:bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-red-400 transition-all shadow-md">
                                SIFIRLA
                              </button>
                            </>
                          )}
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
                            <button onClick={() => toggleWinners(match.match_index)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap drop-shadow-sm">
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
        )}

        {/* 🚀 BÜLTEN ÜRETİM FABRİKASI (YENİ AKILLI RADARLI HALİ) 🚀 */}
        {activeTab === 'bulletin' && userRole === 'master' && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black text-indigo-400">🏭 BÜLTEN FABRİKASI</h2>
                <div className="flex items-center gap-3">
                   <select value={bulletinWeek} onChange={e => setBulletinWeek(Number(e.target.value))} className="bg-indigo-950 text-indigo-300 font-bold px-3 py-1 rounded outline-none border border-indigo-700/50 cursor-pointer">
                      {[...Array(34)].map((_, i) => <option key={`bw-${i+5}`} value={i+5}>{i+5}. HAFTA</option>)}
                   </select>
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl">
                <button onClick={copyDateTimeToAll} className="mb-4 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors shadow-sm">
                    📅 1. Maçın Tarihini Alta Kopyala
                </button>

                <div className="overflow-x-auto custom-scrollbar pb-4">
                   <table className="w-full text-left text-xs min-w-[950px]">
                      <tbody>
                         {bulletinMatches.map((m, idx) => {
                            const isReady = m.category && m.match_date && m.match_time && m.home_team && m.away_team;
                            let formattedDate = m.match_date;
                            if (formattedDate.includes('.')) {
                                const parts = formattedDate.split('.');
                                formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                            }
                            const apiMatchesList = apiMatchesByDate[formattedDate] || [];

                            return (
                              <tr key={m.match_index} className={`border-b border-slate-800 transition-colors ${isReady ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'}`}>
                                 <td className="p-2 w-10 text-center">
                                    <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full font-black text-[13px] transition-all duration-500 ${isReady ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-110' : 'bg-slate-800 text-slate-500'}`}>
                                       {isReady ? '✓' : m.match_index}
                                    </div>
                                 </td>

                                 <td className="p-2 w-[18%]">
                                    <select value={m.category} onChange={e=>handleBulletinChange(idx,'category',e.target.value)} className={`w-full bg-slate-950 border ${isReady ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700/50 text-slate-300'} px-2 py-2 rounded outline-none focus:border-indigo-500 cursor-pointer font-bold`}>
                                       <option value="">-- KATEGORİ SEÇİN --</option>
                                       {getDynamicCategories().map(c => <option key={`cat-${m.match_index}-${c}`} value={c}>{c}</option>)}
                                    </select>
                                 </td>

                                 <td className="p-2 w-[12%]">
                                    <select value={m.match_date} onChange={e=>{
                                      handleBulletinChange(idx,'match_date',e.target.value);
                                      handleBulletinChange(idx, 'api_match_id', ''); 
                                    }} className="w-full bg-slate-950 border border-slate-700/50 text-slate-300 px-2 py-2 rounded outline-none focus:border-indigo-500 cursor-pointer font-bold">
                                       {currentWeekDates.map(d => <option key={`date-${m.match_index}-${d}`} value={d}>{d}</option>)}
                                    </select>
                                 </td>

                                 <td className="p-2 w-[10%]">
                                    <select value={m.match_time} onChange={e=>handleBulletinChange(idx,'match_time',e.target.value)} className="w-full bg-slate-950 border border-slate-700/50 text-slate-300 px-2 py-2 rounded outline-none focus:border-indigo-500 cursor-pointer font-bold text-center">
                                       {timeOptionsArr.map(t => <option key={`time-${m.match_index}-${t}`} value={t}>{t}</option>)}
                                    </select>
                                 </td>

                                 <td className="p-2 w-[20%]">
                                    <select value={m.home_team} onChange={e=>handleBulletinChange(idx,'home_team',e.target.value)} className={`w-full bg-slate-950 border ${isReady ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700/50 text-slate-300'} px-2 py-2 rounded outline-none focus:border-indigo-500 font-bold uppercase cursor-pointer`}>
                                       <option value="">-- EV SAHİBİ SEÇ --</option>
                                       {getAvailableTeams(idx, true).map(t => <option key={`home-${m.match_index}-${t}`} value={t}>{t}</option>)}
                                    </select>
                                 </td>

                                 <td className="p-2 w-[20%]">
                                    <select value={m.away_team} onChange={e=>handleBulletinChange(idx,'away_team',e.target.value)} className={`w-full bg-slate-950 border ${isReady ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700/50 text-slate-300'} px-2 py-2 rounded outline-none focus:border-indigo-500 font-bold uppercase cursor-pointer`}>
                                       <option value="">-- DEPLASMAN SEÇ --</option>
                                       {getAvailableTeams(idx, false).map(t => <option key={`away-${m.match_index}-${t}`} value={t}>{t}</option>)}
                                    </select>
                                 </td>

                                 {/* 🔥 YENİ: AÇILIR LİSTE VE FİZİKSEL RADAR BUTONU 🔥 */}
                                 <td className="p-2 w-[15%]">
                                    <div className="flex items-center gap-1 w-full">
                                       <select
                                         value={m.api_match_id || ''}
                                         onChange={(e) => handleBulletinChange(idx, 'api_match_id', e.target.value)}
                                         className="w-full bg-slate-950 border border-slate-700/50 text-cyan-400 px-2 py-2 rounded outline-none focus:border-indigo-500 font-bold tracking-widest text-[10px]"
                                       >
                                         <option value="">
                                            {apiMatchesList.length > 0 ? '-- LİSTEDEN SEÇ --' : '-- ÖNCE RADARA BAS --'}
                                         </option>
                                         {apiMatchesList.map(apiM => (
                                             <option key={`api-${m.match_index}-${apiM.fixture.id}`} value={apiM.fixture.id}>
                                                 {new Date(apiM.fixture.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} | {apiM.teams.home.name} vs {apiM.teams.away.name}
                                             </option>
                                         ))}
                                       </select>

                                       <button
                                          onClick={(e) => {
                                             e.preventDefault();
                                             fetchApiMatchesForDate(m.match_date);
                                          }}
                                          disabled={isApiLoading}
                                          title="Maçları Çek"
                                          className="bg-cyan-950 hover:bg-cyan-800 text-cyan-400 px-3 py-2 rounded shadow transition-colors border border-cyan-700/50 flex items-center justify-center shrink-0"
                                       >
                                          {isApiLoading ? '⏳' : '📡'}
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>

                <button 
                  onClick={saveBulletinToDB} 
                  disabled={isPublishing} 
                  className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] flex justify-center items-center gap-2 text-lg"
                >
                   {isPublishing ? 'MÜHÜRLENİYOR...' : '🚀 BÜLTENİ ONAYLA VE YAYINLA'}
                </button>
             </div>
          </div>
        )}

        {/* 🚀 TAHMİNLER DURUM PANELİ 🚀 */}
        {activeTab === 'predictions' && userRole === 'master' && (
           <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                 <h2 className="text-xl font-black text-emerald-400">📊 TAHMİNLER (CANLI DURUM)</h2>
                 <select value={selectedPredictionWeek} onChange={e => setSelectedPredictionWeek(Number(e.target.value))} className="bg-emerald-950 text-emerald-400 font-bold px-3 py-1 rounded outline-none border border-emerald-700/50 cursor-pointer">
                    {[...Array(34)].map((_, i) => <option key={`pw-${i+5}`} value={i+5}>{i+5}. HAFTA</option>)}
                 </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-rose-400 font-black mb-3 pb-2 border-b border-rose-900/50 tracking-widest flex items-center justify-between">
                       <span>EKSİKLER</span>
                       <span className="bg-rose-950 px-2 py-0.5 rounded text-xs">{missingPlayers.length} KİŞİ</span>
                    </h3>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                       {missingPlayers.map(id => <div key={id} className="text-[11px] font-bold text-slate-400 py-1.5 border-b border-slate-800/50 uppercase">{mergedPlayers[id]}</div>)}
                    </div>
                 </div>
                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-emerald-400 font-black mb-3 pb-2 border-b border-emerald-900/50 tracking-widest flex items-center justify-between">
                       <span>GİRENLER</span>
                       <span className="bg-emerald-950 px-2 py-0.5 rounded text-xs">{submittedPlayers.length} KİŞİ</span>
                    </h3>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                       {submittedPlayers.map(id => <div key={id} className="text-[11px] font-bold text-emerald-500/70 py-1.5 border-b border-slate-800/50 uppercase">{mergedPlayers[id]}</div>)}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* 🚀 YARIŞMACI YÖNETİMİ ODASI 🚀 */}
        {activeTab === 'players' && userRole === 'master' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-fuchsia-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">👥</span> YARIŞMACI YÖNETİMİ
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Buradan eklediğiniz veya sildiğiniz yarışmacılar listelere anında yansır.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                 <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-fuchsia-400 flex items-center gap-2">
                       <span className="text-xl">➕</span> YENİ ASLAN PARÇASI EKLE
                    </h2>
                 </div>

                 <form onSubmit={handleAddNewPlayer} className="flex flex-col gap-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">6 HANELİ YARIŞMACI ID</label>
                       <input 
                         type="text" 
                         value={newPlayerId} 
                         onChange={e => setNewPlayerId(e.target.value)} 
                         placeholder="Örn: 262888"
                         maxLength={6}
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-fuchsia-500 font-black tracking-widest shadow-inner placeholder:text-slate-600"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">İSİM SOYİSİM</label>
                       <input 
                         type="text" 
                         value={newPlayerName} 
                         onChange={e => setNewPlayerName(e.target.value)} 
                         placeholder="Örn: SİNAN ENGİN"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-fuchsia-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">GİRİŞ ŞİFRESİ</label>
                       <input 
                         type="text" 
                         value={newPlayerPass} 
                         onChange={e => setNewPlayerPass(e.target.value)} 
                         placeholder="Örn: 19030"
                         className="w-full bg-slate-950 border border-slate-700 text-amber-400 px-4 py-3 rounded-xl outline-none focus:border-fuchsia-500 font-black tracking-widest shadow-inner placeholder:text-slate-600"
                       />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPlayerLoading}
                      className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-700 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(192,38,211,0.4)] flex justify-center items-center gap-2"
                    >
                      {isPlayerLoading ? 'KAYDEDİLİYOR...' : 'SİSTEME KAYDET VE DAHİL ET'}
                    </button>
                 </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-rose-500 flex items-center gap-2">
                       <span className="text-xl">⚖️</span> DİSİPLİN KURULU (TÜM LİSTE)
                    </h2>
                    <span className="bg-slate-950 text-slate-400 px-3 py-1 rounded-lg text-xs font-bold border border-slate-800">
                       {dbPlayersList.length + Object.keys(staticPlayersList).length} Toplam Aktif
                    </span>
                 </div>

                 <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {dbPlayersList.map(p => (
                      <div key={`dyn-${p.id}`} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
                         <div className="flex flex-col">
                            <span className="font-black text-fuchsia-400 text-sm uppercase tracking-wide flex items-center gap-2">
                               {p.name} <span className="text-[8px] bg-fuchsia-950/50 border border-fuchsia-500/30 px-1.5 py-0.5 rounded text-fuchsia-300">YENİ</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest mt-0.5">ID: {p.username} | ŞİFRE: {p.password}</span>
                         </div>
                         <button 
                           onClick={() => handleBanishPlayer(p.username, p.name)}
                           className="bg-rose-950/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 hover:border-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all shadow-[0_0_10px_rgba(225,29,72,0.1)] hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                         >
                           ❌ İHRAÇ ET
                         </button>
                      </div>
                    ))}

                    {Object.keys(staticPlayersList).map(id => (
                      <div key={`static-${id}`} className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
                         <div className="flex flex-col">
                            <span className="font-black text-slate-300 text-sm uppercase tracking-wide">{staticPlayersList[id]}</span>
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest mt-0.5">ID: {id}</span>
                         </div>
                         <button 
                           onClick={() => handleBanishPlayer(id, staticPlayersList[id])}
                           className="bg-rose-950/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 hover:border-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all shadow-[0_0_10px_rgba(225,29,72,0.1)] hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] opacity-80 hover:opacity-100"
                         >
                           ❌ İHRAÇ ET
                         </button>
                      </div>
                    ))}
                 </div>
              </div>

            </div>
          </div>
        )}

        {/* 🚀 TAKIM LOJİSTİK VE TRANSFER MERKEZİ 🚀 */}
        {activeTab === 'teams' && userRole === 'master' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-cyan-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">🛡️</span> LOJİSTİK VE TRANSFER MERKEZİ
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Karargaha yepyeni bir lig veya takım ekleyebilir, mevcut takımları ait oldukları lige kaydırabilirsiniz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">YENİ KAYIT</div>
                 <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-cyan-400 flex items-center gap-2">
                       <span className="text-xl">➕</span> YENİ TAKIM VE LİG OLUŞTUR
                    </h2>
                 </div>

                 <form onSubmit={handleAddLocalTeam} className="flex flex-col gap-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">TAKIMIN TAM ADI</label>
                       <input 
                         type="text" 
                         value={newTeamName} 
                         onChange={e => setNewTeamName(e.target.value)} 
                         placeholder="Örn: RIVER PLATE"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">LİGİ / KATEGORİSİ</label>
                       <input 
                         type="text" 
                         list="leagueOptions"
                         value={newTeamLeague} 
                         onChange={e => setNewTeamLeague(e.target.value)} 
                         placeholder="Örn: ARJANTİN LİGİ"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                       <p className="text-[10px] text-slate-500 mt-2 ml-1 leading-relaxed">
                          Yazdığınız ligin adında <strong className="text-red-400">Türkiye, TFF, PTT, Amatör, 2.Lig</strong> vs. geçiyorsa maçın puanları otomatik <strong className="text-red-400">TFF</strong> kasasına gider. Geçmiyorsa otomatik <strong className="text-blue-400">DFO</strong> kasasına gider!
                       </p>
                    </div>

                    <button 
                      type="submit" 
                      className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] flex justify-center items-center gap-2"
                    >
                      BÜLTENLERE KAYDET
                    </button>
                 </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">EDİTLEME</div>
                 <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                       <span className="text-xl">🔄</span> BİRLİK KAYDIRMA (TRANSFER)
                    </h2>
                 </div>

                 <form onSubmit={handleMoveTeam} className="flex flex-col gap-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">TAŞINACAK TAKIM (MEVCUT)</label>
                       <select 
                         value={editTeamName} 
                         onChange={e => setEditTeamName(e.target.value)} 
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-bold uppercase shadow-inner"
                       >
                         <option value="">-- BİR TAKIM SEÇİN --</option>
                         {getAllTeamsFlatList().map(t => <option key={`move-${t}`} value={t}>{t}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">GİDECEĞİ YENİ LİG (HEDEF)</label>
                       <input 
                         type="text" 
                         list="leagueOptions"
                         value={editTargetLeague} 
                         onChange={e => setEditTargetLeague(e.target.value)} 
                         placeholder="Örn: HOLLANDA EREDIVISIE"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                       <p className="text-[10px] text-slate-500 mt-2 ml-1 leading-relaxed">
                          Takımı eski liginden siler ve yazdığınız yeni lige kalıcı olarak taşır. Çeşitli Avrupa klasörünü boşaltmak için kullanabilirsiniz.
                       </p>
                    </div>

                    <button 
                      type="submit" 
                      className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2"
                    >
                      TAKIMI TRANSFER ET (TAŞI)
                    </button>
                 </form>
              </div>

            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
               <h2 className="text-lg font-black text-slate-400 mb-4 border-b border-slate-800 pb-4 flex items-center gap-2">
                  <span className="text-xl">📋</span> KARARGAH LİG VE TAKIM ENVANTERİ
               </h2>
               <div className="max-h-[600px] overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2">
                  {Object.keys(dynamicLigHavuzu).sort((a,b) => a.localeCompare(b, 'tr')).map(ligAdi => (
                     <div key={ligAdi} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800/50 pb-2">
                           <h3 className="text-sm font-black text-amber-500 tracking-widest uppercase">{ligAdi}</h3>
                           <span className="bg-amber-950 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">{dynamicLigHavuzu[ligAdi].length} Takım</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {dynamicLigHavuzu[ligAdi].length === 0 ? (
                              <span className="text-slate-600 text-xs italic">Bu birlikte şu an asker yok.</span>
                           ) : (
                              dynamicLigHavuzu[ligAdi].map(takim => (
                                 <span key={`${ligAdi}-${takim}`} className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold text-slate-300 uppercase shadow-sm">
                                    {takim}
                                 </span>
                              ))
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <datalist id="leagueOptions">
               {Object.keys(dynamicLigHavuzu).sort((a,b) => a.localeCompare(b, 'tr')).map(lg => <option key={`dl-${lg}`} value={lg} />)}
            </datalist>
// ZIRH TESTI UYANDIRMASASAsdfsf
          </div>
        )}



      </div>
    </div>
  );
}