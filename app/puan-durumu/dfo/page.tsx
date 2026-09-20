'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function DfoPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [maxWeek, setMaxWeek] = useState<number>(6);

  const loadLeaderboard = async () => {
    try {
      // 1. Oyuncu isimlerini alıyoruz
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

      if (activeTab === 'total') {
        // ⚡ ŞİMŞEK YÜKLEME: Binlerce tahmini hesaplamak yerine arka plandaki hazır tepsiden (live_leaderboard) çekiyoruz (0.1 Saniye)
        const { data } = await supabase
          .from('live_leaderboard')
          .select('id, name, dfo_pts, dfo_rank');

        if (data && data.length > 0) {
          const list = data.map(row => ({
            id: row.id,
            name: row.name || playersList[row.id] || "Bilinmiyor",
            displayScore: row.dfo_pts,
            currentRank: row.dfo_rank,
            trend: 'same', 
            trendDiff: 0,
            liveExtra: 0 // Hız için canlı animasyonunu tepsiye bıraktık
          }));
          
          // Puanlara göre sıralayıp sıra numarasını basıyoruz
          setTableRows(list.sort((a, b) => b.displayScore - a.displayScore || a.name.localeCompare(b.name, 'tr')).map((r, i) => ({ ...r, currentRank: i + 1 })));
        } else {
           setTableRows([]);
        }

      } else {
        // 🔴 EKMEL KANUNU: HAFTALIK GÖRÜNÜM İÇİN MÜHÜRLÜ dfo_weekly_points KULLANILIR
        const weekNum = parseInt(activeTab.replace('w', ''));
        const { data } = await supabase.from('dfo_weekly_points').select('*');

        if (data) {
           const list = data.map(row => {
               const uid = String(row.id || row.user_id || row.username);
               return {
                   id: uid,
                   name: playersList[uid] || "Bilinmiyor",
                   displayScore: row[`w${weekNum}`] || 0,
                   currentRank: 0,
                   trend: 'same',
                   trendDiff: 0,
                   liveExtra: 0
               }
           });
           const sortedList = list.sort((a, b) => b.displayScore - a.displayScore || a.name.localeCompare(b.name, 'tr'));
           setTableRows(sortedList.map((r, i) => ({ ...r, currentRank: i + 1 })));
        }
      }

      // Max Week (Hafta Butonları)
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('week_num').order('week_num', { ascending: false }).limit(1);
      if (dbBulletin && dbBulletin.length > 0) {
          setMaxWeek(dbBulletin[0].week_num);
      }

    } catch (e) {
        console.log("Veri çekilirken hata oluştu");
    }
  };

  useEffect(() => { 
      loadLeaderboard(); 
      // ⚡ CANLI RADAR: Arka plandaki motor tabloyu güncellediğinde DFO sayfası yenilemeye gerek kalmadan anında puanı günceller
      const channel = supabase.channel('dfo_live_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => {
           loadLeaderboard();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-blue-500 tracking-wider uppercase drop-shadow-md">DFO PUAN DURUMU</h1>
      </div>
      
      <div className="w-full max-w-3xl mx-auto mt-4">
        <button 
          onClick={() => { setActiveTab('total'); setIsMenuOpen(false); }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-3 transition-colors uppercase tracking-wide shadow-md border border-blue-500/50"
        >
          {activeTab === 'total' ? 'DFO TOPLAM PUAN DURUMU' : `DFO ${activeTab.replace('w', '')}. HAFTA PUAN DURUMU`}
        </button>

        <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6">
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer bg-[#0f172a] hover:bg-[#1e293b] transition-colors border-b border-[#1e293b]"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
              <span>📅</span>
              <span>{activeTab === 'total' ? 'TOPLAM PUAN DURUMU' : `${activeTab.replace('w', '')}. HAFTA PUAN DURUMU`}</span>
            </div>
            <div className="text-slate-400 font-bold text-[10px] uppercase flex items-center gap-1 tracking-widest">
              {isMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}
            </div>
          </div>

          {isMenuOpen && (
            <div className="w-full bg-[#0a0f1c] p-4 flex flex-wrap justify-center gap-3 border-b border-[#1e293b]">
              {[...Array(maxWeek)].map((_, idx) => {
                const num = idx + 1;
                return (
                  <button
                    key={num}
                    onClick={() => { setActiveTab(`w${num}`); setIsMenuOpen(false); }}
                    className={`w-12 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                      activeTab === `w${num}` ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'
                    }`}
                  >
                    {num}
                  </button>
                )
              })}
            </div>
          )}

          {tableRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                  <tr>
                    <th className="pl-2 md:pl-4 pr-1 py-3 w-12 md:w-16 text-left">SIRA</th>
                    <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                    <th className="pr-2 md:pr-4 pl-1 py-3 text-center whitespace-nowrap">
                      {activeTab === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}
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