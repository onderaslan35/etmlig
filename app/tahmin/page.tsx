'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

// --- AYARLAR ---
// ⚠️ CUMA GÜNÜ 6. HAFTAYI AÇMAK İÇİN BURAYI SADECE "6" YAPMANIZ YETERLİDİR ⚠️
const activeWeek = 5; 

// --- YEREL VE BULUT LOGO BANKASI (Tasarımın bozulmaması için) ---
const localTeamLogos: Record<string, string> = {
  "BEŞİKTAŞ": "https://tr.wikipedia.org/wiki/Special:FilePath/BesiktasJK-Logo.svg",
  "KARABAĞ FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Qaraba%C4%9F_FK_2024.svg",
  "GALATASARAY": "https://de.wikipedia.org/wiki/Special:FilePath/Galatasaray_S.K._Logo_2026_5-stars.svg",
  "KASIMPAŞA": "https://de.wikipedia.org/wiki/Special:FilePath/Kasimpasa_Logo.svg",
  "TRABZONSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Trabzonspor_2022.svg",
  "KONYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Konyaspor_(logo).svg",
  "ÇAYKUR RİZE": "https://fr.wikipedia.org/wiki/Special:FilePath/Caykur_Rizespor_(logo).svg",
  "FATİH KARAGÜMRÜK": "https://fr.wikipedia.org/wiki/Special:FilePath/Fatih_Karag%C3%BCmr%C3%BCk_SK_(logo).svg",
  "ÜMRANİYESPOR": "https://el.wikipedia.org/wiki/Special:FilePath/%C3%9Cmraniyespor_(logo).svg",
  "GAZİANTEP FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Gaziantep_FK.svg",
  "FENERBAHÇE": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Fenerbah%C3%A7e_SK_-_120_Yil_(1907-2027).svg",
  "ALANYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Alanyaspor_(logo).svg",
  "GENÇLERBİRLİĞİ": "https://fr.wikipedia.org/wiki/Special:FilePath/Gen%C3%A7lerbirli%C4%9Fi_S.K._(logo).svg",
  "IĞDIR FK": "https://ar.wikipedia.org/wiki/Special:FilePath/I%C4%9Fd%C4%B1r_FK.svg",
  "VANSPOR FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Vanspor_FK_(2019).svg",
  "MANİSA FK": "https://tr.wikipedia.org/wiki/Special:FilePath/Manisa_FK.png",
  "BAŞAKŞEHİR": "https://de.wikipedia.org/wiki/Special:FilePath/Istanbul_Basaksehir_FK_Logo.svg",
  "KAYSERİSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Kayserispor.svg",
  "SİVASSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Sivasspor_-_Logo.svg",
  "AMED SPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Amed_SK.png",
  "MARDİN 1969": "https://tr.wikipedia.org/wiki/Special:FilePath/Mardin_1969_SK.png",
  "ANTALYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Antalyaspor.svg",
  "BATMAN PETROL SPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Batman_Petrolspor.png",
  "KEÇİÖRENGÜCÜ": "https://tr.wikipedia.org/wiki/Special:FilePath/Ankara_Ke%C3%A7i%C3%B6reng%C3%BCc%C3%BC_SK.png",
  "BURSASPOR": "https://de.wikipedia.org/wiki/Special:FilePath/Bursaspor_Logo.svg",
  "SAMSUNSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Samsunspor_2020.svg",
  "GÖZTEPE": "https://de.wikipedia.org/wiki/Special:FilePath/G%C3%B6ztepe.svg",
  "KOCAELİSPOR": "https://de.wikipedia.org/wiki/Special:FilePath/Kocaelispor.svg",
  "EYÜPSPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Ey%C3%BCpspor_Logosu.png",
  "OLYMPIC LYON": "/logos/lyon.png", "OLYMPIQUE LYON": "/logos/lyon.png", "OLYMPIQUE LYONNAIS": "/logos/lyon.png", "LYON": "/logos/lyon.png",
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png"
};

const getLocalLogoUrl = (teamName: string) => {
  if (!teamName) return '/logos/default.png';
  const slug = teamName.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  return `/logos/${slug}.png`;
};

const isTffMatchCheck = (category: string) => {
  if(!category) return false;
  const uppercaseCat = category.toUpperCase();
  return ( uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") );
};

const getEliteTheme = (category: string, homeTeam: string, awayTeam: string) => {
  const upCat = category ? category.toUpperCase() : '';
  const homeLogoUrl = localTeamLogos[homeTeam] || getLocalLogoUrl(homeTeam);
  const awayLogoUrl = localTeamLogos[awayTeam] || getLocalLogoUrl(awayTeam);

  let theme = { bgImg: null as string | null, containerBorder: "border-slate-500", containerShadow: "shadow-none", containerBg: "bg-slate-900", badgeBg: "", badgeText: "text-slate-300", badgeBorder: "", homeLogo: homeLogoUrl, awayLogo: awayLogoUrl };
  
  if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) theme = { ...theme, bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]" };
  else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) theme = { ...theme, bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]" };
  else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) theme = { ...theme, bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]" };
  else if (isTffMatchCheck(upCat)) theme = { ...theme, bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]" };
  else theme = { ...theme, bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]" };
  
  return theme;
};

export default function Tahminmatik() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<Record<number, { home: string, away: string }>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  useEffect(() => {
    const storedId = sessionStorage.getItem('userId');
    const storedName = sessionStorage.getItem('user_name');
    
    if (!storedId) {
      router.push('/login');
      return;
    }

    setUserId(storedId);
    setUserName(storedName || 'Bilinmeyen Kullanıcı');

    // MANKOMAN KONTROLÜ (Admin her zaman görebilir)
    if (storedId.toLowerCase() === 'mankoman') {
        setIsAdmin(true);
        setIsLocked(false);
    } else {
        // SAAT KALKANI KONTROLÜ (Cuma 21:00 - Pazartesi 21:00 arası AÇIK)
        const now = new Date();
        const trTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const day = trTime.getUTCDay(); // 0: Pazar, 1: Pzt, 2: Sal, 3: Çrş, 4: Prş, 5: Cum, 6: Cts
        const hours = trTime.getUTCHours();
        
        // Pazartesi 21:00'dan Cuma 21:00'a kadar KİLİTLİ
        if (day === 1 && hours >= 21) setIsLocked(true);
        else if (day === 2 || day === 3 || day === 4) setIsLocked(true);
        else if (day === 5 && hours < 21) setIsLocked(true);
        else setIsLocked(false);
    }

    fetchData(storedId);
  }, [router]);

  const fetchData = async (uid: string) => {
    try {
      // 1. Bülteni Çek
      const { data: bultenData } = await supabase
        .from('matches_bulletin')
        .select('*')
        .eq('week_num', activeWeek)
        .order('match_index', { ascending: true });
        
      if (bultenData) setMatches(bultenData);

      // 2. Kullanıcının Mevcut Tahminlerini Çek
      const { data: predData } = await supabase
        .from('player_predictions')
        .select('*')
        .eq('week_num', activeWeek)
        .eq('user_id', uid);

      if (predData && predData.length > 0) {
        const initialPreds: Record<number, { home: string, away: string }> = {};
        predData.forEach(p => {
          const [h, a] = p.predicted_score.split('-');
          initialPreds[p.match_index] = { home: h || "-", away: a || "-" };
        });
        setPredictions(initialPreds);
      } else {
        const emptyPreds: Record<number, { home: string, away: string }> = {};
        for(let i=1; i<=24; i++) emptyPreds[i] = { home: "-", away: "-" };
        setPredictions(emptyPreds);
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (matchIndex: number, team: 'home' | 'away', value: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchIndex]: {
        ...prev[matchIndex],
        [team]: value
      }
    }));
  };

  const handleRandomFill = () => {
    if(!window.confirm("Bütün boş skorlar rastgele doldurulacak. Onaylıyor musunuz?")) return;
    const newPreds = { ...predictions };
    matches.forEach(m => {
      const idx = m.match_index;
      if (newPreds[idx].home === "-") newPreds[idx].home = Math.floor(Math.random() * 4).toString();
      if (newPreds[idx].away === "-") newPreds[idx].away = Math.floor(Math.random() * 4).toString();
    });
    setPredictions(newPreds);
  };

  const savePredictions = async () => {
    const hasEmpty = matches.some(m => predictions[m.match_index]?.home === "-" || predictions[m.match_index]?.away === "-");
    if (hasEmpty) {
      if(!window.confirm("Bazı maçları boş bıraktınız. Yine de MÜHÜRLEMEK istiyor musunuz?")) return;
    }

    setIsSaving(true);
    try {
      const payload = matches.map(m => ({
        user_id: userId,
        week_num: activeWeek,
        match_index: m.match_index,
        predicted_score: `${predictions[m.match_index].home}-${predictions[m.match_index].away}`
      }));

      const { error } = await supabase.from('player_predictions').upsert(payload, { onConflict: 'user_id,week_num,match_index' });
      if (error) throw error;
      alert(`✅ BAŞARILI! ${activeWeek}. Hafta tahminleriniz Karargaha mühürlendi!`);
    } catch (err: any) {
      alert("❌ HATA: Tahminler kaydedilemedi! Lütfen tekrar deneyin.");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 font-black tracking-widest text-xl">VERİLER YÜKLENİYOR...</div>;
  }

  if (isLocked && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        {/* YENİ NESİL KİLİT EKRANI (METİNLER GÜNCELLENDİ) */}
        <div className="bg-rose-950/80 border border-rose-500/50 p-6 sm:p-8 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.3)] text-center animate-fade-in max-w-xl w-full mx-auto backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500"></div>
          
          <span className="text-5xl sm:text-6xl mb-4 sm:mb-6 block drop-shadow-[0_0_15px_rgba(225,29,72,0.6)]">⏳</span>
          
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-widest uppercase drop-shadow-md">SÜRE DOLMUŞTUR</h2>
          
          <p className="text-rose-200 text-base sm:text-lg mb-4 sm:mb-6 font-medium">
            <strong className="text-white font-black">{activeWeek + 1}. Hafta</strong> tahmin programı <strong className="text-amber-400">Cuma saat 21:00'da</strong> aktifleştirilir ve <strong className="text-amber-400">Pazartesi 21:00'da</strong> kapanır.
          </p>
          
          <div className="bg-rose-900/40 p-3 sm:p-4 rounded-xl border border-rose-500/30">
            <p className="text-xs sm:text-sm text-rose-100/80 leading-relaxed font-bold">
              Oynanan maçların sonuçlarını ve yarışmacı tahminlerini görmek için lütfen <span className="text-white">"RESMİ DEKLARASYON"</span> menüsüne gidiniz.
            </p>
          </div>
          
          <button 
            onClick={() => { sessionStorage.removeItem('userId'); router.push('/login'); }}
            className="mt-6 sm:mt-8 bg-rose-900 hover:bg-rose-800 text-rose-200 border border-rose-700 font-bold px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto tracking-wider text-sm shadow-md"
          >
            ← Karargaha Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        
        {/* ÜST BAŞLIK ALANI (GÖREV KAĞIDI YERİNE TAHMİN PROGRAMI) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-800 pb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
              <span className="text-3xl">📋</span> {activeWeek}. HAFTA TAHMİN PROGRAMI
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Yarışmacı: <strong className="text-white uppercase tracking-wider">{userName}</strong> {isAdmin && <span className="text-rose-500">(ADMİN)</span>}
            </p>
          </div>
          <button onClick={() => { sessionStorage.removeItem('userId'); router.push('/login'); }} className="px-5 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-400 text-sm font-bold rounded-xl shadow-md border border-rose-900/50 flex items-center gap-2 transition-all">
            🔒 Oturumu Kapat
          </button>
        </div>

        {matches.length === 0 ? (
          <div className="text-center text-slate-500 py-20 font-bold tracking-widest text-lg">BÜLTEN HENÜZ YAYINLANMADI</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {matches.map((match) => {
              const homeTeamUpper = match.home_team.toUpperCase();
              const awayTeamUpper = match.away_team.toUpperCase();
              const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);
              const pred = predictions[match.match_index] || { home: "-", away: "-" };

              return (
                <div key={match.match_index} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                  <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center min-h-[220px]">
                    {theme.bgImg && (
                      <>
                        <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                        <div className="absolute inset-0 bg-slate-900/40 z-0"></div>
                      </>
                    )}
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-1 rounded-full uppercase tracking-widest shadow-md backdrop-blur-sm">
                          {activeWeek}. HAFTA {match.match_index}. MAÇ
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 drop-shadow-md bg-slate-950/50 px-2 py-0.5 rounded border border-slate-700/50">
                          {match.match_date} - {match.match_time}
                        </span>
                      </div>
                      
                      <div className="flex justify-center mb-4">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-lg border text-center flex items-center gap-2 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                          🏆 {match.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-2 sm:px-4 mt-2">
                        <div className="flex flex-col items-center justify-center flex-1 gap-2">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative z-20">
                            <img src={theme.homeLogo} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" />
                          </div>
                          <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide drop-shadow-lg leading-tight mt-1">{homeTeamUpper}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center mx-2 sm:mx-4 w-24 sm:w-32 z-30">
                          <div className={`w-full bg-[#080d1a]/90 border border-slate-600/50 py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                            <select value={pred.home} onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)} className="bg-transparent text-xl sm:text-2xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md w-8" style={{textAlignLast: 'center'}}>
                              {scoreOptions.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-base">{opt}</option>)}
                            </select>
                            <span className="text-lg sm:text-xl font-bold text-slate-500">:</span>
                            <select value={pred.away} onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)} className="bg-transparent text-xl sm:text-2xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md w-8" style={{textAlignLast: 'center'}}>
                              {scoreOptions.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-base">{opt}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center flex-1 gap-2">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative z-20">
                            <img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" />
                          </div>
                          <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide drop-shadow-lg leading-tight mt-1">{awayTeamUpper}</span>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ALT SABİT BUTONLAR */}
      {matches.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex gap-4">
            <button 
              onClick={handleRandomFill}
              className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/50 font-black tracking-widest py-3 sm:py-4 rounded-xl transition-all flex justify-center items-center gap-2 text-xs sm:text-sm uppercase shadow-inner"
            >
              🎲 RASTGELE DOLDUR
            </button>
            <button 
              onClick={savePredictions}
              disabled={isSaving}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black tracking-widest py-3 sm:py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2 text-xs sm:text-sm uppercase"
            >
              {isSaving ? 'MÜHÜRLENİYOR...' : '🚀 TAHMİNLERİMİ MÜHÜRLE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}