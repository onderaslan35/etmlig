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
  const uppercaseCat = category.toUpperCase();
  return (uppercaseCat.includes("TÜRKİYE SÜPER LİG") || uppercaseCat.includes("TÜRKİYE 1.LİG") || uppercaseCat.includes("TÜRKİYE SÜPER KUPA"));
};

export default function TffPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'w1'|'w2'|'w3'|'w4'|'w5'|'total'>('total');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');

  const loadLeaderboard = async () => {
    try {
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: dbPredictions } = await supabase.from('player_predictions').select('*').eq('week_num', 5);
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').eq('week_num', 5);
      const { data: dbHistorical } = await supabase.from('tff_weekly_points').select('*');

      let w5Base: Record<string, number> = {}; 
      let w5Live: Record<string, number> = {}; 
      let isAnyMatchLive = false;

      Object.keys(allPlayersList).forEach(id => { w5Base[id] = 0; w5Live[id] = 0; });

      const historicalDict: Record<string, {w1:number, w2:number, w3:number, w4:number}> = {};
      if(dbHistorical) {
          dbHistorical.forEach(row => {
              historicalDict[row.id] = { w1: row.w1||0, w2: row.w2||0, w3: row.w3||0, w4: row.w4||0 };
          });
      }

      const predDict: Record<string, string[]> = {};
      if (dbPredictions) {
        dbPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          if (!predDict[uid]) predDict[uid] = Array(24).fill('-');
          predDict[uid][pred.match_index - 1] = pred.predicted_score;
        });
      }

      const catDict: Record<number, string> = {};
      if (dbBulletin) {
        dbBulletin.forEach(m => { catDict[m.match_index] = m.category; });
      }

      if (dbMatches) {
        dbMatches.forEach(dbMatch => {
          if (dbMatch.id > 500 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const matchIndex = (dbMatch.id % 100) - 1;
            const category = catDict[matchIndex + 1] || "";
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            
            if (isTffMatchCheck(category)) {
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
          }
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      const baseList = Object.keys(allPlayersList).map(id => {
        const past = historicalDict[id] || { w1: 0, w2: 0, w3: 0, w4: 0 };
        const w5Total = (w5Base[id] || 0) + (w5Live[id] || 0);
        const total = past.w1 + past.w2 + past.w3 + past.w4 + w5Total;
        return { 
          id, name: allPlayersList[id], 
          w1: past.w1, w2: past.w2, w3: past.w3, w4: past.w4, w5: w5Total, total, 
          liveExtra: w5Live[id] || 0 
        };
      });

      const prevRefList = [...baseList].sort((a, b) => (b.w1+b.w2+b.w3+b.w4) - (a.w1+a.w2+a.w3+a.w4) || a.name.localeCompare(b.name, 'tr'));
      const prevRanks: Record<string, number> = {};
      prevRefList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

      const visibleList = baseList.filter(p => {
        if (activeTab === 'total') return p.total > 0 || p.id === "262712";
        else return (p[activeTab] as number) > 0 || p.id === "262712";
      });

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

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-red-500 tracking-wider uppercase drop-shadow-md">TFF PUAN DURUMU</h1>
      </div>
      
      <div className="w-full mb-6"><LiveMatchCard /></div>
      
      <div className="w-full max-w-3xl mx-auto">
        <button 
          onClick={() => { setActiveTab('total'); setIsMenuOpen(false); }}
          className="w-full bg-[#dc2626] hover:bg-red-500 text-white font-bold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-3 transition-colors uppercase tracking-wide"
        >
          {activeTab === 'total' ? 'TFF TOPLAM PUAN DURUMU' : `TFF ${activeTab.replace('w', '')}. HAFTA PUAN DURUMU`}
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
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => { setActiveTab(`w${num}` as any); setIsMenuOpen(false); }}
                  className={`w-12 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                    activeTab === `w${num}` ? 'bg-[#dc2626] text-white' : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#334155]'
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
                        {/* İSİMLER BEMBEYAZ YAPILDI (text-white) */}
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
                      {/* PUANLAR İSİMLER GİBİ BEMBEYAZ YAPILDI (text-white) */}
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