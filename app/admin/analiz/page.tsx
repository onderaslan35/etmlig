'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface PlayerStat {
  username: string;
  name: string;
  totalPreds: number;
  topScores: [string, number][]; // [Skor, Kaç Kere Oynadı]
  style: string;
  styleColor: string;
}

export default function ScoutRadarPage() {
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnaliz = async () => {
      try {
        setLoading(true);
        
        // 1. Oyuncuları Çek
        const { data: playersData } = await supabase.from('players').select('username, name');
        
        // 2. TAHMİNLERİ KAZIYAN SÜPÜRGE DÖNGÜSÜ (6. Haftadan İtibaren Sınır Tanımadan Çeker)
        let allPreds: any[] = [];
        let fetchMore = true;
        let from = 0;
        const step = 1000;

        while (fetchMore) {
            const { data: pDataChunk, error } = await supabase
                .from('player_predictions')
                .select('user_id, predicted_score, week_num')
                .gte('week_num', 6) // 🔴 KOMUTANIN EMRİ: Sadece 6. hafta ve sonrasını al!
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

        if (playersData && allPreds) {
          const rawStats: PlayerStat[] = playersData.map(player => {
            const userPreds = allPreds.filter(p => String(p.user_id) === String(player.username));
            const totalPreds = userPreds.length;

            // Skorları say
            const scoreCounts: Record<string, number> = {};
            userPreds.forEach(p => {
              const s = p.predicted_score.replace(/\s+/g, '');
              if (s && s !== '-' && s !== '') {
                scoreCounts[s] = (scoreCounts[s] || 0) + 1;
              }
            });

            // En çok oynanan skorları sırala
            const sortedScores = Object.entries(scoreCounts).sort((a, b) => b[1] - a[1]);
            const top3 = sortedScores.slice(0, 3);

            // Oyuncu Karakteri Analizi
            let style = "Bilinmiyor / Karışık";
            let styleColor = "text-slate-400";

            if (top3.length > 0) {
              const favScore = top3[0][0];
              const favCount = top3[0][1];
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
              topScores: top3,
              style,
              styleColor
            };
          });

          // Hiç tahmini olmayanları filtrele ve en çok tahmin yapandan aza doğru sırala
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-500 uppercase tracking-wider">
              🕵️‍♂️ KOZMİK ODA: SCOUT RADARI
            </h1>
            <p className="text-sm text-slate-400 mt-1">Sadece Başkomutana Özel Yarışmacı Zihin Haritası (6. Hafta ve Sonrası)</p>
          </div>
          <input
            type="text"
            placeholder="Yarışmacı Ara..."
            className="bg-[#0f172a] border border-slate-700 text-white px-4 py-2 rounded-lg outline-none focus:border-amber-500 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center text-amber-500 animate-pulse font-bold mt-20">📡 Tüm Arşiv Taranıyor, On Binlerce Veri Çekiliyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStats.map((player, idx) => (
              <div key={idx} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-amber-500/50 transition-colors shadow-lg">
                <div className="flex justify-between items-start mb-3 border-b border-slate-700/50 pb-3">
                  <h2 className="font-bold text-lg text-white truncate pr-2">{player.name}</h2>
                  <div className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap">
                    {player.totalPreds} TAHMİN
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Oyun Karakteri</div>
                  <div className={`font-black uppercase text-sm ${player.styleColor}`}>
                    {player.style}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Favori Skor Kombinasyonları</div>
                  <div className="space-y-2">
                    {player.topScores.map((scoreInfo, i) => {
                      const percentage = Math.round((scoreInfo[1] / player.totalPreds) * 100);
                      return (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded text-xs w-10 text-center">
                              {scoreInfo[0]}
                            </span>
                            <span className="text-slate-300 text-xs">({scoreInfo[1]} kez)</span>
                          </div>
                          <div className="text-emerald-400 font-bold text-xs">% {percentage}</div>
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