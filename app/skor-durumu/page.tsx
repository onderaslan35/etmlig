'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

// allPlayersList BURADAN TAMAMEN SİLİNDİ!
// Artık oyuncular Supabase "players" tablosundan çekiliyor.

const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category.toUpperCase();
  return (uppercaseCat.includes("TÜRKİYE SÜPER LİG") || uppercaseCat.includes("TÜRKİYE 1.LİG") || uppercaseCat.includes("TÜRKİYE SÜPER KUPA"));
};

export default function SkorDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'w1'|'w2'|'w3'|'w4'|'w5'|'total'>('total');
  const [leagueFilter, setLeagueFilter] = useState<'MASTER'|'DFO'|'TFF'>('MASTER');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');

  const loadLeaderboard = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: dbPredictions } = await supabase.from('player_predictions').select('*').eq('week_num', 5);
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').eq('week_num', 5);
      const { data: dfoHistorical } = await supabase.from('dfo_weekly_scores').select('*');
      const { data: tffHistorical } = await supabase.from('tff_weekly_scores').select('*');

      const playersList: Record<string, string> = {};
      if (dbPlayers) {
        dbPlayers.forEach(p => {
          playersList[p.id] = p.name;
        });
      }

      let w5DfoLive: Record<string, number> = {}; 
      let w5TffLive: Record<string, number> = {}; 
      let isAnyMatchLive = false;

      Object.keys(playersList).forEach(id => { w5DfoLive[id] = 0; w5TffLive[id] = 0; });

      const dfoDict: Record<string, {w1:number, w2:number, w3:number, w4:number}> = {};
      if(dfoHistorical) dfoHistorical.forEach(r => dfoDict[r.id] = {w1:r.w1||0, w2:r.w2||0, w3:r.w3||0, w4:r.w4||0});
      const tffDict: Record<string, {w1:number, w2:number, w3:number, w4:number}> = {};
      if(tffHistorical) tffHistorical.forEach(r => tffDict[r.id] = {w1:r.w1||0, w2:r.w2||0, w3:r.w3||0, w4:r.w4||0});

      const predDict: Record<string, string[]> = {};
      if (dbPredictions) {
        dbPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          if (!predDict[uid]) predDict[uid] = Array(24).fill('-');
          predDict[uid][pred.match_index - 1] = pred.predicted_score;
        });
      }

      const catDict: Record<number, string> = {};
      if (dbBulletin) dbBulletin.forEach(m => catDict[m.match_index] = m.category);

      if (dbMatches) {
        // Ekmel Standard: Deduplication Filter
        const uniqueMatches: Record<number, any> = {};
        dbMatches.forEach(row => uniqueMatches[row.id] = row);

        Object.values(uniqueMatches).forEach(dbMatch => {
          if (dbMatch.id > 500 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const matchIndex = (dbMatch.id % 100) - 1;
            const category = catDict[matchIndex + 1] || "";
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            const isTff = isTffMatchCheck(category);
            
            const winnerIds = Object.keys(predDict).filter(id => predDict[id] && predDict[id][matchIndex] === targetScore);
            
            winnerIds.forEach(wId => {
              if (dbMatch.status === 'FINISHED' || dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') {
                if (isTff) w5TffLive[wId] += 1;
                else w5DfoLive[wId] += 1;
              }
              if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') isAnyMatchLive = true;
            });
          }
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      const baseList = Object.keys(playersList).map(id => {
        const dfo = dfoDict[id] || { w1: 0, w2: 0, w3: 0, w4: 0 };
        const tff = tffDict[id] || { w1: 0, w2: 0, w3: 0, w4: 0 };
        
        let w1=0, w2=0, w3=0, w4=0, w5=0, total=0, liveExtra=0;
        
        if (leagueFilter === 'MASTER') {
            w1 = dfo.w1 + tff.w1; w2 = dfo.w2 + tff.w2; w3 = dfo.w3 + tff.w3; w4 = dfo.w4 + tff.w4;
            w5 = w5DfoLive[id] + w5TffLive[id];
            liveExtra = w5;
        } else if (leagueFilter === 'DFO') {
            w1 = dfo.w1; w2 = dfo.w2; w3 = dfo.w3; w4 = dfo.w4; w5 = w5DfoLive[id]; liveExtra = w5;
        } else if (leagueFilter === 'TFF') {
            w1 = tff.w1; w2 = tff.w2; w3 = tff.w3; w4 = tff.w4; w5 = w5TffLive[id]; liveExtra = w5;
        }
        
        total = w1 + w2 + w3 + w4 + w5;

        return { id, name: playersList[id], w1, w2, w3, w4, w5, total, liveExtra };
      });

      const prevRefList = [...baseList].sort((a, b) => (b.w1+b.w2+b.w3+b.w4) - (a.w1+a.w2+a.w3+a.w4) || a.name.localeCompare(b.name, 'tr'));
      const prevRanks: Record<string, number> = {};
      prevRefList.forEach((player, index) => prevRanks[player.id] = index + 1);

      // SIFIR PUANI OLANLARI GİZLEME KURALI KALDIRILDI!
      const visibleList = baseList;

      visibleList.sort((a, b) => {
        const scoreA = activeTab === 'total' ? a.total : a[activeTab] as number;
        const scoreB = activeTab === 'total' ? b.total : b[activeTab] as number;
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

        let displayScore = activeTab === 'total' ? player.total : player[activeTab] as number;
        return { ...player, currentRank, trend, trendDiff, displayScore };
      });
      
      setTableRows(finalRows);

    } catch (e) {
        console.log("Veri çekilirken hata oluştu");
    }
  };

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, [activeTab, leagueFilter]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-[#10b981] tracking-wider uppercase drop-shadow-md">ELİT TAHMİN SKOR (TAM İSABET) MERKEZİ</h1>
      </div>
      
      <div className="w-full mb-6"><LiveMatchCard /></div>
      
      <div className="w-full max-w-3xl mx-auto">
        
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
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => { setActiveTab(`w${num}` as any); setIsMenuOpen(false); }}
                  className={`w-12 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                    activeTab === `w${num}` ? 'bg-[#10b981] text-[#022c22]' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'
                  }`}
                >
                  {num}
                </button>
              ))}
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
                          <div className="w-5 flex justify-center">
                            {activeTab === 'total' ? (
                              <>
                                {row.trend === 'up' && <span className="text-[#10b981] text-[10px] font-bold animate-bounce flex items-center gap-0.5">▲ <span className="text-[8px]">{row.trendDiff}</span></span>}
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
                            <span className="text-[#10b981] bg-[#10b981]/20 text-[8px] font-black px-1.5 py-0.5 rounded border border-[#10b981]/30 animate-pulse">
                              +{row.liveExtra} CANLI
                            </span>
                          )}
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