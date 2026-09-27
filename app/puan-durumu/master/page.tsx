'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import html2canvas from 'html2canvas';

const formatTurkishDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length !== 3) return dateStr;
  
  const months = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
  const day = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parts[2];
  
  if (monthIndex >= 0 && monthIndex < 12) {
    return `${day} ${months[monthIndex]} ${year}`;
  }
  return dateStr;
};

// 🔥 ÖNDER KOMUTAN'IN MÜHÜRLÜ 13. HAFTA LİSTESİ (TEMEL KAYA) 🔥
const mühürlüListe = [
  { id: '1', name: 'DOĞAÇ ALKAN', score: 112, badges: [] as string[] },
  { id: '2', name: 'YUSUF ERBAY', score: 110, badges: [] },
  { id: '3', name: 'ÖNDER ASLAN', score: 107, badges: [] },
  { id: '4', name: 'SALİH KARACAOĞLU', score: 104, badges: [] },
  { id: '5', name: 'HAKAN AYAN', score: 103, badges: [] },
  { id: '6', name: 'EYÜP KARACAOĞLU', score: 102, badges: [] },
  { id: '7', name: 'İSMAİL EKER 🏆', score: 101, badges: [] },
  { id: '8', name: 'OSMAN ALİ AYDIN 🏆', score: 93, badges: [] },
  { id: '9', name: 'SEDAT SEDAT', score: 93, badges: [] },
  { id: '10', name: 'MEHMET ALİ KARA', score: 92, badges: [] },
  { id: '11', name: 'ŞENOL CAN ÇAKICI', score: 89, badges: [] },
  { id: '12', name: 'R. İLHAN KARACA 🏆🏆', score: 80, badges: [] },
  { id: '13', name: 'HUDAVER TOPARDIC', score: 78, badges: [] },
  { id: '14', name: 'SEDAT DİŞLİ', score: 78, badges: [] },
  { id: '15', name: 'CUMALİ SÖKER', score: 70, badges: [] },
  { id: '16', name: 'ÖNDER IŞIK', score: 69, badges: [] },
  { id: '17', name: 'MELİH PINAR', score: 66, badges: [] },
  { id: '18', name: 'MUSTAFA GÜMÜŞÇÜ', score: 66, badges: [] },
  { id: '19', name: 'SABAHATTİN ÇAYLAK', score: 66, badges: [] },
  { id: '20', name: 'MUHSİN ASİLKAN', score: 64, badges: [] },
  { id: '21', name: 'MURAT KARA', score: 63, badges: [] },
  { id: '22', name: 'ULAŞ ADIGÜZEL', score: 63, badges: [] },
  { id: '23', name: 'B.VEYSELOĞLU EROL', score: 61, badges: [] },
  { id: '24', name: 'FATİH AYAN', score: 60, badges: [] },
  { id: '25', name: 'AHMET BİRCAN 🏆', score: 56, badges: [] },
  { id: '26', name: 'UĞUR GÜRBÜZ', score: 55, badges: [] },
  { id: '27', name: 'YAPAY ZEKA', score: 54, badges: [] },
  { id: '28', name: 'YUSUF KIZILTUĞ', score: 54, badges: [] },
  { id: '29', name: 'ABDULLAH DİK', score: 53, badges: [] },
  { id: '30', name: 'MURAT ALİ', score: 50, badges: [] },
  { id: '31', name: 'GAZİ AYAN 🏆🏆', score: 48, badges: [] },
  { id: '32', name: 'UĞUR VARDAR', score: 45, badges: [] },
  { id: '33', name: 'BEKİR KARADAĞ', score: 43, badges: [] },
  { id: '34', name: 'MUSTAFA ELMAS', score: 42, badges: [] },
  { id: '35', name: 'SAVAŞ ÇAĞLAYAN', score: 42, badges: [] },
  { id: '36', name: 'LEVENT YILDIRIM', score: 41, badges: [] },
  { id: '37', name: 'MEVLÜT EVLER', score: 41, badges: [] },
  { id: '38', name: 'ALİOS GÖZTEPE', score: 40, badges: [] },
  { id: '39', name: 'KEMAL ERSOY', score: 40, badges: [] },
  { id: '40', name: 'RIDVAN DOGER', score: 38, badges: [] },
  { id: '41', name: 'OZKAYA MAZAKALI BAYRAM', score: 37, badges: [] },
  { id: '42', name: 'MAHMUT CBR', score: 36, badges: [] },
  { id: '43', name: 'CEMAL SİVRİKAYA 🏆', score: 35, badges: [] },
  { id: '44', name: 'AYHAN LUŞOĞLU', score: 34, badges: [] },
  { id: '45', name: 'BİROL DEMİREL', score: 33, badges: [] },
  { id: '46', name: 'İLYAS KAZDAL', score: 29, badges: [] },
  { id: '47', name: 'İLYAS UYGUN', score: 25, badges: [] },
  { id: '48', name: 'AYGÜN AKKEÇELİ', score: 23, badges: [] },
  { id: '49', name: 'BAYRAM YILMAZ', score: 19, badges: [] },
  { id: '50', name: 'CEMALETTİN BELLİ', score: 11, badges: [] },
  { id: '51', name: 'MUHAMMED M.ASLANOĞLU', score: 7, badges: [] },
  { id: '52', name: 'ŞAHİN GEZGİNCİ', score: 7, badges: [] },
  { id: '53', name: 'ŞEMSETTIN DÜGER', score: 7, badges: [] },
  { id: '54', name: 'YAHŞİ ERKAN 🏆', score: 6, badges: [] },
  { id: '55', name: 'MUSTAFA TUCİ', score: 1, badges: [] },
  { id: '56', name: 'İSMAİL YILDIRIM', score: 0, badges: [] },
  { id: '57', name: 'MUZAFFER KESKİN', score: 0, badges: [] }
];

export default function MasterPuanDurumuPage() {
  const [displayWeekNum, setDisplayWeekNum] = useState<number>(0);
  const [displayDate, setDisplayDate] = useState<string>('');
  const [liveList, setLiveList] = useState<any[]>([]);
  
  const [haftaBittiMi, setHaftaBittiMi] = useState<boolean>(false);
  const tabloRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    const initDudukKurali = async () => {
      try {
        const { data: allMatches } = await supabase.from('live_matches').select('*');
        const { data: dbBulletin } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date');
        
        let activeWeek = 5; 
        let activeDate = '';

        if (dbBulletin && allMatches) {
            const statusMap: Record<number, string> = {};
            allMatches.forEach(m => statusMap[m.id] = m.status);

            const weeksData: Record<number, { date: string, hasStartedMatch: boolean }> = {};
            
            dbBulletin.forEach(b => {
                if (!weeksData[b.week_num]) {
                    weeksData[b.week_num] = { date: b.match_date, hasStartedMatch: false };
                }
                weeksData[b.week_num].date = b.match_date; 
                
                const mId = (b.week_num * 100) + b.match_index;
                const status = statusMap[mId];
                if (status && status !== 'NOT_STARTED') {
                    weeksData[b.week_num].hasStartedMatch = true;
                }
            });

            const startedWeeks = Object.keys(weeksData).map(Number).filter(w => weeksData[w].hasStartedMatch);
            if (startedWeeks.length > 0) {
                activeWeek = Math.max(...startedWeeks);
            } else {
                activeWeek = Math.max(...Object.keys(weeksData).map(Number)); 
            }
            activeDate = weeksData[activeWeek]?.date || '';

            const activeWeekMatches = allMatches.filter(m => Math.floor(m.id / 100) === activeWeek);
            const finishedCount = activeWeekMatches.filter(m => m.status === 'MS' || m.status === 'FINISHED').length;
            setHaftaBittiMi(finishedCount === 24);
        }

        setDisplayWeekNum(activeWeek);
        setDisplayDate(formatTurkishDate(activeDate));

        const { data: playersData } = await supabase.from('players').select('username, name');
        const idToNameMap: Record<string, string> = {};
        if (playersData) {
            playersData.forEach(p => idToNameMap[p.username] = p.name);
        }

        let pastAndActivePoints: any[] = [];
        let fetchMorePts = true;
        let fromPts = 0;
        const stepPts = 1000;

        while (fetchMorePts) {
            const { data: ptsChunk, error } = await supabase
                .from('points')
                .select('*')
                .eq('kategori', 'MASTER')
                .order('id', { ascending: true }) 
                .range(fromPts, fromPts + stepPts - 1);
                
            if (!error && ptsChunk && ptsChunk.length > 0) {
                pastAndActivePoints = [...pastAndActivePoints, ...ptsChunk];
                if (ptsChunk.length < stepPts) fetchMorePts = false;
                else fromPts += stepPts;
            } else {
                fetchMorePts = false;
            }
        }

        let predictions: any[] = [];
        let fetchMore = true;
        let from = 0;

        while (fetchMore) {
            const { data: pDataChunk, error } = await supabase
                .from('player_predictions')
                .select('*')
                .eq('week_num', activeWeek)
                .range(from, from + stepPts - 1);

            if (error) break;

            if (pDataChunk && pDataChunk.length > 0) {
                predictions = [...predictions, ...pDataChunk];
                if (pDataChunk.length < stepPts) fetchMore = false; 
                else from += stepPts; 
            } else {
                fetchMore = false; 
            }
        }

        const isBonusDistributedInDB = pastAndActivePoints.some(pt => Number(pt.hafta) === activeWeek && (pt.ev_sahibi === 'HAFTANIN' || pt.ev_sahibi === 'SKOR'));

        let updatedList = mühürlüListe.map(row => ({
            ...row,
            liveBonus: 0,
            finishedBonus: 0,
            badges: [] as string[]
        }));

        if (pastAndActivePoints.length > 0) {
            pastAndActivePoints.forEach(pt => {
                const haftaNum = Number(pt.hafta || 0);
                if (haftaNum > 13) { 
                    const userNameStr = String(pt.user_name || "");
                    const targetPlayer = updatedList.find(p => p.name.includes(userNameStr) || userNameStr.includes(p.name));
                    if (targetPlayer) targetPlayer.finishedBonus += Number(pt.puan || 0);
                }
            });
        }

        if (allMatches && predictions) {
            const liveM = allMatches.filter(m => m.status === 'LIVE' || m.status === 'HT');
            
            liveM.forEach(match => {
                const currentScore = `${match.home_score}-${match.away_score}`;
                if (currentScore === "-" || match.home_score === "-" || match.away_score === "-") return;
                
                const mIndex = match.id % 100;
                const winners = predictions.filter(p => p.match_index === mIndex && p.predicted_score === currentScore);
                
                let pts = 0;
                if (winners.length === 1) pts = 12;
                else if (winners.length === 2) pts = 6;
                else if (winners.length === 3) pts = 5;
                else if (winners.length === 4) pts = 4;
                else if (winners.length === 5) pts = 3;
                else if (winners.length === 6) pts = 2;
                else if (winners.length >= 7) pts = 1;

                winners.forEach(w => {
                    const playerName = idToNameMap[w.user_id];
                    if (playerName) {
                        const targetPlayer = updatedList.find(p => p.name === playerName || p.name.includes(playerName) || playerName.includes(p.name.replace(/ 🏆/g, '')));
                        if (targetPlayer) targetPlayer.liveBonus += pts;
                    }
                });
            });
        }

        if (allMatches && predictions) {
            const weeklyStats: Record<string, { pts: number, exacts: number }> = {};
            updatedList.forEach(p => { weeklyStats[p.name] = { pts: 0, exacts: 0 }; });

            const activeWeekMatches = allMatches.filter(m => Math.floor(m.id / 100) === activeWeek && m.status !== 'NOT_STARTED');
            
            activeWeekMatches.forEach(match => {
                const currentScore = `${match.home_score}-${match.away_score}`;
                if (currentScore === "-" || match.home_score === "-" || match.away_score === "-") return;
                
                const mIndex = match.id % 100;
                const winners = predictions.filter(p => p.match_index === mIndex && p.predicted_score === currentScore);
                
                let pts = 0;
                if (winners.length === 1) pts = 12;
                else if (winners.length === 2) pts = 6;
                else if (winners.length === 3) pts = 5;
                else if (winners.length === 4) pts = 4;
                else if (winners.length === 5) pts = 3;
                else if (winners.length === 6) pts = 2;
                else if (winners.length >= 7) pts = 1;

                winners.forEach(w => {
                    const playerName = idToNameMap[w.user_id];
                    if (playerName) {
                        const targetPlayer = updatedList.find(p => p.name === playerName || p.name.includes(playerName) || playerName.includes(p.name.replace(/ 🏆/g, '')));
                        if (targetPlayer) {
                            weeklyStats[targetPlayer.name].pts += pts;
                            weeklyStats[targetPlayer.name].exacts += 1;
                        }
                    }
                });
            });

            let maxPts = 0, maxExacts = 0;
            Object.values(weeklyStats).forEach(s => {
                if (s.pts > maxPts) maxPts = s.pts;
                if (s.exacts > maxExacts) maxExacts = s.exacts;
            });

            let ptsLeadersCount = 0, exactsLeadersCount = 0;
            let ptsLeaderName = "", exactsLeaderName = "";

            Object.entries(weeklyStats).forEach(([name, s]) => {
                if (maxPts > 0 && s.pts === maxPts) { ptsLeadersCount++; ptsLeaderName = name; }
                if (maxExacts > 0 && s.exacts === maxExacts) { exactsLeadersCount++; exactsLeaderName = name; }
            });

            if (ptsLeadersCount === 1) {
                const p = updatedList.find(player => player.name === ptsLeaderName);
                if (p) { 
                    p.badges.push('points'); 
                    if (!isBonusDistributedInDB) p.liveBonus += 3; 
                }
            }
            if (exactsLeadersCount === 1) {
                const p = updatedList.find(player => player.name === exactsLeaderName);
                if (p) { 
                    p.badges.push('score'); 
                    if (!isBonusDistributedInDB) p.liveBonus += 3; 
                }
            }
        }

        updatedList = updatedList.map(p => ({
            ...p,
            score: p.score + p.finishedBonus + p.liveBonus
        })).sort((a, b) => b.score - a.score);

        setLiveList(updatedList);

      } catch(e) { console.log("Veri çekilirken hata:", e); }
    };

    initDudukKurali();

    const channel = supabase.channel('public:master_standings_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, payload => {
            setTimeout(initDudukKurali, 300);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'points' }, payload => {
            setTimeout(initDudukKurali, 300);
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="w-full px-1 sm:px-4 py-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md">
          ELİT TAHMİN MASTER LİGİ
        </h1>
      </div>
      
      <div className="w-full max-w-3xl mx-auto mt-2">
        <div ref={tabloRef} className="w-full p-1 sm:p-2 bg-[#0f172a] rounded-xl">
          <div className="w-full bg-[#f59e0b] text-black font-extrabold text-[11px] md:text-sm py-2 sm:py-3 px-2 sm:px-4 rounded-xl mb-4 text-center uppercase tracking-wide shadow-md border border-amber-500/50">
            {displayWeekNum > 0 ? `${displayWeekNum}. HAFTA MASTER PUAN DURUMU (${displayDate})` : 'MASTER PUAN DURUMU YÜKLENİYOR...'}
          </div>

          <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-2 border border-[#1e293b]">
            <div className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-[#0f172a] border-b border-[#1e293b]">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
                <span>📅</span>
                <span>GÜNCEL PUAN DURUMU</span>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-left text-[12px] sm:text-sm">
                <thead className="text-[#64748b] uppercase text-[10px] sm:text-[11px] bg-[#0f172a]">
                  <tr>
                    <th className="pl-3 sm:pl-4 py-2 sm:py-3 text-left">YARIŞMACI</th>
                    <th className="px-2 py-2 sm:py-3 w-20 sm:w-28 text-center">PUAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {liveList.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-[#0f172a]/40 transition-colors">
                      
                      <td className="pl-3 sm:pl-4 py-2 sm:py-3 align-middle">
                        <div className="flex flex-col gap-1">
                          
                          <div className="flex flex-wrap items-center gap-1.5 font-bold">
                            <span className="text-slate-400 w-6 sm:w-7 text-[12px] sm:text-sm">{idx + 1}.</span>
                            <span className="text-white text-[12px] sm:text-sm whitespace-nowrap">{row.name}</span>
                            {row.liveBonus > 0 && (
                              <span className="text-[8px] sm:text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/50 animate-pulse whitespace-nowrap shadow-sm">
                                +{row.liveBonus} CANLI
                              </span>
                            )}
                          </div>
                          
                          {(row.badges.includes('points') || row.badges.includes('score')) && (
                            <div className="flex flex-wrap gap-1 mt-0.5 ml-7 sm:ml-8">
                              {row.badges.includes('points') && (
                                <span className="bg-amber-950/60 text-amber-500 border border-amber-600/50 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-tight whitespace-nowrap shadow-sm">
                                  +3 PUAN HAFTANIN LİDERİ
                                </span>
                              )}
                              {row.badges.includes('score') && (
                                <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-600/50 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-tight whitespace-nowrap shadow-sm">
                                  +3 PUAN SKOR LİDERİ
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-2 sm:py-3 align-middle font-bold text-[12px] sm:text-sm text-amber-500 text-center">
                        {row.score}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}