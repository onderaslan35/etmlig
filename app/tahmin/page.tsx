'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/utils/supabase';
import { 
  TEST_ACCOUNTS,
  staticPlayersList, 
  customWeekNames, 
  getWeekLabel, 
  getUniqueMatchId,
  isTffMatchCheck,
  getEliteTheme,
  cleanTeamName,
  getMatchTimeMs,
  normalizeTurkish
} from '@/utils/themeEngine';

export default function PredictionPortal() {
  const [view, setView] = useState<'lobby' | 'declaration' | 'entry' | 'tahminmatik'>('lobby');
  
  const [activeWeek, setActiveWeek] = useState<number>(5); 
  const [bulletin, setBulletin] = useState<any[]>([]);
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<number, any>>({});
  
  const [systemPlayers, setSystemPlayers] = useState<Record<string, string>>(staticPlayersList);
  const [skorcularList, setSkorcularList] = useState<string[]>([]);
  
  const [userIdInput, setUserIdInput] = useState<string>('');
  const [userPassInput, setUserPassInput] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null);
  
  const [predictions, setPredictions] = useState<string[]>(Array(24).fill('-'));
  const [tempScores, setTempScores] = useState<string[]>(Array(24).fill('-')); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [selectedEntryWeek, setSelectedEntryWeek] = useState<number>(0); 

  const [missingPlayers, setMissingPlayers] = useState<string[]>([]);
  const [submittedPlayers, setSubmittedPlayers] = useState<string[]>([]);
  
  const [bulletinMap, setBulletinMap] = useState<Record<number, any[]>>({}); 
  const [liveMatchStatus, setLiveMatchStatus] = useState<Record<number, { status: string, score: string }>>({});
  const [livePredictionsData, setLivePredictionsData] = useState<Record<number, Record<string, string[]>>>({});
  const [tahminmatikScores, setTahminmatikScores] = useState<Record<number, { home: string, away: string }>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortOrder, setSortOrder] = useState<'A-Z' | 'Z-A' | 'ZAMAN'>('A-Z'); 
  const [lobbyMissing, setLobbyMissing] = useState(0);
  const [lobbySubmitted, setLobbySubmitted] = useState(0);

  const scoreOptionsArr = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

  const getDisplayWeek = (week: number) => {
      if (week === 16) return "1, 2 VE 3 EKİM ÖZEL BÜLTENİ";
      if (week === 17) return "4, 5 VE 6 EKİM ÖZEL BÜLTENİ";
      return getWeekLabel(week);
  };

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
     const fetchSysData = async () => {
         const { data: dbPlayers } = await supabase.from('players').select('*');
         if (dbPlayers) {
             const merged = { ...staticPlayersList };
             dbPlayers.forEach((p: any) => { merged[String(p.username)] = p.name; });
             setSystemPlayers(merged);
         }

         const { data: skorcuAuthData } = await supabase.from('skorcu_auth').select('username');
         if (skorcuAuthData) {
             setSkorcularList(skorcuAuthData.map(r => r.username));
         }

         const { data: bData } = await supabase.from('matches_bulletin').select('week_num, match_index, category, match_date, match_time, home_team, away_team');
         if (bData) {
             const wSet = new Set<number>(bData.map(b => b.week_num));
             const wArray = Array.from(wSet).filter(w => w >= 5).sort((a,b) => a-b);
             setAvailableWeeks(wArray);
             
             const newMap: Record<number, any[]> = {};
             bData.forEach(row => {
                if(!newMap[row.week_num]) newMap[row.week_num] = [];
                newMap[row.week_num].push({
                   id: row.match_index,
                   weekLabel: `${getDisplayWeek(row.week_num)} - ${row.match_index}. MAÇ`,
                   category: row.category,
                   date: row.match_date,
                   time: row.match_time,
                   homeTeam: row.home_team,
                   awayTeam: row.away_team
                });
             });
             
             Object.keys(newMap).forEach(week => { newMap[Number(week)].sort((a,b) => a.id - b.id); });
             setBulletinMap(newMap);

             if (wArray.length > 0) {
                 const latest = Math.max(...wArray);
                 setActiveWeek(latest);
                 if (selectedEntryWeek === 0) {
                     setSelectedEntryWeek(latest);
                 }
             }
         }
     };
     fetchSysData();
  }, []);

  useEffect(() => {
     if (activeWeek === 0) return;
     const loadWeekData = async () => {
         const { data: bultenData } = await supabase.from('matches_bulletin').select('*').eq('week_num', activeWeek).order('match_index', { ascending: true });
         const currentBulten = bultenData || [];
         setBulletin(currentBulten);

         const idsToFetch = currentBulten.map(m => getUniqueMatchId(activeWeek, m.match_index));
         if (idsToFetch.length > 0) {
             const { data: liveData } = await supabase.from('live_matches').select('*').in('id', idsToFetch);
             const infoMap: Record<number, any> = {};
             if (liveData) {
                 liveData.forEach(l => {
                     const matchIndex = l.id % 100;
                     infoMap[matchIndex] = l;
                 });
             }
             setLiveInfoStateMap(infoMap);
         }
     };
     loadWeekData();

     const channel = supabase.channel('public:live_matches')
         .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_matches' }, payload => {
             loadWeekData();
         })
         .subscribe();

     return () => { supabase.removeChannel(channel); };
  }, [activeWeek]);

  useEffect(() => {
      if (selectedEntryWeek === 0 || Object.keys(systemPlayers).length === 0) return;

      const fetchPlayerStatus = async () => {
          const { data: preds } = await supabase
              .from('player_predictions')
              .select('user_id')
              .eq('week_num', selectedEntryWeek);

          const submittedUserIds = new Set((preds || []).map(p => String(p.user_id)));
          const allUserIds = Object.keys(systemPlayers).filter(id => id !== 'mankoman'); 
          
          const missingIds = allUserIds.filter(id => !submittedUserIds.has(id));
          const submittedIds = allUserIds.filter(id => submittedUserIds.has(id));
          
          const missingNames = missingIds.map(id => systemPlayers[id]).sort((a, b) => a.localeCompare(b, 'tr'));
          const submittedNames = submittedIds.map(id => systemPlayers[id]).sort((a, b) => a.localeCompare(b, 'tr'));
          
          setMissingPlayers(missingNames);
          setSubmittedPlayers(submittedNames);
      };

      fetchPlayerStatus();
  }, [selectedEntryWeek, systemPlayers, isModalOpen]); // isModalOpen eklendi ki tahmin yaptıktan sonra liste güncellensin

  useEffect(() => {
    const fetchLiveMatchStatuses = async () => {
      if (!selectedEntryWeek) return;
      const { data } = await supabase
        .from('live_matches')
        .select('id, status, home_score, away_score')
        .gte('id', selectedEntryWeek * 100)
        .lt('id', (selectedEntryWeek + 1) * 100);
      
      if (data) {
        const statusMap: Record<number, { status: string, score: string }> = {};
        data.forEach(m => {
          const matchIndex = m.id % 100;
          statusMap[matchIndex] = {
            status: m.status,
            score: `${m.home_score}-${m.away_score}`.replace(/\s+/g, '')
          };
        });
        setLiveMatchStatus(statusMap);
      }
    };
    
    if (view === 'declaration' || view === 'tahminmatik') {
      fetchLiveMatchStatuses();
    }
  }, [selectedEntryWeek, view]);

  useEffect(() => {
     const fetchLivePreds = async () => {
        if (!selectedEntryWeek) return;

        let allData: any[] = []; let from = 0; let step = 999; let keepFetching = true;
        while(keepFetching) {
            const { data } = await supabase.from('player_predictions').select('*').eq('week_num', selectedEntryWeek).range(from, from + step);
            if (data && data.length > 0) { allData = [...allData, ...data]; if (data.length <= step) keepFetching = false; else from += step + 1; } else { keepFetching = false; }
        }
        if (allData.length > 0) {
            const newData: Record<number, Record<string, string[]>> = {};
            allData.forEach(row => {
                const wk = row.week_num; const uid = String(row.user_id);
                if (uid === 'mankoman') return; 

                if(!newData[wk]) newData[wk] = {};
                if(!newData[wk][uid]) newData[wk][uid] = Array(24).fill('PAS');
                newData[wk][uid][row.match_index - 1] = row.predicted_score;
            });
            setLivePredictionsData(newData);
        } else { setLivePredictionsData({}); }
     };
     
     if (view === 'declaration' || view === 'tahminmatik') {
        fetchLivePreds();
     }
  }, [selectedEntryWeek, view]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdInput.trim() || !userPassInput.trim()) {
        alert("Lütfen ID ve Şifrenizi boş bırakmayın."); return;
    }
    if (selectedEntryWeek === 0) {
        alert("Lütfen giriş yapacağınız haftayı seçin!"); return;
    }

    if (userIdInput === 'mankoman' || skorcularList.includes(userIdInput)) {
        alert("❌ DİKKAT! Yönetim yetkisine sahip hesaplarla (Admin/Skorcu) tahmine girilemez!");
        return;
    }

    let isValid = false;
    let uName = "";

    if (TEST_ACCOUNTS[userIdInput]) {
        if (TEST_ACCOUNTS[userIdInput].pass === String(userPassInput).trim()) {
            isValid = true;
            uName = TEST_ACCOUNTS[userIdInput].name;
        }
    } 
    else {
        const { data: dbPlayers } = await supabase.from('players').select('*').eq('username', userIdInput).single();
        if (dbPlayers) {
            const dbPass = dbPlayers.password || dbPlayers.pass;
            if (String(dbPass).trim() === String(userPassInput).trim()) { 
                isValid = true; 
                uName = dbPlayers.name; 
            }
        }
    }

    if (isValid) {
        setSelectedUser({ id: userIdInput, name: uName });
        setActiveWeek(selectedEntryWeek); 
        
        const { data: userPreds } = await supabase.from('player_predictions').select('*').eq('week_num', selectedEntryWeek).eq('user_id', userIdInput);
        
        const initialPreds = Array(24).fill('-');
        if (userPreds && userPreds.length > 0) {
            userPreds.forEach(p => { initialPreds[p.match_index - 1] = p.predicted_score; });
        }
        setPredictions(initialPreds);
        setTempScores([...initialPreds]); 
        
        setIsModalOpen(true);
        setUserIdInput(''); setUserPassInput('');
    } else {
        alert("❌ Girdiğiniz ŞİFRE hatalıdır. Lütfen tekrar deneyin!");
    }
  };

  const handleScoreChange = (matchIndexZeroBased: number, value: string) => {
      const newScores = [...tempScores];
      newScores[matchIndexZeroBased] = value;
      setTempScores(newScores);
  };

  const handleTahminmatikChange = (matchId: number, type: 'home' | 'away', val: string) => { 
      setTahminmatikScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || { home: '-', away: '-' }), [type]: val } })); 
  };

  const handleSubmitPredictions = async () => {
     if (!selectedUser) return;
     
     let changedCount = 0;
     const updates: any[] = [];
     
     for (let i = 0; i < 24; i++) {
        if (tempScores[i] !== predictions[i]) {
            updates.push({
                user_id: selectedUser.id,
                week_num: activeWeek,
                match_index: i + 1,
                predicted_score: tempScores[i]
            });
            changedCount++;
        }
     }

     if (changedCount === 0) {
         alert("⚠️ Hiçbir değişiklik yapmadınız!");
         setIsModalOpen(false);
         return;
     }

     const confirmMsg = `DİKKAT: Toplam ${changedCount} adet maçta skor güncellediniz.\nBu seçimleriniz ${activeWeek}. Hafta için Karargaha kaydedilecektir.\nOnaylıyor musunuz?`;
     if (!window.confirm(confirmMsg)) return;

     setIsSubmitting(true);
     try {
         const { error } = await supabase.from('player_predictions').upsert(updates, { onConflict: 'user_id,week_num,match_index' });
         if (error) throw error;
         
         alert(`✅ TAHMİNLERİNİZ BAŞARIYLA KAYDEDİLDİ!\n(${changedCount} skor Karargaha işlendi)`);
         setIsModalOpen(false);
         setSelectedUser(null);
     } catch (e: any) {
         alert("❌ HATA OLUŞTU: " + e.message);
     } finally {
         setIsSubmitting(false);
     }
  };

  const finalPlayersList = useMemo(() => {
    let allIds = Object.keys(systemPlayers).filter(id => id !== 'mankoman');
    const selectedWeekData = livePredictionsData[selectedEntryWeek] || {};
    
    if (searchTerm) {
      const normalizedSearch = normalizeTurkish(searchTerm);
      allIds = allIds.filter(id => { const pName = normalizeTurkish(systemPlayers[id] || ""); return pName.includes(normalizedSearch); });
    }
    const submittedIds = allIds.filter(id => selectedWeekData[id] && selectedWeekData[id].some(s => s !== 'PAS' && s !== '-'));
    
    if (sortOrder === 'A-Z') { submittedIds.sort((a, b) => systemPlayers[a].localeCompare(systemPlayers[b], 'tr')); } 
    else if (sortOrder === 'Z-A') { submittedIds.sort((a, b) => systemPlayers[b].localeCompare(systemPlayers[a], 'tr')); }
    return submittedIds; 
  }, [searchTerm, sortOrder, selectedEntryWeek, livePredictionsData, systemPlayers]);

  const activePlayersForJPEG = useMemo(() => {
    const selectedWeekData = livePredictionsData[selectedEntryWeek] || {};
    return Object.keys(systemPlayers).filter(id => id !== 'mankoman' && selectedWeekData[id] && selectedWeekData[id].some(s => s !== 'PAS' && s !== '-')).sort((a, b) => systemPlayers[a].localeCompare(systemPlayers[b], 'tr'));
  }, [selectedEntryWeek, livePredictionsData, systemPlayers]);

  const toggleSortOrder = () => { if (sortOrder === 'A-Z') setSortOrder('Z-A'); else if (sortOrder === 'Z-A') setSortOrder('ZAMAN'); else setSortOrder('A-Z'); };
  const ghostColumns = Array.from({ length: 10 });

  const downloadJPEG = async () => {
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const htmlToImage = await import('html-to-image');
      const element = document.getElementById('jpeg-export-container');
      if (!element) throw new Error("Stüdyo elementi bulunamadı");
      const dataUrl = await htmlToImage.toJpeg(element, { quality: 0.95, backgroundColor: '#050b14', pixelRatio: 1.5 });
      const link = document.createElement("a"); link.download = `ETM_Lig_${selectedEntryWeek}_Hafta_Tahminler.jpg`; link.href = dataUrl;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (error: any) { alert("HATA: Fotoğraf motoru bir engele takıldı. Detay: " + error.message); }
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col items-center">
      {/* ARKA PLAN EFEKTLERİ */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10 flex flex-col items-center">
         
         {view === 'lobby' && (
           <>
             <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                   ETM LİGİ MERKEZ PORTALI
                </h1>
                <p className="text-amber-500 font-bold tracking-widest text-sm md:text-base">
                   Lütfen tahminlerinizi buradan yapın.
                </p>
                <div className="mt-6 animate-bounce">
                    <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(37,99,235,0.6)]">⬇️</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl items-stretch animate-fade-in-up">
                
                {/* 1. KÜP (ÜST SOL): GİRİŞ KUTUSU */}
                <div className="bg-[#0b1120] border border-amber-500/50 rounded-3xl p-8 relative flex flex-col justify-center items-center shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all h-[400px]">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-950 text-amber-400 px-6 py-1 rounded-full text-xs font-black tracking-widest border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.5)] whitespace-nowrap">
                      TAHMİNLER AÇIK (PARÇA KAYIT)
                   </div>
                   
                   <form onSubmit={handleAuth} className="w-full max-w-[280px] flex flex-col gap-5 mt-4">
                      <div className="flex flex-col items-center gap-2">
                         <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Giriş Yapılacak Hafta</span>
                         <select 
                           value={selectedEntryWeek} 
                           onChange={e => setSelectedEntryWeek(Number(e.target.value))}
                           className="w-full bg-slate-950 border border-slate-700 text-amber-400 text-sm font-black px-4 py-3 rounded-xl outline-none focus:border-amber-500 text-center tracking-widest cursor-pointer shadow-inner"
                         >
                           {availableWeeks.map(w => (
                               <option key={`opt-${w}`} value={w}>{customWeekNames[w] || `${w}. HAFTA`}</option>
                           ))}
                         </select>
                      </div>
                      
                      <input 
                         type="text" 
                         value={userIdInput} 
                         onChange={e => setUserIdInput(e.target.value)} 
                         className="w-full bg-slate-100 border-2 border-transparent text-slate-900 px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 text-center font-black tracking-widest text-sm shadow-inner placeholder:text-slate-400 placeholder:font-bold lowercase" 
                         placeholder="ID GİRİNİZ" 
                      />
                      <input 
                         type="password" 
                         value={userPassInput} 
                         onChange={e => setUserPassInput(e.target.value)} 
                         className="w-full bg-slate-100 border-2 border-transparent text-slate-900 px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 text-center font-black tracking-[0.4em] text-lg shadow-inner placeholder:text-slate-400 placeholder:font-bold placeholder:tracking-normal" 
                         placeholder="ŞİFRE" 
                      />
                      <button 
                         type="submit" 
                         className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] mt-2 uppercase text-sm"
                      >
                         GİRİŞ YAP VE DOLDUR
                      </button>
                   </form>
                </div>

                {/* 2. KÜP (ÜST SAĞ): 🟢🔴 ÇİFT TARAFLI NEON DURUM PANOSU */}
                <div className="bg-[#0a0f16] border border-slate-700 rounded-3xl p-6 relative flex flex-col justify-start items-center shadow-xl h-[400px]">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-300 px-8 py-2 rounded-full text-[11px] font-black tracking-[0.2em] border border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.8)] whitespace-nowrap">
                      ⚡ {selectedEntryWeek}. HAFTA TAHMİN DURUMU ⚡
                   </div>
                   
                   <div className="mt-6 flex flex-row gap-3 w-full h-full overflow-hidden">
                      
                      {/* 🟢 YAPANLAR (YEŞİL NEON) */}
                      <div className="flex-1 flex flex-col border border-emerald-600 rounded-xl bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-neon-flash-green overflow-hidden">
                         <div className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black tracking-widest text-center py-2.5 border-b border-emerald-800/50 sticky top-0 z-10">
                             🟢 YAPANLAR ({submittedPlayers.length})
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar-green p-2 flex flex-col gap-1.5 h-full">
                             {submittedPlayers.map((name, idx) => (
                                <div key={`sub-${idx}`} className="bg-emerald-950/40 border border-emerald-800/40 px-2 py-1.5 rounded text-[9px] font-black text-emerald-300 tracking-wider truncate text-center shadow-inner shrink-0">
                                    {name}
                                </div>
                             ))}
                         </div>
                      </div>

                      {/* 🔴 YAPMAYANLAR (KIRMIZI NEON) */}
                      <div className="flex-1 flex flex-col border border-red-600 rounded-xl bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-neon-flash-red overflow-hidden">
                         <div className="bg-red-950/80 text-red-400 text-[10px] font-black tracking-widest text-center py-2.5 border-b border-red-800/50 sticky top-0 z-10">
                             🔴 EKSİKLER ({missingPlayers.length})
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar-red p-2 flex flex-col gap-1.5 h-full">
                             {missingPlayers.map((name, idx) => (
                                <div key={`mis-${idx}`} className="bg-red-950/40 border border-red-800/40 px-2 py-1.5 rounded text-[9px] font-black text-red-300 tracking-wider truncate text-center shadow-inner shrink-0">
                                    {name}
                                </div>
                             ))}
                         </div>
                      </div>

                   </div>
                </div>

                {/* 3. KÜP (ALT SOL): RESMİ DEKLARASYON */}
                <div className="bg-[#0b1120] border border-blue-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(30,58,138,0.2)] hover:border-blue-700 transition-all h-[300px]">
                   <div className="w-16 h-16 bg-blue-950 rounded-full flex items-center justify-center mb-4 shadow-inner border border-blue-800">
                      <span className="text-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">📜</span>
                   </div>
                   <h2 className="text-blue-400 font-black tracking-widest text-lg mb-2">RESMİ DEKLARASYON</h2>
                   <p className="text-slate-400 text-[10px] font-bold mb-3 bg-blue-950/50 px-3 py-1 rounded-lg border border-blue-900/50 tracking-widest uppercase">
                       Şu ana kadar {submittedPlayers.length} kişi hedefini belirledi
                   </p>
                   <p className="text-slate-500 text-[11px] leading-relaxed max-w-[280px] mb-5">
                      Maçı başlayan yarışmacıların skor tercihleri şeffaf bir şekilde sergilenir. Başlamamış maçlar gizlidir.
                   </p>
                   {/* 🔥 VİEW DEĞİŞTİRİCİ OLARAK GÜNCELLENDİ 🔥 */}
                   <button onClick={() => setView('declaration')} className="bg-blue-950 hover:bg-blue-900 text-blue-400 font-bold tracking-widest py-3 px-8 rounded-xl border border-blue-800/50 transition-all text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      RESMİ DEKLARASYONU AÇ
                   </button>
                </div>

                {/* 4. KÜP (ALT SAĞ): TAHMİNMATİK */}
                <div className="bg-[#05100a] border border-emerald-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(6,78,59,0.2)] hover:border-emerald-700 transition-all h-[300px]">
                   <div className="w-16 h-16 bg-emerald-950 rounded-full flex items-center justify-center mb-4 shadow-inner border border-emerald-800">
                      <span className="text-3xl drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">⚡</span>
                   </div>
                   <h2 className="text-emerald-500 font-black tracking-widest text-lg mb-2">TAHMİNMATİK</h2>
                   <p className="text-slate-400 text-[10px] font-bold mb-3 bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-900/50 tracking-widest uppercase">
                       Canlı Radar ve Skor Bildirim Merkezi
                   </p>
                   <p className="text-slate-500 text-[11px] leading-relaxed max-w-[280px] mb-5">
                      Maç başladığı an kilit kalkar, skoru kimin tahmin ettiğini ve alınan puanları anında görürsünüz.
                   </p>
                   {/* 🔥 VİEW DEĞİŞTİRİCİ OLARAK GÜNCELLENDİ 🔥 */}
                   <button onClick={() => setView('tahminmatik')} className="bg-emerald-950/50 hover:bg-emerald-900/80 text-emerald-500 font-bold tracking-widest py-3 px-8 rounded-xl border border-emerald-800/50 transition-all text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      TAHMİNMATİK CANLI İZLE
                   </button>
                </div>

             </div>
           </>
         )}

         {/* ===================== RESMİ DEKLARASYON EKRANI ===================== */}
         {view === 'declaration' && (
          <div className="animate-fade-in-up w-full max-w-[1400px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.4)] relative z-50">
              <button onClick={() => setView('lobby')} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 transition-colors"><span>⬅</span> Lobiye Dön</button>
              <div className="text-center"><h2 className="text-3xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] uppercase">RESMİ DEKLARASYON</h2></div>
              <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto relative">
                <button onClick={downloadJPEG} disabled={isDownloading || !bulletinMap[selectedEntryWeek]} className="bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600 text-emerald-400 hover:text-white font-black px-4 py-2 rounded-lg flex items-center shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"><span className="text-lg">📸</span> {isDownloading ? 'HAZIRLANIYOR...' : 'İNDİR'}</button>
                <div className="relative flex-1 md:min-w-[200px]">
                  <input type="text" placeholder="Yarışmacı ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} className="w-full bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg text-white text-sm outline-none focus:border-amber-500" />
                  {isSearchFocused && ( <div className="absolute top-full left-0 w-full bg-slate-900 border border-slate-700 mt-1 rounded-lg shadow-2xl z-[100] max-h-48 overflow-y-auto custom-scrollbar"> {finalPlayersList.map(id => ( <div key={`drop-${id}`} className="px-4 py-2 hover:bg-slate-800 cursor-pointer text-xs font-bold text-slate-300 border-b border-slate-800/50" onClick={() => { setSearchTerm(systemPlayers[id]); setIsSearchFocused(false); }}>{systemPlayers[id]}</div> ))} </div> )}
                </div>
                
                {availableWeeks.length > 0 ? (
                    <select value={selectedEntryWeek} onChange={(e) => setSelectedEntryWeek(Number(e.target.value))} className="bg-amber-500 text-slate-950 font-black px-2 sm:px-4 py-2 rounded-lg outline-none cursor-pointer shadow-md text-xs sm:text-sm max-w-[150px] sm:max-w-none">
                        {availableWeeks.map(week => ( <option key={`dec-${week}`} value={week}>{getDisplayWeek(week)}</option> ))}
                    </select>
                ) : (
                    <div className="bg-slate-800 text-slate-400 font-bold px-4 py-2 rounded-lg text-sm border border-slate-700">Deklare Yok</div>
                )}
              </div>
            </div>

            {bulletinMap[selectedEntryWeek] ? (
              <div className="bg-[#050b14] border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl relative z-10 w-full overflow-hidden">
                <div className="mb-4 text-center bg-indigo-950/30 border border-indigo-500/30 p-2 rounded-lg text-indigo-300 text-xs font-bold tracking-widest shadow-inner">
                   BAŞLAMAMIŞ MAÇLARIN TAHMİNLERİ "🔒" İLE GİZLENMİŞTİR. (MAÇA 1 DK KALA AÇILIR)
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar border border-slate-800/50 rounded-lg pb-4">
                  <div className="inline-block min-w-max">
                    <table className="w-full text-xs text-center border-separate border-spacing-0 whitespace-nowrap">
                      <thead className="sticky top-0 z-40 bg-slate-950 shadow-md">
                        <tr>
                          <th className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 min-w-[200px] text-left"><span className="text-amber-500 font-black tracking-widest uppercase">{getDisplayWeek(selectedEntryWeek)}</span></th>
                          {bulletinMap[selectedEntryWeek].map((m: any) => ( <th key={m.id} className="p-2 border-b border-r border-slate-800 bg-slate-900 text-slate-400 font-bold min-w-[50px]">{m.id}</th> ))}
                          {ghostColumns.map((_, i) => ( <th key={`g1-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                        </tr>
                        <tr>
                          <th className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">OYUNCU İSMİ</span></th>
                          {bulletinMap[selectedEntryWeek].map((m: any) => {
                            const hName = cleanTeamName(m.homeTeam || m.home_team);
                            const aName = cleanTeamName(m.awayTeam || m.away_team);
                            const theme = getEliteTheme(m.category, hName, aName);
                            return ( <th key={`home-${m.id}`} className="p-1 border-b border-r border-slate-800 bg-slate-900/50"><div className="w-6 h-6 mx-auto flex items-center justify-center"><img src={theme.homeLogo} alt={hName} className="w-full h-full object-contain drop-shadow-md" title={hName} /></div></th> )})}
                          {ghostColumns.map((_, i) => ( <th key={`g2-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                        </tr>
                        <tr>
                          <th onClick={toggleSortOrder} className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 text-right cursor-pointer hover:bg-slate-900 transition-colors group"><div className="flex justify-end items-center gap-2"><span className="text-slate-500 text-[8px] uppercase group-hover:text-amber-300">Sırala: {sortOrder}</span><span className="text-amber-500 font-bold text-[9px] uppercase border border-amber-500/50 px-2 py-1 rounded bg-amber-950/30">SIRA / LİSTE</span></div></th>
                          {bulletinMap[selectedEntryWeek].map((m: any) => {
                            const hName = cleanTeamName(m.homeTeam || m.home_team);
                            const aName = cleanTeamName(m.awayTeam || m.away_team);
                            const theme = getEliteTheme(m.category, hName, aName);
                            return ( <th key={`away-${m.id}`} className="p-1 border-b border-r border-slate-800 bg-slate-900/50"><div className="w-6 h-6 mx-auto flex items-center justify-center"><img src={theme.awayLogo} alt={aName} className="w-full h-full object-contain drop-shadow-md" title={aName} /></div></th> )})}
                          {ghostColumns.map((_, i) => ( <th key={`g3-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                        </tr>
                      </thead>
                      <tbody>
                        {finalPlayersList.map(id => {
                          const playerName = systemPlayers[id] || "Bilinmeyen Oyuncu";
                          const selectedWeekData = livePredictionsData[selectedEntryWeek] || {};
                          const preds = selectedWeekData[id] || Array(24).fill('PAS');
                          
                          return ( 
                            <tr key={id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="sticky left-0 z-30 bg-slate-950 border-b border-r border-slate-800 p-3 text-left font-bold tracking-wide group-hover:bg-slate-900"><span className="text-slate-300">{playerName}</span></td>
                                {preds.map((score: string, idx: number) => {
                                    const matchIndex = idx + 1;
                                    const matchObj = bulletinMap[selectedEntryWeek].find((m:any) => m.id === matchIndex);
                                    
                                    let isRevealed = true;
                                    if (matchObj) {
                                        const matchTimeMs = getMatchTimeMs(matchObj.date, matchObj.time);
                                        if (now < matchTimeMs - 60000) isRevealed = false;
                                    }
                                    
                                    const liveInfo = liveMatchStatus[matchIndex];
                                    const isMatchFinished = liveInfo && (liveInfo.status === 'FINISHED' || liveInfo.status === 'WAITING_APPROVAL' || liveInfo.status === 'FT');
                                    const isExactMatch = isMatchFinished && score === liveInfo.score && score !== 'PAS' && score !== '-';
                                    
                                    const displayScore = isRevealed ? score : '🔒';
                                    
                                    let cellStyle = "border-b border-r border-slate-800 p-2 font-black ";
                                    if (!isRevealed) {
                                        cellStyle += "bg-[#0a1120] text-slate-600 text-lg";
                                    } else if (isExactMatch) {
                                        cellStyle += "bg-emerald-950/20 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse"; 
                                    } else {
                                        cellStyle += "bg-[#0a1120] text-amber-500";
                                    }

                                    return (
                                      <td key={idx} className={cellStyle}>{displayScore}</td>
                                    )
                                })}
                                {ghostColumns.map((_, i) => ( <td key={`gd-${i}`} className="min-w-[60px] opacity-0 border-none"></td> ))}
                            </tr> 
                          );
                        })}
                        {finalPlayersList.length === 0 && ( <tr><td colSpan={35} className="py-8 border-b border-slate-800 text-slate-500 italic bg-[#0a1120]">Sistemde henüz kayıtlı tahmin bulunmuyor.</td></tr> )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : ( 
               <div className="col-span-1 md:col-span-2 py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <span className="text-5xl mb-4 block opacity-50">⏳</span>
                  <h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest uppercase">
                     {availableWeeks.length === 0 ? "ŞU AN RESMİ DEKLARASYON İÇİN AÇIK HAFTA YOKTUR" : `${getDisplayWeek(selectedEntryWeek)} TAHMİNLERİ GİZLİ VEYA BULUNAMADI`}
                  </h2>
               </div> 
            )}
            
            {/* Fotoğraf çekimi için gizli konteyner */}
            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
              <div id="jpeg-export-container" className="bg-[#050b14] p-8 inline-block w-max">
                <div className="text-center mb-6 border-b border-slate-800 pb-4"><h2 className="text-3xl font-black text-amber-500 tracking-widest uppercase">ETM LİGİ - {getDisplayWeek(selectedEntryWeek)} TAHMİNLERİ</h2></div>
                {bulletinMap[selectedEntryWeek] && (
                  <table className="w-full text-xs text-center border-separate border-spacing-0 whitespace-nowrap">
                    <thead className="bg-slate-950">
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 min-w-[200px] text-left"><span className="text-amber-500 font-black tracking-widest text-lg">YARIŞMACI / MAÇ NO</span></th>{bulletinMap[selectedEntryWeek].map((m: any) => ( <th key={`exp-m1-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900 text-slate-400 font-bold min-w-[50px] text-lg">{m.id}</th> ))}</tr>
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">EV SAHİBİ TAKIM</span></th>{bulletinMap[selectedEntryWeek].map((m: any) => ( <th key={`exp-home-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900/50 text-slate-300 font-bold uppercase text-[9px] whitespace-nowrap">{cleanTeamName(m.homeTeam || m.home_team)}</th> ))}</tr>
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">DEPLASMAN TAKIM</span></th>{bulletinMap[selectedEntryWeek].map((m: any) => ( <th key={`exp-away-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900/50 text-slate-300 font-bold uppercase text-[9px] whitespace-nowrap">{cleanTeamName(m.awayTeam || m.away_team)}</th> ))}</tr>
                    </thead>
                    <tbody>
                      {activePlayersForJPEG.map(id => {
                        const playerName = systemPlayers[id] || "Bilinmeyen Oyuncu"; const preds = (livePredictionsData[selectedEntryWeek] || {})[id]; if(!preds) return null;
                        return ( 
                            <tr key={`exp-${id}`}>
                                <td className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left font-bold text-slate-300 tracking-wide">{playerName}</td>
                                {preds.map((score: string, idx: number) => {
                                    const matchIndex = idx + 1;
                                    const matchObj = bulletinMap[selectedEntryWeek].find((m:any) => m.id === matchIndex);
                                    let isRevealed = true;
                                    if (matchObj) {
                                        const matchTimeMs = getMatchTimeMs(matchObj.date, matchObj.time);
                                        if (now < matchTimeMs - 60000) isRevealed = false;
                                    }
                                    
                                    const liveInfo = liveMatchStatus[matchIndex];
                                    const isMatchFinished = liveInfo && (liveInfo.status === 'FINISHED' || liveInfo.status === 'WAITING_APPROVAL' || liveInfo.status === 'FT');
                                    const isExactMatch = isMatchFinished && score === liveInfo.score && score !== 'PAS' && score !== '-';

                                    let expStyle = "border-b border-r border-slate-800 p-2 font-black text-base ";
                                    if (!isRevealed) {
                                        expStyle += "bg-[#0a1120] text-slate-600 text-lg";
                                    } else if (isExactMatch) {
                                        expStyle += "bg-emerald-950/40 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,1)]"; 
                                    } else {
                                        expStyle += "bg-[#0a1120] text-amber-500";
                                    }

                                    const displayScore = isRevealed ? score : '🔒';
                                    return ( <td key={`exp-sc-${idx}`} className={expStyle}>{displayScore}</td> )
                                })}
                            </tr> 
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ===================== TAHMİNMATİK EKRANI ===================== */}
        {view === 'tahminmatik' && (
          <div className="animate-fade-in-up w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative z-50">
              <button onClick={() => setView('lobby')} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 transition-colors"><span>⬅</span> Lobiye Dön</button>
              <div className="text-center"><h2 className="text-2xl md:text-3xl font-black text-emerald-500 tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] uppercase flex items-center justify-center gap-3"><span className="text-3xl md:text-4xl">⚡</span> TAHMİNMATİK</h2></div>
              <div>
                  {availableWeeks.length > 0 ? (
                      <select value={selectedEntryWeek} onChange={(e) => setSelectedEntryWeek(Number(e.target.value))} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer outline-none transition-all shadow text-xs sm:text-sm max-w-[150px] sm:max-w-none">
                          {availableWeeks.map(week => ( <option key={`tahminmatik-${week}`} value={week}>{getDisplayWeek(week)}</option> ))}
                      </select>
                  ) : (
                      <div className="bg-slate-800 text-slate-400 font-bold px-4 py-2 rounded-lg text-sm border border-slate-700">Açık Hafta Yok</div>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {bulletinMap[selectedEntryWeek] ? bulletinMap[selectedEntryWeek].map((match: any) => {
                const hName = cleanTeamName(match.homeTeam || match.home_team);
                const aName = cleanTeamName(match.awayTeam || match.away_team);
                const theme = getEliteTheme(match.category, hName, aName);
                
                const tScore = tahminmatikScores[match.id] || { home: '-', away: '-' };
                const isComplete = tScore.home !== '-' && tScore.away !== '-';
                const targetScore = `${tScore.home}-${tScore.away}`;
                  
                const selectedWeekData = livePredictionsData[selectedEntryWeek] || {};
                const predictors = isComplete ? Object.keys(selectedWeekData).filter(uid => selectedWeekData[uid][match.id - 1] === targetScore && systemPlayers[uid]).map(uid => systemPlayers[uid] || "Bilinmeyen").sort((a,b) => a.localeCompare(b, 'tr')) : [];

                const matchTimeMs = getMatchTimeMs(match.date, match.time);
                const isRevealed = (now >= matchTimeMs - 60000);

                return (
                  <div key={`tm-${match.id}`} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                    <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center">
                      {theme.bgImg && ( <><div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div><div className="absolute inset-0 bg-slate-900/40 z-0"></div></> )}
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex flex-col items-center justify-center mb-2 sm:mb-4 gap-1.5 sm:gap-2">
                           <span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase tracking-widest">{match.weekLabel}</span>
                           <span className={`text-[10px] sm:text-[11px] font-black uppercase px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>🏆 {match.category}</span>
                        </div>
                        <div className="flex items-center justify-between px-0 sm:px-4 mt-2">
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20"><img src={theme.homeLogo} alt={hName} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" /></div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{hName}</span>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-24 sm:w-36 z-30">
                            {theme.leagueLogo && (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 mb-1 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                <img src={theme.leagueLogo} alt="League Logo" className="w-full h-full object-contain" />
                              </div>
                            )}

                            {!isRevealed ? (
                               <div className="flex flex-col items-center justify-center py-4 w-full text-center gap-1 bg-slate-900/80 rounded-xl border border-slate-700 shadow-inner backdrop-blur-md">
                                   <span className="text-2xl sm:text-3xl opacity-50">🔒</span>
                                   <span className="text-slate-400 font-bold text-[8px] sm:text-[9px] tracking-widest uppercase px-2">
                                       Tahminler Gizli
                                   </span>
                                   <span className="text-amber-500 text-[8px] font-black tracking-widest mt-1">
                                       AÇILIŞ: {match.time}
                                   </span>
                               </div>
                            ) : (
                               <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                                 <select value={tScore.home} onChange={e => handleTahminmatikChange(match.id, 'home', e.target.value)} className="bg-slate-950 border border-slate-700 text-amber-400 font-black text-lg sm:text-2xl px-1 sm:px-2 py-1 rounded-lg outline-none text-center w-10 sm:w-12 appearance-none cursor-pointer" style={{textAlignLast: 'center'}}>{scoreOptionsArr.map(o => <option key={o} value={o}>{o}</option>)}</select><span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span><select value={tScore.away} onChange={e => handleTahminmatikChange(match.id, 'away', e.target.value)} className="bg-slate-950 border border-slate-700 text-amber-400 font-black text-lg sm:text-2xl px-1 sm:px-2 py-1 rounded-lg outline-none text-center w-10 sm:w-12 appearance-none cursor-pointer" style={{textAlignLast: 'center'}}>{scoreOptionsArr.map(o => <option key={o} value={o}>{o}</option>)}</select>
                               </div>
                            )}
                          </div>

                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20"><img src={theme.awayLogo} alt={aName} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" /></div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{aName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`${theme.bottomBar} border-t px-4 py-4 w-full backdrop-blur-md z-10 relative min-h-[90px]`}>
                       <div className="flex items-center gap-2 mb-3">
                          <span className="text-red-500 text-sm drop-shadow-md">🎯</span> 
                          <span className={`font-black text-[10px] sm:text-xs tracking-widest ${isRevealed && predictors.length > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'text-amber-500'}`}>
                              SKORU BİLENLER [{isRevealed ? predictors.length : '?'} KİŞİ]
                          </span>
                       </div>
                       
                       <div className="flex items-center justify-center border-t border-slate-700/50 pt-3">
                           {!isRevealed ? (
                               <span className="text-slate-500 text-[10px] sm:text-xs italic tracking-wide font-bold">Mühür kırılmadığı için liste kapalıdır...</span>
                           ) : !isComplete ? ( 
                               <span className="text-slate-500 text-[10px] sm:text-xs italic tracking-wide">Lütfen yukarıdan skoru seçin...</span> 
                           ) : predictors.length === 0 ? ( 
                               <span className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wide">Bu skoru tahmin eden yarışmacı bulunamadı.</span> 
                           ) : ( 
                               <div className="flex flex-wrap justify-center gap-2 sm:gap-3"> 
                                  {predictors.map((p, i) => ( 
                                     <span key={i} className="bg-emerald-950/80 border-2 border-emerald-400/80 px-3 py-1.5 rounded-md text-[10px] sm:text-[11px] font-black text-emerald-300 uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]">
                                        {p}
                                     </span> 
                                  ))} 
                               </div> 
                           )}
                       </div>
                    </div>
                  </div>
                );
              }) : ( <div className="col-span-1 md:col-span-2 py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl"><span className="text-5xl mb-4 block opacity-50">⏳</span><h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest uppercase">{availableWeeks.length === 0 ? "ŞU AN TAHMİNMATİK İÇİN AÇIK HAFTA YOKTUR" : `${getDisplayWeek(selectedEntryWeek)} TAHMİNLERİ GİZLİ VEYA BULUNAMADI`}</h2></div> )}
            </div>
          </div>
        )}

      </div>

      {/* 🔥 EFSANE MAÇ KARTLARI MODALI (TAHMİN GİRİŞİ İÇİN) 🔥 */}
      {isModalOpen && selectedUser && (
         <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
             <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative mt-4 sm:mt-0 pb-6 mb-20 sm:mb-0 flex flex-col items-center">
                 
                 <div className="w-full sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4 sm:py-6 rounded-t-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="text-center sm:text-left w-full sm:w-auto flex flex-col items-center sm:items-start">
                         <div className="text-amber-500 font-black text-lg sm:text-xl tracking-widest uppercase break-words px-2 text-center">{selectedUser.name}</div>
                         <div className="text-slate-400 font-bold tracking-widest text-xs mt-1 bg-slate-950 inline-block px-3 py-1 rounded-lg border border-slate-800 text-center">
                             {customWeekNames[activeWeek] || `${activeWeek}. HAFTA`} GİRİŞİ
                         </div>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-400 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors border border-slate-700 hover:border-rose-500 absolute top-4 right-4 sm:static shrink-0">
                         ✕
                     </button>
                 </div>

                 <div className="w-full px-2 sm:px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 justify-items-center w-full max-w-5xl mx-auto">
                         {bulletin.map((m, idx) => {
                             const logInfo = liveInfoStateMap[m.match_index];
                             const matchStatus = logInfo?.status || 'NOT_STARTED';
                             const isLocked = matchStatus !== 'NOT_STARTED';
                             const isTff = isTffMatchCheck(m.category);
                             
                             const homeTeamUpper = m.home_team?.toUpperCase() || "";
                             const awayTeamUpper = m.away_team?.toUpperCase() || "";
                             const theme = getEliteTheme(m.category, homeTeamUpper, awayTeamUpper);

                             return (
                                 <div key={idx} className={`w-full max-w-md mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg} ${isLocked ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.02]'}`}>
                                     
                                     {isLocked && (
                                         <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-[2px]">
                                             <div className="bg-red-950/90 text-red-400 font-black text-[11px] sm:text-sm px-6 py-2 rounded-lg border-2 border-red-800/80 tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.5)] -rotate-12">
                                                 🔒 MAÇ KİLİTLENDİ
                                             </div>
                                         </div>
                                     )}

                                     <div className="p-4 sm:p-5 relative flex-grow overflow-hidden flex flex-col justify-center min-h-[140px] items-center">
                                       {theme.bgImg && (
                                         <>
                                           <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                                           <div className="absolute inset-0 bg-slate-900/60 z-0"></div>
                                         </>
                                       )}
                                       <div className="relative z-10 flex flex-col h-full justify-between w-full">

                                         <div className="flex items-center justify-between mb-3 w-full">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-950/80 border border-slate-700 flex items-center justify-center font-black text-slate-400 text-xs sm:text-sm shadow-inner shrink-0">
                                                {m.match_index}
                                            </div>
                                            <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 w-[70%]">
                                               <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border text-center ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} shadow-sm backdrop-blur-sm truncate max-w-full block`}>
                                                 {m.category || 'BELİRSİZ LİG'}
                                               </span>
                                               <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold mt-1 tracking-widest bg-slate-950/50 px-2 rounded block">
                                                  {m.match_date} - {m.match_time}
                                               </span>
                                            </div>
                                         </div>

                                         <div className="flex items-center justify-center w-full">
                                           <div className="flex flex-col items-center justify-center flex-1 gap-2 w-1/3">
                                              <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center relative z-20">
                                                <img src={theme.homeLogo} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]" />
                                              </div>
                                              <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wider drop-shadow-lg leading-tight px-1 max-w-[120px] line-clamp-2 h-[28px]">{homeTeamUpper || 'EV SAHİBİ'}</span>
                                           </div>

                                           <div className="flex flex-col items-center justify-center mx-2 z-30 shrink-0 w-[110px]">
                                             
                                             {theme.leagueLogo && (
                                               <div className="w-10 h-10 sm:w-12 sm:h-12 mb-1 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                                 <img src={theme.leagueLogo} alt="League Logo" className="w-full h-full object-contain" />
                                               </div>
                                             )}

                                             <div className={`w-full bg-[#080d1a]/90 border ${theme.scoreBorder} py-3 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                                               <select 
                                                 disabled={isLocked}
                                                 value={tempScores[idx] === "-" ? "-" : tempScores[idx].split('-')[0]} 
                                                 onChange={e => {
                                                    const currentAway = tempScores[idx] === "-" ? "-" : tempScores[idx].split('-')[1];
                                                    const newHome = e.target.value;
                                                    handleScoreChange(idx, newHome === "-" && currentAway === "-" ? "-" : `${newHome === "-" ? "0" : newHome}-${currentAway === "-" ? "0" : currentAway}`);
                                                 }}
                                                 className="bg-transparent text-lg sm:text-2xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md w-8 sm:w-10"
                                                 style={{textAlignLast: 'center'}}
                                               >
                                                  {scoreOptions.map(opt => <option key={`h-${opt}`} value={opt}>{opt}</option>)}
                                               </select>
                                               <span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span>
                                               <select 
                                                 disabled={isLocked}
                                                 value={tempScores[idx] === "-" ? "-" : tempScores[idx].split('-')[1]} 
                                                 onChange={e => {
                                                    const currentHome = tempScores[idx] === "-" ? "-" : tempScores[idx].split('-')[0];
                                                    const newAway = e.target.value;
                                                    handleScoreChange(idx, currentHome === "-" && newAway === "-" ? "-" : `${currentHome === "-" ? "0" : currentHome}-${newAway === "-" ? "0" : newAway}`);
                                                 }}
                                                 className="bg-transparent text-lg sm:text-2xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md w-8 sm:w-10"
                                                 style={{textAlignLast: 'center'}}
                                               >
                                                  {scoreOptions.map(opt => <option key={`a-${opt}`} value={opt}>{opt}</option>)}
                                               </select>
                                             </div>
                                           </div>

                                           <div className="flex flex-col items-center justify-center flex-1 gap-2 w-1/3">
                                              <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center relative z-20">
                                                <img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]" />
                                              </div>
                                              <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wider drop-shadow-lg leading-tight px-1 max-w-[120px] line-clamp-2 h-[28px]">{awayTeamUpper || 'DEPLASMAN'}</span>
                                           </div>
                                         </div>
                                         
                                         {/* 🔥 İŞTE TFF VE DFO ETİKETLERİ BURADA 🔥 */}
                                         <div className="w-full flex justify-center mt-2">
                                            <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shadow-sm ${isTff ? 'bg-red-950/80 text-red-400 border-red-900' : 'bg-slate-800/80 text-slate-300 border-slate-600'}`}>
                                                {isTff ? "TFF MAÇI" : "DFO MAÇI"}
                                            </span>
                                         </div>

                                       </div>
                                     </div>
                                 </div>
                             )
                         })}
                     </div>
                 </div>

                 <div className="w-full sticky bottom-0 z-30 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 sm:px-8 py-4 sm:py-6 rounded-b-2xl mt-4 sm:mt-0 flex flex-col items-center">
                     <button 
                         onClick={handleSubmitPredictions}
                         disabled={isSubmitting}
                         className="w-full max-w-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black tracking-widest text-sm sm:text-base py-4 sm:py-5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] uppercase border border-amber-400/50 flex justify-center items-center gap-2"
                     >
                         {isSubmitting ? 'KARARGAHA İŞLENİYOR...' : 'SEÇİMLERİMİ KAYDET / ONAYLA'}
                     </button>
                     <p className="text-center text-slate-500 text-[9px] sm:text-[10px] mt-3 font-medium uppercase tracking-widest px-2">
                         Skorunu değiştirmediğiniz veya "Tire (-)" bıraktığınız maçlar kaydedilmez.
                     </p>
                 </div>

             </div>
         </div>
      )}

      {/* Global Neon Animasyon Stilleri */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes neonFlashRed {
            0%, 100% { box-shadow: 0 0 10px rgba(220,38,38,0.3), inset 0 0 10px rgba(220,38,38,0.2); border-color: rgba(220,38,38,0.6); }
            50% { box-shadow: 0 0 25px rgba(239,68,68,0.8), inset 0 0 15px rgba(239,68,68,0.6); border-color: rgba(248,113,113,0.9); }
        }
        @keyframes neonFlashGreen {
            0%, 100% { box-shadow: 0 0 10px rgba(16,185,129,0.3), inset 0 0 10px rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.6); }
            50% { box-shadow: 0 0 25px rgba(52,211,153,0.8), inset 0 0 15px rgba(52,211,153,0.6); border-color: rgba(110,231,183,0.9); }
        }
        .animate-neon-flash-red { animation: neonFlashRed 1.5s infinite alternate ease-in-out; }
        .animate-neon-flash-green { animation: neonFlashGreen 1.5s infinite alternate ease-in-out; }
        
        .custom-scrollbar-red::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-red::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar-red::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.4); border-radius: 10px; }
        .custom-scrollbar-red::-webkit-scrollbar-thumb:hover { background: rgba(239,68,68,0.8); }

        .custom-scrollbar-green::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-green::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar-green::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.4); border-radius: 10px; }
        .custom-scrollbar-green::-webkit-scrollbar-thumb:hover { background: rgba(52,211,153,0.8); }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.8); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 1); }
      `}} />

    </div>
  );
}