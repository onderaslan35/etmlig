'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import html2canvas from 'html2canvas';

// TFF ZIRHI
const advancedTffCheck = (category: string, home: string, away: string) => {
  const cat = (category || '').toUpperCase().replace(/İ/g, 'I');
  const h = (home || '').toUpperCase().replace(/İ/g, 'I');
  const a = (away || '').toUpperCase().replace(/İ/g, 'I');
  
  const isTffCat = cat.includes("TURKIYE") || cat.includes("TFF") || cat.includes("AMATOR") ||
                   cat.includes("SUPER LIG") || cat.includes("1. LIG") || cat.includes("1.LIG") ||
                   cat.includes("2. LIG") || cat.includes("2.LIG") || cat.includes("3. LIG") ||
                   cat.includes("3.LIG") || cat.includes("BAL") || cat.includes("KUPASI") || cat.includes("PTT");

  const teamRegex = /(SPOR|GUCU|YURDU|BLD|BELEDIYE|DEMIR|GENCLER|BIRLIGI|KARS|ANKARA|IZMIR|ISTANBUL|BURSA|TRABZON|ANTALYA|ESKISEHIR|KARSIYAKA|ALTAY|KASIMPASA|GAZIANTEP|SARIYER|IGDIR|GALATASARAY|FENERBAHCE|BESIKTAS|GOZTEPE|KAYSERI|SIVAS|ADANA|HATAY|ALANYA|RIZE|KONYA|SAMSUN|BODRUM|PENDIK|KARAGUMRUK|EYUP|AMED|ERZURUM|KOCAELI|BANDIRMA|UMRANIYE|MARDIN|MUGLA|BATMAN|CORUM|MANISA|BOLU|EROK)/;

  return isTffCat || teamRegex.test(h) || teamRegex.test(a);
};

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');
  const [lists, setLists] = useState<{ MASTER: any[], DFO: any[], TFF: any[] }>({ MASTER: [], DFO: [], TFF: [] });
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [haftaBittiMi, setHaftaBittiMi] = useState<boolean>(false);
  const tabloRef = useRef<HTMLDivElement>(null);

  const loadSkorData = async () => {
    try {
      const { data: dbPlayers } = await supabase.from('players').select('username, name');
      const idToNameMap: Record<string, string> = {};
      if (dbPlayers) dbPlayers.forEach(p => idToNameMap[p.username] = p.name);

      const { data: allMatches } = await supabase.from('live_matches').select('*');
      const { data: dbBulletin } = await supabase.from('matches_bulletin').select('match_index, week_num, category, home_team, away_team');

      let activeWeek = 6;
      let liveWeeks: number[] = [];

      if (dbBulletin && allMatches) {
          const statusMap: Record<number, string> = {};
          allMatches.forEach(m => {
              statusMap[m.id] = m.status;
              if (m.status === 'LIVE' || m.status === 'HT') {
                  const wNum = Math.floor(m.id / 100);
                  if (!liveWeeks.includes(wNum)) liveWeeks.push(wNum);
              }
          });

          const weeksData: Record<number, { hasStartedMatch: boolean }> = {};
          dbBulletin.forEach(b => {
              if (!weeksData[b.week_num]) weeksData[b.week_num] = { hasStartedMatch: false };
              const status = statusMap[(b.week_num * 100) + b.match_index];
              if (status && status !== 'NOT_STARTED') weeksData[b.week_num].hasStartedMatch = true;
          });

          const startedWeeks = Object.keys(weeksData).map(Number).filter(w => weeksData[w].hasStartedMatch);
          activeWeek = startedWeeks.length > 0 ? Math.max(...startedWeeks) : Math.max(...Object.keys(weeksData).map(Number)); 
          
          if (!liveWeeks.includes(activeWeek)) liveWeeks.push(activeWeek);

          const activeWeekMatches = allMatches.filter(m => Math.floor(m.id / 100) === activeWeek);
          const finishedCount = activeWeekMatches.filter(m => m.status === 'FINISHED' || m.status === 'MS').length;
          setHaftaBittiMi(finishedCount === 24);
      }

      // 1. KASADAN (POINTS) GEÇMİŞ HAFTALARIN KESİNLEŞMİŞ FİŞLERİNİ ÇEK
      let allPoints: any[] = [];
      let fetchMorePts = true;
      let fromPts = 0;
      const stepPts = 1000;
      
      while (fetchMorePts) {
        const { data: ptsChunk, error } = await supabase.from('points').select('*').range(fromPts, fromPts + stepPts - 1);
        if (!error && ptsChunk && ptsChunk.length > 0) {
           allPoints = [...allPoints, ...ptsChunk];
           if (ptsChunk.length < stepPts) fetchMorePts = false; else fromPts += stepPts;
        } else { fetchMorePts = false; }
      }

      // 2. AKTİF (VE CANLI) HAFTALARIN TAHMİNLERİNİ ÇEK
      let predictions: any[] = [];
      if (liveWeeks.length > 0) {
          let fetchMore = true; let from = 0;
          while (fetchMore) {
            const { data: pDataChunk, error } = await supabase.from('player_predictions').select('*').in('week_num', liveWeeks).range(from, from + stepPts - 1);
            if (!error && pDataChunk && pDataChunk.length > 0) {
               predictions = [...predictions, ...pDataChunk];
               if (pDataChunk.length < stepPts) fetchMore = false; else from += stepPts; 
            } else { fetchMore = false; }
          }
      }

      // 🔥 HAYAT KURTARAN DOKUNUŞ: ÇİFT TAHMİN (DUPLICATE) SIZINTISINI ENGELLE 🔥
      const uniquePredictions: any[] = [];
      const seenPreds = new Set();
      predictions.forEach(p => {
          const key = `${p.user_id}-${p.week_num}-${p.match_index}`;
          if (!seenPreds.has(key)) {
              seenPreds.add(key);
              uniquePredictions.push(p);
          }
      });

      // OYUNCU İSTATİSTİKLERİ KASASI
      const userStats: Record<string, any> = {};
      Object.values(idToNameMap).forEach(name => {
          const cleanName = name.replace(/ 🏆/g, '').trim();
          userStats[cleanName] = {
              name: name,
              cleanName: cleanName,
              masterBase: 0, dfoBase: 0, tffBase: 0,
              masterActive: 0, dfoActive: 0, tffActive: 0,
              masterLive: 0, dfoLive: 0, tffLive: 0
          };
      });

      // 3. GEÇMİŞ HAFTALARI HESAPLA (ÇİFTE SAYIMI ÖNLER)
      allPoints.forEach(pt => {
          if (pt.ev_sahibi === 'HAFTANIN' || pt.ev_sahibi === 'SKOR') return; // Bonusları sayma, sadece maç skorlarını say
          if (Number(pt.hafta) >= activeWeek) return; // Aktif haftayı kütükten değil, en taze veriden (aşağıda) sayacağız

          const ptName = (pt.user_name || "").replace(/ 🏆/g, '').trim();
          const targetPlayer = Object.values(userStats).find(p => p.cleanName === ptName || p.cleanName.includes(ptName));

          if (targetPlayer) {
              targetPlayer.masterBase += 1;
              if (pt.kategori === 'DFO') targetPlayer.dfoBase += 1;
              else if (pt.kategori === 'TFF') targetPlayer.tffBase += 1;
          }
      });

      // 4. AKTİF HAFTAYI HESAPLA (BİTENLER VE CANLILAR BİR ARADA)
      if (allMatches && dbBulletin) {
          const matchesToCalculate = allMatches.filter(m => liveWeeks.includes(Math.floor(m.id / 100)));

          matchesToCalculate.forEach(match => {
              if (match.status === 'NOT_STARTED' || match.home_score === '-' || match.away_score === '-') return;

              const mIndex = match.id % 100;
              const matchWeek = Math.floor(match.id / 100);
              const currentScore = `${match.home_score}-${match.away_score}`;

              const bulletinMatch = dbBulletin.find(b => b.week_num === matchWeek && b.match_index === mIndex);
              let isTff = false;
              if (bulletinMatch) {
                  isTff = advancedTffCheck(bulletinMatch.category, bulletinMatch.home_team, bulletinMatch.away_team);
              }

              // Çift sızıntı önleyici filtreden (uniquePredictions) yararlanıyoruz
              const exactWinners = uniquePredictions.filter(p => p.match_index === mIndex && p.predicted_score === currentScore && p.week_num === matchWeek);

              exactWinners.forEach(w => {
                  const playerName = idToNameMap[w.user_id] || "";
                  if (playerName) {
                      const cleanPlayerName = playerName.replace(/ 🏆/g, '').trim();
                      const targetPlayer = Object.values(userStats).find(p => p.cleanName === cleanPlayerName || p.cleanName.includes(cleanPlayerName));

                      if (targetPlayer) {
                          // Aktif Hafta Toplamı (Biten Maçlar + Canlı Maçlar)
                          targetPlayer.masterActive += 1;
                          if (isTff) targetPlayer.tffActive += 1;
                          else targetPlayer.dfoActive += 1;

                          // Sadece Canlı Olanlar (Rozet İçin - Toplama Eklenmez)
                          if (match.status === 'LIVE' || match.status === 'HT') {
                              targetPlayer.masterLive += 1;
                              if (isTff) targetPlayer.tffLive += 1;
                              else targetPlayer.dfoLive += 1;
                          }
                      }
                  }
              });
          });
      }

      // 5. SIRALAMA VE OKLARI (TREND) HESAPLA
      const finalArray = Object.values(userStats);

      const calculateRankings = (category: 'master' | 'dfo' | 'tff') => {
          const baseKey = `${category}Base`;
          const activeKey = `${category}Active`;
          const liveKey = `${category}Live`;

          // Önceki Hafta Sıralaması (Oklar için baz alınır)
          const prevList = [...finalArray].sort((a, b) => b[baseKey] - a[baseKey] || a.name.localeCompare(b.name, 'tr'));
          const prevRanks: Record<string, number> = {};
          prevList.forEach((p, idx) => { prevRanks[p.cleanName] = idx + 1; });

          // Güncel Sıralama
          const currentList = [...finalArray].map(p => ({
              name: p.name,
              totalScore: p[baseKey] + p[activeKey], // Kasa + Aktif Hafta
              liveBonus: p[liveKey], // Sadece rozet için
              cleanName: p.cleanName
          })).sort((a, b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name, 'tr'));

          return currentList.map((p, idx) => {
              const currentRank = idx + 1;
              const prevRank = prevRanks[p.cleanName];
              let trend = 'same', diff = 0;
              if (currentRank < prevRank) { trend = 'up'; diff = prevRank - currentRank; }
              else if (currentRank > prevRank) { trend = 'down'; diff = currentRank - prevRank; }

              return { ...p, trend, diff, currentRank };
          });
      };

      setLists({
          MASTER: calculateRankings('master'),
          DFO: calculateRankings('dfo'),
          TFF: calculateRankings('tff')
      });
      setIsDataLoading(false);

    } catch (error) {
      console.error("Skor verileri çekilirken hata:", error);
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    loadSkorData();
    const channel1 = supabase.channel('skor_live_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, () => { loadSkorData(); }).subscribe();
    const interval = setInterval(loadSkorData, 30000); 
    return () => { 
        supabase.removeChannel(channel1); 
        clearInterval(interval); 
    };
  }, []);

  const resmiBildiriyiIndir = async () => {
    if (!haftaBittiMi || !tabloRef.current) return;
    const canvas = await html2canvas(tabloRef.current, { backgroundColor: '#0f172a', scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Tam_Isabet_Kralligi_${activeTab}.png`;
    link.click();
  };

  const currentList = lists[activeTab] || [];

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md px-2">
          ELİT TAHMİN SKOR TAM İSABET BARAJ MERKEZİ
        </h1>
      </div>

      <div className="w-full max-w-3xl mx-auto mt-2">
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => setActiveTab('MASTER')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'MASTER' ? 'bg-amber-600 text-white border-amber-400 scale-105 shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🏆 MASTER</button>
          <button onClick={() => setActiveTab('DFO')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'DFO' ? 'bg-blue-600 text-white border-blue-400 scale-105 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🌍 DFO</button>
          <button onClick={() => setActiveTab('TFF')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'TFF' ? 'bg-red-600 text-white border-red-400 scale-105 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🇹🇷 TFF</button>
        </div>

        <div className="flex justify-end mb-4">
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

        <div ref={tabloRef} className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6 border border-[#1e293b] shadow-xl">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
              <span>🎯</span>
              <span>{activeTab === 'MASTER' ? 'MASTER' : activeTab === 'DFO' ? 'DFO' : 'TFF'} TAM İSABET SAYISI</span>
            </div>
          </div>
          {!isDataLoading && currentList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
              <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                <tr>
                  <th className="pl-3 md:pl-4 pr-1 py-3 w-10 md:w-14 text-left">SIRA</th>
                  <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                  <th className="px-1 py-3 w-20 md:w-28 text-right"></th>
                  <th className="pr-3 md:pr-4 pl-1 py-3 w-16 md:w-20 text-center">TAM İSABET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {currentList.map((row: any, idx: number) => {
                  return (
                  <tr key={idx} className="hover:bg-[#0f172a]/40 transition-colors">
                    
                    <td className="pl-3 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-middle">
                      <div className="flex items-center">
                        <span className="text-left w-5">{idx + 1}</span>
                        {row.trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold flex items-center">▲<span className="text-[8px]">{row.diff}</span></span>}
                        {row.trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center">▼<span className="text-[8px]">{row.diff}</span></span>}
                      </div>
                    </td>
                    
                    <td className="px-1 md:px-2 py-3 align-middle">
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-white font-semibold">
                        <span className="whitespace-nowrap">{row.name}</span>
                      </div>
                    </td>

                    <td className="px-1 py-3 align-middle text-right">
                      {row.liveBonus > 0 && (
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/50 animate-pulse whitespace-nowrap shadow-sm">
                          +{row.liveBonus} SKOR CANLI
                        </span>
                      )}
                    </td>

                    <td className={`pr-3 md:pr-4 pl-1 py-3 align-middle font-bold text-sm text-center ${activeTab === 'MASTER' ? 'text-amber-500' : activeTab === 'DFO' ? 'text-blue-400' : 'text-red-500'}`}>
                      {row.totalScore}
                    </td>

                  </tr>
                )})}
              </tbody>
            </table>
            </div>
          ) : ( <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Skorlar hesaplanıyor...</div> )}
        </div>
      </div>
    </div>
  );
}