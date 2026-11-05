'use client';
import React, { useState, useEffect, useRef } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';
import html2canvas from 'html2canvas';

// 🔴 54 KİŞİLİK SABİT SÖZLÜK
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

// 🔥 İLK 5 HAFTANIN "KIRILMAZ BETON" PUANLARI 🔥
const tffIlk4Hafta: Record<string, number> = { "262707": 10, "262816": 9, "262733": 7, "262754": 6, "262728": 6, "262706": 6, "262771": 5, "262734": 5, "262705": 4, "262714": 4, "262763": 4, "262756": 4, "262774": 4, "262740": 4, "262702": 3, "262782": 3, "262813": 3, "262723": 2, "262749": 2, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1, "262736": 6, "262755": 6 };

const tffHafta5Kasa: Record<string, number> = {
  "262782": 16, "262749": 14, "262758": 14, "262732": 14, "262726": 12, "262744": 9, "262730": 9, "262736": 7, "262717": 7, 
  "262790": 5, "262735": 4, "262721": 4, "262725": 3, "351925": 3, "262716": 2, "262747": 2, "262715": 2, "262719": 2, 
  "262771": 2, "262707": 2, "262714": 2, "262731": 2, "262738": 2, "262741": 2, "262763": 1, "262772": 1, "262703": 1, 
  "262756": 1, "262706": 1, "262750": 1, "262753": 1, "262702": 1, "262754": 1, "262708": 1, "262718": 1, "262770": 1, 
  "262816": 1, "262774": 1, "262723": 1, "262813": 1
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

  const [haftaBittiMi, setHaftaBittiMi] = useState<boolean>(false);
  const tabloRef = useRef<HTMLDivElement>(null);

  const loadLeaderboard = async () => {
    try {
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: allBulletin } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date, category, home_team, away_team');

      let activeWeek = 6;
      let liveWeeks: number[] = [];

      if (allBulletin && dbMatches) {
        const statusMap: Record<number, string> = {};
        dbMatches.forEach(m => {
            statusMap[m.id] = m.status;
            if (m.status === 'LIVE' || m.status === 'HT') {
                const wNum = Math.floor(m.id / 100);
                if (!liveWeeks.includes(wNum)) liveWeeks.push(wNum);
            }
        });

        const weeksData: Record<number, { hasStartedMatch: boolean }> = {};
        
        allBulletin.forEach(b => {
            if (!weeksData[b.week_num]) weeksData[b.week_num] = { hasStartedMatch: false };
            const mId = (b.week_num * 100) + b.match_index;
            const status = statusMap[mId];
            if (status && status !== 'NOT_STARTED') weeksData[b.week_num].hasStartedMatch = true;
        });

        const startedWeeks = Object.keys(weeksData).map(Number).filter(w => weeksData[w].hasStartedMatch);
        if (startedWeeks.length > 0) activeWeek = Math.max(...startedWeeks);
        else if (Object.keys(weeksData).length > 0) activeWeek = Math.max(...Object.keys(weeksData).map(Number));

        if (!liveWeeks.includes(activeWeek)) liveWeeks.push(activeWeek);

        const activeWeekMatches = dbMatches.filter(m => Math.floor(m.id / 100) === activeWeek);
        const finishedCount = activeWeekMatches.filter(m => m.status === 'FINISHED' || m.status === 'MS').length;
        setHaftaBittiMi(finishedCount === 24);
      }

      let finalizedPoints: any[] = [];
      let fetchMorePts = true;
      let fromPts = 0;
      const stepPts = 1000;

      while (fetchMorePts) {
        const { data: ptsChunk, error } = await supabase
            .from('points')
            .select('*')
            .eq('kategori', 'TFF')
            .order('id', { ascending: true }) 
            .range(fromPts, fromPts + stepPts - 1);
            
        if (!error && ptsChunk && ptsChunk.length > 0) {
            finalizedPoints = [...finalizedPoints, ...ptsChunk];
            if (ptsChunk.length < stepPts) fetchMorePts = false;
            else fromPts += stepPts;
        } else {
            fetchMorePts = false;
        }
      }

      let activePredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      if (liveWeeks.length > 0) {
          while (fetchMore) {
            const { data: pDataChunk, error } = await supabase
              .from('player_predictions')
              .select('*')
              .in('week_num', liveWeeks) 
              .range(from, from + step - 1);
              
            if (!error && pDataChunk && pDataChunk.length > 0) {
               activePredictions = [...activePredictions, ...pDataChunk];
               if (pDataChunk.length < step) fetchMore = false; else from += step; 
            } else { fetchMore = false; }
          }
      }

      const activeTffIds = new Set<number>();
      if (allBulletin) {
         allBulletin.filter(b => liveWeeks.includes(b.week_num)).forEach(m => {
            const rawCategory = String(m.category || '');
            const catLower = rawCategory.toLocaleLowerCase('tr-TR');
            const homeName = String(m.home_team || '').toLocaleLowerCase('tr-TR');
            const awayName = String(m.away_team || '').toLocaleLowerCase('tr-TR');
            
            const isTurkishTeam = /(spor|gücü|yurdu|bld|belediye|demir|gençler|birliği|kars|ankara|izmir|istanbul|bursa|trabzon|antalya|eskişehir|karşıyaka|altay)/.test(homeName) || /(spor|gücü|yurdu|bld|belediye|demir|gençler|birliği|kars|ankara|izmir|istanbul|bursa|trabzon|antalya|eskişehir|karşıyaka|altay)/.test(awayName);

            const isDefiniteTFF = isTffMatchCheck(m.category) || 
                                  catLower.includes('türkiye kupası') || 
                                  catLower.includes('turkiye kupasi') || 
                                  catLower.includes('tff') || 
                                  catLower.includes('süper lig') || 
                                  catLower.includes('1. lig') || 
                                  catLower.includes('amatör') || 
                                  catLower.includes('bal') ||
                                  isTurkishTeam;
                                  
            if (isDefiniteTFF) {
                activeTffIds.add((m.week_num * 100) + m.match_index);
            }
         });
      }

      let currentBase: Record<string, number> = {}; 
      let liveExtra: Record<string, number> = {}; 
      let isAnyMatchLive = false;

      Object.keys(allPlayersList).forEach(code => { 
          currentBase[code] = 0;
          liveExtra[code] = 0; 
      });

      if (finalizedPoints.length > 0) {
          finalizedPoints.forEach(pt => {
              const code = String(pt.username).trim();
              const haftaNum = Number(pt.hafta || 0); 
              
              if (haftaNum >= 6 && currentBase[code] !== undefined) {
                  currentBase[code] += Number(pt.puan || 0);
              }
          });
      }

      if (dbMatches && activePredictions.length > 0) {
        dbMatches.forEach(dbMatch => {
          if (!activeTffIds.has(dbMatch.id)) return; 
          if (dbMatch.status === 'FINISHED' || dbMatch.status === 'MS' || dbMatch.status === 'NOT_STARTED') return; 
          if (dbMatch.home_score === '-' || dbMatch.away_score === '-') return;

          const mIndex = dbMatch.id % 100;
          const matchWeek = Math.floor(dbMatch.id / 100);

          const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
          
          // 🔥 YENİ SİSTEM: TÜM SİSTEMDE KİM BİLMİŞ KONTROLÜ 🔥
          const exactWinners = activePredictions.filter(p => p.match_index === mIndex && p.predicted_score === targetScore && p.week_num === matchWeek);

          let points = 0;
          const wCount = exactWinners.length;
          if(wCount === 1) points = 12; else if(wCount === 2) points = 6; else if(wCount === 3) points = 5; else if(wCount === 4) points = 4; else if(wCount === 5) points = 3; else if(wCount === 6) points = 2; else if(wCount >= 7) points = 1;

          exactWinners.forEach(w => {
              const code = String(w.user_id).trim();
              if (liveExtra[code] !== undefined) {
                  liveExtra[code] += points;
                  isAnyMatchLive = true;
              }
          });
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      const baseList = Object.keys(allPlayersList).map(code => {
        const ilk4 = tffIlk4Hafta[code] || 0; 
        const w5 = tffHafta5Kasa[code] || 0; 
        const guncel = currentBase[code] || 0; 
        const live = liveExtra[code] || 0; 
        
        const w6PlusTotal = guncel + live; 
        const total = ilk4 + w5 + guncel + live; 

        return { 
          id: code, 
          name: allPlayersList[code], 
          ilk4, 
          w5, 
          w6: w6PlusTotal, 
          total, 
          liveExtra: live 
        };
      });

      const prevRefList = [...baseList].sort((a, b) => (b.total - b.liveExtra) - (a.total - a.liveExtra) || a.name.localeCompare(b.name, 'tr'));
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

  useEffect(() => { 
      loadLeaderboard(); 
      
      const channel = supabase.channel('tff_live_updates')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, () => { loadLeaderboard(); })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'points' }, () => { loadLeaderboard(); })
          .subscribe();
          
      const interval = setInterval(loadLeaderboard, 30000); 
      
      return () => { 
          supabase.removeChannel(channel); 
          clearInterval(interval); 
      }; 
  }, [activeTab]);

  const resmiBildiriyiIndir = async () => {
    if (!haftaBittiMi || !tabloRef.current) return;
    const canvas = await html2canvas(tabloRef.current, { backgroundColor: '#0f172a', scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "TFF_Ligi_Resmi_Bildiri.png";
    link.click();
  };

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
        
        <div className="w-full flex justify-end mb-2">
          {haftaBittiMi ? (
            <button 
              onClick={resmiBildiriyiIndir} 
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all shadow-lg"
            >
              📸 Resmi Deklarasyonu İndir
            </button>
          ) : (
            <button 
              disabled 
              className="bg-[#1e293b] text-slate-500 font-bold py-2 px-4 rounded-lg flex items-center gap-2 cursor-not-allowed border border-slate-700 text-sm shadow-md"
            >
              🔒 24. Maç Bekleniyor (İndirme Kapalı)
            </button>
          )}
        </div>

        <button onClick={() => { setActiveTab('total'); setIsMenuOpen(false); }} className={`px-8 py-2.5 rounded-xl font-black transition-all border w-full text-center shadow-md ${activeTab === 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
          TFF TOPLAM PUAN DURUMU
        </button>
        <div className="w-full relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold border transition-all flex items-center justify-between ${activeTab !== 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>
            <span>📅 {activeTab === 'total' ? 'TFF TOPLAM PUAN DURUMU' : activeTab === 'ilk4' ? 'TFF İLK 4 HAFTA' : activeTab === 'w5' ? 'TFF 5. HAFTA' : `TFF GÜNCEL (6. HAFTA VE SONRASI)`}</span>
            <span>{isMenuOpen ? '▲' : '▼'}</span>
          </button>
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900 p-3 rounded-2xl shadow-2xl flex flex-wrap justify-center gap-2">
               <button onClick={() => { setActiveTab('ilk4'); setIsMenuOpen(false); }} className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === 'ilk4' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-955 text-slate-300 border-slate-800'}`}>
                  İLK 4 HAFTA
               </button>
               <button onClick={() => { setActiveTab('w5'); setIsMenuOpen(false); }} className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === 'w5' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                  5. HAFTA
               </button>
               <button onClick={() => { setActiveTab('w6'); setIsMenuOpen(false); }} className={`py-1.5 px-4 text-xs font-bold rounded-lg border transition-all text-center ${activeTab === 'w6' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                  GÜNCEL HAFTALAR
               </button>
            </div>
          )}
        </div>
      </div>

      <div ref={tabloRef} className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl pb-4">
        <h2 className="text-xl text-center text-white mt-4 mb-2">🔴 TFF LİGİ GÜNCEL PUAN DURUMU</h2>
        
        {tableRows.length > 0 ? (
          /* 🔥 ZOOM DOSTU ESNEK TASARIM: overflow-x-auto YOK! Genişlikler yüzdelik yapıldı. 🔥 */
          <div className="w-full px-2 sm:px-4">
            <table className="w-full text-left text-sm table-fixed">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3.5 text-center w-1/5 sm:w-1/6">SIRA</th>
                  <th className="py-3.5 pl-2 w-3/5 sm:w-2/3">YARIŞMACI</th>
                  <th className="py-3.5 pr-4 text-right w-1/5 sm:w-1/6">PUAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <span className="text-slate-300 font-medium text-xs sm:text-sm">{row.currentRank || idx + 1}</span>
                        {row.trend === 'up' && <span className="text-emerald-400 text-xs sm:text-sm animate-bounce">▲</span>}
                        {row.trend === 'down' && <span className="text-red-500 text-xs sm:text-sm">▼</span>}
                        {row.trend === 'same' && <span className="text-slate-600 text-[8px] sm:text-[10px]">▶</span>}
                      </div>
                    </td>
                    
                    <td className="py-3.5 pl-2">
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center text-white font-semibold text-[11px] sm:text-sm flex-wrap gap-1 leading-tight break-words">
                            {(() => {
                              const trophyCount = (row.name ? (row.name.match(/🏆/g) || []).length : 0);
                              const cleanName = (row.name ? row.name.replace(/🏆/g, '').trim() : "Yarışmacı");
                              return (
                                <>
                                  <span>{cleanName}</span>
                                  {trophyCount > 0 && <span className="text-amber-400 text-[10px]">{'🏆'.repeat(trophyCount)}</span>}
                                </>
                              );
                            })()}
                        </div>
                        
                        {row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === 'w6') && (
                          <div className="mt-1">
                            <span className="bg-emerald-950/80 text-emerald-400 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse inline-block">
                              +{row.liveExtra} CANLI
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className={`py-3.5 pr-4 text-right font-bold text-sm sm:text-base ${row.liveExtra > 0 && adminStatus === 'LIVE' && (activeTab === 'total' || activeTab === 'w6') ? "text-emerald-400" : "text-amber-400"}`}>
                      {row.displayScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">⏳ TFF Puanları Yükleniyor...</div>
        )}
      </div>
    </div>
  );
}