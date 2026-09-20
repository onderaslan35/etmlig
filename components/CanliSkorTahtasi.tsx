"use client";
import React, { useEffect, useState } from 'react';

export default function CanliSkorTahtasi({ macIdleri }: { macIdleri: string }) {
  const [maclar, setMaclar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const skorlariCek = async () => {
      try {
        // Vercel'deki 3 namlulu motorumuza atış yapıyoruz
        const res = await fetch(`/api/canli-skor?ids=${macIdleri}`);
        const data = await res.json();
        
        if (data.response) {
          setMaclar(data.response);
        }
      } catch (error) {
        console.error("Karargaha veri akışı koptu:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    skorlariCek(); // İlk atış
    // 2 dakikada (120.000 ms) bir Karatahtaya bakar, API mermisi harcamaz!
    const interval = setInterval(skorlariCek, 120000); 
    
    return () => clearInterval(interval);
  }, [macIdleri]);

  if (yukleniyor) {
    return <div className="text-emerald-400 font-bold animate-pulse text-center p-4">Radar Taranıyor... 📡</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto p-4 font-sans">
      {maclar.map((mac) => {
        const evSahibi = mac.teams.home.name;
        const deplasman = mac.teams.away.name;
        const evLogo = mac.teams.home.logo;
        const depLogo = mac.teams.away.logo;
        const evSkor = mac.goals.home ?? 0;
        const depSkor = mac.goals.away ?? 0;
        const dakika = mac.fixture.status.elapsed;
        const durum = mac.fixture.status.short; // FT, 1H, 2H, HT vb.

        // Paketten sadece Golleri ve Kırmızı Kartları cımbızla çekiyoruz
        const goller = mac.events.filter((e: any) => e.type === "Goal");
        const kirmiziKartlar = mac.events.filter((e: any) => e.type === "Card" && e.detail === "Red Card");

        return (
          <div key={mac.fixture.id} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 shadow-xl flex flex-col">
            
            {/* ÜST BÖLÜM: DAKİKA VE DURUM */}
            <div className="flex justify-center items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest ${
                durum === 'FT' ? 'bg-slate-700 text-slate-300' : 
                ['1H','2H','HT','ET','P'].includes(durum) ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50 animate-pulse' : 
                'bg-slate-800 text-slate-400'
              }`}>
                {['1H','2H','HT','ET','P'].includes(durum) ? `${dakika}' CANLI` : durum === 'FT' ? 'MAÇ SONUCU' : 'BAŞLAMADI'}
              </span>
            </div>

            {/* ORTA BÖLÜM: SKORBORD */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-end gap-3 text-right">
                <span className="text-white font-bold text-lg sm:text-xl">{evSahibi}</span>
                <img src={evLogo} alt={evSahibi} className="w-12 h-12 object-contain" />
              </div>

              <div className="flex items-center justify-center bg-slate-950 px-6 py-3 rounded-xl border border-slate-800">
                <span className="text-3xl font-black text-emerald-400">{evSkor}</span>
                <span className="text-slate-500 mx-2 text-xl">-</span>
                <span className="text-3xl font-black text-emerald-400">{depSkor}</span>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row items-center justify-start gap-3 text-left">
                <img src={depLogo} alt={deplasman} className="w-12 h-12 object-contain" />
                <span className="text-white font-bold text-lg sm:text-xl">{deplasman}</span>
              </div>
            </div>

            {/* ALT BÖLÜM: OLAYLAR (Goller & Kartlar) */}
            {(goller.length > 0 || kirmiziKartlar.length > 0) && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between text-xs text-slate-400">
                {/* Ev Sahibi Olayları */}
                <div className="flex-1 flex flex-col gap-1 items-end pr-4 sm:border-r border-slate-800">
                  {goller.filter((g: any) => g.team.id === mac.teams.home.id).map((g: any, i: number) => (
                    <span key={i}>⚽ {g.player.name} ({g.time.elapsed}')</span>
                  ))}
                  {kirmiziKartlar.filter((k: any) => k.team.id === mac.teams.home.id).map((k: any, i: number) => (
                    <span key={i} className="text-rose-500">🟥 {k.player.name} ({k.time.elapsed}')</span>
                  ))}
                </div>
                {/* Deplasman Olayları */}
                <div className="flex-1 flex flex-col gap-1 items-start pl-4 mt-2 sm:mt-0">
                  {goller.filter((g: any) => g.team.id === mac.teams.away.id).map((g: any, i: number) => (
                    <span key={i}>⚽ {g.player.name} ({g.time.elapsed}')</span>
                  ))}
                  {kirmiziKartlar.filter((k: any) => k.team.id === mac.teams.away.id).map((k: any, i: number) => (
                    <span key={i} className="text-rose-500">🟥 {k.player.name} ({k.time.elapsed}')</span>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        );
      })}
    </div>
  );
}