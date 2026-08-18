'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

// Sabit Liste (Değişmedi)
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

export default function DfoPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');

  const loadLeaderboard = async () => {
    try {
      // 1. VERİTABANINDAN HER ŞEYİ ÇEK
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: dbPredictions } = await supabase.from('player_predictions').select('*').eq('week_num', 5);
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').eq('week_num', 5);
      
      // YEPYENİ KISIM: Eski Puanları Çekiyoruz!
      const { data: dbHistorical } = await supabase.from('historical_points').select('*');

      let w5Base: Record<string, number> = {}; 
      let w5Live: Record<string, number> = {}; 
      let isAnyMatchLive = false;

      // Sıfırlama
      Object.keys(allPlayersList).forEach(id => { 
        w5Base[id] = 0; 
        w5Live[id] = 0; 
      });

      // Eski Puanları Sözlüğe Çevir
      const historicalDict: Record<string, number> = {};
      if(dbHistorical) {
          dbHistorical.forEach(row => {
              historicalDict[row.id] = row.dfo_base || 0; // SADECE DFO PUANINI ALIYORUZ
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

      // SADECE 5. HAFTAYI HESAPLA (ID 501+)
      if (dbMatches) {
        dbMatches.forEach(dbMatch => {
          if (dbMatch.id > 500 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const matchIndex = (dbMatch.id % 100) - 1;
            const category = catDict[matchIndex + 1] || "";
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            
            // Eğer TFF değilse (Yani DFO ise)
            if (!isTffMatchCheck(category)) {
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

      // SIRALAMAYI BELİRLE (Geçmiş Puanlar ile Sadece Geçmiş Sıralama)
      const referenceList = Object.keys(allPlayersList).map(id => {
        const basePuan = historicalDict[id] || 0;
        return { id, name: allPlayersList[id], basePuan };
      }).sort((a, b) => b.basePuan - a.basePuan || a.name.localeCompare(b.name, 'tr'));

      const prevRanks: Record<string, number> = {};
      referenceList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

      // GÜNCEL SIRALAMA (Geçmiş + 5. Hafta Base + Canlı)
      const baseList = Object.keys(allPlayersList).map(id => {
        const pastPuan = historicalDict[id] || 0;
        const currentBase = w5Base[id] || 0;
        const totalBase = pastPuan + currentBase;
        const liveExtra = w5Live[id] || 0; 
        
        return { id, name: allPlayersList[id], basePuan: totalBase, liveExtra, puan: totalBase + liveExtra };
      });

      // 🌟 SIFIR PUANLILARI GİZLE (Murat Aydemir İstisnası) 🌟
      const visibleList = baseList.filter(p => p.puan > 0 || p.id === "262712");
      visibleList.sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr'));

      const finalRows = visibleList.map((player, index) => {
        const currentRank = index + 1;
        const prevRank = prevRanks[player.id];
        let trend = 'same', trendDiff = 0; 
        if (currentRank < prevRank) { trend = 'up'; trendDiff = prevRank - currentRank; } 
        else if (currentRank > prevRank) { trend = 'down'; trendDiff = currentRank - prevRank; }
        return { ...player, currentRank, prevRank, trend, trendDiff };
      });
      
      setTableRows(finalRows);

    } catch (e) {
        console.log("Veri çekilirken hata oluştu");
    }
  };

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1"><h1 className="text-xl md:text-2xl font-extrabold text-center text-blue-400 tracking-wider uppercase drop-shadow-md">DFO PUAN DURUMU</h1></div>
      <div className="w-full mb-6"><LiveMatchCard /></div>
      
      <div className="max-w-xl flex flex-col items-center mb-6 w-full">
        <div className="px-8 py-2.5 rounded-xl font-black text-sm md:text-base border w-full text-center shadow-md uppercase tracking-wider bg-blue-600 text-white border-blue-400 shadow-blue-500/20">
          DFO GENEL KLASMAN
        </div>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] sm:text-xs border-b border-slate-800">
                <tr><th className="px-2 sm:px-6 py-3 sm:py-3.5 w-12 sm:w-24 text-center">SIRA</th><th className="px-2 sm:px-6 py-3 sm:py-3.5">YARIŞMACI</th><th className="px-2 sm:px-6 py-3 sm:py-3.5 text-right whitespace-nowrap">TOPLAM PUAN</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 text-center align-middle">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-2">
                        <span className="text-slate-300 font-medium text-xs sm:text-sm w-4 sm:w-5 text-center sm:text-right">{row.currentRank || idx + 1}</span>
                        <div className="w-6 sm:w-10 flex items-center justify-start">
                          {row.trend === 'up' && <span className="text-emerald-400 text-[10px] sm:text-xs font-bold animate-bounce flex items-center gap-0.5">▲ <span className="text-[8px] sm:text-[10px]">{row.trendDiff}</span></span>}
                          {row.trend === 'down' && <span className="text-red-500 text-[10px] sm:text-xs font-bold flex items-center gap-0.5">▼ <span className="text-[8px] sm:text-[10px]">{row.trendDiff}</span></span>}
                          {row.trend === 'same' && <span className="text-slate-600 text-[8px] sm:text-[10px] ml-0.5 sm:ml-1">▶</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 w-full max-w-[120px] sm:max-w-none">
                      <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                        {(() => {
                          const trophyCount = (row.name.match(/🏆/g) || []).length;
                          const cleanName = row.name.replace(/🏆/g, '').trim();
                          return ( <><span className="text-slate-200 font-semibold truncate whitespace-nowrap flex-shrink" title={cleanName}>{cleanName}</span>{trophyCount > 0 && <span className="flex-shrink-0 text-amber-400 text-[10px] sm:text-xs tracking-widest whitespace-nowrap">{'🏆'.repeat(trophyCount)}</span>}</> );
                        })()}
                        {row.liveExtra > 0 && adminStatus === 'LIVE' && <span className="bg-emerald-950/80 text-emerald-400 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse flex-shrink-0">+{row.liveExtra} CANLI</span>}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 text-right font-bold text-sm sm:text-base whitespace-nowrap text-blue-400">{row.puan}</td>
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
  );
}