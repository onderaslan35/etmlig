'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface ScoreStats {
  played: number;
  hit: number;
}

interface PlayerStat {
  username: string;
  name: string;
  totalPreds: number;
  allScores: [string, ScoreStats][]; 
  style: string;
  styleColor: string;
}

interface GlobalStat {
  totalPredictions: number;
  mostPlayedScore: string;
  mostPlayedCount: number;
  mostAccurateScore: string;
  mostAccurateRate: number;
  mostAccurateHit: number;
  mostAccuratePlayed: number;
}

export default function ScoutRadarPage() {
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnaliz = async () => {
      try {
        setLoading(true);
        
        const { data: playersData } = await supabase.from('players').select('username, name');
        
        let allPreds: any[] = [];
        let fetchMore = true;
        let from = 0;
        const step = 1000;

        while (fetchMore) {
            const { data: pDataChunk, error } = await supabase
                .from('player_predictions')
                .select('user_id, predicted_score, week_num, match_index')
                .gte('week_num', 6)
                .order('id', { ascending: true })
                .range(from, from + step - 1);

            if (error) break;

            if (pDataChunk && pDataChunk.length > 0) {
                allPreds = [...allPreds, ...pDataChunk];
                if (pDataChunk.length < step) fetchMore = false;
                else from += step;
            } else {
                fetchMore = false;
            }
        }

        let allMatches: any[] = [];
        let fetchMoreMatches = true;
        let fromMatch = 0;
        
        while (fetchMoreMatches) {
            const { data: mDataChunk, error } = await supabase
                .from('live_matches')
                .select('id, home_score, away_score, status')
                .gte('id', 600)
                .order('id', { ascending: true })
                .range(fromMatch, fromMatch + step - 1);
            
            if (error) break;
            
            if (mDataChunk && mDataChunk.length > 0) {
                allMatches = [...allMatches, ...mDataChunk];
                if (mDataChunk.length < step) fetchMoreMatches = false;
                else fromMatch += step;
            } else {
                fetchMoreMatches = false;
            }
        }

        const actualScoresMap: Record<number, string> = {};
        allMatches.forEach(m => {
            if (m.home_score && m.home_score !== '-' && m.away_score && m.away_score !== '-') {
                if (m.status === 'FINISHED' || m.status === 'FT' || m.status === 'WAITING_APPROVAL') {
                    actualScoresMap[m.id] = `${m.home_score}-${m.away_score}`.replace(/\s+/g, '');
                }
            }
        });

        // 🔴 KARARGAH GENEL İSTATİSTİKLERİ İÇİN KASALAR
        let totalOverallPreds = 0;
        const globalScoreCounts: Record<string, ScoreStats> = {};

        if (playersData && allPreds) {
          const rawStats: PlayerStat[] = playersData.map(player => {
            const userPreds = allPreds.filter(p => String(p.user_id) === String(player.username));
            const totalPreds = userPreds.length;

            const scoreCounts: Record<string, ScoreStats> = {};
            
            userPreds.forEach(p => {
              const predicted = p.predicted_score.replace(/\s+/g, '');
              if (predicted && predicted !== '-') {
                // Bireysel Kasa
                if (!scoreCounts[predicted]) scoreCounts[predicted] = { played: 0, hit: 0 };
                scoreCounts[predicted].played += 1;

                // Genel Kasa (Tüm Karargah İçin)
                totalOverallPreds += 1;
                if (!globalScoreCounts[predicted]) globalScoreCounts[predicted] = { played: 0, hit: 0 };
                globalScoreCounts[predicted].played += 1;

                const matchId = (p.week_num * 100) + p.match_index;
                const actualScore = actualScoresMap[matchId];
                if (actualScore && actualScore === predicted) {
                    scoreCounts[predicted].hit += 1;
                    globalScoreCounts[predicted].hit += 1; // Genel Kasa İsabeti
                }
              }
            });

            const sortedScores = Object.entries(scoreCounts).sort((a, b) => b[1].played - a[1].played);

            let style = "Bilinmiyor / Karışık";
            let styleColor = "text-slate-400";

            if (sortedScores.length > 0) {
              const favScore = sortedScores[0][0];
              const favCount = sortedScores[0][1].played;
              const percent = (favCount / totalPreds) * 100;

              if (percent > 40) {
                 style = "Takıntılı (Tek Skorcu)"; styleColor = "text-red-400";
              } else if (['0-0', '1-1', '2-2'].includes(favScore)) {
                 style = "Beraberlikçi (Risk Almaz)"; styleColor = "text-amber-400";
              } else if (['1-0', '2-1', '2-0'].includes(favScore)) {
                 style = "Ev Sahibi Garantici"; styleColor = "text-emerald-400";
              } else if (['0-1', '1-2', '0-2'].includes(favScore)) {
                 style = "Deplasman Avcısı"; styleColor = "text-purple-400";
              } else if (['3-1', '3-2', '2-3', '1-3', '3-0'].includes(favScore)) {
                 style = "Gollü Geçer (Sürprizci)"; styleColor = "text-pink-400";
              } else {
                 style = "Dengeli Taktisyen"; styleColor = "text-blue-400";
              }
            }

            return {
              username: player.username,
              name: player.name,
              totalPreds,
              allScores: sortedScores, 
              style,
              styleColor
            };
          });

          // 🔴 GENEL İSTATİSTİKLERİ HESAPLAMA EMRİ
          const sortedGlobalPlayed = Object.entries(globalScoreCounts).sort((a, b) => b[1].played - a[1].played);
          
          // İsabet oranını bul (En az 15 kere oynanmış skorlar arasında arar ki yanıltıcı olmasın)
          const sortedGlobalAccurate = Object.entries(globalScoreCounts)
            .filter(score => score[1].played >= 15) 
            .sort((a, b) => (b[1].hit / b[1].played) - (a[1].hit / a[1].played));

          setGlobalStats({
              totalPredictions: totalOverallPreds,
              mostPlayedScore: sortedGlobalPlayed.length > 0 ? sortedGlobalPlayed[0][0] : '-',
              mostPlayedCount: sortedGlobalPlayed.length > 0 ? sortedGlobalPlayed[0][1].played : 0,
              mostAccurateScore: sortedGlobalAccurate.length > 0 ? sortedGlobalAccurate[0][0] : '-',
              mostAccurateHit: sortedGlobalAccurate.length > 0 ? sortedGlobalAccurate[0][1].hit : 0,
              mostAccuratePlayed: sortedGlobalAccurate.length > 0 ? sortedGlobalAccurate[0][1].played : 0,
              mostAccurateRate: sortedGlobalAccurate.length > 0 ? Math.round((sortedGlobalAccurate[0][1].hit / sortedGlobalAccurate[0][1].played) * 100) : 0,
          });

          const filtered = rawStats.filter(p => p.totalPreds > 0).sort((a, b) => b.totalPreds - a.totalPreds);
          setStats(filtered);
        }
      } catch (error) {
        console.error("Analiz çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnaliz();
  }, []);

  const filteredStats = stats.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full min-h-screen bg-[#0a0f1c] text-slate-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-500 uppercase tracking-wider drop-shadow-md">
              🕵️‍♂️ KOZMİK ODA: SCOUT RADARI
            </h1>
            <p className="text-sm text-slate-400 mt-1">Sadece Başkomutana Özel Zihin Haritası ve İsabet Oranları</p>
          </div>
          <input
            type="text"
            placeholder="Yarışmacı Ara..."
            className="bg-[#0f172a] border border-slate-700 text-white px-4 py-2 rounded-lg outline-none focus:border-amber-500 w-full sm:w-64 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🔴 YENİ: KARARGAH GENEL İSTATİSTİK PANELİ (DASHBOARD) 🔴 */}
        {!loading && globalStats && (
            <div className="w-full bg-[#0f172a] border-2 border-slate-700/80 rounded-2xl mb-8 p-4 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500"></div>
                <h2 className="text-center font-black text-slate-200 tracking-widest uppercase mb-6 text-sm sm:text-base opacity-80">
                    BÜTÜN KARARGAHIN GENEL TAHMİN RÖNTGENİ
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
                    
                    <div className="flex flex-col items-center justify-center pt-2 md:pt-0">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Sisteme Girilen Toplam Tahmin</span>
                        <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-md">
                            {globalStats.totalPredictions.toLocaleString('tr-TR')}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Karargahın En Çok Oynadığı Skor</span>
                        <div className="flex items-center gap-3">
                            <span className="bg-[#0a0f1c] border-2 border-amber-500 text-amber-400 text-2xl sm:text-3xl font-black px-4 py-1 rounded-lg">
                                {globalStats.mostPlayedScore}
                            </span>
                            <span className="text-slate-300 font-bold text-sm">
                                ({globalStats.mostPlayedCount.toLocaleString('tr-TR')} Kere)
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">Karargahın En Keskin Skoru (En Başarılı)</span>
                        <div className="flex items-center gap-3">
                            <span className="bg-[#0a0f1c] border-2 border-emerald-500 text-emerald-400 text-2xl sm:text-3xl font-black px-4 py-1 rounded-lg">
                                {globalStats.mostAccurateScore}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-emerald-400 font-black text-lg">% {globalStats.mostAccurateRate} İsabet</span>
                                <span className="text-slate-400 font-semibold text-[10px]">
                                    ({globalStats.mostAccuratePlayed} tahminde {globalStats.mostAccurateHit} vuruş)
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )}

        {loading ? (
          <div className="text-center text-amber-500 animate-pulse font-bold mt-20">📡 Arşiv Okunuyor ve İstihbarat Hesaplanıyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStats.map((player, idx) => (
              <div key={idx} className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 hover:border-amber-500/50 transition-colors shadow-lg flex flex-col max-h-[400px]">
                
                <div className="flex justify-between items-start mb-3 border-b border-slate-700/50 pb-3 shrink-0">
                  <h2 className="font-bold text-lg text-white truncate pr-2">{player.name}</h2>
                  <div className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap">
                    {player.totalPreds} TAHMİN
                  </div>
                </div>
                
                <div className="mb-3 shrink-0">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Oyun Karakteri</div>
                  <div className={`font-black uppercase text-sm ${player.styleColor}`}>
                    {player.style}
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Skor Analizi ve İsabet Oranı</div>
                  
                  <div className="overflow-y-auto space-y-1.5 pr-1 pb-2 custom-scrollbar">
                    {player.allScores.map((scoreInfo, i) => {
                      const scoreLabel = scoreInfo[0];
                      const playedCount = scoreInfo[1].played;
                      const hitCount = scoreInfo[1].hit;
                      const hitRate = Math.round((hitCount / playedCount) * 100);

                      return (
                        <div key={i} className="flex items-center justify-between text-[11px] sm:text-xs bg-slate-800/40 p-2 rounded border border-slate-700/30">
                          
                          <div className="flex items-center w-1/4">
                            <span className="bg-[#0a0f1c] text-amber-400 border border-amber-900/50 font-black px-2 py-0.5 rounded text-center w-full shadow-sm">
                              {scoreLabel}
                            </span>
                          </div>
                          
                          <div className="w-2/4 text-center text-slate-400 text-[10px]">
                            Oynadı: <span className="font-bold text-white text-[11px]">{playedCount}</span> 
                            <span className="mx-1">|</span>
                            Bildikleri: <span className="font-bold text-emerald-400 text-[11px]">{hitCount}</span>
                          </div>
                          
                          <div className="w-1/4 text-right">
                            <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${hitRate > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-500'}`}>
                              % {hitRate}
                            </span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}