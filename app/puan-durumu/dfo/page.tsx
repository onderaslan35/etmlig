'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const formatTurkishDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length !== 3) return dateStr;
  
  const months = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
  const day = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parts[2];
  
  if (monthIndex >= 0 && monthIndex < 12) {
    return `${day} ${months[monthIndex]} ${year}`;
  }
  return dateStr;
};

export default function DfoPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [currentWeekNum, setCurrentWeekNum] = useState<number>(0);
  const [lastMatchDate, setLastMatchDate] = useState<string>('');

  const loadLeaderboard = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const playersList: Record<string, string> = {};
      if (dbPlayers) {
        dbPlayers.forEach(p => { 
          const pid = p.username || p.id;
          if (pid !== 'mankoman') {
              playersList[pid] = p.name || p.full_name; 
          }
        });
      }

      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('week_num, match_date').order('week_num', { ascending: false }).order('match_index', { ascending: false }).limit(1);
      if (dbBulletin && dbBulletin.length > 0) {
          setCurrentWeekNum(dbBulletin[0].week_num);
          setLastMatchDate(formatTurkishDate(dbBulletin[0].match_date));
      }

      // 🔥 HATA BURADAN KAYNAKLIYDI: Oklar kaldırıldı, sadece DFO puanları çekiliyor!
      const { data } = await supabase
        .from('live_leaderboard')
        .select('id, name, dfo_pts, dfo_rank');

      if (data && data.length > 0) {
        const list = data.map(row => ({
          id: row.id,
          name: row.name || playersList[row.id] || "Bilinmiyor",
          displayScore: row.dfo_pts,
          currentRank: row.dfo_rank
        }));
        
        setTableRows(list.sort((a, b) => b.displayScore - a.displayScore || a.name.localeCompare(b.name, 'tr')).map((r, i) => ({ ...r, currentRank: i + 1 })));
      } else {
         setTableRows([]);
      }
    } catch (e) {
        console.log("Veri çekilirken hata oluştu");
    }
  };

  useEffect(() => { 
      loadLeaderboard(); 
      const channel = supabase.channel('dfo_live_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => {
           loadLeaderboard();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-blue-500 tracking-wider uppercase drop-shadow-md">
          DÜNYA FUTBOL ORGANİZASYONLARI (DFO)
        </h1>
      </div>
      
      <div className="w-full max-w-3xl mx-auto mt-4">
        <div className="w-full bg-blue-600 text-white font-extrabold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-6 text-center uppercase tracking-wide shadow-md border border-blue-500/50">
          {currentWeekNum > 0 ? `${currentWeekNum}. HAFTA DFO PUAN DURUMU (${lastMatchDate})` : 'DFO PUAN DURUMU YÜKLENİYOR...'}
        </div>

        <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6 border border-[#1e293b]">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
              <span>📅</span>
              <span>GÜNCEL PUAN DURUMU</span>
            </div>
          </div>

          {tableRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                  <tr>
                    <th className="pl-2 md:pl-4 pr-1 py-3 w-12 md:w-16 text-left">SIRA</th>
                    <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                    <th className="pr-2 md:pr-4 pl-1 py-3 text-center whitespace-nowrap">
                      TOPLAM PUAN
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {tableRows.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-[#0f172a]/40 transition-colors">
                      <td className="pl-2 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-top pt-4">
                        <div className="flex items-center gap-1">
                          <span className="w-4 text-left">{row.currentRank || idx + 1}</span>
                          <span className="text-[#475569]">-</span>
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-3 align-top pt-3.5">
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-white font-semibold">
                          {(() => {
                            const trophyCount = (row.name.match(/🏆/g) || []).length;
                            const cleanName = row.name.replace(/🏆/g, '').trim();
                            return (
                              <>
                                <span className="whitespace-nowrap">{cleanName}</span>
                                {trophyCount > 0 && <span className="text-amber-400 text-[10px]">{'🏆'.repeat(trophyCount)}</span>}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="pr-2 md:pr-4 pl-1 py-3 text-center font-bold text-sm text-blue-500 align-top pt-3.5">
                        {row.displayScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Veriler yükleniyor...</div>
          )}
        </div>
      </div>
    </div>
  );
}