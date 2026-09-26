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

// 🔥 ÖNDER KOMUTAN'IN MÜHÜRLÜ 13. HAFTA LİSTESİ 🔥
const mühürlüListe = [
  { id: '1', name: 'DOĞAÇ ALKAN', score: 112, trend: 'same', trendDiff: 0, badges: [] },
  { id: '2', name: 'YUSUF ERBAY', score: 110, trend: 'up', trendDiff: 1, badges: ['points'] },
  { id: '3', name: 'ÖNDER ASLAN', score: 107, trend: 'down', trendDiff: 1, badges: [] },
  { id: '4', name: 'SALİH KARACAOĞLU', score: 104, trend: 'same', trendDiff: 0, badges: [] },
  { id: '5', name: 'HAKAN AYAN', score: 103, trend: 'same', trendDiff: 0, badges: [] },
  { id: '6', name: 'EYÜP KARACAOĞLU', score: 102, trend: 'same', trendDiff: 0, badges: [] },
  { id: '7', name: 'İSMAİL EKER 🏆', score: 101, trend: 'same', trendDiff: 0, badges: [] },
  { id: '8', name: 'OSMAN ALİ AYDIN 🏆', score: 93, trend: 'up', trendDiff: 1, badges: [] },
  { id: '9', name: 'SEDAT SEDAT', score: 93, trend: 'down', trendDiff: 1, badges: [] },
  { id: '10', name: 'MEHMET ALİ KARA', score: 92, trend: 'same', trendDiff: 0, badges: [] },
  { id: '11', name: 'ŞENOL CAN ÇAKICI', score: 89, trend: 'same', trendDiff: 0, badges: [] },
  { id: '12', name: 'R. İLHAN KARACA 🏆🏆', score: 80, trend: 'same', trendDiff: 0, badges: [] },
  { id: '13', name: 'HUDAVER TOPARDIC', score: 78, trend: 'up', trendDiff: 1, badges: [] },
  { id: '14', name: 'SEDAT DİŞLİ', score: 78, trend: 'down', trendDiff: 1, badges: [] },
  { id: '15', name: 'CUMALİ SÖKER', score: 70, trend: 'same', trendDiff: 0, badges: [] },
  { id: '16', name: 'ÖNDER IŞIK', score: 69, trend: 'same', trendDiff: 0, badges: [] },
  { id: '17', name: 'MELİH PINAR', score: 66, trend: 'up', trendDiff: 2, badges: [] },
  { id: '18', name: 'MUSTAFA GÜMÜŞÇÜ', score: 66, trend: 'same', trendDiff: 0, badges: [] },
  { id: '19', name: 'SABAHATTİN ÇAYLAK', score: 66, trend: 'down', trendDiff: 2, badges: [] },
  { id: '20', name: 'MUHSİN ASİLKAN', score: 64, trend: 'same', trendDiff: 0, badges: [] },
  { id: '21', name: 'MURAT KARA', score: 63, trend: 'up', trendDiff: 1, badges: [] },
  { id: '22', name: 'ULAŞ ADIGÜZEL', score: 63, trend: 'down', trendDiff: 1, badges: [] },
  { id: '23', name: 'B.VEYSELOĞLU EROL', score: 61, trend: 'up', trendDiff: 1, badges: ['score'] },
  { id: '24', name: 'FATİH AYAN', score: 60, trend: 'down', trendDiff: 1, badges: [] },
  { id: '25', name: 'AHMET BİRCAN 🏆', score: 56, trend: 'same', trendDiff: 0, badges: [] },
  { id: '26', name: 'UĞUR GÜRBÜZ', score: 55, trend: 'same', trendDiff: 0, badges: [] },
  { id: '27', name: 'YAPAY ZEKA', score: 54, trend: 'up', trendDiff: 1, badges: [] },
  { id: '28', name: 'YUSUF KIZILTUĞ', score: 54, trend: 'down', trendDiff: 1, badges: [] },
  { id: '29', name: 'ABDULLAH DİK', score: 53, trend: 'same', trendDiff: 0, badges: [] },
  { id: '30', name: 'MURAT ALİ', score: 50, trend: 'same', trendDiff: 0, badges: [] },
  { id: '31', name: 'GAZİ AYAN 🏆🏆', score: 48, trend: 'same', trendDiff: 0, badges: [] },
  { id: '32', name: 'UĞUR VARDAR', score: 45, trend: 'same', trendDiff: 0, badges: [] },
  { id: '33', name: 'BEKİR KARADAĞ', score: 43, trend: 'same', trendDiff: 0, badges: [] },
  { id: '34', name: 'MUSTAFA ELMAS', score: 42, trend: 'up', trendDiff: 1, badges: [] },
  { id: '35', name: 'SAVAŞ ÇAĞLAYAN', score: 42, trend: 'down', trendDiff: 1, badges: [] },
  { id: '36', name: 'LEVENT YILDIRIM', score: 41, trend: 'up', trendDiff: 1, badges: [] },
  { id: '37', name: 'MEVLÜT EVLER', score: 41, trend: 'down', trendDiff: 1, badges: [] },
  { id: '38', name: 'ALİOS GÖZTEPE', score: 40, trend: 'up', trendDiff: 1, badges: [] },
  { id: '39', name: 'KEMAL ERSOY', score: 40, trend: 'down', trendDiff: 1, badges: [] },
  { id: '40', name: 'RIDVAN DOGER', score: 38, trend: 'same', trendDiff: 0, badges: [] },
  { id: '41', name: 'OZKAYA MAZAKALI BAYRAM', score: 37, trend: 'same', trendDiff: 0, badges: [] },
  { id: '42', name: 'MAHMUT CBR', score: 36, trend: 'same', trendDiff: 0, badges: [] },
  { id: '43', name: 'CEMAL SİVRİKAYA 🏆', score: 35, trend: 'same', trendDiff: 0, badges: [] },
  { id: '44', name: 'AYHAN LUŞOĞLU', score: 34, trend: 'same', trendDiff: 0, badges: [] },
  { id: '45', name: 'BİROL DEMİREL', score: 33, trend: 'same', trendDiff: 0, badges: [] },
  { id: '46', name: 'İLYAS KAZDAL', score: 29, trend: 'same', trendDiff: 0, badges: [] },
  { id: '47', name: 'İLYAS UYGUN', score: 25, trend: 'same', trendDiff: 0, badges: [] },
  { id: '48', name: 'AYGÜN AKKEÇELİ', score: 23, trend: 'same', trendDiff: 0, badges: [] },
  { id: '49', name: 'BAYRAM YILMAZ', score: 19, trend: 'same', trendDiff: 0, badges: [] },
  { id: '50', name: 'CEMALETTİN BELLİ', score: 11, trend: 'same', trendDiff: 0, badges: [] },
  { id: '51', name: 'MUHAMMED M.ASLANOĞLU', score: 7, trend: 'up', trendDiff: 2, badges: [] },
  { id: '52', name: 'ŞAHİN GEZGİNCİ', score: 7, trend: 'same', trendDiff: 0, badges: [] },
  { id: '53', name: 'ŞEMSETTIN DÜGER', score: 7, trend: 'down', trendDiff: 2, badges: [] },
  { id: '54', name: 'YAHŞİ ERKAN 🏆', score: 6, trend: 'same', trendDiff: 0, badges: [] },
  { id: '55', name: 'MUSTAFA TUCİ', score: 1, trend: 'same', trendDiff: 0, badges: [] },
  { id: '56', name: 'İSMAİL YILDIRIM', score: 0, trend: 'up', trendDiff: 1, badges: [] },
  { id: '57', name: 'MUZAFFER KESKİN', score: 0, trend: 'down', trendDiff: 1, badges: [] }
];

export default function MasterPuanDurumuPage() {
  const [displayWeekNum, setDisplayWeekNum] = useState<number>(0);
  const [displayDate, setDisplayDate] = useState<string>('');
  const [liveList, setLiveList] = useState<any[]>([]);
  
  // YENİ EKLENEN: Otomatik Kilit State'i ve Fotoğraf Referansı
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

            // YENİ EKLENEN: O haftanın tam 24 maçı da "MS" oldu mu kontrolü
            const activeWeekMatches = allMatches.filter(m => Math.floor(m.id / 100) === activeWeek);
            const finishedCount = activeWeekMatches.filter(m => m.status === 'MS').length;
            setHaftaBittiMi(finishedCount === 24);
        }

        setDisplayWeekNum(activeWeek);
        setDisplayDate(formatTurkishDate(activeDate));

        const { data: playersData } = await supabase.from('players').select('username, name');
        const idToNameMap: Record<string, string> = {};
        if (playersData) {
            playersData.forEach(p => idToNameMap[p.username] = p.name);
        }

        const { data: finishedPoints } = await supabase
            .from('points')
            .select('*')
            .eq('hafta', activeWeek)
            .eq('kategori', 'MASTER');

        let predictions: any[] = [];
        let fetchMore = true;
        let from = 0;
        const step = 1000;

        while (fetchMore) {
            const { data: pDataChunk, error } = await supabase
                .from('player_predictions')
                .select('*')
                .eq('week_num', activeWeek)
                .range(from, from + step - 1);

            if (error) break;

            if (pDataChunk && pDataChunk.length > 0) {
                predictions = [...predictions, ...pDataChunk];
                if (pDataChunk.length < step) fetchMore = false; 
                else from += step; 
            } else {
                fetchMore = false; 
            }
        }

        let updatedList = mühürlüListe.map(row => ({
            ...row,
            liveBonus: 0,
            finishedBonus: 0,
            badges: []
        }));

        if (finishedPoints) {
            finishedPoints.forEach(pt => {
                const targetPlayer = updatedList.find(p => p.name.includes(pt.user_name));
                if (targetPlayer) targetPlayer.finishedBonus += pt.puan;
            });
        }

        if (allMatches && predictions) {
            const activeM = allMatches.filter(m => m.status === 'LIVE' || m.status === 'HT' || m.status === 'MS' || m.status === 'FINISHED' || m.status === 'WAITING_APPROVAL');
            
            activeM.forEach(match => {
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
                            if (match.status === 'MS' || match.status === 'FINISHED' || match.status === 'WAITING_APPROVAL') {
                                targetPlayer.finishedBonus += pts; // MAÇ BİTTİ: Rozet yok, ana puana eklenir.
                            } else {
                                targetPlayer.liveBonus += pts; // MAÇ CANLI: Yeşil rozet yanar.
                            }
                        }
                    }
                });
            });
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

  // YENİ EKLENEN: Fotoğraf İndirme Fonksiyonu
  const resmiBildiriyiIndir = async () => {
    if (!haftaBittiMi || !tabloRef.current) return;
    const canvas = await html2canvas(tabloRef.current, { backgroundColor: '#0f172a', scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "Master_Ligi_Resmi_Bildiri.png";
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md">
          ELİT TAHMİN MASTER LİGİ
        </h1>
      </div>
      
      <div className="w-full max-w-3xl mx-auto mt-2">
        
        {/* YENİ EKLENEN: Akıllı İndirme Butonu */}
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

        {/* YENİ EKLENEN: Fotoğrafı çekilecek alanın tamamı ref içine alındı */}
        <div ref={tabloRef} className="w-full p-2 bg-[#0f172a] rounded-xl">
          <div className="w-full bg-[#f59e0b] text-black font-extrabold text-[13px] md:text-sm py-3 px-4 rounded-xl mb-4 text-center uppercase tracking-wide shadow-md border border-amber-500/50">
            {displayWeekNum > 0 ? `${displayWeekNum}. HAFTA MASTER PUAN DURUMU (${displayDate})` : 'MASTER PUAN DURUMU YÜKLENİYOR...'}
          </div>

          <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-2 border border-[#1e293b]">
            <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
                <span>📅</span>
                <span>GÜNCEL PUAN DURUMU</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                  <tr>
                    <th className="pl-3 md:pl-4 pr-1 py-3 w-10 md:w-14 text-left">SIRA</th>
                    <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                    <th className="px-1 py-3 w-16 md:w-24 text-right"></th>
                    <th className="pr-3 md:pr-4 pl-1 py-3 w-12 md:w-16 text-center">PUAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {liveList.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-[#0f172a]/40 transition-colors">
                      
                      <td className="pl-3 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-middle">
                        <div className="flex items-center">
                          <span className="text-left w-5">{idx + 1}</span>
                          {row.trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold flex items-center">▲<span className="text-[8px]">{row.trendDiff}</span></span>}
                          {row.trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center">▼<span className="text-[8px]">{row.trendDiff}</span></span>}
                        </div>
                      </td>
                      
                      <td className="px-1 md:px-2 py-3 align-middle">
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-white font-semibold">
                          <span className="whitespace-nowrap">{row.name}</span>
                          {row.badges.includes('points') && (
                            <span className="bg-amber-950/60 text-amber-500 border border-amber-600/50 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                              +3 PUAN HAFTANIN LİDERİ
                            </span>
                          )}
                          {row.badges.includes('score') && (
                            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-600/50 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                              +3 PUAN SKOR LİDERİ
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-1 py-3 align-middle text-right">
                        {row.liveBonus > 0 && (
                          <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/50 animate-pulse whitespace-nowrap shadow-sm">
                            +{row.liveBonus} CANLI
                          </span>
                        )}
                      </td>

                      <td className="pr-3 md:pr-4 pl-1 py-3 align-middle font-bold text-sm text-amber-500 text-center">
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