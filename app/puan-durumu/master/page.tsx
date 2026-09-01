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
  const [activeTab, setActiveTab] = useState<'w1'|'w2'|'w3'|'w4'|'w5'|'w6'|'total'>('total');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');

  const loadLeaderboard = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: dbHistorical } = await supabase.from('master_weekly_points').select('*');

      // 🔴 DİNAMİK MOTOR: 5. ve 6. HAFTA TAHMİNLERİNİN TAMAMINI ÇEKER 🔴
      let dbPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .gte('week_num', 5) // 🔥 5. Hafta ve sonrası her şeyi çeker!
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

      // OYUNCU SÖZLÜĞÜ
      const playersList: Record<string, string> = {};
      if (dbPlayers) {
        dbPlayers.forEach(p => { playersList[p.id] = p.name || p.full_name; });
      }

      let w5Base: Record<string, number> = {}; 
      let w5Live: Record<string, number> = {}; 
      let w5ExactScores: Record<string, number> = {}; 

      let w6Base: Record<string, number> = {}; 
      let w6Live: Record<string, number> = {}; 

      let isAnyMatchLive = false;

      Object.keys(playersList).forEach(id => { 
          w5Base[id] = 0; w5Live[id] = 0; w5ExactScores[id] = 0; 
          w6Base[id] = 0; w6Live[id] = 0;
      });

      const historicalDict: Record<string, {w1:number, w2:number, w3:number, w4:number}> = {};
      if(dbHistorical) {
          dbHistorical.forEach(row => {
              historicalDict[row.id] = { w1: row.w1||0, w2: row.w2||0, w3: row.w3||0, w4: row.w4||0 };
          });
      }

      // 🔥 TAHMİNLERİ EŞLEŞTİR 🔥
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

          if (weekNum >= 5 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
            
            const winnerIds = Object.keys(playersList).filter(id => {
                const pScore = predDict[`${id}-${weekNum}-${matchIndex}`];
                return pScore && pScore === targetScore;
            });
            
            let points = 1;
            if(winnerIds.length === 1) points = 12; else if(winnerIds.length === 2) points = 6; else if(winnerIds.length === 3) points = 5; else if(winnerIds.length === 4) points = 4; else if(winnerIds.length === 5) points = 3; else if(winnerIds.length === 6) points = 2; else if(winnerIds.length >= 7) points = 1; else points = 0;

            winnerIds.forEach(wId => {
              if (weekNum === 5) {
                  w5ExactScores[wId] += 1; 
                  if (dbMatch.status === 'FINISHED') w5Base[wId] += points;
                  else if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') { w5Live[wId] += points; isAnyMatchLive = true; }
              } else if (weekNum === 6) {
                  if (dbMatch.status === 'FINISHED') w6Base[wId] += points;
                  else if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') { w6Live[wId] += points; isAnyMatchLive = true; }
              }
            });
          }
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      let w5PointsLeaderId: string | null = null;
      let w5ScoreLeaderId: string | null = null;
      let showW5Badges = false;
      let showW5BadgesOnTotal = false;

      const match524 = uniqueMatches[524]; 
      if (match524 && (match524.status === 'LIVE' || match524.status === 'FINISHED' || match524.status === 'WAITING_APPROVAL')) {
          showW5Badges = true;

          let maxPts = -1;
          let ptLeaders: string[] = [];
          Object.keys(playersList).forEach(id => {
              const pts = (w5Base[id] || 0) + (w5Live[id] || 0);
              if (pts > maxPts) { maxPts = pts; ptLeaders = [id]; }
              else if (pts === maxPts) { ptLeaders.push(id); }
          });
          if (ptLeaders.length === 1) w5PointsLeaderId = ptLeaders[0];

          let maxSc = -1;
          let scLeaders: string[] = [];
          Object.keys(playersList).forEach(id => {
              const sc = w5ExactScores[id] || 0;
              if (sc > maxSc) { maxSc = sc; scLeaders = [id]; }
              else if (sc === maxSc) { scLeaders.push(id); }
          });
          if (scLeaders.length === 1 && maxSc > 0) w5ScoreLeaderId = scLeaders[0];

          const match601 = uniqueMatches[601];
          if (!match601 || match601.status === 'NOT_STARTED') {
              showW5BadgesOnTotal = true;
          }
      }

      const baseList = Object.keys(playersList).map(id => {
        const past = historicalDict[id] || { w1: 0, w2: 0, w3: 0, w4: 0 };
        const w5Total = (w5Base[id] || 0) + (w5Live[id] || 0);
        const w6Total = (w6Base[id] || 0) + (w6Live[id] || 0);
        const total = past.w1 + past.w2 + past.w3 + past.w4 + w5Total + w6Total;
        return { 
          id, name: playersList[id], 
          w1: past.w1, w2: past.w2, w3: past.w3, w4: past.w4, w5: w5Total, w6: w6Total, total, 
          liveExtra: (w5Live[id] || 0) + (w6Live[id] || 0) 
        };
      });

      const prevRefList = [...baseList].sort((a, b) => (a.total - a.liveExtra) - (b.total - b.liveExtra) || a.name.localeCompare(b.name, 'tr'));
      const prevRanks: Record<string, number> = {};
      prevRefList.reverse().forEach((player, index) => { prevRanks[player.id] = index + 1; });

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

        let badges: string[] = [];
        const cleanName = player.name.replace(/🏆/g, '').trim().toUpperCase();

        if (activeTab === 'w1' && historicalBadges.w1[cleanName as keyof typeof historicalBadges.w1]) badges = historicalBadges.w1[cleanName as keyof typeof historicalBadges.w1];
        if (activeTab === 'w2' && historicalBadges.w2[cleanName as keyof typeof historicalBadges.w2]) badges = historicalBadges.w2[cleanName as keyof typeof historicalBadges.w2];
        if (activeTab === 'w3' && historicalBadges.w3[cleanName as keyof typeof historicalBadges.w3]) badges = historicalBadges.w3[cleanName as keyof typeof historicalBadges.w3];
        if (activeTab === 'w4' && historicalBadges.w4[cleanName as keyof typeof historicalBadges.w4]) badges = historicalBadges.w4[cleanName as keyof typeof historicalBadges.w4];

        if (activeTab === 'w5' && showW5Badges) {
            if (player.id === w5PointsLeaderId) badges.push('points');
            if (player.id === w5ScoreLeaderId) badges.push('score');
        }

        if (activeTab === 'total' && showW5BadgesOnTotal) {
            if (player.id === w5PointsLeaderId) badges.push('points');
            if (player.id === w5ScoreLeaderId) badges.push('score');
        }

        let displayScore = activeTab === 'total' ? player.total : player[activeTab] as number;
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
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => { setActiveTab(`w${num}` as any); setIsMenuOpen(false); }}
                  className={`w-12 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                    activeTab === `w${num}` ? 'bg-[#f59e0b] text-black' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'
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
                          
                          {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === 'w6' || activeTab === 'w5') && (
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