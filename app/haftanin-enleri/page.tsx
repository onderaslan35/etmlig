'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function HaftaninEnleriPortal() {
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  
  const [bonuses, setBonuses] = useState({ puanLiderleri: [] as string[], skorKrallari: [] as string[] });
  const [standings, setStandings] = useState({
    MASTER: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  // 1. AŞAMA: Admin panelindeki gibi 6. haftadan itibaren mevcut en yüksek bültene kadar menüyü doldur
  useEffect(() => {
    const fetchWeeks = async () => {
      const { data, error } = await supabase
        .from('matches_bulletin')
        .select('week_num')
        .gte('week_num', 6)
        .order('week_num', { ascending: false })
        .limit(1);

      let maxWeek = 35; // Sistemde bülten bulunamazsa varsayılan
      if (data && data.length > 0) {
          maxWeek = data[0].week_num;
      }
      
      const weeksArray = [];
      for (let i = maxWeek; i >= 6; i--) {
          weeksArray.push(i);
      }
      
      setAvailableWeeks(weeksArray);
      if (weeksArray.length > 0) {
        setSelectedWeek(weeksArray[0]); // Sayfa açılınca en son haftayı otomatik seç
      } else {
        setIsLoading(false);
      }
    };
    fetchWeeks();
  }, []);

  // 2. AŞAMA: Seçili Haftanın Fişlerini Çek ve SADECE MASTER İSTATİSTİĞİNİ Hesapla
  useEffect(() => {
    if (!selectedWeek) return;
    
    const fetchWeekData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('hafta', selectedWeek);

      if (data) {
        const tempBonuses = { puanLiderleri: [] as string[], skorKrallari: [] as string[] };
        const tempStats: any = { MASTER: {} };

        data.forEach(row => {
            // Şeref Kürsüsü (Bonuslar) Ayıklaması
            if (row.ev_sahibi === 'HAFTANIN') {
                if (!tempBonuses.puanLiderleri.includes(row.user_name)) tempBonuses.puanLiderleri.push(row.user_name);
                return;
            }
            if (row.ev_sahibi === 'SKOR') {
                if (!tempBonuses.skorKrallari.includes(row.user_name)) tempBonuses.skorKrallari.push(row.user_name);
                return;
            }

            // SADECE MASTER KATEGORİSİ - DFO VE TFF İPTAL EDİLDİ
            if (row.kategori === 'MASTER') {
                if (!tempStats.MASTER[row.user_name]) {
                    tempStats.MASTER[row.user_name] = { user_name: row.user_name, points: 0, scores: 0 };
                }
                tempStats.MASTER[row.user_name].points += row.puan;
                // Her bir fiş satırı 1 Tam İsabet skor demektir
                tempStats.MASTER[row.user_name].scores += 1; 
            }
        });

        // Puanları büyükten küçüğe, eşitse isabet sayısına göre sırala
        const sortedStandings = {
            MASTER: Object.values(tempStats.MASTER).sort((a: any, b: any) => b.points - a.points || b.scores - a.scores)
        };

        setBonuses(tempBonuses);
        setStandings(sortedStandings);
      }
      setIsLoading(false);
    };

    fetchWeekData();
  }, [selectedWeek]);

  // Altın, Gümüş, Bronz ve Standart Kart Tasarımı Motoru
  const renderTable = (title: string, data: any[], themeClasses: string, icon: string) => (
    <div className={`bg-slate-900/80 border ${themeClasses} rounded-2xl overflow-hidden shadow-xl flex flex-col backdrop-blur-md w-full`}>
        <div className={`p-4 border-b ${themeClasses} flex items-center justify-center gap-2 bg-black/30`}>
            <span className="text-2xl drop-shadow-md">{icon}</span>
            <h3 className="font-black text-sm tracking-widest uppercase">{title}</h3>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3 max-h-[650px] overflow-y-auto custom-scrollbar">
            {data.length === 0 && <div className="text-center text-slate-500 text-xs py-10 font-bold uppercase tracking-widest">Bu hafta için arşivde henüz fiş bulunmuyor.<br/>Admin panelinden 'Geçmişi Onar' butonunu kullanın.</div>}
            {data.map((user, idx) => {
                let rowBg = "bg-slate-950";
                let textCol = "text-slate-300";
                let badgeCol = "bg-slate-800 text-slate-400";
                let borderCol = "border-slate-800/50";

                if (idx === 0) { // ŞAMPİYON
                    rowBg = "bg-amber-950/40";
                    textCol = "text-amber-400";
                    badgeCol = "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.6)]";
                    borderCol = "border-amber-500/40";
                } else if (idx === 1) { // İKİNCİ
                    rowBg = "bg-slate-800/40";
                    textCol = "text-slate-200";
                    badgeCol = "bg-slate-300 text-black shadow-[0_0_10px_rgba(203,213,225,0.6)]";
                    borderCol = "border-slate-400/40";
                } else if (idx === 2) { // ÜÇÜNCÜ
                    rowBg = "bg-orange-950/40";
                    textCol = "text-orange-400";
                    badgeCol = "bg-orange-600 text-white shadow-[0_0_10px_rgba(234,88,12,0.6)]";
                    borderCol = "border-orange-600/40";
                }

                return (
                    <div key={idx} className={`${rowBg} border ${borderCol} rounded-xl p-4 flex items-center justify-between transition-all hover:bg-slate-800/80 hover:scale-[1.02] group shadow-inner`}>
                        <div className="flex items-center gap-4 sm:gap-6">
                            <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-base sm:text-lg ${badgeCol}`}>
                                {idx + 1}
                            </span>
                            <span className={`font-black text-sm sm:text-base uppercase tracking-wider ${textCol} group-hover:text-white transition-colors truncate max-w-[160px] sm:max-w-[300px]`}>
                                {user.user_name}
                            </span>
                        </div>
                        <div className="flex flex-col items-end justify-center">
                            <span className={`font-black text-xl sm:text-2xl leading-none ${textCol}`}>
                                {user.points} <span className="text-[10px] sm:text-xs opacity-70 tracking-widest uppercase">Puan</span>
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 bg-black/30 px-3 py-1 rounded-lg">
                                {user.scores} TAM İSABET
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans pb-24 relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* TEPEDEKİ BAŞLIK VE HAFTA SEÇİCİ */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] mb-3 text-center">
            🏆 ZAMAN MAKİNESİ
          </h1>
          <p className="text-slate-400 font-bold tracking-widest text-[10px] sm:text-xs text-center mb-6 max-w-2xl px-4">
            KARARGAHTA ARŞİVLENEN GEÇMİŞ HAFTALARIN LİDERLERİ VE MASTER İSTATİSTİKLERİ. (6. Haftadan itibaren kayıtlar aktiftir)
          </p>

          <div className="bg-slate-900 border border-slate-700 p-2 sm:p-3 rounded-2xl flex items-center gap-3 sm:gap-4 shadow-2xl backdrop-blur-md">
             <span className="text-2xl animate-pulse drop-shadow-md hidden sm:block">⚙️</span>
             <span className="font-black tracking-widest text-slate-300 text-xs sm:text-sm uppercase">ARŞİVDEN HAFTA SEÇ:</span>
             <select 
               value={selectedWeek || ''} 
               onChange={(e) => setSelectedWeek(Number(e.target.value))}
               disabled={isLoading || availableWeeks.length === 0}
               className="bg-amber-500 text-slate-950 font-black text-sm sm:text-base px-4 py-2 rounded-xl outline-none cursor-pointer border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50"
             >
                {availableWeeks.length === 0 && <option value="">KAYIT YOK</option>}
                {availableWeeks.map(w => (
                   <option key={w} value={w}>{w}. HAFTA RAPORU</option>
                ))}
             </select>
          </div>
        </div>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                <span className="text-amber-500 font-black tracking-widest uppercase text-sm animate-pulse">Arşiv Taraniyor...</span>
            </div>
        ) : !selectedWeek ? (
            <div className="w-full py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl shadow-inner">
                <span className="text-6xl mb-4 block opacity-50">📂</span>
                <h2 className="text-xl font-bold mb-2 tracking-widest uppercase text-slate-400">GÖSTERİLECEK GEÇMİŞ HAFTA VERİSİ BULUNAMADI</h2>
            </div>
        ) : (
            <div className="animate-fade-in space-y-8 sm:space-y-12">
                
                {/* 🏆 ŞEREF KÜRSÜSÜ (BONUSLAR) 🏆 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PUAN LIDERI */}
                    <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-center transform transition-transform hover:-translate-y-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
                        <span className="text-5xl sm:text-6xl mb-4 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">🔥</span>
                        <h3 className="text-emerald-400 font-black tracking-widest text-xs sm:text-sm uppercase mb-2">HAFTANIN PUAN LİDERİ</h3>
                        <span className="text-white font-black text-xl sm:text-2xl text-center uppercase tracking-wide drop-shadow-md z-10">
                            {bonuses.puanLiderleri.length > 0 ? bonuses.puanLiderleri.join(' & ') : '---'}
                        </span>
                        {bonuses.puanLiderleri.length > 0 && <span className="mt-3 bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">+3 Bonus Aldı</span>}
                    </div>

                    {/* SKOR KRALI */}
                    <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center transform transition-transform hover:-translate-y-1 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors"></div>
                        <span className="text-5xl sm:text-6xl mb-4 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">⚽</span>
                        <h3 className="text-amber-400 font-black tracking-widest text-xs sm:text-sm uppercase mb-2">HAFTANIN SKOR KRALI</h3>
                        <span className="text-white font-black text-xl sm:text-2xl text-center uppercase tracking-wide drop-shadow-md z-10">
                            {bonuses.skorKrallari.length > 0 ? bonuses.skorKrallari.join(' & ') : '---'}
                        </span>
                        {bonuses.skorKrallari.length > 0 && <span className="mt-3 bg-amber-950/80 border border-amber-700/50 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">+3 Bonus Aldı</span>}
                    </div>
                </div>

                {/* 📊 SADECE MASTER LİGİ TABLOSU 📊 */}
                <div className="max-w-4xl mx-auto">
                    {renderTable("👑 MASTER LİGİ (PUAN VE İSABET KÜRSÜSÜ)", standings.MASTER, "border-amber-500/40 text-amber-500", "👑")}
                </div>

            </div>
        )}

      </div>
    </div>
  );
}