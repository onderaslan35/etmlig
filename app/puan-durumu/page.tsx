'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

// 🔴 SABİT LİSTE
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

const tffWeek1Data: Record<string, number> = {};
const tffWeek2Data: Record<string, number> = {};
const tffWeek3Data: Record<string, number> = { "262707": 10, "262816": 9, "262733": 7, "262754": 6, "262728": 6, "262706": 6, "262771": 5, "262734": 5, "262705": 4, "262714": 4, "262763": 4, "262756": 4, "262774": 4, "262740": 4, "262702": 3, "262782": 3, "262813": 3, "262723": 2, "262749": 2, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1, "262736": 6, "262755": 6 };
const tffWeek4Data: Record<string, number> = {}; 

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

// 🔴 İSİMLERİ KUSURSUZ EŞLEŞTİRECEK NÜKLEER TEMİZLEYİCİ ZIRH
const toTurkishUpperCase = (str: string) => {
    if (!str) return "";
    return str.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase().trim();
};
const getCleanName = (name: string) => {
    return toTurkishUpperCase(name.replace(/🏆/g, ''));
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
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').eq('week_num', 5);

      // 🔴 1. ADIM: TÜM ASKERLERİN GEÇMİŞ PUANLARINI İSME GÖRE HARİTALA
      const playerStats: Record<string, any> = {};

      Object.keys(allPlayersList).forEach(id => {
         const originalName = allPlayersList[id];
         const cName = getCleanName(originalName);
         
         const w1 = tffWeek1Data[id] || 0;
         const w2 = tffWeek2Data[id] || 0;
         const w3 = tffWeek3Data[id] || 0;
         const w4 = tffWeek4Data[id] || 0;

         playerStats[cName] = {
             originalName: originalName,
             w1, w2, w3, w4,
             past: w1 + w2 + w3 + w4,
             w5Base: 0,
             w5Live: 0
         };
      });

      // 🔴 2. ADIM: SUPABASE'DEN GELEN ID'LERİ TEMİZ İSME ÇEVİR
      const uidToCleanName: Record<string, string> = {};
      if (dbPlayers) {
          dbPlayers.forEach(p => {
              const name = p.full_name || p.name || p.username;
              if (name) {
                  uidToCleanName[String(p.id)] = getCleanName(name);
                  uidToCleanName[String(p.username)] = getCleanName(name); // Yedek köprü
              }
          });
      }

      // 🔴 3. ADIM: 1000 LİMİT KIRICI İLE TAHMİNLERİ ÇEK (Sıralama Komutu Dahil)
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
           if (pDataChunk.length < step) fetchMore = false; else from += step; 
        } else { fetchMore = false; }
      }

      const tffMatchIndexes: number[] = [];
      if (dbBulletin) {
         dbBulletin.forEach(m => {
            if (isTffMatchCheck(m.category)) tffMatchIndexes.push(m.match_index);
         });
      }

      // 🔴 4. ADIM: TAHMİNLERİ İSME GÖRE KAYDET (ID'LERİ ÇÖPE ATTIK!)
      const predDict: Record<string, string[]> = {};
      if (dbPredictions && dbPredictions.length > 0) {
        dbPredictions.forEach(pred => {
          let cName = uidToCleanName[String(pred.user_id)];
          
          // Eğer Supabase'de bu adamın ismi yoksa, eski listede ID'si var mı diye bak
          if (!cName && allPlayersList[String(pred.user_id)]) {
              cName = getCleanName(allPlayersList[String(pred.user_id)]);
          } else if (!cName) {
              cName = `BİLİNMEYEN ASKER (${pred.user_id})`;
          }

          if (!predDict[cName]) predDict[cName] = Array(24).fill('-');
          predDict[cName][pred.match_index - 1] = pred.predicted_score;
        });
      }

      let isAnyMatchLive = false;

      // 🔴 5. ADIM: MAÇLARI VE BİLENLERİ "İSİM" ÜZERİNDEN HESAPLA (MASTER MOTORU)
      const uniqueMatches: Record<number, any> = {};
      if (dbMatches) {
        dbMatches.forEach(row => uniqueMatches[row.id] = row);

        Object.values(uniqueMatches).forEach(dbMatch => {
          if (dbMatch.id > 500 && dbMatch.id < 600 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score !== '-') {
            const matchIndex = (dbMatch.id % 100) - 1;
            
            if (!tffMatchIndexes.includes(matchIndex + 1)) return;

            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.trim().replace(/\s+/g, '');
            
            // Sadece TEMİZ İSİM üzerinden bilenleri bul! (Kimse silinmeyecek!)
            const winnerCleanNames = Object.keys(predDict).filter(cName => {
                const pScore = predDict[cName] ? predDict[cName][matchIndex] : null;
                return pScore && pScore.trim().replace(/\s+/g, '') === targetScore;
            });

            let points = 1;
            const wCount = winnerCleanNames.length;
            if(wCount === 1) points = 12; else if(wCount === 2) points = 6; else if(wCount === 3) points = 5; else if(wCount === 4) points = 4; else if(wCount === 5) points = 3; else if(wCount === 6) points = 2; else if(wCount >= 7) points = 1; else points = 0;

            winnerCleanNames.forEach(cName => {
              // Eğer bu adam eski listede bile yoksa, sisteme sıfırdan ekle
              if (!playerStats[cName]) {
                  playerStats[cName] = { originalName: cName, w1:0, w2:0, w3:0, w4:0, past:0, w5Base:0, w5Live:0 };
              }

              if (dbMatch.status === 'FINISHED') {
                  playerStats[cName].w5Base += points;
              } else if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') {
                  playerStats[cName].w5Live += points;
                  isAnyMatchLive = true;
              }
            });
          }
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      // 🔴 6. ADIM: TABLOYU OLUŞTUR VE SIRALA
      const baseList = Object.values(playerStats).map(p => {
          const w5Total = p.w5Base + p.w5Live;
          return {
              id: p.originalName, // React key için
              name: p.originalName,
              w1: p.w1, w2: p.w2, w3: p.w3, w4: p.w4,
              past: p.past,
              w5: w5Total,
              total: p.past + w5Total,
              liveExtra: p.w5Live
          };
      });

      const prevRefList = [...baseList].sort((a, b) => a.past - b.past || a.name.localeCompare(b.name, 'tr'));
      const prevRanks: Record<string, number> = {};
      prevRefList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

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

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="w-full bg-amber-500/20 border border-amber-500/50 rounded-xl p-3 mb-4 flex items-center gap-3">
        <span className="text-amber-500 text-xl animate-pulse">🚨</span>
        <p className="text-amber-200 text-[11px] sm:text-xs font-semibold leading-tight">
          <strong className="text-amber-400">BİLGİLENDİRME:</strong> TFF Puan Durumu artık Master ile eş zamanlı tam otomatik çalışmaktadır.
        </p>
      </div>

      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-amber-400 uppercase drop-shadow-md">TFF PUAN DURUMU</h1>
      </div>

      <div className="w-full mb-6"><LiveMatchCard /></div>

      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button onClick={() => { setActiveTab('total'); setIsMenuOpen(false); }} className={`px-8 py-2.5 rounded-xl font-black transition-all border w-full text-center shadow-md ${activeTab === 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
          TFF TOPLAM PUAN DURUMU
        </button>
        <div className="w-full relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold border transition-all flex items-center justify-between ${activeTab !== 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
            <span>📅 {activeTab === 'total' ? 'TFF TOPLAM PUAN DURUMU' : `TFF ${activeTab.replace('w', '')}. HAFTA PUAN DURUMU`}</span>
            <span>{isMenuOpen ? '▲' : '▼'}</span>
          </button>
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900 p-3 rounded-2xl shadow-2xl flex flex-wrap justify-center gap-2">
               {[1, 2, 3, 4, 5].map(num => (
                 <button key={num} onClick={() => { setActiveTab(`w${num}` as any); setIsMenuOpen(false); }} className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === `w${num}` ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                    {num}. HAFTA 
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr><th className="px-6 py-3.5 text-center w-20">SIRA</th><th className="px-6 py-3.5">YARIŞMACI</th><th className="px-6 py-3.5 text-right">PUAN</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tableRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
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
                      <span className="text-slate-200 font-semibold">{row.name.replace(/🏆/g, '').trim()}</span>
                      {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === 'w5') && (
                        <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse">
                          +{row.liveExtra} CANLI
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-3.5 text-right font-bold text-base ${row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === 'w5') ? "text-emerald-400" : "text-amber-400"}`}>
                    {row.displayScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-500">⏳ Veriler bulunamadı.</div>
        )}
      </div>
    </div>
  );
}