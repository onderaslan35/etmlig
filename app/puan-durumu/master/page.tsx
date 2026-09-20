'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// 🔴 GEÇMİŞ HAFTALARIN KESİNLEŞMİŞ (MÜHÜRLÜ) ROZETLERİ 🔴
const historicalBadges = {
  w1: { "MEHMET ALİ KARA": ["points"], "DOĞAÇ ALKAN": ["score"] },
  w2: { "EYÜP KARACAOĞLU": ["points"] },
  w3: { "SEDAT SEDAT": ["points", "score"] },
  w4: { "İSMAİL EKER": ["points"], "ŞENOL CAN ÇAKICI": ["score"] }
};

export default function MasterPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('total');
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
          const pid = p.username || p.id;
          if (pid !== 'mankoman') {
              playersList[pid] = p.name || p.full_name; 
          }
        });
      }

      // 2. Maksimum Haftayı Belirleme
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('week_num').order('week_num', { ascending: false }).limit(1);
      let currentMaxWeek = 6;
      if (dbBulletin && dbBulletin.length > 0) {
          currentMaxWeek = dbBulletin[0].week_num;
          setMaxWeek(currentMaxWeek);
      }

      // 3. KALICI (MÜHÜRLÜ) ROZETLERİ ÇEKME (Hızlı çekim)
      const { data: dbBonusPoints } = await supabase
        .from('points')
        .select('*')
        .eq('kategori', 'MASTER')
        .in('ev_sahibi', ['HAFTANIN', 'SKOR']);

      const dynamicBadges: Record<string, string[]> = {};
      if (dbBonusPoints) {
          dbBonusPoints.forEach(b => {
              const cleanName = playersList[b.username]?.replace(/🏆/g, '').trim().toUpperCase();
              if (cleanName) {
                  if (!dynamicBadges[`w${b.hafta}-${cleanName}`]) dynamicBadges[`w${b.hafta}-${cleanName}`] = [];
                  if (b.ev_sahibi === 'HAFTANIN') dynamicBadges[`w${b.hafta}-${cleanName}`].push('points');
                  if (b.ev_sahibi === 'SKOR') dynamicBadges[`w${b.hafta}-${cleanName}`].push('score');
              }
          });
      }

      if (activeTab === 'total') {
        // ⚡ ŞİMŞEK YÜKLEME: Puan ve Trend okları doğrudan tepsiden alınır
        const { data } = await supabase
          .from('live_leaderboard')
          // 🔥 HATA DÜZELTİLDİ: trend_direction ve trend_diff eklendi
          .select('id, name, master_pts, master_rank, trend_direction, trend_diff');

        if (data && data.length > 0) {
          const list = data.map(row => {
            const cleanName = (row.name || playersList[row.id] || "Bilinmiyor").replace(/🏆/g, '').trim().toUpperCase();
            let badges: string[] = [];
            
            // Tüm mühürlü rozetleri toplama yansıt
            for (let w = 1; w <= currentMaxWeek; w++) {
                if (w <= 4) {
                   const hB = (historicalBadges as any)[`w${w}`]?.[cleanName];
                   if (hB) badges = [...new Set([...badges, ...hB])];
                } else {
                   const dynB = dynamicBadges[`w${w}-${cleanName}`];
                   if (dynB) badges = [...new Set([...badges, ...dynB])];
                }
            }

            return {
              id: row.id,
              name: row.name || playersList[row.id] || "Bilinmiyor",
              displayScore: row.master_pts,
              currentRank: row.master_rank,
              trend: row.trend_direction || 'same', // 🔥 OK YÖNÜ TEPSİDEN GELDİ
              trendDiff: row.trend_diff || 0,       // 🔥 OK FARK TEPSİDEN GELDİ
              badges,
              liveExtra: 0 
            };
          });
          
          setTableRows(list.sort((a, b) => b.displayScore - a.displayScore || a.name.localeCompare(b.name, 'tr')).map((r, i) => ({ ...r, currentRank: i + 1 })));
        } else {
           setTableRows([]);
        }

      } else {
        // 🔴 HAFTALAR BOŞ DÖNÜYORDU, ÇÜNKÜ TEK BİR TABLO YETMİYOR 🔴
        // Master haftalık puanı, DFO + TFF + Bonusların toplamıdır.
        const weekNum = parseInt(activeTab.replace('w', ''));
        
        const [dfoData, tffData] = await Promise.all([
             supabase.from('dfo_weekly_points').select('*'),
             supabase.from('tff_weekly_points').select('*')
        ]);

        const playersDict: Record<string, number> = {};
        
        if (dfoData.data) {
            dfoData.data.forEach(row => {
                const uid = String(row.id || row.user_id || row.username);
                playersDict[uid] = (playersDict[uid] || 0) + (row[`w${weekNum}`] || 0);
            });
        }
        
        if (tffData.data) {
            tffData.data.forEach(row => {
                const uid = String(row.id || row.user_id || row.username);
                playersDict[uid] = (playersDict[uid] || 0) + (row[`w${weekNum}`] || 0);
            });
        }

        // Haftanın Bonusları
        if (dbBonusPoints) {
            dbBonusPoints.filter(b => b.hafta === weekNum).forEach(b => {
                const uid = String(b.username);
                playersDict[uid] = (playersDict[uid] || 0) + b.puan;
            });
        }

        const list = Object.keys(playersList).map(uid => {
            const pName = playersList[uid] || "Bilinmiyor";
            const cleanName = pName.replace(/🏆/g, '').trim().toUpperCase();
            let badges: string[] = [];

            if (weekNum <= 4) {
                const hB = (historicalBadges as any)[`w${weekNum}`]?.[cleanName];
                if (hB) badges = [...badges, ...hB];
            } else {
                const dynB = dynamicBadges[`w${weekNum}-${cleanName}`];
                if (dynB) badges = [...badges, ...dynB];
            }

            return {
                id: uid,
                name: pName,
                displayScore: playersDict[uid] || 0,
                currentRank: 0,
                trend: 'same',
                trendDiff: 0,
                badges,
                liveExtra: 0
            };
        });

        const sortedList = list.sort((a, b) => b.displayScore - a.displayScore || a.name.localeCompare(b.name, 'tr'));
        setTableRows(sortedList.map((r, i) => ({ ...r, currentRank: i + 1 })));
      }

    } catch (e) {
        console.log("Veri çekilirken hata oluştu");
    }
  };

  useEffect(() => { 
      loadLeaderboard(); 
      const channel = supabase.channel('master_live_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_leaderboard' }, () => {
           loadLeaderboard();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md">ELİT TAHMİN MASTER LİGİ</h1>
      </div>
      
      <div className="w-full max-w-3xl mx-auto mt-4">
        <button 
          onClick={() => { setActiveTab('total'); setIsMenuOpen(false); }}
          className="w-full bg-[#f59e0b] hover:bg-amber-600 text-black font-extrabold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-3 transition-colors uppercase tracking-wide"
        >
          {activeTab === 'total' ? 'MASTER TOPLAM PUAN DURUMU' : `MASTER ${activeTab.replace('w', '')}. HAFTA PUAN DURUMU`}
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
                      activeTab === `w${num}` ? 'bg-[#f59e0b] text-black' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'
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
                          <div className="w-5 flex justify-center">
                            {activeTab === 'total' ? (
                              <>
                                {row.trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold animate-bounce flex items-center gap-0.5">▲ <span className="text-[8px]">{row.trendDiff}</span></span>}
                                {row.trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5">▼ <span className="text-[8px]">{row.trendDiff}</span></span>}
                                {row.trend === 'same' && <span className="text-transparent text-[8px]">-</span>}
                              </>
                            ) : (
                              <span className="text-transparent">-</span>
                            )}
                          </div>
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
                          
                          {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab.startsWith('w')) && (
                            <span className="text-emerald-400 bg-emerald-950/30 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30 animate-pulse whitespace-nowrap">
                              +{row.liveExtra} CANLI
                            </span>
                          )}
                          
                          {row.badges && row.badges.includes('points') && (
                            <span className="bg-amber-950/60 text-amber-500 border border-amber-600/50 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                              +3 PUAN HAFTANIN LİDERİ
                            </span>
                          )}
                          
                          {row.badges && row.badges.includes('score') && (
                            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-600/50 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                              +3 PUAN SKOR LİDERİ
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="pr-2 md:pr-4 pl-1 py-3 text-center font-bold text-sm text-amber-500 align-top pt-3.5">
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