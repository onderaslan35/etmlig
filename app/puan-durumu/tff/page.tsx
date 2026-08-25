'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

// 54 KİŞİLİK SABİT SÖZLÜK (Misafir Asker İsimleri Düzeltilmiş Halde)
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
  "262723": "AYHAN LUŞOĞLU", "262735": "AYGÜN AKKEÇELİ", "262741": "SABAHATTİN ÇAYLAK"
};

// 3. HAFTA
const w3Kutu: Record<string, number> = {
  "262707": 10, "262816": 9, "262733": 7, "262755": 6, "262706": 6, "262736": 6, "262754": 6, "262728": 6,
  "262734": 5, "262771": 5, "262740": 4, "262705": 4, "262756": 4, "262714": 4, "262763": 4, "262774": 4,
  "262813": 3, "262702": 3, "262782": 3, "262723": 2, "262749": 2, "351925": 1, "262772": 1, "262721": 1,
  "262770": 1, "262730": 1, "262739": 1
};

// 4. HAFTA
const w4Kutu: Record<string, number> = {
  "262714": 17, "262758": 13, "262730": 13, "262786": 13, "262717": 12, "262813": 11, "262736": 10, "262704": 10,
  "262723": 9, "262707": 9, "262774": 9, "262734": 8, "262702": 8, "262755": 7, "262726": 5, "262733": 5,
  "262770": 5, "262753": 5, "262705": 4, "262725": 4, "262719": 4, "262718": 3, "262750": 3, "262711": 3,
  "351925": 2, "262703": 2, "262731": 2, "262706": 2, "262738": 2, "262763": 2, "262747": 2, "262782": 2,
  "262716": 1, "262790": 1, "262721": 1, "262732": 1, "262709": 1, "262771": 1
};

// 5. HAFTA
const w5Kutu: Record<string, number> = {
  "262782": 16, "262749": 14, "262758": 14, "262732": 14, "262726": 12, "262744": 9,  "262730": 9,  "262736": 7,
  "262717": 7,  "262790": 5,  "262735": 4,  "262721": 4,  "262725": 3,  "351925": 3,  "262716": 2,  "262747": 2,
  "262715": 2,  "262719": 2,  "262771": 2,  "262707": 2,  "262714": 2,  "262731": 2,  "262738": 2,  "262741": 2,
  "262763": 1,  "262772": 1,  "262703": 1,  "262756": 1,  "262706": 1,  "262750": 1,  "262753": 1,  "262702": 1,
  "262754": 1,  "262708": 1,  "262718": 1,  "262770": 1,  "262816": 1,  "262774": 1,  "262723": 1,  "262813": 1
};

const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category ? category.toUpperCase() : '';
  return uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG");
};

export default function TffPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'w1'|'w2'|'w3'|'w4'|'w5'|'total'>('total');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');

  const loadLeaderboard = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').gte('week_num', 6);

      let dbPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .gte('week_num', 6)
          .order('id', { ascending: true }) 
          .range(from, from + step - 1);
          
        if (!error && pDataChunk && pDataChunk.length > 0) {
           dbPredictions = [...dbPredictions, ...pDataChunk];
           if (pDataChunk.length < step) fetchMore = false; else from += step; 
        } else { fetchMore = false; }
      }

      const uuidToCode: Record<string, string> = {};
      if (dbPlayers) {
         dbPlayers.forEach(p => {
            const code = String(p.username || '').trim();
            if (code) uuidToCode[p.id] = code;
         });
      }

      const predDict: Record<string, string> = {};
      if (dbPredictions && dbPredictions.length > 0) {
        dbPredictions.forEach(pred => {
          let code = String(pred.user_id).trim();
          if (uuidToCode[code]) code = uuidToCode[code]; 
          predDict[`${code}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, '');
        });
      }

      const tffMatchSet = new Set<string>();
      if (dbBulletin) {
         dbBulletin.forEach(m => {
            if (isTffMatchCheck(m.category)) tffMatchSet.add(`${m.week_num}-${m.match_index}`);
         });
      }

      const w6Base: Record<string, number> = {}; 
      const w6Live: Record<string, number> = {}; 
      Object.keys(allPlayersList).forEach(code => { w6Base[code] = 0; w6Live[code] = 0; });
      let isAnyMatchLive = false;

      // 6. HAFTA CANLI HESAPLAMA MOTORU (Sadece toplama etki eder)
      if (dbMatches) {
        dbMatches.forEach(dbMatch => {
          const weekNum = Math.floor(dbMatch.id / 100);
          const matchIndex = dbMatch.id % 100;
          
          if (!tffMatchSet.has(`${weekNum}-${matchIndex}`)) return;

          if (dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.trim().replace(/\s+/g, '');
            
            const winnerCodes = Object.keys(allPlayersList).filter(code => {
                const pScore = predDict[`${code}-${weekNum}-${matchIndex}`];
                return pScore && pScore === targetScore;
            });

            let points = 1;
            const wCount = winnerCodes.length;
            if(wCount === 1) points = 12; else if(wCount === 2) points = 6; else if(wCount === 3) points = 5; else if(wCount === 4) points = 4; else if(wCount === 5) points = 3; else if(wCount === 6) points = 2; else if(wCount >= 7) points = 1; else points = 0;

            winnerCodes.forEach(wCode => {
              if (w6Base[wCode] !== undefined) {
                  if (dbMatch.status === 'FINISHED') w6Base[wCode] += points;
                  else if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') {
                    w6Live[wCode] += points;
                    isAnyMatchLive = true;
                  }
              }
            });
          }
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      const baseList = Object.keys(allPlayersList).map(code => {
        const vW3 = w3Kutu[code] || 0;
        const vW4 = w4Kutu[code] || 0;
        const vW5 = w5Kutu[code] || 0;
        const vW6Total = (w6Base[code] || 0) + (w6Live[code] || 0);

        return { 
          id: code, 
          name: allPlayersList[code], 
          w1: 0,
          w2: 0,
          w3: vW3,
          w4: vW4,
          w5: vW5,
          total: vW3 + vW4 + vW5 + vW6Total, 
          liveExtra: w6Live[code] || 0 
        };
      });

      const prevRefList = [...baseList].sort((a, b) => (b.total - a.liveExtra) - (a.total - a.liveExtra) || a.name.localeCompare(b.name, 'tr'));
      const prevRanks: Record<string, number> = {};
      prevRefList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

      const visibleList = baseList.sort((a, b) => {
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

        const displayScore = activeTab === 'total' ? player.total : player[activeTab] as number;
        return { ...player, currentRank, trend, trendDiff, displayScore };
      });
      
      setTableRows(finalRows);

    } catch (e) {
        console.error("Veri çekilirken hata oluştu:", e);
    }
  };

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-amber-500 uppercase drop-shadow-md">TFF PUAN DURUMU</h1>
      </div>

      <div className="w-full mb-6"><LiveMatchCard /></div>

      <div className="max-w-xl flex flex-col items-center mb-6 w-full">
        <button 
          onClick={() => { setActiveTab('total'); setIsMenuOpen(false); }} 
          className="w-full py-3 mb-6 rounded-xl font-black transition-all text-center shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] bg-amber-500 text-slate-950 hover:bg-amber-400 hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)]"
        >
          TFF TOPLAM PUAN DURUMU
        </button>
        
        <div className="w-full bg-[#0a1128] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Master Stili Başlık Çubuğu */}
          <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-[#0a1128]">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[13px]">
              <span>📅</span>
              <span className="uppercase">{activeTab === 'total' ? 'TOPLAM PUAN DURUMU' : `${activeTab.replace('w', '')}. HAFTA PUAN DURUMU`}</span>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {isMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}
            </button>
          </div>

          {/* Master Stili 1-2-3-4-5 Butonları */}
          {isMenuOpen && (
            <div className="p-4 flex justify-center gap-3 border-b border-slate-800 bg-[#0f172a]">
              {['1', '2', '3', '4', '5'].map(w => (
                <button
                  key={w}
                  onClick={() => setActiveTab(`w${w}` as any)}
                  className={`w-12 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                    activeTab === `w${w}` ? 'bg-slate-700 text-white shadow-inner' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}

          {/* Tablo veya Boş Durum Gösterimi */}
          {activeTab === 'w1' || activeTab === 'w2' ? (
             <div className="py-16 text-center text-slate-500 font-medium">
               Bu haftaya ait veri bulunmamaktadır.
             </div>
          ) : tableRows.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 text-center w-20">SIRA</th>
                  <th className="px-6 py-3.5">YARIŞMACI</th>
                  <th className="px-6 py-3.5 text-right">{activeTab === 'total' ? 'TOPLAM PUAN' : 'PUAN'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-slate-300 font-medium text-sm">{row.currentRank || idx + 1}</span>
                        {row.trend === 'up' && <span className="text-emerald-400 text-sm animate-bounce">▲</span>}
                        {row.trend === 'down' && <span className="text-red-500 text-sm">▼</span>}
                        {row.trend === 'same' && <span className="text-slate-600 text-[10px]">▶</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-white font-semibold">
                            {(() => {
                              const trophyCount = (row.name ? (row.name.match(/🏆/g) || []).length : 0);
                              const cleanName = (row.name ? row.name.replace(/🏆/g, '').trim() : "Yarışmacı");
                              return (
                                <>
                                  <span className="whitespace-nowrap">{cleanName}</span>
                                  {trophyCount > 0 && <span className="text-amber-400 text-[10px]">{'🏆'.repeat(trophyCount)}</span>}
                                </>
                              );
                            })()}
                        </div>
                        
                        {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total') && (
                          <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse whitespace-nowrap">
                            +{row.liveExtra} CANLI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-3.5 text-right font-bold text-base ${row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total') ? "text-emerald-400" : "text-amber-500"}`}>
                      {row.displayScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-500">⏳ Puanlar yükleniyor...</div>
          )}
        </div>
      </div>
    </div>
  );
}