'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { isTffMatchCheck } from '@/utils/themeEngine'; // TFF kontrolünü içeri aldık

const formatTurkishDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length !== 3) return dateStr;
  const months = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
  const monthIndex = parseInt(parts[1], 10) - 1;
  return (monthIndex >= 0 && monthIndex < 12) ? `${parseInt(parts[0], 10)} ${months[monthIndex]} ${parts[2]}` : dateStr;
};

export default function DfoPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [displayWeekNum, setDisplayWeekNum] = useState<number>(0);
  const [displayDate, setDisplayDate] = useState<string>('');

  const loadLeaderboard = async () => {
    try {
      // 1. DİKKAT: Artık sadece id değil, home_score ve away_score da lazım
      const { data: allMatches } = await supabase.from('live_matches').select('*');
      // 2. DİKKAT: Kategori lazım ki TFF mi DFO mu ayıklayalım
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date, category');
      
      let activeWeek = 5, activeDate = '';
      if (dbBulletin && allMatches) {
          const statusMap: Record<number, string> = {};
          allMatches.forEach(m => statusMap[m.id] = m.status);
          const weeksData: Record<number, { date: string, hasStartedMatch: boolean }> = {};
          
          dbBulletin.forEach(b => {
              if (!weeksData[b.week_num]) weeksData[b.week_num] = { date: b.match_date, hasStartedMatch: false };
              weeksData[b.week_num].date = b.match_date; 
              const status = statusMap[(b.week_num * 100) + b.match_index];
              if (status && status !== 'NOT_STARTED') weeksData[b.week_num].hasStartedMatch = true;
          });

          const startedWeeks = Object.keys(weeksData).map(Number).filter(w => weeksData[w].hasStartedMatch);
          activeWeek = startedWeeks.length > 0 ? Math.max(...startedWeeks) : Math.max(...Object.keys(weeksData).map(Number)); 
          activeDate = weeksData[activeWeek]?.date || '';
      }
      setDisplayWeekNum(activeWeek);
      setDisplayDate(formatTurkishDate(activeDate));

      // 3. OYUNCU İSİMLERİNİ AL (ID eşleşmesi için)
      const { data: playersData } = await supabase.from('players').select('username, name');
      const idToNameMap: Record<string, string> = {};
      if (playersData) {
          playersData.forEach(p => idToNameMap[p.username] = p.name);
      }

      // 4. TAHMİNLERİ ÇEK (1000 LİMİTİNİ AŞAN DÖNGÜ İLE)
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
          if (error) break;
          if (pDataChunk && pDataChunk.length > 0) {
              predictions = [...predictions, ...pDataChunk];
              if (pDataChunk.length < step) fetchMore = false; 
              else from += step; 
          } else {
              fetchMore = false; 
          }
      }

      // 5. MEVCUT (DAĞITILMIŞ) DFO PUANLARINI ÇEK
      const { data: leaderboardData } = await supabase.from('live_leaderboard').select('id, name, dfo_pts, dfo_trend_direction, dfo_trend_diff');
      
      if (leaderboardData && leaderboardData.length > 0) {
        let updatedList = leaderboardData.map(r => ({
            id: r.id, 
            name: r.name || "", 
            baseScore: r.dfo_pts || 0, 
            liveBonus: 0,
            trend: r.dfo_trend_direction || 'same', 
            trendDiff: r.dfo_trend_diff || 0
        }));

        // 6. CANLI HESAPLAMA (TFF MAÇLARINI ATLAYARAK)
        if (allMatches && predictions && dbBulletin) {
            const liveM = allMatches.filter(m => m.status === 'LIVE' || m.status === 'HT');
            
            liveM.forEach(match => {
                const currentScore = `${match.home_score}-${match.away_score}`;
                if (currentScore === "-" || match.home_score === "-" || match.away_score === "-") return;
                
                const mIndex = match.id % 100;
                const matchWeek = Math.floor(match.id / 100);
                
                // Maçın kategorisini bul
                const bulletinMatch = dbBulletin.find(b => b.week_num === matchWeek && b.match_index === mIndex);
                
                // 🔥 EĞER TFF MAÇIYSA DFO KASASINA PUAN EKLENMEZ 🔥
                if (bulletinMatch && isTffMatchCheck(bulletinMatch.category)) return;

                const winners = predictions.filter(p => p.match_index === mIndex && p.predicted_score === currentScore);
                
                let pts = 0;
                if (winners.length === 1) pts = 12;
                else if (winners.length === 2) pts = 6;
                else if (winners.length === 3) pts = 5;
                else if (winners.length === 4) pts = 4;
                else if (winners.length === 5) pts = 3;
                else if (winners.length === 6) pts = 2;
                else if (winners.length >= 7) pts = 1;

                winners.forEach(w => {
                    const playerName = idToNameMap[w.user_id] || "";
                    if (playerName) {
                        const targetPlayer = updatedList.find(p => p.name === playerName || p.name.includes(playerName) || playerName.includes(p.name.replace(/ 🏆/g, '')));
                        if (targetPlayer) targetPlayer.liveBonus += pts;
                    }
                });
            });
        }

        // 7. BİRLEŞTİR VE SIRALA
        const sortedList = updatedList.map(p => ({
            ...p,
            displayScore: p.baseScore + p.liveBonus
        })).sort((a, b) => b.displayScore - a.displayScore || a.name.localeCompare(b.name, 'tr'));

        setTableRows(sortedList.map((r, i) => ({
            ...r,
            currentRank: i + 1
        })));
      }
    } catch (e) { console.log("Veri çekilirken hata oluştu"); }
  };

  useEffect(() => { 
      loadLeaderboard(); 
      
      // HEM KASADAKİ DEĞİŞİKLİKLERİ HEM DE 1. ADIM (CANLI) YANSIMALARI DİNLE
      const channel1 = supabase.channel('dfo_live_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => { loadLeaderboard(); }).subscribe();
      const channel2 = supabase.channel('dfo_matches_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, () => { loadLeaderboard(); }).subscribe();
      
      // GİZLİ SİGORTA: 30 Saniyede bir arka planda otomatik yenileme (Soket çökse bile ekran güncellenir)
      const backupInterval = setInterval(() => { loadLeaderboard(); }, 30000);

      return () => { 
          supabase.removeChannel(channel1); 
          supabase.removeChannel(channel2); 
          clearInterval(backupInterval);
      };
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-blue-500 tracking-wider uppercase drop-shadow-md">ELİT TAHMİN DFO LİGİ</h1>
      </div>
      <div className="w-full max-w-3xl mx-auto mt-4">
        <div className="w-full bg-[#3b82f6] text-white font-extrabold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-6 text-center uppercase tracking-wide shadow-md border border-blue-400/50">
          {displayWeekNum > 0 ? `${displayWeekNum}. HAFTA DFO PUAN DURUMU (${displayDate})` : 'DFO PUAN DURUMU YÜKLENİYOR...'}
        </div>
        <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6 border border-[#1e293b]">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider"><span>📅</span><span>GÜNCEL PUAN DURUMU</span></div>
          </div>
          {tableRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                  <tr>
                    <th className="pl-2 md:pl-4 pr-1 py-3 w-12 md:w-16 text-left">SIRA</th>
                    <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                    <th className="pr-2 md:pr-4 pl-1 py-3 text-center whitespace-nowrap">TOPLAM PUAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {tableRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-[#0f172a]/40 transition-colors">
                      <td className="pl-2 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-top pt-4">
                        <div className="flex items-center gap-1">
                          <span className="w-4 text-left">{row.currentRank}</span>
                          <span className="text-[#475569]">-</span>
                          <div className="w-5 flex justify-center">
                            {row.trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5 animate-bounce">▲ <span className="text-[8px]">{row.trendDiff}</span></span>}
                            {row.trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5">▼ <span className="text-[8px]">{row.trendDiff}</span></span>}
                            {row.trend === 'same' && <span className="text-transparent text-[8px]">-</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-3 align-top pt-3.5"><div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-white font-semibold"><span className="whitespace-nowrap">{row.name}</span></div></td>
                      
                      {/* 🔥 İŞTE CANLI PUAN ROZETİ BURADA BELİRECEK 🔥 */}
                      <td className="pr-2 md:pr-4 pl-1 py-3 text-center font-bold text-sm text-blue-400 align-top pt-3.5">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span>{row.displayScore}</span>
                          {row.liveBonus > 0 && (
                            <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/50 animate-pulse whitespace-nowrap shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                              +{row.liveBonus} CANLI
                            </span>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (<div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Veriler yükleniyor...</div>)}
        </div>
      </div>
    </div>
  );
}