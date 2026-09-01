'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
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
  const [maxWeek, setMaxWeek] = useState<number>(6); // SONSUZ DÖNGÜ İÇİN DİNAMİK HAFTA

  const loadLeaderboard = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: dbHistorical } = await supabase.from('master_weekly_points').select('*');
      
      // 🔴 ADMİN PANELİNDEN KESİLEN BONUSLARI (+3) ÇEKER 🔴
      const { data: dbBonusPoints } = await supabase
        .from('points')
        .select('*')
        .eq('kategori', 'MASTER')
        .in('ev_sahibi', ['HAFTANIN', 'SKOR']);

      const dynamicBonuses: Record<number, Record<string, number>> = {};
      const dynamicBadges: Record<string, string[]> = {};
      
      // OYUNCU SÖZLÜĞÜ
      const playersList: Record<string, string> = {};
      if (dbPlayers) {
        dbPlayers.forEach(p => { playersList[p.id] = p.name || p.full_name; });
      }

      if (dbBonusPoints) {
          dbBonusPoints.forEach(b => {
              if (!dynamicBonuses[b.hafta]) dynamicBonuses[b.hafta] = {};
              if (!dynamicBonuses[b.hafta][b.username]) dynamicBonuses[b.hafta][b.username] = 0;
              dynamicBonuses[b.hafta][b.username] += b.puan;

              const cleanName = playersList[b.username]?.replace(/🏆/g, '').trim().toUpperCase();
              if (cleanName) {
                  if (!dynamicBadges[`w${b.hafta}-${cleanName}`]) dynamicBadges[`w${b.hafta}-${cleanName}`] = [];
                  if (b.ev_sahibi === 'HAFTANIN') dynamicBadges[`w${b.hafta}-${cleanName}`].push('points');
                  if (b.ev_sahibi === 'SKOR') dynamicBadges[`w${b.hafta}-${cleanName}`].push('score');
              }
          });
      }

      // 🔴 DİNAMİK MOTOR: 5. HAFTADAN SONSUZA KADAR TAHMİNLERİ ÇEKER 🔴
      let dbPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .gte('week_num', 5)
          .order('id', { ascending: true }) 
          .range(from, from + step - 1);
          
        if (!error && pDataChunk && pDataChunk.length > 0) {
           dbPredictions = [...dbPredictions, ...pDataChunk];
           if (pDataChunk.length < step) fetchMore = false; 
           else from += step; 
        } else {
           fetchMore = false; 
        }
      }

      // 🔴 ESKİ KÖR LİMİTLER KALDIRILDI! 20. HAFTAYA KADAR HAZIR KASALAR 🔴
      let dBase: Record<number, Record<string, number>> = {}; 
      let dLive: Record<number, Record<string, number>> = {}; 
      for (let w = 5; w <= 30; w++) {
          dBase[w] = {}; dLive[w] = {};
          Object.keys(playersList).forEach(id => { dBase[w][id] = 0; dLive[w][id] = 0; });
      }

      let isAnyMatchLive = false;
      let highestWeekFound = 6; // En az 6 sekmesi görünsün

      const historicalDict: Record<string, {w1:number, w2:number, w3:number, w4:number}> = {};
      if(dbHistorical) {
          dbHistorical.forEach(row => {
              historicalDict[row.id] = { w1: row.w1||0, w2: row.w2||0, w3: row.w3||0, w4: row.w4||0 };
          });
      }

      const predDict: Record<string, string> = {};
      if (dbPredictions && dbPredictions.length > 0) {
        dbPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          predDict[`${uid}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, '');
        });
      }

      const uniqueMatches: Record<number, any> = {};
      if (dbMatches) {
        dbMatches.forEach(row => uniqueMatches[row.id] = row);

        Object.values(uniqueMatches).forEach(dbMatch => {
          const weekNum = Math.floor(dbMatch.id / 100);
          const matchIndex = dbMatch.id % 100;

          // 5. HAFTADAN İTİBAREN TÜM MAÇLARI OTOMATİK TANIR (7, 8, 9 FARK ETMEZ)
          if (weekNum >= 5 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            if (weekNum > highestWeekFound) highestWeekFound = weekNum;

            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
            
            const winnerIds = Object.keys(playersList).filter(id => {
                const pScore = predDict[`${id}-${weekNum}-${matchIndex}`];
                return pScore && pScore === targetScore;
            });
            
            let points = 1;
            if(winnerIds.length === 1) points = 12; else if(winnerIds.length === 2) points = 6; else if(winnerIds.length === 3) points = 5; else if(winnerIds.length === 4) points = 4; else if(winnerIds.length === 5) points = 3; else if(winnerIds.length === 6) points = 2; else if(winnerIds.length >= 7) points = 1; else points = 0;

            winnerIds.forEach(wId => {
                if (dbMatch.status === 'FINISHED') {
                    dBase[weekNum][wId] += points;
                } else if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') { 
                    dLive[weekNum][wId] += points; 
                    isAnyMatchLive = true; 
                }
            });
          }
        });
      }

      setMaxWeek(highestWeekFound);
      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      // LİSTEYİ OLUŞTUR
      const baseList = Object.keys(playersList).map(id => {
        const past = historicalDict[id] || { w1: 0, w2: 0, w3: 0, w4: 0 };
        
        let dynamicTotalBase = 0;
        let dynamicTotalLive = 0;
        const playerObj: any = { 
            id, name: playersList[id], 
            w1: past.w1, w2: past.w2, w3: past.w3, w4: past.w4
        };

        for (let w = 5; w <= highestWeekFound; w++) {
            const wBase = dBase[w][id] || 0;
            const wLive = dLive[w][id] || 0;
            const wBonus = (dynamicBonuses[w] && dynamicBonuses[w][id]) ? dynamicBonuses[w][id] : 0;
            
            playerObj[`w${w}`] = wBase + wLive + wBonus; // Haftalık Sekme Toplamı
            dynamicTotalBase += (wBase + wBonus);
            dynamicTotalLive += wLive;
        }

        playerObj.total = past.w1 + past.w2 + past.w3 + past.w4 + dynamicTotalBase + dynamicTotalLive;
        playerObj.liveExtra = dynamicTotalLive;

        return playerObj;
      });

      const prevRefList = [...baseList].sort((a, b) => (a.total - a.liveExtra) - (b.total - b.liveExtra) || a.name.localeCompare(b.name, 'tr'));
      const prevRanks: Record<string, number> = {};
      prevRefList.reverse().forEach((player, index) => { prevRanks[player.id] = index + 1; });

      const visibleList = baseList; 

      visibleList.sort((a, b) => {
        const scoreA = activeTab === 'total' ? a.total : (a[activeTab] || 0);
        const scoreB = activeTab === 'total' ? b.total : (b[activeTab] || 0);
        return scoreB - scoreA || a.name.localeCompare(b.name, 'tr');
      });

      const finalRows = visibleList.map((player, index) => {
        const currentRank = index + 1;
        let trend = 'same', trendDiff = 0; 
        
        if (activeTab === 'total') {
            const prevRank = prevRanks[player.id];
            if (currentRank < prevRank) { trend = 'up'; trendDiff = prevRank - currentRank; } 
            else if (currentRank > prevRank) { trend = 'down'; trendDiff = currentRank - prevRank; }
        }

        let badges: string[] = [];
        const cleanName = player.name.replace(/🏆/g, '').trim().toUpperCase();

        if (activeTab === 'w1' && historicalBadges.w1[cleanName as keyof typeof historicalBadges.w1]) badges = historicalBadges.w1[cleanName as keyof typeof historicalBadges.w1];
        if (activeTab === 'w2' && historicalBadges.w2[cleanName as keyof typeof historicalBadges.w2]) badges = historicalBadges.w2[cleanName as keyof typeof historicalBadges.w2];
        if (activeTab === 'w3' && historicalBadges.w3[cleanName as keyof typeof historicalBadges.w3]) badges = historicalBadges.w3[cleanName as keyof typeof historicalBadges.w3];
        if (activeTab === 'w4' && historicalBadges.w4[cleanName as keyof typeof historicalBadges.w4]) badges = historicalBadges.w4[cleanName as keyof typeof historicalBadges.w4];

        // 🔴 YENİ DİNAMİK ROZET SİSTEMİ (7. Hafta ve Sonrası İçin Admin Panelinden Okur)
        if (activeTab.startsWith('w') && parseInt(activeTab.replace('w', '')) >= 5) {
            const dynamicB = dynamicBadges[`${activeTab}-${cleanName}`];
            if (dynamicB) badges = [...badges, ...dynamicB];
        }

        let displayScore = activeTab === 'total' ? player.total : (player[activeTab] || 0);
        return { ...player, currentRank, trend, trendDiff, displayScore, badges };
      });
      
      setTableRows(finalRows);

    } catch (e) {
        console.log("Veri çekilirken hata oluştu");
    }
  };

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md">ELİT TAHMİN MASTER LİGİ</h1>
      </div>
      
      <div className="w-full mb-6"><LiveMatchCard /></div>
      
      <div className="w-full max-w-3xl mx-auto">
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
                          
                          {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === `w${maxWeek}`) && (
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