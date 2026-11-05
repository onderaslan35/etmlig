'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import html2canvas from 'html2canvas';

// TFF kuralını buraya da dahil ediyoruz
const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category ? category.toUpperCase() : '';
  return uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG");
};

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');
  const [allData, setAllData] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [haftaBittiMi, setHaftaBittiMi] = useState<boolean>(false);
  const tabloRef = useRef<HTMLDivElement>(null);

  const loadSkorData = async () => {
    try {
      // 1. Ana Liderlik Tablosunu Çek 
      const { data: leaderboardData } = await supabase.from('live_leaderboard').select('*');

      // 2. Canlı Maçları ve Bülteni Çek
      const { data: allMatches } = await supabase.from('live_matches').select('*');
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('match_index, week_num, category, home_team, away_team');

      // 3. Aktif Haftayı Bul
      let activeWeek = 6;
      let liveWeeks: number[] = [];

      if (dbBulletin && allMatches) {
          const statusMap: Record<number, string> = {};
          allMatches.forEach(m => {
              statusMap[m.id] = m.status;
              if (m.status === 'LIVE' || m.status === 'HT') {
                  const wNum = Math.floor(m.id / 100);
                  if (!liveWeeks.includes(wNum)) liveWeeks.push(wNum);
              }
          });
          
          const weeksData: Record<number, { hasStartedMatch: boolean }> = {};
          
          dbBulletin.forEach(b => {
              if (!weeksData[b.week_num]) weeksData[b.week_num] = { hasStartedMatch: false };
              const status = statusMap[(b.week_num * 100) + b.match_index];
              if (status && status !== 'NOT_STARTED') weeksData[b.week_num].hasStartedMatch = true;
          });

          const startedWeeks = Object.keys(weeksData).map(Number).filter(w => weeksData[w].hasStartedMatch);
          activeWeek = startedWeeks.length > 0 ? Math.max(...startedWeeks) : Math.max(...Object.keys(weeksData).map(Number)); 
          
          if (!liveWeeks.includes(activeWeek)) liveWeeks.push(activeWeek);

          const activeWeekMatches = allMatches.filter(m => Math.floor(m.id / 100) === activeWeek);
          const finishedCount = activeWeekMatches.filter(m => m.status === 'FINISHED').length;
          setHaftaBittiMi(finishedCount === 24);
      }

      // 4. 1000 LİMİTİNİ AŞAN TAHMİN ÇEKİCİ (Tüm aktif/canlı haftalar)
      let predictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      if (liveWeeks.length > 0) {
          while (fetchMore) {
            const { data: pDataChunk, error } = await supabase
              .from('player_predictions')
              .select('*')
              .in('week_num', liveWeeks)
              .range(from, from + step - 1);
              
            if (!error && pDataChunk && pDataChunk.length > 0) {
               predictions = [...predictions, ...pDataChunk];
               if (pDataChunk.length < step) fetchMore = false; else from += step; 
            } else { fetchMore = false; }
          }
      }

      // 5. Oyuncu İsimleri Eşleştirmesi
      const { data: playersData } = await supabase.from('players').select('username, name');
      const idToNameMap: Record<string, string> = {};
      if (playersData) {
          playersData.forEach(p => idToNameMap[p.username] = p.name);
      }

      // 6. ⚡ CANLI (TAM İSABET) SKOR HESAPLAMASI ⚡
      const liveBonuses: Record<string, { master: number, dfo: number, tff: number }> = {};

      if (allMatches && predictions && dbBulletin) {
          const liveM = allMatches.filter(m => m.status === 'LIVE' || m.status === 'HT');
          
          liveM.forEach(match => {
              const currentScore = `${match.home_score}-${match.away_score}`;
              if (currentScore === "-" || match.home_score === "-" || match.away_score === "-") return;
              
              const mIndex = match.id % 100;
              const matchWeek = Math.floor(match.id / 100);
              
              // Kategori Tespiti (TFF mi DFO mu?)
              const bulletinMatch = dbBulletin.find(b => b.week_num === matchWeek && b.match_index === mIndex);
              
              let isTff = false;
              if (bulletinMatch) {
                  const rawCategory = String(bulletinMatch.category || '');
                  const catLower = rawCategory.toLocaleLowerCase('tr-TR');
                  const homeName = String(bulletinMatch.home_team || '').toLocaleLowerCase('tr-TR');
                  const awayName = String(bulletinMatch.away_team || '').toLocaleLowerCase('tr-TR');
                  
                  const isTurkishTeam = /(spor|gücü|yurdu|bld|belediye|demir|gençler|birliği|kars|ankara|izmir|istanbul|bursa|trabzon|antalya|eskişehir|karşıyaka|altay)/.test(homeName) || /(spor|gücü|yurdu|bld|belediye|demir|gençler|birliği|kars|ankara|izmir|istanbul|bursa|trabzon|antalya|eskişehir|karşıyaka|altay)/.test(awayName);

                  isTff = isTffMatchCheck(bulletinMatch.category) || 
                          catLower.includes('türkiye kupası') || 
                          catLower.includes('turkiye kupasi') || 
                          catLower.includes('tff') || 
                          catLower.includes('süper lig') || 
                          catLower.includes('1. lig') || 
                          catLower.includes('amatör') || 
                          catLower.includes('bal') ||
                          isTurkishTeam;
              }

              // Sadece TAM isabet (Skoru tam bilenleri) ayıkla
              const exactWinners = predictions.filter(p => p.match_index === mIndex && p.predicted_score === currentScore && p.week_num === matchWeek);

              exactWinners.forEach(w => {
                  const playerName = idToNameMap[w.user_id] || "";
                  if (playerName) {
                      // Anahtar eşleştirme (boşluk ve kupa emojisi düzeltmesi)
                      const cleanPlayerName = playerName.replace(/ 🏆/g, '').trim();
                      
                      let matchKey = Object.keys(liveBonuses).find(k => k.includes(cleanPlayerName) || cleanPlayerName.includes(k));
                      
                      if (!matchKey) {
                          matchKey = playerName;
                          liveBonuses[matchKey] = { master: 0, dfo: 0, tff: 0 };
                      }
                      
                      liveBonuses[matchKey].master += 1; 
                      if (isTff) liveBonuses[matchKey].tff += 1; 
                      else liveBonuses[matchKey].dfo += 1; 
                  }
              });
          });
      }

      // 7. Kesinleşmiş Tablo İle Canlı Bonusları Birleştir
      if (leaderboardData) {
        const enrichedData = leaderboardData.map(r => {
            const rName = r.name || "";
            const cleanRName = rName.replace(/ 🏆/g, '').trim();
            const matchedKey = Object.keys(liveBonuses).find(k => k === rName || rName.includes(k) || k.includes(cleanRName));
            
            const bonus = matchedKey ? liveBonuses[matchedKey] : { master: 0, dfo: 0, tff: 0 };

            return {
                ...r,
                masterLiveMatch: bonus.master,
                dfoLiveMatch: bonus.dfo,
                tffLiveMatch: bonus.tff
            };
        });
        setAllData(enrichedData);
      }
      setIsDataLoading(false);
    } catch (error) {
      console.error("Skor verileri çekilirken hata:", error);
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    loadSkorData();
    
    const channel1 = supabase.channel('skor_live_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => { loadSkorData(); }).subscribe();
    const channel2 = supabase.channel('skor_matches_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, () => { loadSkorData(); }).subscribe();
    
    const interval = setInterval(loadSkorData, 30000); // 30 Saniye kalkanı
    
    return () => { 
        supabase.removeChannel(channel1); 
        supabase.removeChannel(channel2); 
        clearInterval(interval); 
    };
  }, []);

  const resmiBildiriyiIndir = async () => {
    if (!haftaBittiMi || !tabloRef.current) return;
    const canvas = await html2canvas(tabloRef.current, { backgroundColor: '#0f172a', scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Tam_Isabet_Kralligi_${activeTab}.png`; // Hangi sekmedeyse o adla iner
    link.click();
  };

  const currentList = allData.map(r => {
    let baseScore = 0, liveBonus = 0, trend = 'same', diff = 0;
    
    if (activeTab === 'DFO') {
      baseScore = r.dfo_skor_pts || 0; 
      liveBonus = r.dfoLiveMatch || 0;
      trend = r.dfo_skor_trend_direction || 'same'; 
      diff = r.dfo_skor_trend_diff || 0;
    } else if (activeTab === 'TFF') {
      baseScore = r.tff_skor_pts || 0; 
      liveBonus = r.tffLiveMatch || 0;
      trend = r.tff_skor_trend_direction || 'same'; 
      diff = r.tff_skor_trend_diff || 0;
    } else {
      baseScore = r.skor_pts || 0; 
      liveBonus = r.masterLiveMatch || 0;
      trend = r.skor_trend_direction || 'same'; 
      diff = r.skor_trend_diff || 0;
    }
    
    return { 
        name: r.name, 
        totalScore: baseScore + liveBonus, // Canlı eklendiğinde sıralama değişsin diye
        baseScore, 
        liveBonus, 
        trend, 
        diff 
    };
  }).sort((a,b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name, 'tr'));

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md px-2">
          ELİT TAHMİN SKOR TAM İSABET BARAJ MERKEZİ
        </h1>
      </div>

      <div className="w-full max-w-3xl mx-auto mt-2">
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => setActiveTab('MASTER')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'MASTER' ? 'bg-amber-600 text-white border-amber-400 scale-105 shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🏆 MASTER</button>
          <button onClick={() => setActiveTab('DFO')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'DFO' ? 'bg-blue-600 text-white border-blue-400 scale-105 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🌍 DFO</button>
          <button onClick={() => setActiveTab('TFF')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'TFF' ? 'bg-red-600 text-white border-red-400 scale-105 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🇹🇷 TFF</button>
        </div>

        <div className="flex justify-end mb-4">
          {haftaBittiMi ? (
            <button 
              onClick={resmiBildiriyiIndir} 
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all shadow-lg"
            >
              📸 Resmi Deklarasyonu İndir
            </button>
          ) : (
            <button 
              disabled 
              className="bg-[#1e293b] text-slate-500 font-bold py-2 px-4 rounded-lg flex items-center gap-2 cursor-not-allowed border border-slate-700 text-sm shadow-md"
            >
              🔒 24. Maç Bekleniyor (İndirme Kapalı)
            </button>
          )}
        </div>

        <div ref={tabloRef} className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6 border border-[#1e293b] shadow-xl">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
              <span>🎯</span>
              <span>{activeTab === 'MASTER' ? 'MASTER' : activeTab === 'DFO' ? 'DFO' : 'TFF'} TAM İSABET SAYISI</span>
            </div>
          </div>
          {!isDataLoading && allData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
              <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                <tr>
                  <th className="pl-3 md:pl-4 pr-1 py-3 w-10 md:w-14 text-left">SIRA</th>
                  <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                  <th className="px-1 py-3 w-20 md:w-28 text-right"></th>
                  <th className="pr-3 md:pr-4 pl-1 py-3 w-16 md:w-20 text-center">TAM İSABET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {currentList.map((row: any, idx: number) => {
                  const trend = row.trend || 'same';
                  const trendDiff = row.diff || 0;
                  return (
                  <tr key={idx} className="hover:bg-[#0f172a]/40 transition-colors">
                    
                    <td className="pl-3 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-middle">
                      <div className="flex items-center">
                        <span className="text-left w-5">{idx + 1}</span>
                        {trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold flex items-center">▲<span className="text-[8px]">{trendDiff}</span></span>}
                        {trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center">▼<span className="text-[8px]">{trendDiff}</span></span>}
                      </div>
                    </td>
                    
                    <td className="px-1 md:px-2 py-3 align-middle">
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-white font-semibold">
                        <span className="whitespace-nowrap">{row.name}</span>
                      </div>
                    </td>

                    <td className="px-1 py-3 align-middle text-right">
                      {row.liveBonus > 0 && (
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/50 animate-pulse whitespace-nowrap shadow-sm">
                          +{row.liveBonus} MAÇ CANLI
                        </span>
                      )}
                    </td>

                    <td className={`pr-3 md:pr-4 pl-1 py-3 align-middle font-bold text-sm text-center ${activeTab === 'MASTER' ? 'text-amber-500' : activeTab === 'DFO' ? 'text-blue-400' : 'text-red-500'}`}>
                      {row.totalScore}
                    </td>

                  </tr>
                )})}
              </tbody>
            </table>
            </div>
          ) : ( <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Skorlar hesaplanıyor...</div> )}
        </div>
      </div>
    </div>
  );
}