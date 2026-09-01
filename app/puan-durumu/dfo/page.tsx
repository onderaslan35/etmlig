'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA 🏆🏆",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA 🏆", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN 🏆🏆", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN 🏆", "262714": "İSMAİL EKER 🏆", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA",
  "262723": "AYHAN LUŞOĞLU"
};

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

export default function DfoPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');
  const [maxWeek, setMaxWeek] = useState<number>(6); // SONSUZ DÖNGÜ İÇİN DİNAMİK HAFTA

  const loadLeaderboard = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      
      // 🔥 BÜTÜN DFO MAÇLARINI ÇEKER
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').gte('week_num', 5);
      
      // SUPABASE GEÇMİŞ HAFTALAR TABLOSU (dfo_weekly_points)
      const { data: dbHistorical } = await supabase.from('dfo_weekly_points').select('*');

      const playersList: Record<string, string> = { ...allPlayersList };
      if (dbPlayers) {
        dbPlayers.forEach(p => {
          const uid = String(p.username || p.id);
          playersList[uid] = p.full_name || p.name || allPlayersList[uid] || "Yarışmacı";
        });
      }

      // GEÇMİŞ PUANLARI HARİTAYA YÜKLE
      const historicalDict: Record<string, { w1: number; w2: number; w3: number; w4: number }> = {};
      if (dbHistorical) {
        dbHistorical.forEach(row => {
          const rowId = String(row.id || row.user_id || row.username);
          historicalDict[rowId] = {
            w1: Number(row.w1) || 0,
            w2: Number(row.w2) || 0,
            w3: Number(row.w3) || 0,
            w4: Number(row.w4) || 0
          };
        });
      }

      // 🔥 1000 LİMİT KIRICI VE EKSİKSİZ TAHMİN TOPLAYICI (5. HAFTADAN SONSUZA) 🔥
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

      // SADECE DFO KATEGORİSİNDEKİ MAÇLARI SÜZER (SENİN ORİJİNAL KURALIN)
      const dfoMatchSet = new Set<string>();
      if (dbBulletin) {
        dbBulletin.forEach(m => {
          if (!isTffMatchCheck(m.category)) {
            dfoMatchSet.add(`${m.week_num}-${m.match_index}`);
          }
        });
      }

      // 🔴 ESKİ KÖR LİMİTLER KALDIRILDI! 38. HAFTAYA KADAR HAZIR KASALAR 🔴
      let dynamicBase: Record<number, Record<string, number>> = {};
      let dynamicLive: Record<number, Record<string, number>> = {};
      for (let w = 5; w <= 38; w++) {
          dynamicBase[w] = {}; dynamicLive[w] = {};
          Object.keys(playersList).forEach(id => {
              dynamicBase[w][id] = 0; dynamicLive[w][id] = 0;
          });
      }

      let isAnyMatchLive = false;
      let highestWeekFound = 6; // En az 6 sekmesi görünsün

      // 🔥 TAHMİNLERİ "KULLANICI-HAFTA-MAÇ" OLARAK KUSURSUZ EŞLEŞTİR 🔥
      const predDict: Record<string, string> = {};
      if (dbPredictions && dbPredictions.length > 0) {
        dbPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          predDict[`${uid}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, '');
        });
      }

      const uniqueMatches: Record<number, any> = {};
      if (dbMatches) {
        dbMatches.forEach(row => { uniqueMatches[row.id] = row; });

        Object.values(uniqueMatches).forEach(dbMatch => {
          const weekNum = Math.floor(dbMatch.id / 100);
          const matchIndex = dbMatch.id % 100;

          // 🔥 5 VE 38 ARASINDAKİ TÜM HAFTALARI OTOMATİK TANIR 🔥
          if (
            weekNum >= 5 && weekNum <= 38 &&
            dbMatch.home_score &&
            dbMatch.home_score !== '-' &&
            dbMatch.away_score &&
            dbMatch.away_score !== '-'
          ) {
            
            // Eğer maç DFO bülteninde (havuzunda) yoksa DFO'ya puan VERME (TFF maçıdır)
            if (!dfoMatchSet.has(`${weekNum}-${matchIndex}`)) return;

            if (weekNum > highestWeekFound) highestWeekFound = weekNum;

            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.trim().replace(/\s+/g, '');
            
            const winnerIds = Object.keys(playersList).filter(id => {
              const pScore = predDict[`${id}-${weekNum}-${matchIndex}`];
              return pScore && pScore === targetScore;
            });

            let points = 1;
            const wCount = winnerIds.length;
            if (wCount === 1) points = 12;
            else if (wCount === 2) points = 6;
            else if (wCount === 3) points = 5;
            else if (wCount === 4) points = 4;
            else if (wCount === 5) points = 3;
            else if (wCount === 6) points = 2;
            else if (wCount >= 7) points = 1;
            else points = 0;

            winnerIds.forEach(wId => {
              if (dbMatch.status === 'FINISHED') {
                 dynamicBase[weekNum][wId] += points;
              } else if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') {
                 dynamicLive[weekNum][wId] += points;
                 isAnyMatchLive = true;
              }
            });
          }
        });
      }

      setMaxWeek(highestWeekFound);
      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      // GEÇMİŞ + SONSUZ HAFTALARI BİRLEŞTİRME
      const baseList = Object.keys(playersList).map(id => {
        const past = historicalDict[id] || { w1: 0, w2: 0, w3: 0, w4: 0 };
        
        let playerObj: any = {
          id,
          name: playersList[id],
          w1: past.w1,
          w2: past.w2,
          w3: past.w3,
          w4: past.w4
        };

        let totalDynBase = 0;
        let totalDynLive = 0;

        // BÜTÜN HAFTALARI OTOMATİK TOPLAR (7. Hafta da buraya dahil!)
        for (let w = 5; w <= highestWeekFound; w++) {
            const wTotal = dynamicBase[w][id] + dynamicLive[w][id];
            playerObj[`w${w}`] = wTotal;
            totalDynBase += dynamicBase[w][id];
            totalDynLive += dynamicLive[w][id];
        }

        playerObj.total = past.w1 + past.w2 + past.w3 + past.w4 + totalDynBase + totalDynLive;
        playerObj.liveExtra = totalDynLive;

        return playerObj;
      });

      const prevRefList = [...baseList].sort((a, b) => {
        const prevA = a.total - a.liveExtra;
        const prevB = b.total - b.liveExtra;
        return prevB - prevA || a.name.localeCompare(b.name, 'tr');
      });

      const prevRanks: Record<string, number> = {};
      prevRefList.forEach((player, index) => {
        prevRanks[player.id] = index + 1;
      });

      const visibleList = baseList;

      visibleList.sort((a, b) => {
        const scoreA = activeTab === 'total' ? a.total : (a[activeTab] || 0);
        const scoreB = activeTab === 'total' ? b.total : (b[activeTab] || 0);
        return scoreB - scoreA || a.name.localeCompare(b.name, 'tr');
      });

      const finalRows = visibleList.map((player, index) => {
        const currentRank = index + 1;
        let trend = 'same';
        let trendDiff = 0;

        if (activeTab === 'total') {
          const prevRank = prevRanks[player.id];
          if (currentRank < prevRank) {
            trend = 'up';
            trendDiff = prevRank - currentRank;
          } else if (currentRank > prevRank) {
            trend = 'down';
            trendDiff = currentRank - prevRank;
          }
        }

        const displayScore = activeTab === 'total' ? player.total : (player[activeTab] || 0);
        return { ...player, currentRank, trend, trendDiff, displayScore };
      });

      setTableRows(finalRows);
    } catch (e) {
      console.log("DFO verisi çekilirken hata oluştu");
    }
  };

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-blue-400 tracking-wider uppercase drop-shadow-md">
          DFO PUAN DURUMU
        </h1>
      </div>

      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>

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
              {[...Array(maxWeek)].map((_, idx) => {
                const num = idx + 1;
                return (
                  <button
                    key={num}
                    onClick={() => { setActiveTab(`w${num}`); setIsMenuOpen(false); }}
                    className={`w-12 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                      activeTab === `w${num}`
                        ? 'bg-[#1d4ed8] text-white border-blue-400 border'
                        : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'
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
                      <td className="pl-2 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium">
                        <div className="flex items-center gap-1">
                          <span className="w-4 text-left">{row.currentRank || idx + 1}</span>
                          <span className="text-[#475569]">-</span>
                          <div className="w-5 flex justify-center">
                            {activeTab === 'total' ? (
                              <>
                                {row.trend === 'up' && (
                                  <span className="text-emerald-400 text-[10px] font-bold animate-bounce flex items-center gap-0.5">
                                    ▲ <span className="text-[8px]">{row.trendDiff}</span>
                                  </span>
                                )}
                                {row.trend === 'down' && (
                                  <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5">
                                    ▼ <span className="text-[8px]">{row.trendDiff}</span>
                                  </span>
                                )}
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
                          
                          {/* 🔴 "CANLI" YAZISI ARTIK 7 VE SONRASI İÇİN DE DEVREDE 🔴 */}
                          {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab.startsWith('w')) && (
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
            <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">
              ⏳ Veriler yükleniyor...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}