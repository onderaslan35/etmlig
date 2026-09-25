'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// TFF kuralını buraya da dahil ediyoruz
const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category ? category.toUpperCase() : '';
  return uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG");
};

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');
  const [allData, setAllData] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadSkorData = async () => {
    try {
      // 1. Ana (Kesinleşmiş) Liderlik Tablosunu Çek
      const { data: leaderboardData } = await supabase.from('live_leaderboard').select('*');

      // 2. Canlı Maçları ve Bülteni Çek (Hafta ve Kategori kontrolü için)
      const { data: allMatches } = await supabase.from('live_matches').select('*');
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('match_index, week_num, category');

      // 3. Aktif Haftayı Bul
      let activeWeek = 5;
      if (dbBulletin && allMatches) {
          const statusMap: Record<number, string> = {};
          allMatches.forEach(m => statusMap[m.id] = m.status);
          const weeksData: Record<number, { hasStartedMatch: boolean }> = {};
          
          dbBulletin.forEach(b => {
              if (!weeksData[b.week_num]) weeksData[b.week_num] = { hasStartedMatch: false };
              const status = statusMap[(b.week_num * 100) + b.match_index];
              if (status && status !== 'NOT_STARTED') weeksData[b.week_num].hasStartedMatch = true;
          });

          const startedWeeks = Object.keys(weeksData).map(Number).filter(w => weeksData[w].hasStartedMatch);
          activeWeek = startedWeeks.length > 0 ? Math.max(...startedWeeks) : Math.max(...Object.keys(weeksData).map(Number)); 
      }

      // 4. 🔥 1000 LİMİTİNİ AŞAN TAHMİN ÇEKİCİ 🔥
      let predictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .eq('week_num', activeWeek)
          .range(from, from + step - 1);
          
        if (!error && pDataChunk && pDataChunk.length > 0) {
           predictions = [...predictions, ...pDataChunk];
           if (pDataChunk.length < step) fetchMore = false; else from += step; 
        } else { fetchMore = false; }
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
              const isTff = bulletinMatch ? isTffMatchCheck(bulletinMatch.category) : false;

              // Sadece TAM isabet (Skoru tam bilenleri) ayıkla
              const exactWinners = predictions.filter(p => p.match_index === mIndex && p.predicted_score === currentScore);

              exactWinners.forEach(w => {
                  const playerName = idToNameMap[w.user_id] || "";
                  if (playerName) {
                      if (!liveBonuses[playerName]) liveBonuses[playerName] = { master: 0, dfo: 0, tff: 0 };
                      
                      liveBonuses[playerName].master += 1; // Master'a her türlü yazar
                      if (isTff) liveBonuses[playerName].tff += 1; // Sadece TFF ise
                      else liveBonuses[playerName].dfo += 1; // Sadece DFO ise
                  }
              });
          });
      }

      // 7. Kesinleşmiş Tablo İle Canlı Bonusları Birleştir
      if (leaderboardData) {
        const enrichedData = leaderboardData.map(r => {
            const rName = r.name || "";
            // İsmi en yakın eşleşmeyle bul
            const matchedKey = Object.keys(liveBonuses).find(k => k === rName || rName.includes(k) || k.includes(rName.replace(/ 🏆/g, '')));
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
    
    // Hem Leaderboard hem de Canlı Maçlar değiştiğinde tetikle
    const channel1 = supabase.channel('skor_live_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => { loadSkorData(); }).subscribe();
    const channel2 = supabase.channel('skor_matches_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, () => { loadSkorData(); }).subscribe();
    
    const interval = setInterval(loadSkorData, 30000); // 30 Saniye kalkanı
    
    return () => { 
        supabase.removeChannel(channel1); 
        supabase.removeChannel(channel2); 
        clearInterval(interval); 
    };
  }, []);

  // Hangi sekmedeysek o sekmeye ait puan, canlı bonus ve ok yönünü alıp sıralıyoruz
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

        <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6 border border-[#1e293b] shadow-xl">
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
                    <th className="pl-2 md:pl-4 pr-1 py-3 w-12 md:w-16 text-left">SIRA</th>
                    <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                    <th className="pr-2 md:pr-4 pl-1 py-3 text-center whitespace-nowrap">TAM İSABET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {currentList.map((row: any, idx: number) => {
                    const trend = row.trend || 'same';
                    const trendDiff = row.diff || 0;
                    return (
                    <tr key={idx} className="hover:bg-[#0f172a]/40 transition-colors">
                      <td className="pl-2 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-middle">
                        <div className="flex items-center gap-1">
                          <span className="w-4 text-left">{idx + 1}</span>
                          <span className="text-[#475569]">-</span>
                          <div className="w-5 flex justify-center">
                            {trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5 animate-bounce">▲ <span className="text-[8px]">{trendDiff}</span></span>}
                            {trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5">▼ <span className="text-[8px]">{trendDiff}</span></span>}
                            {trend === 'same' && <span className="text-transparent text-[8px]">-</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-3 align-middle"><div className="flex flex-wrap items-center gap-2 text-white font-semibold"><span className="whitespace-nowrap">{row.name}</span></div></td>
                      
                      {/* 🔥 DÜZELTME: Rozet Puanın SOLUNA alındı ve Puan Sabitlendi 🔥 */}
                      <td className={`pr-2 md:pr-4 pl-1 py-3 font-bold text-sm align-middle ${activeTab === 'MASTER' ? 'text-amber-500' : activeTab === 'DFO' ? 'text-blue-400' : 'text-red-500'}`}>
                        <div className="flex flex-row items-center justify-end gap-3 w-full">
                          {row.liveBonus > 0 && (
                            <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/50 animate-pulse whitespace-nowrap shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                              +{row.liveBonus} MAÇ CANLI
                            </span>
                          )}
                          <span className="w-8 text-right">{row.totalScore}</span>
                        </div>
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