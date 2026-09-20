'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const formatTurkishDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length !== 3) return dateStr;
  const months = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
  const monthIndex = parseInt(parts[1], 10) - 1;
  return (monthIndex >= 0 && monthIndex < 12) ? `${parseInt(parts[0], 10)} ${months[monthIndex]} ${parts[2]}` : dateStr;
};

export default function TffPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [displayWeekNum, setDisplayWeekNum] = useState<number>(0);
  const [displayDate, setDisplayDate] = useState<string>('');

  const loadLeaderboard = async () => {
    try {
      const { data: allMatches } = await supabase.from('live_matches').select('id, status');
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date');
      
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

      const { data } = await supabase.from('live_leaderboard').select('id, name, tff_pts, tff_trend_direction, tff_trend_diff');
      if (data && data.length > 0) {
        const sorted = data.sort((a, b) => b.tff_pts - a.tff_pts || (a.name || "").localeCompare(b.name || "", 'tr'));
        setTableRows(sorted.map((r, i) => ({
            id: r.id, name: r.name, displayScore: r.tff_pts, currentRank: i + 1, 
            trend: r.tff_trend_direction || 'same', trendDiff: r.tff_trend_diff || 0
        })));
      }
    } catch (e) { console.log("Veri çekilirken hata oluştu"); }
  };

  useEffect(() => { 
      loadLeaderboard(); 
      const channel = supabase.channel('tff_live_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => { loadLeaderboard(); }).subscribe();
      return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-red-500 tracking-wider uppercase drop-shadow-md">ELİT TAHMİN TFF LİGİ</h1>
      </div>
      <div className="w-full max-w-3xl mx-auto mt-4">
        <div className="w-full bg-[#ef4444] text-white font-extrabold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-6 text-center uppercase tracking-wide shadow-md border border-red-400/50">
          {displayWeekNum > 0 ? `${displayWeekNum}. HAFTA TFF PUAN DURUMU (${displayDate})` : 'TFF PUAN DURUMU YÜKLENİYOR...'}
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
                      <td className="pr-2 md:pr-4 pl-1 py-3 text-center font-bold text-sm text-red-500 align-top pt-3.5">{row.displayScore}</td>
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