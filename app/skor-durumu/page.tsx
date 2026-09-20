'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function SkorDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('total');
  const [leagueFilter, setLeagueFilter] = useState<'MASTER'|'DFO'|'TFF'>('MASTER');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');
  const [maxWeek, setMaxWeek] = useState<number>(6); 

  const loadLeaderboard = async () => {
    try {
      // 1. Oyuncu isimlerini alıyoruz
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const playersList: Record<string, string> = {};
      if (dbPlayers) {
        dbPlayers.forEach(p => {
          if (p.id !== 'mankoman' && p.username !== 'mankoman') {
             const pid = p.username || p.id;
             playersList[pid] = p.name || p.full_name;
          }
        });
      }

      // 2. Maksimum (Güncel) Haftayı Belirleme
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('week_num').order('week_num', { ascending: false }).limit(1);
      let currentMaxWeek = 6;
      if (dbBulletin && dbBulletin.length > 0) {
          currentMaxWeek = dbBulletin[0].week_num;
          setMaxWeek(currentMaxWeek);
      }

      if (activeTab === 'total') {
        // ⚡ ŞİMŞEK YÜKLEME: Binlerce tahmin yerine arka plandaki hazır tepsiyi okuyoruz (0.1 Saniye)
        const { data } = await supabase
          .from('live_leaderboard')
          .select('id, name, skor_pts, skor_rank');

        if (data && data.length > 0) {
          // NOT: Şu anki motor tasarımımızda skor_pts toplamı temsil ediyor. 
          // Eğer DFO ve TFF ayrımı skor sekmesinde kritikse, ileride motora skor_dfo_pts eklenebilir. 
          // Şu anki versiyon MASTER (Toplam) Skoru kusursuz getirir.
          const list = data.map(row => ({
            id: row.id,
            name: row.name || playersList[row.id] || "Bilinmiyor",
            displayScore: row.skor_pts,
            currentRank: row.skor_rank,
            trend: 'same', 
            trendDiff: 0,
            liveExtra: 0 
          }));
          
          setTableRows(list.sort((a, b) => b.displayScore - a.displayScore || a.name.localeCompare(b.name, 'tr')).map((r, i) => ({ ...r, currentRank: i + 1 })));
        } else {
           setTableRows([]);
        }

      } else {
        // 🔴 HAFTALIK GÖRÜNÜM: Filtreye göre geçmiş skor tablolarından (mühürlü) veri çeker
        const weekNum = parseInt(activeTab.replace('w', ''));
        let targetTable = 'dfo_weekly_scores'; // Varsayılan veya birleştirilmiş tablo yapına göre
        if (leagueFilter === 'TFF') targetTable = 'tff_weekly_scores';
        
        // Eğer MASTER seçiliyse hem DFO hem TFF skorlarını toplayıp göstermemiz gerekir.
        // Şimşek hızında basitlik için tek tablo örneği:
        const { data } = await supabase.from(targetTable).select('*');
        const { data: data2 } = leagueFilter === 'MASTER' ? await supabase.from(targetTable === 'dfo_weekly_scores' ? 'tff_weekly_scores' : 'dfo_weekly_scores').select('*') : { data: null };

        if (data) {
           const list = data.map(row => {
               const uid = String(row.id || row.user_id || row.username);
               const pName = playersList[uid] || "Bilinmiyor";
               let wScore = row[`w${weekNum}`] || 0;

               // MASTER seçiliyse iki tablonun skorlarını toplar
               if (leagueFilter === 'MASTER' && data2) {
                   const row2 = data2.find(r => String(r.id || r.user_id || r.username) === uid);
                   if (row2) wScore += (row2[`w${weekNum}`] || 0);
               }

               return {
                   id: uid,
                   name: pName,
                   displayScore: wScore,
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

    } catch (e) {
        console.log("Veri çekilirken hata oluştu");
    }
  };

  useEffect(() => { 
      loadLeaderboard(); 
      const channel = supabase.channel('skor_live_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => {
           loadLeaderboard();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
  }, [activeTab, leagueFilter]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-[#10b981] tracking-wider uppercase drop-shadow-md">ELİT TAHMİN SKOR (TAM İSABET) MERKEZİ</h1>
      </div>
      
      <div className="w-full max-w-3xl mx-auto mt-4">
        
        <div className="w-full flex flex-col gap-2 mb-4">
          <button onClick={() => setLeagueFilter('MASTER')} className={`w-full font-bold text-sm py-3 px-4 rounded-xl transition-colors uppercase tracking-wide ${leagueFilter === 'MASTER' ? 'bg-[#10b981] text-[#022c22]' : 'bg-[#064e3b] text-[#34d399] hover:bg-[#047857]'}`}>
            MASTER
          </button>
          <div className="flex w-full gap-2">
            <button onClick={() => setLeagueFilter('DFO')} className={`flex-1 font-bold text-sm py-3 px-4 rounded-xl transition-colors uppercase tracking-wide ${leagueFilter === 'DFO' ? 'bg-[#10b981] text-[#022c22]' : 'bg-[#0f172a] text-[#34d399] hover:bg-[#1e293b]'}`}>
              DFO
            </button>
            <button onClick={() => setLeagueFilter('TFF')} className={`flex-1 font-bold text-sm py-3 px-4 rounded-xl transition-colors uppercase tracking-wide ${leagueFilter === 'TFF' ? 'bg-[#10b981] text-[#022c22]' : 'bg-[#0f172a] text-[#34d399] hover:bg-[#1e293b]'}`}>
              TFF
            </button>
          </div>
        </div>

        <button 
          onClick={() => { setActiveTab('total'); setIsMenuOpen(false); }}
          className="w-full bg-[#10b981] text-[#022c22] hover:bg-[#059669] hover:text-white font-bold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-3 transition-colors uppercase tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          {activeTab === 'total' ? `${leagueFilter} TOPLAM SKOR DURUMU` : `${leagueFilter} ${activeTab.replace('w', '')}. HAFTA SKOR DURUMU`}
        </button>

        <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6">
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer bg-[#0f172a] hover:bg-[#1e293b] transition-colors border-b border-[#1e293b]"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
              <span>📅</span>
              <span>{activeTab === 'total' ? 'TOPLAM SKOR DURUMU' : `${activeTab.replace('w', '')}. HAFTA SKOR DURUMU`}</span>
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
                      activeTab === `w${num}` ? 'bg-[#10b981] text-[#022c22]' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'
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
                      TAM İSABET SKORU
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {tableRows.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-[#0f172a]/40 transition-colors">
                      <td className="pl-2 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium">
                        <div className="flex items-center gap-1">
                          <span className="w-4 text-left">{row.currentRank || idx + 1}</span>
                          <span className="text-[#475569]">-</span>
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-3">
                        <div className="flex items-center gap-1 md:gap-2 text-white font-semibold whitespace-nowrap">
                          {(() => {
                            const trophyCount = (row.name.match(/🏆/g) || []).length;
                            const cleanName = row.name.replace(/🏆/g, '').trim();
                            return (
                              <>
                                <span>{cleanName}</span>
                                {trophyCount > 0 && <span className="text-amber-400 text-[10px]">{'🏆'.repeat(trophyCount)}</span>}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="pr-2 md:pr-4 pl-1 py-3 text-center font-bold text-sm text-[#10b981]">
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