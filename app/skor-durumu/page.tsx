'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

// Oyuncular Supabase "players" tablosundan dinamik çekiliyor.

const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category ? category.toUpperCase() : '';
  return (
    uppercaseCat.includes("TÜRKİYE") || 
    uppercaseCat.includes("TFF") || 
    uppercaseCat.includes("AMATÖR") || 
    uppercaseCat.includes("PTT") || 
    uppercaseCat.includes("2.LİG") || 
    uppercaseCat.includes("3.LİG")
  );
};

export default function SkorDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('total');
  const [leagueFilter, setLeagueFilter] = useState<'MASTER'|'DFO'|'TFF'>('MASTER');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');
  const [maxWeek, setMaxWeek] = useState<number>(6); // SONSUZ MOTOR İÇİN

  const loadLeaderboard = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      
      // 🔥 BÜLTEN: 5. ve Sonrası Tüm Maçları Çek
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').gte('week_num', 5);
      
      const { data: dfoHistorical } = await supabase.from('dfo_weekly_scores').select('*');
      const { data: tffHistorical } = await supabase.from('tff_weekly_scores').select('*');

      // 🔴 1000 LİMİT KIRICI VE EKSİKSİZ TAHMİN TOPLAYICI (5. HAFTADAN SONSUZA) 🔴
      let allPredictions: any[] = [];
      let from = 0;
      let step = 1000;
      let keepFetching = true;

      while(keepFetching) {
          const { data, error } = await supabase
              .from('player_predictions')
              .select('*')
              .gte('week_num', 5)
              .order('id', { ascending: true })
              .range(from, from + step - 1);
          
          if (!error && data && data.length > 0) {
              allPredictions = [...allPredictions, ...data];
              if (data.length < step) keepFetching = false;
              else from += step;
          } else {
              keepFetching = false;
          }
      }

      const playersList: Record<string, string> = {};
      if (dbPlayers) {
        dbPlayers.forEach(p => {
          if (p.id !== 'mankoman') {
             playersList[p.id] = p.name || p.full_name;
          }
        });
      }

      // 🔴 ESKİ KÖR LİMİTLER KALDIRILDI! 38. HAFTAYA KADAR HAZIR KASALAR 🔴
      let dynDfoBase: Record<number, Record<string, number>> = {};
      let dynTffBase: Record<number, Record<string, number>> = {};
      let dynDfoLive: Record<number, Record<string, number>> = {};
      let dynTffLive: Record<number, Record<string, number>> = {};

      for (let w = 5; w <= 38; w++) {
          dynDfoBase[w] = {}; dynTffBase[w] = {};
          dynDfoLive[w] = {}; dynTffLive[w] = {};
          Object.keys(playersList).forEach(id => {
              dynDfoBase[w][id] = 0; dynTffBase[w][id] = 0;
              dynDfoLive[w][id] = 0; dynTffLive[w][id] = 0;
          });
      }

      let isAnyMatchLive = false;
      let highestWeekFound = 6; 

      const dfoDict: Record<string, {w1:number, w2:number, w3:number, w4:number}> = {};
      if(dfoHistorical) dfoHistorical.forEach(r => dfoDict[r.id] = {w1:r.w1||0, w2:r.w2||0, w3:r.w3||0, w4:r.w4||0});
      const tffDict: Record<string, {w1:number, w2:number, w3:number, w4:number}> = {};
      if(tffHistorical) tffHistorical.forEach(r => tffDict[r.id] = {w1:r.w1||0, w2:r.w2||0, w3:r.w3||0, w4:r.w4||0});

      // 🔥 TAHMİNLERİ "KULLANICI-HAFTA-MAÇ" OLARAK KUSURSUZ EŞLEŞTİR 🔥
      const predDict: Record<string, string> = {};
      if (allPredictions.length > 0) {
        allPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          predDict[`${uid}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, '');
        });
      }

      // Kategori haritasını HAFTA-MAÇ formatında oluştur
      const catDict: Record<string, string> = {};
      if (dbBulletin) {
        dbBulletin.forEach(m => {
          catDict[`${m.week_num}-${m.match_index}`] = m.category;
        });
      }

      if (dbMatches) {
        const uniqueMatches: Record<number, any> = {};
        dbMatches.forEach(row => uniqueMatches[row.id] = row);

        Object.values(uniqueMatches).forEach(dbMatch => {
          const weekNum = Math.floor(dbMatch.id / 100);
          const matchIndex = dbMatch.id % 100;

          // 🔥 5 VE 38 ARASINDAKİ TÜM HAFTALARI OTOMATİK TANIR 🔥
          if (weekNum >= 5 && weekNum <= 38 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            if (weekNum > highestWeekFound) highestWeekFound = weekNum;

            const category = catDict[`${weekNum}-${matchIndex}`] || "";
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.trim().replace(/\s+/g, '');
            const isTff = isTffMatchCheck(category);
            
            // SADECE TAM SKORU BİLENLER
            const winnerIds = Object.keys(playersList).filter(id => {
              const pScore = predDict[`${id}-${weekNum}-${matchIndex}`];
              return pScore && pScore === targetScore;
            });
            
            const isFinished = dbMatch.status === 'FINISHED';
            const isLiveMatch = dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL';

            winnerIds.forEach(wId => {
                if (isFinished) {
                    if (isTff && dynTffBase[weekNum][wId] !== undefined) dynTffBase[weekNum][wId] += 1;
                    else if (!isTff && dynDfoBase[weekNum][wId] !== undefined) dynDfoBase[weekNum][wId] += 1;
                } else if (isLiveMatch) {
                    if (isTff && dynTffLive[weekNum][wId] !== undefined) dynTffLive[weekNum][wId] += 1;
                    else if (!isTff && dynDfoLive[weekNum][wId] !== undefined) dynDfoLive[weekNum][wId] += 1;
                }
            });

            if (isLiveMatch) isAnyMatchLive = true;
          }
        });
      }

      setMaxWeek(highestWeekFound);
      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      // 🔴 BİRİNCİ AŞAMA: OYUNCU BİLGİLERİNİ VE SKORLARI OLUŞTUR
      const baseList = Object.keys(playersList).map(id => {
        const dfo = dfoDict[id] || { w1: 0, w2: 0, w3: 0, w4: 0 };
        const tff = tffDict[id] || { w1: 0, w2: 0, w3: 0, w4: 0 };
        
        let w1=0, w2=0, w3=0, w4=0;
        
        if (leagueFilter === 'MASTER') {
            w1 = dfo.w1 + tff.w1; w2 = dfo.w2 + tff.w2; w3 = dfo.w3 + tff.w3; w4 = dfo.w4 + tff.w4;
        } else if (leagueFilter === 'DFO') {
            w1 = dfo.w1; w2 = dfo.w2; w3 = dfo.w3; w4 = dfo.w4;
        } else if (leagueFilter === 'TFF') {
            w1 = tff.w1; w2 = tff.w2; w3 = tff.w3; w4 = tff.w4;
        }
        
        const playerObj: any = { id, name: playersList[id], w1, w2, w3, w4 };
        
        let totalDynBase = 0;
        let totalDynLive = 0;

        // BÜTÜN HAFTALARI OTOMATİK TOPLAR (7. Hafta da buraya dahil!)
        for (let w = 5; w <= highestWeekFound; w++) {
            let wBase = 0;
            let wLive = 0;

            if (leagueFilter === 'MASTER') {
                wBase = dynDfoBase[w][id] + dynTffBase[w][id];
                wLive = dynDfoLive[w][id] + dynTffLive[w][id];
            } else if (leagueFilter === 'DFO') {
                wBase = dynDfoBase[w][id];
                wLive = dynDfoLive[w][id];
            } else if (leagueFilter === 'TFF') {
                wBase = dynTffBase[w][id];
                wLive = dynTffLive[w][id];
            }

            playerObj[`w${w}Base`] = wBase;
            playerObj[`w${w}LiveExtra`] = wLive;
            playerObj[`w${w}Final`] = wBase + wLive;

            totalDynBase += wBase;
            totalDynLive += wLive;
        }

        playerObj.baseTotal = w1 + w2 + w3 + w4 + totalDynBase; // SADECE BİTENLER
        playerObj.liveExtra = totalDynLive; 
        playerObj.finalTotal = playerObj.baseTotal + totalDynLive; // CANLI DAHİL

        return playerObj;
      });

      // 🔴 İKİNCİ AŞAMA: ESKİ SIRALAMAYI HESAPLA (OK YÖNLERİ İÇİN)
      const prevRefList = [...baseList].sort((a, b) => {
          const scoreA = activeTab === 'total' ? a.baseTotal : (a[`${activeTab}Base`] || 0);
          const scoreB = activeTab === 'total' ? b.baseTotal : (b[`${activeTab}Base`] || 0);
          return scoreB - scoreA || a.name.localeCompare(b.name, 'tr');
      });

      const prevRanks: Record<string, number> = {};
      prevRefList.forEach((player, index) => prevRanks[player.id] = index + 1);

      // 🔴 ÜÇÜNCÜ AŞAMA: YENİ SIRALAMAYI (CANLI DAHİL) HESAPLA VE FARKINI BUL
      const currentRefList = [...baseList].sort((a, b) => {
          const scoreA = activeTab === 'total' ? a.finalTotal : (a[`${activeTab}Final`] || 0);
          const scoreB = activeTab === 'total' ? b.finalTotal : (b[`${activeTab}Final`] || 0);
          return scoreB - scoreA || a.name.localeCompare(b.name, 'tr');
      });

      const finalRows = currentRefList.map((player, index) => {
        const currentRank = index + 1;
        const prevRank = prevRanks[player.id];
        let trend = 'same', trendDiff = 0; 
        
        if (currentRank < prevRank) { trend = 'up'; trendDiff = prevRank - currentRank; } 
        else if (currentRank > prevRank) { trend = 'down'; trendDiff = currentRank - prevRank; }

        let displayScore = activeTab === 'total' ? player.finalTotal : (player[`${activeTab}Final`] || 0);

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
                          <div className="w-5 flex justify-center">
                            {row.trend === 'up' && <span className="text-[#10b981] text-[10px] font-bold animate-bounce flex items-center gap-0.5">▲ <span className="text-[8px]">{row.trendDiff}</span></span>}
                            {row.trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5">▼ <span className="text-[8px]">{row.trendDiff}</span></span>}
                            {row.trend === 'same' && <span className="text-transparent text-[8px]">-</span>}
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
                          
                          {/* 🔴 "CANLI" YAZISI ARTIK 7. HAFTA VE SONRASI İÇİN DE DİNAMİK 🔴 */}
                          {adminStatus === 'LIVE' && (
                            <>
                              {activeTab === 'total' && row.liveExtra > 0 && (
                                <span className="text-[#10b981] bg-[#10b981]/20 text-[8px] font-black px-1.5 py-0.5 rounded border border-[#10b981]/30 animate-pulse">+{row.liveExtra} CANLI</span>
                              )}
                              {activeTab.startsWith('w') && row[`${activeTab}LiveExtra`] > 0 && (
                                <span className="text-[#10b981] bg-[#10b981]/20 text-[8px] font-black px-1.5 py-0.5 rounded border border-[#10b981]/30 animate-pulse">+{row[`${activeTab}LiveExtra`]} CANLI</span>
                              )}
                            </>
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