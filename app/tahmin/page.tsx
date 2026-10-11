'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { 
  TEST_ACCOUNTS,
  staticPlayersList, 
  customWeekNames, 
  getWeekLabel, 
  getUniqueMatchId,
  isTffMatchCheck,
  getEliteTheme // 🔥 EFSANE KART TASARIM MOTORU EKLENDİ
} from '@/utils/themeEngine';

export default function PredictionPortal() {
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

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

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

         const { data: bData } = await supabase.from('matches_bulletin').select('week_num');
         if (bData) {
             const wSet = new Set<number>(bData.map(b => b.week_num));
             const wArray = Array.from(wSet).filter(w => w >= 5).sort((a,b) => a-b);
             setAvailableWeeks(wArray);
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
  }, [selectedEntryWeek, systemPlayers]);


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
                predicted_score: tempScores[i],
                updated_at: new Date().toISOString()
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col items-center">
      {/* ARKA PLAN EFEKTLERİ */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10 flex flex-col items-center">
         
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

         {/* 🔥 KOMUTANIN İSTEDİĞİ 2x2 DÖRTLÜ KÜP YAPISI 🔥 */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl items-stretch">
            
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
               <Link href="/deklarasyon" className="bg-blue-950 hover:bg-blue-900 text-blue-400 font-bold tracking-widest py-3 px-8 rounded-xl border border-blue-800/50 transition-all text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  RESMİ DEKLARASYONU AÇ
               </Link>
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
               <Link href="/canli" className="bg-emerald-950/50 hover:bg-emerald-900/80 text-emerald-500 font-bold tracking-widest py-3 px-8 rounded-xl border border-emerald-800/50 transition-all text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  TAHMİNMATİK CANLI İZLE
               </Link>
            </div>

         </div>

      </div>

      {/* 🔥 EFSANE MAÇ KARTLARI MODALI (GERİ GELDİ!) 🔥 */}
      {isModalOpen && selectedUser && (
         <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
             <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative mt-4 sm:mt-0 pb-6 mb-20 sm:mb-0">
                 
                 <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4 sm:py-6 rounded-t-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="text-center sm:text-left w-full sm:w-auto">
                         <div className="text-amber-500 font-black text-lg sm:text-xl tracking-widest uppercase break-words px-2">{selectedUser.name}</div>
                         <div className="text-slate-400 font-bold tracking-widest text-xs mt-1 bg-slate-950 inline-block px-3 py-1 rounded-lg border border-slate-800">
                             {customWeekNames[activeWeek] || `${activeWeek}. HAFTA`} GİRİŞİ
                         </div>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-400 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors border border-slate-700 hover:border-rose-500 absolute top-4 right-4 sm:static shrink-0">
                         ✕
                     </button>
                 </div>

                 <div className="px-2 sm:px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                         {bulletin.map((m, idx) => {
                             const logInfo = liveInfoStateMap[m.match_index];
                             const matchStatus = logInfo?.status || 'NOT_STARTED';
                             const isLocked = matchStatus !== 'NOT_STARTED';
                             
                             // 🔥 İŞTE EFSANE KART TASARIMINI OLUŞTURAN MOTOR ÇAĞRILDI 🔥
                             const homeTeamUpper = m.home_team?.toUpperCase() || "";
                             const awayTeamUpper = m.away_team?.toUpperCase() || "";
                             const theme = getEliteTheme(m.category, homeTeamUpper, awayTeamUpper);

                             return (
                                 <div key={idx} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg} ${isLocked ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.02]'}`}>
                                     
                                     {isLocked && (
                                         <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-[2px]">
                                             <div className="bg-red-950/90 text-red-400 font-black text-[11px] sm:text-sm px-6 py-2 rounded-lg border-2 border-red-800/80 tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.5)] -rotate-12">
                                                 🔒 MAÇ KİLİTLENDİ
                                             </div>
                                         </div>
                                     )}

                                     <div className="p-4 sm:p-5 relative flex-grow overflow-hidden flex flex-col justify-center min-h-[140px]">
                                       {theme.bgImg && (
                                         <>
                                           <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                                           <div className="absolute inset-0 bg-slate-900/60 z-0"></div>
                                         </>
                                       )}
                                       <div className="relative z-10 flex flex-col h-full justify-between">

                                         <div className="flex items-center justify-between mb-3 w-full">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-950/80 border border-slate-700 flex items-center justify-center font-black text-slate-400 text-xs sm:text-sm shadow-inner shrink-0">
                                                {m.match_index}
                                            </div>
                                            <div className="flex flex-col items-end">
                                               <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border text-center ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} shadow-sm backdrop-blur-sm`}>
                                                 {m.category || 'BELİRSİZ LİG'}
                                               </span>
                                               <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold mt-1 tracking-widest bg-slate-950/50 px-2 rounded">
                                                  {m.match_date} - {m.match_time}
                                               </span>
                                            </div>
                                         </div>

                                         <div className="flex items-center justify-between">
                                           <div className="flex flex-col items-center justify-center flex-1 gap-2">
                                              <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center relative z-20">
                                                <img src={theme.homeLogo} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]" />
                                              </div>
                                              <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wider drop-shadow-lg leading-tight px-1 max-w-[120px] line-clamp-2 h-[28px]">{homeTeamUpper || 'EV SAHİBİ'}</span>
                                           </div>

                                           <div className="flex flex-col items-center justify-center mx-2 z-30">
                                             <div className={`bg-[#080d1a]/90 border ${theme.scoreBorder} py-2 sm:py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md`}>
                                               <select 
                                                 disabled={isLocked}
                                                 value={tempScores[idx] === "-" ? "-" : tempScores[idx].split('-')[0]} 
                                                 onChange={e => {
                                                    const currentAway = tempScores[idx] === "-" ? "-" : tempScores[idx].split('-')[1];
                                                    const newHome = e.target.value;
                                                    handleScoreChange(idx, newHome === "-" && currentAway === "-" ? "-" : `${newHome === "-" ? "0" : newHome}-${currentAway === "-" ? "0" : currentAway}`);
                                                 }}
                                                 className="bg-transparent text-lg sm:text-2xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md w-6 sm:w-8"
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
                                                 className="bg-transparent text-lg sm:text-2xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md w-6 sm:w-8"
                                                 style={{textAlignLast: 'center'}}
                                               >
                                                  {scoreOptions.map(opt => <option key={`a-${opt}`} value={opt}>{opt}</option>)}
                                               </select>
                                             </div>
                                           </div>

                                           <div className="flex flex-col items-center justify-center flex-1 gap-2">
                                              <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center relative z-20">
                                                <img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]" />
                                              </div>
                                              <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wider drop-shadow-lg leading-tight px-1 max-w-[120px] line-clamp-2 h-[28px]">{awayTeamUpper || 'DEPLASMAN'}</span>
                                           </div>
                                         </div>

                                       </div>
                                     </div>
                                 </div>
                             )
                         })}
                     </div>
                 </div>

                 <div className="sticky bottom-0 z-30 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 sm:px-8 py-4 sm:py-6 rounded-b-2xl mt-4 sm:mt-0">
                     <button 
                         onClick={handleSubmitPredictions}
                         disabled={isSubmitting}
                         className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black tracking-widest text-sm sm:text-base py-4 sm:py-5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] uppercase border border-amber-400/50 flex justify-center items-center gap-2"
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
      `}} />

    </div>
  );
}