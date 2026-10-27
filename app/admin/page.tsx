'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/utils/supabase';
import {
  staticPlayersList,
  getTodayDateString,
  parseDateLocal,
  generateTimeOptions,
  getUniqueMatchId,
  isTffMatchCheck,
  getMatchTimeMs,
  getEliteTheme
} from '@/utils/themeEngine';

const timeOptionsArr = generateTimeOptions();

// 🔥 KOMUTANIN İSTEDİĞİ DEV LİG LİSTESİ (HEM RADARDA HEM MANUELDE GÖRÜNECEK) 🔥
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
  { id: 'austria', ad: '🇦🇹 Avusturya Bundes.', apiAd: 'Bundesliga', country: 'Austria' },
  { id: 'belgium', ad: '🇧🇪 Belçika Pro Lig', apiAd: 'Jupiler Pro League', country: 'Belgium' },
  { id: 'bulgaria', ad: '🇧🇬 Bulgaristan 1. Lig', apiAd: 'First League', country: 'Bulgaria' },
  { id: 'greece', ad: '🇬🇷 Yunanistan S.L', apiAd: 'Super League 1', country: 'Greece' },
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
  const [userRole, setUserRole] = useState<'master' | 'skorcum01' | 'skorcum06' | 'skorcum34' | 'skorcumlevent' | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  // 🔥 TAHMİNLER VE LOJİSTİK/TRANSFER SEKMELERİ SİLİNDİ 🔥
  const [activeTab, setActiveTab] = useState<'live' | 'bulletin' | 'players'>('live');
  const [mergedPlayers, setMergedPlayers] = useState<Record<string, string>>(staticPlayersList);

  const [dbPlayersList, setDbPlayersList] = useState<any[]>([]);
  const [newPlayerId, setNewPlayerId] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPass, setNewPlayerPass] = useState('');
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  // 🔥 BOMBOŞ BİR HAVUZ (Takımlar eklendikçe buraya dolacak) 🔥
  const [dynamicLigHavuzu, setDynamicLigHavuzu] = useState<Record<string, string[]>>({});

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const previousScoresRef = useRef<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isManualFetching, setIsManualFetching] = useState(false);
  const [apiLimitRemaining, setApiLimitRemaining] = useState<number | string>('...');

  const [apiHavuz, setApiHavuz] = useState<any[]>([]);
  const [secilenMaclar, setSecilenMaclar] = useState<any[]>(Array(24).fill(null));
  const [isHavuzLoading, setIsHavuzLoading] = useState(false);

  const [havuzBaslangicTarihi, setHavuzBaslangicTarihi] = useState('');
  const [havuzBitisTarihi, setHavuzBitisTarihi] = useState('');
  const [havuzBaslangicSaati, setHavuzBaslangicSaati] = useState('15:00'); 
  const [havuzBitisSaati, setHavuzBitisSaati] = useState('23:59');

  const [seciliLigFiltreleri, setSeciliLigFiltreleri] = useState<string[]>([]);
  const [ozelLigFiltresi, setOzelLigFiltresi] = useState('');

  // 🔥 MANUEL MAÇ EKLENTİSİ İÇİN STATE'LER 🔥
  const [manuelEv, setManuelEv] = useState('');
  const [manuelDep, setManuelDep] = useState('');
  const [manuelLig, setManuelLig] = useState('');
  const [manuelTarih, setManuelTarih] = useState('');
  const [manuelSaat, setManuelSaat] = useState('21:00');

  const [skorcuStatusMap, setSkorcuStatusMap] = useState<Record<string, boolean>>({});
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(false);

  const [selectedLiveWeek, setSelectedLiveWeek] = useState<number>(0); 
  const [liveWeekOptions, setLiveWeekOptions] = useState<number[]>([]);
  const [systemActiveWeek, setSystemActiveWeek] = useState<number>(0);

  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [adminScores, setAdminScores] = useState<Record<number, { home: string, away: string }>>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [distributedMatches, setDistributedMatches] = useState<{ [key: number]: boolean }>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, string[]>>({}); 
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<number, any>>({}); 

  const [bulletinWeek, setBulletinWeek] = useState<number>(0); 
  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  useEffect(() => {
    setAdminScores({});
    setLiveMatchesDB([]);
    setLiveInfoStateMap({});
  }, [selectedLiveWeek]);

  useEffect(() => {
      // 8 günlük liste varsa ve manuel tarih henüz seçilmediyse bugünü (1. index) otomatik seç
      if (currentWeekDates.length > 1 && !manuelTarih) {
          setManuelTarih(currentWeekDates[1]);
      } else if (currentWeekDates.length > 0 && !manuelTarih) {
          setManuelTarih(currentWeekDates[0]);
      }
  }, [currentWeekDates]);

  const toggleLigFiltresi = (id: string) => {
     if (seciliLigFiltreleri.includes(id)) {
         setSeciliLigFiltreleri(prev => prev.filter(l => l !== id));
     } else {
         setSeciliLigFiltreleri(prev => [...prev, id]);
     }
  };

  const checkApiLimit = async () => {
      try {
          const res = await fetch('https://v3.football.api-sports.io/status', {
              headers: {
                  'x-apisports-key': '933e5ccc09194d0db30171e2bca20ca9',
                  'x-rapidapi-host': 'v3.football.api-sports.io'
              }
          });
          const data = await res.json();
          if (data.response && data.response.subscription) {
              const current = data.response.requests.current;
              const limit = data.response.requests.limit_day;
              setApiLimitRemaining(limit - current);
          } else {
              setApiLimitRemaining('?');
          }
      } catch (e) {
          console.error("Limit kontrol hatası:", e);
          setApiLimitRemaining('?');
      }
  };

  useEffect(() => {
      if (isAuthenticated && activeTab === 'live') {
          checkApiLimit();
      }
  }, [isAuthenticated, activeTab]);

  // 🔥 AVCI MOTORLU API ÇEKİMİ (Orjinal Yapı Korunarak) 🔥
  const handleManualApiFetch = async () => {
     setIsManualFetching(true);
     try {
        const todayStr = getTodayDateString();
        const bugununBultenMaclari = liveMatchesDB.filter(m => m.match_date === todayStr);

        if (bugununBultenMaclari.length === 0) {
           alert(`⚠️ Bültende BUGÜN (${todayStr}) oynanacak hiçbir maç yok!`);
           setIsManualFetching(false);
           return;
        }

        let formattedDate = todayStr;
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
        
        if (data.errors && Object.keys(data.errors).length > 0) {
           alert("❌ API HATASI: " + JSON.stringify(data.errors));
           setIsManualFetching(false);
           return;
        }

        if (!data.response || data.response.length === 0) {
           alert(`⚠️ Uydu bugün için boş yanıt verdi. Maç verisine ulaşılamadı.`);
           setIsManualFetching(false);
           return;
        }

        const allFixtures = data.response;
        const nowTime = new Date();
        const timeString = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}:${String(nowTime.getSeconds()).padStart(2, '0')}`;

        const updates = [];
        const bulletinUpdates = [];

        for (const bultenMaci of bugununBultenMaclari) {
            let fixtureId = bultenMaci.api_match_id;
            let fix = null;
            
            if (fixtureId && !String(fixtureId).startsWith('manuel-')) {
                fix = allFixtures.find((f: any) => f.fixture.id == fixtureId);
            } else {
                // AVCI MOTORU DEVREDE
                const hName = String(bultenMaci.home_team).trim().toUpperCase();
                const aName = String(bultenMaci.away_team).trim().toUpperCase();

                fix = allFixtures.find((f: any) => {
                    const apiHome = String(f.teams.home.name).trim().toUpperCase();
                    const apiAway = String(f.teams.away.name).trim().toUpperCase();
                    return apiHome === hName && apiAway === aName;
                });

                if (fix) {
                    fixtureId = fix.fixture.id;
                    bulletinUpdates.push({
                        week_num: selectedLiveWeek,
                        match_index: bultenMaci.match_index,
                        api_match_id: fixtureId
                    });
                }
            }

            if (fix) {
                const uniqueId = getUniqueMatchId(selectedLiveWeek, bultenMaci.match_index);
                
                let homeScore = fix.goals.home !== null ? String(fix.goals.home) : '-';
                let awayScore = fix.goals.away !== null ? String(fix.goals.away) : '-';
                let status = fix.fixture.status.short; 
                
                const currentDbMatch = liveInfoStateMap[bultenMaci.match_index];
                const isAlreadyFinished = currentDbMatch?.status === 'FINISHED';

                if (['1H', '2H', 'ET', 'P', 'LIVE'].includes(status)) status = 'LIVE';
                else if (status === 'HT') status = 'HT';
                else if (['FT', 'AET', 'PEN', 'FINISHED'].includes(status)) {
                    status = isAlreadyFinished ? 'FINISHED' : 'WAITING_APPROVAL';
                }

                updates.push({
                   id: uniqueId,
                   api_match_id: fixtureId,
                   home_score: homeScore,
                   away_score: awayScore,
                   status: status,
                   updated_by: 'MASTER_RADAR',
                   updated_at: timeString,
                   events: JSON.stringify(fix.events || []),
                   elapsed: fix.fixture.status.elapsed
                });
            }
        }

        if (bulletinUpdates.length > 0) {
           for(const bu of bulletinUpdates) {
              await supabase.from('matches_bulletin').update({ api_match_id: bu.api_match_id }).eq('week_num', bu.week_num).eq('match_index', bu.match_index);
              await supabase.from('live_matches').update({ api_match_id: bu.api_match_id }).eq('id', getUniqueMatchId(bu.week_num, bu.match_index));
           }
        }

        if (updates.length > 0) {
            const { error } = await supabase.from('live_matches').upsert(updates, { onConflict: 'id' });
            if (error) {
                alert("❌ Supabase güncellenirken hata: " + error.message);
            } else {
                alert(`✅ Ultra Radar ve Avcı Motoru Başarılı! Ekranda BUGÜN oynanan ${updates.length} adet maçın verisi Karargaha işlendi.`);
                setTimeout(() => { checkApiLimit(); }, 1500); 
            }
        } else {
            alert("⚠️ Veriler çekildi ancak bugünün maçları için güncel bir değişiklik veya eşleşme bulunamadı.");
        }

     } catch (e) {
        console.log("Radar hatası:", e);
        alert("❌ Uydu bağlantı hatası!");
     } finally {
        setIsManualFetching(false);
     }
  };

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const auth = sessionStorage.getItem('admin_auth');
       const role = sessionStorage.getItem('admin_role') as any;
       if (auth === 'true' && role) {
          setIsAuthenticated(true);
          setUserRole(role);
          if (role.startsWith('skorcum')) setShowOnlyToday(true);
       }

       // 🔥 ARTIK LIG HAVUZU BOS BASLATILIYOR VE ESKİ VERİLER VARSA ALINIYOR 🔥
       const savedHavuz = localStorage.getItem('ekmel_lig_havuzu');
       if (savedHavuz) {
           setDynamicLigHavuzu(JSON.parse(savedHavuz));
       } else {
           setDynamicLigHavuzu({}); 
       }
    }
  }, []);

  const updateLigHavuzu = (newHavuz: Record<string, string[]>) => {
    setDynamicLigHavuzu(newHavuz);
    localStorage.setItem('ekmel_lig_havuzu', JSON.stringify(newHavuz));
  };

  const getDynamicCategories = () => {
    const base = Object.keys(dynamicLigHavuzu);
    const defaults = POPULER_LIG_SECENEKLERI.map(l => l.apiAd.toUpperCase());
    return Array.from(new Set([...base, ...defaults, "TÜRKİYE KUPASI"])).sort((a,b) => a.localeCompare(b, 'tr'));
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
    
    const cleanUsername = usernameInput.toLowerCase().trim();
    const cleanPassword = passwordInput.trim();

    if (cleanUsername === 'mankoman' && cleanPassword === '24351324Yurt.') {
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
       'skorcum34': '343434',
       'skorcumlevent': '190706'
    };

    if (validSkorcular[cleanUsername]) {
       if (cleanPassword === validSkorcular[cleanUsername]) {
          try {
             const { data } = await supabase.from('skorcu_auth').select('is_active').eq('username', cleanUsername).single();
             if (data && data.is_active === false) {
                 alert("❌ YETKİLERİNİZ DONDURULDU!\nSistemden uzaklaştırıldınız. Lütfen Genelkurmay ile iletişime geçin.");
                 return;
             }
          } catch(err) {}

          setIsAuthenticated(true);
          setUserRole(cleanUsername as any);
          sessionStorage.setItem('admin_auth', 'true');
          sessionStorage.setItem('admin_role', cleanUsername);
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

  // 🔥 8 GÜNLÜK (DÜN + BUGÜN + 6 GÜN İLERİSİ) AKILLI TARİH MOTORU 🔥
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'master' || bulletinWeek === 0) return;
    const loadBulletinData = async () => {
      if (activeTab === 'bulletin') {
        const { data } = await supabase.from('matches_bulletin').select('*').eq('week_num', bulletinWeek).order('match_index', { ascending: true });

        const existingMatches = data || [];
        
        const dateSet = new Set<string>();
        
        existingMatches.forEach(m => {
            if (m.match_date) dateSet.add(m.match_date);
        });
        
        // Dünden başlayarak 8 gün ileriye tarihleri oluştur
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() - 1); // 1 gün öncesi (dün)
        
        for (let i = 0; i < 8; i++) { // toplam 8 gün (dün, bugün + 6 gün)
            const d = new Date(baseDate);
            d.setDate(d.getDate() + i);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            dateSet.add(`${dd}.${mm}.${yyyy}`);
        }

        const newDates = Array.from(dateSet).sort((a, b) => parseDateLocal(a).getTime() - parseDateLocal(b).getTime());
        setCurrentWeekDates(newDates);

        if (newDates.length > 1) {
           setHavuzBaslangicTarihi(newDates[1]); // Bugünü varsayılan yap
           setHavuzBitisTarihi(newDates[newDates.length - 1]); 
        }

        if (existingMatches.length > 0) {
          const loadedSecilen = Array(24).fill(null);
          existingMatches.forEach(m => {
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
          setSecilenMaclar(Array(24).fill(null)); 
        }
        setApiHavuz([]); 
      }
    };
    loadBulletinData();
  }, [bulletinWeek, activeTab, isAuthenticated, userRole]);

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
            
            if (data.errors && Object.keys(data.errors).length > 0) {
                alert("❌ API UYARISI: " + JSON.stringify(data.errors) + "\n\n(Günlük 100 limitiniz bitmiş olabilir!)");
                setIsHavuzLoading(false);
                return;
            }

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
                        country: fix.league.country,
                        category: fix.league.name
                    };
                });
                havuzTemp = [...havuzTemp, ...mapped];
            }
        }
        
        havuzTemp = havuzTemp.filter(mac => {
            return mac.time >= havuzBaslangicSaati && mac.time <= havuzBitisSaati;
        });

        if (seciliLigFiltreleri.length > 0 || ozelLigFiltresi.trim() !== '') {
            havuzTemp = havuzTemp.filter(mac => {
                const matchLeague = mac.league_name.toLowerCase();
                const matchCountry = (mac.country || '').toLowerCase();
                
                const matchesPopuler = seciliLigFiltreleri.length > 0 
                    ? seciliLigFiltreleri.some(filterId => {
                        const fObj = POPULER_LIG_SECENEKLERI.find(f => f.id === filterId);
                        if(!fObj) return false;
                        
                        const isLeagueMatch = matchLeague === fObj.apiAd.toLowerCase();
                        const isCountryMatch = fObj.country === 'World' ? true : matchCountry === fObj.country.toLowerCase();
                        
                        return isLeagueMatch && isCountryMatch;
                    })
                    : false;
                
                const matchesOzel = ozelLigFiltresi.trim() !== '' 
                    ? matchLeague.includes(ozelLigFiltresi.toLowerCase()) || matchCountry.includes(ozelLigFiltresi.toLowerCase())
                    : false;
                
                return matchesPopuler || matchesOzel;
            });
        }

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

  const toggleHavuzMac = (mac: any) => {
    const newSecilen = [...secilenMaclar];
    const existingIndex = newSecilen.findIndex(m => m && m.fixture_id === mac.fixture_id);
    
    if (existingIndex !== -1) {
        newSecilen[existingIndex] = null;
        setSecilenMaclar(newSecilen);
    } else {
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
    const selectedCount = secilenMaclar.filter(m => m !== null).length;

    if (selectedCount !== 24) {
      if(!window.confirm(`Bülten henüz 24 maça ulaşmadı! Şu an sadece ${selectedCount} maç var. Boş slotlar silinerek MÜHÜRLEMEK istiyor musun?`)) return;
    }

    setIsPublishing(true);
    try {
      const payload = secilenMaclar.map((m, idx) => {
         if (!m) return null; 
         return {
             week_num: bulletinWeek, 
             match_index: idx + 1, 
             category: m.category || m.league_name || '', 
             match_date: m.date, 
             match_time: m.time,
             home_team: String(m.home_team).trim().toUpperCase(), 
             away_team: String(m.away_team).trim().toUpperCase(),
             api_match_id: m.fixture_id && !String(m.fixture_id).startsWith('temp-') && !String(m.fixture_id).startsWith('manuel-') ? parseInt(String(m.fixture_id)) : null 
         };
      }).filter(m => m !== null);

      const { error } = await supabase.from('matches_bulletin').upsert(payload, { onConflict: 'week_num,match_index' });
      if (error) throw error;
      
      const liveMatchesPayload = secilenMaclar
         .filter(m => m !== null && m.fixture_id && !String(m.fixture_id).startsWith('temp-') && !String(m.fixture_id).startsWith('manuel-'))
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

  // 🔥 YENİ ZAMAN YOLCULUĞU MANUEL EKLEME VE OTO-KAYIT MOTORU 🔥
  const handleManuelMacEkle = (e: React.FormEvent) => {
      e.preventDefault();
      if(!manuelEv || !manuelDep || !manuelLig || !manuelTarih) {
          alert("Lütfen Ev Sahibi, Deplasman ve Kategori alanlarını boş bırakmayın!"); return;
      }
      const emptyIndex = secilenMaclar.findIndex(m => m === null);
      if (emptyIndex === -1) {
          alert("Bülten kapasitesi (24 maç) tamamen dolu! Yer açmak için listeden maç çıkarın."); return;
      }
      
      const evName = manuelEv.trim().toUpperCase();
      const depName = manuelDep.trim().toUpperCase();
      const ligName = manuelLig.trim().toUpperCase();

      // Takımları arkaplandaki havuza (veri tabanına/hafızaya) otomatik işle
      const updatedHavuz = { ...dynamicLigHavuzu };
      if (!updatedHavuz[ligName]) updatedHavuz[ligName] = [];
      if (!updatedHavuz[ligName].includes(evName)) updatedHavuz[ligName].push(evName);
      if (!updatedHavuz[ligName].includes(depName)) updatedHavuz[ligName].push(depName);
      updatedHavuz[ligName].sort((a,b) => a.localeCompare(b, 'tr'));
      updateLigHavuzu(updatedHavuz);

      const newSecilen = [...secilenMaclar];
      newSecilen[emptyIndex] = {
          fixture_id: `manuel-${Date.now()}`,
          home_team: evName,
          away_team: depName,
          date: manuelTarih,
          time: manuelSaat,
          category: ligName,
          league_name: ligName
      };
      setSecilenMaclar(newSecilen);
      
      setManuelEv(''); setManuelDep('');
      alert(`✅ MAÇ EKLENDİ!\n\n${evName} - ${depName} bültene yerleştirildi ve takım havuzuna işlendi.\n"BÜLTENİ PATLAT" butonuna basmayı unutmayın.`);
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

  const getDynamicElapsed = (logInfo: any) => {
     if (!logInfo || logInfo.status !== 'LIVE' || !logInfo.updated_at || !logInfo.elapsed) return logInfo?.elapsed ? `${logInfo.elapsed}'` : 'Canlı';
     const parts = logInfo.updated_at.split(':');
     if (parts.length >= 2) {
         const upDate = new Date(now);
         upDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || '0', 10), 0);
         let diffMs = now - upDate.getTime();
         if (diffMs < -43200000) diffMs += 86400000; 
         const diffMins = Math.floor(Math.max(0, diffMs) / 60000);
         return `${parseInt(logInfo.elapsed, 10) + diffMins}'`;
     }
     return `${logInfo.elapsed}'`;
  };

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

        {/* 🔴 SEKME (TAB) MENÜSÜ GÜNCELLENDİ (Tahminler ve Lojistik silindi, Yarışmacılar kaldı) 🔴 */}
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
                 🛠️ BÜLTEN FABRİKASI
               </button>
               <button 
                 onClick={() => setActiveTab('players')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'players' ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 👥 YARIŞMACILAR
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
                        {['skorcum01', 'skorcum06', 'skorcum34', 'skorcumlevent'].map(sk => {
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

            {(userRole === 'master' || userRole?.startsWith('skorcum')) && (
              <div className="w-full flex flex-col sm:flex-row justify-center gap-4 mb-8 max-w-5xl mx-auto">
                  <button 
                      onClick={handleBulkSilentLive}
                      className="flex-1 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black text-sm sm:text-base px-4 py-4 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300/50 transition-all transform hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                      <span className="flex items-center gap-2"><span className="text-2xl animate-pulse">⚡</span> BÜTÜN MAÇLARI CANLIYA AL</span>
                      <span className="text-[10px] sm:text-xs text-amber-100 font-medium bg-black/30 px-3 py-1 rounded-full mt-1">Sessiz Mod: Puanlar gizlenir, spoiler engellenir.</span>
                  </button>

                  <button 
                      onClick={handleManualApiFetch}
                      disabled={isManualFetching}
                      className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-sm sm:text-base px-4 py-4 rounded-2xl shadow-[0_0_25px_rgba(79,70,229,0.6)] border border-blue-300/50 transition-all transform hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                      <span className="flex items-center gap-2">
                          <span className={`text-2xl ${isManualFetching ? 'animate-spin' : 'animate-pulse'}`}>📡</span> 
                          {isManualFetching ? 'UYDUYA BAĞLANILIYOR...' : `ULTRA MOD: BUGÜNÜ ÇEK (KALAN KONTÖR: ${apiLimitRemaining})`}
                      </span>
                      <span className="text-[10px] sm:text-xs text-blue-100 font-medium bg-black/30 px-3 py-1 rounded-full mt-1">Avcı Motoru devrededir, tüm manuel maçları otomatik bulur.</span>
                  </button>
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
                          {[...Array(92)].map((_, i) => <option key={`lw-${i+5}`} value={i+5}>{i+5}. HAFTA</option>)}
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
                let timerBadge = "BEKLİYOR";
                let badgeClass = "text-slate-300";
                if (logInfo?.status === 'FINISHED') { timerBadge = "BİTTİ (FT)"; badgeClass = "text-emerald-400"; }
                else if (logInfo?.status === 'HT') { timerBadge = "DEVRE ARASI"; badgeClass = "text-amber-400"; }
                else if (logInfo?.status === 'WAITING_APPROVAL') { timerBadge = "ONAY BEKLİYOR"; badgeClass = "text-blue-400 animate-pulse"; }
                else if (logInfo?.status === 'LIVE') { timerBadge = `🔴 CANLI (${getDynamicElapsed(logInfo)})`; badgeClass = "text-red-400 animate-pulse"; }

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
                            🏆 {match.category} - <span className={badgeClass}>{timerBadge}</span>
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
                              <select disabled={isLocked} value={homeScore} onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md disabled:opacity-80" style={{textAlignLast: 'center'}}>
                                {timeOptionsArr.map((_, i) => <option key={`h-${i}`} value={scoreOptions[i]}>{scoreOptions[i]}</option>)}
                              </select>
                              <span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span>
                              <select disabled={isLocked} value={awayScore} onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md disabled:opacity-80" style={{textAlignLast: 'center'}}>
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

                    {userRole === 'master' ? (
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
                    ) : (
                        <div className={`${theme.bottomBar} border-t px-4 py-3 w-full backdrop-blur-md z-10 relative flex flex-col items-center justify-center gap-1.5`}>
                           <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                              {isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI"}
                           </span>
                        </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* 🚀 BÜLTEN FABRİKASI (YENİ NESİL) 🚀 */}
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

                       <div className="mt-3 border-t border-slate-800 pt-3">
                          <label className="text-[10px] font-bold text-emerald-400 uppercase mb-2 block tracking-widest">🏆 DEV LİG FİLTRELERİ <span className="text-slate-500 font-normal">(Boş bırakırsanız tüm dünyayı çeker)</span></label>
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
                             <label className="text-[10px] font-bold text-slate-400 uppercase">Veya Menüde Olmayan Özel Lig Yazın (Örn: Saudi Pro League)</label>
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

                {/* 🔥 ORTA PANEL: MANUEL ZAMAN YOLCULUĞU (YENİ SİSTEM - YAZARAK EKLE, HAVUZA KAYDOLSUN) 🔥 */}
                <div className="w-full xl:w-[320px] bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl flex flex-col h-[85vh]">
                   <h3 className="font-black text-fuchsia-400 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                      <span className="text-xl">⏳</span> ZAMAN YOLCULUĞU
                   </h3>
                   
                   <form onSubmit={handleManuelMacEkle} className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                      
                      {/* 1. LİG SEÇİMİ VEYA YENİ YAZIM */}
                      <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">1. LİG / KATEGORİ SEÇİN (ZORUNLU)</label>
                         <select 
                           value={manuelLig} 
                           onChange={e => {
                              setManuelLig(e.target.value);
                              setManuelEv(''); // Lig değişince takımları sıfırla ki kullanıcı yeni bir şey yazsın
                              setManuelDep('');
                           }} 
                           className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-bold px-3 py-2 rounded-lg outline-none text-xs"
                         >
                            <option value="">-- LİG SEÇİN VEYA EN ALTTA YENİ LİG DİYİN --</option>
                            {/* POPULER LİGLER + EKLENMİŞ LİGLER */}
                            {Array.from(new Set([...POPULER_LIG_SECENEKLERI.map(l => l.apiAd.toUpperCase()), ...Object.keys(dynamicLigHavuzu)])).sort((a,b) => a.localeCompare(b, 'tr')).map(c => <option key={`manlig-${c}`} value={c}>{c}</option>)}
                         </select>
                      </div>

                      {/* 2. EV SAHİBİ (KLAVYE İLE YAZILACAK - OTOMATİK KAYDEDİLECEK) */}
                      <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">2. Ev Sahibi (API ile Aynı Olmalı)</label>
                         <input 
                           type="text" 
                           list="evSahibiList"
                           value={manuelEv} 
                           onChange={e=>setManuelEv(e.target.value.toUpperCase())} 
                           disabled={!manuelLig}
                           placeholder="Örn: GALATASARAY"
                           className="w-full bg-slate-950 border border-slate-700 text-fuchsia-400 font-black px-3 py-2 rounded-lg outline-none uppercase text-sm shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                         />
                         {/* Eğer havuzda bu ligde önceden kayıtlı takım varsa altta öneri olarak çıkar */}
                         <datalist id="evSahibiList">
                            {manuelLig && dynamicLigHavuzu[manuelLig] ? dynamicLigHavuzu[manuelLig].map(t => <option key={`ev-${t}`} value={t} />) : null}
                         </datalist>
                      </div>

                      {/* 3. DEPLASMAN (KLAVYE İLE YAZILACAK - OTOMATİK KAYDEDİLECEK) */}
                      <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">3. Deplasman (API ile Aynı Olmalı)</label>
                         <input 
                           type="text" 
                           list="depSahibiList"
                           value={manuelDep} 
                           onChange={e=>setManuelDep(e.target.value.toUpperCase())} 
                           disabled={!manuelLig}
                           placeholder="Örn: FENERBAHCE"
                           className="w-full bg-slate-950 border border-slate-700 text-fuchsia-400 font-black px-3 py-2 rounded-lg outline-none uppercase text-sm shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                         />
                         <datalist id="depSahibiList">
                            {manuelLig && dynamicLigHavuzu[manuelLig] ? dynamicLigHavuzu[manuelLig].map(t => <option key={`dep-${t}`} value={t} />) : null}
                         </datalist>
                      </div>

                      <div className="flex gap-2">
                         <div className="flex-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tarih</label>
                             <select value={manuelTarih} onChange={e=>setManuelTarih(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-slate-300 font-bold px-2 py-2 rounded-lg outline-none text-xs">
                                {currentWeekDates.map(d=><option key={`mandate-${d}`} value={d}>{d}</option>)}
                             </select>
                         </div>
                         <div className="flex-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Saat</label>
                             <input type="time" value={manuelSaat} onChange={e=>setManuelSaat(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-slate-300 font-bold px-2 py-2 rounded-lg outline-none text-xs" />
                         </div>
                      </div>

                      <button type="submit" className="mt-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-black tracking-widest text-xs px-4 py-4 rounded-xl shadow-[0_0_15px_rgba(192,38,211,0.5)] transition-all uppercase">
                         🚀 BÜLTENE YAPIŞTIR
                      </button>

                      <div className="mt-4 bg-fuchsia-950/30 p-3 rounded-lg border border-fuchsia-900/50">
                         <p className="text-[10px] text-fuchsia-300 leading-relaxed font-bold">
                            <span className="text-white">DİKKAT:</span> Kutucuklara yazdığınız takımlar anında havuzun hafızasına işlenir. Bir dahaki sefere klavye yerine listeden tıklayıp seçebilirsiniz!
                         </p>
                      </div>
                   </form>
                </div>

                {/* SAĞ PANEL: SEÇİLENLER (BÜLTEN) */}
                <div className="w-full xl:w-[400px] bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl flex flex-col h-[85vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-indigo-400 flex items-center gap-2"><span className="text-lg">📝</span> HEDEF BÜLTEN</h3>
                        <div className="text-xl font-black bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                            <span className={secilenMaclar.filter(m => m !== null).length === 24 ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "text-amber-500"}>
                                {secilenMaclar.filter(m => m !== null).length}
                            </span>
                            <span className="text-slate-600"> / 24</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 mb-4">
                        {secilenMaclar.map((mac, idx) => {
                            if (!mac) {
                                return (
                                    <div key={`secilen-bos-${idx}`} className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 border-dashed flex items-center gap-3">
                                        <span className="bg-slate-900 text-slate-500 border border-slate-700 font-black text-[10px] w-5 h-5 flex items-center justify-center rounded">{idx + 1}</span>
                                        <span className="text-slate-500 font-bold text-[10px] italic">BOŞ KONTENJAN</span>
                                    </div>
                                );
                            }

                            const isManuel = String(mac.fixture_id).startsWith('manuel-');

                            return (
                                <div key={`secilen-${idx}`} className={`bg-slate-950 p-2 rounded-lg border flex flex-col gap-2 relative group transition-colors ${isManuel ? 'border-fuchsia-900/50 hover:border-fuchsia-500' : 'border-indigo-900/50 hover:border-indigo-500'}`}>
                                    <button
                                        onClick={() => {
                                            const newSecilen = [...secilenMaclar];
                                            newSecilen[idx] = null; 
                                            setSecilenMaclar(newSecilen);
                                        }}
                                        className="absolute top-1 right-1 text-rose-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-950/50 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]"
                                        title="Listeden Çıkar"
                                    >
                                        ✖
                                    </button>
                                    <div className="flex items-center gap-2 pr-6">
                                        <span className={`font-black text-[10px] w-5 h-5 flex items-center justify-center rounded border ${isManuel ? 'bg-fuchsia-950 text-fuchsia-400 border-fuchsia-500/50' : 'bg-indigo-950 text-indigo-400 border-indigo-500/50'}`}>{idx + 1}</span>
                                        <div className="flex flex-col">
                                           <span className="text-white font-bold text-[10px] uppercase truncate">{mac.home_team} - {mac.away_team}</span>
                                           <span className="text-[8px] text-slate-400 tracking-widest">{mac.date} {mac.time} {isManuel && <span className="text-fuchsia-500 ml-1">(MANUEL)</span>}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pl-7">
                                        <select
                                            value={mac.category}
                                            onChange={(e) => {
                                                const newSecilen = [...secilenMaclar];
                                                newSecilen[idx].category = e.target.value;
                                                setSecilenMaclar(newSecilen);
                                            }}
                                            className={`bg-slate-900 border text-[9px] px-2 py-1 rounded outline-none font-bold flex-1 ${mac.category ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'}`}
                                        >
                                            <option value="">-- KATEGORİ SEÇ (ZORUNLU) --</option>
                                            {Array.from(new Set([...POPULER_LIG_SECENEKLERI.map(l => l.apiAd.toUpperCase()), ...Object.keys(dynamicLigHavuzu)])).sort((a,b) => a.localeCompare(b, 'tr')).map(c => <option key={`hedef-${c}`} value={c}>{c}</option>)}
                                            {mac.league_name && <option value={mac.league_name}>{mac.league_name} (ORİJİNAL)</option>}
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={bulteniPatlat}
                        disabled={isPublishing}
                        className={`w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all flex justify-center items-center gap-2 ${
                            secilenMaclar.filter(m => m !== null).length === 24 && !isPublishing
                                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:scale-[1.02] active:scale-95 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-pointer'
                        }`}
                    >
                        {isPublishing ? 'MÜHÜRLENİYOR...' : '🚀 PATLAT VE KAYDET'}
                    </button>
                </div>
             </div>
          </div>
        )}

        {/* 🚀 YARIŞMACI YÖNETİMİ ODASI (KORUNDU) 🚀 */}
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

      </div>
    </div>
  );
}