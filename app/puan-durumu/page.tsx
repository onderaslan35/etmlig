'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

// 🔴 54 KİŞİLİK SABİT SÖZLÜK (Misafir Askerler Dahil)
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

// 🔴 1. STRATEJİ: İLK 4 HAFTANIN SABİT KODLARI (ESKİ SİSTEM) 🔴
const tffIlk4Hafta: Record<string, number> = { "262707": 10, "262816": 9, "262733": 7, "262754": 6, "262728": 6, "262706": 6, "262771": 5, "262734": 5, "262705": 4, "262714": 4, "262763": 4, "262756": 4, "262774": 4, "262740": 4, "262702": 3, "262782": 3, "262813": 3, "262723": 2, "262749": 2, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1, "262736": 6, "262755": 6 };

// 🔴 2. STRATEJİ: 5. HAFTA KARARGAH KASASI (KOD İÇİNE BETONLANDI) 🔴
const tffHafta5Kasa: Record<string, number> = {
  "262782": 16, // Yusuf Erbay
  "262749": 14, // B. Veyseloğlu Erol
  "262758": 14, // Melih Pınar
  "262732": 14, // R. İlhan Karaca (Alanya'dan 12 + diğerlerinden 2 = 14)
  "262726": 12, // Hüdaver Topardıç
  "262744": 9,  // İlyas Uygun
  "262730": 9,  // Önder Işık
  "262736": 7,  // Mehmet Ali Kara
  "262717": 7,  // Murat Ali
  "262790": 5,  // Cumali Söker
  "262735": 4,  // Aygün Akkeçeli
  "262721": 4,  // Mustafa Gümüşçü
  "262725": 3,  // İlyas Kazdal
  "351925": 3,  // Alios Göztepe
  "262716": 2,  // Birol Demirel
  "262747": 2,  // Savaş Çağlayan
  "262715": 2,  // Şemsettin Düğer
  "262719": 2,  // Uğur Vardar
  "262771": 2,  // Ulaş Adıgüzel
  "262707": 2,  // Hakan Ayan
  "262714": 2,  // İsmail Eker
  "262731": 2,  // Fatih Ayan
  "262738": 2,  // Mevlüt Evler
  "262741": 2,  // Sabahattin Çaylak
  "262763": 1,  // Mustafa Elmas
  "262772": 1,  // Cemal Sivrikaya
  "262703": 1,  // Cemalettin Belli
  "262756": 1,  // Eyüp Karacaoğlu
  "262706": 1,  // Gazi Ayan
  "262750": 1,  // Mahmut CBR
  "262753": 1,  // Yusuf Kızıltuğ
  "262702": 1,  // Murat Kara
  "262754": 1,  // Osman Ali Aydın
  "262708": 1,  // Bayram Yılmaz
  "262718": 1,  // Bekir Karadağ
  "262770": 1,  // Özkaya Mazakalı Bayram
  "262816": 1,  // Sedat Sedat
  "262774": 1,  // Şenol Can Çakıcı
  "262723": 1,  // Ayhan Luşoğlu
  "262813": 1   // Kemal Ersoy
};

const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category ? category.toUpperCase() : '';
  return uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG");
};

export default function TffPuanDurumuPage() {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ilk4'|'w5'|'w6'|'total'>('total');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');

  const loadLeaderboard = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('*').gte('week_num', 6);

      // 🔴 3. STRATEJİ: SADECE 6. HAFTA VE SONRASINI HESAPLA (CANLI MOTOR) 🔴
      let dbPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .gte('week_num', 6) // DİKKAT: SADECE 6. HAFTA VE SONRASI OKUNUR!
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

      let w6Base: Record<string, number> = {}; 
      let w6Live: Record<string, number> = {}; 
      let isAnyMatchLive = false;

      Object.keys(allPlayersList).forEach(code => { w6Base[code] = 0; w6Live[code] = 0; });

      const predDict: Record<string, string[]> = {};
      if (dbPredictions && dbPredictions.length > 0) {
        dbPredictions.forEach(pred => {
          let code = String(pred.user_id).trim();
          if (uuidToCode[code]) code = uuidToCode[code]; 
          
          if (!predDict[code]) predDict[code] = Array(24).fill('-');
          predDict[code][pred.match_index - 1] = pred.predicted_score;
        });
      }

      const tffMatchIndexes: number[] = [];
      if (dbBulletin) {
         dbBulletin.forEach(m => {
            if (isTffMatchCheck(m.category)) tffMatchIndexes.push(m.match_index);
         });
      }

      const uniqueMatches: Record<number, any> = {};
      if (dbMatches) {
        dbMatches.forEach(row => uniqueMatches[row.id] = row);

        Object.values(uniqueMatches).forEach(dbMatch => {
          // Sadece 6. Hafta Maçları (601-700 arası ID'ler)
          if (dbMatch.id > 600 && dbMatch.id < 700 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const matchIndex = (dbMatch.id % 100) - 1;
            
            if (!tffMatchIndexes.includes(matchIndex + 1)) return;

            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.trim().replace(/\s+/g, '');
            
            const winnerCodes = Object.keys(predDict).filter(code => {
                const pScore = predDict[code] ? predDict[code][matchIndex] : null;
                return pScore && pScore.trim().replace(/\s+/g, '') === targetScore;
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

      // 🔴 NİHAİ BİRLEŞTİRME (İLK 4 HAFTA + 5. HAFTA KASA + 6. HAFTA CANLI) 🔴
      const baseList = Object.keys(allPlayersList).map(code => {
        const ilk4 = tffIlk4Hafta[code] || 0; // İlk 4 Hafta (Kodun İçinden)
        const w5 = tffHafta5Kasa[code] || 0; // 5. Hafta (Kodun İçinden)
        const liveW6 = (w6Base[code] || 0) + (w6Live[code] || 0); // Canlı 6. Hafta
        
        const total = ilk4 + w5 + liveW6; // BÜYÜK TOPLAM!

        return { 
          id: code, 
          name: allPlayersList[code], 
          ilk4, 
          w5, 
          w6: liveW6, 
          total, 
          liveExtra: w6Live[code] || 0 
        };
      });

      const prevRefList = [...baseList].sort((a, b) => (b.total - b.w6) - (a.total - a.w6) || a.name.localeCompare(b.name, 'tr'));
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
        console.error("Veri çekilirken hata oluştu:", e);
    }
  };

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="w-full bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-3 mb-4 flex items-center gap-3">
        <span className="text-emerald-500 text-xl animate-pulse">⚡</span>
        <p className="text-emerald-200 text-[11px] sm:text-xs font-semibold leading-tight">
          <strong className="text-emerald-400">KARARGAH ZIRHI AKTİF:</strong> İlk 5 haftanın puanları SQL olmadan %100 kodun içinden çekilmektedir.
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
            <span>📅 {activeTab === 'total' ? 'TFF TOPLAM PUAN DURUMU' : activeTab === 'ilk4' ? 'TFF İLK 4 HAFTA' : `TFF ${activeTab.replace('w', '')}. HAFTA PUAN DURUMU`}</span>
            <span>{isMenuOpen ? '▲' : '▼'}</span>
          </button>
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900 p-3 rounded-2xl shadow-2xl flex flex-wrap justify-center gap-2">
               <button onClick={() => { setActiveTab('ilk4'); setIsMenuOpen(false); }} className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === 'ilk4' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                  İLK 4 HAFTA (SABİT)
               </button>
               <button onClick={() => { setActiveTab('w5'); setIsMenuOpen(false); }} className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === 'w5' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                  5. HAFTA (ARŞİV)
               </button>
               <button onClick={() => { setActiveTab('w6'); setIsMenuOpen(false); }} className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === 'w6' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                  6. HAFTA (CANLI)
               </button>
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
                      
                      {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === 'w6') && (
                        <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse whitespace-nowrap">
                          +{row.liveExtra} CANLI
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-3.5 text-right font-bold text-base ${row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === 'w6') ? "text-emerald-400" : "text-amber-400"}`}>
                    {row.displayScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-500">⏳ TFF Puanları Yükleniyor...</div>
        )}
      </div>
    </div>
  );
}