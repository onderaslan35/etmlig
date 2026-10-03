'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface PlayerScoreStat {
  played: number;
  hit: number;
}

interface PlayerStats {
  username: string;
  name: string;
  totalPlayed: number;
  totalHits: number;
  scores: Record<string, PlayerScoreStat>;
}

export default function RekortmenlerPage() {
  const [loading, setLoading] = useState(true);
  const [overallBest, setOverallBest] = useState<any>(null);
  const [mostActive, setMostActive] = useState<any>(null);
  const [scoreLeaders, setScoreLeaders] = useState<any[]>([]);

  useEffect(() => {
    const fetchRekorlar = async () => {
      try {
        setLoading(true);
        
        // 1. Oyuncuları Çek
        const { data: playersData } = await supabase.from('players').select('username, name');
        
        // 2. Tahminleri Süpür
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
            } else { fetchMore = false; }
        }

        // 3. Gerçek Maçları Süpür
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
            } else { fetchMoreMatches = false; }
        }

        const actualScoresMap: Record<number, string> = {};
        allMatches.forEach(m => {
            if (m.home_score && m.home_score !== '-' && m.away_score && m.away_score !== '-') {
                if (['FINISHED', 'FT', 'WAITING_APPROVAL'].includes(m.status)) {
                    actualScoresMap[m.id] = `${m.home_score}-${m.away_score}`.replace(/\s+/g, '');
                }
            }
        });

        // 4. Verileri Harmanla
        if (playersData && allPreds) {
          const playersMap: Record<string, PlayerStats> = {};
          playersData.forEach(p => {
              playersMap[p.username] = { username: p.username, name: p.name, totalPlayed: 0, totalHits: 0, scores: {} };
          });

          const globalScoreCounts: Record<string, number> = {};

          allPreds.forEach(p => {
            const userId = String(p.user_id);
            const predicted = p.predicted_score ? p.predicted_score.replace(/\s+/g, '') : '';
            
            if (predicted && predicted !== '-' && playersMap[userId]) {
                const player = playersMap[userId];
                player.totalPlayed += 1;
                
                // 🔥 BURASI ZIRHLANDI: Eğer skor objede yoksa, önce oluşturuyoruz!
                if (!player.scores[predicted]) {
                    player.scores[predicted] = { played: 0, hit: 0 };
                }
                player.scores[predicted].played += 1;
                
                globalScoreCounts[predicted] = (globalScoreCounts[predicted] || 0) + 1;

                const matchId = (p.week_num * 100) + p.match_index;
                const actualScore = actualScoresMap[matchId];
                if (actualScore && actualScore === predicted) {
                    player.totalHits += 1;
                    player.scores[predicted].hit += 1;
                }
            }
          });

          const validPlayers = Object.values(playersMap).filter(p => p.totalPlayed > 0);

          let bestOverallPlayer: any = null;
          let bestOverallRate = 0;
          let mostActivePlayer: any = null;

          validPlayers.forEach(p => {
              if (!mostActivePlayer || p.totalPlayed > mostActivePlayer.totalPlayed) {
                  mostActivePlayer = p;
              }
              if (p.totalPlayed >= 50) {
                  const rate = (p.totalHits / p.totalPlayed) * 100;
                  if (rate > bestOverallRate) {
                      bestOverallRate = rate;
                      bestOverallPlayer = { ...p, rate };
                  }
              }
          });
          
          setOverallBest(bestOverallPlayer);
          setMostActive(mostActivePlayer);

          const top6Scores = Object.entries(globalScoreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(s => s[0]);

          const sLeaders: any[] = [];

          top6Scores.forEach(scoreLabel => {
              let mostPlayedUser: any = null;
              let mostPlayedCount = 0;
              
              let mostAccurateUser: any = null;
              let mostAccurateRate = 0;
              let mostAccurateHit = 0;

              validPlayers.forEach(p => {
                  const sData = p.scores[scoreLabel];
                  if (sData) {
                      if (sData.played > mostPlayedCount) {
                          mostPlayedCount = sData.played;
                          mostPlayedUser = p;
                      }
                      
                      if (sData.played >= 5) {
                          const rate = (sData.hit / sData.played) * 100;
                          if (rate > mostAccurateRate) {
                              mostAccurateRate = rate;
                              mostAccurateUser = p;
                              mostAccurateHit = sData.hit;
                          }
                      }
                  }
              });

              // 🔥 BURASI ZIRHLANDI: mostAccurateUser null (boş) gelme ihtimaline karşı '?.' ve '||' kullanıldı.
              sLeaders.push({
                  score: scoreLabel,
                  addict: { name: mostPlayedUser?.name || '-', count: mostPlayedCount },
                  master: { 
                      name: mostAccurateUser?.name || 'Yeterli Veri Yok', 
                      rate: Math.round(mostAccurateRate), 
                      hit: mostAccurateHit,
                      played: mostAccurateUser?.scores[scoreLabel]?.played || 0
                  }
              });
          });

          setScoreLeaders(sLeaders);
        }
      } catch (error) {
        console.error("Rekorlar çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRekorlar();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#0a0f1c] text-slate-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-emerald-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            🎖️ KARARGAH REKORTMENLERİ
          </h1>
          <p className="text-slate-400 mt-2 font-bold tracking-wide">Bordo Bereliler ve Özel Kuvvetler İstatistikleri</p>
        </div>

        {loading ? (
          <div className="text-center text-emerald-500 animate-pulse font-bold mt-20 text-xl">📡 Bütün Ordu Taranıyor, Keskin Nişancılar Tespit Ediliyor...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🎯</div>
                    <div className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-1">Karargahın En Keskin Nişancısı</div>
                    <div className="text-slate-400 text-[10px] mb-4">Genel isabet oranı en yüksek yarışmacı (Min. 50 Tahmin)</div>
                    
                    <div className="text-2xl sm:text-3xl font-black text-white mb-2">{overallBest?.name || 'Hesaplanıyor...'}</div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="bg-[#0a0f1c] px-4 py-2 rounded-lg border border-emerald-500/50">
                            <div className="text-emerald-400 font-black text-xl">% {Math.round(overallBest?.rate || 0)}</div>
                            <div className="text-slate-500 text-[9px] uppercase font-bold">İsabet Oranı</div>
                        </div>
                        <div className="text-slate-400 text-xs font-semibold">
                            {overallBest?.totalPlayed || 0} atışın <span className="text-white font-bold">{overallBest?.totalHits || 0}</span> tanesini tam 12'den vurdu!
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-amber-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🔥</div>
                    <div className="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">Karargahın Makineli Tüfeği</div>
                    <div className="text-slate-400 text-[10px] mb-4">Sisteme en çok tahmin giren sadık savaşçı</div>
                    
                    <div className="text-2xl sm:text-3xl font-black text-white mb-2">{mostActive?.name || 'Hesaplanıyor...'}</div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="bg-[#0a0f1c] px-4 py-2 rounded-lg border border-amber-500/50">
                            <div className="text-amber-400 font-black text-xl">{mostActive?.totalPlayed || 0}</div>
                            <div className="text-slate-500 text-[9px] uppercase font-bold">Toplam Atış</div>
                        </div>
                        <div className="text-slate-400 text-xs font-semibold">
                            Oynadığı maçlardan <span className="text-white font-bold">{mostActive?.totalHits || 0}</span> tanesinde isabet sağladı.
                        </div>
                    </div>
                </div>

            </div>

            <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest mb-6 border-b border-slate-700/50 pb-2">
                📌 SKORLARA GÖRE KİMLİK KARTLARI (En Popüler 6 Skor)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {scoreLeaders.map((leader, idx) => (
                    <div key={idx} className="bg-[#0f172a] border border-slate-700 rounded-xl p-5 shadow-lg relative">
                        
                        <div className="absolute -top-3 -right-3 bg-[#0a0f1c] border-2 border-emerald-500 text-emerald-400 font-black text-xl px-3 py-1 rounded-lg transform rotate-3 shadow-xl">
                            {leader.score}
                        </div>

                        <div className="mt-2 mb-5">
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Bu Skorun Bağımlısı (En Çok Oynayan)</div>
                            <div className="text-white font-bold text-sm bg-slate-800/50 px-3 py-2 rounded border border-slate-700/50 flex justify-between items-center">
                                <span className="truncate pr-2">{leader.addict.name}</span>
                                <span className="text-amber-500 font-black text-xs shrink-0">{leader.addict.count} Kere</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Bu Skorun Ustası (En İyi Bilen)</div>
                            <div className="text-white font-bold text-sm bg-emerald-900/20 px-3 py-2 rounded border border-emerald-800/50">
                                <div className="truncate mb-1">{leader.master.name}</div>
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-400 text-[10px] font-semibold">{leader.master.played} atışta {leader.master.hit} isabet</span>
                                    <span className="text-emerald-400 font-black text-lg">% {leader.master.rate}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}