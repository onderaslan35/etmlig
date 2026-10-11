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

// 🔥 ÖZEL İZOLASYON: İSRAİL HARİÇ UEFA ULUSLAR LİGİ MİLLİ TAKIM HAVUZU 🔥
const UEFA_ULUSLAR_LIGI_HAVUZU = [
  "ALMANYA", "ANDORRA", "ARNAVUTLUK", "AVUSTURYA", "AZERBAYCAN", "BELARUS", "BELÇİKA", 
  "BOSNA-HERSEK", "BULGARİSTAN", "CEBELİTARIK", "ÇEKYA", "DANİMARKA", "ERMENİSTAN", 
  "ESTONYA", "FAROE ADALARI", "FİNLANDİYA", "FRANSA", "GALLER", "GÜRCİSTAN", 
  "HIRVATİSTAN", "HOLLANDA", "İNGİLTERE", "İRLANDA", "İSKOÇYA", "İSPANYA", "İSVEÇ", 
  "İSVİÇRE", "İTALYA", "İZLANDA", "KARADAĞ", "KAZAKİSTAN", "KIBRIS", 
  "KOSOVA", "K. İRLANDA", "KUZEY MAKEDONYA", "LETONYA", "LİHTENŞTAYN", "LİTVANYA", 
  "LÜKSEMBURG", "MACARİSTAN", "MALTA", "MOLDOVA", "NORVEÇ", "POLONYA", "PORTEKİZ", 
  "ROMANYA", "SAN MARİNO", "SIRBİSTAN", "SLOVAKYA", "SLOVENYA", "TÜRKİYE", "UKRAYNA", "YUNANİSTAN"
].sort((a, b) => a.localeCompare(b, 'tr'));

// 🏆 KOMUTANIN ÖZEL LİG SEÇENEKLERİ (ÜLKE FİLTRELİ VE KESİN EŞLEŞMELİ) 🏆
const POPULER_LIG_SECENEKLERI = [
  { id: 'superlig', ad: '🇹🇷 Süper Lig', apiAd: 'Süper Lig', country: 'Turkey' },
  { id: 'tff1', ad: '🇹🇷 1. Lig', apiAd: '1. Lig', country: 'Turkey' },
  { id: 'premier', ad: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier Lig', apiAd: 'Premier League', country: 'England' },
  { id: 'laliga', ad: '🇪🇸 La Liga', apiAd: 'La Liga', country: 'Spain' },
  { id: 'seriea', ad: '🇮🇹 Serie A', apiAd: 'Serie A', country: 'Italy' },
  { id: 'bundesliga', ad: '🇩🇪 Bundesliga', apiAd: 'Bundesliga', country: 'Germany' },
  { id: 'ligue1', ad: '🇫🇷 Ligue 1', apiAd: 'Ligue 1', country: 'France' },
  { id: 'eredivisie', ad: '🇳🇱 Eredivisie', apiAd: 'Eredivisie', country: 'Netherlands' },
  { id: 'primeira', ad: '🇵🇹 Primeira Liga', apiAd: 'Primeira Liga', country: 'Portugal' },
  { id: 'ucl', ad: '⭐ Şampiyonlar L.', apiAd: 'UEFA Champions League', country: 'World' },
  { id: 'uel', ad: '🟠 Avrupa L.', apiAd: 'UEFA Europa League', country: 'World' },
  { id: 'uecl', ad: '🟢 Konferans L.', apiAd: 'UEFA Europa Conference League', country: 'World' },
  { id: 'unl', ad: '🌍 Uluslar L.', apiAd: 'UEFA Nations League', country: 'World' }
];

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
  const [isAutoMatching, setIsAutoMatching] = useState<boolean>(false); 

  // 🔥 YENİ SİSTEM BÜLTEN DEĞİŞKENLERİ 🔥
  const [apiHavuz, setApiHavuz] = useState<any[]>([]);
  
  // ⚡ SABİT SLOT DEĞİŞİKLİĞİ: secilenMaclar artık her zaman 24 elemanlı (boşsa null) bir dizi olacak! ⚡
  const [secilenMaclar, setSecilenMaclar] = useState<any[]>(Array(24).fill(null));
  
  const [isHavuzLoading, setIsHavuzLoading] = useState(false);

  // 🎯 YENİ SİSTEM: TARİH VE SAAT FİLTRELERİ 🎯
  const [havuzBaslangicTarihi, setHavuzBaslangicTarihi] = useState('');
  const [havuzBitisTarihi, setHavuzBitisTarihi] = useState('');
  const [havuzBaslangicSaati, setHavuzBaslangicSaati] = useState('15:00'); 
  const [havuzBitisSaati, setHavuzBitisSaati] = useState('23:59');

  // 🏆 YENİ SİSTEM: LİG FİLTRELERİ 🏆
  const [seciliLigFiltreleri, setSeciliLigFiltreleri] = useState<string[]>([]);
  const [ozelLigFiltresi, setOzelLigFiltresi] = useState('');

  const toggleLigFiltresi = (id: string) => {
     if (seciliLigFiltreleri.includes(id)) {
         setSeciliLigFiltreleri(prev => prev.filter(l => l !== id));
     } else {
         setSeciliLigFiltreleri(prev => [...prev, id]);
     }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'live') {
      const apiRadar = setInterval(async () => {
        try {
          await fetch('/api/canli-skor'); 
          console.log("30 saniyelik uydu taraması yapıldı.");
        } catch (e) {
          console.log("Radar hatası:", e);
        }
      }, 30000); 

      return () => clearInterval(apiRadar);
    }
  }, [isAuthenticated, activeTab]);

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

  const [skorcuStatusMap, setSkorcuStatusMap] = useState<Record<string, boolean>>({});
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(false);

  const [selectedLiveWeek, setSelectedLiveWeek] = useState<number>(0); 
  const [liveWeekOptions, setLiveWeekOptions] = useState<number[]>([]);
  const [systemActiveWeek, setSystemActiveWeek] = useState<number>(0);

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

  const [bulletinWeek, setBulletinWeek] = useState<number>(0); 
  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>(generateWeekDates(6));
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const [selectedPredictionWeek, setSelectedPredictionWeek] = useState<number>(0);
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
    return Array.from(new Set([...base, ...defaultCategoriesList, "UEFA ULUSLAR LİGİ"])).sort((a,b) => a.localeCompare(b, 'tr'));
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
                
                if (selectedLiveWeek === 0) setSelectedLiveWeek(targetWeek);
                if (bulletinWeek === 0) setBulletinWeek(targetWeek);
                if (selectedPredictionWeek === 0) setSelectedPredictionWeek(targetWeek);
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
    if (!isAuthenticated || selectedLiveWeek === 0) return;

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
    if (!isAuthenticated || userRole !== 'master' || bulletinWeek === 0) return;
    const loadBulletinData = async () => {
      const newDates = generateWeekDates(bulletinWeek);
      setCurrentWeekDates(newDates);

      if (newDates && newDates.length > 0) {
         setHavuzBaslangicTarihi(newDates[0]); 
         setHavuzBitisTarihi(newDates[newDates.length > 2 ? 2 : newDates.length - 1]); 
      }

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

          // 🔥 SABİT SLOT SİSTEMİ: DB'den gelenleri kendi numarasına (index'ine) oturtuyoruz 🔥
          const loadedSecilen = Array(24).fill(null);
          data.forEach(m => {
              loadedSecilen[m.match_index - 1] = {
                  fixture_id: m.api_match_id || `temp-${m.match_index}`,
                  home_team: m.home_team,
                  away_team: m.away_team,
                  date: m.match_date,
                  time: m.match_time,
                  category: m.category,
                  league_name: m.category
              };
          });
          setSecilenMaclar(loadedSecilen);

        } else {
          setBulletinMatches(Array.from({ length: 24 }, (_, i) => ({
            match_index: i + 1, category: '', match_date: newDates[0], match_time: '21:00', home_team: '', away_team: '', api_match_id: ''
          })));
          setSecilenMaclar(Array(24).fill(null)); 
        }
        setApiHavuz([]); 
      }
    };
    loadBulletinData();
  }, [bulletinWeek, activeTab, isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'master' || selectedPredictionWeek === 0) return;
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

  const normalizeTeamName = (name: string) => {
    if (!name) return "";
    let normalized = name.toLocaleLowerCase('tr-TR')
      .replace(/fc|sk|club|united|city|as|spor|aş|a\.ş\.|k\.|\./g, '')
      .replace(/[çc]/g, 'c')
      .replace(/[ğg]/g, 'g')
      .replace(/[şs]/g, 's')
      .replace(/[öo]/g, 'o')
      .replace(/[üu]/g, 'u')
      .replace(/[ıiî]/g, 'i')
      .replace(/[^a-z0-9]/g, '')
      .trim();

    const dictionary: Record<string, string> = {
      "kibris": "cyprus", "kibrisrumkesimi": "cyprus", "kuzeyirlanda": "northernireland", "kirlanda": "northernireland",
      "turkiye": "turkey", "almanya": "germany", "ispanya": "spain", "fransa": "france", "ingiltere": "england",
      "italya": "italy", "hollanda": "netherlands", "belcika": "belgium", "portekiz": "portugal", "iskocya": "scotland",
      "galler": "wales", "hirvatistan": "croatia", "isvicre": "switzerland", "isvec": "sweden", "yunanistan": "greece",
      "cekya": "czechrepublic", "cekhumhuriyeti": "czechrepublic", "macaristan": "hungary", "polonya": "poland",
      "avusturya": "austria", "danimarka": "denmark", "sirbistan": "serbia", "romanya": "romania", "norvec": "norway",
      "ukrayna": "ukraine", "bulgaristan": "bulgaria", "gurcistan": "georgia", "kuzeymakedonya": "northmacedonia",
      "arnavutluk": "albania", "karadag": "montenegro", "izlanda": "iceland", "irlanda": "ireland", "republicofireland": "ireland",
      "finlandiya": "finland", "bosnahersek": "bosnia", "ermenistan": "armenia", "azerbaycan": "azerbaijan",
      "litvanya": "lithuania", "letonya": "latvia", "estonya": "estonia", "moldova": "moldova", "kazakistan": "kazakhstan",
      "faroeadalari": "faroeislands", "luksemburg": "luxembourg", "cebelitarik": "gibraltar", "sanmarino": "sanmarino",
      "andorra": "andorra", "lihtenstayn": "liechtenstein", "slovakya": "slovakia", "slovenya": "slovenia", "belarus": "belarus",
      "kizilyildiz": "crvenazvezda", "redstar": "crvenazvezda"
    };

    return dictionary[normalized] || normalized;
  };

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

      let confirmMsg = matchId === 24 
          ? `DİKKAT: 24. Maç (Son Maç) onaylanacak!\nBu maçın normal puanları dağıtılacak ve haftanın liderlerine +3 Bonus kalıcı olarak eklenecek.\nOnaylıyor musunuz?`
          : `Bu maçın skorunu onaylayıp puanları dağıtmak istediğinize emin misiniz?\n(Sistem Bu Maçı ${leagueName} Olarak Algıladı)`;

      if (!window.confirm(confirmMsg)) return;

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
                            const mRow = stData.find((r: any) => r.league_type === 'MASTER');
                            if (mRow) await supabase.from('standings').update({ points: mRow.points + 3 }).eq('id', mRow.id);
                        }
                    }
                    alert(`🎁 24. MAÇ İŞLEMİ TAMAM! (Haftanın liderlerine +3 puan MASTER kasasına kalıcı eklendi!)`);
                }
            } else {
               alert(`✅ 24. MAÇ İŞLEMİ TAMAM! (Beraberlik olduğu için kimseye bonus verilmedi)`);
            }
      }

      try {
        await supabase.from('live_matches').upsert({ 
           id: uniqueId, home_score: homeScore, away_score: awayScore, status: 'FINISHED',
           updated_by: userRole, updated_at: timeString 
        }, { onConflict: 'id' });

        if (currentWinners.length > 0) {
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
              const lRow = stData.find((r: any) => r.league_type === leagueName);
              if (lRow) await supabase.from('standings').update({ points: lRow.points + displayPoints }).eq('id', lRow.id);
              else await supabase.from('standings').insert({ user_id: userId, user_name: winnerName, league_type: leagueName, points: displayPoints });

              const mRow = stData.find((r: any) => r.league_type === 'MASTER');
              if (mRow) await supabase.from('standings').update({ points: mRow.points + displayPoints }).eq('id', mRow.id);
              else await supabase.from('standings').insert({ user_id: userId, user_name: winnerName, league_type: 'MASTER', points: displayPoints });
            }
          }
          if (matchId !== 24) alert(`✅ MAÇ İŞLEMİ BAŞARILI! Çift fiş kesildi ve kasaya eklendi.`);
        } else {
          if (matchId !== 24) alert("✅ Maç başarıyla BİTİRİLDİ. Normal skoru bilen çıkmadığı için kasa kapalı.");
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

  const handleBulkSilentLive = async () => {
    const todayMatches = displayedMatches.filter(m => m.match_date === getTodayDateString());
    
    if (todayMatches.length === 0) {
        alert("⚠️ Bugün oynanacak herhangi bir maç bulunamadı!");
        return;
    }

    const confirmBulk = window.confirm(`DİKKAT: Bugün oynanacak olan tam ${todayMatches.length} maç, otomatik radar (API) tarafından çekilebilsin diye arka planda SESSİZCE canlı sistemine kilitlenecek.\n\nSkorlar "0-0" YERİNE "-" (tire) olarak girecek, böylece kimseye SAHTE PUAN (spoiler) dağıtılmayacak.\n\nOnaylıyor musun Komutanım?`);
    
    if (!confirmBulk) return;

    try {
        const nowTime = new Date();
        const timeString = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}:${String(nowTime.getSeconds()).padStart(2, '0')}`;
        
        const bulkPayload = todayMatches.map(m => {
            const uniqueId = getUniqueMatchId(selectedLiveWeek, m.match_index);
            return {
                id: uniqueId,
                home_score: '-',
                away_score: '-',
                status: 'NOT_STARTED',
                updated_by: 'MASTER_OTO',
                updated_at: timeString
            };
        });

        const { error } = await supabase.from('live_matches').upsert(bulkPayload, { onConflict: 'id' });
        
        if (error) throw error;
        
        alert(`✅ MÜKEMMEL OPERASYON!\nBugünün ${todayMatches.length} maçı Karargah sistemine SESSİZCE kilitlendi.\nArtık tek yapman gereken API radarının saatleri geldiğinde maçları otomatik güncellemesini izlemek.`);
        
    } catch (e: any) {
        alert("❌ Toplu aktarım sırasında hata: " + e.message);
    }
  };

  const getAvailableTeams = (currentIndex: number, isHome: boolean) => {
    const currentMatch = bulletinMatches[currentIndex];
    const currentCat = currentMatch.category ? currentMatch.category.toUpperCase() : '';
    const opponent = isHome ? currentMatch.away_team : currentMatch.home_team;

    if (!currentCat) return [];

    let havuz: string[] = [];

    if (currentCat === "UEFA ULUSLAR LİGİ") {
       havuz = [...UEFA_ULUSLAR_LIGI_HAVUZU];
    } else {
       havuz = dynamicLigHavuzu[currentCat] || [];
       if (!havuz || currentCat.includes("KUPA") || currentCat.includes("CUP") || currentCat.includes("Ş.L.") || currentCat.includes("A.L.") || currentCat.includes("K.L.")) {
          havuz = Object.values(dynamicLigHavuzu).flat();
       }
    }

    const fullHavuz = Array.from(new Set([...havuz]));
    const usedTeams = new Set<string>();

    bulletinMatches.forEach((m, idx) => {
       if (idx === currentIndex) return; 
       const mCat = m.category ? m.category.toUpperCase() : '';
       if (currentCat === mCat) {
           if (m.home_team) usedTeams.add(m.home_team.toUpperCase());
           if (m.away_team) usedTeams.add(m.away_team.toUpperCase());
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

  // 🎯 YENİ SİSTEM: TARİH, SAAT VE LİG FİLTRELİ UYDU ÇEKİMİ (KESİN EŞLEŞME) 🎯
  const fetchHaftalikHavuz = async () => {
    setIsHavuzLoading(true);
    let havuzTemp: any[] = [];
    try {
        const startIndex = currentWeekDates.indexOf(havuzBaslangicTarihi);
        const endIndex = currentWeekDates.indexOf(havuzBitisTarihi);
        
        let datesToFetch = currentWeekDates;
        if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
            datesToFetch = currentWeekDates.slice(startIndex, endIndex + 1);
        } else if (startIndex !== -1 && endIndex !== -1 && startIndex > endIndex) {
            alert("❌ HATA: Bitiş tarihi, başlangıç tarihinden önce olamaz komutanım!");
            setIsHavuzLoading(false);
            return;
        }

        for (const dateStr of datesToFetch) {
            let formattedDate = dateStr;
            if (formattedDate.includes('.')) {
                const parts = formattedDate.split('.');
                formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${formattedDate}`, {
                headers: {
                    'x-apisports-key': '933e5ccc09194d0db30171e2bca20ca9',
                    'x-rapidapi-host': 'v3.football.api-sports.io'
                }
            });
            const data = await res.json();
            if (data.response && data.response.length > 0) {
                const mapped = data.response.map((fix: any) => {
                    const d = new Date(fix.fixture.date);
                    return {
                        fixture_id: fix.fixture.id,
                        home_team: fix.teams.home.name,
                        away_team: fix.teams.away.name,
                        date: dateStr,
                        time: d.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}),
                        league_name: fix.league.name,
                        country: fix.league.country, // 🔥 Ülke Verisi Eklendi
                        category: fix.league.name
                    };
                });
                havuzTemp = [...havuzTemp, ...mapped];
            }
        }
        
        // 1. SAAT FİLTRESİ UYGULA
        havuzTemp = havuzTemp.filter(mac => {
            return mac.time >= havuzBaslangicSaati && mac.time <= havuzBitisSaati;
        });

        // 2. KESİN LİG FİLTRESİ UYGULA (Ülke + Lig Adı Tam Eşleşme)
        if (seciliLigFiltreleri.length > 0 || ozelLigFiltresi.trim() !== '') {
            havuzTemp = havuzTemp.filter(mac => {
                const matchLeague = mac.league_name.toLowerCase();
                const matchCountry = (mac.country || '').toLowerCase();
                
                // Popüler liglerden biri seçiliyse KESİN kontrol et
                const matchesPopuler = seciliLigFiltreleri.length > 0 
                    ? seciliLigFiltreleri.some(filterId => {
                        const fObj = POPULER_LIG_SECENEKLERI.find(f => f.id === filterId);
                        if(!fObj) return false;
                        
                        // Tam Eşleşme (Lig adı ve Ülkesi)
                        const isLeagueMatch = matchLeague === fObj.apiAd.toLowerCase();
                        const isCountryMatch = fObj.country === 'World' ? true : matchCountry === fObj.country.toLowerCase();
                        
                        return isLeagueMatch && isCountryMatch;
                    })
                    : false;
                
                // Özel kutuya bir şey yazıldıysa kontrol et (includes ile esnek bırakıldı ki kolay bulunsun)
                const matchesOzel = ozelLigFiltresi.trim() !== '' 
                    ? matchLeague.includes(ozelLigFiltresi.toLowerCase()) || matchCountry.includes(ozelLigFiltresi.toLowerCase())
                    : false;
                
                return matchesPopuler || matchesOzel;
            });
        }

        // SIRALAMA: Önce Tarih, Sonra Saat
        havuzTemp.sort((a,b) => {
            if (a.date !== b.date) {
                const dA = parseDateLocal(a.date).getTime();
                const dB = parseDateLocal(b.date).getTime();
                return dA - dB;
            }
            return a.time.localeCompare(b.time);
        });

        setApiHavuz(havuzTemp);
        
        if(havuzTemp.length > 0) alert(`✅ Mükemmel Daraltma! Okyanustan tam isabet ${havuzTemp.length} adet maç çekildi.`);
        else alert("⚠️ Belirttiğin tarih, saat ve lig kalkanından hiçbir maç geçemedi. Başka ligler seçebilirsin.");
    } catch (error: any) {
        console.error(error);
        alert("API Hatası: " + error.message);
    } finally {
        setIsHavuzLoading(false);
    }
  };

  // 🔥 SABİT SLOT MANTIĞI: Listeden çıkarılan maçın yeri boş kalır (null), yeni eklenen maç o boşluğa dolar! 🔥
  const toggleHavuzMac = (mac: any) => {
    const newSecilen = [...secilenMaclar];
    const existingIndex = newSecilen.findIndex(m => m && m.fixture_id === mac.fixture_id);
    
    if (existingIndex !== -1) {
        // Zaten listede var, çıkar ve yerini boş (null) bırak ki alttakiler yukarı kaymasın!
        newSecilen[existingIndex] = null;
        setSecilenMaclar(newSecilen);
    } else {
        // Listede yok, YENİ MAÇ EKLENECEK. İlk boş (null) koltuğu bul.
        const emptyIndex = newSecilen.findIndex(m => m === null);
        if (emptyIndex !== -1) {
            newSecilen[emptyIndex] = { ...mac };
            setSecilenMaclar(newSecilen);
        } else {
            alert("⚠️ Başkomutanım, 24 maçlık kapasite doldu! Önce listeden bir maçı çıkararak yer açın.");
        }
    }
  };

  const bulteniPatlat = async () => {
    // 24 slotun hepsi dolu mu diye bakıyoruz
    const selectedCount = secilenMaclar.filter(m => m !== null).length;

    if (selectedCount !== 24) {
      if(!window.confirm(`Bülten henüz 24 maça ulaşmadı! Şu an sadece ${selectedCount} maç var. Boş slotlar silinerek MÜHÜRLEMEK istiyor musun?`)) return;
    }

    setIsPublishing(true);
    try {
      const payload = secilenMaclar.map((m, idx) => {
         if (!m) return null; // Boş slotları geçiyoruz (veritabanında o index boş kalacak)
         return {
             week_num: bulletinWeek, 
             match_index: idx + 1, 
             category: m.category || m.league_name || '', 
             match_date: m.date, 
             match_time: m.time,
             home_team: String(m.home_team).trim().toUpperCase(), 
             away_team: String(m.away_team).trim().toUpperCase(),
             api_match_id: m.fixture_id && !String(m.fixture_id).startsWith('temp-') ? parseInt(String(m.fixture_id)) : null 
         };
      }).filter(m => m !== null);

      const { error } = await supabase.from('matches_bulletin').upsert(payload, { onConflict: 'week_num,match_index' });
      if (error) throw error;
      
      const liveMatchesPayload = secilenMaclar
         .filter(m => m !== null && m.fixture_id && !String(m.fixture_id).startsWith('temp-'))
         .map((m, idx) => ({
             id: getUniqueMatchId(bulletinWeek, idx + 1), 
             api_match_id: parseInt(String(m.fixture_id)) 
         }));

      if (liveMatchesPayload.length > 0) {
          await supabase.from('live_matches').upsert(liveMatchesPayload, { onConflict: 'id' });
      }

      alert(`✅ MÜKEMMEL! ${bulletinWeek}. Hafta Bülteni mühürlendi!\n\nSeçilen maçlar otomatik olarak Canlı Sisteme kilitlendi!`);
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
            {/* Canlı Yönetim Kodları Değişmedi... */}
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

            {/* 🔥 Liderlik Radarı ve Tüm Canlı Ekranı Burada yer alıyor (Değişmedi) 🔥 */}
            <div className="w-full text-center py-10 bg-slate-900/30 border border-slate-800/50 rounded-2xl mt-2">
               <span className="text-3xl mb-2 block opacity-50">📡</span>
               <p className="text-slate-400 text-sm font-medium tracking-widest">SABİT SLOT SİSTEMİ DEVREDE! LÜTFEN BÜLTEN SEKMESİNE GEÇİN.</p>
            </div>
          </div>
        )}

        {/* 🚀 YENİ NESİL BÜLTEN ÜRETİM FABRİKASI (MANUEL HEDEFLEME + FİLTRELİ + SABİT SLOT) 🚀 */}
        {activeTab === 'bulletin' && userRole === 'master' && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black text-indigo-400 flex items-center gap-2">
                    <span className="text-2xl">🏭</span> BÜLTEN FABRİKASI <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-1 rounded border border-indigo-500 ml-2">(SABİT SLOT SİSTEMİ)</span>
                </h2>
                <div className="flex items-center gap-3">
                   <select value={bulletinWeek} onChange={e => setBulletinWeek(Number(e.target.value))} className="bg-indigo-950 text-indigo-300 font-bold px-3 py-1 rounded outline-none border border-indigo-700/50 cursor-pointer">
                      {[...Array(92)].map((_, i) => <option key={`bw-${i+5}`} value={i+5}>{i+5}. HAFTA</option>)}
                   </select>
                </div>
             </div>

             <div className="flex flex-col xl:flex-row gap-6">
                {/* SOL PANEL: API HAVUZU VE FİLTRELER */}
                <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl flex flex-col h-[85vh]">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-2 gap-3">
                        <h3 className="font-black text-cyan-400 flex items-center gap-2"><span className="text-lg">📡</span> UYDU MAÇ HAVUZU</h3>
                    </div>

                    {/* 🎯 RADAR FİLTRELERİ 🎯 */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-3 flex flex-col gap-2 shadow-inner">
                       <div className="text-[10px] font-black tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                          <span>⚙️</span> API RADAR FİLTRELERİ (Kesin Eşleşme - Tam İsabet)
                       </div>
                       
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase">İlk Gün</label>
                             <select value={havuzBaslangicTarihi} onChange={e=>setHavuzBaslangicTarihi(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-cyan-400 text-[11px] p-2 rounded outline-none font-bold">
                                {currentWeekDates.map(d=><option key={`start-${d}`} value={d}>{d}</option>)}
                             </select>
                          </div>
                          <div className="flex flex-col gap-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Son Gün</label>
                             <select value={havuzBitisTarihi} onChange={e=>setHavuzBitisTarihi(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-cyan-400 text-[11px] p-2 rounded outline-none font-bold">
                                {currentWeekDates.map(d=><option key={`end-${d}`} value={d}>{d}</option>)}
                             </select>
                          </div>
                          <div className="flex flex-col gap-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Hangi Saatten İtibaren?</label>
                             <input type="time" value={havuzBaslangicSaati} onChange={e=>setHavuzBaslangicSaati(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-amber-500 text-[11px] p-2 rounded outline-none font-bold cursor-pointer" />
                          </div>
                          <div className="flex flex-col gap-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Hangi Saate Kadar?</label>
                             <input type="time" value={havuzBitisSaati} onChange={e=>setHavuzBitisSaati(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-amber-500 text-[11px] p-2 rounded outline-none font-bold cursor-pointer" />
                          </div>
                       </div>

                       {/* 🏆 KOMUTANIN LİG SEÇİM KALKANI (TAM EŞLEŞME) 🏆 */}
                       <div className="mt-3 border-t border-slate-800 pt-3">
                          <label className="text-[10px] font-bold text-emerald-400 uppercase mb-2 block tracking-widest">🏆 HIZLI LİG FİLTRELERİ <span className="text-slate-500 font-normal">(Boş bırakırsanız tüm dünyayı çeker)</span></label>
                          <div className="flex flex-wrap gap-2">
                             {POPULER_LIG_SECENEKLERI.map(lig => {
                                const isActive = seciliLigFiltreleri.includes(lig.id);
                                return (
                                   <button
                                      key={lig.id}
                                      onClick={() => toggleLigFiltresi(lig.id)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all border ${
                                         isActive 
                                         ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                                         : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
                                      }`}
                                   >
                                      {lig.ad}
                                   </button>
                                )
                             })}
                          </div>
                          
                          <div className="flex flex-col gap-1 mt-3">
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Veya Menüde Olmayan Özel Lig Yazın (Örn: Eredivisie, Saudi Pro League)</label>
                             <input 
                                type="text" 
                                value={ozelLigFiltresi} 
                                onChange={e => setOzelLigFiltresi(e.target.value)} 
                                placeholder="Lig veya ülke adını buraya yazarak arat..."
                                className="w-full sm:w-1/2 bg-slate-900 border border-slate-700 text-cyan-400 text-[11px] p-2 rounded outline-none font-bold placeholder:text-slate-600"
                             />
                          </div>
                       </div>
                    </div>

                    <button
                        onClick={fetchHaftalikHavuz}
                        disabled={isHavuzLoading}
                        className="bg-cyan-700 hover:bg-cyan-600 disabled:bg-slate-700 text-white font-black tracking-widest text-xs px-5 py-3 rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all flex items-center gap-2 w-full justify-center mb-3"
                    >
                        {isHavuzLoading ? (
                            <>⏳ UYDU TARANIYOR VE FİLTRELENİYOR...</>
                        ) : (
                            <>🛰️ FİLTREYE UYGUN MAÇLARI ÇEK</>
                        )}
                    </button>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {apiHavuz.length === 0 && !isHavuzLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                                <span className="text-6xl mb-4">📡</span>
                                <span className="text-sm font-bold tracking-widest text-center">HAVUZ BOŞ.<br/>YUKARIDAKİ FİLTRELERİ AYARLAYIP "ÇEK" BUTONUNA BASIN.</span>
                            </div>
                        )}
                        {apiHavuz.map(mac => {
                            const isSelected = secilenMaclar.some(m => m && m.fixture_id === mac.fixture_id);
                            const secimSirasi = secilenMaclar.findIndex(m => m && m.fixture_id === mac.fixture_id) + 1;
                            return (
                                <div
                                    key={`havuz-${mac.fixture_id}`}
                                    onClick={() => toggleHavuzMac(mac)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                                        isSelected
                                            ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                            : 'bg-slate-950 border-slate-700 hover:border-cyan-500 hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-black text-sm shadow-inner transition-colors ${isSelected ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-800 text-slate-400'}`}>
                                            {isSelected ? secimSirasi : '+'}
                                        </div>
                                        <div>
                                            <div className={`font-black text-sm uppercase ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {mac.home_team} - {mac.away_team}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5">
                                                <span className="text-cyan-500">{mac.date}</span> | <span className="text-amber-500">{mac.time}</span> | <span className="text-fuchsia-400">{mac.country} - {mac.league_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* SAĞ PANEL: SEÇİLENLER (BÜLTEN) */}
                <div className="w-full xl:w-[500px] bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl flex flex-col h-[85vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-indigo-400 flex items-center gap-2"><span className="text-lg">📝</span> HEDEF BÜLTEN</h3>
                        <div className="text-2xl font-black bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                            {/* 🔥 Sabit slotlarda dolu olanları sayıyoruz 🔥 */}
                            <span className={secilenMaclar.filter(m => m !== null).length === 24 ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "text-amber-500"}>
                                {secilenMaclar.filter(m => m !== null).length}
                            </span>
                            <span className="text-slate-600"> / 24</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 mb-4">
                        {secilenMaclar.map((mac, idx) => {
                            // EĞER SLOT BOŞSA
                            if (!mac) {
                                return (
                                    <div key={`secilen-bos-${idx}`} className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 border-dashed flex items-center gap-3">
                                        <span className="bg-slate-900 text-slate-500 border border-slate-700 font-black text-xs w-6 h-6 flex items-center justify-center rounded">{idx + 1}</span>
                                        <span className="text-slate-500 font-bold text-xs italic">BOŞ KONTENJAN - SOL HAVUZDAN MAÇ SEÇİN</span>
                                    </div>
                                );
                            }

                            // EĞER SLOT DOLUYSA
                            return (
                                <div key={`secilen-${idx}`} className="bg-slate-950 p-2.5 rounded-lg border border-indigo-900/50 flex flex-col gap-2 relative group hover:border-indigo-500 transition-colors">
                                    <button
                                        onClick={() => {
                                            const newSecilen = [...secilenMaclar];
                                            newSecilen[idx] = null; // Listeden tamamen silmek yerine slotu BOŞALT (null yap)
                                            setSecilenMaclar(newSecilen);
                                        }}
                                        className="absolute top-2 right-2 text-rose-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-950/50 rounded-full w-6 h-6 flex items-center justify-center font-bold"
                                        title="Listeden Çıkar (Boşalt)"
                                    >
                                        ✖
                                    </button>
                                    <div className="flex items-center gap-2 pr-8">
                                        <span className="bg-indigo-950 text-indigo-400 border border-indigo-500/50 font-black text-xs w-6 h-6 flex items-center justify-center rounded">{idx + 1}</span>
                                        <span className="text-white font-bold text-xs uppercase truncate">{mac.home_team} - {mac.away_team}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pl-8">
                                        <select
                                            value={mac.category}
                                            onChange={(e) => {
                                                const newSecilen = [...secilenMaclar];
                                                newSecilen[idx].category = e.target.value;
                                                setSecilenMaclar(newSecilen);
                                            }}
                                            className={`bg-slate-900 border text-[10px] px-2 py-1.5 rounded outline-none font-bold flex-1 ${mac.category ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'}`}
                                        >
                                            <option value="">-- KATEGORİSİNİ SEÇİN (ZORUNLU) --</option>
                                            {getDynamicCategories().map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value={mac.league_name}>{mac.league_name} (UYDU ORİJİNAL)</option>
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={bulteniPatlat}
                        disabled={isPublishing}
                        className={`w-full py-4 rounded-xl font-black text-lg tracking-widest uppercase transition-all flex justify-center items-center gap-2 ${
                            secilenMaclar.filter(m => m !== null).length === 24 && !isPublishing
                                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:scale-[1.02] active:scale-95 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-pointer'
                        }`}
                    >
                        {isPublishing ? 'MÜHÜRLENİYOR...' : '🚀 BÜLTENİ PATLAT VE KAYDET'}
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* Diğer Tablar (Değişmedi) */}
      </div>
    </div>
  );
}