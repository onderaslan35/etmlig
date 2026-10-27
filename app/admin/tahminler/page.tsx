'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import {
  TEST_ACCOUNTS,
  normalizeTurkish,
  isTffMatchCheck,
  getEliteTheme,
  cleanTeamName,
  getMatchTimeMs,
  getWeekLabel,
  customWeekNames
} from '@/utils/themeEngine';

export default function PredictionPortal() {
  const [view, setView] = useState<'lobby' | 'declaration' | 'entry' | 'tahminmatik'>('lobby');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); 
  const [loginError, setLoginError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortOrder, setSortOrder] = useState<'A-Z' | 'Z-A' | 'ZAMAN'>('A-Z'); 

  const [bulletinMap, setBulletinMap] = useState<Record<number, any[]>>({}); 
  const [predictions, setPredictions] = useState<Record<number, { home: string, away: string }>>({});
  const [oldPredictions, setOldPredictions] = useState<Record<number, { home: string, away: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tahminmatikScores, setTahminmatikScores] = useState<Record<number, { home: string, away: string }>>({});

  const [activeBulletinWeek, setActiveBulletinWeek] = useState<number>(0);
  const [selectedTahminWeek, setSelectedTahminWeek] = useState<number>(0);
  
  const [mergedAccounts, setMergedAccounts] = useState<Record<string, { pass: string, name: string }>>(TEST_ACCOUNTS);
  
  const [liveMatchStatus, setLiveMatchStatus] = useState<Record<number, { status: string, score: string }>>({});
  const [livePredictionsData, setLivePredictionsData] = useState<Record<number, Record<string, string[]>>>({});

  const [missingPlayersNeon, setMissingPlayersNeon] = useState<string[]>([]);
  const [submittedPlayersNeon, setSubmittedPlayersNeon] = useState<string[]>([]);

  const scoreOptionsArr = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

  const getDisplayWeek = (week: number) => {
      if (customWeekNames[week]) return customWeekNames[week];
      return getWeekLabel(week);
  };

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const fetchDbPlayers = async () => {
         const { data } = await supabase.from('players').select('*');
         if (data) {
            const newAccounts = { ...TEST_ACCOUNTS };
            data.forEach(p => {
                const pid = String(p.username || p.id);
                if (TEST_ACCOUNTS[pid]) {
                    newAccounts[pid] = { 
                        pass: TEST_ACCOUNTS[pid].pass, 
                        name: p.name || p.full_name || TEST_ACCOUNTS[pid].name 
                    };
                } else {
                    newAccounts[pid] = { pass: p.password || p.pass, name: p.name || p.full_name };
                }
            });
            setMergedAccounts(newAccounts);
         }
      };
      fetchDbPlayers();
  }, []);

  const availableWeeks = useMemo(() => {
    return Object.keys(bulletinMap).map(Number).filter(w => w >= 6).sort((a, b) => b - a);
  }, [bulletinMap]);

  // 🔥 YENİ AKILLI HAFTA KİLİDİ: Sadece haftadaki tüm maçların saati geçmişse kilitler 🔥
  const isCurrentWeekFullyLocked = useMemo(() => {
     const matches = bulletinMap[activeBulletinWeek];
     if (!matches || matches.length === 0) return false;
     return matches.every(m => now >= getMatchTimeMs(m.date, m.time) - 60000);
  }, [bulletinMap, activeBulletinWeek, now]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: bultenData } = await supabase.from('matches_bulletin').select('*').limit(1000);
      if (bultenData) {
         const newMap: Record<number, any[]> = {};
         let maxWeek = 0;
         bultenData.forEach(row => {
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
            if (row.week_num > maxWeek) maxWeek = row.week_num;
         });
         
         Object.keys(newMap).forEach(week => { newMap[Number(week)].sort((a,b) => a.id - b.id); });
         setBulletinMap(newMap);
         
         if (maxWeek > 0) {
             setActiveBulletinWeek(maxWeek); 
             setSelectedTahminWeek(maxWeek);
         }
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchLiveMatchStatuses = async () => {
      if (!selectedTahminWeek) return;
      const { data } = await supabase
        .from('live_matches')
        .select('id, status, home_score, away_score')
        .gte('id', selectedTahminWeek * 100)
        .lt('id', (selectedTahminWeek + 1) * 100);
      
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
    
    if (view === 'declaration' || view === 'tahminmatik' || view === 'entry') {
      fetchLiveMatchStatuses();
    }
  }, [selectedTahminWeek, view]);

  useEffect(() => {
      if (activeBulletinWeek === 0 || Object.keys(mergedAccounts).length === 0) return;

      const fetchPlayerStatus = async () => {
          const { data: preds } = await supabase
              .from('player_predictions')
              .select('user_id')
              .eq('week_num', activeBulletinWeek);

          const submittedUserIds = new Set((preds || []).map(p => String(p.user_id)));
          const allUserIds = Object.keys(mergedAccounts).filter(id => id !== 'mankoman'); 
          
          const missingIds = allUserIds.filter(id => !submittedUserIds.has(id));
          const submittedIds = allUserIds.filter(id => submittedUserIds.has(id));
          
          const missingNames = missingIds.map(id => mergedAccounts[id].name).sort((a, b) => a.localeCompare(b, 'tr'));
          const submittedNames = submittedIds.map(id => mergedAccounts[id].name).sort((a, b) => a.localeCompare(b, 'tr'));
          
          setMissingPlayersNeon(missingNames);
          setSubmittedPlayersNeon(submittedNames);
      };

      fetchPlayerStatus();
  }, [activeBulletinWeek, mergedAccounts, view]);

  useEffect(() => {
     const fetchLivePreds = async () => {
        if (!selectedTahminWeek) return;

        let allData: any[] = []; let from = 0; let step = 999; let keepFetching = true;
        while(keepFetching) {
            const { data } = await supabase.from('player_predictions').select('*').eq('week_num', selectedTahminWeek).range(from, from + step);
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
  }, [selectedTahminWeek, view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoginError('');
    
    if (!username.trim() || !password.trim()) {
        setLoginError("Lütfen ID ve Şifrenizi boş bırakmayın."); return;
    }

    if (username.trim().toLowerCase() === 'mankoman') {
        setLoginError("❌ DİKKAT! Yönetici hesaplarıyla tahmine girilemez!");
        return;
    }

    const userKey = username.trim(); 
    const passKey = password.trim(); 
    const account = mergedAccounts[userKey];

    if (account && String(passKey) === String(account.pass)) { 
      setDisplayName(account.name); 
      await fetchBulletinAndPredictions(userKey); 
      setView('entry'); 
    } else { 
      setLoginError('ID veya Şifre Hatalı! Lütfen bilgilerinizi kontrol ediniz.'); 
    }
  };

  const fetchBulletinAndPredictions = async (currentUsername: string) => {
    const bData = bulletinMap[activeBulletinWeek] || [];
    const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', activeBulletinWeek).eq('user_id', currentUsername);
    if (bData && bData.length > 0) {
      const initialPreds: Record<number, { home: string, away: string }> = {};
      bData.forEach((m:any) => {
        const existingPred = pData?.find(p => p.match_index === m.id);
        if (existingPred && existingPred.predicted_score && existingPred.predicted_score !== 'PAS' && existingPred.predicted_score !== '---') {
          const [h, a] = existingPred.predicted_score.split('-');
          initialPreds[m.id] = { home: h || '-', away: a || '-' };
        } else { initialPreds[m.id] = { home: '-', away: '-' }; }
      });
      setPredictions(initialPreds); setOldPredictions(JSON.parse(JSON.stringify(initialPreds))); 
    }
  };

  const handleScoreChange = (matchIndex: number, team: 'home' | 'away', score: string) => { 
      setPredictions(prev => ({ ...prev, [matchIndex]: { ...prev[matchIndex], [team]: score } })); 
  };
  
  const handleTahminmatikChange = (matchId: number, type: 'home' | 'away', val: string) => { 
      setTahminmatikScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || { home: '-', away: '-' }), [type]: val } })); 
  };
  
  const handleTahminMatikRastgele = () => {
    const newPreds = { ...predictions };
    Object.keys(newPreds).forEach(matchIndex => {
      const matchObj = bulletinMap[activeBulletinWeek].find((m:any) => m.id === Number(matchIndex));
      const isLocked = matchObj && (now >= getMatchTimeMs(matchObj.date, matchObj.time) - 60000);
      
      if (!isLocked && (newPreds[Number(matchIndex)].home === '-' || newPreds[Number(matchIndex)].away === '-')) {
        newPreds[Number(matchIndex)] = { home: Math.floor(Math.random() * 4).toString(), away: Math.floor(Math.random() * 4).toString() };
      }
    });
    setPredictions(newPreds);
  };

  const savePredictions = async () => {
    setIsSaving(true);
    try {
      const payload = Object.keys(predictions).map(matchIndex => {
        const matchObj = bulletinMap[activeBulletinWeek].find((m:any) => m.id === Number(matchIndex));
        const isLocked = matchObj && (now >= getMatchTimeMs(matchObj.date, matchObj.time) - 60000);
        
        if (isLocked) return null;

        return {
          user_id: username.trim(), 
          week_num: activeBulletinWeek, 
          match_index: Number(matchIndex),
          predicted_score: `${predictions[Number(matchIndex)].home}-${predictions[Number(matchIndex)].away}`
        };
      }).filter(p => p !== null); 

      if (payload.length > 0) {
          const { error } = await supabase.from('player_predictions').upsert(payload, { onConflict: 'user_id,week_num,match_index' });
          if(error) throw error;
      }
      
      setShowSuccessModal(true);
    } catch (e) { alert('❌ Kayıt sırasında bir hata oluştu!'); }
    setIsSaving(false);
  };

  const toggleSortOrder = () => { if (sortOrder === 'A-Z') setSortOrder('Z-A'); else if (sortOrder === 'Z-A') setSortOrder('ZAMAN'); else setSortOrder('A-Z'); };

  const finalPlayersList = useMemo(() => {
    let allIds = Object.keys(mergedAccounts).filter(id => id !== 'mankoman');
    const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
    
    if (searchTerm) {
      const normalizedSearch = normalizeTurkish(searchTerm);
      allIds = allIds.filter(id => { const pName = normalizeTurkish(mergedAccounts[id]?.name || ""); return pName.includes(normalizedSearch); });
    }
    const submittedIds = allIds.filter(id => selectedWeekData[id] && selectedWeekData[id].some(s => s !== 'PAS' && s !== '-'));
    
    if (sortOrder === 'A-Z') { submittedIds.sort((a, b) => mergedAccounts[a].name.localeCompare(mergedAccounts[b].name, 'tr')); } 
    else if (sortOrder === 'Z-A') { submittedIds.sort((a, b) => mergedAccounts[b].name.localeCompare(mergedAccounts[a].name, 'tr')); }
    return submittedIds; 
  }, [searchTerm, sortOrder, selectedTahminWeek, livePredictionsData, mergedAccounts]);

  const activePlayersForJPEG = useMemo(() => {
    const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
    return Object.keys(mergedAccounts).filter(id => id !== 'mankoman' && selectedWeekData[id] && selectedWeekData[id].some(s => s !== 'PAS' && s !== '-')).sort((a, b) => mergedAccounts[a].name.localeCompare(mergedAccounts[b].name, 'tr'));
  }, [selectedTahminWeek, livePredictionsData, mergedAccounts]);

  const ghostColumns = Array.from({ length: 10 });

  const downloadJPEG = async () => {
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const htmlToImage = await import('html-to-image');
      const element = document.getElementById('jpeg-export-container');
      if (!element) throw new Error("Stüdyo elementi bulunamadı");
      const dataUrl = await htmlToImage.toJpeg(element, { quality: 0.95, backgroundColor: '#050b14', pixelRatio: 1.5 });
      const link = document.createElement("a"); link.download = `ETM_Lig_${selectedTahminWeek}_Hafta_Tahminler.jpg`; link.href = dataUrl;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (error: any) { alert("HATA: Fotoğraf motoru bir engele takıldı. Detay: " + error.message); }
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24 transition-opacity duration-500">
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050b14]/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div><div className="text-6xl mb-6 mt-2 drop-shadow-lg">🏆</div>
            <h3 className="text-3xl font-black text-emerald-400 mb-3 tracking-widest">TEBRİKLER!</h3>
            <p className="text-slate-300 font-medium mb-8 text-sm leading-relaxed">Tahminleriniz sisteme kaydedilmiştir. (İsterseniz daha sonra kilitlenmemiş maçlarınızı güncelleyebilirsiniz.)</p>
            <button onClick={() => { setShowSuccessModal(false); setView('lobby'); setUsername(''); setPassword(''); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] uppercase">TAMAM</button>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto pt-10">
        
        {view === 'lobby' && (
          <div className="animate-fade-in-up">
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

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto items-stretch">
                
                {/* 1. KÜP (ÜST SOL): GİRİŞ KUTUSU */}
                <div className="bg-[#0b1120] border border-amber-500/50 rounded-3xl p-8 relative flex flex-col justify-center items-center shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all h-[400px]">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-950 text-amber-400 px-6 py-1 rounded-full text-xs font-black tracking-widest border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.5)] whitespace-nowrap">
                      TAHMİNLER AÇIK (PARÇA KAYIT)
                   </div>
                   
                   <form onSubmit={handleLogin} className="w-full max-w-[280px] flex flex-col gap-4 mt-4">
                      
                      <div className="flex flex-col items-center gap-1.5 w-full relative group">
                         <span className="text-[10px] text-amber-500 font-black tracking-widest uppercase flex items-center gap-2">
                           <span className="animate-bounce text-base">⬇️</span> DİKKAT: HAFTAYI SEÇ <span className="animate-bounce text-base">⬇️</span>
                         </span>
                         
                         <div className="w-full relative flex items-center justify-center">
                           <span className="absolute -left-7 text-xl animate-pulse hidden sm:block">👉</span>
                           {availableWeeks.length > 0 ? (
                             <select 
                               value={activeBulletinWeek} 
                               onChange={e => setActiveBulletinWeek(Number(e.target.value))}
                               className="w-full bg-slate-950 border-2 border-amber-500 text-amber-400 text-sm font-black px-4 py-2.5 rounded-xl outline-none focus:border-amber-400 text-center tracking-widest cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all appearance-none"
                               style={{textAlignLast: 'center'}}
                             >
                               {/* 🔥 GÜNCELLENDİ: Gerçekten saati geçen haftaları KİLİTLİ gösterir 🔥 */}
                               {availableWeeks.map(w => {
                                  const matches = bulletinMap[w] || [];
                                  const isFullyLocked = matches.length > 0 && matches.every(m => now >= getMatchTimeMs(m.date, m.time) - 60000);
                                  return (
                                    <option key={`opt-${w}`} value={w}>
                                        {getDisplayWeek(w)} {isFullyLocked ? " 🔒 (SÜRE DOLDU - KAPALI)" : ""}
                                    </option>
                                  )
                               })}
                             </select>
                           ) : (
                             <div className="w-full bg-slate-950 border-2 border-slate-700 text-amber-400 text-sm font-black px-4 py-2.5 rounded-xl outline-none text-center tracking-widest cursor-not-allowed">
                                BÜLTEN BEKLENİYOR
                             </div>
                           )}
                           <span className="absolute -right-7 text-xl animate-pulse hidden sm:block">👈</span>
                         </div>
                         
                         <p className="text-[8px] sm:text-[9px] font-black text-rose-400 tracking-wide text-center mt-1 bg-rose-950/40 px-2 py-1.5 rounded-lg border border-rose-900/50 leading-tight">
                           ⚠️ TIKLA VE DEĞİŞTİR! SONRA ÜZÜLME!
                         </p>
                      </div>
                      
                      <input 
                         type="text" 
                         value={username} 
                         onChange={e => setUsername(e.target.value)} 
                         className="w-full bg-slate-100 border-2 border-transparent text-slate-900 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-center font-black tracking-widest text-sm shadow-inner placeholder:text-slate-400 placeholder:font-bold lowercase" 
                         placeholder="ID GİRİNİZ" 
                      />
                      <input 
                         type="password" 
                         value={password} 
                         onChange={e => setPassword(e.target.value)} 
                         className="w-full bg-slate-100 border-2 border-transparent text-slate-900 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-center font-black tracking-[0.4em] text-lg shadow-inner placeholder:text-slate-400 placeholder:font-bold placeholder:tracking-normal" 
                         placeholder="ŞİFRE" 
                      />
                      {loginError && <p className="text-[10px] text-red-400 font-bold text-center bg-red-950/50 py-1.5 px-2 rounded-lg border border-red-500/30 leading-tight">{loginError}</p>}

                      <button 
                         type="submit" 
                         className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black tracking-widest py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] mt-1 uppercase text-sm"
                      >
                         GİRİŞ YAP VE DOLDUR
                      </button>
                   </form>
                </div>

                {/* 2. KÜP (ÜST SAĞ): 🟢🔴 ÇİFT TARAFLI NEON DURUM PANOSU */}
                <div className="bg-[#0a0f16] border border-slate-700 rounded-3xl p-6 relative flex flex-col justify-start items-center shadow-xl h-[400px]">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-300 px-8 py-2 rounded-full text-[11px] font-black tracking-[0.2em] border border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.8)] whitespace-nowrap">
                      ⚡ {activeBulletinWeek}. HAFTA TAHMİN DURUMU ⚡
                   </div>
                   
                   <div className="mt-6 flex flex-row gap-3 w-full h-full overflow-hidden">
                      
                      {/* 🟢 YAPANLAR (YEŞİL NEON) */}
                      <div className="flex-1 flex flex-col border border-emerald-600 rounded-xl bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-neon-flash-green overflow-hidden">
                         <div className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black tracking-widest text-center py-2.5 border-b border-emerald-800/50 sticky top-0 z-10">
                             🟢 YAPANLAR ({submittedPlayersNeon.length})
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar-green p-2 flex flex-col gap-1.5 h-full">
                             {submittedPlayersNeon.map((name, idx) => (
                                <div key={`sub-${idx}`} className="bg-emerald-950/40 border border-emerald-800/40 px-2 py-1.5 rounded text-[9px] font-black text-emerald-300 tracking-wider truncate text-center shadow-inner shrink-0">
                                    {name}
                                </div>
                             ))}
                         </div>
                      </div>

                      {/* 🔴 YAPMAYANLAR (KIRMIZI NEON) */}
                      <div className="flex-1 flex flex-col border border-red-600 rounded-xl bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-neon-flash-red overflow-hidden">
                         <div className="bg-red-950/80 text-red-400 text-[10px] font-black tracking-widest text-center py-2.5 border-b border-red-800/50 sticky top-0 z-10">
                             🔴 EKSİKLER ({missingPlayersNeon.length})
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar-red p-2 flex flex-col gap-1.5 h-full">
                             {missingPlayersNeon.map((name, idx) => (
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
                       Şu ana kadar {submittedPlayersNeon.length} kişi hedefini belirledi
                   </p>
                   <p className="text-slate-500 text-[11px] leading-relaxed max-w-[280px] mb-5">
                      Maçı başlayan yarışmacıların skor tercihleri şeffaf bir şekilde sergilenir. Başlamamış maçlar gizlidir.
                   </p>
                   <button onClick={() => { setView('declaration'); setSelectedTahminWeek(activeBulletinWeek); }} className="bg-blue-950 hover:bg-blue-900 text-blue-400 font-bold tracking-widest py-3 px-8 rounded-xl border border-blue-800/50 transition-all text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
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
                   <button onClick={() => { setView('tahminmatik'); setSelectedTahminWeek(activeBulletinWeek); }} className="bg-emerald-950/50 hover:bg-emerald-900/80 text-emerald-500 font-bold tracking-widest py-3 px-8 rounded-xl border border-emerald-800/50 transition-all text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      TAHMİNMATİK CANLI İZLE
                   </button>
                </div>

             </div>
          </div>
        )}

        {/* ===================== ELİT TAHMİN GİRİŞ PORTALI ===================== */}
        {view === 'entry' && (
          <div className="w-full animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-slate-900/50 p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div className="text-center sm:text-left">
                 <h2 className="text-2xl font-black text-amber-500 tracking-widest uppercase">{getDisplayWeek(activeBulletinWeek)} GÖREV KAĞIDI</h2>
                 <p className="text-slate-400 text-sm mt-1">Yarışmacı: <span className="text-white font-bold">{displayName}</span></p>
              </div>
              <button onClick={() => { setView('lobby'); setUsername(''); setPassword(''); }} className="text-red-400 hover:text-red-300 font-bold bg-red-950/30 px-6 py-3 rounded-lg border border-red-900/50 shadow-md">
                 Oturumu Kapat
              </button>
            </div>

            {/* 🔥 EĞER BÜTÜN MAÇLARIN SAATİ GEÇTİYSE HAFTAYI TAMAMEN KİLİTLE 🔥 */}
            {isCurrentWeekFullyLocked && (
                <div className="w-full max-w-4xl mx-auto bg-red-950/80 border border-red-500 p-8 rounded-xl mb-6 text-center shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                   <span className="text-4xl sm:text-6xl mb-4 block">🚫</span>
                   <h2 className="text-red-400 text-xl sm:text-3xl font-black tracking-widest uppercase mb-2">BU HAFTANIN SÜRESİ TAMAMEN DOLMUŞTUR</h2>
                   <p className="text-slate-300 text-sm sm:text-base font-bold">Tüm maçlar başladığı için bu haftaya tahmin girişi kapatılmıştır. Lütfen Lobiye dönüp açık olan başka bir haftayı seçiniz.</p>
                </div>
            )}

            {/* 🔥 EĞER HAFTADA HALA AÇIK MAÇLAR VARSA DİNAMİK KİLİT SİSTEMİ ÇALIŞSIN 🔥 */}
            {!isCurrentWeekFullyLocked && (
                <div className="w-full max-w-4xl mx-auto bg-blue-950/40 border border-blue-500/30 p-4 rounded-xl mb-6 text-center shadow-inner">
                   <span className="text-xl sm:text-2xl mb-2 block">⏱️ DİNAMİK KİLİT SİSTEMİ AKTİF</span>
                   <p className="text-blue-300 text-xs sm:text-sm font-medium leading-relaxed">
                      Artık tüm haftayı tek seferde doldurmak zorunda değilsiniz. Maçlarınızı parça parça kaydedebilirsiniz.<br/>
                      <strong className="text-rose-400">ÖNEMLİ:</strong> Her maçın tahmin kutusu, maçın başlama saatine <strong className="text-white">son 1 dakika kala</strong> otomatik olarak kilitlenir!
                   </p>
                </div>
            )}

            {(!bulletinMap[activeBulletinWeek] || bulletinMap[activeBulletinWeek].length === 0) ? (
               <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl max-w-2xl mx-auto"><span className="text-5xl mb-4 block opacity-50">🛡️</span><h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest">{getDisplayWeek(activeBulletinWeek)} BÜLTENİ BEKLENİYOR</h2></div>
            ) : (
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start justify-items-center">
                {bulletinMap[activeBulletinWeek].map((match) => {
                  const hName = cleanTeamName(match.homeTeam || match.home_team);
                  const aName = cleanTeamName(match.awayTeam || match.away_team);
                  const theme = getEliteTheme(match.category, hName, aName);
                  const hScore = predictions[match.id]?.home || '-'; const aScore = predictions[match.id]?.away || '-';
                  
                  const isTff = isTffMatchCheck(match.category);
                  const matchTimeMs = getMatchTimeMs(match.date, match.time);
                  
                  // 🔥 MAÇ BAZLI DİNAMİK KİLİT 🔥
                  const isLocked = (now >= matchTimeMs - 60000);

                  return (
                    <div key={match.id} className={`w-full max-w-md mx-auto border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg} ${isLocked ? 'opacity-85 grayscale-[15%] scale-[0.98]' : 'hover:scale-[1.02]'}`}>
                      {theme.bgImg && ( <><div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div><div className="absolute inset-0 bg-slate-900/70 z-0"></div></> )}
                      
                      {isLocked && (
                          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-[2px]">
                              <div className="bg-red-950/90 text-red-400 font-black text-[11px] sm:text-sm px-6 py-2 rounded-lg border-2 border-red-800/80 tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.5)] -rotate-12">
                                  🔒 SÜRE DOLDU KİLİTLENDİ
                              </div>
                          </div>
                      )}

                      <div className="relative z-10 flex flex-col h-full py-3 items-center min-h-[150px]">
                        
                        <div className="w-full flex justify-between items-center px-4 pt-1 pb-1">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-950/80 border border-slate-700 flex items-center justify-center font-black text-slate-400 text-xs sm:text-sm shadow-inner shrink-0">
                              {match.id}
                          </div>
                          <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 w-[70%]">
                             <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border text-center ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} shadow-sm backdrop-blur-sm truncate max-w-full block`}>
                               {match.category || 'BELİRSİZ LİG'}
                             </span>
                             <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold mt-1 tracking-widest bg-slate-950/50 px-2 rounded block">
                                {match.date} - {match.time}
                             </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center px-4 pb-2 mt-2 w-full">
                          <div className="flex flex-col items-center justify-center flex-1 gap-2 w-1/3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative z-20"><img src={theme.homeLogo} alt={hName} className="w-full h-full object-contain drop-shadow-lg" /></div>
                            <span className="text-white font-extrabold text-[10px] text-center uppercase drop-shadow-md leading-tight line-clamp-2">{hName}</span>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center gap-2 mx-2 w-[120px] z-30 shrink-0">
                            {theme.leagueLogo && (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 mb-1 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                <img src={theme.leagueLogo} alt="League Logo" className="w-full h-full object-contain" />
                              </div>
                            )}

                            <div className={`w-full bg-[#080d1a]/90 border ${theme.scoreBorder} py-3 px-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                              <select disabled={isLocked} value={hScore} onChange={e => handleScoreChange(match.id, 'home', e.target.value)} className="w-10 sm:w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-amber-400 outline-none text-center cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed" style={{textAlignLast: 'center'}}>
                                {scoreOptionsArr.map(opt => (<option key={`h-${opt}`} value={opt}>{opt}</option>))}
                              </select>
                              <span className="text-xl font-bold text-slate-500">:</span>
                              <select disabled={isLocked} value={aScore} onChange={e => handleScoreChange(match.id, 'away', e.target.value)} className="w-10 sm:w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-amber-400 outline-none text-center cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed" style={{textAlignLast: 'center'}}>
                                {scoreOptionsArr.map(opt => (<option key={`a-${opt}`} value={opt}>{opt}</option>))}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center flex-1 gap-2 w-1/3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative z-20"><img src={theme.awayLogo} alt={aName} className="w-full h-full object-contain drop-shadow-lg" /></div>
                            <span className="text-white font-extrabold text-[10px] text-center uppercase drop-shadow-md leading-tight line-clamp-2">{aName}</span>
                          </div>
                        </div>

                        <div className="w-full flex justify-center mt-2 pb-2">
                           <span className={`inline-block px-3 py-1 rounded-md border shadow-[0_0_10px_currentColor] text-[8px] font-black uppercase tracking-widest ${isTff ? 'bg-red-950/80 text-red-400 border-red-500/50' : 'bg-slate-800/80 text-slate-300 border-slate-500/50'}`}>
                             {isTff ? 'TFF MAÇI' : 'DFO MAÇI'}
                           </span>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SADECE HAFTA AÇIKSA VE BÜLTEN BOŞ DEĞİLSE BUTONLARI GÖSTER */}
            {!isCurrentWeekFullyLocked && bulletinMap[activeBulletinWeek] && bulletinMap[activeBulletinWeek].length > 0 && (
              <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-4 sticky bottom-6 z-50">
                <button onClick={handleTahminMatikRastgele} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm md:text-lg px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center gap-2">🎲 RASTGELE DOLDUR</button>
                <button onClick={savePredictions} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-black text-sm md:text-lg px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.5)]">{isSaving ? 'ŞİFRELENİYOR...' : '🚀 TAHMİNLERİMİ MÜHÜRLE'}</button>
              </div>
            )}
          </div>
        )}

        {/* ===================== RESMİ DEKLARASYON EKRANI ===================== */}
        {view === 'declaration' && (
          <div className="animate-fade-in-up w-full max-w-[1400px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.4)] relative z-50">
              <button onClick={() => setView('lobby')} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 transition-colors"><span>⬅</span> Lobiye Dön</button>
              <div className="text-center"><h2 className="text-3xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] uppercase">RESMİ DEKLARASYON</h2></div>
              <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto relative">
                <button onClick={downloadJPEG} disabled={isDownloading || !bulletinMap[selectedTahminWeek]} className="bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600 text-emerald-400 hover:text-white font-black px-4 py-2 rounded-lg flex items-center shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"><span className="text-lg">📸</span> {isDownloading ? 'HAZIRLANIYOR...' : 'İNDİR'}</button>
                <div className="relative flex-1 md:min-w-[200px]">
                  <input type="text" placeholder="Yarışmacı ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} className="w-full bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg text-white text-sm outline-none focus:border-amber-500" />
                  {isSearchFocused && ( <div className="absolute top-full left-0 w-full bg-slate-900 border border-slate-700 mt-1 rounded-lg shadow-2xl z-[100] max-h-48 overflow-y-auto custom-scrollbar"> {finalPlayersList.map(id => ( <div key={`drop-${id}`} className="px-4 py-2 hover:bg-slate-800 cursor-pointer text-xs font-bold text-slate-300 border-b border-slate-800/50" onClick={() => { setSearchTerm(mergedAccounts[id].name); setIsSearchFocused(false); }}>{mergedAccounts[id].name}</div> ))} </div> )}
                </div>
                
                {availableWeeks.length > 0 ? (
                    <select value={selectedTahminWeek} onChange={(e) => setSelectedTahminWeek(Number(e.target.value))} className="bg-amber-500 text-slate-950 font-black px-2 sm:px-4 py-2 rounded-lg outline-none cursor-pointer shadow-md text-xs sm:text-sm max-w-[150px] sm:max-w-none">
                        {availableWeeks.map(week => ( <option key={`dec-${week}`} value={week}>{getDisplayWeek(week)}</option> ))}
                    </select>
                ) : (
                    <div className="bg-slate-800 text-slate-400 font-bold px-4 py-2 rounded-lg text-sm border border-slate-700">Deklare Yok</div>
                )}
              </div>
            </div>

            {bulletinMap[selectedTahminWeek] ? (
              <div className="bg-[#050b14] border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl relative z-10 w-full overflow-hidden">
                <div className="mb-4 text-center bg-indigo-950/30 border border-indigo-500/30 p-2 rounded-lg text-indigo-300 text-xs font-bold tracking-widest shadow-inner">
                   BAŞLAMAMIŞ MAÇLARIN TAHMİNLERİ "🔒" İLE GİZLENMİŞTİR. (MAÇA 1 DK KALA AÇILIR)
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar border border-slate-800/50 rounded-lg pb-4">
                  <div className="inline-block min-w-max">
                    <table className="w-full text-xs text-center border-separate border-spacing-0 whitespace-nowrap">
                      <thead className="sticky top-0 z-40 bg-slate-950 shadow-md">
                        <tr>
                          <th className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 min-w-[200px] text-left"><span className="text-amber-500 font-black tracking-widest uppercase">{getDisplayWeek(selectedTahminWeek)}</span></th>
                          {bulletinMap[selectedTahminWeek].map((m: any) => ( <th key={m.id} className="p-2 border-b border-r border-slate-800 bg-slate-900 text-slate-400 font-bold min-w-[50px]">{m.id}</th> ))}
                          {ghostColumns.map((_, i) => ( <th key={`g1-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                        </tr>
                        <tr>
                          <th className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">OYUNCU İSMİ</span></th>
                          {bulletinMap[selectedTahminWeek].map((m: any) => {
                            const hName = cleanTeamName(m.homeTeam || m.home_team);
                            const aName = cleanTeamName(m.awayTeam || m.away_team);
                            const theme = getEliteTheme(m.category, hName, aName);
                            return ( <th key={`home-${m.id}`} className="p-1 border-b border-r border-slate-800 bg-slate-900/50"><div className="w-6 h-6 mx-auto flex items-center justify-center"><img src={theme.homeLogo} alt={hName} className="w-full h-full object-contain drop-shadow-md" title={hName} /></div></th> )})}
                          {ghostColumns.map((_, i) => ( <th key={`g2-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                        </tr>
                        <tr>
                          <th onClick={toggleSortOrder} className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 text-right cursor-pointer hover:bg-slate-900 transition-colors group"><div className="flex justify-end items-center gap-2"><span className="text-slate-500 text-[8px] uppercase group-hover:text-amber-300">Sırala: {sortOrder}</span><span className="text-amber-500 font-bold text-[9px] uppercase border border-amber-500/50 px-2 py-1 rounded bg-amber-950/30">SIRA / LİSTE</span></div></th>
                          {bulletinMap[selectedTahminWeek].map((m: any) => {
                            const hName = cleanTeamName(m.homeTeam || m.home_team);
                            const aName = cleanTeamName(m.awayTeam || m.away_team);
                            const theme = getEliteTheme(m.category, hName, aName);
                            return ( <th key={`away-${m.id}`} className="p-1 border-b border-r border-slate-800 bg-slate-900/50"><div className="w-6 h-6 mx-auto flex items-center justify-center"><img src={theme.awayLogo} alt={aName} className="w-full h-full object-contain drop-shadow-md" title={aName} /></div></th> )})}
                          {ghostColumns.map((_, i) => ( <th key={`g3-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                        </tr>
                      </thead>
                      <tbody>
                        {finalPlayersList.map(id => {
                          const playerName = mergedAccounts[id]?.name || "Bilinmeyen Oyuncu";
                          const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
                          const preds = selectedWeekData[id] || Array(24).fill('PAS');
                          
                          return ( 
                            <tr key={id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="sticky left-0 z-30 bg-slate-950 border-b border-r border-slate-800 p-3 text-left font-bold tracking-wide group-hover:bg-slate-900"><span className="text-slate-300">{playerName}</span></td>
                                {preds.map((score: string, idx: number) => {
                                    const matchIndex = idx + 1;
                                    const matchObj = bulletinMap[selectedTahminWeek].find((m:any) => m.id === matchIndex);
                                    
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
                     {availableWeeks.length === 0 ? "ŞU AN RESMİ DEKLARASYON İÇİN AÇIK HAFTA YOKTUR" : `${getDisplayWeek(selectedTahminWeek)} TAHMİNLERİ GİZLİ VEYA BULUNAMADI`}
                  </h2>
               </div> 
            )}
            
            {/* Fotoğraf çekimi için gizli konteyner */}
            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
              <div id="jpeg-export-container" className="bg-[#050b14] p-8 inline-block w-max">
                <div className="text-center mb-6 border-b border-slate-800 pb-4"><h2 className="text-3xl font-black text-amber-500 tracking-widest uppercase">ETM LİGİ - {getDisplayWeek(selectedTahminWeek)} TAHMİNLERİ</h2></div>
                {bulletinMap[selectedTahminWeek] && (
                  <table className="w-full text-xs text-center border-separate border-spacing-0 whitespace-nowrap">
                    <thead className="bg-slate-950">
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 min-w-[200px] text-left"><span className="text-amber-500 font-black tracking-widest text-lg">YARIŞMACI / MAÇ NO</span></th>{bulletinMap[selectedTahminWeek].map((m: any) => ( <th key={`exp-m1-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900 text-slate-400 font-bold min-w-[50px] text-lg">{m.id}</th> ))}</tr>
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">EV SAHİBİ TAKIM</span></th>{bulletinMap[selectedTahminWeek].map((m: any) => ( <th key={`exp-home-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900/50 text-slate-300 font-bold uppercase text-[9px] whitespace-nowrap">{cleanTeamName(m.homeTeam || m.home_team)}</th> ))}</tr>
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">DEPLASMAN TAKIM</span></th>{bulletinMap[selectedTahminWeek].map((m: any) => ( <th key={`exp-away-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900/50 text-slate-300 font-bold uppercase text-[9px] whitespace-nowrap">{cleanTeamName(m.awayTeam || m.away_team)}</th> ))}</tr>
                    </thead>
                    <tbody>
                      {activePlayersForJPEG.map(id => {
                        const playerName = mergedAccounts[id]?.name || "Bilinmeyen Oyuncu"; const preds = (livePredictionsData[selectedTahminWeek] || {})[id]; if(!preds) return null;
                        return ( 
                            <tr key={`exp-${id}`}>
                                <td className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left font-bold text-slate-300 tracking-wide">{playerName}</td>
                                {preds.map((score: string, idx: number) => {
                                    const matchIndex = idx + 1;
                                    const matchObj = bulletinMap[selectedTahminWeek].find((m:any) => m.id === matchIndex);
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
                      <select value={selectedTahminWeek} onChange={(e) => setSelectedTahminWeek(Number(e.target.value))} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer outline-none transition-all shadow text-xs sm:text-sm max-w-[150px] sm:max-w-none">
                          {availableWeeks.map(week => ( <option key={`tahminmatik-${week}`} value={week}>{getDisplayWeek(week)}</option> ))}
                      </select>
                  ) : (
                      <div className="bg-slate-800 text-slate-400 font-bold px-4 py-2 rounded-lg text-sm border border-slate-700">Açık Hafta Yok</div>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {bulletinMap[selectedTahminWeek] ? bulletinMap[selectedTahminWeek].map((match: any) => {
                const hName = cleanTeamName(match.homeTeam || match.home_team);
                const aName = cleanTeamName(match.awayTeam || match.away_team);
                const theme = getEliteTheme(match.category, hName, aName);
                
                const tScore = tahminmatikScores[match.id] || { home: '-', away: '-' };
                const isComplete = tScore.home !== '-' && tScore.away !== '-';
                const targetScore = `${tScore.home}-${tScore.away}`;
                  
                const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
                const predictors = isComplete ? Object.keys(selectedWeekData).filter(uid => selectedWeekData[uid][match.id - 1] === targetScore && mergedAccounts[uid]).map(uid => mergedAccounts[uid]?.name || "Bilinmeyen").sort((a,b) => a.localeCompare(b, 'tr')) : [];

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
                          
                          <div className="flex flex-col items-center justify-center gap-2 mx-1.5 sm:mx-4 w-24 sm:w-36 z-30">
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
              }) : ( <div className="col-span-1 md:col-span-2 py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl"><span className="text-5xl mb-4 block opacity-50">⏳</span><h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest uppercase">{availableWeeks.length === 0 ? "ŞU AN TAHMİNMATİK İÇİN AÇIK HAFTA YOKTUR" : `${getDisplayWeek(selectedTahminWeek)} TAHMİNLERİ GİZLİ VEYA BULUNAMADI`}</h2></div> )}
            </div>
          </div>
        )}

      </div>

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