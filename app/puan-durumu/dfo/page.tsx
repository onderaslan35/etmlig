'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

// 🔴 EKMEL DEVRİMİ: TAM OTOMATİK DFO HESAPLAMA VE 1000 LİMİT KIRICI 🔴

const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category ? category.toUpperCase() : '';
  return (uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG"));
};

export default function DfoPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'w1'|'w2'|'w3'|'w4'|'w5'|'total'>('total');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');

  const loadLeaderboard = async () => {
    try {
      // 1. OYUNCULARI VE CANLI MAÇLARI ÇEK
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      
      // SADECE DFO KASASININ GEÇMİŞ HAFTA VERİLERİ
      const { data: dbHistorical } = await supabase.from('standings').select('*').eq('league_type', 'DFO');

      // 🔴 1000 LİMİT KIRICI VE SIRALAMA GARANTİSİ 🔴
      let dbPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .eq('week_num', 5)
          .order('user_id', { ascending: true })
          .order('match_index', { ascending: true })
          .range(from, from + step - 1);
          
        if (!error && pDataChunk && pDataChunk.length > 0) {
           dbPredictions = [...dbPredictions, ...pDataChunk];
           if (pDataChunk.length < step) fetchMore = false; 
           else from += step; 
        } else {
           fetchMore = false; 
        }
      }

      // DFO BÜLTENİNİ ÇEK Kİ SADECE AVRUPA MAÇLARINI HESAPLASIN
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').eq('week_num', 5);
      const dfoMatchIndexes: number[] = [];
      if (dbBulletin) {
         dbBulletin.forEach(m => {
            if (!isTffMatchCheck(m.category)) {
                dfoMatchIndexes.push(m.match_index);
            }
         });
      }

      // 2. DİNAMİK OYUNCU SÖZLÜĞÜNÜ OLUŞTUR
      const playersList: Record<string, string> = {};
      if (dbPlayers) {
        dbPlayers.forEach(p => { playersList[p.id] = p.name || p.full_name; });
      }

      let w5Base: Record<string, number> = {}; 
      let w5Live: Record<string, number> = {}; 
      let isAnyMatchLive = false;

      Object.keys(playersList).forEach(id => { w5Base[id] = 0; w5Live[id] = 0; });

      // GEÇMİŞ DFO PUANLARI SÖZLÜĞÜ
      const historicalDict: Record<string, number> = {};
      if(dbHistorical) {
          dbHistorical.forEach(row => { historicalDict[row.user_id] = row.points || 0; });
      }

      const predDict: Record<string, string[]> = {};
      if (dbPredictions && dbPredictions.length > 0) {
        dbPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          if (!predDict[uid]) predDict[uid] = Array(24).fill('-');
          predDict[uid][pred.match_index - 1] = pred.predicted_score;
        });
      }

      const uniqueMatches: Record<number, any> = {};
      if (dbMatches) {
        dbMatches.forEach(row => uniqueMatches[row.id] = row);

        Object.values(uniqueMatches).forEach(dbMatch => {
          if (dbMatch.id > 500 && dbMatch.id < 600 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const matchIndex = (dbMatch.id % 100) - 1;
            
            // EĞER BU MAÇ DFO (AVRUPA) MAÇI DEĞİLSE HESAPLAMADAN ATLA!
            if (!dfoMatchIndexes.includes(matchIndex + 1)) return;

            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            const winnerIds = Object.keys(predDict).filter(id => predDict[id] && predDict[id][matchIndex] === targetScore);
            
            let points = 1;
            if(winnerIds.length === 1) points = 12; else if(winnerIds.length === 2) points = 6; else if(winnerIds.length === 3) points = 5; else if(winnerIds.length === 4) points = 4; else if(winnerIds.length === 5) points = 3; else if(winnerIds.length === 6) points = 2; else points = 1;

            winnerIds.forEach(wId => {
              if (dbMatch.status === 'FINISHED') w5Base[wId] += points;
              else if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') {
                w5Live[wId] += points;
                isAnyMatchLive = true;
              }
            });
          }
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      // 4. LİSTEYİ OLUŞTUR
      const baseList = Object.keys(playersList).map(id => {
        const pastDfoPoints = historicalDict[id] || 0;
        
        // Sadece geçmiş tablo ve canlıyı topluyoruz (Çifte sayımı önlemek için)
        const total = pastDfoPoints + (w5Live[id] || 0);

        return { 
          id, name: playersList[id], 
          past: pastDfoPoints, w5: w5Base[id] || 0, total, 
          liveExtra: w5Live[id] || 0 
        };
      });

      // ÖNCEKİ HAFTA SIRALAMASINI BULMAK İÇİN (Canlı Olmayan Hal)
      const prevRefList = [...baseList].sort((a, b) => b.past - a.past || a.name.localeCompare(b.name, 'tr'));
      const prevRanks: Record<string, number> = {};
      prevRefList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

      const visibleList = baseList;

      visibleList.sort((a, b) => {
        const scoreA = activeTab === 'total' ? a.total : a.w5;
        const scoreB = activeTab === 'total' ? b.total : b.w5;
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

        let displayScore = activeTab === 'total' ? player.total : player.w5;
        return { ...player, currentRank, trend, trendDiff, displayScore };
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
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-blue-400 tracking-wider uppercase drop-shadow-md">DFO PUAN DURUMU</h1>
      </div>
      
      <div className="w-full mb-6"><LiveMatchCard /></div>
      
      <div className="w-full max-w-3xl mx-auto">
        <button 
          onClick={() => { setActiveTab('total'); setIsMenuOpen(false); }}
          className="w-full bg-[#1d4ed8] hover:bg-blue-600 text-white font-bold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-3 transition-colors uppercase tracking-wide"
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
              <button onClick={() => { setActiveTab('w5'); setIsMenuOpen(false); }} className={`w-12 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${activeTab === 'w5' ? 'bg-[#1d4ed8] text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'}`}>5</button>
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
                      <td className="pl-2 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium">
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
                          {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === 'w5') && (
                            <span className="text-emerald-400 bg-emerald-950/30 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                              +{row.liveExtra} CANLI
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="pr-2 md:pr-4 pl-1 py-3 text-center font-bold text-sm text-white">
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